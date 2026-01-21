import mongoose from 'mongoose';

const bottomNavbarSettingsSchema = new mongoose.Schema({
  // Main bottom bar gradient
  barGradientFrom: { type: String, default: '#f97316' },   // orange-500
  barGradientVia:  { type: String, default: '#dc2626' },   // red-600
  barGradientTo:   { type: String, default: '#7f1d1d' },   // red-900

  // Active link style
  activeGradientFrom: { type: String, default: '#4ade80' }, // green-400
  activeGradientTo:   { type: String, default: '#6366f1' }, // indigo-500
  activeText:         { type: String, default: '#ffffff' },
  activeShadow:       { type: String, default: '#ef4444' }, // red-500 for shadow-red-500/30

  // Normal link style
  normalText:       { type: String, default: '#ffffff' },
  normalHoverText:  { type: String, default: '#fdba74' },   // orange-300

}, { timestamps: true });

const BottomNavbarSettings = mongoose.model('BottomNavbarSettings', bottomNavbarSettingsSchema);
export default BottomNavbarSettings;