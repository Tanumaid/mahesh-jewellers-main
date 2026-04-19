const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },

  // ✅ FIX: Store price as Number (VERY IMPORTANT)
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
    index: true, // ✅ faster queries
  },

  userName: {
  type: String,
  required: true,
},

  // ✅ FIX: Store weight as Number (grams)
  weight: {
    type: Number,
    required: true,
  },

  orderId: {
    type: String,
    required: true,
    unique: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

}, {
  timestamps: true // ✅ adds createdAt & updatedAt automatically
});


// ✅ INDEXES (for performance)
orderSchema.index({ userEmail: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);