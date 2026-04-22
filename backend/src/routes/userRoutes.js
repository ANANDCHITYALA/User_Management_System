const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// This creates a router for all user-management URLs.
const router = express.Router();

// These profile routes stay before /:id so "profile/me" is not treated like a user id.
router.get("/profile/me", protect, getProfile);
router.put("/profile/me", protect, updateProfile);

// These routes let admins and managers see user records.
router.get("/", protect, authorizeRoles("admin", "manager"), getUsers);
router.get("/:id", protect, authorizeRoles("admin", "manager"), getUser);

// This route lets only admins create new accounts.
router.post("/", protect, authorizeRoles("admin"), createUser);

// This route lets admins fully update users and managers update allowed user fields.
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateUser);

// This route soft-deletes users, with controller rules protecting admin data.
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deleteUser);

// This exports the user router so server.js can mount it under /api/users.
module.exports = router;
