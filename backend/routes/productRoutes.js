const express = require("express");
const router = express.Router();
const Product = require("../models/product");


// ✅ GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});


// ✅ ADD PRODUCT (ADMIN)
router.post("/", async (req, res) => {
  try {
    const { name, price, weight, purity, makingCharges, gst, image } = req.body;

    if (!name || !weight || !purity || !makingCharges || !gst) {
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
    });

    await product.save();

    res.json(product);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding product" });
  }
});


// ✅ UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating product" });
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