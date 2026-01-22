import express from 'express';
import upload from '../config/multer.js';
import DepositMethod from '../models/DepositMethod.js';

const router = express.Router();

// ────────────────────────────────────────────────
// CREATE - POST /api/deposit-methods
// ────────────────────────────────────────────────
router.post(
  '/',
  upload.single('image'),
  async (req, res) => {
    try {
      const data = { ...req.body };

      // Parse nested / array fields sent as JSON strings from frontend
      if (data.methodName) {
        data.methodName = JSON.parse(data.methodName);
      }
      if (data.methodTypes) {
        data.methodTypes = JSON.parse(data.methodTypes); // ← array of {en, bn}
      }
      if (data.bonusTitle) {
        data.bonusTitle = JSON.parse(data.bonusTitle);
      }

      // Handle uploaded image
      if (req.file) {
        data.image = `/uploads/${req.file.filename}`;
      }

      const newMethod = new DepositMethod(data);
      await newMethod.save();

      res.status(201).json({
        success: true,
        data: newMethod,
      });
    } catch (error) {
      console.error('Create deposit method error:', error);

      const status = error.name === 'ValidationError' ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to create deposit method',
        error: error.name === 'ValidationError' ? error.errors : undefined,
      });
    }
  }
);

// ────────────────────────────────────────────────
// READ ALL - GET /api/deposit-methods
// ────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { active } = req.query; // optional ?active=true

    const filter = active === 'true' ? { isActive: true } : {};
    const methods = await DepositMethod
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: methods.length,
      data: methods,
    });
  } catch (error) {
    console.error('Get all deposit methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// ────────────────────────────────────────────────
// READ SINGLE - GET /api/deposit-methods/:id
// ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const method = await DepositMethod.findById(req.params.id).lean();

    if (!method) {
      return res.status(404).json({
        success: false,
        message: 'Deposit method not found',
      });
    }

    res.json({
      success: true,
      data: method,
    });
  } catch (error) {
    console.error('Get single deposit method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// ────────────────────────────────────────────────
// UPDATE - PUT /api/deposit-methods/:id
// ────────────────────────────────────────────────
router.put(
  '/:id',
  upload.single('image'),
  async (req, res) => {
    try {
      const data = { ...req.body };

      // Parse nested / array fields
      if (data.methodName) {
        data.methodName = JSON.parse(data.methodName);
      }
      if (data.methodTypes) {
        data.methodTypes = JSON.parse(data.methodTypes); // ← important
      }
      if (data.bonusTitle) {
        data.bonusTitle = JSON.parse(data.bonusTitle);
      }

      if (req.file) {
        data.image = `/uploads/${req.file.filename}`;
      }

      const updatedMethod = await DepositMethod.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true, runValidators: true, lean: true }
      );

      if (!updatedMethod) {
        return res.status(404).json({
          success: false,
          message: 'Deposit method not found',
        });
      }

      res.json({
        success: true,
        data: updatedMethod,
      });
    } catch (error) {
      console.error('Update deposit method error:', error);

      const status = error.name === 'ValidationError' ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to update deposit method',
        error: error.name === 'ValidationError' ? error.errors : undefined,
      });
    }
  }
);

// ────────────────────────────────────────────────
// DELETE - DELETE /api/deposit-methods/:id
// ────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await DepositMethod.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Deposit method not found',
      });
    }

    res.json({
      success: true,
      message: 'Deposit method deleted successfully',
    });
  } catch (error) {
    console.error('Delete deposit method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;