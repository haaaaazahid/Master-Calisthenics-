const db         = require("../config/db");
const multer     = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          "mci/trainers",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation:  [{ width: 600, height: 600, crop: "fill", gravity: "face" }],
  },
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
  if (!name || !role)
    return res.status(400).json({ success: false, message: "Name and role required" });

  const image_url = req.file ? req.file.path : null;

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