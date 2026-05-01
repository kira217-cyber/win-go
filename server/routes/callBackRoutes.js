// routes/callback.js
import express from "express";
import User from "../models/Users.js";
import DepositTurnover from "../models/DepositTurnover.js";
import GameHistory from "../models/GameHistory.js";

const router = express.Router();

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const applyTurnoverProgress = async ({ userId, amount }) => {
  let remainingAmount = num(amount);
  if (remainingAmount <= 0) return;

  const activeTurnovers = await DepositTurnover.find({
    user: userId,
    status: "active",
  }).sort({ activatedAt: 1, createdAt: 1 });

  for (const turnover of activeTurnovers) {
    if (remainingAmount <= 0) break;

    const requiredTurnover = num(turnover.requiredTurnover);
    const completedTurnover = num(turnover.completedTurnover);
    const currentRemaining = Math.max(0, requiredTurnover - completedTurnover);

    if (currentRemaining <= 0) {
      await DepositTurnover.findByIdAndUpdate(turnover._id, {
        $set: {
          remainingTurnover: 0,
          status: "completed",
          completedAt: turnover.completedAt || new Date(),
        },
      });
      continue;
    }

    const addAmount = Math.min(currentRemaining, remainingAmount);
    const newCompleted = completedTurnover + addAmount;
    const newRemaining = Math.max(0, requiredTurnover - newCompleted);
    const isCompleted = newRemaining <= 0;

    await DepositTurnover.findByIdAndUpdate(turnover._id, {
      $set: {
        completedTurnover: newCompleted,
        remainingTurnover: newRemaining,
        status: isCompleted ? "completed" : "active",
        ...(isCompleted ? { completedAt: new Date() } : {}),
      },
    });

    remainingAmount -= addAmount;

    console.log(
      `Turnover updated → Source: ${turnover.sourceType || "deposit"}, Added: ${addAmount}, Completed: ${newCompleted}, Remaining: ${newRemaining}`,
    );
  }
};

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
      round_id,
      times,
    } = req.body;

    console.log("Callback received:", req.body);

    if (
      !rawUsername ||
      !provider_code ||
      amount === undefined ||
      game_code === undefined ||
      !bet_type
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let cleanUsername = String(rawUsername).trim();

    if (cleanUsername.endsWith("45")) {
      cleanUsername = cleanUsername.slice(0, -2);
    }

    const player = await User.findOne({ username: cleanUsername });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const amountFloat = num(amount);

    if (amountFloat < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const cleanBetType = String(bet_type).trim().toUpperCase();

    let balanceChange = 0;
    let status = "pending";
    let winAmount = 0;

    if (cleanBetType === "BET") {
      balanceChange = -amountFloat;
      status = "bet";
      winAmount = 0;
    } else if (cleanBetType === "SETTLE") {
      balanceChange = amountFloat;
      status = "settled";
      winAmount = amountFloat;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid bet_type",
      });
    }

    const currentBalance = num(player.balance);
    const newBalance = currentBalance + balanceChange;

    if (newBalance < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        data: {
          username: player.username,
          current_balance: currentBalance,
          requested_amount: amountFloat,
        },
      });
    }

    // আপনার আগের logic same রাখা হলো: BET + SETTLE দুইটাই turnover count করবে
    const turnoverIncrement =
      cleanBetType === "BET" || cleanBetType === "SETTLE" ? amountFloat : 0;

    await GameHistory.create({
      user: player._id,
      provider_code,
      game_code: String(game_code),
      bet_type: cleanBetType,
      amount: amountFloat,
      transaction_id: transaction_id || null,
      round_id: round_id || null,
      verification_key: verification_key || null,
      times: times || null,
      status,
      win_amount: winAmount,
      balance_after: newBalance,
      bet_details: {
        account_id: account_id || null,
        rawUsername,
      },
    });

    const userUpdate = {
      $set: {
        balance: newBalance,
      },
    };

    if (turnoverIncrement > 0) {
      userUpdate.$inc = {
        turnoverCompleted: turnoverIncrement,
      };
    }

    await User.findByIdAndUpdate(player._id, userUpdate, {
      new: true,
      runValidators: true,
    });

    // ✅ Deposit turnover + Refer Redeem turnover দুইটাই এখান থেকে progress হবে
    if (turnoverIncrement > 0) {
      await applyTurnoverProgress({
        userId: player._id,
        amount: turnoverIncrement,
      });
    }

    return res.json({
      success: true,
      message: "Processed successfully",
      data: {
        username: player.username,
        new_balance: newBalance,
        change: balanceChange,
        turnoverIncrement,
        transaction_id,
      },
    });
  } catch (err) {
    console.error("Callback error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;
