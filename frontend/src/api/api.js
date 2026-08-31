const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api").replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("mci_token") || "";
}

async function request(path, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API}${cleanPath}`;
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (error) {
    const err = new Error("Network error — could not reach the MCI backend.");
    err.cause = error;
    throw err;
  }

  const type = response.headers.get("content-type") || "";
  let data = null;
  try {
    data = type.includes("application/json") ? await response.json() : await response.text();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = typeof data === "string" ? data : data?.message || data?.error;
    const err = new Error(message || `Request failed with HTTP ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return typeof data === "string" ? { success: true, message: data } : (data || { success: true });
}

export const apiFetch = request;
export const apiGet = (path, options = {}) => request(path, { ...options, method: "GET" });
export const apiPost = (path, body = {}, options = {}) => request(path, { ...options, method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) });
export const apiPatch = (path, body = {}, options = {}) => request(path, { ...options, method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body) });
export const apiDelete = (path, options = {}) => request(path, { ...options, method: "DELETE" });

export const submitBooking = (data) => apiPost("/bookings", data);
export const submitContact = (data) => apiPost("/contact", data);
export const getPrograms = () => apiGet("/programs");
export const getReviews = () => apiGet("/reviews");
export const submitReview = (data) => apiPost("/reviews", data);
export const getPosts = () => apiGet("/posts");
export const likePost = (id) => apiPatch(`/posts/${id}/like`, {});
export const getTrainers = () => apiGet("/trainers");
export const getGallery = () => apiGet("/gallery");
export const subscribe = (email, name = "") => apiPost("/subscribe", { email, name });
export const unsubscribe = (email) => apiPost("/unsubscribe", { email });

export const adminLogin = (data) => apiPost("/auth/login", data);
export const adminMe = () => apiGet("/auth/me");
export const adminChangePassword = (data) => apiPost("/auth/change-password", data);
export const adminDashboard = () => apiGet("/admin/dashboard");
export const adminBookings = (params = {}) => {
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))).toString();
  return apiGet(`/admin/bookings${query ? `?${query}` : ""}`);
};
export const adminUpdateBooking = (id, data) => apiPatch(`/admin/bookings/${id}`, data);
export const adminDeleteBooking = (id) => apiDelete(`/admin/bookings/${id}`);
export const adminContacts = (params = {}) => {
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))).toString();
  return apiGet(`/admin/contacts${query ? `?${query}` : ""}`);
};
export const adminMarkContactRead = (id) => apiPatch(`/admin/contacts/${id}/read`, {});
export const adminDeleteContact = (id) => apiDelete(`/admin/contacts/${id}`);
export const adminReviews = () => apiGet("/admin/reviews");
export const adminApproveReview = (id) => apiPatch(`/admin/reviews/${id}/approve`, {});
export const adminRejectReview = (id) => apiPatch(`/admin/reviews/${id}/reject`, {});
export const adminDeleteReview = (id) => apiDelete(`/admin/reviews/${id}`);
export const adminPosts = () => apiGet("/admin/posts");
export const adminDeletePost = (id) => apiDelete(`/admin/posts/${id}`);
export const adminTogglePost = (id) => apiPatch(`/admin/posts/${id}/toggle`, {});
export const adminPrograms = () => apiGet("/programs");
export const adminUpdateProgram = (id, data) => apiPatch(`/admin/programs/${id}`, data);
export const adminTrainers = () => apiGet("/admin/trainers");
export const adminGallery = () => apiGet("/admin/gallery");
export const adminSubscribers = () => apiGet("/admin/subscribers");
