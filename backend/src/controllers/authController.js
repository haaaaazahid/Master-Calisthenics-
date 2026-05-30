const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const db     = require("../config/db");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE email=?", [email]);
    if (!rows.length) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ success: true, token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function googleLogin(req, res) {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email   = payload.email;
    const [rows]  = await db.query("SELECT * FROM admins WHERE email=?", [email]);
    if (!rows.length) return res.status(401).json({ success: false, message: "This Google account is not authorized as a coach." });
    const admin = rows[0];
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ success: true, token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(401).json({ success: false, message: "Google login failed", error: err.message });
  }
}

async function me(req, res) {
  res.json({ success: true, admin: req.admin });
}

async function changePassword(req, res) {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ success: false, message: "Both fields required" });
  if (new_password.length < 6) return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE id=?", [req.admin.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Admin not found" });
    const match = await bcrypt.compare(current_password, rows[0].password);
    if (!match) return res.status(401).json({ success: false, message: "Current password is incorrect" });
    const hash = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE admins SET password=? WHERE id=?", [hash, req.admin.id]);
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

module.exports = { login, googleLogin, me, changePassword };