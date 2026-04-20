const express = require("express");
const router = express.Router();
const GoldRate = require("../models/goldRate");

// GET rates
router.get("/", async (req, res) => {
  const rate = await GoldRate.findOne();
  res.json(rate);
});

// UPDATE rates (single document)
router.put("/", async (req, res) => {
  const { rates } = req.body;

  let existing = await GoldRate.findOne();

  if (existing) {
    existing.rates = rates;
    await existing.save();
  } else {
    existing = new GoldRate({ rates });
    await existing.save();
  }

  res.json(existing);
});

module.exports = router;