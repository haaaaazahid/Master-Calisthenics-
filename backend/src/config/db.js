// backend/src/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // 🔴 THIS is the fix for the ₹ -> ??? bug.
  // Without an explicit charset, some MySQL hosts (Railway's default image
  // included) negotiate a connection charset that isn't utf8mb4, and MySQL
  // silently replaces multi-byte characters like ₹ with literal '?' bytes
  // on INSERT. Setting it here forces every connection in the pool to use
  // the correct 4-byte charset end to end.
  charset: 'utf8mb4',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fail fast and loud if the DB is unreachable, instead of silently hanging
pool.getConnection()
  .then((conn) => {
    console.log('✅ MySQL pool connected (charset: utf8mb4)');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
  });

module.exports = pool;

/*
 * ⚠️ IMPORTANT — this file alone will NOT un-corrupt data that has already
 * been saved as literal "???" in the database. Those question marks are now
 * the actual stored bytes, not a display issue. You need to do BOTH:
 *
 * 1. Fix the table/column charset (run this once against your DB):
 *
 *    ALTER DATABASE mci_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 *    ALTER TABLE programs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 *    -- (JSON columns like `pricing` are stored as utf8mb4 internally regardless,
 *    --  so this step mainly matters for VARCHAR/TEXT columns like `contacts.message`)
 *
 * 2. Re-import your seed data with an explicit utf8mb4 client charset,
 *    so the ₹ symbols go in correctly this time:
 *
 *    mysql -u root -p --default-character-set=utf8mb4 mci_db < database.sql
 *
 * If you're on Railway's hosted MySQL, run the ALTER statements through
 * their SQL console / connected client, then re-run the INSERT IGNORE
 * seed block from database.sql (or manually re-save affected `programs` rows
 * from the admin dashboard once step 1 is done).
 */