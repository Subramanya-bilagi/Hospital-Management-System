const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const protect = require('../middleware/auth');

// Public Open Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Private Routes (Require Token Verification)
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

// Example role route mapping:
// const restrictTo = require('../middleware/role');
// router.get('/admin-only', protect, restrictTo('admin'), (req, res) => { res.send('Admin Data'); });

module.exports = router;
