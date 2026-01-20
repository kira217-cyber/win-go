// models/Notice.js
import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    textBn: {
      type: String,
      required: true,
      trim: true,
    },
    textEn: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// শুধু একটাই নোটিশ থাকবে, তাই প্রথমবার সেভ হলে পরেরবার আপডেট হবে
noticeSchema.statics.getActiveNotice = async function () {
  let notice = await this.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!notice) {
    // ডিফল্ট নোটিশ যদি কোনোটাই না থাকে
    notice = await this.findOne().sort({ createdAt: -1 });
  }
  return notice;
};

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;