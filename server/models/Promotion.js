import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  titleBn: {
    type: String,
    required: true,
  },
  titleEn: {
    type: String,
    required: true,
  },
  descBn: {
    type: String,
    required: true,
  },
  descEn: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
}, { timestamps: true });

const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);

export default Promotion;