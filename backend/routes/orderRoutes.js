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
      let user = null;
      if (order.orderType === "POS") {
        user = order.temporaryCustomerData;
      } else {
        user = await User.findOne({ email: order.userEmail });
      }

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
      const logoPath = path.join(__dirname, "../../frontend/public/img/logo.jpeg");
      const pageWidth = doc.page.width;
      
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 0, 0, { width: pageWidth, height: 130 });
      }
      
      let currentY = 150;

      // ================= INVOICE DETAILS & PAYMENT =================
      doc.fontSize(10).font("Helvetica-Bold").text("Invoice Details", 50, currentY);
      doc.text("Payment Details", 350, currentY);
      
      currentY += 20;
      doc.font("Helvetica").text(`Invoice ID: ${order.orderId}`, 50, currentY);
      doc.text(`Payment Mode: ${order.paymentStatus || "N/A"}`, 350, currentY);
      
      currentY += 20;
      doc.text(`Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`, 50, currentY);
      doc.text(`Status: ${order.status || "N/A"}`, 350, currentY);
      
      currentY += 20;
      doc.text("Place of Supply: Maharashtra", 50, currentY);

      currentY += 20;
      doc.moveTo(50, currentY).lineTo(545, currentY).stroke("#eeeeee");
      
      // ================= BILL TO SECTION =================
      currentY += 20;
      doc.fontSize(11).font("Helvetica-Bold").text("Bill To", 50, currentY);
      
      currentY += 15;
      doc.font("Helvetica").text(`Name: ${user.name}`, 50, currentY);
      currentY += 15;
      doc.text(`Mobile: ${user.phoneNumber || user.mobile || "N/A"}`, 50, currentY);
      
      currentY += 15;
      // ✅ IMPORTANT: ADDRESS WRAP
      doc.text(`Address: ${user.address || "N/A"}`, 50, currentY, {
        width: 250,
        align: "left"
      });
      
      // ✅ MOVE Y AFTER ADDRESS PROPERLY
      currentY = doc.y + 10;
      
      const maskedAadhaar = user.aadhaarNumber || user.aadhaar ? `XXXX-XXXX-${(user.aadhaarNumber || user.aadhaar).slice(-4)}` : "N/A";
      doc.text(`Aadhaar No: ${maskedAadhaar}`, 50, currentY);
      
      currentY += 20;
      doc.moveTo(50, currentY).lineTo(545, currentY).stroke("#eeeeee");

      // ================= PRODUCT TABLE =================
      currentY += 15;
      const tableTop = currentY;
      doc.rect(50, tableTop - 5, 495, 20).fill("#f7f7f7");
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10);
      doc.text("Product Name", 60, tableTop);
      doc.text("Qty", 280, tableTop, { width: 50, align: "center" });
      doc.text("Price/Item", 340, tableTop, { width: 90, align: "right" });
      doc.text("Subtotal", 440, tableTop, { width: 90, align: "right" });
      doc.moveTo(50, tableTop - 5).lineTo(545, tableTop - 5).stroke("#cccccc");
      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke("#cccccc");

      currentY = tableTop + 25;
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
      
      currentY += 15;
      doc.font("Helvetica-Oblique").fontSize(9).text("GST calculated as per jewellery standard rate (3%)", 50, currentY);

      // ================= GOLD / SILVER EXCHANGE =================
      if (order.oldExchange && order.oldExchange.isApplied) {
        currentY += 30;
        doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10).text("Old Exchange", 50, currentY);
        doc.font("Helvetica");
        
        currentY += 15;
        doc.text(`Metal: ${order.oldExchange.metalType || "Gold"}`, 50, currentY);
        
        currentY += 15;
        doc.text(`Amount: Rs. ${(order.oldExchange.exchangeAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 50, currentY);
        
        currentY += 15;
      }

      // ================= GST & TOTAL SECTION =================
      const totalAmount = order.totalAmount;
      const baseAmount = totalAmount / 1.03;
      const gstAmount = totalAmount - baseAmount;
      const fmt = (num) => `Rs. ${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      currentY += 20;
      
      doc.font("Helvetica").fontSize(10);
      doc.text("Subtotal (before GST):", 280, currentY, { width: 150, align: "left" });
      doc.text(fmt(baseAmount), 440, currentY, { width: 90, align: "right" });
      
      currentY += 15;
      doc.text("GST (3%):", 280, currentY, { width: 150, align: "left" });
      doc.text(fmt(gstAmount), 440, currentY, { width: 90, align: "right" });

      currentY += 15;
      doc.moveTo(280, currentY).lineTo(545, currentY).stroke("#cccccc");
      
      currentY += 10;
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Total Amount:", 280, currentY, { width: 150, align: "left" });
      doc.text(fmt(totalAmount), 440, currentY, { width: 90, align: "right" });

      currentY += 15;
      doc.font("Helvetica").fontSize(10);

      if (order.oldExchange && order.oldExchange.isApplied) {
        doc.text("Old Exchange Deduction:", 280, currentY, { width: 150, align: "left" });
        doc.text(`- ${fmt(order.oldExchange.exchangeAmount)}`, 440, currentY, { width: 90, align: "right" });
        
        currentY += 15;
        doc.moveTo(280, currentY).lineTo(545, currentY).stroke("#cccccc");
        currentY += 10;

        doc.font("Helvetica-Bold");
        const payableAmount = Math.max(0, totalAmount - order.oldExchange.exchangeAmount);
        doc.text("Final Payable Amount:", 280, currentY, { width: 150, align: "left" });
        doc.text(fmt(payableAmount), 440, currentY, { width: 90, align: "right" });
        currentY += 15;
        doc.font("Helvetica");
      }

      if (order.orderType === "POS") {
        currentY += 10;
        doc.text("Status:", 280, currentY, { width: 150, align: "left" });
        doc.fillColor("#27ae60").text("Paid in Full", 440, currentY, { width: 90, align: "right" });
        doc.fillColor("#000000"); // reset
      } else {
        const currentPayable = order.oldExchange && order.oldExchange.isApplied 
          ? Math.max(0, totalAmount - order.oldExchange.exchangeAmount) 
          : totalAmount;

        const currentAdvance = order.advanceAmount || (currentPayable * 0.3);
        const currentRemaining = order.remainingAmount || Math.max(0, currentPayable - currentAdvance);

        doc.text("Advance Paid:", 280, currentY, { width: 150, align: "left" });
        doc.text(fmt(currentAdvance), 440, currentY, { width: 90, align: "right" });

        currentY += 15;
        doc.text("Remaining (Pay at Store):", 280, currentY, { width: 150, align: "left" });
        doc.text(fmt(currentRemaining), 440, currentY, { width: 90, align: "right" });
      }

      currentY += 25;

      // ================= FOOTER =================
      doc.fontSize(10).font("Helvetica");
      const footerY = doc.page.height - 50;
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
    const { oldExchange } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Approved") {
      return res.status(400).json({ message: "Already approved" });
    }

    // Process old exchange if provided and applied
    if (oldExchange && oldExchange.isApplied) {
      const exchangeAmount = Number(oldExchange.exchangeAmount) || 0;

      if (exchangeAmount > order.totalAmount) {
        return res.status(400).json({ message: "Exchange amount cannot exceed total order amount" });
      }

      order.oldExchange = {
        isApplied: true,
        metalType: oldExchange.metalType || "Gold",
        exchangeAmount
      };

      order.remainingAmount = Math.max(0, order.totalAmount - order.advanceAmount - exchangeAmount);
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


// ✅ CREATE POS ORDER (Admin In-Store Walk-in)
router.post("/pos-order", async (req, res) => {
  try {
    const { customerName, mobile, address, items, exchange } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in POS order" });
    }

    let totalAmount = 0;
    let totalWeight = 0;

    // Fetch live rates for backend calculation
    const GoldRate = require("../models/goldRate");
    const SilverRate = require("../models/silverRate");
    const rateDoc = await GoldRate.findOne();
    const silverDoc = await SilverRate.findOne();
    const goldRates = rateDoc ? rateDoc.rates : {};
    const silverRates = silverDoc ? silverDoc.rates : {};

    const calculateBackendPrice = (product, gRates, sRates) => {
      const weight = parseFloat(product.weight || "0");
      const making = parseFloat(product.makingCharges || "0");
      const metalType =
        product.metal?.toLowerCase() ||
        (product.purity?.toLowerCase().includes("silver") ? "silver" : "gold");

      if (metalType === "silver") {
        const rawPurity = product.purity || "";
        const purityMatch = rawPurity.match(/\d+/);
        const purity = purityMatch ? purityMatch[0] : "";
        const rate = (sRates && purity && sRates[purity] !== undefined) ? Number(sRates[purity]) : 0;
        
        const silverPrice = weight * rate || 0;
        const metalGST = silverPrice * 0.03;
        const makingGST = making * 0.05;
        return silverPrice + making + metalGST + makingGST;
      } else {
        const purity = product.purity || "22K";
        const rate = gRates[purity] || 0;
        const goldPrice = weight * rate;
        const goldGST = goldPrice * 0.03;
        const makingGST = making * 0.05;
        return goldPrice + making + goldGST + makingGST;
      }
    };

    // 1. Validate & Reduce Stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      // Deduct stock
      product.quantity -= item.quantity;
      product.soldCount = (product.soldCount || 0) + item.quantity;
      await product.save();

      // Recalculate price directly from DB product and live rates!
      const recalculatedPrice = calculateBackendPrice(product, goldRates, silverRates);
      
      // Update item to use backend-verified price
      item.price = recalculatedPrice;

      totalAmount += recalculatedPrice * item.quantity;
      totalWeight += (item.weight || 0) * item.quantity;
    }

    // 2. Handle Old Exchange
    let oldExchange = { isApplied: false };
    if (exchange && exchange.amount > 0) {
      if (exchange.amount > totalAmount) {
        return res.status(400).json({ message: "Exchange amount cannot exceed total order amount" });
      }
      oldExchange = {
        isApplied: true,
        metalType: exchange.metal || "Gold",
        exchangeAmount: exchange.amount
      };
    }

    const exchangeAmount = oldExchange.isApplied ? oldExchange.exchangeAmount : 0;
    const finalAmount = Math.max(0, totalAmount - exchangeAmount);
    
    // In POS, it's a full payment system, no advance.
    const advanceAmount = finalAmount;
    const remainingAmount = 0;

    // 3. Create Order
    const orderId = `POS${Date.now()}`;
    const newOrder = new Order({
      orderId,
      userEmail: mobile + "@pos.local", // placeholder for POS walk-in
      userName: customerName || "Walk-in Customer",
      items,
      totalAmount,
      totalWeight,
      status: "Approved", // Auto-approved for POS
      paymentStatus: "Completed",
      advanceAmount,
      remainingAmount,
      isBooked: true,
      orderType: "POS",
      oldExchange
    });

    // Address isn't in Order schema? The PDF needs it. 
    // The PDF generator uses `user.address` or `user.mobile`.
    // We don't have a user record for POS, so we attach it to the order temporarily for PDF gen.
    newOrder.temporaryCustomerData = {
      name: customerName || "Walk-in Customer",
      mobile: mobile || "N/A",
      address: address || "In-Store Purchase"
    };

    // Generate Invoice
    const invoiceUrl = await generateInvoice(newOrder);
    newOrder.invoiceUrl = invoiceUrl;

    await newOrder.save();

    res.status(201).json({ message: "POS Order created successfully", order: newOrder });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error generating POS Order" });
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