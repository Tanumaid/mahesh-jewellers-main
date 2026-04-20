const express = require("express");
const router = express.Router();
const categoriesData = require("../data/categories");

// ✅ GET ALL CATEGORIES
router.get("/", (req, res) => {
  try {
    res.json(categoriesData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

module.exports = router;
