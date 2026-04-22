const express = require("express");
const router = express.Router();
const SilverRate = require("../models/silverRate");

// GET rates
router.get("/", async (req, res) => {
  const rate = await SilverRate.findOne();
  res.json(rate);
});

// UPDATE rates
router.put("/", async (req, res) => {
  const { rates } = req.body;

  let existing = await SilverRate.findOne();

  if (existing) {
    existing.rates = rates;
    await existing.save();
  } else {
    existing = new SilverRate({ rates });
    await existing.save();
  }

  res.json(existing);
});

module.exports = router;