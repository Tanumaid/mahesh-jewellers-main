const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  productName: String,
  price: String,
  image: String,
  userEmail: String
});

module.exports = mongoose.model("Wishlist", wishlistSchema);