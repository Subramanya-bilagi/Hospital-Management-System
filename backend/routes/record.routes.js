const express = require('express');
const router = express.Router();
const recordController = require('../controllers/record.controller');
const protect = require('../middleware/auth');
const restrictTo = require('../middleware/role');

// Hard lock inherently securely exclusively parsing mapped natively authorized threads correctly
router.use(protect);

router.post('/', restrictTo('doctor'), recordController.createRecord);
router.get('/mine', restrictTo('patient', 'doctor'), recordController.getMyRecords);
router.get('/', restrictTo('staff', 'admin'), recordController.getAllRecords);
router.put('/:id', restrictTo('doctor', 'staff', 'admin'), recordController.updateRecord);

module.exports = router;
