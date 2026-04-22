const mongoose = require("mongoose");

// This schema tells MongoDB what every user document should look like.
const userSchema = new mongoose.Schema(
  {
    // This stores the display name that appears in the dashboard and user table.
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // This stores the login email, and unique stops two accounts using the same email.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // This stores the hashed password, never the plain password.
    password: {
      type: String,
      required: true,
    },
    // This controls what the user is allowed to do inside the system.
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
    // This lets an admin approve, activate, deactivate, or block an account.
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // This is true for accounts created by admin until the person sets a new password.
    passwordChangeRequired: {
      type: Boolean,
      default: false,
    },
    // This remembers which logged-in user created this account.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // This remembers which logged-in user last edited this account.
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  // This automatically adds createdAt and updatedAt dates.
  { timestamps: true }
);

// This exports the User model so controllers can query and save users.
module.exports = mongoose.model("User", userSchema);
