// routes/userRoutes.js
import mongoose from "mongoose";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js"; // ← সঠিক ইম্পোর্ট (User.js)

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, phone, password, referCode } = req.body;

    // ফোন নম্বর চেক
    let existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একাউন্ট আছে",
      });
    }

    // রেফার কোড জেনারেট (unique 6 chars)
    const generateReferCode = () =>
      Math.random().toString(36).substring(2, 8).toUpperCase();
    let myReferCode = generateReferCode();

    // রেফারার চেক
    let referredBy = null;
    if (referCode) {
      const referrer = await User.findOne({
        referCode: referCode.toUpperCase(),
      });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // পাসওয়ার্ড হ্যাশ করা
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // নতুন ইউজার তৈরি
    const newUser = new User({
      firstName,
      lastName,
      phone,
      password: hashedPassword, // hashed পাসওয়ার্ড সেভ হচ্ছে
      referCode: myReferCode,
      referredBy,
      role: "user",
    });

    await newUser.save();

    // রেফারার থাকলে তাদের createdUsers-এ নতুন ইউজার যোগ করা
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy, {
        $push: { createdUsers: newUser._id },
      });
    }

    // JWT টোকেন তৈরি
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      message: "রেজিস্ট্রেশন সফল",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        referCode: newUser.referCode,
        balance: newUser.balance,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "সার্ভার এরর",
      error: error.message,
    });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "মোবাইল নম্বর বা পাসওয়ার্ড ভুল",
      });
    }

    // পাসওয়ার্ড চেক (bcryptjs এখানে ব্যবহার)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "মোবাইল নম্বর বা পাসওয়ার্ড ভুল",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        referCode: user.referCode,
        balance: user.balance,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "সার্ভার এরর",
      error: error.message,
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required in query parameter (?userId=...)",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format",
      });
    }

    const user = await User.findById(userId).select(
      "firstName lastName phone balance turnoverTarget turnoverCompleted status role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate remaining turnover (server-side)
    const remainingTurnover = Math.max(0, user.turnoverTarget - user.turnoverCompleted);

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        balance: user.balance || 0,
        turnoverTarget: user.turnoverTarget || 0,
        turnoverCompleted: user.turnoverCompleted || 0,
        remainingTurnover,
        status: user.status,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user info",
    });
  }
});


// GET /api/users
router.get('/admin', async (req, res) => {
  try {
    const users = await User.find({}).select('-password -__v');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single user by ID (for profile)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive fields before sending
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.createdUsers;
    delete safeUser.referredBy;

    res.status(200).json(safeUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE user profile by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields only if they are sent in request
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();

    if (phone && phone !== user.phone) {
      // Check if phone is already used by another user
      const existing = await User.findOne({ phone });
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({ message: 'Phone number already in use' });
      }
      user.phone = phone.trim();
    }

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Return updated user without sensitive fields
    const updatedUser = await User.findById(id);
    const safeUpdated = updatedUser.toObject();
    delete safeUpdated.password;
    delete safeUpdated.createdUsers;
    delete safeUpdated.referredBy;

    res.status(200).json(safeUpdated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/user/admin/:id
router.get('/admin/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/user/admin/:id
router.put('/admin/:id', async (req, res) => {
  try {
    const { firstName, lastName, phone, balance, status, password } = req.body;

    const updateData = {
      firstName,
      lastName,
      phone,
      balance: Number(balance),
      status,
    };

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password.trim(), salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/users/:id/status
router.patch('/admin/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!['active', 'inactive', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



export default router;
