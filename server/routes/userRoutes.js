// routes/userRoutes.js
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

export default router;
