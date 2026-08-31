import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getTrainers } from "../api/api.js";

const FALLBACK_TRAINERS = [
  { id: "local-bali", name: "Coach Bali", role: "Strength & Skills" },
  { id: "local-aman", name: "Coach Aman", role: "Mobility Expert" },
  { id: "local-aryan", name: "Coach Aryan", role: "Transformation Coach" },
];

export default function TrainersSection() {
  const [trainers, setTrainers] = useState(FALLBACK_TRAINERS);

  useEffect(() => {
    let alive = true;
    getTrainers().then((data) => {
      if (!alive) return;
      const remote = Array.isArray(data?.trainers) ? data.trainers : [];
      const remoteNames = new Set(remote.map((t) => String(t.name || "").trim().toLowerCase()));
      const local = FALLBACK_TRAINERS.filter((t) => !remoteNames.has(String(t.name).trim().toLowerCase()));
      setTrainers([...remote, ...local]);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section className="py-32 px-6 bg-bg">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-6xl text-center mb-20">OUR TRAINERS</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {trainers.map((trainer) => (
            <motion.div
              key={trainer.id || trainer.name}
              whileHover={{ y: -10 }}
              className="bg-surface border border-border rounded-3xl overflow-hidden"
            >
              {trainer.image_url ? (
                <img src={trainer.image_url} alt={trainer.name} className="w-full h-[400px] object-cover" loading="lazy" />
              ) : (
                <div className="h-[400px] bg-gradient-to-br from-orange-500/15 to-orange-900/10 flex items-center justify-center text-6xl opacity-50">Trainer</div>
              )}
              <div className="p-8">
                <h3 className="text-3xl text-orange-500">{trainer.name}</h3>
                <p className="text-text-muted mt-4">{trainer.role}</p>
                {trainer.bio && <p className="text-text-muted mt-3 text-sm leading-relaxed">{trainer.bio}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
