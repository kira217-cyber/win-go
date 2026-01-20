// models/paymentMethod.js
import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  name: {           // optional: "bKash", "Nagad", etc.
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;