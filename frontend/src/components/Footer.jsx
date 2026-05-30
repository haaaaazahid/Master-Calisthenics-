import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* TOP ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* BRAND */}
          <div className="md:col-span-2">
            <h2 className="text-4xl font-black mb-4">
              <span className="text-orange-500">M</span>CI
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Master Calisthenics India — Mira Road, Mumbai. Building real strength,
              mobility, and endurance through professional calisthenics training.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://www.instagram.com/mci_2025?igsh=MWZibjkzcm43dG5s" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-orange-500 transition text-sm">
                Instagram
              </a>
              <a href="https://www.youtube.com/@MasterCalisthenics-x8w" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-orange-500 transition text-sm">
                YouTube
              </a>
              <a href="https://wa.me/918433599778" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-orange-500 transition text-sm">
                WhatsApp
              </a>
            </div>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-gray-300 mb-4">Quick Links</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <Link to="/" className="hover:text-orange-500 transition">Home</Link>
              <Link to="/about" className="hover:text-orange-500 transition">About</Link>
              <Link to="/programs" className="hover:text-orange-500 transition">Programs</Link>
              <Link to="/community" className="hover:text-orange-500 transition">Community</Link>
              <Link to="/contact" className="hover:text-orange-500 transition">Contact</Link>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-gray-300 mb-4">Contact</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <p>Mira Road, Mumbai</p>
              <p>+91 84335 99778</p>
              <p>📍 PSZ sports arena, opp Gaurav residency phase 2, Beverly Park, Miraroad East (401107)</p>

            </div>
          </div>

        </div>

        {/* BOTTOM ROW */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-sm">
            2026 Master Calisthenics India. All rights reserved.
          </p>
          <Link to="/admin" className="text-gray-700 hover:text-gray-500 transition text-xs">
            Coach Access
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
