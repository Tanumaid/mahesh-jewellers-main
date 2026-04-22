const mongoose = require("mongoose");

const silverRateSchema = new mongoose.Schema({
  rates: {
    "999": { type: Number, required: true },
    "925": { type: Number, required: true },
    "800": { type: Number, required: true },
  },
});

module.exports = mongoose.model("SilverRate", silverRateSchema);