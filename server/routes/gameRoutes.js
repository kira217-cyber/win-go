// Backend: routes/games.js (adjust paths as needed)
import express from "express";
import upload from "../config/multer.js";
import Game from "../models/Game.js";
import qs from "qs";
import axios from "axios";

const router = express.Router();

// GET all games
router.get("/", async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/active", async (req, res) => {
  try {
    const activeGames = await Game.find({ status: true })
      .select("title image gameId") // only needed fields
      .sort({ createdAt: -1 }); // newest first, or change sort as you like
    res.json(activeGames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new game
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, gameId, serialNumber, status } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newGame = new Game({
      title,
      gameId,
      serialNumber,
      image: imagePath,
      status: status === "true" || status === true,
    });

    await newGame.save();
    res.status(201).json(newGame);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Game ID or Serial Number already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

router.post("/playgame", async (req, res) => {
  try {
    const { gameID, username, money } = req.body;

    // Validation (uncommented and fixed)
    if (!gameID || !username || !money) {
      return res.status(400).json({
        success: false,
        message: "gameID, username, and money are required",
      });
    }

    // Validate types (optional but good)
    if (typeof money !== "number" || money <= 0) {
      return res.status(400).json({
        success: false,
        message: "Money must be a positive number",
      });
    }

    console.log("PlayGame Request Body:", req.body);

    const postData = {
      home_url: "https://api.tk999.oracelsoft.com", // Fix if typo: perhaps "oracle" not "oracel"?
      token: "5f4e59f09dc1a061cdb5185ceef6e75b",
      username: username + "45", // Append as per your code
      money: money,
      gameid: gameID,
    };

    console.log("External API Post Data:", postData);

    const response = await axios.post(
      "https://crazybet99.com/getgameurl", // Your active URL
      qs.stringify(postData),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-dstgame-key": postData.token,
        },
      },
    );

    // Handle response (assuming it returns { url } or similar)
    const gameUrl =
      response.data.url || response.data.game_url || response.data;

    if (!gameUrl) {
      throw new Error("No game URL received from external API");
    }

    res.json({
      success: true,
      gameUrl,
    });
  } catch (error) {
    console.error("PlayGame API Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to launch game",
      error: error.response?.data || error.message,
    });
  }
});

// PUT update game (image is optional)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, gameId, serialNumber, status } = req.body;
    const updateData = {
      title,
      gameId,
      serialNumber,
      status: status === "true" || status === true,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedGame = await Game.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedGame) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.json(updatedGame);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Game ID or Serial Number already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// PATCH toggle status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Game.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!updated) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE game
router.delete("/:id", async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    // Optional: delete image file
    // import fs from 'fs/promises';
    // if (game.image) {
    //   const filename = game.image.split('/').pop();
    //   await fs.unlink(`uploads/${filename}`).catch(() => {});
    // }
    res.json({ message: "Game deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
