// models/WithdrawalRequest.js
import mongoose from 'mongoose';

const withdrawRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [100, 'Minimum withdrawal amount is 100 BDT'],
  },
  method: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WithdrawMethod',
    required: true,
  },
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    sparse: true,
    trim: true,
  },
  note: String,           // admin approval note
  rejectReason: String,   // admin rejection reason
  approvedAt: Date,
  rejectedAt: Date,
}, {
  timestamps: true,
});

// No pre('save') hook here anymore

const WithdrawRequest = mongoose.model('WithdrawRequest', withdrawRequestSchema);
export default WithdrawRequest;