// routes/ReferRedeemHistoryRoutes.js
import express from "express";
import User from "../models/Users.js";
import ReferRedeemHistory from "../models/ReferRedeemHistory.js";
import ReferRedeemSetting from "../models/ReferRedeemSetting.js";
import DepositTurnover from "../models/DepositTurnover.js";

const router = express.Router();

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getUserId = (req) => {
  return req.query.userId || req.body.userId || req.params.userId;
};

// ✅ GET INFO
router.get("/info", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findById(userId).select(
      "firstName lastName phone balance referCode referralCode referAmount referAmountBalance",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const setting = await ReferRedeemSetting.findOne().sort({ createdAt: 1 });

    const points = num(user.referAmountBalance);
    const redeemPoint = num(setting?.redeemPoint);
    const redeemMoney = num(setting?.redeemMoney);

    const estimatedRedeemAmount =
      redeemPoint > 0 && redeemMoney > 0
        ? (points / redeemPoint) * redeemMoney
        : 0;

    res.json({
      success: true,
      data: {
        user,
        setting,
        calculation: {
          estimatedRedeemAmount,
        },
      },
    });
  } catch (err) {
    console.error("Refer info error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ GET HISTORY
router.get("/histories", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const histories = await ReferRedeemHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: histories,
    });
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ POST REDEEM
router.post("/redeem", async (req, res) => {
  try {
    const userId = getUserId(req);
    const redeemAmount = num(req.body.redeemAmount);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!redeemAmount || redeemAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Redeem amount is required",
      });
    }

    const setting = await ReferRedeemSetting.findOne().sort({ createdAt: 1 });

    if (!setting || !setting.isActive) {
      return res.status(400).json({
        success: false,
        message: "Redeem system is inactive",
      });
    }

    const minAmount = num(setting.minimumRedeemAmount);
    const maxAmount = num(setting.maximumRedeemAmount);

    if (redeemAmount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum redeem amount is ${minAmount}`,
      });
    }

    if (maxAmount > 0 && redeemAmount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum redeem amount is ${maxAmount}`,
      });
    }

    const redeemPoint = num(setting.redeemPoint);
    const redeemMoney = num(setting.redeemMoney);

    if (redeemPoint <= 0 || redeemMoney <= 0) {
      return res.status(400).json({
        success: false,
        message: "Redeem calculation setting is invalid",
      });
    }

    const requiredPoints = (redeemAmount / redeemMoney) * redeemPoint;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const pointsBefore = num(user.referAmountBalance);

    if (pointsBefore < requiredPoints) {
      return res.status(400).json({
        success: false,
        message: "Not enough refer balance",
      });
    }

    const pointsAfter = pointsBefore - requiredPoints;

    user.balance = num(user.balance) + redeemAmount;
    user.referAmountBalance = pointsAfter;

    await user.save();

    const history = await ReferRedeemHistory.create({
      user: userId,
      redeemAmount,
      pointsUsed: requiredPoints,
      pointsBefore,
      pointsAfter,
      status: "success",
    });

    await DepositTurnover.create({
      user: userId,
      sourceType: "refer-redeem",
      referRedeemHistory: history._id,
      depositAmount: redeemAmount,
      bonusAmount: 0,
      totalBaseAmount: redeemAmount,
      turnoverMultiplier: 1,
      requiredTurnover: redeemAmount,
      completedTurnover: 0,
      remainingTurnover: redeemAmount,
      status: "active",
    });

    res.json({
      success: true,
      message: "Redeem successful",
      data: {
        userBalance: user.balance,
        referAmountBalance: user.referAmountBalance,
        history,
      },
    });
  } catch (err) {
    console.error("Redeem error:", err);
    res.status(500).json({
      success: false,
      message: "Redeem failed",
      error: err.message,
    });
  }
});

export default router;
