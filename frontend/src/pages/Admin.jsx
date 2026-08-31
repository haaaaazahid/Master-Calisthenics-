import { useState, useEffect, useRef, useCallback } from "react";

// Base URL of the real Express/MySQL backend, INCLUDING the "/api" suffix
// e.g. https://mci-backend-production.up.railway.app/api
// Set VITE_API_URL in Vercel's project settings for production.
const API =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const GOOGLE_CLIENT_ID = "884795861510-pf6h5obqhf35cjpfq3ebicqg75f53kbm.apps.googleusercontent.com";
let googleScriptPromise = null;
let googleInitialized = false;

/* --- helpers ------------------------------------------- */
function getToken() { return localStorage.getItem("mci_token") || ""; }
function authH()    { return { Authorization: `Bearer ${getToken()}` }; }
function jsonH()    { return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }; }

/*
 * Safe API helper:
 * - never blindly calls response.json()
 * - handles empty/non-JSON 404/500 responses
 * - automatically adds the current JWT
 * - keeps FormData requests free of a forced Content-Type
 */
async function apiFetch(path, opts = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API}${cleanPath}`;
  const token = getToken();

  const headers = {
    ...(opts.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };

  let res;
  try {
    res = await fetch(url, { ...opts, headers });
  } catch (error) {
    const err = new Error(`Could not reach backend API at ${API}. Make sure the backend is running.`);
    err.cause = error;
    err.networkError = true;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  let data = null;

  try {
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const raw = await res.text();
      data = raw ? { message: raw } : null;
    }
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(
      data?.message || data?.error || `Request failed with HTTP ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    err.authError = res.status === 401 || res.status === 403;
    throw err;
  }

  return data || { success: true };
}

const statusColor = { pending: "bg-yellow-500/20 text-yellow-400", confirmed: "bg-green-500/20 text-green-400", cancelled: "bg-red-500/20 text-red-400", completed: "bg-accent/10 text-accent" };

/* --- MAIN COMPONENT ------------------------------------- */
export default function Admin() {
  const [token, setToken]   = useState(() => localStorage.getItem("mci_token") || "");
  const [admin, setAdmin]   = useState(() => { try { return JSON.parse(localStorage.getItem("mci_admin") || "null"); } catch { return null; } });
  const [tab, setTab]       = useState("dashboard");

  // Login form
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Data
  const [dash, setDash]         = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [posts, setPosts]       = useState([]);
  const [contacts, setContacts] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [gallery, setGallery]   = useState([]);
  const [loading, setLoading]   = useState(false);
  // Booking search & filters
const [bookingSearch, setBookingSearch] = useState("");
const [bookingStatus, setBookingStatus] = useState("");

// Contact search & filters
const [contactSearch, setContactSearch] = useState("");
const [contactReadFilter, setContactReadFilter] = useState("all");

// Booking pagination
const [bookingTotal, setBookingTotal] = useState(0);
const [bookingPage, setBookingPage] = useState(1);
const [bookingTotalPages, setBookingTotalPages] = useState(1);

  // New post form
  const [newPost, setNewPost] = useState({ title: "", content: "", author: "", post_type: "announcement", video_url: "", imageFile: null, preview: null });
  const [postLoading, setPostLoading] = useState(false);

  // New trainer form
  const [newTrainer, setNewTrainer] = useState({ name: "", role: "", bio: "", imageFile: null, preview: null });

  // Gallery
  const [newFolder, setNewFolder] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState({});

  // Settings
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg]   = useState(null);

  /* -- Google Sign-In init -- */
  const handleGoogleLogin = useCallback(async (response) => {
    if (!response?.credential) {
      setLoginErr("Google did not return a valid credential.");
      return;
    }

    try {
      setLoginLoading(true);
      setLoginErr("");

      const data = await apiFetch("/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      if (!data?.success || !data?.token) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Google account is not authorized."
        );
      }

      localStorage.setItem("mci_token", data.token);
      localStorage.setItem(
        "mci_admin",
        JSON.stringify(data.admin || null)
      );
      setToken(data.token);
      setAdmin(data.admin || null);
    } catch (error) {
      console.error("Google login error:", error);
      setLoginErr(
        error?.message || "Google login failed."
      );
    } finally {
      setLoginLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token || googleInitialized) return;

    let cancelled = false;

    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        return Promise.resolve();
      }

      if (googleScriptPromise) {
        return googleScriptPromise;
      }

      googleScriptPromise = new Promise((resolve, reject) => {
        const existing = document.getElementById("mci-google-script");

        if (existing) {
          if (window.google?.accounts?.id) {
            resolve();
            return;
          }

          existing.addEventListener("load", () => resolve(), {
            once: true,
          });
          existing.addEventListener("error", reject, {
            once: true,
          });
          return;
        }

        const script = document.createElement("script");
        script.id = "mci-google-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;

        document.head.appendChild(script);
      });

      return googleScriptPromise;
    };

    loadGoogleScript()
      .then(() => {
        if (cancelled || token || googleInitialized) return;

        const container = document.getElementById(
          "google-signin-btn"
        );

        if (!window.google?.accounts?.id || !container) {
          return;
        }

        if (!googleInitialized) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          googleInitialized = true;
        }

        container.innerHTML = "";

        window.google.accounts.id.renderButton(
          container,
          {
            theme: "filled_black",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: 300,
          }
        );
      })
      .catch((error) => {
        console.error("Google Identity Services load error:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [token, handleGoogleLogin]);

  /* -- Load data on tab change -- */
  const loadRequestRef = useRef(0);

  useEffect(() => {
    if (!token) return;

    const requestId = ++loadRequestRef.current;
    setLoading(true);

    const loaders = {
      dashboard: () => apiFetch("/admin/dashboard", { headers: jsonH() }).then(d => { if (d.success) setDash(d); }),
bookings: () => {
  const params = new URLSearchParams();

  if (bookingSearch.trim()) {
    params.set("search", bookingSearch.trim());
  }

  if (bookingStatus) {
    params.set("status", bookingStatus);
  }

  params.set("page", bookingPage);
  params.set("limit", 20);

  return apiFetch(`/admin/bookings?${params.toString()}`, {
    headers: jsonH(),
  }).then(d => {
    if (d.success) {
      setBookings(d.bookings || []);
      setBookingTotal(d.total || 0);
      setBookingTotalPages(d.totalPages || 1);
    }
  });
},
      reviews:   () => apiFetch("/admin/reviews",   { headers: jsonH() }).then(d => { if (d.success) setReviews(d.reviews); }),
      posts:     () => apiFetch("/admin/posts", { headers: jsonH() }).catch(() => apiFetch("/posts")).then(d => { if (d.success) setPosts(d.posts || []); }),
      contacts:  () => apiFetch("/admin/contacts",  { headers: jsonH() }).then(d => { if (d.success) setContacts(d.contacts); }),
      trainers:  () => apiFetch("/admin/trainers",  { headers: jsonH() }).then(d => { if (d.success) setTrainers(d.trainers); }),
      gallery:   () => apiFetch("/admin/gallery",   { headers: jsonH() }).then(d => { if (d.success) setGallery(d.folders); }),
    };
    (loaders[tab] || loaders.dashboard)()
      .catch((error) => {
        console.error("Admin data load error:", error);

        if (
          error?.status === 401 ||
          error?.status === 403
        ) {
          logout();
        }
      })
      .finally(() => {
        if (requestId === loadRequestRef.current) {
          setLoading(false);
        }
      });
  }, [
    tab,
    token,
    bookingSearch,
    bookingStatus,
    bookingPage,
    logout,
  ]);
  /* -- Auth -- */
  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginErr("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: pass,
        }),
      });

      if (!data?.success || !data?.token) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Login failed"
        );
      }

      localStorage.setItem("mci_token", data.token);
      localStorage.setItem(
        "mci_admin",
        JSON.stringify(data.admin || null)
      );

      setToken(data.token);
      setAdmin(data.admin || null);
      setPass("");
    } catch (error) {
      console.error("Admin login error:", error);
      setLoginErr(
        error?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("mci_token"); localStorage.removeItem("mci_admin");
    setToken(""); setAdmin(null); setTab("dashboard");
  }

  /* -- Posts -- */
  async function createPost(e) {
    e.preventDefault();
    setPostLoading(true);
    setLoginErr("");

    try {
      const fd = new FormData();

      fd.append("title", newPost.title);
      fd.append("content", newPost.content);
      fd.append(
        "author",
        newPost.author || admin?.name || "Coach"
      );
      fd.append("post_type", newPost.post_type);

      if (newPost.video_url) {
        fd.append("video_url", newPost.video_url);
      }

      if (newPost.imageFile) {
        fd.append("image", newPost.imageFile);
      }

      const data = await apiFetch("/admin/posts", {
        method: "POST",
        body: fd,
      });

      if (data?.success) {
        setNewPost({
          title: "",
          content: "",
          author: "",
          post_type: "announcement",
          video_url: "",
          imageFile: null,
          preview: null,
        });

        const d = await apiFetch("/admin/posts");
        if (d?.success) {
          setPosts(d.posts || []);
        }
      } else {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to create post."
        );
      }
    } catch (error) {
      console.error("Create post error:", error);

      if (error?.status === 401 || error?.status === 403) {
        logout();
        return;
      }

      setPostLoading(false);
      window.alert(
        error?.message || "Failed to create post."
      );
      return;
    }

    setPostLoading(false);
  }

  async function deletePost(id) {
    if (!confirm("Delete this post?")) return;
    await apiFetch(`/admin/posts/${id}`, { method: "DELETE", headers: jsonH() });
    setPosts(p => p.filter(x => x.id !== id));
  }

  async function togglePost(id) {
    await apiFetch(`/admin/posts/${id}/toggle`, { method: "PATCH", headers: jsonH() });
    const d = await apiFetch("/admin/posts", { headers: jsonH() }).catch(() => apiFetch("/posts"));
    if (d.success) setPosts(d.posts || []);
  }

  /* -- Bookings -- */
  async function updateBooking(id, status) {
    await apiFetch(`/admin/bookings/${id}`, { method: "PATCH", headers: jsonH(), body: JSON.stringify({ status }) });
    setBookings(b => b.map(x => x.id === id ? { ...x, status } : x));
  }
  async function deleteBooking(id) {
    if (!confirm("Delete booking?")) return;
    await apiFetch(`/admin/bookings/${id}`, { method: "DELETE", headers: jsonH() });
    setBookings(b => b.filter(x => x.id !== id));
  }

  /* -- Reviews -- */
  async function approveReview(id) {
    await apiFetch(`/admin/reviews/${id}/approve`, { method: "PATCH", headers: jsonH() });
    setReviews(r => r.map(x => x.id === id ? { ...x, status: "approved" } : x));
  }
  async function rejectReview(id) {
    await apiFetch(`/admin/reviews/${id}/reject`, { method: "PATCH", headers: jsonH() });
    setReviews(r => r.map(x => x.id === id ? { ...x, status: "rejected" } : x));
  }
  async function deleteReview(id) {
    if (!confirm("Delete review?")) return;
    await apiFetch(`/admin/reviews/${id}`, { method: "DELETE", headers: jsonH() });
    setReviews(r => r.filter(x => x.id !== id));
  }

  /* -- Contacts -- */
  async function markRead(id) {
    await apiFetch(`/admin/contacts/${id}/read`, { method: "PATCH", headers: jsonH() });
    setContacts(c => c.map(x => x.id === id ? { ...x, is_read: 1 } : x));
  }
  async function deleteContact(id) {
    if (!confirm("Delete message?")) return;
    await apiFetch(`/admin/contacts/${id}`, { method: "DELETE", headers: jsonH() });
    setContacts(c => c.filter(x => x.id !== id));
  }

  /* -- Trainers -- */
  async function createTrainer(e) {
    e.preventDefault();

    try {
      const fd = new FormData();

      fd.append("name", newTrainer.name);
      fd.append("role", newTrainer.role);
      fd.append("bio", newTrainer.bio);

      if (newTrainer.imageFile) {
        fd.append("image", newTrainer.imageFile);
      }

      const data = await apiFetch("/admin/trainers", {
        method: "POST",
        body: fd,
      });

      if (data?.success) {
        setNewTrainer({
          name: "",
          role: "",
          bio: "",
          imageFile: null,
          preview: null,
        });

        const d = await apiFetch("/admin/trainers");
        if (d?.success) {
          setTrainers(d.trainers || []);
        }
      } else {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to create trainer."
        );
      }
    } catch (error) {
      console.error("Create trainer error:", error);

      if (error?.status === 401 || error?.status === 403) {
        logout();
        return;
      }

      window.alert(
        error?.message ||
          "Failed to create trainer."
      );
    }
  }
  async function deleteTrainer(id) {
    if (!window.confirm("Delete this trainer permanently?")) return;

    try {
      const data = await apiFetch(
        `/admin/trainers/${id}`,
        {
          method: "DELETE",
          headers: jsonH(),
        }
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            data?.error ||
            "The server could not delete this trainer."
        );
      }

      setTrainers((current) =>
        current.filter(
          (trainer) => trainer.id !== id
        )
      );

      window.alert("Trainer deleted successfully.");
    } catch (error) {
      console.error(
        "Delete trainer error:",
        error
      );

      if (
        error?.status === 401 ||
        error?.status === 403
      ) {
        logout();
        return;
      }

      window.alert(
        error?.message ||
          "Failed to delete trainer."
      );
    }
  }

  /* -- Gallery -- */
  async function createFolder(e) {
    e.preventDefault();
    const data = await apiFetch("/admin/gallery/folders", { method: "POST", headers: jsonH(), body: JSON.stringify({ name: newFolder }) });
    if (data.success) {
      setNewFolder("");
      const d = await apiFetch("/admin/gallery", { headers: jsonH() }); if (d.success) setGallery(d.folders);
    }
  }
  async function deleteFolder(id) {
    if (!confirm("Delete folder and all its photos?")) return;
    await apiFetch(`/admin/gallery/folders/${id}`, { method: "DELETE", headers: jsonH() });
    setGallery(g => g.filter(x => x.id !== id));
  }
  async function uploadPhoto(folderId, file, caption = "") {
    setUploadingPhoto((p) => ({
      ...p,
      [folderId]: true,
    }));

    try {
      const fd = new FormData();

      fd.append("folder_id", folderId);
      fd.append("image", file);

      if (caption) {
        fd.append("caption", caption);
      }

      const data = await apiFetch(
        "/admin/gallery/photos",
        {
          method: "POST",
          body: fd,
        }
      );

      if (data?.success) {
        const d = await apiFetch(
          "/admin/gallery"
        );

        if (d?.success) {
          setGallery(d.folders || []);
        }
      } else {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to upload photo."
        );
      }
    } catch (error) {
      console.error(
        "Gallery upload error:",
        error
      );

      if (
        error?.status === 401 ||
        error?.status === 403
      ) {
        logout();
        return;
      }

      window.alert(
        error?.message ||
          "Failed to upload photo."
      );
    } finally {
      setUploadingPhoto((p) => ({
        ...p,
        [folderId]: false,
      }));
    }
  }
  async function deletePhoto(id) {
    if (!confirm("Delete photo?")) return;
    await apiFetch(`/admin/gallery/photos/${id}`, { method: "DELETE", headers: jsonH() });
    setGallery(g => g.map(folder => ({ ...folder, photos: folder.photos.filter(p => p.id !== id) })));
  }

  /* -- Change Password -- */
  async function changePassword(e) {
    e.preventDefault(); setPwMsg(null);
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type: "error", text: "Passwords don't match" }); return; }
    const data = await apiFetch("/auth/change-password", { method: "POST", headers: jsonH(), body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.newPw }) });
    setPwMsg({ type: data.success ? "success" : "error", text: data.message });
    if (data.success) setPwForm({ current: "", newPw: "", confirm: "" });
  }

  // Client-side contact filtering (the contacts endpoint already returns the full admin list).
  const filteredContacts = contacts.filter((c) => {
    const q = contactSearch.trim().toLowerCase();
    const matchesSearch = !q || [c.name, c.email, c.phone, c.message, c.subject]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));

    const matchesRead =
      contactReadFilter === "all" ||
      (contactReadFilter === "unread" && !Number(c.is_read)) ||
      (contactReadFilter === "read" && Number(c.is_read));

    return matchesSearch && matchesRead;
  });

  /* ----------- LOGIN SCREEN ----------- */
  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black mb-2"><span className="text-orange-500">MCI</span> Coach Access</h1>
            <p className="text-text-muted text-sm">Sign in to manage your gym</p>
          </div>

          <div className="bg-surface border border-border rounded-3xl p-8">
            <form onSubmit={handleLogin} className="space-y-4 mb-6">
              <input
                type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition text-sm"
              />
              <input
                type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} required
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition text-sm"
              />
              {loginErr && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{loginErr}</p>}
              <button
                type="submit" disabled={loginLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition text-white font-bold py-3.5 rounded-xl"
              >
                {loginLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-text-muted text-xs">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex justify-center">
              <div id="google-signin-btn" />
            </div>

            <p className="text-center text-xs text-text-muted mt-4 break-all">
              API: {API}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ----------- TABS ----------- */
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "D" },
    { id: "posts",     label: "Posts",     icon: "P" },
    { id: "bookings",  label: "Bookings",  icon: "B" },
    { id: "reviews",   label: "Reviews",   icon: "R" },
    { id: "contacts",  label: "Messages",  icon: "M" },
    { id: "trainers",  label: "Trainers",  icon: "T" },
    { id: "gallery",   label: "Gallery",   icon: "G" },
    { id: "settings",  label: "Settings",  icon: "S" },
  ];

  return (
    <div className="min-h-screen bg-bg text-text overflow-x-hidden">

      {/* TOP BAR */}
      <div className="bg-surface border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-black text-orange-500">MCI COACH ACCESS</h1>
          <p className="text-xs text-text-muted">Welcome, {admin?.name}</p>
        </div>
        <button onClick={logout} className="text-sm text-text-muted hover:text-accent border border-border hover:border-gold/40 px-4 py-2 rounded-xl transition">
          Logout
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-65px)]">

        {/* SIDEBAR */}
        <aside className="w-56 bg-surface border-r border-border py-6 flex-shrink-0 hidden md:flex flex-col">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? "text-orange-400 bg-orange-500/10 border-r-2 border-orange-500"
                  : "text-text-muted hover:text-accent hover:bg-white/5"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </aside>

        {/* MOBILE TABS */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex overflow-x-auto z-40 px-2 py-2 gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                tab === t.id ? "text-orange-400 bg-orange-500/10" : "text-text-muted"
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <main className="min-w-0 flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">

          {/* -- DASHBOARD -- */}
          {tab === "dashboard" && (
            <div>
              <h2 className="text-2xl font-black mb-8">OVERVIEW</h2>
              {dash ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: "Total Bookings",  value: dash.stats.total_bookings  },
                      { label: "Pending Bookings",value: dash.stats.pending_bookings },
                      { label: "Pending Reviews", value: dash.stats.pending_reviews  },
                      { label: "Unread Messages", value: dash.stats.unread_contacts  },
                    ].map((s, i) => (
                      <div key={i} className="bg-surface border border-border rounded-2xl p-6">
                        <p className="text-text-muted text-sm mb-2">{s.label}</p>
                        <p className="text-4xl font-black text-orange-400">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-surface border border-border rounded-2xl p-6">
                      <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-text-muted">Recent Bookings</h3>
                      {dash.recent_bookings?.length ? dash.recent_bookings.map(b => (
                        <div key={b.id} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                          <div>
                            <p className="font-medium text-sm">{b.name}</p>
                            <p className="text-xs text-text-muted">{b.session_time}  |  {b.program}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[b.status] || "bg-gray-500/20 text-text-muted"}`}>
                            {b.status}
                          </span>
                        </div>
                      )) : <p className="text-text-muted text-sm">No bookings yet</p>}
                    </div>
                    <div className="bg-surface border border-border rounded-2xl p-6">
                      <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-text-muted">Recent Messages</h3>
                      {dash.recent_contacts?.length ? dash.recent_contacts.map(c => (
                        <div key={c.id} className="py-3 border-b border-border last:border-0">
                          <div className="flex justify-between">
                            <p className="font-medium text-sm">{c.name}</p>
                            {!c.is_read && <span className="text-xs text-orange-400 bg-orange-500/10 px-2 rounded-full">new</span>}
                          </div>
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">{c.message}</p>
                        </div>
                      )) : <p className="text-text-muted text-sm">No messages yet</p>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="bg-surface rounded-2xl h-28 animate-pulse" />)}
                </div>
              )}
            </div>
          )}

          {/* -- POSTS -- */}
          {tab === "posts" && (
            <div>
              <h2 className="text-2xl font-black mb-8">POSTS</h2>

              {/* Create Post */}
              <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
                <h3 className="font-bold mb-5 text-orange-400">Create New Post</h3>
                <form onSubmit={createPost} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text" placeholder="Title *" value={newPost.title}
                      onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} required
                      className="bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                    />
                    <input
                      type="text" placeholder="Author name" value={newPost.author}
                      onChange={e => setNewPost(p => ({ ...p, author: e.target.value }))}
                      className="bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                  <textarea
                    rows={4} placeholder="Post content *" value={newPost.content}
                    onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} required
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition resize-none"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <select
                      value={newPost.post_type} onChange={e => setNewPost(p => ({ ...p, post_type: e.target.value }))}
                      className="bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-orange-500 transition"
                    >
                      <option value="announcement">Announcement</option>
                      <option value="workout">Workout</option>
                      <option value="photo">Photo</option>
                      <option value="video">Video</option>
                    </select>
                    <input
                      type="text" placeholder="YouTube URL (optional)" value={newPost.video_url}
                      onChange={e => setNewPost(p => ({ ...p, video_url: e.target.value }))}
                      className="bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  {/* Image Upload */}
                  <div
                    onClick={() => document.getElementById("post-image-input").click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${newPost.preview ? "border-orange-500/40 bg-orange-500/5" : "border-border hover:border-orange-500/40 hover:bg-orange-500/5"}`}
                  >
                    <input
                      id="post-image-input" type="file" accept="image/*" className="hidden"
                      onChange={e => {
                        const f = e.target.files[0];
                        if (f) setNewPost(p => ({ ...p, imageFile: f, preview: URL.createObjectURL(f) }));
                      }}
                    />
                    {newPost.preview ? (
                      <div>
                        <img src={newPost.preview} alt="preview" className="max-h-48 mx-auto rounded-xl object-cover mb-2" />
                        <button type="button" onClick={e => { e.stopPropagation(); setNewPost(p => ({ ...p, imageFile: null, preview: null })); }} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                      </div>
                    ) : (
                      <>
                        <p className="text-text-muted text-sm">Click to upload a photo</p>
                        <p className="text-text-muted text-xs mt-1">JPG, PNG, WebP up to 10MB</p>
                      </>
                    )}
                  </div>

                  <button
                    type="submit" disabled={postLoading}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition text-white font-bold px-8 py-3 rounded-xl"
                  >
                    {postLoading ? "Publishing..." : "Publish Post "}
                  </button>
                </form>
              </div>

              {/* Post List */}
              <div className="space-y-4">
                {posts.length === 0 ? <p className="text-text-muted text-center py-12">No posts yet. Create your first post above!</p> :
                posts.map(post => (
                  <div key={post.id} className="bg-surface border border-border rounded-2xl p-5 flex gap-4">
                    {post.image_url && (
                      <img src={post.image_url} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h4 className="font-bold leading-snug">{post.title}</h4>
                          <p className="text-xs text-text-muted mt-0.5">{post.author}  |  {post.post_type}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => togglePost(post.id)} className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${post.published ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-gray-500/20 text-text-muted hover:bg-gray-500/30"}`}>
                            {post.published ? "Published" : "Hidden"}
                          </button>
                          <button onClick={() => deletePost(post.id)} className="text-xs px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium">
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-text-muted text-xs mt-2 line-clamp-2">{post.content}</p>
                      <p className="text-xs text-text-muted mt-1">Likes: {post.likes} likes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -- BOOKINGS -- */}
          {tab === "bookings" && (
            <div>
              <h2 className="text-2xl font-black mb-8">BOOKINGS</h2>

              {/* Booking search + filters */}
              <div className="bg-surface border border-border rounded-2xl p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="search"
                      value={bookingSearch}
                      onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(1); }}
                      placeholder="Search name, phone, email, program..."
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 pl-4 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <select
                    value={bookingStatus}
                    onChange={(e) => { setBookingStatus(e.target.value); setBookingPage(1); }}
                    className="bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="">All Status</option>
                    <option value="New">New</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {(bookingSearch || bookingStatus) && (
                    <button
                      type="button"
                      onClick={() => { setBookingSearch(""); setBookingStatus(""); setBookingPage(1); }}
                      className="border border-border text-text-muted hover:border-orange-500 hover:text-orange-400 px-5 py-3 rounded-xl transition text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="mt-3 text-xs text-text-muted">
                  Showing {bookings.length} of {bookingTotal} booking{bookingTotal !== 1 ? "s" : ""}
                </div>
              </div>

              {bookings.length === 0 ? <p className="text-text-muted text-center py-16">No bookings match your search.</p> :
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-surface border border-border rounded-2xl p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-bold text-lg">{b.name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-muted">
                          <span>Phone: {b.phone}</span>
                          {b.email && <span>Email: {b.email}</span>}
                          <span>Time: {b.session_time}</span>
                          {b.program && <span>Program: {b.program}</span>}
                          {b.preferred_date && <span>Date: {b.preferred_date}</span>}
                          {b.one_week_offer ? <span className="text-orange-400">1-Week Trial ₹499</span> : null}
                        </div>
                        {b.message && <p className="text-text-muted text-sm mt-2 italic">"{b.message}"</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColor[b.status] || "bg-gray-500/20 text-text-muted"}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {["confirmed", "pending", "cancelled", "completed"].map(s => (
                        <button key={s} onClick={() => updateBooking(b.id, s)}
                          className={`text-xs px-3 py-1.5 rounded-xl transition font-medium ${b.status === s ? "bg-orange-500 text-white" : "bg-surface-alt text-text-muted hover:bg-border"}`}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                      <button onClick={() => deleteBooking(b.id)} className="text-xs px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium ml-auto">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>}

              {/* Booking pagination */}
              {bookingTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    type="button"
                    disabled={bookingPage <= 1}
                    onClick={() => setBookingPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-orange-500 transition"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-text-muted">
                    Page {bookingPage} of {bookingTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={bookingPage >= bookingTotalPages}
                    onClick={() => setBookingPage((p) => Math.min(bookingTotalPages, p + 1))}
                    className="px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-orange-500 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* -- REVIEWS -- */}
          {tab === "reviews" && (
            <div>
              <h2 className="text-2xl font-black mb-8">REVIEWS</h2>
              {reviews.length === 0 ? <p className="text-text-muted text-center py-16">No reviews yet.</p> :
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-surface border border-border rounded-2xl p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold">{r.name}</p>
                          <div className="flex gap-0.5">{[...Array(r.rating)].map((_,j) => <span key={j} className="text-orange-400">*</span>)}</div>
                        </div>
                        {r.program && <p className="text-xs text-text-muted mb-2">{r.program}</p>}
                        <p className="text-text-muted text-sm leading-relaxed">"{r.review}"</p>
                      </div>
                      <div>
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${r.status === "approved" ? "bg-green-500/20 text-green-400" : r.status === "rejected" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {r.status !== "approved" && (
                        <button onClick={() => approveReview(r.id)} className="text-xs px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition font-medium">
                          Approve
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button onClick={() => rejectReview(r.id)} className="text-xs px-3 py-1.5 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition font-medium">
                          Reject
                        </button>
                      )}
                      <button onClick={() => deleteReview(r.id)} className="text-xs px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium ml-auto">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>}
            </div>
          )}

          {/* -- CONTACTS -- */}
          {tab === "contacts" && (
            <div>
              <h2 className="text-2xl font-black mb-8">MESSAGES</h2>

              {/* Contact search + read filter */}
              <div className="bg-surface border border-border rounded-2xl p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="search"
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      placeholder="Search name, email, phone, message..."
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 pl-4 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <select
                    value={contactReadFilter}
                    onChange={(e) => setContactReadFilter(e.target.value)}
                    className="bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="all">All Messages</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>

                  {(contactSearch || contactReadFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => { setContactSearch(""); setContactReadFilter("all"); }}
                      className="border border-border text-text-muted hover:border-orange-500 hover:text-orange-400 px-5 py-3 rounded-xl transition text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="mt-3 text-xs text-text-muted">
                  Showing {filteredContacts.length} of {contacts.length} message{contacts.length !== 1 ? "s" : ""}
                </div>
              </div>

              {filteredContacts.length === 0 ? <p className="text-text-muted text-center py-16">No messages match your search.</p> :
              <div className="space-y-4">
                {filteredContacts.map(c => (
                  <div key={c.id} className={`bg-surface border rounded-2xl p-5 ${c.is_read ? "border-border" : "border-orange-500/30"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{c.name}</p>
                          {!c.is_read && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 rounded-full">New</span>}
                        </div>
                        <div className="flex gap-4 text-sm text-text-muted mt-1">
                          <span>{c.email}</span>
                          {c.phone && <span>{c.phone}</span>}
                        </div>
                        <p className="text-text-muted text-sm mt-3 leading-relaxed">{c.message}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {!c.is_read && (
                        <button onClick={() => markRead(c.id)} className="text-xs px-3 py-1.5 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition font-medium">
                          Mark Read
                        </button>
                      )}
                      <a href={`mailto:${c.email}`} className="text-xs px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition font-medium">
                        Reply via Email
                      </a>
                      <button onClick={() => deleteContact(c.id)} className="text-xs px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium ml-auto">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>}
            </div>
          )}

          {/* -- TRAINERS -- */}
          {tab === "trainers" && (
            <div>
              <h2 className="text-2xl font-black mb-8">TRAINERS</h2>

              {/* Add Trainer */}
              <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
                <h3 className="font-bold mb-5 text-orange-400">Add New Trainer</h3>
                <form onSubmit={createTrainer} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text" placeholder="Name *" value={newTrainer.name}
                      onChange={e => setNewTrainer(p => ({ ...p, name: e.target.value }))} required
                      className="bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                    />
                    <input
                      type="text" placeholder="Role (e.g. Head Coach)" value={newTrainer.role}
                      onChange={e => setNewTrainer(p => ({ ...p, role: e.target.value }))} required
                      className="bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                  <textarea
                    rows={2} placeholder="Short bio (optional)" value={newTrainer.bio}
                    onChange={e => setNewTrainer(p => ({ ...p, bio: e.target.value }))}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition resize-none"
                  />
                  <div
                    onClick={() => document.getElementById("trainer-img").click()}
                    className="border-2 border-dashed border-border hover:border-orange-500/40 rounded-xl p-5 text-center cursor-pointer transition"
                  >
                    <input id="trainer-img" type="file" accept="image/*" className="hidden"
                      onChange={e => {
                        const f = e.target.files[0];
                        if (f) setNewTrainer(p => ({ ...p, imageFile: f, preview: URL.createObjectURL(f) }));
                      }}
                    />
                    {newTrainer.preview ? (
                      <div>
                        <img src={newTrainer.preview} alt="" className="w-24 h-24 rounded-full mx-auto object-cover mb-2" />
                        <p className="text-xs text-text-muted">Click to change</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-text-muted text-sm">Upload trainer photo</p>
                        <p className="text-text-muted text-xs mt-1">Recommended: square crop</p>
                      </>
                    )}
                  </div>
                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 transition text-white font-bold px-8 py-3 rounded-xl">
                    Add Trainer
                  </button>
                </form>
              </div>

              {/* Trainer List */}
              <div className="grid md:grid-cols-3 gap-5">
                {trainers.length === 0 ? (
                  loading ? (
                    <p className="text-text-muted col-span-3 text-center py-12">Loading trainers...</p>
                  ) : (
                    <p className="text-text-muted col-span-3 text-center py-12">No trainers added yet.</p>
                  )
                ) :
                trainers.map(t => (
                  <div key={t.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
                    {t.image_url ? (
                      <img src={t.image_url} alt={t.name} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-orange-500/10 to-orange-900/10 flex items-center justify-center">
                        <span className="text-5xl opacity-30">Trainer</span>
                      </div>
                    )}
                    <div className="p-5">
                      <p className="font-bold text-orange-400">{t.name}</p>
                      <p className="text-text-muted text-sm mt-0.5">{t.role}</p>
                      {t.bio && <p className="text-text-muted text-xs mt-2 line-clamp-2">{t.bio}</p>}
                      <button onClick={() => deleteTrainer(t.id)} className="mt-4 text-xs px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -- GALLERY -- */}
          {tab === "gallery" && (
            <div>
              <h2 className="text-2xl font-black mb-8">GALLERY</h2>

              {/* Create Folder */}
              <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
                <h3 className="font-bold mb-4 text-orange-400">Create New Folder</h3>
                <form onSubmit={createFolder} className="flex gap-3">
                  <input
                    type="text" placeholder="Folder name (e.g. Competitions, Kids, Gym)" value={newFolder}
                    onChange={e => setNewFolder(e.target.value)} required
                    className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                  />
                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 transition text-white font-bold px-6 py-3 rounded-xl whitespace-nowrap">
                    Create Folder
                  </button>
                </form>
              </div>

              {/* Folders */}
              {gallery.length === 0 ? <p className="text-text-muted text-center py-12">No folders yet. Create one above!</p> :
              <div className="space-y-8">
                {gallery.map(folder => (
                  <div key={folder.id} className="bg-surface border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-xl font-bold">{folder.name}</h3>
                        <p className="text-text-muted text-sm">{folder.photos?.length || 0} photos</p>
                      </div>
                      <div className="flex gap-3 items-center">
                        {uploadingPhoto[folder.id] && <span className="text-xs text-orange-400">Uploading...</span>}
                        <label className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition text-xs font-bold px-4 py-2 rounded-xl cursor-pointer">
                          + Add Photos
                          <input type="file" accept="image/*" multiple className="hidden"
                            onChange={e => {
                              [...e.target.files].forEach(f => uploadPhoto(folder.id, f));
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <button onClick={() => deleteFolder(folder.id)} className="text-xs px-3 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium">
                          Delete Folder
                        </button>
                      </div>
                    </div>

                    {folder.photos?.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {folder.photos.map(photo => (
                          <div key={photo.id} className="relative group">
                            <img src={photo.image_url} alt="" className="w-full aspect-square object-cover rounded-xl" />
                            <button
                              onClick={() => deletePhoto(photo.id)}
                              className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-500/80"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                        <p className="text-text-muted text-sm">No photos yet. Click "Add Photos" to upload.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>}
            </div>
          )}

          {/* -- SETTINGS -- */}
          {tab === "settings" && (
            <div className="max-w-lg">
              <h2 className="text-2xl font-black mb-8">SETTINGS</h2>

              <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-orange-400 mb-1">Account</h3>
                <p className="text-text-muted text-sm mb-5">Logged in as {admin?.name}  |  {admin?.email}</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xl">
                    {admin?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{admin?.name}</p>
                    <p className="text-text-muted text-sm">{admin?.role}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6">
                <h3 className="font-bold text-orange-400 mb-5">Change Password</h3>
                <form onSubmit={changePassword} className="space-y-4">
                  <input
                    type="password" placeholder="Current password" value={pwForm.current}
                    onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                  />
                  <input
                    type="password" placeholder="New password" value={pwForm.newPw}
                    onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} required
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                  />
                  <input
                    type="password" placeholder="Confirm new password" value={pwForm.confirm}
                    onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
                  />
                  {pwMsg && (
                    <p className={`text-sm px-4 py-2 rounded-xl border ${pwMsg.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                      {pwMsg.text}
                    </p>
                  )}
                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 transition text-white font-bold px-8 py-3 rounded-xl">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
