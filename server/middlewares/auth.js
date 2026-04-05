const passport = require("passport");
const AppError = require("../utils/AppError");

// Thin wrappers only: Passport authenticates; services own tokens and business rules.

/**
 * Stateless JWT — Passport verifies the Bearer token and attaches req.user.
 */
function authenticateJWT(req, res, next) {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new AppError(info?.message || "Unauthorized", 401));
    }
    req.user = user;
    return next();
  })(req, res, next);
}

/**
 * After passport-local succeeds, req.user is set by Passport.
 */
function authenticateLocal(req, res, next) {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new AppError(info?.message || "Invalid credentials", 401));
    }
    req.user = user;
    return next();
  })(req, res, next);
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }
    return next();
  };
}

module.exports = {
  authenticateJWT,
  authenticateLocal,
  authorizeRoles,
};
