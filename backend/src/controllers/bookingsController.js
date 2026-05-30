const db = require("../config/db");

// POST /api/bookings  — public
async function createBooking(req, res) {
  const { name, phone, email, program, session_time, preferred_date, one_week_offer, message } = req.body;
  if (!name || !phone || !session_time)
    return res.status(400).json({ success: false, message: "Name, phone, and session time are required" });

  try {
    const [result] = await db.query(
      `INSERT INTO bookings (name, phone, email, program, session_time, preferred_date, one_week_offer, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email || null, program || null, session_time, preferred_date || null, one_week_offer ? 1 : 0, message || null]
    );
    res.status(201).json({ success: true, message: "Booking request submitted!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// GET /api/admin/bookings  — admin only
async function getAllBookings(req, res) {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    let query  = "SELECT * FROM bookings";
    const params = [];
    if (status) { query += " WHERE status = ?"; params.push(status); }
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows]  = await db.query(query, params);
    const [[{ total }]] = await db.query(
      status ? "SELECT COUNT(*) AS total FROM bookings WHERE status=?" : "SELECT COUNT(*) AS total FROM bookings",
      status ? [status] : []
    );
    res.json({ success: true, bookings: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /api/admin/bookings/:id  — admin only
async function updateBookingStatus(req, res) {
  const { status, admin_note } = req.body;
  try {
    await db.query("UPDATE bookings SET status=?, admin_note=? WHERE id=?", [status, admin_note || null, req.params.id]);
    res.json({ success: true, message: "Booking updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// DELETE /api/admin/bookings/:id  — admin only
async function deleteBooking(req, res) {
  try {
    await db.query("DELETE FROM bookings WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createBooking, getAllBookings, updateBookingStatus, deleteBooking };
