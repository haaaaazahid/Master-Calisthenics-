const API = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000/api"
).replace(/\/+$/, "");

/* ============================================================
   AUTH
============================================================ */

function getToken() {
  return localStorage.getItem("mci_token") || "";
}

/* ============================================================
   CORE REQUEST
============================================================ */

async function request(path, options = {}) {
  const cleanPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const url = `${API}${cleanPath}`;

  const headers = {
    ...(options.headers || {}),
  };

  /*
   * Do not set Content-Type manually for FormData.
   * Browser must set multipart boundary itself.
   */
  if (
    !(options.body instanceof FormData) &&
    options.body !== undefined &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    const err = new Error(
      "Network error — could not reach the MCI backend."
    );

    err.cause = error;
    throw err;
  }

  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = text
        ? { message: text }
        : null;
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.error ||
          `Request failed with HTTP ${response.status}`;

    const err = new Error(message);

    err.status = response.status;
    err.data = data;

    throw err;
  }

  return (
    data || {
      success: true,
    }
  );
}

/* ============================================================
   GENERIC API HELPERS
============================================================ */

export const apiFetch = request;

export const apiGet = (
  path,
  options = {}
) =>
  request(path, {
    ...options,
    method: "GET",
  });

export const apiPost = (
  path,
  body = {},
  options = {}
) =>
  request(path, {
    ...options,
    method: "POST",
    body:
      body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

export const apiPut = (
  path,
  body = {},
  options = {}
) =>
  request(path, {
    ...options,
    method: "PUT",
    body:
      body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

export const apiPatch = (
  path,
  body = {},
  options = {}
) =>
  request(path, {
    ...options,
    method: "PATCH",
    body:
      body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

export const apiDelete = (
  path,
  options = {}
) =>
  request(path, {
    ...options,
    method: "DELETE",
  });

/* ============================================================
   PUBLIC — BOOKINGS
============================================================ */

export const submitBooking = (data) =>
  apiPost("/bookings", data);

/* ============================================================
   PUBLIC — CONTACT
============================================================ */

export const submitContact = (data) =>
  apiPost("/contact", data);

/* ============================================================
   PUBLIC — PROGRAMS
============================================================ */

export const getPrograms = () =>
  apiGet("/programs");

/* ============================================================
   PUBLIC — REVIEWS
============================================================ */

export const getReviews = () =>
  apiGet("/reviews");

export const submitReview = (data) =>
  apiPost("/reviews", data);

/* ============================================================
   PUBLIC — COMMUNITY POSTS
============================================================ */

export const getPosts = () =>
  apiGet("/posts");

export const likePost = (id) =>
  apiPatch(`/posts/${id}/like`, {});

/* ============================================================
   PUBLIC — TRAINERS
============================================================ */

export const getTrainers = () =>
  apiGet("/trainers");

/* ============================================================
   PUBLIC — GALLERY
============================================================ */

export const getGallery = () =>
  apiGet("/gallery");

/* ============================================================
   PUBLIC — SUBSCRIBERS
============================================================ */

export const subscribe = (
  email,
  name = ""
) =>
  apiPost("/subscribe", {
    email,
    name,
  });

export const unsubscribe = (
  email
) =>
  apiPost("/unsubscribe", {
    email,
  });

/* ============================================================
   ADMIN — AUTH
============================================================ */

export const adminLogin = (data) =>
  apiPost("/auth/login", data);

export const adminMe = () =>
  apiGet("/auth/me");

export const adminChangePassword = (
  data
) =>
  apiPost(
    "/auth/change-password",
    data
  );

/* ============================================================
   ADMIN — DASHBOARD
============================================================ */

export const adminDashboard = () =>
  apiGet("/admin/dashboard");

/* ============================================================
   ADMIN — BOOKINGS
============================================================ */

export const adminBookings = (
  params = {}
) => {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

  const query =
    new URLSearchParams(
      filtered
    ).toString();

  return apiGet(
    `/admin/bookings${
      query ? `?${query}` : ""
    }`
  );
};

export const adminUpdateBooking = (
  id,
  data
) =>
  apiPatch(
    `/admin/bookings/${id}`,
    data
  );

export const adminDeleteBooking = (
  id
) =>
  apiDelete(
    `/admin/bookings/${id}`
  );

/* ============================================================
   ADMIN — CONTACTS
============================================================ */

export const adminContacts = (
  params = {}
) => {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

  const query =
    new URLSearchParams(
      filtered
    ).toString();

  return apiGet(
    `/admin/contacts${
      query ? `?${query}` : ""
    }`
  );
};

export const adminMarkContactRead = (
  id
) =>
  apiPatch(
    `/admin/contacts/${id}/read`,
    {}
  );

export const adminDeleteContact = (
  id
) =>
  apiDelete(
    `/admin/contacts/${id}`
  );

/* ============================================================
   ADMIN — REVIEWS
============================================================ */

export const adminReviews = () =>
  apiGet("/admin/reviews");

export const adminApproveReview = (
  id
) =>
  apiPatch(
    `/admin/reviews/${id}/approve`,
    {}
  );

export const adminRejectReview = (
  id
) =>
  apiPatch(
    `/admin/reviews/${id}/reject`,
    {}
  );

export const adminFeatureReview = (
  id
) =>
  apiPatch(
    `/admin/reviews/${id}/feature`,
    {}
  );

export const adminDeleteReview = (
  id
) =>
  apiDelete(
    `/admin/reviews/${id}`
  );

/* ============================================================
   ADMIN — POSTS
============================================================ */

export const adminPosts = () =>
  apiGet("/admin/posts");

export const adminDeletePost = (
  id
) =>
  apiDelete(
    `/admin/posts/${id}`
  );

export const adminTogglePost = (
  id
) =>
  apiPatch(
    `/admin/posts/${id}/toggle`,
    {}
  );

/* ============================================================
   ADMIN — PROGRAMS
============================================================ */

export const adminPrograms = () =>
  apiGet("/admin/programs");

export const adminCreateProgram = (
  data
) =>
  apiPost(
    "/admin/programs",
    data
  );

export const adminUpdateProgram = (
  id,
  data
) =>
  apiPut(
    `/admin/programs/${id}`,
    data
  );

export const adminDeleteProgram = (
  id
) =>
  apiDelete(
    `/admin/programs/${id}`
  );

/* ============================================================
   ADMIN — OFFERS
============================================================ */

export const adminOffers = () =>
  apiGet("/admin/offers");

export const adminCreateOffer = (
  data
) =>
  apiPost(
    "/admin/offers",
    data
  );

export const adminUpdateOffer = (
  id,
  data
) =>
  apiPut(
    `/admin/offers/${id}`,
    data
  );

export const adminDeleteOffer = (
  id
) =>
  apiDelete(
    `/admin/offers/${id}`
  );

/* ============================================================
   ADMIN — TRAINERS
============================================================ */

export const adminTrainers = () =>
  apiGet("/admin/trainers");

/* ============================================================
   ADMIN — GALLERY
============================================================ */

export const adminGallery = () =>
  apiGet("/admin/gallery");

/* ============================================================
   ADMIN — SUBSCRIBERS
============================================================ */

export const adminSubscribers = () =>
  apiGet("/admin/subscribers");
export const getOffers = () => apiGet('/offers');
