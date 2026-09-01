const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ONLY this Google account is allowed to use Google Sign-In
const GOOGLE_ALLOWED_EMAIL = "mastercalisthenics25@gmail.com";

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE email=?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const admin = rows[0];

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
}


async function googleLogin(req, res) {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: "Google credential missing",
    });
  }

  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = (payload.email || "").toLowerCase().trim();

    // Google must have verified the email
    if (!payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Your Google email is not verified.",
      });
    }

    // HARD restriction:
    // Only mastercalisthenics25@gmail.com can use Google Sign-In
    if (email !== GOOGLE_ALLOWED_EMAIL) {
      return res.status(403).json({
        success: false,
        message:
          "This Google account is not authorized for Coach Access. Please use the authorized coach account.",
      });
    }

    /*
      We intentionally DO NOT require
      mastercalisthenics25@gmail.com to be the email
      stored in the admins table.

      This means:
      - Google login is allowed ONLY for the client's Gmail.
      - Existing admin/password account remains unchanged.
      - The existing admin record is used to create the
        admin JWT session.
    */

    const [rows] = await db.query(
      "SELECT * FROM admins ORDER BY id ASC LIMIT 1"
    );

    if (!rows.length) {
      return res.status(500).json({
        success: false,
        message: "No admin account exists in the database.",
      });
    }

    const admin = rows[0];

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (err) {
    console.error("Google login error:", err);

    return res.status(401).json({
      success: false,
      message: "Google login failed. Please try again.",
    });
  }
}


async function me(req, res) {
  return res.json({
    success: true,
    admin: req.admin,
  });
}


async function changePassword(req, res) {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({
      success: false,
      message: "Both fields required",
    });
  }

  if (new_password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters",
    });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE id=?",
      [req.admin.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const match = await bcrypt.compare(
      current_password,
      rows[0].password
    );

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hash = await bcrypt.hash(new_password, 10);

    await db.query(
      "UPDATE admins SET password=? WHERE id=?",
      [hash, req.admin.id]
    );

    return res.json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (err) {
    console.error("Change password error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}


module.exports = {
  login,
  googleLogin,
  me,
  changePassword,
};