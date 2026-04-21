const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: String,

  aadhaar: {
    type: String,
    required: true,
    unique: true   // 🔥 IMPORTANT
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
  mobile: String
});

module.exports = mongoose.model("User", userSchema);