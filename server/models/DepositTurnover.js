// models/DepositTurnover.js
import mongoose from "mongoose";

const depositTurnoverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sourceType: {
      type: String,
      enum: ["deposit", "refer-redeem"],
      default: "deposit",
      index: true,
    },

    depositRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepositRequest",
      default: null,
      index: true,
    },

    referRedeemHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferRedeemHistory",
      default: null,
      index: true,
    },

    depositAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    bonusAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalBaseAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    turnoverMultiplier: {
      type: Number,
      required: true,
      min: 0,
    },

    requiredTurnover: {
      type: Number,
      required: true,
      min: 0,
    },

    completedTurnover: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingTurnover: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },

    activatedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("DepositTurnover", depositTurnoverSchema);
