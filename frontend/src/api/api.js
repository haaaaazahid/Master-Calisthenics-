const API = import.meta.env.VITE_API_URL;
function getToken() {
  return localStorage.getItem("mci_token") || "";
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

function jsonHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

// ─── Programs ────────────────────────────────────────────
export async function fetchPrograms() {
  const res = await fetch(`${BASE}/programs`);
  return res.json();
}

// ─── Reviews ─────────────────────────────────────────────
export async function fetchReviews() {
  const res = await fetch(`${BASE}/reviews`);
  return res.json();
}

export async function submitReview(data) {
  const res = await fetch(`${BASE}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Posts ───────────────────────────────────────────────
export async function fetchPosts() {
  const res = await fetch(`${BASE}/posts`);
  return res.json();
}

export async function likePost(id) {
  const res = await fetch(`${BASE}/posts/${id}/like`, { method: "PATCH" });
  return res.json();
}

// ─── Bookings ────────────────────────────────────────────
export async function submitBooking(data) {
  const res = await fetch(`${BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Contact ─────────────────────────────────────────────
export async function submitContact(data) {
  const res = await fetch(`${BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Admin: Posts ─────────────────────────────────────────
export async function adminCreatePost(formData) {
  const res = await fetch(`${BASE}/admin/posts`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function adminTogglePost(id) {
  const res = await fetch(`${BASE}/admin/posts/${id}/toggle`, {
    method: "PATCH",
    headers: jsonHeaders(),
  });
  return res.json();
}

export async function adminDeletePost(id) {
  const res = await fetch(`${BASE}/admin/posts/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(),
  });
  return res.json();
}

// ─── Admin: Bookings ──────────────────────────────────────
export async function adminFetchBookings() {
  const res = await fetch(`${BASE}/admin/bookings`, { headers: jsonHeaders() });
  return res.json();
}

export async function adminUpdateBooking(id, data) {
  const res = await fetch(`${BASE}/admin/bookings/${id}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteBooking(id) {
  const res = await fetch(`${BASE}/admin/bookings/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(),
  });
  return res.json();
}

// ─── Admin: Reviews ───────────────────────────────────────
export async function adminFetchReviews() {
  const res = await fetch(`${BASE}/admin/reviews`, { headers: jsonHeaders() });
  return res.json();
}

export async function adminApproveReview(id) {
  const res = await fetch(`${BASE}/admin/reviews/${id}/approve`, {
    method: "PATCH",
    headers: jsonHeaders(),
  });
  return res.json();
}

export async function adminRejectReview(id) {
  const res = await fetch(`${BASE}/admin/reviews/${id}/reject`, {
    method: "PATCH",
    headers: jsonHeaders(),
  });
  return res.json();
}

export async function adminDeleteReview(id) {
  const res = await fetch(`${BASE}/admin/reviews/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(),
  });
  return res.json();
}

// ─── Admin: Contacts ──────────────────────────────────────
export async function adminFetchContacts() {
  const res = await fetch(`${BASE}/admin/contacts`, { headers: jsonHeaders() });
  return res.json();
}

export async function adminMarkRead(id) {
  const res = await fetch(`${BASE}/admin/contacts/${id}/read`, {
    method: "PATCH",
    headers: jsonHeaders(),
  });
  return res.json();
}

export async function adminDeleteContact(id) {
  const res = await fetch(`${BASE}/admin/contacts/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(),
  });
  return res.json();
}

// ─── Admin: Dashboard ─────────────────────────────────────
export async function adminFetchDashboard() {
  const res = await fetch(`${BASE}/admin/dashboard`, { headers: jsonHeaders() });
  return res.json();
}