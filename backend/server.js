const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const goldRateRoutes = require("./routes/goldRateRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const purityRoutes = require("./routes/purityRoutes");
const User = require("./models/user");

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/goldrate", goldRateRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/purity", purityRoutes);

// ================= OTP STORE =================
const otpStore = {};

// ================= LOGIN (EMAIL + PASSWORD → SEND OTP) =================
app.post("/api/login", async (req, res) => {
  console.log("👉 /api/login called");
  console.log("Request body:", req.body);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      console.log("❌ Invalid credentials");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const phone = user.phoneNumber;
    console.log("✅ User found:", phone);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP
    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    console.log(`🔐 Login OTP for ${phone}: ${otp}`);

    return res.json({
      success: true,
      message: "OTP sent to registered mobile"
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ================= VERIFY LOGIN OTP =================
app.post("/api/verify-login-otp", async (req, res) => {
  console.log("👉 /api/verify-login-otp called");
  console.log("Request body:", req.body);

  const { phone, otp } = req.body;

  const storedData = otpStore[phone];

  if (!storedData) {
    console.log("❌ OTP not found");
    return res.status(400).json({ message: "OTP expired or not found" });
  }

  if (Date.now() > storedData.expiresAt) {
    delete otpStore[phone];
    console.log("❌ OTP expired");
    return res.status(400).json({ message: "OTP expired" });
  }

  if (String(storedData.otp) !== String(otp)) {
    console.log("❌ Invalid OTP");
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete otpStore[phone];
  console.log("✅ OTP verified");

  try {
    const user = await User.findOne({ phoneNumber: phone });

    return res.json({
      success: true,
      message: "Login successful",
      user
    });

  } catch (error) {
    console.error("❌ Verify error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Mahesh Jewellers API Running");
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});