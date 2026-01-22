// routes/withdrawMethod.route.js
import express from 'express';
import upload from '../config/multer.js';
import WithdrawMethod from '../models/WithdrawMethod.js';

const router = express.Router();

// CREATE
router.post(
  '/',
  upload.single('image'),
  async (req, res) => {
    try {
      const data = { ...req.body };

      if (data.methodName) data.methodName = JSON.parse(data.methodName);
      if (data.customFields) data.customFields = JSON.parse(data.customFields);

      if (req.file) {
        data.image = `/uploads/${req.file.filename}`;
      }

      const newMethod = new WithdrawMethod(data);
      await newMethod.save();

      res.status(201).json({ success: true, data: newMethod });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// READ ALL
router.get('/', async (req, res) => {
  try {
    const methods = await WithdrawMethod
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({ success: true, count: methods.length, data: methods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const method = await WithdrawMethod.findById(req.params.id).lean();
    if (!method) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: method });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.methodName) data.methodName = JSON.parse(data.methodName);
    if (data.customFields) data.customFields = JSON.parse(data.customFields);

    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }

    const updated = await WithdrawMethod.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await WithdrawMethod.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;