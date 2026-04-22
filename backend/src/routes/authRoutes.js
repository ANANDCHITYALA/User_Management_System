const express = require("express");
const {
  login,
  signup,
  changeInitialPassword,
  resetPassword,
} = require("../controllers/authController");

// This creates a small router just for authentication URLs.
const router = express.Router();

// This route checks credentials and returns a token when login is allowed.
router.post("/login", login);

// This route creates an inactive account that waits for admin approval.
router.post("/signup", signup);

// This route lets admin-created accounts replace the generated password first.
router.put("/change-initial-password", changeInitialPassword);

// This route updates a forgotten password.
router.put("/reset-password", resetPassword);

// This exports the auth router so server.js can mount it under /api/auth.
module.exports = router;
