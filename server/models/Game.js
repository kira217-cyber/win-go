// Backend: models/Game.js
import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  gameId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  image: {
    type: String, // stores as "/uploads/filename.jpg"
  },
  status: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Game = mongoose.model('Game', gameSchema);
export default Game;