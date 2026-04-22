const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ================= DB CONNECTION =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

// ================= ROUTES IMPORT =================
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const goldRateRoutes = require("./routes/goldRateRoutes");
const silverRateRoutes = require("./routes/silverRateRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const purityRoutes = require("./routes/purityRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const User = require("./models/user");

// ================= API ROUTES =================
app.use("/api/users", userRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/goldrate", goldRateRoutes);
app.use("/api/silverrate", silverRateRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/purity", purityRoutes);
app.use("/api/payment", paymentRoutes);

// ================= OTP STORE =================
const otpStore = {};

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const phone = user.phoneNumber;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    console.log(`🔐 OTP for ${phone}: ${otp}`);

    return res.json({
      success: true,
      message: "OTP sent to registered mobile",
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ================= VERIFY OTP =================
app.post("/api/verify-login-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const storedData = otpStore[phone];

    if (!storedData) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (Date.now() > storedData.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (String(storedData.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    delete otpStore[phone];

    const user = await User.findOne({ phoneNumber: phone });

    return res.json({
      success: true,
      message: "Login successful",
      user,
    });

  } catch (error) {
    console.error("❌ OTP verify error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("✅ Mahesh Jewellers API Running");
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: err.message || "Something went wrong" });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});