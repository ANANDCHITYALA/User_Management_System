const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// This logs a user in after checking email, password, approval status, and first-password rules.
exports.login = async (req, res) => {
  try {
    // This takes the email and password sent from the login form.
    const { email, password } = req.body;

    // This finds the user by email and also works if the email has capital letters.
    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    // This stops login when no account exists for the entered email.
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // This blocks users who signed up but are still waiting for admin approval.
    if (user.status !== "active") {
      return res.status(403).json({
        message: "Your account is waiting for admin activation.",
      });
    }

    // This compares the entered password with the saved hashed password.
    const isMatch = await bcrypt.compare(password, user.password);

    // This rejects the login if the password is wrong.
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // This stops first login for admin-created accounts until the generated password is changed.
    if (user.passwordChangeRequired) {
      return res.status(403).json({
        code: "PASSWORD_CHANGE_REQUIRED",
        message: "Please change the generated password before logging in.",
      });
    }

    // This creates the JWT token that proves the user is logged in.
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // This sends safe user data to the frontend without sending the password.
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    // This returns a server error if something unexpected breaks.
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// This creates a public signup account that must wait for admin activation.
exports.signup = async (req, res) => {
  try {
    // This takes the signup form values from the frontend.
    const { name, email, password, role } = req.body;

    // This checks the required fields before trying to save anything.
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // This only allows public signup as user or manager, never admin.
    const safeRole = role === "manager" ? "manager" : "user";

    // This checks if another account already uses the same email.
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // This hashes the password so the plain password is never stored.
    const hashed = await bcrypt.hash(password, 10);

    // This creates the account as inactive so an admin must activate it first.
    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: safeRole,
      status: "inactive",
      passwordChangeRequired: false,
    });

    // This tells the frontend that signup worked but login must wait for approval.
    res.status(201).json({ message: "Signup successful. Wait for admin approval." });
  } catch (err) {
    // This returns the exact backend error message to help debugging.
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// This lets an admin-created user replace the generated password before normal login.
exports.changeInitialPassword = async (req, res) => {
  try {
    // This gets the email, generated password, and new password from the form.
    const { email, currentPassword, newPassword } = req.body;

    // This makes sure all needed fields are present.
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Email, generated password, and new password are required" });
    }

    // This finds the account that needs its generated password replaced.
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // This prevents password setup for accounts still waiting for activation.
    if (user.status !== "active") {
      return res.status(403).json({ message: "Account must be activated by admin first" });
    }

    // This only runs for admin-created accounts that still need a new password.
    if (!user.passwordChangeRequired) {
      return res.status(400).json({ message: "Password change is not required for this account" });
    }

    // This verifies the generated password before accepting the new password.
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Generated password is incorrect" });

    // This saves the new password and marks the account ready for normal login.
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangeRequired = false;
    await user.save();

    // This tells the user they can now login normally.
    res.json({ message: "Password changed. You can login now." });
  } catch (err) {
    // This returns a server error if password setup fails unexpectedly.
    res.status(500).json({ message: err.message });
  }
};

// This resets a password from the forgot-password form.
exports.resetPassword = async (req, res) => {
  try {
    // This takes the email and new password from the forgot password form.
    const { email, password } = req.body;

    // This finds the user account by email.
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // This hashes and saves the new password.
    user.password = await bcrypt.hash(password, 10);
    user.passwordChangeRequired = false;
    await user.save();

    // This tells the frontend the reset worked.
    res.json({ message: "Password updated" });
  } catch (err) {
    // This returns the error if reset fails.
    res.status(500).json({ message: err.message });
  }
};
