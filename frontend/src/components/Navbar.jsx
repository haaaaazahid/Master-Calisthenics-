import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/",         label: "Home" },
  { to: "/about",    label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/gallery",  label: "Gallery" },
  { to: "/community",label: "Community" },
  { to: "/contact",  label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/60">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        <Link to="/" onClick={() => setOpen(false)}>
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-orange-500">M</span>CI
          </h1>
        </Link>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider font-medium">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`transition-colors ${
                location.pathname === l.to
                  ? "text-orange-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP CTA */}
        <div className="hidden md:block">
          <Link to="/contact">
            <button className="bg-orange-500 hover:bg-orange-600 transition text-white text-sm font-bold px-5 py-2.5 rounded-xl">
              Book Trial
            </button>
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden flex flex-col bg-black border-t border-gray-800 px-6 py-6 gap-5">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`text-sm uppercase tracking-wider font-medium transition-colors ${
                location.pathname === l.to ? "text-orange-400" : "text-gray-300 hover:text-white"
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
