import mongoose from 'mongoose';

const logoSchema = new mongoose.Schema({
  websiteLogo: {
    type: String,
    default: null,
  },
  loginLogo: {
    type: String,
    default: null,
  },
  registerImage: {
    type: String,
    default: null,
  },
}, { timestamps: true });

const Logo = mongoose.models.Logo || mongoose.model('Logo', logoSchema);

export default Logo;