const mongoose = require("mongoose");

const goldRateSchema = new mongoose.Schema({
  rates: {
    "24K": { type: Number, required: true },
    "22K": { type: Number, required: true },
    "18K": { type: Number, required: true },
  },
});

module.exports = mongoose.model("GoldRate", goldRateSchema);