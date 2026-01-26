// routes/siteConfigRoutes.js
import express from 'express';
import SiteConfig from '../models/SiteConfig.js';
import upload from '../config/multer.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET current active config (for frontend/client)
router.get('/', async (req, res) => {
  try {
    let config = await SiteConfig.findOne({ isActive: true });
    if (!config) {
      config = await new SiteConfig().save();
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all configs (Admin)
router.get('/admin', async (req, res) => {
  try {
    const configs = await SiteConfig.find().sort({ createdAt: -1 });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST - Create New Config
router.post('/', upload.single('favicon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Favicon image is required' });
    }

    // Deactivate all previous configs
    await SiteConfig.updateMany({ isActive: true }, { isActive: false });

    const newConfig = new SiteConfig({
      siteTitle: req.body.siteTitle || 'WiN GO',
      faviconUrl: `/uploads/${req.file.filename}`,
      downloadLink: req.body.downloadLink || '',
      isActive: true,
    });

    await newConfig.save();
    res.status(201).json(newConfig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - Update Existing Config
router.put('/:id', upload.single('favicon'), async (req, res) => {
  try {
    const config = await SiteConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ message: 'Config not found' });

    // Update text fields
    if (req.body.siteTitle) config.siteTitle = req.body.siteTitle;
    if (req.body.downloadLink !== undefined) {
      config.downloadLink = req.body.downloadLink.trim();
    }

    // Update favicon if new file uploaded
    if (req.file) {
      const oldPath = path.join(process.cwd(), config.faviconUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      config.faviconUrl = `/uploads/${req.file.filename}`;
    }

    // Handle isActive logic
    if (req.body.isActive !== undefined) {
      if (req.body.isActive === 'true' || req.body.isActive === true) {
        await SiteConfig.updateMany(
          { _id: { $ne: config._id } },
          { isActive: false }
        );
      }
      config.isActive = req.body.isActive;
    }

    await config.save();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;