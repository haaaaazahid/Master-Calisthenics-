// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ─── CORS FIX ────────────────────────────────────────────────
// 🔴 This is the fix for "No 'Access-Control-Allow-Origin' header" errors.
//
// Previously this almost certainly relied on process.env.FRONTEND_URL alone,
// which in your local .env is hardcoded to http://localhost:5173 — that
// value is NOT automatically what's set in Railway's dashboard env vars,
// so the deployed server was very likely allowing the wrong origin (or none).
//
// Fix: explicit allow-list covering both prod and local dev, checked with
// no trailing-slash mismatches, PLUS proper OPTIONS preflight handling
// (your bookings POST was failing on preflight specifically).
const allowedOrigins = [
  'https://master-calisthenics-india.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.FRONTEND_URL, // still respected if you set it on Railway too
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // allow tools like curl/Postman (no origin header) and any listed origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('🚫 Blocked CORS request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Explicitly handle preflight for every route — this is what was failing
// on your /api/bookings POST ("Response to preflight request doesn't pass
// access control check").
app.options('*', cors(corsOptions));

// ─── Body parsing ───────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check (used by Railway healthcheckPath in railway.json) ──
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'mci-backend' });
});

// ─── Mount your existing routes here ────────────────────────
// Keep using whatever you already have in routes/index.js and your
// controllers (authController, bookingsController, reviewsController,
// postsController, otherControllers) — this file only fixes the CORS/
// server-setup layer, it doesn't touch your route/controller logic.
const routes = require('./routes'); // routes/index.js
app.use('/api', routes);

// ─── Central error handler ───────────────────────────────────
// Prevents raw stack traces / CORS Error objects from leaking to the client
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MCI backend running on port ${PORT}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
});