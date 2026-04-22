const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");

// This loads variables from the .env file, like MONGO_URI and JWT_SECRET.
dotenv.config();

// This creates the Express app.
const app = express();

// This allows the React frontend to call the backend API.
app.use(cors());

// This lets Express read JSON data sent in request bodies.
app.use(express.json());

// This connects auth routes under /api/auth, like /api/auth/login.
app.use("/api/auth", authRoutes);

// This connects user routes under /api/users, like /api/users/profile/me.
app.use("/api/users", userRoutes);

// This uses the port from .env or falls back to 5000.
const PORT = process.env.PORT || 5000;

// This imports the MongoDB connection function.
const connectDB = require("./src/config/db");

// This connects the backend to MongoDB before handling real work.
connectDB();

// This small route is used to check if the API server is running.
app.get("/", (req, res) => {
  res.send("API Running...");
});

// This starts the backend server.
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
