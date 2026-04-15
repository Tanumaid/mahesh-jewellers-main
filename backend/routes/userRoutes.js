const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Register
router.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: "User Registered" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (user) {
      res.json({ message: "Login Success", user });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;