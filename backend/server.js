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






// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/goldrate", goldRateRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/purity", purityRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Mahesh Jewellers API Running");
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 