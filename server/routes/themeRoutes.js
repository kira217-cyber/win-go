// routes/themeRoutes.js
import express from "express";
import ThemeSettings from "../models/ThemeSettings.js";

const router = express.Router();

// POST: Create or Update Theme Settings (upsert style)
router.post("/", async (req, res) => {
  try {
    const { gradientFrom, gradientVia, gradientTo, textColor } = req.body;

    const settings = await ThemeSettings.findOneAndUpdate(
      {}, // always single document
      {
        $set: {
          gradientFrom: gradientFrom || "#f97316",
          gradientVia: gradientVia || "#dc2626",
          gradientTo: gradientTo || "#7f1d1d",
          textColor: textColor || "#ffffff",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Theme settings saved/updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Theme settings save error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save theme settings",
      error: error.message,
    });
  }
});

// GET: Fetch current theme settings
router.get("/", async (req, res) => {
  try {
    const settings = await ThemeSettings.findOne();

    // If not found → return default values
    if (!settings) {
      return res.status(200).json({
        success: true,
        data: {
          gradientFrom: "#f97316",
          gradientVia: "#dc2626",
          gradientTo: "#7f1d1d",
          textColor: "#ffffff",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Theme settings fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch theme settings",
      error: error.message,
    });
  }
});

export default router;
