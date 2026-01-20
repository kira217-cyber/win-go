import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

const Provider = mongoose.model('Provider', providerSchema);
export default Provider;