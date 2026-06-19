const db         = require("../config/db");
const multer     = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { sendPostNotification } = require("./subscriberController");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         "mci/posts",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// PUBLIC: only published posts
async function getPosts(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC LIMIT 20"
    );
    res.json({ success: true, posts: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

// ADMIN: ALL posts, published or not
async function getAllPosts(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );
    res.json({ success: true, posts: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function createPost(req, res) {
  const { author, title, content, post_type, video_url } = req.body;
  if (!title || !content)
    return res.status(400).json({ success: false, message: "Title and content required" });

  const image_url = req.file ? req.file.path : req.body.image_url || null;

  try {
    const [result] = await db.query(
      "INSERT INTO posts (author, title, content, post_type, image_url, video_url) VALUES (?, ?, ?, ?, ?, ?)",
      [author || "Admin", title, content, post_type || "announcement", image_url, video_url || null]
    );
    sendPostNotification({ title, content, image_url });
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

module.exports = { getPosts, getAllPosts, createPost, deletePost, togglePost, likePost, upload };