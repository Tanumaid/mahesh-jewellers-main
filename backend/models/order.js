const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },

  price: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },

  userEmail: {
    type: String,
    required: true,
  },

  orderId: {
    type: String,
    required: true,
    unique: true,   // ⭐ IMPORTANT (duplicate होणार नाही)
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);