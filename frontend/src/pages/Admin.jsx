import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const GOOGLE_CLIENT_ID = "884795861510-pf6h5obqhf35cjpfq3ebicqg75f53kbm.apps.googleusercontent.com";

/* ─── helpers ─────────────────────────────────────────── */
function getToken() { return localStorage.getItem("mci_token") || ""; }
function authH()    { return { Authorization: `Bearer ${getToken()}` }; }
function jsonH()    { return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }; }

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, opts);
  return res.json();
}

const statusColor = { pending: "bg-yellow-500/20 text-yellow-400", confirmed: "bg-green-500/20 text-green-400", cancelled: "bg-red-500/20 text-red-400", completed: "bg-blue-500/20 text-blue-400" };

/* ─── MAIN COMPONENT ───────────────────────────────────── */
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

  /* ── Google Sign-In init ── */
  useEffect(() => {
    if (token) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
      window.google?.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "filled_black", size: "large", text: "signin_with", shape: "rectangular", width: 300 }
      );
    };
    document.body.appendChild(script);
  }, [token]);

  /* ── Load data on tab change ── */
  useEffect(() => {
    if (!token) return;
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
    (loaders[tab] || loaders.dashboard)().finally(() => setLoading(false));
}, [tab, token, bookingSearch, bookingStatus, bookingPage]);
  /* ── Auth ── */
  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true); setLoginErr("");
    const data = await apiFetch("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pass }) });
    setLoginLoading(false);
    if (data.success) {
      localStorage.setItem("mci_token", data.token);
      localStorage.setItem("mci_admin", JSON.stringify(data.admin));
      setToken(data.token); setAdmin(data.admin);
    } else { setLoginErr(data.message || "Login failed"); }
  }

  async function handleGoogleLogin(response) {
    setLoginLoading(true);
    const data = await apiFetch("/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential: response.credential }) });
    setLoginLoading(false);
    if (data.success) {
      localStorage.setItem("mci_token", data.token);
      localStorage.setItem("mci_admin", JSON.stringify(data.admin));
      setToken(data.token); setAdmin(data.admin);
    } else { setLoginErr(data.message || "Google login failed — account not authorized."); }
  }

  function logout() {
    localStorage.removeItem("mci_token"); localStorage.removeItem("mci_admin");
    setToken(""); setAdmin(null); setTab("dashboard");
  }

  /* ── Posts ── */
  async function createPost(e) {
    e.preventDefault(); setPostLoading(true);
    const fd = new FormData();
    fd.append("title", newPost.title); fd.append("content", newPost.content);
    fd.append("author", newPost.author || admin?.name || "Coach");
    fd.append("post_type", newPost.post_type);
    if (newPost.video_url) fd.append("video_url", newPost.video_url);
    if (newPost.imageFile) fd.append("image", newPost.imageFile);
    const data = await fetch(`${API}/admin/posts`, { method: "POST", headers: authH(), body: fd }).then(r => r.json());
    setPostLoading(false);
    if (data.success) {
      setNewPost({ title: "", content: "", author: "", post_type: "announcement", video_url: "", imageFile: null, preview: null });
      const d = await apiFetch("/posts"); if (d.success) setPosts(d.posts);
    }
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

  /* ── Bookings ── */
  async function updateBooking(id, status) {
    await apiFetch(`/admin/bookings/${id}`, { method: "PATCH", headers: jsonH(), body: JSON.stringify({ status }) });
    setBookings(b => b.map(x => x.id === id ? { ...x, status } : x));
  }
  async function deleteBooking(id) {
    if (!confirm("Delete booking?")) return;
    await apiFetch(`/admin/bookings/${id}`, { method: "DELETE", headers: jsonH() });
    setBookings(b => b.filter(x => x.id !== id));
  }

  /* ── Reviews ── */
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

  /* ── Contacts ── */
  async function markRead(id) {
    await apiFetch(`/admin/contacts/${id}/read`, { method: "PATCH", headers: jsonH() });
    setContacts(c => c.map(x => x.id === id ? { ...x, is_read: 1 } : x));
  }
  async function deleteContact(id) {
    if (!confirm("Delete message?")) return;
    await apiFetch(`/admin/contacts/${id}`, { method: "DELETE", headers: jsonH() });
    setContacts(c => c.filter(x => x.id !== id));
  }

  /* ── Trainers ── */
  async function createTrainer(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", newTrainer.name); fd.append("role", newTrainer.role); fd.append("bio", newTrainer.bio);
    if (newTrainer.imageFile) fd.append("image", newTrainer.imageFile);
    const data = await fetch(`${API}/admin/trainers`, { method: "POST", headers: authH(), body: fd }).then(r => r.json());
    if (data.success) {
      setNewTrainer({ name: "", role: "", bio: "", imageFile: null, preview: null });
      const d = await apiFetch("/admin/trainers", { headers: jsonH() }); if (d.success) setTrainers(d.trainers);
    }
  }
  async function deleteTrainer(id) {
    if (!confirm("Delete trainer?")) return;
    await apiFetch(`/admin/trainers/${id}`, { method: "DELETE", headers: jsonH() });
    setTrainers(t => t.filter(x => x.id !== id));
  }

  /* ── Gallery ── */
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
    setUploadingPhoto(p => ({ ...p, [folderId]: true }));
    const fd = new FormData();
    fd.append("folder_id", folderId); fd.append("image", file); if (caption) fd.append("caption", caption);
    const data = await fetch(`${API}/admin/gallery/photos`, { method: "POST", headers: authH(), body: fd }).then(r => r.json());
    setUploadingPhoto(p => ({ ...p, [folderId]: false }));
    if (data.success) {
      const d = await apiFetch("/admin/gallery", { headers: jsonH() }); if (d.success) setGallery(d.folders);
    }
  }
  async function deletePhoto(id) {
    if (!confirm("Delete photo?")) return;
    await apiFetch(`/admin/gallery/photos/${id}`, { method: "DELETE", headers: jsonH() });
    setGallery(g => g.map(folder => ({ ...folder, photos: folder.photos.filter(p => p.id !== id) })));
  }

  /* ── Change Password ── */
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

  /* ─────────── LOGIN SCREEN ─────────── */
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black mb-2"><span className="text-orange-500">MCI</span> Coach Access</h1>
            <p className="text-gray-500 text-sm">Sign in to manage your gym</p>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8">
            <form onSubmit={handleLogin} className="space-y-4 mb-6">
              <input
                type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition text-sm"
              />
              <input
                type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} required
                className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition text-sm"
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
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-500 text-xs">or</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            <div className="flex justify-center">
              <div id="google-signin-btn" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────── TABS ─────────── */
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "posts",     label: "Posts",     icon: "📝" },
    { id: "bookings",  label: "Bookings",  icon: "📅" },
    { id: "reviews",   label: "Reviews",   icon: "⭐" },
    { id: "contacts",  label: "Messages",  icon: "✉️" },
    { id: "trainers",  label: "Trainers",  icon: "👥" },
    { id: "gallery",   label: "Gallery",   icon: "🖼️" },
    { id: "settings",  label: "Settings",  icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">

      {/* TOP BAR */}
      <div className="bg-[#111827] border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-black text-orange-500">MCI COACH ACCESS</h1>
          <p className="text-xs text-gray-500">Welcome, {admin?.name}</p>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-xl transition">
          Logout
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-65px)]">

        {/* SIDEBAR */}
        <aside className="w-56 bg-[#111827] border-r border-gray-800 py-6 flex-shrink-0 hidden md:flex flex-col">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? "text-orange-400 bg-orange-500/10 border-r-2 border-orange-500"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </aside>

        {/* MOBILE TABS */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-gray-800 flex overflow-x-auto z-40 px-2 py-2 gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                tab === t.id ? "text-orange-400 bg-orange-500/10" : "text-gray-500"
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 overflow-auto">

          {/* ── DASHBOARD ── */}
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
                      <div key={i} className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                        <p className="text-gray-500 text-sm mb-2">{s.label}</p>
                        <p className="text-4xl font-black text-orange-400">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                      <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-gray-400">Recent Bookings</h3>
                      {dash.recent_bookings?.length ? dash.recent_bookings.map(b => (
                        <div key={b.id} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
                          <div>
                            <p className="font-medium text-sm">{b.name}</p>
                            <p className="text-xs text-gray-500">{b.session_time} · {b.program}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[b.status] || "bg-gray-500/20 text-gray-400"}`}>
                            {b.status}
                          </span>
                        </div>
                      )) : <p className="text-gray-600 text-sm">No bookings yet</p>}
                    </div>
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                      <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-gray-400">Recent Messages</h3>
                      {dash.recent_contacts?.length ? dash.recent_contacts.map(c => (
                        <div key={c.id} className="py-3 border-b border-gray-800 last:border-0">
                          <div className="flex justify-between">
                            <p className="font-medium text-sm">{c.name}</p>
                            {!c.is_read && <span className="text-xs text-orange-400 bg-orange-500/10 px-2 rounded-full">new</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.message}</p>
                        </div>
                      )) : <p className="text-gray-600 text-sm">No messages yet</p>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="bg-[#111827] rounded-2xl h-28 animate-pulse" />)}
                </div>
              )}
            </div>
          )}

          {/* ── POSTS ── */}
          {tab === "posts" && (
            <div>
              <h2 className="text-2xl font-black mb-8">POSTS</h2>

              {/* Create Post */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 mb-8">
                <h3 className="font-bold mb-5 text-orange-400">Create New Post</h3>
                <form onSubmit={createPost} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text" placeholder="Title *" value={newPost.title}
                      onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} required
                      className="bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                    />
                    <input
                      type="text" placeholder="Author name" value={newPost.author}
                      onChange={e => setNewPost(p => ({ ...p, author: e.target.value }))}
                      className="bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                  <textarea
                    rows={4} placeholder="Post content *" value={newPost.content}
                    onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} required
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <select
                      value={newPost.post_type} onChange={e => setNewPost(p => ({ ...p, post_type: e.target.value }))}
                      className="bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition"
                    >
                      <option value="announcement">📢 Announcement</option>
                      <option value="workout">💪 Workout</option>
                      <option value="photo">📸 Photo</option>
                      <option value="video">🎥 Video</option>
                    </select>
                    <input
                      type="text" placeholder="YouTube URL (optional)" value={newPost.video_url}
                      onChange={e => setNewPost(p => ({ ...p, video_url: e.target.value }))}
                      className="bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  {/* Image Upload */}
                  <div
                    onClick={() => document.getElementById("post-image-input").click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${newPost.preview ? "border-orange-500/40 bg-orange-500/5" : "border-gray-700 hover:border-orange-500/40 hover:bg-orange-500/5"}`}
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
                        <p className="text-gray-500 text-sm">📷 Click to upload a photo</p>
                        <p className="text-gray-600 text-xs mt-1">JPG, PNG, WebP up to 10MB</p>
                      </>
                    )}
                  </div>

                  <button
                    type="submit" disabled={postLoading}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition text-white font-bold px-8 py-3 rounded-xl"
                  >
                    {postLoading ? "Publishing..." : "Publish Post 🚀"}
                  </button>
                </form>
              </div>

              {/* Post List */}
              <div className="space-y-4">
                {loading ? <div className="bg-[#111827] rounded-2xl h-32 animate-pulse" /> :
                posts.length === 0 ? <p className="text-gray-600 text-center py-12">No posts yet. Create your first post above!</p> :
                posts.map(post => (
                  <div key={post.id} className="bg-[#111827] border border-gray-800 rounded-2xl p-5 flex gap-4">
                    {post.image_url && (
                      <img src={post.image_url} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h4 className="font-bold leading-snug">{post.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{post.author} · {post.post_type}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => togglePost(post.id)} className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${post.published ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"}`}>
                            {post.published ? "Published" : "Hidden"}
                          </button>
                          <button onClick={() => deletePost(post.id)} className="text-xs px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium">
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs mt-2 line-clamp-2">{post.content}</p>
                      <p className="text-xs text-gray-600 mt-1">❤️ {post.likes} likes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {tab === "bookings" && (
            <div>
              <h2 className="text-2xl font-black mb-8">BOOKINGS</h2>

              {/* Booking search + filters */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="search"
                      value={bookingSearch}
                      onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(1); }}
                      placeholder="Search name, phone, email, program..."
                      className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  </div>

                  <select
                    value={bookingStatus}
                    onChange={(e) => { setBookingStatus(e.target.value); setBookingPage(1); }}
                    className="bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition"
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
                      className="border border-gray-700 text-gray-300 hover:border-orange-500 hover:text-orange-400 px-5 py-3 rounded-xl transition text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Showing {bookings.length} of {bookingTotal} booking{bookingTotal !== 1 ? "s" : ""}
                </div>
              </div>

              {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="bg-[#111827] h-24 rounded-2xl" />)}</div> :
              bookings.length === 0 ? <p className="text-gray-600 text-center py-16">No bookings match your search.</p> :
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-bold text-lg">{b.name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                          <span>📞 {b.phone}</span>
                          {b.email && <span>✉️ {b.email}</span>}
                          <span>⏰ {b.session_time}</span>
                          {b.program && <span>🏋️ {b.program}</span>}
                          {b.preferred_date && <span>📅 {b.preferred_date}</span>}
                          {b.one_week_offer ? <span className="text-orange-400">1-Week Trial ₹499</span> : null}
                        </div>
                        {b.message && <p className="text-gray-500 text-sm mt-2 italic">"{b.message}"</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColor[b.status] || "bg-gray-500/20 text-gray-400"}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {["confirmed", "pending", "cancelled", "completed"].map(s => (
                        <button key={s} onClick={() => updateBooking(b.id, s)}
                          className={`text-xs px-3 py-1.5 rounded-xl transition font-medium ${b.status === s ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
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
                    className="px-4 py-2 rounded-xl border border-gray-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-orange-500 transition"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    Page {bookingPage} of {bookingTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={bookingPage >= bookingTotalPages}
                    onClick={() => setBookingPage((p) => Math.min(bookingTotalPages, p + 1))}
                    className="px-4 py-2 rounded-xl border border-gray-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-orange-500 transition"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS ── */}
          {tab === "reviews" && (
            <div>
              <h2 className="text-2xl font-black mb-8">REVIEWS</h2>
              {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="bg-[#111827] h-24 rounded-2xl" />)}</div> :
              reviews.length === 0 ? <p className="text-gray-600 text-center py-16">No reviews yet.</p> :
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-[#111827] border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold">{r.name}</p>
                          <div className="flex gap-0.5">{[...Array(r.rating)].map((_,j) => <span key={j} className="text-orange-400">★</span>)}</div>
                        </div>
                        {r.program && <p className="text-xs text-gray-500 mb-2">{r.program}</p>}
                        <p className="text-gray-300 text-sm leading-relaxed">"{r.review}"</p>
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
                          ✓ Approve
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button onClick={() => rejectReview(r.id)} className="text-xs px-3 py-1.5 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition font-medium">
                          ✗ Reject
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

          {/* ── CONTACTS ── */}
          {tab === "contacts" && (
            <div>
              <h2 className="text-2xl font-black mb-8">MESSAGES</h2>

              {/* Contact search + read filter */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="search"
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      placeholder="Search name, email, phone, message..."
                      className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  </div>

                  <select
                    value={contactReadFilter}
                    onChange={(e) => setContactReadFilter(e.target.value)}
                    className="bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="all">All Messages</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>

                  {(contactSearch || contactReadFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => { setContactSearch(""); setContactReadFilter("all"); }}
                      className="border border-gray-700 text-gray-300 hover:border-orange-500 hover:text-orange-400 px-5 py-3 rounded-xl transition text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Showing {filteredContacts.length} of {contacts.length} message{contacts.length !== 1 ? "s" : ""}
                </div>
              </div>

              {loading ? <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="bg-[#111827] h-24 rounded-2xl" />)}</div> :
              filteredContacts.length === 0 ? <p className="text-gray-600 text-center py-16">No messages match your search.</p> :
              <div className="space-y-4">
                {filteredContacts.map(c => (
                  <div key={c.id} className={`bg-[#111827] border rounded-2xl p-5 ${c.is_read ? "border-gray-800" : "border-orange-500/30"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{c.name}</p>
                          {!c.is_read && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 rounded-full">New</span>}
                        </div>
                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                          <span>{c.email}</span>
                          {c.phone && <span>{c.phone}</span>}
                        </div>
                        <p className="text-gray-300 text-sm mt-3 leading-relaxed">{c.message}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {!c.is_read && (
                        <button onClick={() => markRead(c.id)} className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition font-medium">
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

          {/* ── TRAINERS ── */}
          {tab === "trainers" && (
            <div>
              <h2 className="text-2xl font-black mb-8">TRAINERS</h2>

              {/* Add Trainer */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 mb-8">
                <h3 className="font-bold mb-5 text-orange-400">Add New Trainer</h3>
                <form onSubmit={createTrainer} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text" placeholder="Name *" value={newTrainer.name}
                      onChange={e => setNewTrainer(p => ({ ...p, name: e.target.value }))} required
                      className="bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                    />
                    <input
                      type="text" placeholder="Role (e.g. Head Coach)" value={newTrainer.role}
                      onChange={e => setNewTrainer(p => ({ ...p, role: e.target.value }))} required
                      className="bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                  <textarea
                    rows={2} placeholder="Short bio (optional)" value={newTrainer.bio}
                    onChange={e => setNewTrainer(p => ({ ...p, bio: e.target.value }))}
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
                  />
                  <div
                    onClick={() => document.getElementById("trainer-img").click()}
                    className="border-2 border-dashed border-gray-700 hover:border-orange-500/40 rounded-xl p-5 text-center cursor-pointer transition"
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
                        <p className="text-xs text-gray-500">Click to change</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-500 text-sm">👤 Upload trainer photo</p>
                        <p className="text-gray-600 text-xs mt-1">Recommended: square crop</p>
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
                {loading ? [1,2,3].map(i => <div key={i} className="bg-[#111827] h-60 rounded-2xl animate-pulse" />) :
                trainers.length === 0 ? <p className="text-gray-600 col-span-3 text-center py-12">No trainers added yet.</p> :
                trainers.map(t => (
                  <div key={t.id} className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">
                    {t.image_url ? (
                      <img src={t.image_url} alt={t.name} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-orange-500/10 to-orange-900/10 flex items-center justify-center">
                        <span className="text-6xl opacity-30">👤</span>
                      </div>
                    )}
                    <div className="p-5">
                      <p className="font-bold text-orange-400">{t.name}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{t.role}</p>
                      {t.bio && <p className="text-gray-500 text-xs mt-2 line-clamp-2">{t.bio}</p>}
                      <button onClick={() => deleteTrainer(t.id)} className="mt-4 text-xs px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition font-medium">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── GALLERY ── */}
          {tab === "gallery" && (
            <div>
              <h2 className="text-2xl font-black mb-8">GALLERY</h2>

              {/* Create Folder */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 mb-8">
                <h3 className="font-bold mb-4 text-orange-400">Create New Folder</h3>
                <form onSubmit={createFolder} className="flex gap-3">
                  <input
                    type="text" placeholder="Folder name (e.g. Competitions, Kids, Gym)" value={newFolder}
                    onChange={e => setNewFolder(e.target.value)} required
                    className="flex-1 bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 transition text-white font-bold px-6 py-3 rounded-xl whitespace-nowrap">
                    Create Folder
                  </button>
                </form>
              </div>

              {/* Folders */}
              {loading ? <div className="animate-pulse space-y-4">{[1,2].map(i => <div key={i} className="bg-[#111827] h-40 rounded-2xl" />)}</div> :
              gallery.length === 0 ? <p className="text-gray-600 text-center py-12">No folders yet. Create one above!</p> :
              <div className="space-y-8">
                {gallery.map(folder => (
                  <div key={folder.id} className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-xl font-bold">{folder.name}</h3>
                        <p className="text-gray-500 text-sm">{folder.photos?.length || 0} photos</p>
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
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
                        <p className="text-gray-600 text-sm">No photos yet. Click "Add Photos" to upload.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === "settings" && (
            <div className="max-w-lg">
              <h2 className="text-2xl font-black mb-8">SETTINGS</h2>

              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-orange-400 mb-1">Account</h3>
                <p className="text-gray-400 text-sm mb-5">Logged in as {admin?.name} · {admin?.email}</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xl">
                    {admin?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{admin?.name}</p>
                    <p className="text-gray-500 text-sm">{admin?.role}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-orange-400 mb-5">Change Password</h3>
                <form onSubmit={changePassword} className="space-y-4">
                  <input
                    type="password" placeholder="Current password" value={pwForm.current}
                    onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                  <input
                    type="password" placeholder="New password" value={pwForm.newPw}
                    onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} required
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                  <input
                    type="password" placeholder="Confirm new password" value={pwForm.confirm}
                    onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required
                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
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