import express from "express";
import BottomNavbarSettings from "../models/BottomNavbar.js";

const router = express.Router();

// GET - Fetch current settings (used in frontend)
router.get("/", async (req, res) => {
  try {
    const settings = await BottomNavbarSettings.findOne();
    if (!settings) {
      // Return defaults if no document exists
      return res.status(200).json({
        barGradientFrom: "#f97316",
        barGradientVia: "#dc2626",
        barGradientTo: "#7f1d1d",
        activeGradientFrom: "#4ade80",
        activeGradientTo: "#6366f1",
        activeText: "#ffffff",
        activeShadow: "#ef4444",
        normalText: "#ffffff",
        normalHoverText: "#fdba74",
      });
    }
    res.status(200).json(settings);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch settings" });
  }
});

// POST - Create or Update settings (from admin)
router.post("/", async (req, res) => {
  try {
    const {
      barGradientFrom,
      barGradientVia,
      barGradientTo,
      activeGradientFrom,
      activeGradientTo,
      activeText,
      activeShadow,
      normalText,
      normalHoverText,
    } = req.body;

    const settings = await BottomNavbarSettings.findOneAndUpdate(
      {}, // match first document
      {
        $set: {
          barGradientFrom: barGradientFrom || "#f97316",
          barGradientVia: barGradientVia || "#dc2626",
          barGradientTo: barGradientTo || "#7f1d1d",
          activeGradientFrom: activeGradientFrom || "#4ade80",
          activeGradientTo: activeGradientTo || "#6366f1",
          activeText: activeText || "#ffffff",
          activeShadow: activeShadow || "#ef4444",
          normalText: normalText || "#ffffff",
          normalHoverText: normalHoverText || "#fdba74",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(200).json({
      success: true,
      message: "Bottom navbar settings saved",
      data: settings,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save settings" });
  }
});

export default router;
