import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const typeColors = {
  announcement: { bg: "bg-blue-500/20", text: "text-blue-400", label: "📢 Announcement" },
  workout:      { bg: "bg-orange-500/20", text: "text-orange-400", label: "💪 Workout" },
  photo:        { bg: "bg-purple-500/20", text: "text-purple-400", label: "📸 Photo" },
  video:        { bg: "bg-green-500/20", text: "text-green-400", label: "🎥 Video" },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Community() {
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [liked, setLiked]       = useState({});
  const [subEmail, setSubEmail] = useState("");
  const [subName, setSubName]   = useState("");
  const [subStatus, setSubStatus] = useState(null); // null | "success" | "error"
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/posts`)
      .then(r => r.json())
      .then(data => { if (data.success) setPosts(data.posts); })
      .finally(() => setLoading(false));
  }, []);

  async function handleLike(id) {
    if (liked[id]) return;
    await fetch(`${API}/posts/${id}/like`, { method: "PATCH" });
    setLiked(p => ({ ...p, [id]: true }));
    setPosts(p => p.map(post => post.id === id ? { ...post, likes: post.likes + 1 } : post));
  }

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!subEmail) return;
    setSubLoading(true);
    try {
      const res = await fetch(`${API}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail, name: subName }),
      });
      const data = await res.json();
      setSubStatus(data.success ? "success" : "error");
      if (data.success) { setSubEmail(""); setSubName(""); }
    } catch {
      setSubStatus("error");
    } finally {
      setSubLoading(false);
    }
  }

  return (
    <main className="bg-[#050816] text-white min-h-screen">

      {/* HERO */}
      <section
        className="h-[70vh] bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: "url('/community.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-[#050816]" />
        <div className="relative z-10 text-center px-6">
          <p className="text-orange-500 uppercase tracking-[0.3em] text-sm font-semibold mb-4">
            Mira Road's Strongest Community
          </p>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            THE COMMUNITY
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            More than fitness. A brotherhood of discipline, strength and transformation.
          </p>
        </div>
      </section>

      {/* PILLARS */}
      <section className="max-w-6xl mx-auto py-20 px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "🏆", title: "Events", desc: "Community workouts, outdoor sessions and competitions across Mumbai." },
            { icon: "🤝", title: "Brotherhood", desc: "A supportive, disciplined environment built on accountability and growth." },
            { icon: "🔥", title: "Transformations", desc: "Real people achieving elite physiques naturally, every day." },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#111827]/80 backdrop-blur-xl p-10 rounded-[24px] border border-gray-800 hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h2 className="text-2xl font-bold mb-3 text-orange-500 group-hover:text-orange-400 transition">{item.title}</h2>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JOIN COMMUNITY — EMAIL SUBSCRIPTION */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-900/10 border border-orange-500/30 rounded-3xl p-10 text-center">
          <div className="text-4xl mb-3">📬</div>
          <h2 className="text-3xl font-black mb-2">Join the MCI Community</h2>
          <p className="text-gray-400 mb-8">
            Get notified whenever we post updates, offers, competitions, and new batches — straight to your inbox.
          </p>

          {subStatus === "success" ? (
            <div className="bg-green-500/20 border border-green-500/40 rounded-2xl p-6">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-green-400 font-semibold">You're in! We'll notify you of every new update.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={subName}
                onChange={e => setSubName(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              />
              <input
                type="email"
                placeholder="Your email address *"
                value={subEmail}
                onChange={e => setSubEmail(e.target.value)}
                required
                className="w-full bg-black/40 border border-gray-700 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              />
              <button
                type="submit"
                disabled={subLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition text-white font-bold py-4 rounded-xl text-lg"
              >
                {subLoading ? "Joining..." : "Join Community 🚀"}
              </button>
              {subStatus === "error" && (
                <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
              )}
              <p className="text-gray-600 text-xs">No spam. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </section>

      {/* LIVE POSTS FEED */}
      <section className="max-w-3xl mx-auto pb-24 px-6">
        <div className="flex items-center gap-4 mb-3">
          <h2 className="text-4xl font-black">Latest Updates</h2>
          <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Live
          </span>
        </div>
        <p className="text-gray-500 mb-10">Straight from our coaches and community.</p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#111827] rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <div className="text-6xl mb-4">📭</div>
            <p>No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => {
              const type = typeColors[post.post_type] || { bg: "bg-gray-500/20", text: "text-gray-400", label: post.post_type };
              return (
                <article key={post.id} className="bg-[#0d1424] rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500/30 transition-all duration-300 group">

                  {/* Image */}
                  {post.image_url && (
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full max-h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* YouTube embed */}
                  {post.video_url && (
                    <div className="aspect-video">
                      <iframe
                        src={post.video_url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                        title={post.title}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Author + meta */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                          {post.author?.charAt(0) || "M"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{post.author || "MCI Coach"}</p>
                          <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${type.bg} ${type.text}`}>
                        {type.label}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 leading-snug">{post.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">{post.content}</p>

                    {/* Like button */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-all px-4 py-2 rounded-xl ${
                        liked[post.id]
                          ? "text-orange-400 bg-orange-500/10"
                          : "text-gray-500 hover:text-orange-400 hover:bg-orange-500/10"
                      }`}
                    >
                      <span className="text-lg">{liked[post.id] ? "❤️" : "🤍"}</span>
                      <span>{post.likes} {liked[post.id] ? "Liked!" : "likes"}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
