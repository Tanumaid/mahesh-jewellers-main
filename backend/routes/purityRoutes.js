const express = require("express");
const router = express.Router();
const purityConfig = require("../data/purity");

// ✅ GET ALL PURITY OPTIONS
router.get("/", (req, res) => {
  try {
    res.json(purityConfig);
  } catch (error) {
    res.status(500).json({ message: "Error fetching purity options" });
  }
});

module.exports = router;
