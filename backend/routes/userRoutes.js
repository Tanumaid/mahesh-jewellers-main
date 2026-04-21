const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const path = require("path");

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg, .jpeg, and .pdf format allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter,
});

// Helper for multer errors
const uploadMiddleware = (req, res, next) => {
  const fields = [
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 }
  ];
  upload.fields(fields)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File too large. Max 2MB allowed per file." });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// ✅ REGISTER
router.post("/register", uploadMiddleware, async (req, res) => {
  try {
    const { name, email, password, aadhaar } = req.body;

    if (!name || !email || !password || !aadhaar) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files || !req.files.aadhaarFront || !req.files.aadhaarBack) {
      return res.status(400).json({ message: "Both Aadhaar Front and Back images are required" });
    }

    const aadhaarFront = req.files.aadhaarFront[0].path.replace(/\\/g, "/");
    const aadhaarBack = req.files.aadhaarBack[0].path.replace(/\\/g, "/");

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

    const newUser = new User({ ...req.body, aadhaarFront, aadhaarBack, email: email.toLowerCase() });
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