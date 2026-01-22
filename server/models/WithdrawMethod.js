// models/WithdrawMethod.js
import mongoose from 'mongoose';

const withdrawMethodSchema = new mongoose.Schema({
  methodName: {
    en: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    bn: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
  },

  image: {
    type: String,           // "/uploads/xxxx.png"
    default: '',
  },

  // Dynamic fields that user must fill when requesting withdrawal
  customFields: [{
    label: {
      en: { type: String, required: true, trim: true },
      bn: { type: String, required: true, trim: true },
    },
    type: {
      type: String,
      enum: ['text', 'number', 'email'],
      default: 'text',
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      en: { type: String, trim: true },
      bn: { type: String, trim: true },
    },
    // You can add more later: minLength, maxLength, pattern, etc.
  }],

  isActive: {
    type: Boolean,
    default: true,
  },

  order: {
    type: Number,
    default: 0,
  },

}, {
  timestamps: true,
});

export default mongoose.model('WithdrawMethod', withdrawMethodSchema);