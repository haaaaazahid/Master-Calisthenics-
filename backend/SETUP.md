# ═══════════════════════════════════════════════════════════════
#  MASTER CALISTHENICS INDIA — FULL STACK SETUP GUIDE
#  React + Vite + Tailwind + Framer Motion  +  Node.js + MySQL
# ═══════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — FOLDER STRUCTURE (what you need)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

master-calisthenics-india/
├── frontend/                ← your existing Vite project
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js       ← PASTE: frontend-api.js content here
│   │   ├── pages/
│   │   │   ├── Programs.jsx ← REPLACE with Programs.jsx
│   │   │   ├── Community.jsx← REPLACE with Community.jsx
│   │   │   ├── Contact.jsx  ← REPLACE with Contact.jsx
│   │   │   └── Admin.jsx    ← NEW FILE: paste Admin.jsx
│   │   └── App.jsx          ← ADD admin route (see below)
│   └── .env                 ← ADD: VITE_API_URL=http://localhost:5000/api
│
└── backend/                 ← NEW FOLDER (create this)
    ├── src/
    │   ├── config/db.js
    │   ├── middleware/auth.js
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── bookingsController.js
    │   │   ├── reviewsController.js
    │   │   ├── postsController.js
    │   │   └── otherControllers.js
    │   ├── routes/index.js
    │   └── server.js
    ├── database.sql
    ├── package.json
    └── .env

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — MYSQL SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option A — MySQL Workbench:
  1. Open MySQL Workbench
  2. File → Open SQL Script → select database.sql
  3. Click the ⚡ Execute button

Option B — Terminal:
  mysql -u root -p < backend/database.sql

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — BACKEND SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  cd backend

  # Install dependencies
  npm install

  # Edit .env — update your MySQL password:
  DB_PASSWORD=your_actual_mysql_password

  # Start backend (development)
  npm run dev

  # You should see:
  # 🚀 MCI Server running on http://localhost:5000
  # ✅ MySQL connected successfully
  # ✅ Default admin seeded

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — FRONTEND SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  cd frontend

  # Create .env file at root of frontend folder:
  echo "VITE_API_URL=http://localhost:5000/api" > .env

  # Add api folder:
  mkdir src/api
  # paste frontend-api.js content into src/api/api.js

  # Replace/add pages:
  # - src/pages/Programs.jsx  (replace existing)
  # - src/pages/Community.jsx (replace existing)
  # - src/pages/Contact.jsx   (replace existing)
  # - src/pages/Admin.jsx     (new file)

  # Add admin route in App.jsx:
  import Admin from "./pages/Admin";
  # Inside <Routes>:
  <Route path="/admin" element={<Admin />} />

  # Start frontend
  npm run dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — LOGIN TO ADMIN PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Open: http://localhost:5173/admin

  Email:    admin@mastercalisthenicsindia.com
  Password: MCI@Admin2026

  (Change these in backend/.env before going live!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API ENDPOINTS REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUBLIC (no login needed):
  GET  /api/programs          → get all programs
  GET  /api/reviews           → get approved reviews
  POST /api/reviews           → submit a review
  GET  /api/posts             → get community posts
  PATCH /api/posts/:id/like   → like a post
  POST /api/bookings          → book a trial
  POST /api/contact           → send a message

ADMIN (JWT token required):
  POST   /api/auth/login
  GET    /api/admin/dashboard
  GET    /api/admin/bookings
  PATCH  /api/admin/bookings/:id     → update status
  DELETE /api/admin/bookings/:id
  GET    /api/admin/reviews
  PATCH  /api/admin/reviews/:id/approve
  PATCH  /api/admin/reviews/:id/reject
  DELETE /api/admin/reviews/:id
  POST   /api/admin/posts
  DELETE /api/admin/posts/:id
  PATCH  /api/admin/posts/:id/toggle → show/hide
  GET    /api/admin/contacts
  PATCH  /api/admin/contacts/:id/read
  DELETE /api/admin/contacts/:id
  PUT    /api/admin/programs/:id     → edit pricing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT'S NEW IN THIS VERSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Programs loaded from database (editable from admin)
✅ Public review submission on Community page
✅ Admin approves/rejects reviews before publishing
✅ Trial bookings saved to MySQL
✅ Contact messages saved to MySQL
✅ Community posts created & managed by admin
✅ Admin dashboard with live stats
✅ JWT login with 7-day session
✅ All data persists across sessions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CORS error?
  → Make sure FRONTEND_URL in backend/.env matches
    your Vite dev server URL exactly (default: http://localhost:5173)

MySQL connection failed?
  → Double-check DB_PASSWORD in backend/.env
  → Make sure MySQL service is running
  → On Windows: open Services → MySQL → Start

API not found?
  → Make sure backend is running on port 5000
  → Check VITE_API_URL in frontend/.env

"Cannot find module" errors?
  → cd backend && npm install
  → cd frontend && npm install
