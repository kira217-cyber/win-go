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

// GET /api/games/count
router.get("/count", async (req, res) => {
  try {
    const totalGames = await Game.countDocuments();

    res.status(200).json({
      success: true,
      totalGames,
      message: "Total number of games fetched successfully",
    });
  } catch (error) {
    console.error("Error counting games:", error);
    res.status(500).json({
      success: false,
      message: "Server error while counting games",
      error: error.message,
    });
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

// play game
router.post("/playgame", async (req, res) => {
  try {
    const { gameID, username, money } = req.body;

    // ✅ Basic validation
    if (!gameID || !username || money === undefined) {
      return res.status(400).json({
        success: false,
        message: "gameID, username, and money are required",
      });
    }

    console.log("PlayGame Request Body:", req.body);

    // ✅ Step 1: Get game details from Oracle by gameID
    const oracleResponse = await axios.get(
      `https://api.oraclegames.live/api/games/${gameID}`,
      {
        headers: {
          "x-api-key": "ceeeba1c-892b-4571-b05f-2bcec5c4a44e",
        },
      },
    );

    const gameData = oracleResponse?.data?.data;

    if (!gameData) {
      return res.status(404).json({
        success: false,
        message: "Game not found from Oracle API",
      });
    }

    // ✅ Extract required values
    const provider_code = gameData?.provider?.provider_code;
    const game_code = gameData?.game_code ?? 0;
    const game_type = gameData?.game_type ?? 0;

    if (!provider_code) {
      return res.status(400).json({
        success: false,
        message: "provider_code not found for this game",
      });
    }

    const parsedMoney = Number(money);

    if (!Number.isFinite(parsedMoney) || parsedMoney <= 0) {
      return res.status(400).json({
        success: false,
        message: "Money must be a positive number",
      });
    }

    // ✅ Convert to integer
    const intMoney = parseInt(parsedMoney, 10);

    const payload = {
      username: `${username}45`,
      money: intMoney,
      provider_code,
      game_code,
      game_type,
    };

    var globalPayload = payload;
    
    console.log("Launch Payload:", payload);

    // ✅ Step 3: Call new launch API
    const launchResponse = await axios.post(
      "https://crazybet99.com/getgameurl/v2",
      qs.stringify(payload),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-dstgame-key": "bb10373906ea00faa6717f10f8049c61",
        },
      },
    );

    const responseData = launchResponse.data;

    // ✅ Handle possible response shapes
    const gameUrl =
      responseData?.url ||
      responseData?.game_url ||
      responseData?.data ||
      responseData;

    if (!gameUrl) {
      return res.status(500).json({
        success: false,
        message: "No game URL received from launch API",
        error: responseData,
      });
    }

    return res.json({
      success: true,
      gameUrl,
      meta: {
        gameID,
        provider_code,
        game_code,
        game_type,
      },
    });
  } catch (error) {
    console.error("PlayGame API Error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      globalPayload,
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
