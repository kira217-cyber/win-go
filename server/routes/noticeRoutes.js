// routes/noticeRoutes.js
import express from 'express';
import Notice from '../models/Notice.js';

const router = express.Router();

// GET: ক্লায়েন্ট সাইডের জন্য active notice
router.get('/', async (req, res) => {
  try {
    const notice = await Notice.getActiveNotice();
    if (!notice) {
      return res.json({
        textBn: "উইন গো-তে স্বাগতম — স্মার্টভাবে খেলুন ও বড় জিতুন!",
        textEn: "Welcome to WiN GO — Play smart & win big!",
      });
    }
    res.json({
      textBn: notice.textBn,
      textEn: notice.textEn,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: অ্যাডমিনের জন্য latest notice
router.get('/admin', async (req, res) => {
  try {
    const notice = await Notice.findOne().sort({ createdAt: -1 });
    res.json(notice || { textBn: "", textEn: "" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST / PUT: নোটিশ সেভ বা আপডেট (একটাই থাকবে)
router.post('/', async (req, res) => {
  try {
    const { textBn, textEn } = req.body;

    // প্রথমে দেখি আগে কোনো নোটিশ আছে কি না
    const existing = await Notice.findOne().sort({ createdAt: -1 });

    if (existing) {
      // আপডেট করি
      existing.textBn = textBn;
      existing.textEn = textEn;
      existing.isActive = true;
      await existing.save();
      return res.json(existing);
    } else {
      // নতুন তৈরি করি
      const newNotice = new Notice({ textBn, textEn });
      await newNotice.save();
      return res.status(201).json(newNotice);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;