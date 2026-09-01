const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

/* ============================================================
   AUTH
============================================================ */

const {
  login,
  googleLogin,
  me,
  changePassword,
} = require("../controllers/authController");

/* ============================================================
   BOOKINGS
============================================================ */

const {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookingsController");

/* ============================================================
   REVIEWS
============================================================ */

const {
  submitReview,
  getApprovedReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  featureReview,
  deleteReview,
} = require("../controllers/reviewsController");

/* ============================================================
   POSTS
============================================================ */

const {
  getPosts,
  getAllPosts,
  createPost,
  deletePost,
  togglePost,
  likePost,
  upload: postUpload,
} = require("../controllers/postsController");

/* ============================================================
   OTHER
   Contacts
   Programs
   Offers
   Dashboard
============================================================ */

const {
  /* Contacts */
  submitContact,
  getAllContacts,
  markRead,
  deleteContact,

  /* Programs */
  getPrograms,
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,

  /* Offers */
  getOffers,
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,

  /* Dashboard */
  getDashboard,
} = require("../controllers/otherControllers");

/* ============================================================
   TRAINERS
============================================================ */

const {
  getTrainers,
  getAllTrainers,
  createTrainer,
  deleteTrainer,
  upload: trainerUpload,
} = require("../controllers/trainersController");

/* ============================================================
   GALLERY
============================================================ */

const {
  getFolders,
  createFolder,
  deleteFolder,
  uploadPhoto,
  deletePhoto,
  upload: galleryUpload,
} = require("../controllers/galleryController");

/* ============================================================
   SUBSCRIBERS
============================================================ */

const {
  subscribe,
  getSubscribers,
  unsubscribe,
} = require("../controllers/subscriberController");

/* ============================================================
   AUTH ROUTES
============================================================ */

router.post(
  "/auth/login",
  login
);

router.post(
  "/auth/google",
  googleLogin
);

router.get(
  "/auth/me",
  auth,
  me
);

router.post(
  "/auth/change-password",
  auth,
  changePassword
);

/* ============================================================
   PUBLIC ROUTES
============================================================ */

/* -----------------------------
   PROGRAMS
----------------------------- */

router.get(
  "/programs",
  getPrograms
);

/* -----------------------------
   OFFERS
----------------------------- */

router.get(
  "/offers",
  getOffers
);

/* -----------------------------
   REVIEWS
----------------------------- */

router.get(
  "/reviews",
  getApprovedReviews
);

router.post(
  "/reviews",
  submitReview
);

/* -----------------------------
   COMMUNITY POSTS
----------------------------- */

router.get(
  "/posts",
  getPosts
);

router.patch(
  "/posts/:id/like",
  likePost
);

/* -----------------------------
   BOOKINGS
----------------------------- */

router.post(
  "/bookings",
  createBooking
);

/* -----------------------------
   CONTACT
----------------------------- */

router.post(
  "/contact",
  submitContact
);

/* -----------------------------
   TRAINERS
----------------------------- */

router.get(
  "/trainers",
  getTrainers
);

/* -----------------------------
   GALLERY
----------------------------- */

router.get(
  "/gallery",
  getFolders
);

/* -----------------------------
   SUBSCRIBERS
----------------------------- */

router.post(
  "/subscribe",
  subscribe
);

router.post(
  "/unsubscribe",
  unsubscribe
);

/* ============================================================
   ADMIN — DASHBOARD
============================================================ */

router.get(
  "/admin/dashboard",
  auth,
  getDashboard
);

/* ============================================================
   ADMIN — BOOKINGS
============================================================ */

router.get(
  "/admin/bookings",
  auth,
  getAllBookings
);

router.patch(
  "/admin/bookings/:id",
  auth,
  updateBookingStatus
);

router.delete(
  "/admin/bookings/:id",
  auth,
  deleteBooking
);

/* ============================================================
   ADMIN — REVIEWS
============================================================ */

router.get(
  "/admin/reviews",
  auth,
  getAllReviews
);

router.patch(
  "/admin/reviews/:id/approve",
  auth,
  approveReview
);

router.patch(
  "/admin/reviews/:id/reject",
  auth,
  rejectReview
);

router.patch(
  "/admin/reviews/:id/feature",
  auth,
  featureReview
);

router.delete(
  "/admin/reviews/:id",
  auth,
  deleteReview
);

/* ============================================================
   ADMIN — COMMUNITY POSTS
============================================================ */

router.get(
  "/admin/posts",
  auth,
  getAllPosts
);

router.post(
  "/admin/posts",
  auth,
  postUpload.single("image"),
  createPost
);

router.delete(
  "/admin/posts/:id",
  auth,
  deletePost
);

router.patch(
  "/admin/posts/:id/toggle",
  auth,
  togglePost
);

/* ============================================================
   ADMIN — CONTACTS
============================================================ */

router.get(
  "/admin/contacts",
  auth,
  getAllContacts
);

router.patch(
  "/admin/contacts/:id/read",
  auth,
  markRead
);

router.delete(
  "/admin/contacts/:id",
  auth,
  deleteContact
);

/* ============================================================
   ADMIN — PROGRAMS
============================================================ */

/*
   GET    /api/admin/programs
   POST   /api/admin/programs
   PUT    /api/admin/programs/:id
   DELETE /api/admin/programs/:id
*/

router.get(
  "/admin/programs",
  auth,
  getAllPrograms
);

router.post(
  "/admin/programs",
  auth,
  createProgram
);

router.put(
  "/admin/programs/:id",
  auth,
  updateProgram
);

router.delete(
  "/admin/programs/:id",
  auth,
  deleteProgram
);

/* ============================================================
   ADMIN — OFFERS
============================================================ */

/*
   GET    /api/admin/offers
   POST   /api/admin/offers
   PUT    /api/admin/offers/:id
   DELETE /api/admin/offers/:id
*/

router.get(
  "/admin/offers",
  auth,
  getAllOffers
);

router.post(
  "/admin/offers",
  auth,
  createOffer
);

router.put(
  "/admin/offers/:id",
  auth,
  updateOffer
);

router.delete(
  "/admin/offers/:id",
  auth,
  deleteOffer
);

/* ============================================================
   ADMIN — TRAINERS
============================================================ */

router.get(
  "/admin/trainers",
  auth,
  getAllTrainers
);

router.post(
  "/admin/trainers",
  auth,
  trainerUpload.single("image"),
  createTrainer
);

router.delete(
  "/admin/trainers/:id",
  auth,
  deleteTrainer
);

/* ============================================================
   ADMIN — GALLERY
============================================================ */

router.get(
  "/admin/gallery",
  auth,
  getFolders
);

router.post(
  "/admin/gallery/folders",
  auth,
  createFolder
);

router.delete(
  "/admin/gallery/folders/:id",
  auth,
  deleteFolder
);

router.post(
  "/admin/gallery/photos",
  auth,
  galleryUpload.single("image"),
  uploadPhoto
);

router.delete(
  "/admin/gallery/photos/:id",
  auth,
  deletePhoto
);

/* ============================================================
   ADMIN — SUBSCRIBERS
============================================================ */

router.get(
  "/admin/subscribers",
  auth,
  getSubscribers
);

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;