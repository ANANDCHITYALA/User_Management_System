const jwt = require("jsonwebtoken");
const User = require("../models/User");

// This middleware protects routes that need a logged-in user.
exports.protect = async (req, res, next) => {
  // This variable will hold the JWT token from the request header.
  let token;

  // This reads tokens sent like: Authorization: Bearer token_here.
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // This blocks the route when no token was sent.
  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    // This verifies the token and gets the user id that was signed during login.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // This loads the logged-in user and hides the password from later code.
    req.user = await User.findById(decoded.id).select("-password");

    // This blocks deleted or missing users even if an old token still exists.
    if (!req.user || req.user.status !== "active") {
      return res.status(401).json({ message: "Account is not active" });
    }

    // This allows the request to continue to the controller.
    next();
  } catch (error) {
    // This returns an error when the token is expired or invalid.
    res.status(401).json({ message: "Token invalid" });
  }
};
