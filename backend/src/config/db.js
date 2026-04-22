const mongoose = require("mongoose");

// This function connects the backend to the MongoDB database.
const connectDB = async () => {
  try {
    // This uses the database URL from the .env file.
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    // This prints the database error and stops the server if MongoDB is not connected.
    console.error(error);
    process.exit(1);
  }
};

// This exports the connection function so server.js can use it.
module.exports = connectDB;
