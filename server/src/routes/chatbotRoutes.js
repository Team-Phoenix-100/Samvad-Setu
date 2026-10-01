const express = require("express");
const router = express.Router();
const axios = require("axios");

const CHATBOT_ENGINE = process.env.CHATBOT_ENGINE_URL || "http://127.0.0.1:8001";

router.post("/message", async (req, res) => {
  try {
    const aiResponse = await axios.post(`${CHATBOT_ENGINE}/internal/ai/chatbot/message`, {
      message: req.body.message,
      user_id: req.user ? req.user._id : "anonymous"
    });
    res.json(aiResponse.data);
  } catch (error) {
    console.error("Chatbot Error:", error.message);
    res.status(500).json({ message: "Chatbot service error", error: error.message });
  }
});

module.exports = router;
