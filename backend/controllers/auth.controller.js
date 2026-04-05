const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretjwtkey', {
    expiresIn: '7d',
  });
};

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = signToken(user.id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  sendSuccess(res, statusCode, message, { token, user });
};

// @route   POST /api/auth/register
// @desc    Register a new user + auto-create their role profile
// @access  Public
const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return sendError(res, 400, 'Please provide name, email, password, and role.');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return sendError(res, 400, 'Please enter a valid email address.');
  }

  // Validate password length
  if (password.length < 6) {
    return sendError(res, 400, 'Password must be at least 6 characters.');
  }

  // Validate role
  if (!['patient', 'doctor', 'staff'].includes(role)) {
    return sendError(res, 400, 'Role must be patient, doctor, or staff.');
  }

  // Check if user exists
  const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser.length > 0) {
    return sendError(res, 400, 'Email address already registered.');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );

  const userId = result.insertId;

  // AUTO-CREATE PROFILE immediately after user creation
  // This is critical — appointments, records, and billing all reference profile IDs
  if (role === 'patient') {
    await db.execute('INSERT INTO patient_profiles (user_id) VALUES (?)', [userId]);
  } else if (role === 'doctor') {
    await db.execute(
      'INSERT INTO doctor_profiles (user_id, specialization, department) VALUES (?, ?, ?)',
      [userId, 'General', 'General']
    );
  }
  // staff doesn't need a profile table

  const user = { id: userId, name, email, role };
  sendTokenResponse(user, 201, res, 'User registered successfully');
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Please provide email and password.');
  }

  const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  const user = users[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return sendError(res, 401, 'Invalid email or password.');
  }

  sendTokenResponse(user, 200, res, 'Login successful');
});

// @route   POST /api/auth/logout
// @access  Private
const logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  sendSuccess(res, 200, 'Logged out successfully');
});

// @route   GET /api/auth/me
// @access  Private
const getMe = catchAsync(async (req, res) => {
  const [users] = await db.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);

  if (users.length === 0) {
    return sendError(res, 404, 'User no longer exists.');
  }

  sendSuccess(res, 200, 'Current user profile retrieved', { user: users[0] });
});

module.exports = {
  register,
  login,
  logout,
  getMe
};
