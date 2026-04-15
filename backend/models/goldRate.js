const mongoose = require("mongoose");

const goldRateSchema = new mongoose.Schema({
  ratePerGram: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("GoldRate", goldRateSchema);