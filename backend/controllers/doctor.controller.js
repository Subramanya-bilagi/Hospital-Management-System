const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// Helper: ensure doctor profile exists (fallback auto-create)
const ensureDoctorProfile = async (userId) => {
  const [rows] = await db.execute('SELECT id FROM doctor_profiles WHERE user_id = ?', [userId]);
  if (rows.length === 0) {
    await db.execute(
      'INSERT INTO doctor_profiles (user_id, specialization, department) VALUES (?, ?, ?)',
      [userId, 'General', 'General']
    );
  }
};

// @route   GET /api/doctors/me
// @desc    Get logged-in doctor profile (auto-creates if missing)
// @access  Private (Doctor only)
const getMe = catchAsync(async (req, res) => {
  const userId = req.user.id;

  // Fallback: auto-create profile if it doesn't exist
  await ensureDoctorProfile(userId);

  const [rows] = await db.execute(`
    SELECT u.id, u.name, u.email, u.role, d.id AS profile_id,
           d.specialization, d.department, d.contact_number, d.availability
    FROM users u
    LEFT JOIN doctor_profiles d ON u.id = d.user_id
    WHERE u.id = ?
  `, [userId]);

  if (rows.length === 0) {
    return sendError(res, 404, 'User not found.');
  }

  sendSuccess(res, 200, 'Doctor profile retrieved', { profile: rows[0] });
});

// @route   GET /api/doctors
// @desc    List all doctors (for booking dropdowns)
// @access  Private (any authenticated user)
const listAll = catchAsync(async (req, res) => {
  const [doctors] = await db.execute(`
    SELECT d.id, u.name, d.specialization, d.department, d.availability
    FROM doctor_profiles d
    JOIN users u ON d.user_id = u.id
    ORDER BY u.name ASC
  `);
  sendSuccess(res, 200, 'Doctors list retrieved', { doctors });
});

// @route   PUT /api/doctors/me
// @desc    Update doctor profile (auto-creates if missing via UPSERT)
// @access  Private (Doctor only)
const updateMe = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { specialization, department, contact_number, availability } = req.body;

  if (!specialization || !department || !contact_number) {
    return sendError(res, 400, 'Please provide: specialization, department, contact_number.');
  }

  await db.execute(`
    INSERT INTO doctor_profiles (user_id, specialization, department, contact_number, availability)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      specialization=VALUES(specialization),
      department=VALUES(department),
      contact_number=VALUES(contact_number),
      availability=VALUES(availability)
  `, [userId, specialization, department, contact_number, availability || null]);

  sendSuccess(res, 200, 'Doctor profile updated successfully');
});

module.exports = {
  getMe,
  updateMe,
  listAll
};
