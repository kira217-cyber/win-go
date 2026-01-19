// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true,
    },
    referCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    balance: {
      type: Number,
      default: 0,
    },
    createdUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt স্বয়ংক্রিয়ভাবে যোগ হবে
  }
);

// কোনো pre-save hook নেই — পাসওয়ার্ড হ্যাশিং routes-এ হবে
// compare মেথডও routes-এ হবে, তাই এখানে কিছু রাখা হলো না

const User = mongoose.model('User', userSchema);

export default User;