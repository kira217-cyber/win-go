// routes/depositRequest.route.js
import express from "express";
import mongoose from "mongoose";
import DepositRequest from "../models/DepositRequest.js";
import DepositMethod from "../models/DepositMethod.js";
import User from "../models/Users.js";

const router = express.Router();

// ────────────────────────────────────────────────
// POST /api/deposit-requests
router.post("/", async (req, res) => {
  try {
    const { methodId, methodType, amount, transactionId, userId } = req.body;

    // Required checks
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required. Please log in.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    if (!methodId || !amount || !transactionId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Method ID, amount, and transaction ID are required",
      });
    }

    if (isNaN(amount) || Number(amount) < 100) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid number and at least 100 BDT",
      });
    }

    const method = await DepositMethod.findById(methodId);
    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found",
      });
    }

    // Calculate bonus & turnover
    const bonusAmount = (Number(amount) * method.bonusPercentage) / 100;
    const turnoverAdded = Number(amount) * method.turnoverMultiplier;

    const newRequest = new DepositRequest({
      user: userId,
      method: methodId,
      methodType: methodType || null,
      amount: Number(amount),
      transactionId: transactionId.trim(),
      bonusAmount,
      turnoverTargetAdded: turnoverAdded,
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Deposit request submitted successfully! Waiting for admin approval.",
      data: newRequest,
    });
  } catch (err) {
    console.error("POST deposit request error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error while creating deposit request",
    });
  }
});

// ────────────────────────────────────────────────
router.get("/my-history", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required in query parameters",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format",
      });
    }

    const history = await DepositRequest.find({ user: userId })
      .populate("method", "methodName image accountNumber")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    console.error("GET user deposit history error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching history",
    });
  }
});

// GET /api/deposit-requests
// Admin: Get all deposit requests with filters
router.get("/", async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = {};

    // Status filter: pending, approved, rejected, all
    if (status && status !== "all") {
      filter.status = status;
    }

    // Search by phone number or user name
    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { "user.phone": searchRegex },
        { "user.firstName": searchRegex },
        { "user.lastName": searchRegex },
        { transactionId: searchRegex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await DepositRequest.find(filter)
      .populate({
        path: "user",
        select: "firstName lastName phone",
      })
      .populate({
        path: "method",
        select: "methodName image accountNumber",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await DepositRequest.countDocuments(filter);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("GET deposit requests error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// PUT /api/deposit-requests/:id/approve
// routes/depositRequest.route.js (only the approve part updated — rest same)
router.put("/:id/approve", async (req, res) => {
  try {
    const { note } = req.body;

    // Find deposit request
    const request = await DepositRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Deposit request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This request is already ${request.status}`,
      });
    }

    // Find user
    const user = await User.findById(request.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate total to add (principal + bonus)
    const totalToAdd = request.amount + request.bonusAmount;

    // Update balance
    user.balance = (user.balance || 0) + totalToAdd;

    // Add turnover requirement (from deposit method multiplier)
    user.turnoverTarget = (user.turnoverTarget || 0) + request.turnoverTargetAdded;

    // Optional note
    if (note?.trim()) {
      request.note = note.trim();
    }

    // Update status
    request.status = "approved";

    // Save both
    await user.save();
    await request.save();

    // Send response with updated info
    res.json({
      success: true,
      message: "Deposit approved successfully. Balance and turnover updated.",
      data: {
        request,
        user: {
          balance: user.balance,
          turnoverTarget: user.turnoverTarget,
          turnoverCompleted: user.turnoverCompleted,
          remainingTurnover: Math.max(0, user.turnoverTarget - user.turnoverCompleted),
        },
      },
    });
  } catch (err) {
    console.error("Approve deposit error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during approval",
      error: err.message,
    });
  }
});

// Admin reject with required reason
router.put("/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const request = await DepositRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${request.status}`,
      });
    }

    request.status = "rejected";
    request.rejectReason = reason.trim();

    await request.save();

    res.json({
      success: true,
      message: "Request rejected successfully",
      data: request,
    });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});





export default router;