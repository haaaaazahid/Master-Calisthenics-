import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="bg-bg text-text min-h-screen">

      {/* HERO */}
      <section className="pt-36 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-orange-500 uppercase tracking-[0.3em] text-sm font-semibold mb-4"
        >
          Our Story
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black mb-6"
        >
          ABOUT MCI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-text-muted text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Master Calisthenics India — Mira Road's premier calisthenics and functional fitness training ground.
        </motion.p>
      </section>

      {/* MISSION */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-black mb-6">Our <span className="text-orange-500">Mission</span></h2>
          <p className="text-text-muted text-lg leading-9 mb-6">
            Master Calisthenics India was built on one belief: your body is the most powerful training tool you'll ever own.
            We don't rely on machines or shortcuts — we build real, functional strength through disciplined bodyweight training.
          </p>
          <p className="text-text-muted text-lg leading-9 mb-8">
            From handstands to muscle-ups, from fat loss to elite conditioning — our coaches guide every member through
            a journey that transforms not just their body, but their mindset.
          </p>
          <div className="flex flex-col gap-4">
            {[
              "Science-backed calisthenics programming",
              "Coaches certified in fitness & movement",
              "Safe, welcoming environment for all levels",
              "No steroids, no shortcuts — 100% natural",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-text-muted">
                <span className="text-orange-500">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-900/10 border border-orange-500/30 rounded-3xl p-10"
        >
          <div className="grid grid-cols-2 gap-6">
            {[
              { num: "500+", label: "Members Trained" },
              { num: "5+", label: "Years Active" },
              { num: "3+", label: "Expert Coaches" },
              { num: "5", label: "Specialty Programs" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-5xl font-black text-orange-400">{s.num}</p>
                <p className="text-text-muted text-sm mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* VALUES */}
      <section className="bg-bg-secondary py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-16">WHAT WE STAND FOR</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "💪",
                title: "Strength",
                desc: "We build elite upper body and core strength through progressive bodyweight training — pull-ups, dips, rows, handstands, muscle-ups and beyond.",
              },
              {
                icon: "🧘",
                title: "Mobility",
                desc: "Flexibility is the foundation of every advanced skill. We integrate mobility and flexibility work into every session for long-term athletic longevity.",
              },
              {
                icon: "🔥",
                title: "Discipline",
                desc: "Consistency beats intensity every time. We create an environment where showing up, working hard, and staying committed becomes second nature.",
              },
              {
                icon: "🤝",
                title: "Community",
                desc: "At MCI, you're never training alone. Our community of athletes supports and pushes each other — the energy in our gym is unlike anything else.",
              },
              {
                icon: "🎯",
                title: "Results",
                desc: "We don't just motivate — we deliver measurable results. Fat loss, skill development, strength gains — our members see real, visible transformation.",
              },
              {
                icon: "🧬",
                title: "Natural",
                desc: "100% natural training, always. We believe in earning every result through hard work and smart programming — no shortcuts, no compromises.",
              },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="bg-bg border border-border rounded-2xl p-8 hover:border-orange-500/40 transition-all"
              >
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-xl font-bold text-orange-400 mb-3">{v.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-16">FIND US</h2>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="bg-surface border border-border rounded-3xl p-10">
              <h3 className="text-2xl font-bold text-orange-400 mb-6">Location & Timings</h3>
              <div className="space-y-5 text-text-muted">
                <div className="flex gap-4">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-text font-medium">PSZ Sports Arena</p>
                    <p className="text-sm mt-1">Opp. Gaurav Residency Phase 2, Beverly Park, Mira Road East – 401107</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <p className="text-text font-medium">Batch Timings</p>
                    <p className="text-sm mt-1">Mon – Sat: 6:00 AM, 7:30 AM, 6:15 PM, 7:30 PM</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="text-text font-medium">+91 84335 99778</p>
                    <a href="https://wa.me/918433599778" className="text-sm text-orange-400 hover:text-orange-300 transition mt-1 block">
                      Chat on WhatsApp →
                    </a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="text-text font-medium">Follow Us</p>
                    <div className="flex gap-4 mt-2">
                      <a href="https://www.instagram.com/mci_2025" target="_blank" rel="noreferrer" className="text-sm text-orange-400 hover:text-orange-300 transition">Instagram</a>
                      <a href="https://www.youtube.com/@MasterCalisthenics-x8w" target="_blank" rel="noreferrer" className="text-sm text-orange-400 hover:text-orange-300 transition">YouTube</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-surface border border-border rounded-2xl overflow-hidden h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.5!2d72.8675!3d19.2812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDE2JzUyLjMiTiA3MsKwNTInMDMuMCJF!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="MCI Location"
                />
              </div>
              <Link to="/contact">
                <button className="w-full bg-orange-500 hover:bg-orange-600 transition text-white font-bold py-4 rounded-2xl text-lg">
                  Book Your Free Trial Today
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
