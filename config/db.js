const mongoose = require("mongoose");
const config = require("config");
const mongoURI = config.get("mongoURI");

const connectDB = async (uri = mongoURI) => {
  try {
    console.log("connect db: " + uri);
    await mongoose.connect(uri);
    console.log("MongoDB connected!!");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
// connectDB("mongodb://localhost:27017/local?retryWrites=true");
