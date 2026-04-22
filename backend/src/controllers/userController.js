const User = require("../models/User");
const bcrypt = require("bcryptjs");

// This creates a random password for accounts made by an admin.
const generatePassword = () => {
  // This uses simple safe characters so the generated password is easy to type.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";

  // This starts with an empty password and fills it one character at a time.
  let password = "";

  // This makes a 12 character password.
  for (let i = 0; i < 12; i += 1) {
    // This picks a random character from the allowed character list.
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // This returns the generated password to the controller.
  return password;
};

// This gets users for the admin or manager page with pagination and filters.
exports.getUsers = async (req, res) => {
  try {
    // This reads filter values from the URL query string.
    const { page = 1, limit = 10, role, status, search } = req.query;

    // This query object becomes the MongoDB search condition.
    const query = {};

    // This lets the role dropdown filter users by role.
    if (role) query.role = role;

    // This lets the status dropdown show active or inactive accounts.
    if (status) query.status = status;

    // This lets the search box match a name or email.
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // This makes sure managers only see normal user accounts in the manage users page.
    if (req.user.role === "manager") {
      query.role = "user";
    }

    // This fetches the matching users and hides password fields from the response.
    const users = await User.find(query)
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // This counts matching users so the frontend can show pages.
    const total = await User.countDocuments(query);

    // This sends the list and pagination information back to the frontend.
    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (error) {
    // This returns the server error if the user list cannot be loaded.
    res.status(500).json({ message: error.message });
  }
};

// This gets one user by id for admin or manager actions.
exports.getUser = async (req, res) => {
  try {
    // This finds the requested user and hides the password.
    const user = await User.findById(req.params.id).select("-password -__v");

    // This returns a clear error if the id does not exist.
    if (!user) return res.status(404).json({ message: "User not found" });

    // This stops managers from opening anything except normal user records.
    if (req.user.role === "manager" && user.role !== "user") {
      return res.status(403).json({ message: "Managers can view user data only" });
    }

    // This sends the user to the frontend.
    res.json(user);
  } catch (error) {
    // This returns the server error if the user cannot be loaded.
    res.status(500).json({ message: error.message });
  }
};

// This creates a new account from the admin manage users page.
exports.createUser = async (req, res) => {
  try {
    // This takes only the fields that the admin should type manually.
    const { name, email, role = "user", status = "active" } = req.body;

    // This validates required fields before creating a user.
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // This allows admin-created accounts to be users or managers only.
    if (!["manager", "user"].includes(role)) {
      return res.status(400).json({ message: "Admin can create users and managers only" });
    }

    // This checks if another account already has the email.
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // This generates the first password instead of asking the admin to type one.
    const generatedPassword = generatePassword();

    // This hashes the generated password before saving it.
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // This creates the account and marks it as needing a password change.
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      status,
      passwordChangeRequired: true,
      createdBy: req.user._id,
    });

    // This sends the generated password once so the admin can share it with the user.
    res.status(201).json({
      message: "User created. Share the generated password one time.",
      generatedPassword,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        passwordChangeRequired: user.passwordChangeRequired,
      },
    });
  } catch (error) {
    // This returns the server error if account creation fails.
    res.status(500).json({ message: error.message });
  }
};

// This updates a user while respecting admin, manager, and normal user rules.
exports.updateUser = async (req, res) => {
  try {
    // This takes editable fields from the request body.
    const { name, email, role, status, password } = req.body;

    // This finds the user being edited.
    const user = await User.findById(req.params.id);

    // This stops the update if the user id is wrong.
    if (!user) return res.status(404).json({ message: "User not found" });

    // This stops managers from editing admins or other managers.
    if (req.user.role === "manager" && user.role !== "user") {
      return res.status(403).json({ message: "Managers can modify user data only" });
    }

    // This stops managers from changing roles or passwords from the manage users page.
    if (req.user.role === "manager" && (role || password)) {
      return res.status(403).json({ message: "Managers cannot change roles or passwords" });
    }

    // This updates the name when a new name was provided.
    if (name) user.name = name.trim();

    // This updates the email after checking it is not already used by another account.
    if (email && email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) return res.status(400).json({ message: "Email already exists" });
      user.email = email.toLowerCase().trim();
    }

    // This lets only admins change roles.
    if (req.user.role === "admin" && role) {
      if (!["admin", "manager", "user"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }

    // This lets admins and managers activate or deactivate allowed users.
    if (status) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      user.status = status;
    }

    // This lets only admins directly change another user's password.
    if (req.user.role === "admin" && password) {
      user.password = await bcrypt.hash(password, 10);
      user.passwordChangeRequired = false;
    }

    // This records who made the latest update.
    user.updatedBy = req.user._id;

    // This saves the updated user.
    await user.save();

    // This sends back safe data without the password.
    const safeUser = await User.findById(user._id).select("-password -__v");
    res.json(safeUser);
  } catch (error) {
    // This returns the server error if update fails.
    res.status(500).json({ message: error.message });
  }
};

// This deactivates a user instead of permanently deleting the record.
exports.deleteUser = async (req, res) => {
  try {
    // This finds the user being deactivated.
    const user = await User.findById(req.params.id);

    // This returns a clear error when the user id is not found.
    if (!user) return res.status(404).json({ message: "User not found" });

    // This stops managers from deactivating admins or other managers.
    if (req.user.role === "manager" && user.role !== "user") {
      return res.status(403).json({ message: "Managers can deactivate user data only" });
    }

    // This marks the account inactive.
    user.status = "inactive";
    user.updatedBy = req.user._id;
    await user.save();

    // This confirms the soft delete to the frontend.
    res.json({ message: "User deactivated" });
  } catch (error) {
    // This returns the server error if deactivate fails.
    res.status(500).json({ message: error.message });
  }
};

// This returns the logged-in user's own profile.
exports.getProfile = async (req, res) => {
  // This sends the user that was attached by the auth middleware.
  res.json(req.user);
};

// This lets a logged-in user update only their own name, email, and password.
exports.updateProfile = async (req, res) => {
  try {
    // This finds the logged-in user's full database record.
    const user = await User.findById(req.user._id);

    // This stops the update if the logged-in user no longer exists.
    if (!user) return res.status(404).json({ message: "User not found" });

    // This updates the user's own name.
    if (req.body.name) user.name = req.body.name.trim();

    // This updates the user's own email after checking for duplicate emails.
    if (req.body.email && req.body.email.toLowerCase().trim() !== user.email) {
      const existing = await User.findOne({ email: req.body.email.toLowerCase().trim() });
      if (existing) return res.status(400).json({ message: "Email already exists" });
      user.email = req.body.email.toLowerCase().trim();
    }

    // This updates the user's own password when they type a new password.
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.passwordChangeRequired = false;
    }

    // This records that the user updated their own profile.
    user.updatedBy = req.user._id;

    // This saves the profile changes.
    await user.save();

    // This sends fresh safe profile data back to the frontend.
    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    // This returns the server error if profile update fails.
    res.status(500).json({ message: error.message });
  }
};
