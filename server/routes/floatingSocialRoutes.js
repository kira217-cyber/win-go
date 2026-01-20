// routes/floatingSocialRoutes.js
import express from 'express';
import FloatingSocial from '../models/floatingSocial.js';
import upload from '../config/multer.js'; // your multer config
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET all active links (for client)
router.get('/', async (req, res) => {
  try {
    const links = await FloatingSocial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all (for admin)
router.get('/admin', async (req, res) => {
  try {
    const links = await FloatingSocial.find().sort({ order: 1, createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - add new floating link
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const { name, linkUrl, isActive = true, order = 0 } = req.body;

    if (!name || !linkUrl) {
      return res.status(400).json({ message: 'Name and link URL are required' });
    }

    const newLink = new FloatingSocial({
      name,
      imageUrl: `/uploads/${req.file.filename}`,
      linkUrl,
      isActive,
      order: Number(order),
    });

    await newLink.save();
    res.status(201).json(newLink);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - update existing link
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const link = await FloatingSocial.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });

    if (req.file) {
      // Delete old image
      const oldPath = path.join(process.cwd(), link.imageUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      link.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (req.body.name) link.name = req.body.name.trim();
    if (req.body.linkUrl) link.linkUrl = req.body.linkUrl.trim();
    if (req.body.isActive !== undefined) link.isActive = req.body.isActive;
    if (req.body.order) link.order = Number(req.body.order);

    await link.save();
    res.json(link);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE link
router.delete('/:id', async (req, res) => {
  try {
    const link = await FloatingSocial.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Link not found' });

    // Delete image
    const imagePath = path.join(process.cwd(), link.imageUrl);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await link.deleteOne();
    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;