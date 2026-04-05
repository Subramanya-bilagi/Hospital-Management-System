const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const protect = require('../middleware/auth');
const restrictTo = require('../middleware/role');

// Secure router against missing tokens
router.use(protect);

// Global patient fetching logic
router.route('/')
  .get(restrictTo('staff', 'admin', 'doctor'), patientController.getAllPatients);

// Self-profile logic
router.route('/me')
  .get(restrictTo('patient'), patientController.getMe)
  .put(restrictTo('patient'), patientController.updateMe);

module.exports = router;
