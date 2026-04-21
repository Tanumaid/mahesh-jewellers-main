const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/order");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function for order ID
const generateOrderId = () => {
  return "ORD" + Math.floor(10000 + Math.random() * 90000);
};

// ✅ STEP 1: CREATE RAZORPAY ORDER (Called when user clicks Buy Now)
router.post("/create-order", async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount) {
      return res.status(400).json({ message: "totalAmount is required" });
    }

    // Calculate 30% advance amount
    const advanceAmount = Math.round(totalAmount * 0.3);

    // Create Razorpay order (amount is in paise)
    const options = {
      amount: advanceAmount * 100,
      currency: "INR",
      receipt: `rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      advanceAmount: advanceAmount,
      totalAmount: totalAmount
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ message: "Could not create Razorpay order" });
  }
});

// ✅ STEP 2: VERIFY PAYMENT AND SAVE DB ORDER (Called after successful payment)
router.post("/verify", async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      cartItems, 
      totalAmount,
      userEmail,
      userName
    } = req.body;

    // Verify signature using Crypto
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid Payment Signature" });
    }

    // Payment is authentic -> Save order to Database
    const advanceAmount = totalAmount * 0.3;
    const remainingAmount = totalAmount * 0.7;
    
    // Format items
    const orderItems = cartItems.map(item => ({
      productId: item.productId || item.id || item._id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image,
      weight: Number(item.weight) || 0
    }));

    // Calculate total weight
    const totalWeight = orderItems.reduce((acc, item) => acc + (item.weight * item.quantity), 0);

    const newOrder = new Order({
      items: orderItems,
      totalAmount,
      advanceAmount,
      remainingAmount,
      totalWeight,
      userEmail,
      userName: userName || "Unknown User",
      orderId: generateOrderId(),
      status: "Pending Approval",       // Needs Admin approval
      paymentStatus: "Advance Paid",    // 30% paid
      isBooked: true
    });

    const savedOrder = await newOrder.save();

    res.json({
      success: true,
      message: "Payment verified and Order Saved successfully",
      order: savedOrder
    });

  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    res.status(500).json({ message: "Internal Server Error during verification" });
  }
});

module.exports = router;
