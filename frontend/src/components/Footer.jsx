import { Link } from "react-router-dom";

const Footer = () => {
  const branches = [
    {
      name: "Beverly Park",
      address:
        "PSZ Sports Arena, Opp. Gaurav Residency Phase 2, Beverly Park, Mira Road East, Maharashtra 401107",
      mapsUrl: "https://maps.app.goo.gl/ksU97R9Zv3UtehXy7",
    },
    {
      name: "Kashimira",
      address:
        "Kashimira, Mira Road, Maharashtra",
      mapsUrl: "https://maps.app.goo.gl/gDF73hJeNsBQ5n3p9",
    },
  ];

  return (
    <footer className="bg-surface-alt border-t border-border py-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* TOP ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* BRAND */}
          <div className="md:col-span-2">
            <h2 className="text-4xl font-black mb-4 text-text">
              <span className="text-orange-500">M</span>CI
            </h2>

            <p className="text-text-muted text-sm leading-relaxed max-w-sm">
              Master Calisthenics India — Mira Road, Mumbai. Building real
              strength, mobility, and endurance through professional
              calisthenics training.
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <a
                href="https://www.instagram.com/mci_2025?igsh=MWZibjkzcm43dG5s"
                target="_blank"
                rel="noreferrer"
                className="text-text-muted hover:text-orange-500 transition text-sm"
              >
                Instagram
              </a>

              <a
                href="https://www.youtube.com/@MasterCalisthenics-x8w"
                target="_blank"
                rel="noreferrer"
                className="text-text-muted hover:text-orange-500 transition text-sm"
              >
                YouTube
              </a>

              <a
                href="https://wa.me/918433599778"
                target="_blank"
                rel="noreferrer"
                className="text-text-muted hover:text-orange-500 transition text-sm"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-text-muted mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-sm text-text-muted">
              <Link
                to="/"
                className="hover:text-orange-500 transition"
              >
                Home
              </Link>

              <Link
                to="/about"
                className="hover:text-orange-500 transition"
              >
                About
              </Link>

              <Link
                to="/programs"
                className="hover:text-orange-500 transition"
              >
                Programs
              </Link>

              <Link
                to="/community"
                className="hover:text-orange-500 transition"
              >
                Community
              </Link>

              <Link
                to="/contact"
                className="hover:text-orange-500 transition"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* CONTACT / BRANCHES */}
          <div>
            <h3 className="text-sm font-semibold uppercase text-text-muted mb-4">
              Our Branches
            </h3>

            <div className="flex flex-col gap-5 text-sm">

              {branches.map((branch) => (
                <a
                  key={branch.name}
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500 text-lg leading-none">
                      📍
                    </span>

                    <div>
                      <p className="font-semibold text-text group-hover:text-orange-500 transition">
                        {branch.name}
                      </p>

                      <p className="text-text-muted text-xs leading-relaxed mt-1">
                        {branch.address}
                      </p>

                      <p className="text-orange-500 text-xs mt-1 opacity-0 group-hover:opacity-100 transition">
                        Open in Google Maps →
                      </p>
                    </div>
                  </div>
                </a>
              ))}

              <div className="mt-1">
                <p className="text-text-muted">
                  📞 +91 84335 99778
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM ROW */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-3">

          <p className="text-text-muted text-sm">
            © 2026 Master Calisthenics India. All rights reserved.
          </p>

          <Link
            to="/admin"
            className="text-text-muted hover:text-orange-500 transition text-xs"
          >
            Coach Access
          </Link>

        </div>

      </div>
    </footer>
  );
};

export default Footer;