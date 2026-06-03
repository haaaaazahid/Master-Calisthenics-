const db = require("../config/db");

// ─── Contact ──────────────────────────────────────────────────────────────────

// POST /api/contact  — public
async function submitContact(req, res) {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: "Name, email, and message required" });

  try {
    await db.query(
      "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)",
      [name, email, phone || null, message]
    );
    res.status(201).json({ success: true, message: "Message sent! We will get back to you soon." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/admin/contacts  — admin
async function getAllContacts(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM contacts ORDER BY created_at DESC");
    res.json({ success: true, contacts: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /api/admin/contacts/:id/read  — admin
async function markRead(req, res) {
  try {
    await db.query("UPDATE contacts SET is_read=1 WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// DELETE /api/admin/contacts/:id  — admin
async function deleteContact(req, res) {
  try {
    await db.query("DELETE FROM contacts WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Programs ─────────────────────────────────────────────────────────────────

// GET /api/programs  — public
async function getPrograms(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM programs WHERE active=1 ORDER BY sort_order ASC");
    res.json({ success: true, programs: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// PUT /api/admin/programs/:id  — admin (update pricing/features)
async function updateProgram(req, res) {
  const { title, subtitle, features, pricing, is_featured, active } = req.body;
  try {
    await db.query(
      "UPDATE programs SET title=?, subtitle=?, features=?, pricing=?, is_featured=?, active=? WHERE id=?",
      [title, subtitle, JSON.stringify(features), JSON.stringify(pricing), is_featured ? 1 : 0, active ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: "Program updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

// GET /api/admin/dashboard  — admin
async function getDashboard(req, res) {
  try {
    const [[{ total_bookings }]]       = await db.query("SELECT COUNT(*) AS total_bookings FROM bookings");
    const [[{ pending_bookings }]]     = await db.query("SELECT COUNT(*) AS pending_bookings FROM bookings WHERE status='pending'");
    const [[{ confirmed_bookings }]]   = await db.query("SELECT COUNT(*) AS confirmed_bookings FROM bookings WHERE status='confirmed'");
    const [[{ total_reviews }]]        = await db.query("SELECT COUNT(*) AS total_reviews FROM reviews");
    const [[{ pending_reviews }]] = await db.query("SELECT COUNT(*) AS pending_reviews FROM reviews WHERE approved=0");    const [[{ total_contacts }]]       = await db.query("SELECT COUNT(*) AS total_contacts FROM contacts");
    const [[{ unread_contacts }]]      = await db.query("SELECT COUNT(*) AS unread_contacts FROM contacts WHERE is_read=0");
    const [[{ total_posts }]]          = await db.query("SELECT COUNT(*) AS total_posts FROM posts");

    const [recent_bookings] = await db.query(
      "SELECT id, name, phone, program, session_time, status, created_at FROM bookings ORDER BY created_at DESC LIMIT 5"
    );
    const [recent_contacts] = await db.query(
      "SELECT id, name, email, message, is_read, created_at FROM contacts ORDER BY created_at DESC LIMIT 5"
    );

    res.json({
      success: true,
      stats: {
        total_bookings, pending_bookings, confirmed_bookings,
        total_reviews, pending_reviews,
        total_contacts, unread_contacts,
        total_posts,
      },
      recent_bookings,
      recent_contacts,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  submitContact, getAllContacts, markRead, deleteContact,
  getPrograms, updateProgram,
  getDashboard,
};
