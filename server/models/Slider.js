import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // createdAt এবং updatedAt অটোমেটিক যোগ করবে
});

const Slider = mongoose.model('Slider', sliderSchema);
export default Slider;