const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// Helper: ensure patient profile exists (fallback auto-create)
const ensurePatientProfile = async (userId) => {
  const [rows] = await db.execute('SELECT id FROM patient_profiles WHERE user_id = ?', [userId]);
  if (rows.length === 0) {
    await db.execute('INSERT INTO patient_profiles (user_id) VALUES (?)', [userId]);
  }
};

// @route   GET /api/patients/me
// @desc    Get logged-in patient profile (auto-creates if missing)
// @access  Private (Patient only)
const getMe = catchAsync(async (req, res) => {
  const userId = req.user.id;

  // Fallback: auto-create profile if it doesn't exist
  await ensurePatientProfile(userId);

  const [rows] = await db.execute(`
    SELECT u.id, u.name, u.email, u.role, p.id AS profile_id,
           p.date_of_birth, p.gender, p.blood_group, p.contact_number, p.address
    FROM users u
    LEFT JOIN patient_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `, [userId]);

  if (rows.length === 0) {
    return sendError(res, 404, 'User not found.');
  }

  sendSuccess(res, 200, 'Patient profile retrieved', { profile: rows[0] });
});

// @route   PUT /api/patients/me
// @desc    Update patient profile (auto-creates if missing via UPSERT)
// @access  Private (Patient only)
const updateMe = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { date_of_birth, gender, blood_group, contact_number, address } = req.body;

  if (!date_of_birth || !gender || !contact_number) {
    return sendError(res, 400, 'Please provide: date_of_birth, gender, contact_number.');
  }

  await db.execute(`
    INSERT INTO patient_profiles (user_id, date_of_birth, gender, blood_group, contact_number, address)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      date_of_birth=VALUES(date_of_birth),
      gender=VALUES(gender),
      blood_group=VALUES(blood_group),
      contact_number=VALUES(contact_number),
      address=VALUES(address)
  `, [userId, date_of_birth, gender, blood_group || null, contact_number, address || null]);

  sendSuccess(res, 200, 'Patient profile updated successfully');
});

const getAllPatients = catchAsync(async (req, res) => {
  const [rows] = await db.execute(`
    SELECT p.id as profile_id, u.name, u.email
    FROM patient_profiles p
    JOIN users u ON p.user_id = u.id
    ORDER BY u.name ASC
  `);
  sendSuccess(res, 200, 'Patients retrieved', { patients: rows });
});

module.exports = {
  getMe,
  updateMe,
  getAllPatients
};
