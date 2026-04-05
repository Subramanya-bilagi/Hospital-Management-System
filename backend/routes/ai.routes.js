const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const protect = require('../middleware/auth');
const restrictTo = require('../middleware/role');

router.use(protect);

router.post('/symptom-checker', restrictTo('patient'), aiController.checkSymptoms);

module.exports = router;
