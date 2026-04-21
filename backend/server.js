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

// In-memory OTP store (phone -> { otp, expiresAt })
const otpStore = {};

// Send OTP Route
app.post("/api/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 5-minute expiry
  otpStore[phone] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes in milliseconds
  };

  // Clean up after 5 minutes
  setTimeout(() => {
    if (otpStore[phone] && otpStore[phone].otp === otp) {
      delete otpStore[phone];
    }
  }, 5 * 60 * 1000);

  // Send OTP via Fast2SMS
  try {
    const url = new URL("https://www.fast2sms.com/dev/bulkV2");
    url.searchParams.append("authorization", process.env.FAST2SMS_API_KEY || "");
    url.searchParams.append("variables_values", otp);
    url.searchParams.append("route", "otp");
    url.searchParams.append("numbers", phone);

    const response = await fetch(url, { 
      method: "GET", 
      headers: { "cache-control": "no-cache" } 
    });
    
    const data = await response.json();

    if (data.return === true) {
      // For development, we still return the OTP in the JSON response, but in production, you should remove it.
      return res.json({ success: true, message: "OTP sent successfully via SMS", otp }); 
    } else {
      console.error("Fast2SMS Error:", data);
      return res.status(500).json({ success: false, message: "Failed to send OTP via SMS", details: data.message });
    }
  } catch (error) {
    console.error("Error connecting to Fast2SMS:", error);
    return res.status(500).json({ success: false, message: "Error connecting to SMS provider", error: error.message });
  }
});

// Verify OTP Route
app.post("/api/verify-otp", async (req, res) => {
  const { phone, otp, aadhaarNumber } = req.body;
  
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
  }

  const storedData = otpStore[phone];

  if (!storedData) {
    return res.status(400).json({ success: false, message: "OTP not found or expired" });
  }

  // Check expiry
  if (Date.now() > storedData.expiresAt) {
    delete otpStore[phone];
    return res.status(400).json({ success: false, message: "OTP has expired" });
  }

  // Match OTP
  if (storedData.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  // OTP is valid, clean up store
  delete otpStore[phone];

  try {
    let user = await User.findOne({ phoneNumber: phone });
    if (user) {
      return res.json({ success: true, message: "OTP verified successfully", user });
    }

    // Create new user
    user = new User({
      phoneNumber: phone,
      aadhaarNumber: aadhaarNumber || undefined,
      email: `${phone}@placeholder.com` // Placeholder since email is required in schema
    });
    await user.save();

    return res.json({ success: true, message: "User created and verified successfully", user });
  } catch (error) {
    console.error("Error handling user:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Mahesh Jewellers API Running");
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 