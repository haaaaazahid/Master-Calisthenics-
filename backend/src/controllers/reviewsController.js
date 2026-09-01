const db = require("../config/db");

/* ============================================================
   PUBLIC: GET APPROVED REVIEWS
============================================================ */

async function getApprovedReviews(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        rating,
        review_text,
        program,
        source,
        featured,
        created_at
      FROM reviews
      WHERE status = 'approved'
      ORDER BY
        featured DESC,
        created_at DESC
    `);

    return res.status(200).json({
      success: true,
      reviews: rows,
    });
  } catch (err) {
    console.error(
      "Get approved reviews error:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   PUBLIC: SUBMIT MANUAL REVIEW
============================================================ */

async function submitReview(req, res) {
  try {
    const {
      name,
      rating,
      review,
      program,
    } = req.body || {};

    if (!name || !rating || !review) {
      return res.status(400).json({
        success: false,
        message:
          "Name, rating, and review are required.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5.",
      });
    }

    const cleanName = String(name).trim();
    const cleanReview = String(review).trim();
    const cleanProgram = program
      ? String(program).trim()
      : null;

    if (!cleanName || !cleanReview) {
      return res.status(400).json({
        success: false,
        message:
          "Name and review cannot be empty.",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO reviews
        (
          name,
          rating,
          review_text,
          program,
          approved,
          status,
          source,
          featured
        )
      VALUES (?, ?, ?, ?, 0, 'pending', 'manual', 0)
      `,
      [
        cleanName,
        numericRating,
        cleanReview,
        cleanProgram,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully. It is pending admin approval.",
      id: result.insertId,
    });
  } catch (err) {
    console.error(
      "Submit review error:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   ADMIN: GET ALL REVIEWS
============================================================ */

async function getAllReviews(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        rating,
        review_text,
        program,
        approved,
        status,
        source,
        google_review_id,
        google_location_id,
        featured,
        created_at
      FROM reviews
      ORDER BY
        CASE status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'rejected' THEN 3
          ELSE 4
        END,
        created_at DESC
    `);

    return res.status(200).json({
      success: true,
      reviews: rows,
    });
  } catch (err) {
    console.error(
      "Get all reviews error:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   ADMIN: APPROVE REVIEW
============================================================ */

async function approveReview(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const [result] = await db.query(
      `
      UPDATE reviews
      SET
        status = 'approved',
        approved = 1
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review approved successfully.",
    });
  } catch (err) {
    console.error(
      "Approve review error:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   ADMIN: REJECT REVIEW
============================================================ */

async function rejectReview(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const [result] = await db.query(
      `
      UPDATE reviews
      SET
        status = 'rejected',
        approved = 0,
        featured = 0
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review rejected successfully.",
    });
  } catch (err) {
    console.error(
      "Reject review error:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   ADMIN: FEATURE / UNFEATURE REVIEW
============================================================ */

async function featureReview(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        status,
        featured
      FROM reviews
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (rows[0].status !== "approved") {
      return res.status(400).json({
        success: false,
        message:
          "Only approved reviews can be featured.",
      });
    }

    const newFeatured =
      Number(rows[0].featured) === 1
        ? 0
        : 1;

    await db.query(
      `
      UPDATE reviews
      SET featured = ?
      WHERE id = ?
      `,
      [
        newFeatured,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      featured: newFeatured,
      message:
        newFeatured === 1
          ? "Review featured successfully."
          : "Review removed from featured.",
    });
  } catch (err) {
    console.error(
      "Feature review error:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   ADMIN: DELETE REVIEW
============================================================ */

async function deleteReview(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const [result] = await db.query(
      `
      DELETE FROM reviews
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (err) {
    console.error(
      "Delete review error:",
      err
    );

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  submitReview,
  getApprovedReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  featureReview,
  deleteReview,
};