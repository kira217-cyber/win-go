// routes/callback.js
import express from "express";
import User from "../models/Users.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      account_id,
      username: rawInput,
      provider_code,
      amount,
      game_code,
      verification_key,
      bet_type,
      transaction_id,
      times,
    } = req.body;

    console.log("Callback received:", {
      account_id,
      rawInput,
      provider_code,
      amount,
      bet_type,
      game_code,
      transaction_id,
    });

    // Validation
    if (
      !rawInput ||
      !provider_code ||
      amount === undefined ||
      !game_code ||
      !bet_type
    ) {
      throw new Error("Missing required fields");
    }

    const raw = String(rawInput).trim();

    // Phone lookup candidates
    const candidates = [raw];
    if (raw.length === 12 && raw.startsWith("01")) {
      candidates.push(raw.slice(0, -1));
    }
    if (raw.length === 11 && raw.startsWith("01")) {
      candidates.push("0" + raw);
    }

    console.log("Searching phone variants:", candidates);

    // Find user
    const player = await User.findOne({ phone: { $in: candidates } }).session(
      session,
    );
    if (!player) {
      console.log("User NOT found for variants:", candidates);
      throw new Error("User not found");
    }

    console.log(
      "Player found →",
      player.phone,
      "Balance before:",
      player.balance,
    );

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat < 0) {
      throw new Error("Invalid amount");
    }

    // Prevent duplicate transaction
    if (transaction_id) {
      const existing = await User.findOne({
        "gameHistory.transaction_id": transaction_id,
      }).session(session);

      if (existing) {
        throw new Error("Duplicate transaction ID");
      }
    }

    // Calculate balance change
    let balanceChange = 0;
    if (bet_type === "BET") {
      balanceChange = -amountFloat;
    } else if (bet_type === "SETTLE") {
      balanceChange = +amountFloat;
    } else {
      throw new Error("Invalid bet_type");
    }

    const newBalance = (player.balance || 0) + balanceChange;

    // Turnover logic: ONLY BET increases turnoverCompleted
    let turnoverIncrement = 0;
    if (bet_type === "BET" || bet_type === "SETTLE") {
      turnoverIncrement = Math.abs(amountFloat); // positive bet amount counts
    }

    // Create game history record
    const gameRecord = {
      provider_code,
      game_code,
      bet_type,
      amount: amountFloat,
      transaction_id: transaction_id || null,
      verification_key: verification_key || null,
      times: times || null,
      status: bet_type === "BET" ? "bet" : "settled",
      win_amount: bet_type === "SETTLE" ? amountFloat : 0,
      balance_after: newBalance,
      bet_details: {},
    };

    // Atomic update: balance + turnoverCompleted + gameHistory
    const updateQuery = {
      $set: { balance: newBalance },
      $push: { gameHistory: gameRecord },
    };

    // Only increase turnover if it's a BET
    if (turnoverIncrement > 0) {
      updateQuery.$inc = { turnoverCompleted: turnoverIncrement };
    }

    await User.findByIdAndUpdate(player._id, updateQuery, { session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Processed successfully",
      data: {
        phone: player.phone,
        new_balance: newBalance,
        change: balanceChange,
        turnoverIncrement,
        transaction_id,
      },
    });
  } catch (err) {
    await session.abortTransaction();

    console.error("Callback error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    session.endSession();
  }
});

export default router;
