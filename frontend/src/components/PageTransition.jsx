// src/components/PageTransition.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Respect prefers-reduced-motion — if set, skip motion entirely instead of
// running a reduced-but-still-present animation.
function usePrefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

/**
 * Wrap <Routes>...</Routes> with this, one level up, e.g.:
 *
 *   <PageTransition>
 *     <Routes location={location} key={location.pathname}>
 *       <Route path="/" element={<Home />} />
 *       ...
 *     </Routes>
 *   </PageTransition>
 *
 * IMPORTANT: AnimatePresence needs a stable `key` per route to detect the
 * change — pass `location` and `key={location.pathname}` down to <Routes>
 * from the parent (see App.jsx usage below).
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();

  // Mandatory scroll reset on every route change (prompt §23) —
  // implemented once, globally, rather than per-page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (reducedMotion) {
    // No motion wrapper at all — just render content, respecting the user's
    // OS-level preference rather than a token gesture toward it.
    return children;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // 400ms, within the 300–600ms target
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
