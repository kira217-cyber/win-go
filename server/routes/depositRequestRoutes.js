// routes/depositRequest.route.js
import express from "express";
import mongoose from "mongoose";
import DepositRequest from "../models/DepositRequest.js";
import DepositMethod from "../models/DepositMethod.js";
import User from "../models/Users.js";
import DepositTurnover from "../models/DepositTurnover.js";

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

router.get('/pending/count', async (req, res) => {
  try {
    const pendingCount = await DepositRequest.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      pendingDepositRequests: pendingCount,
      message: 'Pending deposit requests count fetched successfully',
    });
  } catch (error) {
    console.error('Error counting pending deposit requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while counting pending deposit requests',
      error: error.message,
    });
  }
});

// সফল (approved) সব ডিপোজিট রিকোয়েস্টের মোট পরিমাণ রিটার্ন করবে
router.get('/total-approved-balance', async (req, res) => {
  try {
    const totalApproved = await DepositRequest.aggregate([
      {
        $match: { status: 'approved' },
      },
      {
        $group: {
          _id: null,
          totalDepositBalance: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalDepositBalance: 1,
        },
      },
    ]);

    const result = totalApproved[0] || { totalDepositBalance: 0 };

    res.status(200).json({
      success: true,
      totalDepositBalance: result.totalDepositBalance,
      message: 'Total approved deposit balance fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching total approved deposit balance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating total deposit balance',
      error: error.message,
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

router.get("/deposit-history/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Basic ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const deposits = await DepositRequest.find({ user: userId })
      .populate({
        path: "method",
        select: "methodName image accountNumber", // adjust fields as needed
      })
      .sort({ createdAt: -1 }) // newest first
      .lean();

    res.json({
      success: true,
      count: deposits.length,
      data: deposits,
    });
  } catch (err) {
    console.error("Deposit history error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// PUT /:id/approve – ফাইনাল ভার্সন (তোমার চাহিদা অনুযায়ী)
router.put("/:id/approve", async (req, res) => {
  try {
    const { note } = req.body;

    const deposit = await DepositRequest.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ success: false, message: "Deposit request not found" });
    }

    if (deposit.status !== "pending") {
      return res.status(400).json({ success: false, message: `Already ${deposit.status}` });
    }

    const user = await User.findById(deposit.user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // মূল যোগ করার অ্যামাউন্ট (ব্যালেন্সে যাবে)
    const totalToAdd = deposit.amount + deposit.bonusAmount;

    // Turnover হিসাব – বোনাস সহ
    const totalBaseAmount = deposit.amount + deposit.bonusAmount; // 200 + 10 = 210

    // multiplier নেওয়া (DepositMethod থেকে সরাসরি নেওয়া ভালো, কিন্তু এখন deposit থেকে)
    const method = await DepositMethod.findById(deposit.method);
    if (!method) {
      return res.status(404).json({ success: false, message: "Deposit method not found" });
    }

    const turnoverMultiplier = method.turnoverMultiplier || 1;

    const requiredTurnover = totalBaseAmount * turnoverMultiplier; // 210 * 2 = 420

    // Turnover entry
    const turnoverEntry = new DepositTurnover({
      user: deposit.user,
      depositRequest: deposit._id,
      depositAmount: deposit.amount,
      bonusAmount: deposit.bonusAmount,
      totalBaseAmount: totalBaseAmount,
      turnoverMultiplier: turnoverMultiplier,
      requiredTurnover: requiredTurnover,          // এখন সঠিক 420
      completedTurnover: 0,
      remainingTurnover: requiredTurnover,
      status: 'active',
      activatedAt: new Date(),
    });

    // Atomic updates
    await Promise.all([
      user.updateOne({ $inc: { balance: totalToAdd } }),
      deposit.updateOne({
        $set: {
          status: "approved",
          ...(note?.trim() ? { note: note.trim() } : {}),
        },
      }),
      turnoverEntry.save(),
    ]);

    res.json({
      success: true,
      message: "Deposit approved successfully. Balance and turnover updated.",
      data: {
        deposit: await DepositRequest.findById(deposit._id),
        userBalance: (user.balance || 0) + totalToAdd,
        turnoverEntry,
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