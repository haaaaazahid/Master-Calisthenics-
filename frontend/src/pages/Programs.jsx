import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const iconMap = { "Group Batch Training": "🏋️", "Personal Training (1-to-1)": "🎯", "Group Personalized": "👥", "Kids Fitness & Calisthenics": "🧒", "Women's Special Batch": "👩" };

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState(null);

  useEffect(() => {
    fetch(`${API}/programs`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const progs = data.programs.map(p => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || "[]"),
            pricing: Array.isArray(p.pricing) ? p.pricing : JSON.parse(p.pricing || "[]"),
          }));
          setPrograms(progs);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-[#0B0F19] text-white min-h-screen">

      {/* HERO */}
      <section className="pt-36 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-orange-500/5 to-transparent pointer-events-none" />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-orange-500 uppercase tracking-[0.3em] text-sm font-semibold mb-4"
        >
          Designed for Every Level
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black mb-6"
        >
          OUR PROGRAMS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-xl max-w-2xl mx-auto"
        >
          From complete beginners to advanced athletes — we have a program for every goal.
        </motion.p>
      </section>

      {/* TRIAL BANNER */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <div className="bg-gradient-to-r from-orange-500/20 to-orange-900/10 border border-orange-500/40 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <p className="font-bold text-lg">🎯 Not sure where to start?</p>
            <p className="text-gray-400 text-sm mt-1">Book a free trial session — no commitment, no pressure.</p>
          </div>
          <Link to="/contact">
            <button className="bg-orange-500 hover:bg-orange-600 transition text-white font-bold px-8 py-3 rounded-xl whitespace-nowrap">
              Book Free Trial →
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-10">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-[#111827] rounded-3xl h-96 animate-pulse" />
          ))}
        </div>
      ) : (
        <section className="max-w-6xl mx-auto px-6 pb-24 space-y-10">
          {programs.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              viewport={{ once: true }}
              className={`bg-[#111827] border rounded-3xl overflow-hidden transition-all ${
                p.is_featured ? "border-orange-500/50 ring-1 ring-orange-500/20" : "border-gray-800 hover:border-gray-700"
              }`}
            >
              {/* Header */}
              <div className="p-8 md:p-10 border-b border-gray-800/60">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-5">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: p.color ? `${p.color}20` : "#f9731620" }}
                    >
                      {iconMap[p.title] || p.icon || "🏋️"}
                    </div>
                    <div>
                      {p.is_featured && (
                        <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold mb-2 inline-block">
                          ⭐ Most Popular
                        </span>
                      )}
                      <h2 className="text-3xl font-black" style={{ color: p.color || "#f97316" }}>
                        {p.title}
                      </h2>
                      <p className="text-gray-400 mt-1">{p.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActive(active === p.id ? null : p.id)}
                    className="text-sm text-orange-400 border border-orange-500/40 px-4 py-2 rounded-xl hover:bg-orange-500/10 transition"
                  >
                    {active === p.id ? "Hide Pricing ↑" : "View Pricing ↓"}
                  </button>
                </div>
              </div>

              {/* Features + Pricing */}
              <div className="p-8 md:p-10">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Features */}
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4 font-semibold">What's Included</h3>
                    <ul className="space-y-3">
                      {p.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-3 text-gray-300">
                          <span className="text-orange-500 mt-0.5 shrink-0">✓</span>
                          <span className="text-sm leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing */}
                  {(active === p.id || p.is_featured) && p.pricing.length > 0 && (
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4 font-semibold">Pricing</h3>
                      <div className="space-y-2">
                        {p.pricing.map(([label, price], j) => (
                          <div
                            key={j}
                            className={`flex justify-between items-center px-4 py-3 rounded-xl ${
                              j === 0
                                ? "bg-orange-500/10 border border-orange-500/30"
                                : "bg-[#0B0F19] border border-gray-800"
                            }`}
                          >
                            <span className={`text-sm ${j === 0 ? "text-orange-300 font-medium" : "text-gray-400"}`}>
                              {label}
                            </span>
                            <span className={`font-bold ${j === 0 ? "text-orange-400 text-lg" : "text-white"}`}>
                              {price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {active !== p.id && !p.is_featured && (
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setActive(p.id)}
                        className="text-orange-400 border border-orange-500/30 px-6 py-3 rounded-xl hover:bg-orange-500/10 transition text-sm"
                      >
                        Show Pricing →
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row gap-4">
                  <Link to="/contact" className="flex-1">
                    <button className="w-full bg-orange-500 hover:bg-orange-600 transition text-white font-bold py-3.5 rounded-xl">
                      Book Free Trial
                    </button>
                  </Link>
                  <a href="https://wa.me/918433599778" target="_blank" rel="noreferrer" className="flex-1">
                    <button className="w-full border border-gray-700 hover:border-orange-500 hover:text-orange-400 transition text-gray-400 font-bold py-3.5 rounded-xl">
                      💬 Ask on WhatsApp
                    </button>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {/* FAQ / TIMING */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-4xl font-black text-center mb-12">BATCH TIMINGS</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { time: "6:00 AM", label: "Morning Batch", days: "Mon – Sat", type: "Early Bird" },
            { time: "7:30 AM", label: "Morning Batch", days: "Mon – Sat", type: "Morning" },
            { time: "6:15 PM", label: "Evening Batch", days: "Mon – Sat", type: "Evening" },
            { time: "7:30 PM", label: "Evening Batch", days: "Mon – Sat", type: "Evening" },
          ].map((t, i) => (
            <div key={i} className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex items-center gap-5 hover:border-orange-500/30 transition">
              <div className="bg-orange-500/10 rounded-xl px-4 py-3 text-center min-w-[80px]">
                <p className="text-orange-400 font-black text-xl">{t.time}</p>
              </div>
              <div>
                <p className="font-bold text-white">{t.label}</p>
                <p className="text-gray-500 text-sm">{t.days}</p>
                <span className="text-xs text-orange-500 mt-1 inline-block">{t.type}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-6">
          📍 PSZ Sports Arena, opp Gaurav Residency Phase 2, Beverly Park, Mira Road East – 401107
        </p>
      </section>

    </main>
  );
}
