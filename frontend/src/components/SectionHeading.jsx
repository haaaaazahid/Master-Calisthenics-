// src/components/SectionHeading.jsx
import { motion } from "framer-motion";

/**
 * Usage:
 *   <SectionHeading eyebrow="MCI IN ACTION" title="GALLERY"
 *     subtitle="Real moments from our training sessions." />
 */
export default function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  const alignClass = align === "left" ? "text-left items-start" : "text-center items-center";

  return (
    <motion.div
      className={`flex flex-col ${alignClass} gap-3 mb-12`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {eyebrow && (
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
          {eyebrow}
        </span>
      )}
      <h2 className="text-4xl md:text-6xl font-black uppercase text-text leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-xl text-text-muted text-base md:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
