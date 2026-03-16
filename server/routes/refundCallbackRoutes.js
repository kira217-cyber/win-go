import express from "express";
import User from "../models/Users.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      account_id,
      username: rawUsername,
      provider_code,
      amount,
      game_code,
      verification_key,
      bet_type,
      transaction_id,
      times,
      status,
      reason,
    } = req.body;

    console.log("Refund callback received:", req.body);

    // Required fields check
    if (!rawUsername || !provider_code || amount === undefined || !game_code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Clean username (শেষে 45 থাকলে remove)
    let cleanUsername = String(rawUsername).trim();
    if (cleanUsername.endsWith("45")) {
      cleanUsername = cleanUsername.slice(0, -2);
    }

    const player = await User.findOne({ username: cleanUsername });

    if (!player) {
      console.log("User not found:", cleanUsername);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const amountFloat = parseFloat(amount);

    if (isNaN(amountFloat) || amountFloat < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Refund → balance add
    const balanceChange = amountFloat;
    const newBalance = (player.balance || 0) + balanceChange;

    // Refund history record
    const refundRecord = {
      provider_code,
      game_code,
      bet_type: bet_type || "REFUND",
      amount: amountFloat,
      transaction_id: transaction_id || null,
      verification_key: verification_key || null,
      times: times || null,
      status: status || "refund",
      win_amount: amountFloat,
      balance_after: newBalance,
      bet_details: {
        account_id: account_id || null,
        reason: reason || null,
        callback_type: "refund",
      },
    };

    await User.findByIdAndUpdate(player._id, {
      $set: { balance: newBalance },
      $push: { gameHistory: refundRecord },
    });

    return res.json({
      success: true,
      message: "Refund processed successfully",
      data: {
        username: player.username,
        new_balance: newBalance,
        refund_amount: amountFloat,
        transaction_id: transaction_id || null,
      },
    });
  } catch (err) {
    console.error("Refund callback error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;