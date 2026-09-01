import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/offers", label: "Offers" },
  { to: "/gallery", label: "Gallery" },
  { to: "/community", label: "Community" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-bg/90 backdrop-blur-xl border-b border-border/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 gap-4">
        <Link to="/" onClick={() => setOpen(false)} className="shrink-0">
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-orange-500">M</span>CI
          </h1>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider font-medium">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`transition-colors ${
                location.pathname === l.to
                  ? "text-orange-500"
                  : "text-text-muted hover:text-accent"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle aria-label="Toggle light and dark theme" />
          <Link to="/contact">
            <button className="bg-orange-500 hover:bg-orange-600 transition text-white text-sm font-bold px-5 py-2.5 rounded-xl">
              Book Trial
            </button>
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle aria-label="Toggle light and dark theme" />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="w-9 h-9 flex items-center justify-center text-text border border-border rounded-full"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden flex flex-col bg-bg border-t border-border px-6 py-6 gap-5">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`text-sm uppercase tracking-wider font-medium transition-colors ${
                location.pathname === l.to
                  ? "text-orange-500"
                  : "text-text-muted hover:text-accent"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/contact" onClick={() => setOpen(false)}>
            <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl mt-2">
              Book Free Trial
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
