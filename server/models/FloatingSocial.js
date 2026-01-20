// models/floatingSocial.js
import mongoose from 'mongoose';

const floatingSocialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "WhatsApp", "Telegram"
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true, // uploaded image path
  },
  linkUrl: {
    type: String,
    required: true, // e.g., https://wa.me/...
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0, // for sorting (optional)
  },
}, { timestamps: true });

const FloatingSocial = mongoose.model('FloatingSocial', floatingSocialSchema);
export default FloatingSocial;