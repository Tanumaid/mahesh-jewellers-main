const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

name:String,
price:String,
weight:String,
purity:String,
makingCharges:String,
gst:String,
image:String,
category:String,
subcategory:String

});

module.exports = mongoose.model("Product",productSchema);