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
============================================================ */

const {
  submitContact,
  getAllContacts,
  markRead,
  deleteContact,
  getPrograms,
  updateProgram,
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

/* Programs */
router.get(
  "/programs",
  getPrograms
);

/* Reviews */
router.get(
  "/reviews",
  getApprovedReviews
);

router.post(
  "/reviews",
  submitReview
);

/* Posts */
router.get(
  "/posts",
  getPosts
);

router.patch(
  "/posts/:id/like",
  likePost
);

/* Bookings */
router.post(
  "/bookings",
  createBooking
);

/* Contact */
router.post(
  "/contact",
  submitContact
);

/* Trainers */
router.get(
  "/trainers",
  getTrainers
);

/* Gallery */
router.get(
  "/gallery",
  getFolders
);

/* Subscribers */
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
   ADMIN — POSTS
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
 * Existing program support:
 *
 * GET  /api/programs
 * PUT  /api/admin/programs/:id
 *
 * Add/create and delete will be added once the corresponding
 * controller functions are implemented.
 */

router.put(
  "/admin/programs/:id",
  auth,
  updateProgram
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

module.exports = router;