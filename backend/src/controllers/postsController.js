const db         = require("../config/db");
const multer     = require("multer");
const path       = require("path");
const { sendPostNotification } = require("./subscriberController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

async function getPosts(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 20");
    res.json({ success: true, posts: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function createPost(req, res) {
  const { author, title, content, post_type, video_url } = req.body;
  if (!title || !content) return res.status(400).json({ success: false, message: "Title and content required" });
  const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";
  const image_url = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : req.body.image_url || null;
  try {
    const [result] = await db.query(
      "INSERT INTO posts (author, title, content, post_type, image_url, video_url) VALUES (?, ?, ?, ?, ?, ?)",
      [author || "Admin", title, content, post_type || "announcement", image_url, video_url || null]
    );
    const post = { title, content, image_url };
    sendPostNotification(post);
    res.status(201).json({ success: true, message: "Post published", id: result.insertId });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function deletePost(req, res) {
  try {
    await db.query("DELETE FROM posts WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function togglePost(req, res) {
  try {
    await db.query("UPDATE posts SET published = NOT published WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function likePost(req, res) {
  try {
    await db.query("UPDATE posts SET likes = likes + 1 WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

module.exports = { getPosts, createPost, deletePost, togglePost, likePost, upload };