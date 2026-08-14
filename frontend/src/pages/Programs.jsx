import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiGet } from "../api/api.js";
const iconMap = {
  "Group Batch Training": "🏋️",
  "Personal Training (1-to-1)": "🎯",
  "Group Personalized": "👥",
  "Kids Fitness & Calisthenics": "🧒",
  "Women's Special Batch": "👩",
};

function parseArray(value) {
  if (Array.isArray(value)) return value;

  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeProgram(program) {
  return {
    ...program,

    features: parseArray(program.features),

    pricing: parseArray(program.pricing),

    is_featured:
      program.is_featured === true ||
      program.is_featured === 1 ||
      String(program.is_featured).toLowerCase() === "true" ||
      String(program.is_featured) === "1",

    active:
      program.active === true ||
      program.active === 1 ||
      String(program.active).toLowerCase() === "true" ||
      String(program.active) === "1",
  };
}

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadPrograms() {
      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         * apiGet("/programs") converts this into:
         *
         * Google Apps Script:
         * /exec?action=programs
         *
         * Do NOT use:
         * /programs
         */

        const data = await apiGet("/programs");

        if (!mounted) return;

        if (!data || !data.success) {
          throw new Error(
            data?.error || "Unable to load programs"
          );
        }

        const sourcePrograms =
          Array.isArray(data.programs)
            ? data.programs
            : Array.isArray(data.data)
            ? data.data
            : [];

        const normalizedPrograms =
          sourcePrograms
            .map(normalizeProgram)
            .filter((program) => program.active !== false)
            .sort(
              (a, b) =>
                Number(a.sort_order || 0) -
                Number(b.sort_order || 0)
            );

        setPrograms(normalizedPrograms);
      } catch (err) {
        console.error("Programs API error:", err);

        if (mounted) {
          setError(
            "Unable to load programs right now. Please try again."
          );
          setPrograms([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPrograms();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="bg-[#0B0F19] text-white min-h-screen">

      {/* =====================================================
          HERO
      ====================================================== */}
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
          From complete beginners to advanced athletes — we
          have a program for every goal.
        </motion.p>

      </section>


      {/* =====================================================
          TRIAL BANNER
      ====================================================== */}
      <div className="max-w-4xl mx-auto px-6 mb-16">

        <div className="bg-gradient-to-r from-orange-500/20 to-orange-900/10 border border-orange-500/40 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-5">

          <div>
            <p className="font-bold text-lg">
              🎯 Not sure where to start?
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Book a free trial session — no commitment, no
              pressure.
            </p>
          </div>

          <Link to="/contact">
            <button className="bg-orange-500 hover:bg-orange-600 transition text-white font-bold px-8 py-3 rounded-xl whitespace-nowrap">
              Book Free Trial →
            </button>
          </Link>

        </div>

      </div>


      {/* =====================================================
          LOADING
      ====================================================== */}
      {loading && (
        <section className="max-w-6xl mx-auto px-6 pb-24 space-y-10">

          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-[#111827] rounded-3xl h-[420px] animate-pulse"
            />
          ))}

        </section>
      )}


      {/* =====================================================
          ERROR
      ====================================================== */}
      {!loading && error && (
        <section className="max-w-4xl mx-auto px-6 pb-24">

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">

            <p className="text-red-400 font-semibold text-lg">
              {error}
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Please check your connection and try again.
            </p>

          </div>

        </section>
      )}


      {/* =====================================================
          PROGRAMS
      ====================================================== */}
      {!loading && !error && (
        <section className="max-w-6xl mx-auto px-6 pb-24 space-y-10">

          {programs.length === 0 ? (
            <div className="text-center py-20">

              <p className="text-gray-400 text-lg">
                No programs are currently available.
              </p>

            </div>
          ) : (
            programs.map((p, i) => {

              const isOpen = active === p.id;

              return (
                <motion.div
                  key={p.id}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.05 * i,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.15,
                  }}
                  className={`bg-[#111827] border rounded-3xl overflow-hidden transition-all duration-300 ${
                    p.is_featured
                      ? "border-orange-500/50 ring-1 ring-orange-500/20 shadow-lg shadow-orange-500/5"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                >

                  {/* =================================================
                      HEADER
                  ================================================== */}
                  <div className="p-8 md:p-10 border-b border-gray-800/60">

                    <div className="flex items-start justify-between flex-wrap gap-4">

                      <div className="flex items-center gap-5">

                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                          style={{
                            backgroundColor: p.color
                              ? `${p.color}20`
                              : "#f9731620",
                          }}
                        >
                          {iconMap[p.title] ||
                            p.icon ||
                            "🏋️"}
                        </div>

                        <div>

                          {p.is_featured && (
                            <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold mb-2 inline-block">
                              ⭐ Most Popular
                            </span>
                          )}

                          <h2
                            className="text-2xl md:text-3xl font-black"
                            style={{
                              color:
                                p.color ||
                                "#f97316",
                            }}
                          >
                            {p.title}
                          </h2>

                          <p className="text-gray-400 mt-1">
                            {p.subtitle}
                          </p>

                        </div>

                      </div>


                      {/* PRICE TOGGLE */}
                      {p.pricing.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setActive(
                              isOpen
                                ? null
                                : p.id
                            )
                          }
                          className="text-sm text-orange-400 border border-orange-500/40 px-4 py-2 rounded-xl hover:bg-orange-500/10 transition"
                        >
                          {isOpen
                            ? "Hide Pricing ↑"
                            : "View Pricing ↓"}
                        </button>
                      )}

                    </div>

                  </div>


                  {/* =================================================
                      FEATURES
                  ================================================== */}
                  <div className="p-8 md:p-10">

                    <div
                      className={
                        isOpen && p.pricing.length > 0
                          ? "grid md:grid-cols-2 gap-8"
                          : ""
                      }
                    >

                      {/* FEATURES */}
                      <div>

                        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4 font-semibold">
                          What's Included
                        </h3>

                        {p.features.length > 0 ? (
                          <ul className="space-y-3">

                            {p.features.map(
                              (feature, j) => (
                                <li
                                  key={j}
                                  className="flex items-start gap-3 text-gray-300"
                                >

                                  <span className="text-orange-500 mt-0.5 shrink-0">
                                    ✓
                                  </span>

                                  <span className="text-sm leading-relaxed">
                                    {feature}
                                  </span>

                                </li>
                              )
                            )}

                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Program details coming soon.
                          </p>
                        )}

                      </div>


                      {/* =================================================
                          PRICING
                      ================================================== */}
                      {isOpen &&
                        p.pricing.length > 0 && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                            }}
                            className="mt-8 md:mt-0"
                          >

                            <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4 font-semibold">
                              Pricing
                            </h3>

                            <div className="space-y-2">

                              {p.pricing.map(
                                (item, j) => {

                                  const label =
                                    Array.isArray(item)
                                      ? item[0]
                                      : "";

                                  const price =
                                    Array.isArray(item)
                                      ? item[1]
                                      : "";

                                  return (
                                    <div
                                      key={j}
                                      className={`flex justify-between items-center px-4 py-3 rounded-xl ${
                                        j === 0
                                          ? "bg-orange-500/10 border border-orange-500/30"
                                          : "bg-[#0B0F19] border border-gray-800"
                                      }`}
                                    >

                                      <span
                                        className={`text-sm ${
                                          j === 0
                                            ? "text-orange-300 font-medium"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {label}
                                      </span>

                                      <span
                                        className={`font-bold ${
                                          j === 0
                                            ? "text-orange-400 text-lg"
                                            : "text-white"
                                        }`}
                                      >
                                        {price}
                                      </span>

                                    </div>
                                  );
                                }
                              )}

                            </div>

                          </motion.div>
                        )}

                    </div>


                    {/* =================================================
                        BUTTONS
                    ================================================== */}
                    <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row gap-4">

                      <Link
                        to="/contact"
                        className="flex-1"
                      >
                        <button className="w-full bg-orange-500 hover:bg-orange-600 transition text-white font-bold py-3.5 rounded-xl">
                          Book Free Trial
                        </button>
                      </Link>

                      <a
                        href="https://wa.me/918433599778"
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1"
                      >
                        <button className="w-full border border-gray-700 hover:border-orange-500 hover:text-orange-400 transition text-gray-400 font-bold py-3.5 rounded-xl">
                          💬 Ask on WhatsApp
                        </button>
                      </a>

                    </div>

                  </div>

                </motion.div>
              );
            })
          )}

        </section>
      )}


      {/* =====================================================
          BATCH TIMINGS
      ====================================================== */}
      <section className="max-w-4xl mx-auto px-6 pb-24">

        <h2 className="text-4xl font-black text-center mb-12">
          BATCH TIMINGS
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          {[
            {
              time: "6:00 AM",
              label: "Morning Batch",
              days: "Mon – Sat",
              type: "Early Bird",
            },
            {
              time: "7:30 AM",
              label: "Morning Batch",
              days: "Mon – Sat",
              type: "Morning",
            },
            {
              time: "6:15 PM",
              label: "Evening Batch",
              days: "Mon – Sat",
              type: "Evening",
            },
            {
              time: "7:30 PM",
              label: "Evening Batch",
              days: "Mon – Sat",
              type: "Evening",
            },
          ].map((t, i) => (

            <div
              key={i}
              className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex items-center gap-5 hover:border-orange-500/30 transition"
            >

              <div className="bg-orange-500/10 rounded-xl px-4 py-3 text-center min-w-[80px]">

                <p className="text-orange-400 font-black text-xl">
                  {t.time}
                </p>

              </div>

              <div>

                <p className="font-bold text-white">
                  {t.label}
                </p>

                <p className="text-gray-500 text-sm">
                  {t.days}
                </p>

                <span className="text-xs text-orange-500 mt-1 inline-block">
                  {t.type}
                </span>

              </div>

            </div>

          ))}

        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          📍 PSZ Sports Arena, opp Gaurav Residency
          Phase 2, Beverly Park, Mira Road East –
          401107
        </p>

      </section>

    </main>
  );
}