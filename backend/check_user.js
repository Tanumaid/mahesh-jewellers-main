const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/user");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ email: new RegExp('^prajaljadhav123@gmail.com$', "i") });
  console.log("User:", user);
  mongoose.connection.close();
});
