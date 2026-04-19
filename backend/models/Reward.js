const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  type: String, // "year" or "5year"
  userEmail: String,
  totalGold: Number,
  year: Number
});

module.exports = mongoose.model("Reward", rewardSchema);