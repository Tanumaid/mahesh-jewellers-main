const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });
const User = require("./backend/models/user");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ email: "prajaljadhav123@gmail.com" });
  console.log("User:", user);
  mongoose.connection.close();
});
