import express from 'express';
import Provider from '../models/Provider.js';
import upload from '../config/multer.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET all providers
router.get('/', async (req, res) => {
  try {
    const providers = await Provider.find().sort({ createdAt: -1 });
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new provider (with image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const newProvider = new Provider({ imageUrl });
    await newProvider.save();
    res.status(201).json(newProvider);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update provider (optional image update)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    if (req.file) {
      // Delete old image
      const oldPath = path.join(process.cwd(), provider.imageUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      
      provider.imageUrl = `/uploads/${req.file.filename}`;
    }
    await provider.save();
    res.json(provider);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE provider
router.delete('/:id', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    // Delete image file
    const filePath = path.join(process.cwd(), provider.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await provider.deleteOne();
    res.json({ message: 'Provider deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;