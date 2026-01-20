import express from 'express';
import FooterConfig from '../models/FooterConfig.js';
import upload from '../config/multer.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// GET - Client gets the footer config (only one document exists)
router.get('/', async (req, res) => {
  try {
    let config = await FooterConfig.findOne();
    if (!config) {
      config = new FooterConfig(); // create default if missing
      await config.save();
    }
    res.json(config);
  } catch (err) {
    console.error('GET /footer error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET admin - all configs (if you ever need history)
router.get('/admin', async (req, res) => {
  try {
    const configs = await FooterConfig.find().sort({ createdAt: -1 });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT - Update the main config (we use /:id for safety, but usually only one ID exists)
router.put('/:id', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'socialImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const config = await FooterConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({ message: 'Footer config not found' });
    }

    // Update logo if uploaded
    if (req.files?.logo?.[0]) {
      if (config.logoUrl && config.logoUrl.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), config.logoUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      config.logoUrl = `/uploads/${req.files.logo[0].filename}`;
    }

    // Update text fields if provided
    if (req.body.banglaTitle) config.banglaTitle = req.body.banglaTitle.trim();
    if (req.body.englishTitle) config.englishTitle = req.body.englishTitle.trim();
    if (req.body.banglaDescription) config.banglaDescription = req.body.banglaDescription.trim();
    if (req.body.englishDescription) config.englishDescription = req.body.englishDescription.trim();
    if (req.body.banglaSocialTitle) config.banglaSocialTitle = req.body.banglaSocialTitle.trim();
    if (req.body.englishSocialTitle) config.englishSocialTitle = req.body.englishSocialTitle.trim();

    // Add new social link if both image and url are provided
    if (req.files?.socialImage?.[0] && req.body.linkUrl) {
      config.socialLinks.push({
        imageUrl: `/uploads/${req.files.socialImage[0].filename}`,
        linkUrl: req.body.linkUrl.trim(),
      });
    }

    await config.save();
    res.json(config);
  } catch (err) {
    console.error('PUT /footer/:id error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// DELETE a specific social link
router.delete('/:id/social/:socialId', async (req, res) => {
  try {
    const config = await FooterConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ message: 'Config not found' });

    const socialIndex = config.socialLinks.findIndex(
      link => link._id.toString() === req.params.socialId
    );

    if (socialIndex === -1) {
      return res.status(404).json({ message: 'Social link not found' });
    }

    const imageUrl = config.socialLinks[socialIndex].imageUrl;
    const imagePath = path.join(process.cwd(), imageUrl);

    // Remove from array using $pull
    await FooterConfig.updateOne(
      { _id: req.params.id },
      { $pull: { socialLinks: { _id: req.params.socialId } } }
    );

    // Delete image file
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ message: 'Social link deleted successfully' });
  } catch (err) {
    console.error('DELETE social error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

export default router;