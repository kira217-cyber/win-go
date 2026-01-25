// models/schemas/gameHistorySchema.js
import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema(
  {
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

    // FIXED & IMPROVED: Realistic statuses for betting platforms
    status: {
      type: String,
      enum: [
        "pending",     // bet placed, waiting
        "bet",         // ← added (your existing data uses this)
        "settled",     // ← added (your existing data uses this)
        "won",
        "lost",
        "push",        // draw/tie
        "cancelled",
        "refunded",
        "error",       // system or provider error
        "void",        // voided bet
      ],
      default: "pending",
      index: true,     // frequent filtering by status
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
    },
  },
  {
    timestamps: true,
  }
);

// ─── Optimized Indexes ──────────────────────────────────────────────────────

gameHistorySchema.index({ createdAt: -1 });                    // recent games
gameHistorySchema.index({ status: 1, createdAt: -1 });         // filter by status + time
gameHistorySchema.index({ provider_code: 1, status: 1 });      // per-provider status reports
gameHistorySchema.index({ user: 1, createdAt: -1 });           // ← if you add user ref later

// Optional compound index for money flow queries (uncomment if needed)
// gameHistorySchema.index({ amount: 1, createdAt: -1 });

export default gameHistorySchema;