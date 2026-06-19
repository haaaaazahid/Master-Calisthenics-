const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");

const { login, googleLogin, me, changePassword }                             = require("../controllers/authController");
const { createBooking, getAllBookings, updateBookingStatus, deleteBooking }   = require("../controllers/bookingsController");
const { submitReview, getApprovedReviews, getAllReviews, approveReview, rejectReview, deleteReview } = require("../controllers/reviewsController");
const { getPosts, getAllPosts, createPost, deletePost, togglePost, likePost, upload } = require("../controllers/postsController");
const { submitContact, getAllContacts, markRead, deleteContact,
        getPrograms, updateProgram, getDashboard }                            = require("../controllers/otherControllers");
const { getTrainers, getAllTrainers, createTrainer, deleteTrainer,
        upload: trainerUpload }                                               = require("../controllers/trainersController");
const { getFolders, createFolder, deleteFolder, uploadPhoto, deletePhoto,
        upload: galleryUpload }                                               = require("../controllers/galleryController");
const { subscribe, getSubscribers, unsubscribe }                             = require("../controllers/subscriberController");

// ─── Auth ─────────────────────────────────────────────────
router.post("/auth/login",           login);
router.post("/auth/google",          googleLogin);
router.get ("/auth/me",              auth, me);
router.post("/auth/change-password", auth, changePassword);

// ─── Public Routes ────────────────────────────────────────
router.get ("/programs",             getPrograms);
router.get ("/reviews",              getApprovedReviews);
router.post("/reviews",              submitReview);
router.get ("/posts",                getPosts);
router.patch("/posts/:id/like",      likePost);
router.post("/bookings",             createBooking);
router.post("/contact",              submitContact);
router.get ("/trainers",             getTrainers);
router.get ("/gallery",              getFolders);
router.post("/subscribe",            subscribe);
router.post("/unsubscribe",          unsubscribe);

// ─── Admin Routes ─────────────────────────────────────────
router.get   ("/admin/dashboard",              auth, getDashboard);

router.get   ("/admin/bookings",               auth, getAllBookings);
router.patch ("/admin/bookings/:id",           auth, updateBookingStatus);
router.delete("/admin/bookings/:id",           auth, deleteBooking);

router.get   ("/admin/reviews",                auth, getAllReviews);
router.patch ("/admin/reviews/:id/approve",    auth, approveReview);
router.patch ("/admin/reviews/:id/reject",     auth, rejectReview);
router.delete("/admin/reviews/:id",            auth, deleteReview);

router.get   ("/admin/posts",                  auth, getAllPosts);
router.post  ("/admin/posts",                  auth, upload.single("image"), createPost);
router.delete("/admin/posts/:id",              auth, deletePost);
router.patch ("/admin/posts/:id/toggle",       auth, togglePost);

router.get   ("/admin/contacts",               auth, getAllContacts);
router.patch ("/admin/contacts/:id/read",      auth, markRead);
router.delete("/admin/contacts/:id",           auth, deleteContact);

router.put   ("/admin/programs/:id",           auth, updateProgram);

router.get   ("/admin/trainers",               auth, getAllTrainers);
router.post  ("/admin/trainers",               auth, trainerUpload.single("image"), createTrainer);
router.delete("/admin/trainers/:id",           auth, deleteTrainer);

router.get   ("/admin/gallery",                auth, getFolders);
router.post  ("/admin/gallery/folders",        auth, createFolder);
router.delete("/admin/gallery/folders/:id",    auth, deleteFolder);
router.post  ("/admin/gallery/photos",         auth, galleryUpload.single("image"), uploadPhoto);
router.delete("/admin/gallery/photos/:id",     auth, deletePhoto);

router.get   ("/admin/subscribers",            auth, getSubscribers);

module.exports = router;