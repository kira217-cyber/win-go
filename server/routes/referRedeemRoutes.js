// routes/referRedeemRoutes.js
import express from "express";
import ReferRedeemSetting from "../models/ReferRedeemSetting.js";
import User from "../models/Users.js";

const router = express.Router();

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

// ✅ Get current setting
router.get("/", async (req, res) => {
  try {
    let setting = await ReferRedeemSetting.findOne().sort({ createdAt: 1 });

    if (!setting) {
      setting = await ReferRedeemSetting.create({});
    }

    res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("Get refer redeem setting error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// ✅ Admin update setting + all users referAmount update
router.put("/", async (req, res) => {
  try {
    const {
      referAmountForAllUsers,
      minimumRedeemAmount,
      maximumRedeemAmount,
      redeemPoint,
      redeemMoney,
      isActive,
    } = req.body;

    const payload = {
      referAmountForAllUsers: num(referAmountForAllUsers),
      minimumRedeemAmount: num(minimumRedeemAmount),
      maximumRedeemAmount: num(maximumRedeemAmount),
      redeemPoint: num(redeemPoint),
      redeemMoney: num(redeemMoney),
      isActive: Boolean(isActive),
    };

    if (
      payload.maximumRedeemAmount > 0 &&
      payload.maximumRedeemAmount < payload.minimumRedeemAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Maximum redeem amount must be greater than minimum amount",
      });
    }

    let setting = await ReferRedeemSetting.findOne().sort({ createdAt: 1 });

    if (!setting) {
      setting = await ReferRedeemSetting.create(payload);
    } else {
      setting = await ReferRedeemSetting.findByIdAndUpdate(
        setting._id,
        payload,
        { new: true, runValidators: true },
      );
    }

    // ✅ সব user এর referAmount update হবে
    await User.updateMany(
      { role: "user" },
      {
        $set: {
          referAmount: payload.referAmountForAllUsers,
        },
      },
    );

    res.json({
      success: true,
      message: "Refer and redeem setting updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Update refer redeem setting error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;