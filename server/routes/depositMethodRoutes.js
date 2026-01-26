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

      // ── 1. Parse JSON-string fields ───────────────────────────────
      const jsonFields = ['methodName', 'methodTypes', 'bonusTitle'];

      for (const field of jsonFields) {
        if (data[field]) {
          try {
            data[field] = JSON.parse(data[field]);
          } catch (parseErr) {
            console.warn(`Invalid JSON in field ${field}:`, data[field]);
            throw new Error(`Invalid JSON format in ${field}`);
          }
        }
      }

      // ── 2. Convert numeric fields ─────────────────────────────────
      const numberFields = [
        'minDeposit',
        'maxDeposit',
        'bonusPercentage',
        'turnoverMultiplier'
      ];

      for (const field of numberFields) {
        if (data[field] !== undefined && data[field] !== '') {
          const num = Number(data[field]);
          if (isNaN(num)) {
            throw new Error(`${field} must be a valid number`);
          }
          data[field] = num;
        }
      }

      // Optional: business rule - max >= min
      if (data.minDeposit !== undefined && data.maxDeposit !== undefined) {
        if (data.maxDeposit < data.minDeposit) {
          throw new Error('Maximum deposit must be greater than or equal to minimum deposit');
        }
      }

      // ── 3. Image handling ─────────────────────────────────────────
      if (req.file) {
        data.image = `/uploads/${req.file.filename}`;
      }

      // Debug (remove in production)
      // console.log('Creating deposit method with data:', data);

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
        errorDetails: error.name === 'ValidationError' ? error.errors : undefined,
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

      // ── 1. Parse JSON-string fields ───────────────────────────────
      const jsonFields = ['methodName', 'methodTypes', 'bonusTitle'];

      for (const field of jsonFields) {
        if (data[field]) {
          try {
            data[field] = JSON.parse(data[field]);
          } catch (parseErr) {
            console.warn(`Invalid JSON in field ${field}:`, data[field]);
            throw new Error(`Invalid JSON format in ${field}`);
          }
        }
      }

      // ── 2. Convert numeric fields ─────────────────────────────────
      const numberFields = [
        'minDeposit',
        'maxDeposit',
        'bonusPercentage',
        'turnoverMultiplier'
      ];

      for (const field of numberFields) {
        if (data[field] !== undefined && data[field] !== '') {
          const num = Number(data[field]);
          if (isNaN(num)) {
            throw new Error(`${field} must be a valid number`);
          }
          data[field] = num;
        }
      }

      // Optional: business rule - max >= min (only if both are sent)
      if (data.minDeposit !== undefined && data.maxDeposit !== undefined) {
        if (data.maxDeposit < data.minDeposit) {
          throw new Error('Maximum deposit must be greater than or equal to minimum deposit');
        }
      }

      // ── 3. Image replacement (only if new file is uploaded) ───────
      if (req.file) {
        data.image = `/uploads/${req.file.filename}`;
      }

      // Debug (remove in production)
      // console.log('Updating deposit method with data:', data);

      const updatedMethod = await DepositMethod.findByIdAndUpdate(
        req.params.id,
        data,
        { 
          new: true, 
          runValidators: true 
          // lean: true → removed intentionally (helps with proper type casting)
        }
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
        errorDetails: error.name === 'ValidationError' ? error.errors : undefined,
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