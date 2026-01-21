// models/ThemeSettings.js
import mongoose from 'mongoose';

const themeSettingsSchema = new mongoose.Schema({
  gradientFrom: {
    type: String,
    default: '#f97316',
    trim: true,
  },
  gradientVia: {
    type: String,
    default: '#dc2626',
    trim: true,
  },
  gradientTo: {
    type: String,
    default: '#7f1d1d',
    trim: true,
  },
  textColor: {
    type: String,
    default: '#ffffff',
    trim: true,
  },
}, {
  timestamps: true,
  // We usually keep only ONE document for global theme
});

const ThemeSettings = mongoose.model('ThemeSettings', themeSettingsSchema);

export default ThemeSettings;