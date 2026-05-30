const db = require("../config/db");

// GET /api/reviews — public (approved only)
async function getApprovedReviews(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM reviews WHERE status='approved' ORDER BY created_at DESC"
    );
    res.json({ success: true, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/reviews — public
async function submitReview(req, res) {
  const { name, rating, review, program } = req.body;
  if (!name || !rating || !review)
    return res.status(400).json({ success: false, message: "Name, rating, and review required" });
  try {
    const [result] = await db.query(
      "INSERT INTO reviews (name, rating, review, program) VALUES (?, ?, ?, ?)",
      [name, rating, review, program || null]
    );
    res.status(201).json({ success: true, message: "Review submitted! Pending approval.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/admin/reviews — admin
async function getAllReviews(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM reviews ORDER BY created_at DESC");
    res.json({ success: true, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /api/admin/reviews/:id/approve — admin
async function approveReview(req, res) {
  try {
    await db.query("UPDATE reviews SET status='approved' WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /api/admin/reviews/:id/reject — admin
async function rejectReview(req, res) {
  try {
    await db.query("UPDATE reviews SET status='rejected' WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// DELETE /api/admin/reviews/:id — admin
async function deleteReview(req, res) {
  try {
    await db.query("DELETE FROM reviews WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { submitReview, getApprovedReviews, getAllReviews, approveReview, rejectReview, deleteReview };