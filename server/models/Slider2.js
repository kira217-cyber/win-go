import mongoose from 'mongoose';

const slider2Schema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // createdAt এবং updatedAt অটোমেটিক যোগ করবে
});

const Slider2 = mongoose.model('Slider2', slider2Schema);
export default Slider2;