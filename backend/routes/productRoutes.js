const express = require("express");
const router = express.Router();
const Product = require("../models/product");

const getStockStatus = (quantity) => {
  if (quantity > 2) return "In Stock";
  if (quantity === 2) return "Only 2 left";
  if (quantity === 1) return "Only 1 left";
  return "Out of Stock";
};

// ✅ GET ALL PRODUCTS (With Filtering)
router.get("/", async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    const products = await Product.find(query).lean();
    const productsWithStock = products.map((p) => ({
      ...p,
      stockStatus: getStockStatus(p.quantity || 0),
    }));
    res.json(productsWithStock);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});


// ✅ ADD PRODUCT (ADMIN)
router.post("/", async (req, res) => {
  try {
    const { name, price, weight, purity, makingCharges, gst, image, category, subcategory, quantity } = req.body;

    if (!name || !weight || !purity || !makingCharges || !gst || !category || !subcategory) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = new Product({
      name,
      price,
      weight,
      purity,
      makingCharges,
      gst,
      image,
      category,
      subcategory,
      quantity: quantity || 0,
    });

    await product.save();

    res.json(product);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding product" });
  }
});


// ✅ UPDATE PRODUCT
// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});


// ✅ DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting product" });
  }
});


module.exports = router;