// models/ReferRedeemSetting.js
import mongoose from "mongoose";

const referRedeemSettingSchema = new mongoose.Schema(
  {
    referAmountForAllUsers: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumRedeemAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumRedeemAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    redeemPoint: {
      type: Number,
      default: 0,
      min: 0,
    },

    redeemMoney: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const ReferRedeemSetting = mongoose.model(
  "ReferRedeemSetting",
  referRedeemSettingSchema,
);

export default ReferRedeemSetting;