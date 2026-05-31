const db = require("../config/db");

async function getApprovedReviews(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM reviews WHERE approved=1 ORDER BY created_at DESC"
    );
    res.json({ success: true, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function submitReview(req, res) {
  const { name, rating, review, program } = req.body;
  if (!name || !rating || !review)
    return res.status(400).json({ success: false, message: "Name, rating, and review required" });
  try {
    const [result] = await db.query(
      "INSERT INTO reviews (name, rating, review_text, program) VALUES (?, ?, ?, ?)",
      [name, rating, review, program || null]
    );
    res.status(201).json({ success: true, message: "Review submitted! Pending approval.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getAllReviews(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM reviews ORDER BY created_at DESC");
    res.json({ success: true, reviews: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function approveReview(req, res) {
  try {
    await db.query("UPDATE reviews SET approved=1 WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function rejectReview(req, res) {
  try {
    await db.query("UPDATE reviews SET approved=0 WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteReview(req, res) {
  try {
    await db.query("DELETE FROM reviews WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { submitReview, getApprovedReviews, getAllReviews, approveReview, rejectReview, deleteReview };