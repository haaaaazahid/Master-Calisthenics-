const db         = require("../config/db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function subscribe(req, res) {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required" });
  try {
    await db.query("INSERT IGNORE INTO subscribers (email, name) VALUES (?, ?)", [email, name || null]);
    res.json({ success: true, message: "Subscribed successfully!" });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function getSubscribers(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM subscribers ORDER BY created_at DESC");
    res.json({ success: true, subscribers: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function unsubscribe(req, res) {
  const { email } = req.body;
  try {
    await db.query("DELETE FROM subscribers WHERE email=?", [email]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
}

async function sendPostNotification(post) {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    const [subscribers] = await db.query("SELECT email, name FROM subscribers");
    if (!subscribers.length) return;

    const emailList = subscribers.map(s => s.email);

    await transporter.sendMail({
      from: `"Master Calisthenics India" <${process.env.GMAIL_USER}>`,
      bcc: emailList,
      subject: `New Post: ${post.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0B0F19;color:#fff;border-radius:16px;overflow:hidden;">
          <div style="background:#f97316;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;">MCI</h1>
            <p style="margin:4px 0 0;color:#fff;opacity:0.9;font-size:14px;">Master Calisthenics India</p>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#f97316;margin-top:0;">${post.title}</h2>
            ${post.image_url ? `<img src="${post.image_url}" style="width:100%;border-radius:12px;margin-bottom:16px;" />` : ""}
            <p style="color:#9ca3af;line-height:1.7;">${post.content}</p>
            <a href="${FRONTEND_URL}/community" style="display:inline-block;margin-top:20px;background:#f97316;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
              View on Website
            </a>
          </div>
          <div style="padding:16px 32px;border-top:1px solid #1f2937;text-align:center;">
            <p style="color:#4b5563;font-size:12px;margin:0;">
              Master Calisthenics India, Mira Road, Mumbai<br/>
              <a href="${FRONTEND_URL}/unsubscribe" style="color:#4b5563;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `,
    });
    console.log(`Email sent to ${emailList.length} subscribers`);
  } catch (err) {
    console.error("Email error:", err.message);
  }
}

module.exports = { subscribe, getSubscribers, unsubscribe, sendPostNotification };