const API =
  import.meta.env.VITE_API_URL ||
  "https://script.google.com/macros/s/AKfycbwqo1tAmNyNU5E4Mdkrngn8o8S8NUa8n67Dg2frCMSwGkeQApNGswFfaYz01WV-8g23lQ/exec";

/* =========================================================
   BUILD GOOGLE APPS SCRIPT URL
   ========================================================= */

function buildUrl(path) {
  const cleanPath = path.replace(/^\/+/, "");

  // Example:
  // /admin/bookings -> bookings
  // /admin/contacts -> contacts
  // /bookings       -> bookings
  // /contact        -> contact

  const action = cleanPath
    .replace(/^admin\//, "")
    .split("?")[0]
    .replace(/\/+$/, "");

  const query = cleanPath.includes("?")
    ? cleanPath.split("?")[1]
    : "";

  const url = new URL(API);

  url.searchParams.set("action", action);

  if (query) {
    const params = new URLSearchParams(query);

    params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}


/* =========================================================
   GET
   ========================================================= */
export async function apiGet(path) {
  const cleanPath = path.replace(/^\/+/, "");

  const action = cleanPath
    .replace(/^admin\//, "")
    .split("?")[0];

  const query = cleanPath.includes("?")
    ? cleanPath.split("?")[1]
    : "";

  const url = new URL(API);

  url.searchParams.set("action", action);

  if (query) {
    const params = new URLSearchParams(query);

    params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}
/* =========================================================
   POST
   ========================================================= */

export async function apiPost(path, data = {}) {
  const url = buildUrl(path);

  const response = await fetch(url, {
    method: "POST",

    // IMPORTANT:
    // Do NOT change this to application/json.
    // text/plain avoids Google's OPTIONS preflight problem.
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },

    body: JSON.stringify(data),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}


/* =========================================================
   PATCH
   Apps Script receives this as POST + _method=PATCH
   ========================================================= */

export async function apiPatch(path, data = {}) {
  const url = buildUrl(path);

  const finalUrl = new URL(url);

  finalUrl.searchParams.set("_method", "PATCH");

  const response = await fetch(finalUrl.toString(), {
    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },

    body: JSON.stringify(data),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}


/* =========================================================
   DELETE
   Apps Script receives this as POST + _method=DELETE
   ========================================================= */

export async function apiDelete(path) {
  const url = buildUrl(path);

  const finalUrl = new URL(url);

  finalUrl.searchParams.set("_method", "DELETE");

  const response = await fetch(finalUrl.toString(), {
    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },

    body: JSON.stringify({}),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}


/* =========================================================
   COMPATIBILITY WRAPPER
   Existing Admin.jsx can continue using apiFetch()
   ========================================================= */

export async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  let data = {};

  if (options.body) {
    try {
      data =
        typeof options.body === "string"
          ? JSON.parse(options.body)
          : options.body;
    } catch {
      data = {};
    }
  }

  if (method === "GET") {
    return apiGet(path);
  }

  if (method === "POST") {
    return apiPost(path, data);
  }

  if (method === "PATCH") {
    return apiPatch(path, data);
  }

  if (method === "DELETE") {
    return apiDelete(path);
  }

  throw new Error(`Unsupported method: ${method}`);
}


/* =========================================================
   PUBLIC API
   ========================================================= */

export const submitBooking = (data) =>
  apiPost("/bookings", data);

export const submitContact = (data) =>
  apiPost("/contact", data);

export const getPrograms = () =>
  apiGet("/programs");

export const getReviews = () =>
  apiGet("/reviews");

export const submitReview = (data) =>
  apiPost("/reviews", data);

export const getPosts = () =>
  apiGet("/posts");

export const likePost = (id) =>
  apiPatch(`/posts/${id}/like`, {});

export const getTrainers = () =>
  apiGet("/trainers");

export const getGallery = () =>
  apiGet("/gallery");

export const subscribe = (email) =>
  apiPost("/subscribe", { email });

export const unsubscribe = (email) =>
  apiPost("/unsubscribe", { email });


/* =========================================================
   ADMIN — AUTH
   ========================================================= */

export const adminLogin = (data) =>
  apiPost("/auth/login", data);

export const adminMe = () =>
  apiGet("/auth/me");

export const adminChangePassword = (data) =>
  apiPost("/auth/change-password", data);


/* =========================================================
   ADMIN — DASHBOARD
   ========================================================= */

export const adminDashboard = () =>
  apiGet("/admin/dashboard");


/* =========================================================
   ADMIN — BOOKINGS
   ========================================================= */

/*
  Supports:

  adminBookings()

  adminBookings({
    search: "zahid"
  })

  adminBookings({
    status: "pending"
  })

  adminBookings({
    search: "9865",
    status: "confirmed",
    page: 1,
    limit: 20
  })
*/

export const adminBookings = (params = {}) => {
  const cleanParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      cleanParams[key] = value;
    }
  });

  const query = new URLSearchParams(cleanParams).toString();

  return apiGet(
    `/admin/bookings${query ? `?${query}` : ""}`
  );
};


export const adminUpdateBooking = (id, data) =>
  apiPatch(`/admin/bookings/${id}`, data);


export const adminDeleteBooking = (id) =>
  apiDelete(`/admin/bookings/${id}`);


/* =========================================================
   ADMIN — CONTACTS
   ========================================================= */

/*
  Supports:

  adminContacts()

  adminContacts({
    search: "zahid"
  })

  adminContacts({
    search: "gmail.com",
    read: "unread"
  })
*/

export const adminContacts = (params = {}) => {
  const cleanParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      cleanParams[key] = value;
    }
  });

  const query = new URLSearchParams(cleanParams).toString();

  return apiGet(
    `/admin/contacts${query ? `?${query}` : ""}`
  );
};


export const adminMarkContactRead = (id) =>
  apiPatch(`/admin/contacts/${id}/read`, {});


export const adminDeleteContact = (id) =>
  apiDelete(`/admin/contacts/${id}`);


/* =========================================================
   ADMIN — REVIEWS
   ========================================================= */

export const adminReviews = () =>
  apiGet("/admin/reviews");

export const adminApproveReview = (id) =>
  apiPatch(`/admin/reviews/${id}/approve`, {});

export const adminRejectReview = (id) =>
  apiPatch(`/admin/reviews/${id}/reject`, {});

export const adminDeleteReview = (id) =>
  apiDelete(`/admin/reviews/${id}`);


/* =========================================================
   ADMIN — POSTS
   ========================================================= */

export const adminPosts = () =>
  apiGet("/admin/posts");

export const adminDeletePost = (id) =>
  apiDelete(`/admin/posts/${id}`);

export const adminTogglePost = (id) =>
  apiPatch(`/admin/posts/${id}/toggle`, {});


/* =========================================================
   ADMIN — PROGRAMS
   ========================================================= */

export const adminPrograms = () =>
  apiGet("/programs");

export const adminUpdateProgram = (id, data) =>
  apiPatch(`/admin/programs/${id}`, data);


/* =========================================================
   ADMIN — TRAINERS
   ========================================================= */

export const adminTrainers = () =>
  apiGet("/admin/trainers");


/* =========================================================
   ADMIN — GALLERY
   ========================================================= */

export const adminGallery = () =>
  apiGet("/admin/gallery");


/* =========================================================
   ADMIN — SUBSCRIBERS
   ========================================================= */

export const adminSubscribers = () =>
  apiGet("/admin/subscribers");