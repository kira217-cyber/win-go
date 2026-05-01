// models/ReferRedeemHistory.js
import mongoose from "mongoose";

const referRedeemHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    redeemAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    pointsUsed: {
      type: Number,
      required: true,
      min: 0,
    },

    pointsBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    pointsAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "ReferRedeemHistory",
  referRedeemHistorySchema,
);