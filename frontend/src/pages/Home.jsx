import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "../assets/hero.jpg";
import { getPrograms, getPosts, getReviews, getTrainers } from "../api/api.js";

// Real coach photos — imported so Vite bundles them into the build.
// (These live in src/assets/trainers/, NOT backend/uploads — that folder
// never ships to Vercel.)
import coachAman   from "../assets/trainers/coach-aman.jpeg";
import coachHeaven from "../assets/trainers/coach-heaven.jpeg";
import coachKabir  from "../assets/trainers/coach-kabir.jpeg";
import coachKunal  from "../assets/trainers/coach-kunal.jpeg";
import coachBali   from "../assets/trainers/Coach Bali.jpeg";
import coachSunny  from "../assets/trainers/Coach Sunny.jpeg";
import coachZahid  from "../assets/trainers/Coach Zahid.jpeg";
import coachVedant  from "../assets/trainers/Coach Vedant.jpeg";

// TEMPORARY hardcoded trainer list — swap this out once the Trainers sheet
// in Google Apps Script is actually populated and `getTrainers()` returns
// real data (see the `trainers.length > 0` check below, which already
// prefers API data automatically the moment it exists).
const FALLBACK_TRAINERS = [
  { name: "Founder Vaibhav", role: "Founder & Head Coach", image: null },
  { name: "Coach Kunal",     role: "Calisthenics Coach",   image: coachKunal },
  { name: "Coach Bali",      role: "Calisthenics Coach",   image: coachBali },
  { name: "Coach Aman",      role: "Calisthenics Coach",   image: coachAman },
  { name: "Coach Aryan",     role: "Calisthenics Coach",   image: null },
  { name: "Coach Kabir",     role: "Calisthenics Coach",   image: coachKabir },
  { name: "Coach Vedant",    role: "Calisthenics Coach",   image: coachVedant},
  { name: "Coach Vedang",    role: "Calisthenics Coach",   image: null },
  { name: "Coach Heaven",    role: "Calisthenics Coach",   image: coachHeaven },
  { name: "Coach Sunny",     role: "Calisthenics Coach",   image: coachSunny },
  { name: "Coach Zahid",     role: "Calisthenics Coach",   image: coachZahid },
];

const typeColors = {
  announcement: "bg-blue-500/20 text-blue-400",
  workout: "bg-orange-500/20 text-orange-400",
  photo: "bg-purple-500/20 text-purple-400",
  video: "bg-green-500/20 text-green-400",
};

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [posts, setPosts]       = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [lightbox, setLightbox] = useState(null); // { name, role, image } | null

  useEffect(() => {
    // safeArray: never trust an API response to have the exact shape we
    // expect — Google Sheets/Apps Script can return success:true with a
    // missing/renamed field, and that must never crash the page.
    const safeArray = (v) => (Array.isArray(v) ? v : []);

    getPrograms().then(d => setPrograms(safeArray(d?.programs).slice(0, 3))).catch(() => {});
    getPosts().then(d => setPosts(safeArray(d?.posts).slice(0, 3))).catch(() => {});
    getReviews().then(d => setReviews(safeArray(d?.reviews).slice(0, 3))).catch(() => {});
    getTrainers().then(d => setTrainers(safeArray(d?.trainers))).catch(() => {});
  }, []);

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  return (
    <main className="bg-[#0B0F19] text-white overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img src={heroImage} alt="MCI Athletes" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0B0F19]" />
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-orange-500 uppercase tracking-[0.3em] text-sm font-semibold mb-6"
          >
            Mira Road, Mumbai — Est. 2020
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-6xl md:text-8xl font-black leading-tight"
          >
            TRAIN SMART
            <span className="text-orange-500"> • </span>
            MOVE BETTER
            <br />LIVE STRONG
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-gray-300 text-xl mt-8 leading-relaxed max-w-2xl mx-auto"
          >
            Build real strength, mobility, and endurance with professional
            calisthenics & functional fitness training.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-5 mt-10 justify-center flex-wrap"
          >
            <Link to="/contact">
              <button className="bg-orange-500 hover:bg-orange-600 transition text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-orange-500/30">
                Book Free Trial
              </button>
            </Link>
            <Link to="/programs">
              <button className="border border-gray-600 hover:border-orange-500 hover:text-orange-400 transition px-10 py-4 rounded-2xl text-lg">
                Explore Programs
              </button>
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
          <div className="w-0.5 h-8 bg-white/40 rounded-full" />
          <div className="text-xs text-white/40 uppercase tracking-widest">Scroll</div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { num: "500+", label: "Students Trained" },
            { num: "5+", label: "Years Experience" },
            { num: "100%", label: "Natural Training" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-black text-orange-500">{s.num}</h2>
              <p className="text-gray-400 mt-2 text-sm uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ABOUT / WHY MCI ── */}
      <section className="py-24 px-6 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-4">Our Story</p>
            <h2 className="text-5xl md:text-6xl font-black mb-8">
              WHY <span className="text-orange-500">MCI?</span>
            </h2>
            <p className="text-gray-400 text-lg leading-9 mb-6">
              Master Calisthenics India was born from a simple belief — your body is the most powerful tool you own.
              We combine elite calisthenics programming with real coaching to help beginners and advanced athletes
              transform physically and mentally.
            </p>
            <p className="text-gray-400 text-lg leading-9 mb-10">
              Located in Mira Road, Mumbai — our gym is a space where discipline meets community.
            </p>
            <Link to="/about">
              <button className="bg-orange-500 hover:bg-orange-600 transition text-white px-8 py-4 rounded-xl font-bold">
                Learn More About Us →
              </button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: "💪", title: "Strength", desc: "Elite upper body & core strength through structured progressions." },
              { icon: "🧘", title: "Mobility", desc: "Flexibility & body control for life-long athletic longevity." },
              { icon: "🏃", title: "Conditioning", desc: "Cardio, HIIT & endurance built into every session." },
              { icon: "🤝", title: "Community", desc: "Train with motivated athletes who push each other every day." },
            ].map((item, i) => (
              <div key={i} className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-6 hover:border-orange-500/40 transition">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-orange-400 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PROGRAMS PREVIEW ── */}
      <section className="py-24 px-6 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
            <div>
              <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-3">Train With Us</p>
              <h2 className="text-5xl md:text-7xl font-black">OUR PROGRAMS</h2>
            </div>
            <Link to="/programs" className="text-orange-400 hover:text-orange-300 transition font-medium">
              View All Programs →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {programs.length > 0 ? programs.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`bg-[#111827] border rounded-[28px] p-8 hover:border-orange-500/60 transition-all duration-500 hover:-translate-y-1 ${p.is_featured ? "border-orange-500/40 ring-1 ring-orange-500/20" : "border-gray-800"}`}
              >
                {Boolean(p.is_featured) && (
                  <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold mb-4 inline-block">
                    ⭐ Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-orange-400 mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm mb-6">{p.subtitle}</p>
                <ul className="space-y-2 mb-8">
                  {(Array.isArray(p.features) ? p.features : JSON.parse(p.features || "[]")).slice(0, 4).map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-orange-500 text-xs">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-700 pt-6">
                  {(() => {
                    const pricing = Array.isArray(p.pricing) ? p.pricing : JSON.parse(p.pricing || "[]");
                    if (pricing.length > 0) {
                      return (
                        <>
                          <p className="text-xs text-gray-500 mb-1">Starting from</p>
                          <p className="text-2xl font-black text-white">{pricing[1] ? pricing[1][1] : pricing[0][1]}</p>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
                <Link to="/contact">
                  <button className="mt-6 w-full bg-orange-500/10 hover:bg-orange-500 border border-orange-500/40 hover:border-orange-500 text-orange-400 hover:text-white transition-all font-bold py-3 rounded-xl">
                    Book Trial
                  </button>
                </Link>
              </motion.div>
            )) : (
              [
                { title: "Group Batch Training", subtitle: "Train Together. Grow Stronger.", from: "₹4,000/month", features: ["Calisthenics & functional fitness", "Skill learning (pull-ups, handstands)", "Beginners to advanced friendly"] },
                { title: "Personal Training", subtitle: "Personal Attention. Faster Results.", from: "₹9,600/8 sessions", features: ["Completely customized plan", "Goal-specific training", "Nutrition guidance included"], featured: true },
                { title: "Group Personalized", subtitle: "Small Group. Big Results.", from: "₹7,999/month", features: ["Small group (2–3 people)", "Personalized programming", "High accountability"] },
              ].map((p, i) => (
                <div key={i} className={`bg-[#111827] border rounded-[28px] p-8 hover:border-orange-500/60 transition-all ${p.featured ? "border-orange-500/40" : "border-gray-800"}`}>
                  {p.featured && <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold mb-4 inline-block">⭐ Most Popular</span>}
                  <h3 className="text-2xl font-bold text-orange-400 mb-2">{p.title}</h3>
                  <p className="text-gray-500 text-sm mb-6">{p.subtitle}</p>
                  <ul className="space-y-2 mb-8">
                    {p.features.map((f, j) => <li key={j} className="flex items-center gap-2 text-gray-400 text-sm"><span className="text-orange-500 text-xs">✓</span>{f}</li>)}
                  </ul>
                  <p className="text-xs text-gray-500 mb-1">Starting from</p>
                  <p className="text-2xl font-black text-white">{p.from}</p>
                  <Link to="/contact"><button className="mt-6 w-full bg-orange-500/10 hover:bg-orange-500 border border-orange-500/40 hover:border-orange-500 text-orange-400 hover:text-white transition-all font-bold py-3 rounded-xl">Book Trial</button></Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── TRAINERS ── */}
      <section className="py-24 px-6 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-3 text-center">Meet the Team</p>
          <h2 className="text-5xl md:text-6xl font-black text-center mb-16">OUR TRAINERS</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {trainers.length > 0 ? (
              // Real API data — automatically takes over once your Trainers
              // sheet is populated, no code change needed.
              trainers.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setLightbox({ name: t.name, role: t.role, image: t.image_url })}
                  className="cursor-pointer bg-[#0B0F19] border border-gray-800 rounded-3xl overflow-hidden hover:border-orange-500/40 transition-all hover:-translate-y-1 group"
                >
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.name} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="h-72 bg-gradient-to-br from-orange-500/20 to-orange-900/20 flex items-center justify-center">
                      <span className="text-8xl opacity-30">👤</span>
                    </div>
                  )}
                  <div className="p-7">
                    <h3 className="text-2xl font-bold text-orange-400">{t.name}</h3>
                    <p className="text-gray-400 mt-1 text-sm">{t.role}</p>
                    {t.bio && <p className="text-gray-500 mt-3 text-sm leading-relaxed">{t.bio}</p>}
                  </div>
                </motion.div>
              ))
            ) : (
              // Hardcoded fallback with real names + real photos where available
              FALLBACK_TRAINERS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  viewport={{ once: true }}
                  onClick={() => setLightbox({ name: t.name, role: t.role, image: t.image })}
                  className="cursor-pointer bg-[#0B0F19] border border-gray-800 rounded-3xl overflow-hidden hover:border-orange-500/40 transition-all hover:-translate-y-1 group"
                >
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="h-72 bg-gradient-to-br from-orange-500/20 to-orange-900/20 flex items-center justify-center">
                      <span className="text-8xl opacity-30">👤</span>
                    </div>
                  )}
                  <div className="p-7">
                    <h3 className="text-2xl font-bold text-orange-400">{t.name}</h3>
                    <p className="text-gray-400 mt-1 text-sm">{t.role}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── LATEST POSTS PREVIEW ── */}
      {posts.length > 0 && (
        <section className="py-24 px-6 bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
              <div>
                <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-3">Fresh From the Gym</p>
                <h2 className="text-5xl md:text-6xl font-black">LATEST UPDATES</h2>
              </div>
              <Link to="/community" className="text-orange-400 hover:text-orange-300 transition font-medium">
                View All Posts →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#111827] rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500/30 transition-all hover:-translate-y-1 group"
                >
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className={`h-48 flex items-center justify-center text-5xl ${typeColors[post.post_type] || "bg-gray-800/40 text-gray-600"}`}>
                      {post.post_type === "workout" ? "💪" : post.post_type === "announcement" ? "📢" : post.post_type === "video" ? "🎥" : "📸"}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[post.post_type] || "bg-gray-500/20 text-gray-400"}`}>
                        {post.post_type}
                      </span>
                      <span className="text-xs text-gray-600">{formatDate(post.created_at)}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 leading-snug">{post.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-1 mt-4 text-gray-600 text-sm">
                      <span>❤️</span> <span>{post.likes} likes</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {reviews.length > 0 && (
        <section className="py-24 px-6 bg-[#0F172A]">
          <div className="max-w-6xl mx-auto">
            <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-3 text-center">Real Results</p>
            <h2 className="text-5xl md:text-6xl font-black text-center mb-16">WHAT OUR MEMBERS SAY</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#0B0F19] border border-gray-800 rounded-3xl p-8 hover:border-orange-500/30 transition-all"
                >
                  <div className="flex gap-1 mb-5">
                    {[...Array(r.rating)].map((_, j) => (
                      <span key={j} className="text-orange-400">★</span>
                    ))}
                    {[...Array(5 - r.rating)].map((_, j) => (
                      <span key={j} className="text-gray-700">★</span>
                    ))}
                  </div>
                  <p className="text-gray-300 leading-8 italic mb-6">"{r.review_text || r.review}"</p>
                  <div className="border-t border-gray-800 pt-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                      {String(r.name || "?").charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{r.name}</p>
                      {r.program && <p className="text-xs text-gray-500">{r.program}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-32 px-6 bg-[#0B0F19]">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-orange-500/40 p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-900/5" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                READY TO <span className="text-orange-500">TRANSFORM?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Join Master Calisthenics India and begin your transformation journey today.
                First trial is always free.
              </p>
              <div className="flex gap-5 justify-center flex-wrap">
                <Link to="/contact">
                  <button className="bg-orange-500 hover:bg-orange-600 transition text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-2xl shadow-orange-500/30">
                    Book Free Trial
                  </button>
                </Link>
                <a href="https://wa.me/918433599778" target="_blank" rel="noreferrer">
                  <button className="bg-green-600 hover:bg-green-700 transition text-white font-bold px-10 py-4 rounded-2xl text-lg">
                    💬 WhatsApp Us
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRAINER LIGHTBOX ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#0B0F19] border border-gray-800 rounded-3xl overflow-hidden"
            >
              <button
                onClick={() => setLightbox(null)}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-orange-500 text-white flex items-center justify-center text-xl transition-colors"
              >
                ×
              </button>
              {lightbox.image ? (
                <img src={lightbox.image} alt={lightbox.name} className="w-full max-h-[70vh] object-cover" />
              ) : (
                <div className="h-72 bg-gradient-to-br from-orange-500/20 to-orange-900/20 flex items-center justify-center">
                  <span className="text-9xl opacity-30">👤</span>
                </div>
              )}
              <div className="p-8 text-center">
                <h3 className="text-3xl font-black text-orange-400">{lightbox.name}</h3>
                <p className="text-gray-400 mt-2">{lightbox.role}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
