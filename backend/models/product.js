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
subcategory:String,
quantity: { type: Number, default: 0 },
soldCount: { type: Number, default: 0 }

});

module.exports = mongoose.model("Product",productSchema);