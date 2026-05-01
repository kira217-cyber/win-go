// models/GameHistory.js
import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema(
  {
    // ✅ NEW: user reference (most important change)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    game_code: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    bet_type: {
      type: String,
      enum: ["BET", "SETTLE", "CANCEL", "REFUND", "BONUS", "PROMO"],
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    transaction_id: {
      type: String,
      index: true,
    },

    round_id: {
      type: String,
      sparse: true,
    },

    verification_key: {
      type: String,
      sparse: true,
    },

    times: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "bet",
        "settled",
        "won",
        "lost",
        "push",
        "cancelled",
        "refunded",
        "error",
        "void",
      ],
      default: "pending",
      index: true,
    },

    win_amount: {
      type: Number,
      default: 0,
    },

    balance_after: {
      type: Number,
    },

    bet_details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    flagged: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Index Optimization ─────────────────────────

// user ভিত্তিক history fetch (most important)
gameHistorySchema.index({ user: 1, createdAt: -1 });

// filter by status + user
gameHistorySchema.index({ user: 1, status: 1, createdAt: -1 });

// provider analytics
gameHistorySchema.index({ provider_code: 1, status: 1 });

// transaction lookup (duplicate prevent/useful)
gameHistorySchema.index({ transaction_id: 1 });

// optional money analytics
// gameHistorySchema.index({ amount: 1, createdAt: -1 });

const GameHistory = mongoose.model("GameHistory", gameHistorySchema);

export default GameHistory;
