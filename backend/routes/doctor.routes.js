const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const protect = require('../middleware/auth');
const restrictTo = require('../middleware/role');

// All doctor routes require authentication
router.use(protect);

// Public to all authenticated users — list doctors for booking dropdowns
router.get('/', doctorController.listAll);

// Doctor-only profile routes
router.route('/me')
  .get(restrictTo('doctor'), doctorController.getMe)
  .put(restrictTo('doctor'), doctorController.updateMe);

module.exports = router;
