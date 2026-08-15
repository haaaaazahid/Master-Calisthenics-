// src/components/AnimatedButton.jsx
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Usage:
 *   <AnimatedButton to="/programs">Explore Programs</AnimatedButton>
 *   <AnimatedButton href="https://wa.me/..." variant="secondary">Ask on WhatsApp</AnimatedButton>
 *   <AnimatedButton onClick={fn} variant="secondary" showArrow={false}>Submit</AnimatedButton>
 */
export default function AnimatedButton({
  children,
  to,
  href,
  onClick,
  variant = "primary", // "primary" | "secondary"
  showArrow = true,
  type = "button",
  className = "",
}) {
  const base = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3
    font-semibold text-sm tracking-wide transition-colors duration-300 ease-premium`;

  const variants = {
    primary:
      "bg-accent text-white hover:bg-accent-hover",
    secondary:
      "border border-border text-text hover:border-accent bg-transparent",
  };

  const content = (
    <motion.span
      className={`${base} ${variants[variant]} ${className}`}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
      {showArrow && (
        <motion.span
          className="inline-flex"
          initial={{ x: 0 }}
          whileHover={{ x: 3 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight size={16} />
        </motion.span>
      )}
    </motion.span>
  );

  if (to) return <Link to={to}>{content}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
  return (
    <button type={type} onClick={onClick} className="inline-block">
      {content}
    </button>
  );
}
