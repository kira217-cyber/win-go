// models/SiteConfig.js
import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      required: true,
      trim: true,
      default: 'WiN GO - Online Gaming Platform',
    },
    faviconUrl: {
      type: String,
      required: true,
      default: ' ', // fallback
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);
export default SiteConfig;