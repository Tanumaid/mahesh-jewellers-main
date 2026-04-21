const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: String,

  aadhaarNumber: {
    type: String,
    unique: true,
    sparse: true // Allows nulls while keeping uniqueness for those who provide it
  },
  aadhaarFront: {
    type: String,
    required: true
  },
  aadhaarBack: {
    type: String,
    required: true
  },

  address: String,
  
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);