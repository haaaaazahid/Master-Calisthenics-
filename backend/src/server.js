require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const bcrypt   = require("bcryptjs");
const db       = require("./config/db");
const routes   = require("./routes/index");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — must be FIRST before any routes ──────────────────
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api", routes);

app.get("/", (req, res) => res.json({ message: "MCI API running ✅" }));
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

async function seedAdmin() {
  try {
    const [rows] = await db.query("SELECT id, password FROM admins LIMIT 1");
    if (rows.length && rows[0].password !== "REPLACE_ON_FIRST_RUN") return;
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "MCI@Admin2026", 10);
    await db.query(
      "INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, 'superadmin') ON DUPLICATE KEY UPDATE password=?",
      ["Super Admin", process.env.ADMIN_EMAIL || "admin@mastercalisthenicsindia.com", hash, hash]
    );
    console.log("✅ Default admin seeded");
  } catch (err) {
    console.error("Admin seed error:", err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`\n🚀 MCI Server running on http://localhost:${PORT}`);
  await seedAdmin();
});