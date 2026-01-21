import mongoose from 'mongoose';

const navbarSchema = new mongoose.Schema({
  gradientFrom: { type: String, default: '#f97316' },
  gradientVia: { type: String, default: '#dc2626' },
  gradientTo: { type: String, default: '#7f1d1d' },
  textColor: { type: String, default: '#ffffff' },
  withdrawBg: { type: String, default: '#f97316' },
  withdrawText: { type: String, default: '#ffffff' },
  depositBg: { type: String, default: '#dc2626' },
  depositText: { type: String, default: '#ffffff' },
}, { timestamps: true });

// একটা সিঙ্গেল ডকুমেন্ট হিসেবে ব্যবহার করার জন্য, ID দিয়ে findOne করব
const Navbar = mongoose.model('Navbar', navbarSchema);

export default Navbar;