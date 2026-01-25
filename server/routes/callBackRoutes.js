// routes/callback.js
import express from "express";
import User from "../models/Users.js";
import DepositTurnover from "../models/DepositTurnover.js";

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
    } = req.body;

    console.log("Callback received:", req.body);

    // Validation
    if (
      !rawUsername ||
      !provider_code ||
      amount === undefined ||
      !game_code ||
      !bet_type
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Clean username (remove trailing "45" if present)
    let cleanUsername = String(rawUsername).trim();
    if (cleanUsername.endsWith("45")) {
      cleanUsername = cleanUsername.slice(0, -2);
    }

    const player = await User.findOne({ username: cleanUsername });
    if (!player) {
      console.log("User not found:", cleanUsername);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }


  
    // Balance change
    let balanceChange = 0;
    if (bet_type === "BET") {
      balanceChange = -amountFloat;
    } else if (bet_type === "SETTLE") {
      balanceChange = +amountFloat;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid bet_type" });
    }

    const newBalance = (player.balance || 0) + balanceChange;

    // Turnover increment — BET এবং SETTLE দুটোতেই
    let turnoverIncrement = 0;
    if (bet_type === "BET" || bet_type === "SETTLE") {
      turnoverIncrement = amountFloat;
    }

    // Game history record
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

    // Update User
    const userUpdate = {
      $set: { balance: newBalance },
      $push: { gameHistory: gameRecord },
    };

    if (turnoverIncrement > 0) {
      userUpdate.$inc = { turnoverCompleted: turnoverIncrement };
    }

    await User.findByIdAndUpdate(player._id, userUpdate);

    // Update DepositTurnover (প্রতি BET/SETTLE-এর amount দিয়ে)
    if (turnoverIncrement > 0) {
      // সবচেয়ে পুরোনো active turnover খুঁজে আপডেট করা (FIFO)
      const activeTurnover = await DepositTurnover.findOne({
        user: player._id,
        status: "active",
      }).sort({ activatedAt: 1 }); // oldest first

      if (activeTurnover) {
        const newCompleted =
          activeTurnover.completedTurnover + turnoverIncrement;
        const newRemaining = Math.max(
          0,
          activeTurnover.requiredTurnover - newCompleted,
        );

        await DepositTurnover.findByIdAndUpdate(activeTurnover._id, {
          $set: {
            completedTurnover: newCompleted,
            remainingTurnover: newRemaining,
            status: newRemaining <= 0 ? "completed" : "active",
            completedAt: newRemaining <= 0 ? new Date() : undefined,
          },
        });

        console.log(
          `Turnover updated → Deposit: ${activeTurnover.depositRequest}, ` +
            `Added: ${turnoverIncrement}, Completed: ${newCompleted}, Remaining: ${newRemaining}`,
        );
      }
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
    console.error("Callback error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;
