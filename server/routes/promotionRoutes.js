import express from 'express';
import Promotion from '../models/Promotion.js';
import upload from '../config/multer.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET all promotions
router.get('/promotions', async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single promotion by ID
router.get('/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findById(id);
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    res.status(200).json(promotion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// POST create promotion
router.post('/promotions', upload.single('image'), async (req, res) => {
  try {
    const { titleBn, titleEn, descBn, descEn } = req.body;
    const image = req.file ? req.file.path : null;
    const promotion = new Promotion({ titleBn, titleEn, descBn, descEn, image });
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update promotion
router.put('/promotions/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { titleBn, titleEn, descBn, descEn } = req.body;
    const promotion = await Promotion.findById(id);
    if (!promotion) return res.status(404).json({ message: 'Promotion not found' });

    promotion.titleBn = titleBn || promotion.titleBn;
    promotion.titleEn = titleEn || promotion.titleEn;
    promotion.descBn = descBn || promotion.descBn;
    promotion.descEn = descEn || promotion.descEn;

    if (req.file) {
      // Delete old image if exists
      if (promotion.image) {
        const oldPath = path.join(process.cwd(), promotion.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      promotion.image = req.file.path;
    }

    await promotion.save();
    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE promotion
router.delete('/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findById(id);
    if (!promotion) return res.status(404).json({ message: 'Promotion not found' });

    // Delete image if exists
    if (promotion.image) {
      const filePath = path.join(process.cwd(), promotion.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Promotion.findByIdAndDelete(id);
    res.status(200).json({ message: 'Promotion deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;