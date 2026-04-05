const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

const getProfileId = async (userId, role) => {
  const table = role === 'patient' ? 'patient_profiles' : 'doctor_profiles';
  const [rows] = await db.execute(`SELECT id FROM ${table} WHERE user_id = ?`, [userId]);
  return rows.length ? rows[0].id : null;
};

// @route   POST /api/billing
// @desc    Generate a new bill seamlessly extracting patient mapping dynamically 
// @access  Private (Staff only)
const generateBill = catchAsync(async (req, res) => {
  const { appointment_id, items, total_amount } = req.body;

  if (!appointment_id || !items || total_amount === undefined) {
    return sendError(res, 400, 'Missing required fields: appointment_id, items, and total_amount.');
  }

  // Validate appointment_id is a positive integer
  if (!Number.isInteger(Number(appointment_id)) || Number(appointment_id) <= 0) {
    return sendError(res, 400, 'appointment_id must be a valid positive integer.');
  }

  // Validate total_amount is a positive number
  const amount = Number(total_amount);
  if (isNaN(amount) || amount <= 0) {
    return sendError(res, 400, 'total_amount must be a valid number greater than zero.');
  }

  // Retrieve the patient and status bound to the provided appointment linearly
  const [apps] = await db.execute('SELECT patient_id, status FROM appointments WHERE id = ?', [appointment_id]);
  if (apps.length === 0) return sendError(res, 404, 'Underlying Appointment parameter completely missing from active Database');

  const appointment = apps[0];
  if (!['pending', 'confirmed'].includes(appointment.status.toLowerCase())) {
     return sendError(res, 400, `Billing strictly maps cleanly natively to 'pending' or 'confirmed' nodes. Current status: ${appointment.status}`);
  }

  const patient_id = appointment.patient_id;

  // Utilize robust JSON serialization converting frontend parameters cleanly
  const [result] = await db.execute(
    'INSERT INTO billings (patient_id, appointment_id, items, total_amount, payment_status) VALUES (?, ?, ?, ?, "unpaid")',
    [patient_id, appointment_id, JSON.stringify(items), total_amount] 
  );

  sendSuccess(res, 201, 'Bill safely deployed mapping implicitly gracefully', { billId: result.insertId });
});

// @route   GET /api/billing
// @desc    Administrative comprehensive logs natively tracking strings 
// @access  Private (Staff only)
const getAllBills = catchAsync(async (req, res) => {
  const query = `
    SELECT b.*, pu.name AS patient_name, a.date_time AS appointment_date 
    FROM billings b
    JOIN patient_profiles p ON b.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN appointments a ON b.appointment_id = a.id
    ORDER BY b.generated_date DESC
  `;
  const [bills] = await db.execute(query);
  sendSuccess(res, 200, 'Complete structural Billing arrays fully retrieved', { bills });
});

// @route   GET /api/billing/mine
// @desc    Patient-isolated explicit structural checks natively protected
// @access  Private (Patient only)
const getMyBills = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const profileId = await getProfileId(userId, 'patient');

  if (!profileId) return sendSuccess(res, 200, 'Zero isolated entities parsed dynamically correctly', { bills: [] });

  const query = `
    SELECT b.*, pu.name AS patient_name, a.date_time AS appointment_date 
    FROM billings b
    JOIN patient_profiles p ON b.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN appointments a ON b.appointment_id = a.id
    WHERE b.patient_id = ?
    ORDER BY b.generated_date DESC
  `;
  const [bills] = await db.execute(query, [profileId]);
  sendSuccess(res, 200, 'Isolated patient explicitly bound objects fetched', { bills });
});

// @route   PUT /api/billing/:id/status
// @desc    Targeted Payment Enum modifier explicitly ignoring overall array modification 
// @access  Private (Staff only)
const updatePaymentStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;

  // Strict enforcement inherently matching MySQL Schema configurations identical directly automatically natively 
  if (!payment_status || !['paid', 'unpaid'].includes(payment_status.toLowerCase())) {
    return sendError(res, 400, 'Status violation explicitly requires [paid, unpaid] strings only.');
  }

  const [existing] = await db.execute('SELECT id FROM billings WHERE id = ?', [id]);
  if (existing.length === 0) return sendError(res, 404, 'Bill physically definitively untraceable.');

  await db.execute('UPDATE billings SET payment_status = ? WHERE id = ?', [payment_status.toLowerCase(), id]);
  sendSuccess(res, 200, 'MySQL Transaction natively cleanly processed status accurately dynamically explicitly.');
});

// @route   GET /api/billing/:id
// @desc    Get singular explicit billing target cleanly natively securely
// @access  Private 
const getBillById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT b.*, pu.name AS patient_name, a.date_time AS appointment_date 
    FROM billings b
    JOIN patient_profiles p ON b.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN appointments a ON b.appointment_id = a.id
    WHERE b.id = ?
  `;
  const [bills] = await db.execute(query, [id]);

  if (bills.length === 0) return sendError(res, 404, 'Bill natively structurally missing entirely.');

  const bill = bills[0];

  sendSuccess(res, 200, 'Standalone Explicit output seamlessly verified natively.', { bill });
});

// @route   POST /api/billing/:id/pay
// @desc    Process atomic transaction mapping structurally cleanly locally securely
// @access  Private (Patient specifically mapping internal boundaries uniquely natively)
const payBill = catchAsync(async (req, res) => {
  const { id } = req.params;

  const [existingBills] = await db.execute('SELECT * FROM billings WHERE id = ?', [id]);
  if (existingBills.length === 0) return sendError(res, 404, 'Targeted pointer mechanically definitively natively broken/missing.');

  const bill = existingBills[0];

  if (bill.payment_status === 'paid') {
     return sendError(res, 400, 'Redundant explicit processing natively halted explicitly.');
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute('UPDATE billings SET payment_status = "paid" WHERE id = ?', [id]);
    await connection.execute('UPDATE appointments SET status = "completed" WHERE id = ?', [bill.appointment_id]);

    await connection.commit();
    sendSuccess(res, 200, 'Sequence exclusively systematically natively properly completed safely successfully.', {});
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

module.exports = {
  generateBill,
  getAllBills,
  getMyBills,
  updatePaymentStatus,
  getBillById,
  payBill
};
