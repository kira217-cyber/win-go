import express from 'express';
import Logo from '../models/Logo.js';
import upload from '../config/multer.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper: always return one document (create if not exists)
const getLogoDocument = async () => {
  let logo = await Logo.findOne();
  if (!logo) {
    logo = new Logo();
    await logo.save();
  }
  return logo;
};

// POST /api/logos → upload any combination of the 5 fields
router.post('/logos', upload.fields([
  { name: 'websiteLogo',     maxCount: 1 },
  { name: 'loginLogo',       maxCount: 1 },
  { name: 'registerImage',   maxCount: 1 },
  { name: 'outerBackground', maxCount: 1 },
  { name: 'innerBackground', maxCount: 1 },
]), async (req, res) => {
  try {
    const logo = await getLogoDocument();

    if (req.files.websiteLogo)     logo.websiteLogo     = req.files.websiteLogo[0].path;
    if (req.files.loginLogo)       logo.loginLogo       = req.files.loginLogo[0].path;
    if (req.files.registerImage)   logo.registerImage   = req.files.registerImage[0].path;
    if (req.files.outerBackground) logo.outerBackground = req.files.outerBackground[0].path;
    if (req.files.innerBackground) logo.innerBackground = req.files.innerBackground[0].path;

    await logo.save();
    res.status(200).json(logo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/logos
router.get('/logos', async (req, res) => {
  try {
    const logo = await getLogoDocument();
    res.status(200).json(logo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/logos/:type
router.delete('/logos/:type', async (req, res) => {
  try {
    const logo = await getLogoDocument();
    const type = req.params.type;

    const allowed = ['websiteLogo', 'loginLogo', 'registerImage', 'outerBackground', 'innerBackground'];

    if (!allowed.includes(type)) {
      return res.status(400).json({ message: 'Invalid image type' });
    }

    if (logo[type]) {
      const filePath = path.join(process.cwd(), logo[type]);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      logo[type] = null;
      await logo.save();
    }

    res.status(200).json(logo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;