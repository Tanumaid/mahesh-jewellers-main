const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const PDFDocument = require("pdfkit");

// ⭐ Generate Order ID
const generateOrderId = () => {
  return "ORD" + Date.now() + Math.floor(Math.random() * 1000);
};

// ✅ BOOK ORDER (30% Advance)
router.post("/book", async (req, res) => {
  try {
    const { items, userEmail, userName } = req.body;

    if (!items || !items.length || !userEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Step 1: Validate stock for ALL items (just check, do NOT reduce)
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId || item.id });
      if (!product) {
        return res.status(400).json({ message: `Product ${item.name} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Only ${product.quantity} items left in stock for ${item.name}` });
      }
    }

    // Step 2: Calculate amounts
    let totalAmount = 0;
    let totalWeight = 0;
    const orderItems = [];

    for (const item of items) {
      const itemWeight = Number(item.weight) || 0;
      totalAmount += Number(item.price) * Number(item.quantity);
      totalWeight += itemWeight * Number(item.quantity);

      orderItems.push({
        productId: item.productId || item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image,
        weight: itemWeight
      });
    }

    const advanceAmount = totalAmount * 0.30;
    const remainingAmount = totalAmount * 0.70;

    // Step 3: Save Order without reducing stock
    const newOrder = new Order({
      items: orderItems,
      totalAmount,
      totalWeight,
      userEmail,
      userName: userName || "Unknown User",
      orderId: generateOrderId(),
      status: "Pending Approval",
      paymentStatus: "Advance Paid",
      advanceAmount,
      remainingAmount,
      isBooked: true
    });

    const savedOrder = await newOrder.save();
    res.json(savedOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error booking order" });
  }
});

// ✅ APPROVE ORDER (Admin)
router.put("/:id/approve", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Pending Approval") {
      return res.status(400).json({ message: `Order is already ${order.status}` });
    }

    // Reduce stock
    for (const item of order.items) {
      const result = await Product.findOneAndUpdate(
        { _id: item.productId, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity, soldCount: item.quantity } },
        { new: true }
      );

      if (!result) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name} during approval.` });
      }
    }

    order.status = "Approved";
    await order.save();

    res.json({ message: "Order approved successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error approving order" });
  }
});

// ✅ REJECT ORDER (Admin)
router.put("/:id/reject", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Pending Approval") {
      return res.status(400).json({ message: `Order is already ${order.status}` });
    }

    // Do NOT reduce stock
    order.status = "Rejected";
    await order.save();

    res.json({ message: "Order rejected successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error rejecting order" });
  }
});

// ✅ PLACE ORDER
router.post("/", async (req, res) => {
  try {
    const { items, userEmail, userName } = req.body;

    if (!items || !items.length || !userEmail) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Step 1: Validate stock for ALL items
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId || item.id });
      if (!product) {
        return res.status(400).json({ message: `Product ${item.name} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Only ${product.quantity} items left in stock for ${item.name}` });
      }
    }

    // Step 2: Calculate totalAmount and totalWeight, format items for DB
    let totalAmount = 0;
    let totalWeight = 0;
    const orderItems = [];

    for (const item of items) {
      const itemWeight = Number(item.weight) || 0;
      totalAmount += Number(item.price) * Number(item.quantity);
      totalWeight += itemWeight * Number(item.quantity);

      orderItems.push({
        productId: item.productId || item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image,
        weight: itemWeight
      });
    }

    // Step 3: Atomically reduce stock
    for (const item of orderItems) {
      // Fetch current product state for logging
      const beforeProduct = await Product.findById(item.productId);
      console.log(`[Checkout] Before update -> Product: ${item.name}, Current Qty: ${beforeProduct?.quantity}, Requested: ${item.quantity}`);

      const result = await Product.findOneAndUpdate(
        { _id: item.productId, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity, soldCount: item.quantity } },
        { new: true }
      );
      
      if (!result) {
        // Very rare race condition where stock was bought between step 1 and 3.
        return res.status(400).json({ message: `Insufficient stock for ${item.name} during checkout.` });
      }
      
      console.log(`[Checkout] After update -> Product: ${item.name}, New Qty: ${result.quantity}`);
    }

    // Step 4: Save Order
    const newOrder = new Order({
      items: orderItems,
      totalAmount,
      totalWeight,
      userEmail,
      userName: userName || "Unknown User",
      orderId: generateOrderId(),
    });

    const savedOrder = await newOrder.save();
    res.json(savedOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error placing order" });
  }
});


// ✅ GENERATE INVOICE PDF
router.get("/:orderId/invoice", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Approved") {
      return res.status(400).json({ message: "Invoice is only available after order is approved." });
    }

    const user = await User.findOne({ email: order.userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Invoice-${order.orderId}.pdf"`);
    doc.pipe(res);

    // ================= HEADER =================
    // Logo Placeholder
    doc.rect(50, 45, 60, 60).lineWidth(1).stroke("#cccccc");
    doc.fillColor("#D4AF37").fontSize(24).font("Helvetica-Bold").text("MJ", 63, 63);
    
    // Company Info (Right Aligned)
    doc.fillColor("#000000");
    doc.fontSize(20).text("MAHESH JEWELLERS", 200, 50, { align: "right" });
    doc.fontSize(10).font("Helvetica").text("123 Main Bazaar, Mumbai, Maharashtra", 200, 75, { align: "right" });
    doc.text("GSTIN: 27AAAAA0000A1Z5", 200, 90, { align: "right" });

    // Divider Line
    doc.moveTo(50, 125).lineTo(545, 125).lineWidth(1).stroke("#eeeeee");
    doc.moveDown(2);

    // ================= INVOICE DETAILS =================
    const topDetailsY = 145;

    // LEFT Column
    doc.fontSize(10).font("Helvetica-Bold").text("Invoice Details", 50, topDetailsY);
    doc.font("Helvetica").text(`Invoice ID: ${order.orderId}`, 50, topDetailsY + 15);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 50, topDetailsY + 30);
    doc.text(`Place of Supply: Maharashtra`, 50, topDetailsY + 45);

    // RIGHT Column
    const rightColX = 350;
    const maskedAadhaar = user.aadhaar ? `XXXX-XXXX-${user.aadhaar.slice(-4)}` : "N/A";
    doc.font("Helvetica-Bold").text("Bill To", rightColX, topDetailsY);
    doc.font("Helvetica").text(`Name: ${user.name}`, rightColX, topDetailsY + 15);
    doc.text(`Mobile: ${user.mobile || "N/A"}`, rightColX, topDetailsY + 30);
    doc.text(`Address: ${user.address || "N/A"}`, rightColX, topDetailsY + 45);
    doc.text(`Aadhaar No: ${maskedAadhaar}`, rightColX, topDetailsY + 60);

    doc.moveTo(50, topDetailsY + 85).lineTo(545, topDetailsY + 85).stroke("#eeeeee");

    // ================= PRODUCT TABLE =================
    const tableTop = topDetailsY + 110;
    
    // Table Header Background
    doc.rect(50, tableTop - 5, 495, 20).fill("#f7f7f7");
    doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10);
    
    doc.text("Product Name", 60, tableTop);
    doc.text("Qty", 280, tableTop, { width: 50, align: "center" });
    doc.text("Price/Item", 340, tableTop, { width: 90, align: "right" });
    doc.text("Subtotal", 440, tableTop, { width: 90, align: "right" });

    // Table Border Top & Bottom of header
    doc.moveTo(50, tableTop - 5).lineTo(545, tableTop - 5).stroke("#cccccc");
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke("#cccccc");

    let currentY = tableTop + 25;
    doc.font("Helvetica");

    order.items.forEach((item) => {
      const itemSubtotal = item.price * item.quantity;
      doc.text(item.name, 60, currentY, { width: 210 });
      doc.text(item.quantity.toString(), 280, currentY, { width: 50, align: "center" });
      doc.text(`Rs. ${item.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 340, currentY, { width: 90, align: "right" });
      doc.text(`Rs. ${itemSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 440, currentY, { width: 90, align: "right" });
      
      currentY += 20;
    });

    // Table Bottom Border
    doc.moveTo(50, currentY).lineTo(545, currentY).stroke("#cccccc");

    // ================= GST & TOTAL SECTION =================
    const totalAmount = order.totalAmount;
    const baseAmount = totalAmount / 1.03;
    const gstAmount = totalAmount - baseAmount;

    currentY += 20;
    
    // Formatting helper
    const fmt = (num) => `Rs. ${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    doc.font("Helvetica");
    
    doc.text("Subtotal (before GST):", 280, currentY, { width: 150, align: "left" });
    doc.text(fmt(baseAmount), 440, currentY, { width: 90, align: "right" });
    
    currentY += 15;
    doc.text("GST (3%):", 280, currentY, { width: 150, align: "left" });
    doc.text(fmt(gstAmount), 440, currentY, { width: 90, align: "right" });

    currentY += 15;
    // Divider above total
    doc.moveTo(280, currentY).lineTo(545, currentY).stroke("#cccccc");
    
    currentY += 10;
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Total Amount:", 280, currentY, { width: 150, align: "left" });
    doc.text(fmt(totalAmount), 440, currentY, { width: 90, align: "right" });

    currentY += 15;
    // Divider below total
    doc.moveTo(280, currentY).lineTo(545, currentY).stroke("#cccccc");

    // Advance and Remaining Breakdown
    currentY += 15;
    doc.font("Helvetica");
    doc.text("Advance Paid (30%):", 280, currentY, { width: 150, align: "left" });
    doc.text(fmt(order.advanceAmount || (totalAmount * 0.3)), 440, currentY, { width: 90, align: "right" });

    currentY += 15;
    doc.text("Remaining (Pay at Store):", 280, currentY, { width: 150, align: "left" });
    doc.text(fmt(order.remainingAmount || (totalAmount * 0.7)), 440, currentY, { width: 90, align: "right" });

    currentY += 15;
    doc.moveTo(280, currentY).lineTo(545, currentY).stroke("#cccccc");

    // ================= FOOTER =================
    doc.fontSize(10).font("Helvetica");
    const footerY = 750; // Near bottom of A4
    doc.moveTo(50, footerY - 10).lineTo(545, footerY - 10).stroke("#eeeeee");
    doc.text("Thank you for shopping with us", 50, footerY, { align: "center", width: 495 });
    doc.font("Helvetica-Bold").text("Mahesh Jewellers | Trusted Since 1995", 50, footerY + 15, { align: "center", width: 495 });

    doc.end();

  } catch (error) {
    console.error("PDF Error", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error generating invoice" });
    }
  }
});


// 🔥 SUMMARY (MOVE THIS UP)
router.get("/summary", async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount || o.price || 0),
      0
    );

    const users = new Set(orders.map(o => o.userEmail));

    const today = new Date();

    const day = orders
      .filter(o =>
        new Date(o.createdAt).toDateString() === today.toDateString()
      )
      .reduce((sum, o) => sum + Number(o.totalAmount || o.price || 0), 0);

    const month = orders
      .filter(o =>
        new Date(o.createdAt).getMonth() === today.getMonth()
      )
      .reduce((sum, o) => sum + Number(o.totalAmount || o.price || 0), 0);

    const year = orders
      .filter(o =>
        new Date(o.createdAt).getFullYear() === today.getFullYear()
      )
      .reduce((sum, o) => sum + Number(o.totalAmount || o.price || 0), 0);

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
          totalSpent: { $sum: { $cond: [ { $ifNull: ["$totalAmount", false] }, "$totalAmount", "$price" ] } },
          totalGold: { $sum: { $cond: [ { $ifNull: ["$totalWeight", false] }, "$totalWeight", "$weight" ] } },
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
          totalGold: { $sum: { $cond: [ { $ifNull: ["$totalWeight", false] }, "$totalWeight", "$weight" ] } } // lifetime gold
        }
      }
    ]);

    // 🏆 CUSTOMER OF THE YEAR (YEARLY)
    const yearData = users.map(user => {
      const yearlyGold = user.orders
        .filter(o => new Date(o.createdAt).getFullYear() === currentYear)
        .reduce((sum, o) => sum + Number(o.totalWeight || o.weight || 0), 0);

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