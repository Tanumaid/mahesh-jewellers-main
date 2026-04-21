const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, default: "" },
      weight: { type: Number, default: 0 }
    }
  ],

  totalAmount: {
    type: Number,
    required: true,
  },

  totalWeight: {
    type: Number,
    default: 0,
  },

  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },

  userName: {
    type: String,
    required: true,
  },

  orderId: {
    type: String,
    required: true,
    unique: true,
  },

  status: {
    type: String,
    enum: ["Pending Approval", "Approved", "Rejected", "Completed"],
    default: "Pending Approval",
  },

  paymentStatus: {
    type: String,
    enum: ["Advance Paid", "Pending", "Completed"],
    default: "Advance Paid",
  },

  advanceAmount: {
    type: Number,
    default: 0,
  },

  remainingAmount: {
    type: Number,
    default: 0,
  },

  isBooked: {
    type: Boolean,
    default: true,
  }

}, {
  timestamps: true // ✅ THIS is enough
});


// ✅ INDEXES (for performance)
orderSchema.index({ userEmail: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);