const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const protect = require('../middleware/auth');
const restrictTo = require('../middleware/role');

// Hard protection ensuring solely logged entities navigate this mapping module
router.use(protect);

// @route   POST /api/appointments
// Patients mapping self bookings seamlessly, Staff executing specific booking proxies
router.post('/', restrictTo('patient', 'staff', 'admin'), appointmentController.createAppointment);

// @route   GET /api/appointments/mine
// Auto-fetching identity strings securely dynamically
router.get('/mine', restrictTo('patient', 'doctor'), appointmentController.getMyAppointments);

// @route   GET /api/appointments
// Staff unchained overview tracking
router.get('/', restrictTo('staff', 'admin'), appointmentController.getAllAppointments);

// @route   PUT /api/appointments/:id
// Status modification interfaces strictly bound
router.put('/:id', restrictTo('doctor', 'staff', 'admin'), appointmentController.updateAppointment);

// @route   DELETE /api/appointments/:id
// Patient secure cancellation overrides securely alongside Administrative hard-wipes
router.delete('/:id', restrictTo('patient', 'staff', 'admin'), appointmentController.deleteAppointment);

module.exports = router;
