// routes/withdraw-requests.js
import express from "express";
import mongoose from 'mongoose';
import User from "../models/Users.js";
import WithdrawRequest from "../models/WithdrawRequest.js";

const router = express.Router();

// ─── USER ──────────────────────────────────────────────
// Submit withdrawal (balance deducted immediately)
router.post("/", async (req, res) => {
  try {
    const { methodId, amount, customFields, userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const remainingTurnover =
      (user.turnoverTarget || 0) - (user.turnoverCompleted || 0);
    if (remainingTurnover > 0) {
      return res.status(400).json({
        success: false,
        message: `Complete ${remainingTurnover} BDT turnover first`,
      });
    }

    const withdrawAmount = Number(amount);
    if (withdrawAmount < 100) {
      return res
        .status(400)
        .json({ success: false, message: "Minimum 100 BDT" });
    }
    if (withdrawAmount > user.balance) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    // Deduct balance immediately
    user.balance -= withdrawAmount;
    await user.save();

    // Generate transactionId here (instead of pre-save hook)
    const transactionId = `WD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const request = new WithdrawRequest({
      user: user._id,
      amount: withdrawAmount,
      method: methodId,
      customFields: customFields || {},
      status: "pending",
      transactionId: transactionId, // ← assigned here
    });

    await request.save();

    res.json({
      success: true,
      message:
        "Withdrawal request submitted. Balance deducted. Waiting for approval.",
      data: {
        requestId: request._id,
        transactionId: request.transactionId,
        newBalance: user.balance,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ─────────────────────────────────────────────
// List all requests (with filters)
router.get("/", async (req, res) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;

    const query = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { "user.phone": { $regex: search, $options: "i" } },
        { transactionId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await WithdrawRequest.find(query)
      .populate("user", "firstName lastName phone")
      .populate("method", "methodName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await WithdrawRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/pending/count', async (req, res) => {
  try {
    const pendingCount = await WithdrawRequest.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      pendingWithdrawRequests: pendingCount,
      message: 'Pending withdraw requests count fetched successfully',
    });
  } catch (error) {
    console.error('Error counting pending withdraw requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while counting pending withdraw requests',
      error: error.message,
    });
  }
});



// GET /api/withdraw-requests/total-approved-balance

router.get('/total-approved-balance', async (req, res) => {
  try {
    const totalApproved = await WithdrawRequest.aggregate([
      {
        $match: { status: 'approved' },
      },
      {
        $group: {
          _id: null,
          totalWithdrawBalance: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalWithdrawBalance: 1,
        },
      },
    ]);

    const result = totalApproved[0] || { totalWithdrawBalance: 0 };

    res.status(200).json({
      success: true,
      totalWithdrawBalance: result.totalWithdrawBalance,
      message: 'Total approved withdraw balance fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching total approved withdraw balance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating total withdraw balance',
      error: error.message,
    });
  }
});

router.get("/withdraw-history/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Optional: basic validation for ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const withdrawals = await WithdrawRequest.find({ user: userId })
      .populate({
        path: "method",
        select: "methodName image", // add more fields if needed
      })
      .sort({ createdAt: -1 }) // newest first
      .lean();

    res.json({
      success: true,
      count: withdrawals.length,
      data: withdrawals,
    });
  } catch (err) {
    console.error("Withdraw history error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// Approve
router.put("/:id/approve", async (req, res) => {
  try {
    const { note } = req.body;

    const request = await WithdrawRequest.findById(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Request already processed" });
    }

    request.status = "approved";
    request.note = note?.trim() || undefined;
    request.approvedAt = new Date();
    await request.save();

    res.json({ success: true, message: "Withdrawal approved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reject + refund balance
router.put("/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await WithdrawRequest.findById(req.params.id);
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Request already processed" });
    }
    if (!reason?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required" });
    }

    // Refund balance
    const user = await User.findById(request.user);
    if (user) {
      user.balance += request.amount;
      await user.save();
    }

    request.status = "rejected";
    request.rejectReason = reason.trim();
    request.rejectedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: "Withdrawal rejected & balance refunded",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
