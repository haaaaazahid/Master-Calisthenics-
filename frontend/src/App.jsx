import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

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
    <div className="bg-[#0B0F19] text-white min-h-screen">

      {!isAdmin && <Navbar />}

      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/about"     element={<About />} />
        <Route path="/programs"  element={<Programs />} />
        <Route path="/community" element={<Community />} />
        <Route path="/contact"   element={<Contact />} />
        <Route path="/gallery"   element={<Gallery />} />
        <Route path="/admin"     element={<Admin />} />
      </Routes>

      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}

    </div>
  );
}

export default App;
