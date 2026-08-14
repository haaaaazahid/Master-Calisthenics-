const db = require("../config/db");

/**
 * ============================================================
 * CREATE BOOKING
 * POST /api/bookings
 * Public route
 * ============================================================
 */
async function createBooking(req, res) {
  const {
    name,
    phone,
    email,
    program,
    session_time,
    preferred_date,
    one_week_offer,
    message,
  } = req.body;

  if (!name || !phone || !session_time) {
    return res.status(400).json({
      success: false,
      message: "Name, phone, and session time are required",
    });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO bookings
      (
        name,
        phone,
        email,
        program,
        session_time,
        preferred_date,
        one_week_offer,
        message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        phone.trim(),
        email ? email.trim() : null,
        program || null,
        session_time,
        preferred_date || null,
        one_week_offer ? 1 : 0,
        message || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Booking request submitted!",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Create booking error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error while creating booking",
      error: err.message,
    });
  }
}


/**
 * ============================================================
 * GET ALL BOOKINGS
 * GET /api/admin/bookings
 *
 * Supported query parameters:
 *
 * ?search=zahid
 * ?status=pending
 * ?page=1
 * ?limit=20
 *
 * Search fields:
 * - name
 * - phone
 * - email
 * - program
 * - message
 *
 * Response:
 * {
 *   success: true,
 *   bookings: [],
 *   total: 50,
 *   page: 1,
 *   limit: 20,
 *   totalPages: 3
 * }
 * ============================================================
 */
async function getAllBookings(req, res) {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status.trim()
        : "";

    // ----------------------------------------------------------
    // SAFE PAGINATION
    // ----------------------------------------------------------

    let currentPage = parseInt(req.query.page, 10);

    if (!Number.isFinite(currentPage) || currentPage < 1) {
      currentPage = 1;
    }

    let currentLimit = parseInt(req.query.limit, 10);

    if (!Number.isFinite(currentLimit) || currentLimit < 1) {
      currentLimit = 20;
    }

    // Never allow extremely large requests
    currentLimit = Math.min(currentLimit, 100);

    const offset = (currentPage - 1) * currentLimit;

    // ----------------------------------------------------------
    // BUILD FILTER CONDITIONS
    // ----------------------------------------------------------

    const conditions = [];
    const params = [];

    // ----------------------------------------------------------
    // STATUS FILTER
    // ----------------------------------------------------------

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    // ----------------------------------------------------------
    // SEARCH FILTER
    // ----------------------------------------------------------

    if (search) {
      const searchTerm = `%${search}%`;

      conditions.push(`
        (
          name LIKE ?
          OR phone LIKE ?
          OR email LIKE ?
          OR program LIKE ?
          OR message LIKE ?
        )
      `);

      params.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm
      );
    }

    // ----------------------------------------------------------
    // WHERE CLAUSE
    // ----------------------------------------------------------

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // ----------------------------------------------------------
    // TOTAL COUNT
    // ----------------------------------------------------------

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM bookings
      ${whereClause}
    `;

    const [[countResult]] = await db.query(
      countQuery,
      params
    );

    const total = Number(countResult.total) || 0;

    const totalPages =
      total === 0
        ? 1
        : Math.ceil(total / currentLimit);

    // ----------------------------------------------------------
    // PREVENT REQUESTING A PAGE THAT DOES NOT EXIST
    // ----------------------------------------------------------

    const safePage =
      total > 0
        ? Math.min(currentPage, totalPages)
        : 1;

    const safeOffset =
      (safePage - 1) * currentLimit;

    // ----------------------------------------------------------
    // GET BOOKINGS
    // ----------------------------------------------------------

    /*
     * currentLimit and safeOffset have already been converted
     * into safe integers above, so they are safe to interpolate.
     *
     * All user-controlled search/status values remain parameterized.
     */

    const bookingsQuery = `
      SELECT *
      FROM bookings
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${currentLimit}
      OFFSET ${safeOffset}
    `;

    const [rows] = await db.query(
      bookingsQuery,
      params
    );

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.json({
      success: true,

      bookings: rows,

      total,

      page: safePage,

      limit: currentLimit,

      search,

      status,

      totalPages,
    });

  } catch (err) {
    console.error("Get bookings error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to load bookings",
      error: err.message,
    });
  }
}


/**
 * ============================================================
 * UPDATE BOOKING
 * PATCH /api/admin/bookings/:id
 * Admin route
 * ============================================================
 */
async function updateBookingStatus(req, res) {
  const {
    status,
    admin_note,
  } = req.body;

  // ----------------------------------------------------------
  // Validate status
  // ----------------------------------------------------------

  const allowedStatuses = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "rejected",
  ];

  if (
    status &&
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking status",
    });
  }

  try {
    await db.query(
      `
      UPDATE bookings
      SET
        status = ?,
        admin_note = ?
      WHERE id = ?
      `,
      [
        status || "pending",
        admin_note || null,
        req.params.id,
      ]
    );

    return res.json({
      success: true,
      message: "Booking updated successfully",
    });

  } catch (err) {
    console.error("Update booking error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to update booking",
      error: err.message,
    });
  }
}


/**
 * ============================================================
 * DELETE BOOKING
 * DELETE /api/admin/bookings/:id
 * Admin route
 * ============================================================
 */
async function deleteBooking(req, res) {
  try {
    const [result] = await db.query(
      `
      DELETE FROM bookings
      WHERE id = ?
      `,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.json({
      success: true,
      message: "Booking deleted successfully",
    });

  } catch (err) {
    console.error("Delete booking error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to delete booking",
      error: err.message,
    });
  }
}


/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */
module.exports = {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
};