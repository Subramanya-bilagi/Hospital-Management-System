const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

// Extractor function securely translating generic Token ID to internal physical mapping Profile ID
const getProfileId = async (userId, role) => {
  const table = role === 'patient' ? 'patient_profiles' : 'doctor_profiles';
  const [rows] = await db.execute(`SELECT id FROM ${table} WHERE user_id = ?`, [userId]);
  return rows.length ? rows[0].id : null;
};

// @route   POST /api/appointments
// @desc    Book an appointment
// @access  Private (Patient, Staff)
const createAppointment = catchAsync(async (req, res) => {
  let { patient_id, doctor_id, date_time, reason } = req.body;
  const { role, id: userId } = req.user;

  // 1. Map dynamic Patient identity safely
  if (role === 'patient') {
    patient_id = await getProfileId(userId, 'patient');
    if (!patient_id) return sendError(res, 403, 'Please complete your patient profile details before booking.');
  }

  if (!patient_id || !doctor_id || !date_time || !reason) {
    return sendError(res, 400, 'Please provide patient_id, doctor_id, date_time, and reason payloads.');
  }

  // 2. Linear Temporal check preventing historic writes
  if (new Date(date_time) < new Date()) {
    return sendError(res, 400, 'Appointments cannot be actively booked in the past.');
  }

  // 3. Collision protection preventing Double Booking over overlapping times
  const [clash] = await db.execute(
    'SELECT id FROM appointments WHERE doctor_id = ? AND date_time = ? AND status != "cancelled"',
    [doctor_id, date_time]
  );
  if (clash.length > 0) {
    return sendError(res, 409, 'Doctor is already booked tightly at this exact time slot.');
  }

  // 4. Ensure doctor implicitly exists prior to insertion bounds
  const [docExists] = await db.execute('SELECT id FROM doctor_profiles WHERE id = ?', [doctor_id]);
  if (docExists.length === 0) return sendError(res, 404, 'Target Doctor isolated entity not found.');

  // 5. Finalize Insertion execution natively
  const [result] = await db.execute(
    'INSERT INTO appointments (patient_id, doctor_id, date_time, reason, status) VALUES (?, ?, ?, ?, "pending")',
    [patient_id, doctor_id, date_time, reason]
  );

  sendSuccess(res, 201, 'Appointment booked seamlessly', { appointmentId: result.insertId });
});

// @route   GET /api/appointments/mine
// @desc    View assigned/owned appointments securely isolated to respective Identity
// @access  Private (Patient, Doctor)
const getMyAppointments = catchAsync(async (req, res) => {
  const { role, id: userId } = req.user;
  const profileId = await getProfileId(userId, role);

  if (!profileId) return sendSuccess(res, 200, 'No active appointments triggered yet', { appointments: [] });

  // Map routing natively inside SQL utilizing explicit table alias strings
  const filterColumn = role === 'patient' ? 'a.patient_id' : 'a.doctor_id';

  // Multi-table internal JOIN pushing human readable Name payloads explicitly outward to React JSON responses
  const query = `
    SELECT a.*, 
           pu.name AS patient_name, 
           du.name AS doctor_name,
           d.specialization
    FROM appointments a
    JOIN patient_profiles p ON a.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctor_profiles d ON a.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    WHERE ${filterColumn} = ?
    ORDER BY a.date_time DESC
  `;

  const [appointments] = await db.execute(query, [profileId]);
  sendSuccess(res, 200, 'Internal appointments parsed', { appointments });
});

// @route   GET /api/appointments
// @desc    View all appointments administrative override
// @access  Private (Staff only)
const getAllAppointments = catchAsync(async (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT a.*, pu.name AS patient_name, du.name AS doctor_name
    FROM appointments a
    JOIN patient_profiles p ON a.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctor_profiles d ON a.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
  `;
  const queryParams = [];

  if (status) {
    const statusArray = status.split(',').map(s => s.trim());
    const placeholders = statusArray.map(() => '?').join(',');
    query += ` WHERE a.status IN (${placeholders})`;
    queryParams.push(...statusArray);
  }

  query += ` ORDER BY a.date_time DESC`;

  const [appointments] = await db.execute(query, queryParams);
  sendSuccess(res, 200, 'Full administrative appointment pool parsed natively dynamically', { appointments });
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment details dynamically
// @access  Private (Doctor, Staff)
const updateAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;
  const { status, date_time, reason } = req.body;

  const [record] = await db.execute('SELECT * FROM appointments WHERE id = ?', [id]);
  if (record.length === 0) return sendError(res, 404, 'Appointment not securely resolvable.');

  const appointment = record[0];

  if (role === 'doctor') {
    const doctorProfileId = await getProfileId(userId, 'doctor');
    // Lock modification exclusively behind verified ID checks
    if (appointment.doctor_id !== doctorProfileId) {
      return sendError(res, 403, 'Authorization bounce: You may only modify explicitly targeted appointments mapped to your profile.');
    }
    if (!status || !['confirmed', 'cancelled'].includes(status)) {
      return sendError(res, 400, 'Doctors can only set status to confirmed or cancelled.');
    }

    await db.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    return sendSuccess(res, 200, 'Doctor appointment status verified implicitly updated');
  }

  // Admin/Staff logic executes unchained modification passes dynamically
  if (role === 'staff' || role === 'admin') {
    const newStatus = status || appointment.status;
    const newDateTime = date_time || appointment.date_time;
    const newReason = reason || appointment.reason;

    if (newStatus && !['pending', 'confirmed', 'completed', 'cancelled'].includes(newStatus)) {
      return sendError(res, 400, 'Invalid status. Must be pending, confirmed, completed, or cancelled.');
    }

    await db.execute(
      'UPDATE appointments SET status = ?, date_time = ?, reason = ? WHERE id = ?',
      [newStatus, newDateTime, newReason, id]
    );
    return sendSuccess(res, 200, 'Staff override manipulation processed');
  }

  sendError(res, 403, 'Unknown configuration intercept flag');
});

// @route   DELETE /api/appointments/:id
// @desc    Delete/Cancel explicit appointment paths
// @access  Private (Patient, Staff)
const deleteAppointment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  const [record] = await db.execute('SELECT * FROM appointments WHERE id = ?', [id]);
  if (record.length === 0) return sendError(res, 404, 'Pointer record natively broken / not found.');

  if (role === 'patient') {
    const patientProfileId = await getProfileId(userId, 'patient');
    if (record[0].patient_id !== patientProfileId) {
      return sendError(res, 403, 'You explicitly may only cancel natively parsed appointments linked to your token id.');
    }
    // Block modifications of passed transactions intelligently
    if (record[0].status === 'completed' || record[0].status === 'cancelled') {
      return sendError(res, 400, 'Transactions actively marked completed/cancelled actively resist further modification.');
    }
    await db.execute('UPDATE appointments SET status = "cancelled" WHERE id = ?', [id]);
    return sendSuccess(res, 200, 'Appointment gracefully cancelled.');
  }

  // Forceful override
  if (role === 'staff' || role === 'admin') {
    await db.execute('DELETE FROM appointments WHERE id = ?', [id]);
    return sendSuccess(res, 200, 'Forceful physical entity erasure complete.');
  }

  sendError(res, 403, 'RBAC fallback rejection natively triggered.');
});

module.exports = {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointment,
  deleteAppointment
};
