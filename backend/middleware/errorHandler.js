const { sendError } = require('../utils/responseFormatter');

// 404 Not Found Handler
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Global Error Handler — catches everything that falls through
const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific known error types cleanly

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'Duplicate entry. A record with this data already exists.';
  }

  // MySQL foreign key constraint failure
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Invalid reference. The related record does not exist.';
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body.';
  }

  // Log full error only for true server errors (never expose to client)
  if (statusCode === 500) {
    console.error('🔥 Internal Server Error:', err.stack || err);
  }

  // Never expose raw stack traces or internal paths to the client
  sendError(res, statusCode, message);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
