import express from "express";
import Navbar from "../models/Navbar.js";

const router = express.Router();

// POST: Create or Update Navbar Settings (upsert style)
router.post("/", async (req, res) => {
  try {
    const {
      gradientFrom,
      gradientVia,
      gradientTo,
      textColor,
      withdrawBg,
      withdrawText,
      depositBg,
      depositText,
    } = req.body;

    // findOneAndUpdate দিয়ে আরও efficient করা যায় (upsert: true)
    const settings = await Navbar.findOneAndUpdate(
      {}, // filter → সবসময় প্রথম ডকুমেন্ট
      {
        $set: {
          gradientFrom: gradientFrom || "orange-500",
          gradientVia: gradientVia || "red-600",
          gradientTo: gradientTo || "red-900",
          textColor: textColor || "white",
          withdrawBg: withdrawBg || "orange-500",
          withdrawText: withdrawText || "white",
          depositBg: depositBg || "red-500",
          depositText: depositText || "white",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(200).json({
      success: true,
      message: "Navbar settings saved/updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Navbar settings save error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save navbar settings",
      error: error.message,
    });
  }
});

// GET: Fetch current settings
router.get("/", async (req, res) => {
  try {
    const settings = await Navbar.findOne();

    if (!settings) {
      // default values return করতে পারেন যদি চান
      return res.status(200).json({
        gradientFrom: "orange-500",
        gradientVia: "red-600",
        gradientTo: "red-900",
        textColor: "white",
        withdrawBg: "orange-500",
        withdrawText: "white",
        depositBg: "red-500",
        depositText: "white",
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch settings" });
  }
});

export default router;
