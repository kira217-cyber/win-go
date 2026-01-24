// models/User.js
import mongoose from "mongoose";
import gameHistorySchema from "./GameHistory.js";

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
      minlength: 6,
      maxlength: 6,
      match: [/^[a-z]{6}$/, "Username must be exactly 6 lowercase letters"],
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
    },

    referCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
      required: true,
    },

    // ────────────────────────────────────────────────
    // Money & Turnover fields (added here)
    // ────────────────────────────────────────────────
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

    // Optional fields (useful for future)
    lastBonusAdded: {
      type: Number,
      default: 0,
    },

    lastDepositDate: {
      type: Date,
    },

    // Existing fields
    gameHistory: [gameHistorySchema],

    createdUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

const User = mongoose.model("User", userSchema);

export default User;
