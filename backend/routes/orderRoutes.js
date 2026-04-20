const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Product = require("../models/product");

// ⭐ Generate Order ID
const generateOrderId = () => {
  return "ORD" + Date.now() + Math.floor(Math.random() * 1000);
};

// ✅ PLACE ORDER
router.post("/", async (req, res) => {
  try {
    const { productName, price, image, userEmail, userName, weight, quantity } = req.body;

    if (!productName || !price || !userEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const orderQuantity = quantity ? Number(quantity) : 1;

    // Verify stock and decrement
    const product = await Product.findOne({ name: productName });
    if (product) {
      if (product.quantity < orderQuantity) {
        return res.status(400).json({ message: `Only ${product.quantity} items left in stock` });
      }
      product.quantity -= orderQuantity;
      product.soldCount = (product.soldCount || 0) + orderQuantity;
      await product.save();
    }

    const newOrder = new Order({
      productName,
      price: Number(price),
      image,
      userEmail,
      userName: userName || "Unknown User",
      weight: Number(weight) || 1,
      orderId: generateOrderId(),
    });

    const savedOrder = await newOrder.save();
    res.json(savedOrder);

  } catch (error) {
    res.status(500).json({ message: "Error placing order" });
  }
});


// 🔥 SUMMARY (MOVE THIS UP)
router.get("/summary", async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.price || 0),
      0
    );

    const users = new Set(orders.map(o => o.userEmail));

    const today = new Date();

    const day = orders
      .filter(o =>
        new Date(o.createdAt).toDateString() === today.toDateString()
      )
      .reduce((sum, o) => sum + Number(o.price || 0), 0);

    const month = orders
      .filter(o =>
        new Date(o.createdAt).getMonth() === today.getMonth()
      )
      .reduce((sum, o) => sum + Number(o.price || 0), 0);

    const year = orders
      .filter(o =>
        new Date(o.createdAt).getFullYear() === today.getFullYear()
      )
      .reduce((sum, o) => sum + Number(o.price || 0), 0);

    res.json({
      products: orders.length,
      orders: totalOrders,
      users: users.size,
      revenue: totalRevenue,
      day,
      month,
      year
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🔥 USERS WITH ORDERS
router.get("/users-with-orders", async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$userEmail",
          name: { $first: "$userName" },
          email: { $first: "$userEmail" },
          orders: { $push: "$$ROOT" },
          totalSpent: { $sum: "$price" },
          totalGold: { $sum: "$weight" },
          firstOrderDate: { $min: "$createdAt" }
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});


// ✅ GET ALL ORDERS
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all orders" });
  }
});


// ❗ KEEP THIS LAST ALWAYS
router.get("/:email", async (req, res) => {
  try {
    const orders = await Order
      .find({ userEmail: req.params.email })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});


// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order" });
  }
});


router.get("/analytics/top-customers", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const users = await Order.aggregate([
      {
        $group: {
          _id: "$userEmail",
          name: { $first: "$userName" },
          email: { $first: "$userEmail" },
          orders: { $push: "$$ROOT" },
          totalGold: { $sum: "$weight" } // lifetime gold
        }
      }
    ]);

    // 🏆 CUSTOMER OF THE YEAR (YEARLY)
    const yearData = users.map(user => {
      const yearlyGold = user.orders
        .filter(o => new Date(o.createdAt).getFullYear() === currentYear)
        .reduce((sum, o) => sum + Number(o.weight || 0), 0);

      return {
        ...user,
        yearlyGold
      };
    });

    const customerOfYear = yearData.sort(
      (a, b) => b.yearlyGold - a.yearlyGold
    )[0] || null;

    // 👑 VICTORY CUSTOMER (ALL TIME)
    const victoryCustomer = users.sort(
      (a, b) => b.totalGold - a.totalGold
    )[0] || null;

    res.json({
      customerOfYear,
      victoryCustomer
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics" });
  }
});



module.exports = router;