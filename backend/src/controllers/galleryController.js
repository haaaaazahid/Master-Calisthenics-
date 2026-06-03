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
    folder:          "mci/gallery",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation:  [{ width: 1200, crop: "limit" }],
  },
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

async function getFolders(req, res) {
  try {
    const [folders] = await db.query("SELECT * FROM gallery_folders ORDER BY created_at ASC");
    const [photos]  = await db.query("SELECT * FROM gallery_photos ORDER BY created_at DESC");
    const result = folders.map(f => ({
      ...f,
      photos: photos.filter(p => p.folder_id === f.id),
    }));
    res.json({ success: true, folders: result });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function createFolder(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Folder name required" });
  try {
    const [result] = await db.query("INSERT INTO gallery_folders (name) VALUES (?)", [name]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function deleteFolder(req, res) {
  try {
    await db.query("DELETE FROM gallery_folders WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function uploadPhoto(req, res) {
  const { folder_id, caption } = req.body;
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

  const image_url = req.file.path;

  try {
    const [result] = await db.query(
      "INSERT INTO gallery_photos (folder_id, image_url, caption) VALUES (?, ?, ?)",
      [folder_id, image_url, caption || null]
    );
    res.status(201).json({ success: true, id: result.insertId, image_url });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function deletePhoto(req, res) {
  try {
    await db.query("DELETE FROM gallery_photos WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

module.exports = { getFolders, createFolder, deleteFolder, uploadPhoto, deletePhoto, upload };