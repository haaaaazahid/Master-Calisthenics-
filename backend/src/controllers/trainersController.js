const db     = require("../config/db");
const multer = require("multer");
const path   = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, `trainer-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

async function getTrainers(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM trainers WHERE active=1 ORDER BY sort_order ASC");
    res.json({ success: true, trainers: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function getAllTrainers(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM trainers ORDER BY sort_order ASC");
    res.json({ success: true, trainers: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function createTrainer(req, res) {
  const { name, role, bio } = req.body;
  if (!name || !role) return res.status(400).json({ success: false, message: "Name and role required" });
  const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";
  const image_url = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : null;
  try {
    const [result] = await db.query(
      "INSERT INTO trainers (name, role, bio, image_url) VALUES (?, ?, ?, ?)",
      [name, role, bio || null, image_url]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function deleteTrainer(req, res) {
  try {
    await db.query("DELETE FROM trainers WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

module.exports = { getTrainers, getAllTrainers, createTrainer, deleteTrainer, upload };