import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import PageTransition from "./components/PageTransition";

import Home      from "./pages/Home";
import About     from "./pages/About";
import Programs  from "./pages/Programs";
import Community from "./pages/Community";
import Contact   from "./pages/Contact";
import Gallery   from "./pages/Gallery";
import Admin     from "./pages/Admin";

function App() {
  const location = useLocation();
  const isAdmin  = location.pathname === "/admin";

  return (
    // bg/text now come from theme.css tokens (light/dark), not a hardcoded hex
    <div className="bg-bg text-text min-h-screen transition-colors duration-300">

      {!isAdmin && <Navbar />}

      <PageTransition>
        {/* location + key here are what let AnimatePresence detect route
            changes — PageTransition reads `location` itself, but Routes
            also needs the same key to remount per-route. */}
        <Routes location={location} key={location.pathname}>
          <Route path="/"          element={<Home />} />
          <Route path="/about"     element={<About />} />
          <Route path="/programs"  element={<Programs />} />
          <Route path="/community" element={<Community />} />
          <Route path="/contact"   element={<Contact />} />
          <Route path="/gallery"   element={<Gallery />} />
          <Route path="/admin"     element={<Admin />} />
        </Routes>
      </PageTransition>

      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}

    </div>
  );
}

export default App;
