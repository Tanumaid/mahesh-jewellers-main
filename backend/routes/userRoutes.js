const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");

// Function to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

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
    console.log("REGISTER BODY:", req.body);
    console.log("REGISTER FILES:", req.files);
    
    const { name, email, password, aadhaar, mobile, address } = req.body;

    if (!name || !email || !password || !aadhaar || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files || !req.files.aadhaarFront || !req.files.aadhaarBack) {
      return res.status(400).json({ message: "Both Aadhaar Front and Back images are required" });
    }

    // Save filenames directly or path, user expects filename
    const aadhaarFront = req.files.aadhaarFront[0].filename;
    const aadhaarBack = req.files.aadhaarBack[0].filename;

    // ✅ CHECK EMAIL (case-insensitive)
    const existingEmail = await User.findOne({ email: new RegExp('^' + email + '$', "i") });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ CHECK AADHAAR
    const existingAadhaar = await User.findOne({ aadhaarNumber: aadhaar });
    if (existingAadhaar) {
      return res.status(400).json({ message: "Aadhaar already registered" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
      phoneNumber: mobile, // Map mobile to phoneNumber
      aadhaarNumber: aadhaar, // Map aadhaar to aadhaarNumber
      aadhaarFront, 
      aadhaarBack
    });
    
    await newUser.save();

    res.json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: generateToken(newUser._id)
    });

  } catch (error) {

    // 🔥 HANDLE DUPLICATE KEY ERROR (VERY IMPORTANT)
    if (error.code === 11000) {
      if (error.keyPattern?.aadhaarNumber) {
        return res.status(400).json({
          message: "Aadhaar already registered"
        });
      }

      if (error.keyPattern?.email) {
        return res.status(400).json({
          message: "Email already registered"
        });
      }

      if (error.keyPattern?.phoneNumber) {
        return res.status(400).json({
          message: "Mobile number already registered"
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
    console.log("👉 /api/auth/login called");
    console.log("Request body:", req.body);
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    // Find user (case-insensitive)
    const user = await User.findOne({ email: new RegExp('^' + email + '$', "i") });
    console.log("User found:", user ? user.email : "Not found");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password (if this is an old account, please register again or reset password)" });
    }

    // Return user and token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
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
router.post("/admin-login", async (req, res) => {
  try {
    console.log("👉 /api/auth/admin-login called");
    console.log("Request body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    // Find admin user
    const user = await User.findOne({ email: new RegExp('^' + email + '$', "i") });
    console.log("Admin User found:", user ? user.email : "Not found");

    if (!user) {
      return res.status(400).json({ message: "Admin not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    // Check password
    console.log("Comparing admin passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid admin password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: true,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.log("ADMIN LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ SEED ADMIN (Development utility to setup initial admin)
router.post("/seed-admin", async (req, res) => {
  try {
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      return res.json({ message: "Admin already exists", email: existingAdmin.email });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const adminUser = new User({
      name: "Admin User",
      email: adminEmail,
      password: hashedPassword,
      phoneNumber: "0000000000",
      aadhaarFront: "placeholder",
      aadhaarBack: "placeholder",
      role: "admin"
    });

    await adminUser.save();
    res.json({ message: "Admin seeded successfully!", email: adminEmail, password: "admin123" });
  } catch (error) {
    console.error("SEED ADMIN ERROR:", error);
    res.status(500).json({ message: "Error seeding admin" });
  }
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
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;