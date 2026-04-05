const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const doctorRoutes = require('./doctor.routes');
const appointmentRoutes = require('./appointment.routes');
const recordRoutes = require('./record.routes');
const billingRoutes = require('./billing.routes');
const aiRoutes = require('./ai.routes');

// Central Route Mounts
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/records', recordRoutes);
router.use('/billing', billingRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
