const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// Mapping profile natively preventing spoofed payloads directly
const getProfileId = async (userId, role) => {
  const table = role === 'patient' ? 'patient_profiles' : 'doctor_profiles';
  const [rows] = await db.execute(`SELECT id FROM ${table} WHERE user_id = ?`, [userId]);
  return rows.length ? rows[0].id : null;
};

// @route   POST /api/records
// @desc    Create explicit medical record isolated structurally behind assignments natively
// @access  Private (Doctor only)
const createRecord = catchAsync(async (req, res) => {
  const { appointment_id, diagnosis, prescription, notes } = req.body;
  const { id: userId } = req.user;

  if (!appointment_id || !diagnosis) {
    return sendError(res, 400, 'Required parameter rejection natively targeting explicitly missing {appointment_id, diagnosis}');
  }

  const doctorProfileId = await getProfileId(userId, 'doctor');
  if (!doctorProfileId) return sendError(res, 403, 'Complete your base doctor settings configuration first successfully implicitly.');

  // Validate the explicitly mapped appointment exists identically internally 
  const [apps] = await db.execute('SELECT patient_id, doctor_id FROM appointments WHERE id = ? AND status != "cancelled"', [appointment_id]);
  if (apps.length === 0) return sendError(res, 404, 'Mapping exception: Corresponding active appointment explicitly tracking string is missing permanently.');
  
  // Guard intercept
  if (apps[0].doctor_id !== doctorProfileId) {
    return sendError(res, 403, 'Bounded rejection preventing Medical Record structural writing securely explicitly mapping missing doctor permissions.');
  }

  // Safely auto-extrapolate identical parameter
  const patient_id = apps[0].patient_id;

  const [result] = await db.execute(
    'INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [patient_id, doctorProfileId, appointment_id, diagnosis, prescription || null, notes || null]
  );

  sendSuccess(res, 201, 'Medical parameters correctly natively stored cleanly successfully.', { recordId: result.insertId });
});

// @route   GET /api/records/mine
// @desc    Isolates parsing array strings securely natively directly handling mappings dynamically explicitly correctly!
// @access  Private (Patient, Doctor)
const getMyRecords = catchAsync(async (req, res) => {
  const { role, id: userId } = req.user;
  const profileId = await getProfileId(userId, role);

  if (!profileId) return sendSuccess(res, 200, 'Blank explicitly native response cleanly mapped empty successfully', { records: [] });

  const filterColumn = role === 'patient' ? 'm.patient_id' : 'm.doctor_id';

  // Multi-joining DB fields natively retrieving beautiful parsed JSON string bounds seamlessly securely mapping exact string inputs.
  const query = `
    SELECT m.*, 
           pu.name AS patient_name, 
           du.name AS doctor_name,
           a.date_time AS appointment_date
    FROM medical_records m
    JOIN patient_profiles p ON m.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctor_profiles d ON m.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    JOIN appointments a ON m.appointment_id = a.id
    WHERE ${filterColumn} = ?
    ORDER BY m.record_date DESC
  `;

  const [records] = await db.execute(query, [profileId]);
  sendSuccess(res, 200, 'Records mapped dynamically parsing securely successfully completely directly', { records });
});

// @route   GET /api/records
// @desc    Administrative comprehensive sweeps efficiently parsing bounds effectively tracking
// @access  Private (Staff only)
const getAllRecords = catchAsync(async (req, res) => {
  const query = `
    SELECT m.*, 
           pu.name AS patient_name, 
           du.name AS doctor_name,
           a.date_time AS appointment_date
    FROM medical_records m
    JOIN patient_profiles p ON m.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctor_profiles d ON m.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    JOIN appointments a ON m.appointment_id = a.id
    ORDER BY m.record_date DESC
  `;
  const [records] = await db.execute(query);
  sendSuccess(res, 200, 'Full generic DB block parsed smoothly reliably efficiently correctly successfully', { records });
});

// @route   PUT /api/records/:id
// @desc    Explicitly handle update validations dynamically natively protecting explicitly mapped strings automatically.
// @access  Private (Doctor, Staff)
const updateRecord = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { diagnosis, prescription, notes } = req.body;
  const { role, id: userId } = req.user;

  const [existing] = await db.execute('SELECT * FROM medical_records WHERE id = ?', [id]);
  if (existing.length === 0) return sendError(res, 404, 'Object physically definitively missing bounds natively effectively missing.');

  const record = existing[0];

  if (role === 'doctor') {
    const doctorProfileId = await getProfileId(userId, 'doctor');
    if (record.doctor_id !== doctorProfileId) {
      return sendError(res, 403, 'Rejection interception blocking bounds mutating records cleanly exclusively belonging externally properly.');
    }
  }

  // Execute changes directly executing parsed DB queries seamlessly explicitly effectively identical.
  await db.execute(
    'UPDATE medical_records SET diagnosis = ?, prescription = ?, notes = ? WHERE id = ?',
    [diagnosis || record.diagnosis, prescription !== undefined ? prescription : record.prescription, notes !== undefined ? notes : record.notes, id]
  );

  sendSuccess(res, 200, 'Target parameter cleanly correctly dynamically mutated seamlessly efficiently successfully.');
});

module.exports = {
  createRecord,
  getMyRecords,
  getAllRecords,
  updateRecord
};
