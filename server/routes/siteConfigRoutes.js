// routes/siteConfigRoutes.js
import express from 'express';
import SiteConfig from '../models/SiteConfig.js';
import upload from '../config/multer.js'; // your multer setup
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET current active config (for client)
router.get('/', async (req, res) => {
  try {
    let config = await SiteConfig.findOne({ isActive: true });
    if (!config) {
      // create default if none exists
      config = await new SiteConfig().save();
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all (admin view)
router.get('/admin', async (req, res) => {
  try {
    const configs = await SiteConfig.find().sort({ createdAt: -1 });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST - create new (usually only one active)
router.post('/', upload.single('favicon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Favicon image is required' });
    }

    // Deactivate previous ones
    await SiteConfig.updateMany({ isActive: true }, { isActive: false });

    const newConfig = new SiteConfig({
      siteTitle: req.body.siteTitle || 'WiN GO',
      faviconUrl: `/uploads/${req.file.filename}`,
      isActive: true,
    });

    await newConfig.save();
    res.status(201).json(newConfig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - update existing
router.put('/:id', upload.single('favicon'), async (req, res) => {
  try {
    const config = await SiteConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ message: 'Not found' });

    if (req.body.siteTitle) config.siteTitle = req.body.siteTitle;

    if (req.file) {
      // delete old favicon
      const oldPath = path.join(process.cwd(), config.faviconUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      config.faviconUrl = `/uploads/${req.file.filename}`;
    }

    if (req.body.isActive !== undefined) {
      if (req.body.isActive) {
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