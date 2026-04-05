const { sendError } = require('../utils/responseFormatter');

// Use this strictly *after* the `protect` auth middleware route
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Assert user role explicitly sits within the allowed permissions array
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have sufficient permissions to perform this action.');
    }
    next();
  };
};

module.exports = restrictTo;
