import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPrograms } from "../api/api.js";

const iconMap = {
  "Group Batch Training": "🏋️",
  "Personal Training (1-to-1)": "🎯",
  "Group Personalized": "👥",
  "Kids Fitness & Calisthenics": "🧒",
  "Women's Special Batch": "👩",
};

const ProgramsSection = () => {
  const [programs, setPrograms] = useState([]);
  const [active, setActive]     = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getPrograms()
      .then(data => {
        if (data.success) {
          setPrograms(data.programs.map(p => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || "[]"),
            pricing:  Array.isArray(p.pricing)  ? p.pricing  : JSON.parse(p.pricing  || "[]"),
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-6 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl text-center mb-16 font-black">OUR PROGRAMS</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="bg-surface rounded-[30px] h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 bg-bg-secondary">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-orange-500 uppercase tracking-[0.2em] text-sm font-semibold mb-4">
            Train With Us
          </p>
          <h2 className="text-5xl md:text-7xl font-black">OUR PROGRAMS</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((p, i) => (
            <div
              key={p.id}
              className={`bg-surface border rounded-[28px] p-8 flex flex-col transition-all duration-500 hover:-translate-y-1 ${
                p.is_featured
                  ? "border-orange-500/50 ring-1 ring-orange-500/20"
                  : "border-border hover:border-orange-500/40"
              }`}
            >
              {/* Badge */}
              {Boolean(p.is_featured) && (
                <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold mb-4 self-start">
                  ⭐ Most Popular
                </span>
              )}

              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: p.color ? `${p.color}20` : "#f9731620" }}
                >
                  {iconMap[p.title] || "🏋️"}
                </div>
                <div>
                  <h3 className="text-xl font-black leading-tight" style={{ color: p.color || "#f97316" }}>
                    {p.title}
                  </h3>
                  <p className="text-text-muted text-xs mt-0.5">{p.subtitle}</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.slice(0, 5).map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-text-muted text-sm">
                    <span className="text-orange-500 text-xs mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Pricing toggle */}
              <div className="border-t border-border pt-5">
                {active === p.id ? (
                  <div className="space-y-2 mb-4">
                    {p.pricing.map(([label, price], j) => (
                      <div
                        key={j}
                        className={`flex justify-between items-center px-3 py-2 rounded-xl text-sm ${
                          j === 0
                            ? "bg-orange-500/10 border border-orange-500/30"
                            : "bg-bg border border-border"
                        }`}
                      >
                        <span className={j === 0 ? "text-orange-300 font-medium" : "text-text-muted"}>
                          {label}
                        </span>
                        <span className={`font-bold ${j === 0 ? "text-orange-400" : "text-text"}`}>
                          {price}
                        </span>
                      </div>
                    ))}
                    <button
                      onClick={() => setActive(null)}
                      className="text-xs text-text-muted hover:text-text-muted transition w-full text-center mt-1"
                    >
                      Hide pricing ↑
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActive(p.id)}
                    className="w-full text-sm text-orange-400 border border-orange-500/30 py-2 rounded-xl hover:bg-orange-500/10 transition mb-4"
                  >
                    View Pricing ↓
                  </button>
                )}

                <Link to="/contact">
                  <button className="w-full bg-orange-500 hover:bg-orange-600 transition py-3 rounded-2xl text-white font-bold">
                    Book Trial
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/programs">
            <button className="border border-border hover:border-orange-500 hover:text-orange-400 transition px-10 py-4 rounded-2xl text-text-muted font-medium">
              View All Programs & Pricing →
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default ProgramsSection;
