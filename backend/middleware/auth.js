const jwt = require('jsonwebtoken');
const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const { sendError } = require('../utils/responseFormatter');

const protect = catchAsync(async (req, res, next) => {
  let token;
  // 1: Check authorization headers conventionally used by Axios Frontends
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2: Fallback check to Secure HttpOnly cookies directly mounted by browser
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return sendError(res, 401, 'You are not logged in. Please provide a valid authentication token.');
  }

  // 3: Verify cryptographic integrity of token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey');
  } catch (err) {
    return sendError(res, 401, 'Invalid token or token expired! Please log in again.');
  }

  // 4: Double check user wasn't deleted while a token was active
  const [users] = await db.execute('SELECT id, role FROM users WHERE id = ?', [decoded.id]);
  const currentUser = users[0];
  
  if (!currentUser) {
    return sendError(res, 401, 'The user belonging to this token no longer exists in the system.');
  }

  // 5: Grant access and securely append acting user to request
  req.user = currentUser;
  next();
});

module.exports = protect;
