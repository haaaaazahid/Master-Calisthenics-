const db = require("../config/db");

/* ============================================================
   CONTACT
============================================================ */

async function submitContact(req, res) {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message required",
    });
  }

  try {
    await db.query(
      "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)",
      [
        name,
        email,
        phone || null,
        message,
      ]
    );

    res.status(201).json({
      success: true,
      message:
        "Message sent! We will get back to you soon.",
    });
  } catch (err) {
    console.error("submitContact:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

async function getAllContacts(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM contacts ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      contacts: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

async function markRead(req, res) {
  try {
    const [result] = await db.query(
      "UPDATE contacts SET is_read=1 WHERE id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

async function deleteContact(req, res) {
  try {
    const [result] = await db.query(
      "DELETE FROM contacts WHERE id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   PROGRAMS
============================================================ */

/*
  PUBLIC
  GET /api/programs
*/
async function getPrograms(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        subtitle,
        icon,
        color,
        features,
        pricing,
        is_featured,
        sort_order,
        active,
        created_at
      FROM programs
      WHERE active = 1
      ORDER BY sort_order ASC, id ASC
    `);

    const programs = rows.map(normalizeProgram);

    res.json({
      success: true,
      programs,
    });
  } catch (err) {
    console.error("getPrograms:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/*
  ADMIN
  GET /api/admin/programs

  Returns ALL programs, including inactive ones.
*/
async function getAllPrograms(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        subtitle,
        icon,
        color,
        features,
        pricing,
        is_featured,
        sort_order,
        active,
        created_at
      FROM programs
      ORDER BY sort_order ASC, id ASC
    `);

    const programs = rows.map(normalizeProgram);

    res.json({
      success: true,
      programs,
    });
  } catch (err) {
    console.error("getAllPrograms:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/*
  ADMIN
  POST /api/admin/programs
*/
async function createProgram(req, res) {
  try {
    const {
      title,
      subtitle,
      icon,
      color,
      features,
      pricing,
      is_featured,
      sort_order,
      active,
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Program title is required.",
      });
    }

    const parsedFeatures = normalizeJsonArray(features);
    const parsedPricing = normalizePricing(pricing);

    const [result] = await db.query(
      `
      INSERT INTO programs
      (
        title,
        subtitle,
        icon,
        color,
        features,
        pricing,
        is_featured,
        sort_order,
        active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        String(title).trim(),
        subtitle ? String(subtitle).trim() : null,
        icon ? String(icon).trim() : null,
        color
          ? String(color).trim()
          : "#f97316",
        JSON.stringify(parsedFeatures),
        JSON.stringify(parsedPricing),
        Number(is_featured) === 1 ? 1 : 0,
        Number.isFinite(Number(sort_order))
          ? Number(sort_order)
          : 0,
        active === undefined
          ? 1
          : Number(active) === 1
          ? 1
          : 0,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Program created successfully.",
      id: result.insertId,
    });
  } catch (err) {
    console.error("createProgram:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/*
  ADMIN
  PUT /api/admin/programs/:id
*/
async function updateProgram(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program ID.",
      });
    }

    const {
      title,
      subtitle,
      icon,
      color,
      features,
      pricing,
      is_featured,
      sort_order,
      active,
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Program title is required.",
      });
    }

    const parsedFeatures = normalizeJsonArray(features);
    const parsedPricing = normalizePricing(pricing);

    const [result] = await db.query(
      `
      UPDATE programs
      SET
        title = ?,
        subtitle = ?,
        icon = ?,
        color = ?,
        features = ?,
        pricing = ?,
        is_featured = ?,
        sort_order = ?,
        active = ?
      WHERE id = ?
      `,
      [
        String(title).trim(),
        subtitle ? String(subtitle).trim() : null,
        icon ? String(icon).trim() : null,
        color
          ? String(color).trim()
          : "#f97316",
        JSON.stringify(parsedFeatures),
        JSON.stringify(parsedPricing),
        Number(is_featured) === 1 ? 1 : 0,
        Number.isFinite(Number(sort_order))
          ? Number(sort_order)
          : 0,
        active === undefined
          ? 1
          : Number(active) === 1
          ? 1
          : 0,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Program not found.",
      });
    }

    res.json({
      success: true,
      message: "Program updated successfully.",
    });
  } catch (err) {
    console.error("updateProgram:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/*
  ADMIN
  DELETE /api/admin/programs/:id
*/
async function deleteProgram(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program ID.",
      });
    }

    const [result] = await db.query(
      "DELETE FROM programs WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Program not found.",
      });
    }

    res.json({
      success: true,
      message: "Program deleted successfully.",
    });
  } catch (err) {
    console.error("deleteProgram:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   OFFERS
============================================================ */

/*
  Public:
  GET /api/offers
*/
async function getOffers(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        description,
        discount_type,
        discount_value,
        promo_code,
        start_date,
        end_date,
        active,
        is_featured,
        sort_order,
        created_at
      FROM offers
      WHERE active = 1
        AND (
          start_date IS NULL
          OR start_date <= CURDATE()
        )
        AND (
          end_date IS NULL
          OR end_date >= CURDATE()
        )
      ORDER BY
        is_featured DESC,
        sort_order ASC,
        created_at DESC
    `);

    res.json({
      success: true,
      offers: rows,
    });
  } catch (err) {
    console.error("getOffers:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/*
  Admin:
  GET /api/admin/offers
*/
async function getAllOffers(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM offers
      ORDER BY
        is_featured DESC,
        sort_order ASC,
        created_at DESC
    `);

    res.json({
      success: true,
      offers: rows,
    });
  } catch (err) {
    console.error("getAllOffers:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/*
  Admin:
  POST /api/admin/offers
*/
async function createOffer(req, res) {
  try {
    const {
      title,
      description,
      discount_type,
      discount_value,
      promo_code,
      start_date,
      end_date,
      active,
      is_featured,
      sort_order,
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Offer title is required.",
      });
    }

    const allowedTypes = [
      "percentage",
      "fixed",
      "text",
    ];

    const finalDiscountType =
      allowedTypes.includes(discount_type)
        ? discount_type
        : "percentage";

    const [result] = await db.query(
      `
      INSERT INTO offers
      (
        title,
        description,
        discount_type,
        discount_value,
        promo_code,
        start_date,
        end_date,
        active,
        is_featured,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        String(title).trim(),
        description
          ? String(description).trim()
          : null,
        finalDiscountType,
        discount_value === null ||
        discount_value === undefined ||
        discount_value === ""
          ? null
          : Number(discount_value),
        promo_code
          ? String(promo_code).trim()
          : null,
        start_date || null,
        end_date || null,
        active === undefined
          ? 1
          : Number(active) === 1
          ? 1
          : 0,
        Number(is_featured) === 1 ? 1 : 0,
        Number.isFinite(Number(sort_order))
          ? Number(sort_order)
          : 0,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Offer created successfully.",
      id: result.insertId,
    });
  } catch (err) {
    console.error("createOffer:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/*
  Admin:
  PUT /api/admin/offers/:id
*/
async function updateOffer(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer ID.",
      });
    }

    const {
      title,
      description,
      discount_type,
      discount_value,
      promo_code,
      start_date,
      end_date,
      active,
      is_featured,
      sort_order,
    } = req.body || {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Offer title is required.",
      });
    }

    const allowedTypes = [
      "percentage",
      "fixed",
      "text",
    ];

    const finalDiscountType =
      allowedTypes.includes(discount_type)
        ? discount_type
        : "percentage";

    const [result] = await db.query(
      `
      UPDATE offers
      SET
        title = ?,
        description = ?,
        discount_type = ?,
        discount_value = ?,
        promo_code = ?,
        start_date = ?,
        end_date = ?,
        active = ?,
        is_featured = ?,
        sort_order = ?
      WHERE id = ?
      `,
      [
        String(title).trim(),
        description
          ? String(description).trim()
          : null,
        finalDiscountType,
        discount_value === null ||
        discount_value === undefined ||
        discount_value === ""
          ? null
          : Number(discount_value),
        promo_code
          ? String(promo_code).trim()
          : null,
        start_date || null,
        end_date || null,
        active === undefined
          ? 1
          : Number(active) === 1
          ? 1
          : 0,
        Number(is_featured) === 1 ? 1 : 0,
        Number.isFinite(Number(sort_order))
          ? Number(sort_order)
          : 0,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Offer not found.",
      });
    }

    res.json({
      success: true,
      message: "Offer updated successfully.",
    });
  } catch (err) {
    console.error("updateOffer:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/*
  Admin:
  DELETE /api/admin/offers/:id
*/
async function deleteOffer(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer ID.",
      });
    }

    const [result] = await db.query(
      "DELETE FROM offers WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Offer not found.",
      });
    }

    res.json({
      success: true,
      message: "Offer deleted successfully.",
    });
  } catch (err) {
    console.error("deleteOffer:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   HELPERS
============================================================ */

function normalizeJsonArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizePricing(value) {
  const parsed = normalizeJsonArray(value);

  return parsed.filter(
    (item) =>
      Array.isArray(item) &&
      item.length >= 2
  );
}

function normalizeProgram(program) {
  return {
    ...program,
    features: normalizeJsonArray(
      program.features
    ),
    pricing: normalizePricing(
      program.pricing
    ),
  };
}

/* ============================================================
   DASHBOARD
============================================================ */

async function getDashboard(req, res) {
  try {
    const [[{ total_bookings }]] =
      await db.query(
        "SELECT COUNT(*) AS total_bookings FROM bookings"
      );

    const [[{ pending_bookings }]] =
      await db.query(
        "SELECT COUNT(*) AS pending_bookings FROM bookings WHERE status='pending'"
      );

    const [[{ confirmed_bookings }]] =
      await db.query(
        "SELECT COUNT(*) AS confirmed_bookings FROM bookings WHERE status='confirmed'"
      );

    const [[{ total_reviews }]] =
      await db.query(
        "SELECT COUNT(*) AS total_reviews FROM reviews"
      );

    const [[{ pending_reviews }]] =
      await db.query(`
        SELECT COUNT(*) AS pending_reviews
        FROM reviews
        WHERE status='pending'
      `);

    const [[{ total_contacts }]] =
      await db.query(
        "SELECT COUNT(*) AS total_contacts FROM contacts"
      );

    const [[{ unread_contacts }]] =
      await db.query(
        "SELECT COUNT(*) AS unread_contacts FROM contacts WHERE is_read=0"
      );

    const [[{ total_posts }]] =
      await db.query(
        "SELECT COUNT(*) AS total_posts FROM posts"
      );

    const [[{ total_programs }]] =
      await db.query(
        "SELECT COUNT(*) AS total_programs FROM programs"
      );

    const [[{ active_programs }]] =
      await db.query(
        "SELECT COUNT(*) AS active_programs FROM programs WHERE active=1"
      );

    const [[{ total_offers }]] =
      await db.query(
        "SELECT COUNT(*) AS total_offers FROM offers"
      );

    const [[{ active_offers }]] =
      await db.query(
        "SELECT COUNT(*) AS active_offers FROM offers WHERE active=1"
      );

    const [recent_bookings] =
      await db.query(`
        SELECT
          id,
          name,
          phone,
          program,
          session_time,
          status,
          created_at
        FROM bookings
        ORDER BY created_at DESC
        LIMIT 5
      `);

    const [recent_contacts] =
      await db.query(`
        SELECT
          id,
          name,
          email,
          message,
          is_read,
          created_at
        FROM contacts
        ORDER BY created_at DESC
        LIMIT 5
      `);

    res.json({
      success: true,

      stats: {
        total_bookings,
        pending_bookings,
        confirmed_bookings,

        total_reviews,
        pending_reviews,

        total_contacts,
        unread_contacts,

        total_posts,

        total_programs,
        active_programs,

        total_offers,
        active_offers,
      },

      recent_bookings,
      recent_contacts,
    });
  } catch (err) {
    console.error("getDashboard:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  submitContact,
  getAllContacts,
  markRead,
  deleteContact,

  getPrograms,
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,

  getOffers,
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,

  getDashboard,
};