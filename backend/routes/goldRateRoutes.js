const express = require("express");
const router = express.Router();
const GoldRate = require("../models/goldRate");

// Get gold rate
router.get("/", async (req, res) => {
  const rate = await GoldRate.findOne();
  console.log("Gold Rate:", rate);
  res.json(rate);
});

// Update gold rate
router.post("/", async (req, res) => {
  const { ratePerGram } = req.body;

  let rate = await GoldRate.findOne();

  if (rate) {
    rate.ratePerGram = ratePerGram;
    await rate.save();
  } else {
    rate = new GoldRate({ ratePerGram });
    await rate.save();
  }

  res.json(rate);
});

module.exports = router;