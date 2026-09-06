const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper to generate a JWT
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      institutionName,
      companyName,
      department,
      regId,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      district,
      pinCode,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Create new user (password gets hashed automatically by the pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role,
      institutionName,
      companyName,
      department,
      regId,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      district,
      pinCode,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    // req.user is supplied by the protect middleware validating the token
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/logout", protect, async (req, res) => {
  try {
    // In a stateless JWT setup, true secure logout would require a token blacklist.
    // Here we provide the endpoint to allow the client to confirm intent,
    // and for future extensibility (like audit logging or token invalidation).
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
