// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 6,
      maxlength: 6,
      match: [/^[a-z]{6}$/, "Username must be exactly 6 lowercase letters"],
      index: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^01[3-9]\d{8}$/,
        "Please enter a valid Bangladeshi phone number",
      ],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
      index: true,
    },

    referCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
      required: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },

    turnoverTarget: {
      type: Number,
      default: 0,
      min: [0, "Turnover target cannot be negative"],
    },

    turnoverCompleted: {
      type: Number,
      default: 0,
      min: [0, "Turnover completed cannot be negative"],
    },

    // ✅ Admin set করা global refer amount user এর মধ্যে থাকবে
    referAmount: {
      type: Number,
      default: 0,
      min: [0, "Refer amount cannot be negative"],
    },

    // ✅ অন্য কেউ এই user এর referCode দিয়ে register করলে এখানে add হবে
    referAmountBalance: {
      type: Number,
      default: 0,
      min: [0, "Refer amount balance cannot be negative"],
    },

    lastBonusAdded: {
      type: Number,
      default: 0,
    },

    lastDepositDate: {
      type: Date,
      default: null,
    },
    createdUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
