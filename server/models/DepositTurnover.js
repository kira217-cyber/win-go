// models/DepositTurnover.js
import mongoose from 'mongoose';

const depositTurnoverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    depositRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DepositRequest',
      required: true,
      unique: true, // একই ডিপোজিটের জন্য একাধিক এন্ট্রি হবে না
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
      enum: ['active', 'completed', 'expired'],
      default: 'active',
    },
    activatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// pre-save hook রাখা হলো না — সব হিসাব approve-এ করা হবে

export default mongoose.model('DepositTurnover', depositTurnoverSchema);