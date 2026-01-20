// routes/paymentMethodRoutes.js
import express from 'express';
import PaymentMethod from '../models/PaymentMethod.js';
import upload from '../config/multer.js'; // your existing multer config
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET all active payment methods (sorted newest first)
router.get('/', async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all (for admin) - including inactive
router.get('/admin', async (req, res) => {
  try {
    const methods = await PaymentMethod.find().sort({ createdAt: -1 });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - add new
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const { name } = req.body;

    const newMethod = new PaymentMethod({
      imageUrl,
      name: name || 'Unnamed Method',
    });

    await newMethod.save();
    res.status(201).json(newMethod);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - update (image optional)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ message: 'Not found' });

    if (req.file) {
      // remove old image
      const oldPath = path.join(process.cwd(), method.imageUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      method.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (req.body.name) method.name = req.body.name;
    if (req.body.isActive !== undefined) method.isActive = req.body.isActive;

    await method.save();
    res.json(method);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ message: 'Not found' });

    // remove image file
    const filePath = path.join(process.cwd(), method.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await method.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;