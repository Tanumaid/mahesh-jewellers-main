const express = require("express");
const router = express.Router();
const User = require("../models/user");


// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, aadhaar } = req.body;

    if (!name || !email || !password || !aadhaar) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ CHECK EMAIL (case-insensitive)
    const existingEmail = await User.findOne({ email: new RegExp('^' + email + '$', "i") });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ CHECK AADHAAR
    const existingAadhaar = await User.findOne({ aadhaar });
    if (existingAadhaar) {
      return res.status(400).json({ message: "Aadhaar already registered" });
    }

    const newUser = new User({ ...req.body, email: email.toLowerCase() });
    await newUser.save();

    res.json({
      name: newUser.name,
      email: newUser.email,
      _id: newUser._id
    });

  } catch (error) {

    // 🔥 HANDLE DUPLICATE KEY ERROR (VERY IMPORTANT)
    if (error.code === 11000) {
      if (error.keyPattern?.aadhaar) {
        return res.status(400).json({
          message: "Aadhaar already registered"
        });
      }

      if (error.keyPattern?.email) {
        return res.status(400).json({
          message: "Email already registered"
        });
      }
    }

    console.log("REGISTER ERROR:", error);

    res.status(500).json({ message: "Server error" });
  }
});


// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    // Find user (case-insensitive)
    const user = await User.findOne({ email: new RegExp('^' + email + '$', "i") });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Return user
    res.json({
      name: user.name,
      email: user.email,
      _id: user._id
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ OPTIONAL: GET ALL USERS (for admin panel if needed)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ✅ ADMIN LOGIN
// ✅ ADMIN LOGIN (HARDCODED)
router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  if (email && email.toLowerCase() === "admin@gmail.com" && password === "admin123") {
    return res.json({
      name: "Admin",
      email: "admin@gmail.com",
      isAdmin: true
    });
  }

  res.status(400).json({ message: "Invalid admin credentials" });
});


// ✅ RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email: new RegExp('^' + email + '$', "i") });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 UPDATE PASSWORD
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;