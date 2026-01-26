// routes/adminRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = express.Router();

// ──────────────────────────────────────────────
// Middleware to protect routes (you should move this to a separate file later)
const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        return res.status(401).json({ message: 'Not authorized - admin not found' });
      }

      next();
    } catch (error) {
      console.error('Token error:', error);
      return res.status(401).json({ message: 'Not authorized - invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized - no token' });
  }
};

// ──────────────────────────────────────────────
// TEMPORARY: Create first admin (REMOVE AFTER FIRST USE)
// ──────────────────────────────────────────────
router.post('/create-first-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: 'First admin created! You can now login.',
      email: newAdmin.email,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ──────────────────────────────────────────────
// Login
// ──────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ──────────────────────────────────────────────
// UPDATE OWN PROFILE (email + password)
// Protected route
// ──────────────────────────────────────────────
router.put('/profile', protectAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const { email, currentPassword, newPassword } = req.body;

    // ── Email update ───────────────────────────────
    if (email && email.toLowerCase() !== admin.email) {
      const emailExists = await Admin.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      admin.email = email.toLowerCase().trim();
    }

    // ── Password update ────────────────────────────
    if (newPassword) {
      // Current password is required when changing password
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set new password' });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
      admin.lastPasswordChange = new Date();
    }

    await admin.save();

    // Return updated admin (without password)
    res.json({
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        lastPasswordChange: admin.lastPasswordChange,
      },
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;