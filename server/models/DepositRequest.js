// models/DepositRequest.js
import mongoose from 'mongoose';

const depositRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Change to 'Users' if your User model is named 'Users'
      required: [true, 'User is required'],
    },

    method: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DepositMethod',
      required: [true, 'Deposit method is required'],
    },

    methodType: {
      en: { type: String, trim: true },
      bn: { type: String, trim: true },
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [100, 'Minimum deposit amount is 100 BDT'],
    },

    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      trim: true,
      minlength: [4, 'Transaction ID must be at least 4 characters long'],
    },

    bonusAmount: {
      type: Number,
      default: 0,
    },

    turnoverTargetAdded: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },

    rejectReason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('DepositRequest', depositRequestSchema);