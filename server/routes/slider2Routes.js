import express from 'express';
import Slider2 from '../models/Slider2.js';
import upload from '../config/multer.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET all sliders
router.get('/', async (req, res) => {
  try {
    const sliders = await Slider2.find().sort({ createdAt: -1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new slider (with image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const newSlider = new Slider2({ imageUrl });
    await newSlider.save();
    res.status(201).json(newSlider);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update slider (optional image update)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const slider = await Slider2.findById(req.params.id);
    if (!slider) return res.status(404).json({ message: 'Slider not found' });

    if (req.file) {
      // Delete old image
      const oldPath = path.join(process.cwd(), slider.imageUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      
      slider.imageUrl = `/uploads/${req.file.filename}`;
    }
    await slider.save();
    res.json(slider);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE slider
router.delete('/:id', async (req, res) => {
  try {
    const slider = await Slider2.findById(req.params.id);
    if (!slider) return res.status(404).json({ message: 'Slider not found' });

    // Delete image file
    const filePath = path.join(process.cwd(), slider.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await slider.deleteOne();
    res.json({ message: 'Slider deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;