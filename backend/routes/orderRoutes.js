const express = require("express");
const router = express.Router();
const Order = require("../models/order");

// ⭐ Generate Order ID
const generateOrderId = () => {
  return "ORD" + Date.now() + Math.floor(Math.random() * 1000);
};

// ✅ 👉 Place Order
router.post("/", async (req, res) => {
  try {
    const { productName, price, image, userEmail } = req.body;

    if (!productName || !price || !userEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const orderId = generateOrderId();

    const newOrder = new Order({
      productName,
      price,
      image,
      userEmail,
      orderId,
    });

    const savedOrder = await newOrder.save();

    res.json(savedOrder);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error placing order" });
  }
});

// ✅ 👉 Get Orders by User Email (🔥 VERY IMPORTANT)
router.get("/:email", async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// ✅ 👉 Get All Orders (Admin optional)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all orders" });
  }
});

// ✅ 👉 Delete Order (optional)
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order" });
  }
});

module.exports = router;