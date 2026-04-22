const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected (seed)");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const seedUser = async () => {
  try {
    await connectDB(); // ✅ wait for connection

    await User.deleteMany(); // optional clean

    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("User seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedUser();