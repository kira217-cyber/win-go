import express from 'express';
import Logo from '../models/Logo.js';
import upload from '../config/multer.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Helper function to get or create the single logo document
const getLogoDocument = async () => {
  let logo = await Logo.findOne();
  if (!logo) {
    logo = new Logo();
    await logo.save();
  }
  return logo;
};

// CREATE/UPDATE: Upload and save logo
router.post('/logos', upload.fields([
  { name: 'websiteLogo', maxCount: 1 },
  { name: 'loginLogo', maxCount: 1 },
  { name: 'registerImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const logo = await getLogoDocument();
    if (req.files.websiteLogo) logo.websiteLogo = req.files.websiteLogo[0].path;
    if (req.files.loginLogo) logo.loginLogo = req.files.loginLogo[0].path;
    if (req.files.registerImage) logo.registerImage = req.files.registerImage[0].path;
    
    await logo.save();
    res.status(200).json(logo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get all logos
router.get('/logos', async (req, res) => {
  try {
    const logo = await getLogoDocument();
    res.status(200).json(logo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE: Same as POST, since it's multipart form

// DELETE: Delete specific logo
router.delete('/logos/:type', async (req, res) => {
  try {
    const logo = await getLogoDocument();
    const type = req.params.type;
    if (!['websiteLogo', 'loginLogo', 'registerImage'].includes(type)) {
      return res.status(400).json({ message: 'Invalid logo type' });
    }

    if (logo[type]) {
      const filePath = path.join(process.cwd(), logo[type]);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      logo[type] = null;
      await logo.save();
    }
    res.status(200).json(logo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;