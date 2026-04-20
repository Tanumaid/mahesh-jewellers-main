const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
    default: "",
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

  weight: {
    type: Number,
    required: true,
  },

  orderId: {
    type: String,
    required: true,
    unique: true,
  }

}, {
  timestamps: true // ✅ THIS is enough
});


// ✅ INDEXES (for performance)
orderSchema.index({ userEmail: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);