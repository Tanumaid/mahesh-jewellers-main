const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");

// ✅ Add to wishlist
router.post("/", async (req, res) => {
  try {
    const item = new Wishlist({
      productName: req.body.productName,
      price: req.body.price,
      image: req.body.image,
      userEmail: req.body.userEmail,
    });

    await item.save();
    res.json(item);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding to wishlist" });
  }
});

// ✅ Get wishlist
router.get("/", async (req, res) => {
  const items = await Wishlist.find();
  res.json(items);
});

// ✅ Delete item
router.delete("/:id", async (req, res) => {
  await Wishlist.findByIdAndDelete(req.params.id);
  res.json({ message: "Removed" });
});

module.exports = router;