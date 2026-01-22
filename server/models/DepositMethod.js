import mongoose from 'mongoose';

const depositMethodSchema = new mongoose.Schema(
  {
    methodName: {
      en: { type: String, required: true, trim: true },
      bn: { type: String, required: true, trim: true },
    },
    accountNumber: {
      type: String,
      trim: true,
      default: "",
    },
    methodTypes: [
      {
        en: { type: String, trim: true },
        bn: { type: String, trim: true },
      },
    ],
    image: {
      type: String,
      default: "",
    },
    bonusTitle: {
      en: { type: String, trim: true },
      bn: { type: String, trim: true },
    },
    bonusPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    turnoverMultiplier: {
      type: Number,
      default: 1,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("DepositMethod", depositMethodSchema);
