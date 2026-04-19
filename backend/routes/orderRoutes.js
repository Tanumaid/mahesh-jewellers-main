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
    const { productName, price, image, userEmail, userName, weight } = req.body;

    // 🔥 FIX: allow fallback name
    if (!productName || !price || !userEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new Order({
      productName,
      price: Number(price),
      image,
      userEmail,
      userName: userName || "Unknown User", // ⭐ IMPORTANT FIX
      weight: Number(weight) || 1, // ⭐ avoid 0 / undefined
      orderId: generateOrderId(),
    });

    console.log("ORDER SAVING:", newOrder);

    const savedOrder = await newOrder.save();
    res.json(savedOrder);

  } catch (error) {
    console.log("ORDER ERROR:", error);
    res.status(500).json({ message: "Error placing order" });
  }
});


// 🔥 GOLD ANALYTICS (UPDATED FOR NAME)
router.get("/analytics/top-customers", async (req, res) => {
  try {
    const now = new Date();

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);

    const orders = await Order.find();

    const yearlyMap = {};
    const fiveYearMap = {};

    orders.forEach((order) => {
      const weight = Number(order.weight || 0);
      const date = new Date(order.createdAt);

      // ✅ 1 YEAR
      if (date >= oneYearAgo) {
        yearlyMap[order.userEmail] = {
          name: order.userName || order.userEmail,
          totalGold: (yearlyMap[order.userEmail]?.totalGold || 0) + weight
        };
      }

      // ✅ 5 YEARS
      if (date >= fiveYearsAgo) {
        fiveYearMap[order.userEmail] = {
          name: order.userName || order.userEmail,
          totalGold: (fiveYearMap[order.userEmail]?.totalGold || 0) + weight
        };
      }
    });

    const topYearUser = Object.values(yearlyMap)
      .sort((a, b) => b.totalGold - a.totalGold)[0];

    const topFiveUser = Object.values(fiveYearMap)
      .sort((a, b) => b.totalGold - a.totalGold)[0];

    res.json({
      customerOfYear: topYearUser || null,
      victoryCustomer: topFiveUser || null,
    });

  } catch (error) {
    console.log("ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Error fetching analytics" });
  }
});


// 🔥 USERS WITH ORDER SUMMARY
router.get("/users-with-orders", async (req, res) => {
  try {
    const users = await Order.aggregate([
      {
        $group: {
          _id: "$userEmail",
          name: { $first: "$userName" }, // ⭐ FIXED
          totalSpent: { $sum: "$price" },
          totalGold: { $sum: "$weight" },
          orders: { $push: "$$ROOT" }
        }
      },
      { $sort: { totalGold: -1 } }
    ]);

    res.json(users);

  } catch (err) {
    console.log("USERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ 👉 Get All Orders (Admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order
      .find()
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching all orders" });
  }
});


// ✅ 👉 Get Orders by Email (KEEP LAST)
router.get("/:email", async (req, res) => {
  try {
    const orders = await Order
      .find({ userEmail: req.params.email })
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});


// ✅ 👉 Delete Order
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting order" });
  }
});

module.exports = router;