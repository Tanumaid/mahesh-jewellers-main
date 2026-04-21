const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
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

// ✅ INVOICE GENERATOR LOGIC
async function generateInvoice(order) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ email: order.userEmail });
      if (!user) return reject(new Error("User not found for invoice"));

      const invoicesDir = path.join(__dirname, "../uploads/invoices");
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `Invoice-${order.orderId}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const writeStream = fs.createWriteStream(filePath);

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      doc.pipe(writeStream);

      // ================= HEADER =================
      const logoPath = path.join(__dirname, "../uploads/logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 150, align: "left" });
      }
      doc.fillColor("#000000");
      doc.fontSize(20).text("MAHESH JEWELLERS", 200, 50, { align: "right" });
      doc.fontSize(10).font("Helvetica").text("123 Main Bazaar, Mumbai, Maharashtra", 200, 75, { align: "right" });
      doc.text("GSTIN: 27AAAAA0000A1Z5", 200, 90, { align: "right" });
      doc.moveTo(50, 125).lineTo(545, 125).lineWidth(1).stroke("#eeeeee");
      doc.moveDown(2);

      // ================= INVOICE DETAILS =================
      const topDetailsY = 145;
      doc.fontSize(10).font("Helvetica-Bold").text("Invoice Details", 50, topDetailsY);
      doc.font("Helvetica").text(`Invoice ID: ${order.orderId}`, 50, topDetailsY + 15);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 50, topDetailsY + 30);
      doc.text(`Place of Supply: Maharashtra`, 50, topDetailsY + 45);

      const rightColX = 350;
      
      // Address formatting
      const rawAddress = user.address || "N/A";
      const addressLines = rawAddress.split(",").map(part => part.trim()).filter(part => part.length > 0);

      doc.fontSize(11).font("Helvetica-Bold").text("Bill To:", rightColX, topDetailsY, { underline: true });
      doc.font("Helvetica").text(`${user.name}`, rightColX, doc.y + 5);
      doc.text(`${user.phoneNumber || user.mobile || "N/A"}`, rightColX, doc.y + 2);
      
      doc.moveDown(0.5);

      if (addressLines.length > 0) {
        addressLines.forEach((line) => {
          doc.text(line, rightColX, doc.y, {
            width: 200,
            lineGap: 3,
            align: "left"
          });
        });
      } else {
        doc.text("N/A", rightColX, doc.y, { width: 200, align: "left" });
      }

      // We dynamically calculate the next Y for Aadhaar No
      doc.moveDown(0.5);
      const maskedAadhaar = user.aadhaarNumber || user.aadhaar ? `XXXX-XXXX-${(user.aadhaarNumber || user.aadhaar).slice(-4)}` : "N/A";
      doc.text(`Aadhaar No: ${maskedAadhaar}`, rightColX, doc.y);

      // Find lowest point for divider line
      const currentY = Math.max(doc.y + 15, topDetailsY + 90);
      doc.moveTo(50, currentY).lineTo(545, currentY).stroke("#eeeeee");

      // ================= PRODUCT TABLE =================
      const tableTop = currentY + 25;
      doc.rect(50, tableTop - 5, 495, 20).fill("#f7f7f7");
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10);
      doc.text("Product Name", 60, tableTop);
      doc.text("Qty", 280, tableTop, { width: 50, align: "center" });
      doc.text("Price/Item", 340, tableTop, { width: 90, align: "right" });
      doc.text("Subtotal", 440, tableTop, { width: 90, align: "right" });
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

      doc.moveTo(50, currentY).lineTo(545, currentY).stroke("#cccccc");

      // ================= GST & TOTAL SECTION =================
      const totalAmount = order.totalAmount;
      const baseAmount = totalAmount / 1.03;
      const gstAmount = totalAmount - baseAmount;
      currentY += 20;
      const fmt = (num) => `Rs. ${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      doc.font("Helvetica");
      doc.text("Subtotal (before GST):", 280, currentY, { width: 150, align: "left" });
      doc.text(fmt(baseAmount), 440, currentY, { width: 90, align: "right" });
      
      currentY += 15;
      doc.text("GST (3%):", 280, currentY, { width: 150, align: "left" });
      doc.text(fmt(gstAmount), 440, currentY, { width: 90, align: "right" });

      currentY += 15;
      doc.moveTo(280, currentY).lineTo(545, currentY).stroke("#cccccc");
      
      currentY += 10;
      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Total Amount:", 280, currentY, { width: 150, align: "left" });
      doc.text(fmt(totalAmount), 440, currentY, { width: 90, align: "right" });

      currentY += 15;
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
      const footerY = 750;
      doc.moveTo(50, footerY - 10).lineTo(545, footerY - 10).stroke("#eeeeee");
      doc.text("Thank you for shopping with us", 50, footerY, { align: "center", width: 495 });
      doc.font("Helvetica-Bold").text("Mahesh Jewellers | Trusted Since 1995", 50, footerY + 15, { align: "center", width: 495 });

      doc.end();

      writeStream.on("finish", () => {
        resolve(`http://localhost:5000/uploads/invoices/${fileName}`);
      });
      writeStream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

// ✅ APPROVE ORDER (Admin)
router.put("/:id/approve", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Approved") {
      return res.status(400).json({ message: "Already approved" });
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

    // Generate Invoice URL
    const invoiceUrl = await generateInvoice(order);

    order.status = "Approved";
    order.invoiceUrl = invoiceUrl;
    await order.save();

    res.json({ message: "Order approved & invoice generated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error approving order" });
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