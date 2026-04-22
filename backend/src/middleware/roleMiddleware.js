// This middleware checks whether the logged-in user's role is allowed for a route.
exports.authorizeRoles = (...roles) => {
  // This returns the real middleware function used by Express.
  return (req, res, next) => {
    // This blocks the request if the user's role is not in the allowed list.
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    // This allows the request to continue when the role is allowed.
    next();
  };
};
