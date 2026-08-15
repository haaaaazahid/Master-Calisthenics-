import { useState } from "react";
import { submitContact, submitBooking } from "../api/api";

const Contact = () => {
  const [activeTab, setActiveTab] = useState("booking");

  const [bookingForm, setBookingForm] = useState({
    name: "", phone: "", email: "", program: "",
    session_time: "", preferred_date: "", one_week_offer: false, message: "",
  });
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactStatus, setContactStatus] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  async function handleBooking(e) {
    e.preventDefault();
    if (!bookingForm.session_time) return setBookingStatus("error:Please select a session time.");
    setBookingLoading(true);
    try {
      const data = await submitBooking(bookingForm);
      if (data.success) {
        setBookingStatus("success:Booking submitted! We will contact you shortly on WhatsApp.");
        setBookingForm({ name: "", phone: "", email: "", program: "", session_time: "", preferred_date: "", one_week_offer: false, message: "" });
      } else {
        setBookingStatus("error:" + (data.message || "Something went wrong."));
      }
    } catch {
      setBookingStatus("error:Could not connect to server. Please try again.");
    }
    setBookingLoading(false);
  }

  async function handleContact(e) {
    e.preventDefault();
    setContactLoading(true);
    try {
      const data = await submitContact(contactForm);
      if (data.success) {
        setContactStatus("success:Message sent! We will get back to you soon.");
        setContactForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setContactStatus("error:" + (data.message || "Something went wrong."));
      }
    } catch {
      setContactStatus("error:Could not connect to server. Please try again.");
    }
    setContactLoading(false);
  }

  const programs = [
    "Group Batch Training",
    "Personal Training (1-to-1)",
    "Group Personalized",
    "Kids Fitness & Calisthenics",
    "Women's Special Batch",
  ];

  return (
    <main className="bg-bg text-text min-h-screen pt-28">

      {/* HERO */}
      <section className="py-16 px-6 text-center">
        <h1 className="text-6xl md:text-7xl font-black mb-4">
          GET IN <span className="text-orange-500">TOUCH</span>
        </h1>
        <p className="text-text-muted text-lg max-w-xl mx-auto">
          Book a free trial or send us a message. We are based in Mira Road, Mumbai.
        </p>
      </section>

      {/* INFO CARDS */}
      <section className="max-w-5xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "📍", label: "Location", value: "PSZ sports arena, opp Gaurav residency phase 2, Beverly Park, Miraroad East (401107)" },
            { icon: "📞", label: "WhatsApp", value: "+91 84335 99778" },
            { icon: "🕐", label: "Timings", value: "Mon–Sat: 6AM–10PM" },
          ].map(c => (
            <div key={c.label} className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4">
              <span className="text-3xl">{c.icon}</span>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">{c.label}</p>
                <p className="text-text font-semibold">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TABS */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="flex bg-surface rounded-2xl p-1 mb-8 border border-border">
          <button
            onClick={() => setActiveTab("booking")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === "booking"
                ? "bg-orange-500 text-white shadow"
                : "text-text-muted hover:text-accent"
            }`}
          >
            Book Free Trial
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === "contact"
                ? "bg-orange-500 text-white shadow"
                : "text-text-muted hover:text-accent"
            }`}
          >
            Send Message
          </button>
        </div>

        {/* BOOKING FORM */}
        {activeTab === "booking" && (
          <div className="bg-surface border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-black mb-2">Book Your <span className="text-orange-500">Free Trial</span></h2>
            <p className="text-text-muted text-sm mb-6">Fill in your details and we will confirm your slot on WhatsApp.</p>

            {bookingStatus && (
              <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${
                bookingStatus.startsWith("success")
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}>
                {bookingStatus.split(":").slice(1).join(":")}
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    value={bookingForm.name}
                    onChange={e => setBookingForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                    required
                    className="w-full bg-bg border border-border hover:border-gold/40 focus:border-orange-500 rounded-xl px-4 py-3 text-text outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">WhatsApp Number *</label>
                  <input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={e => setBookingForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    required
                    className="w-full bg-bg border border-border hover:border-gold/40 focus:border-orange-500 rounded-xl px-4 py-3 text-text outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block">Email (optional)</label>
                <input
                  type="email"
                  value={bookingForm.email}
                  onChange={e => setBookingForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full bg-bg border border-border hover:border-gold/40 focus:border-orange-500 rounded-xl px-4 py-3 text-text outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block">Program Interested In</label>
                <select
                  value={bookingForm.program}
                  onChange={e => setBookingForm(p => ({ ...p, program: e.target.value }))}
                  className="w-full bg-bg border border-border hover:border-gold/40 focus:border-orange-500 rounded-xl px-4 py-3 text-text outline-none transition"
                >
                  <option value="">Select a program</option>
                  {programs.map(pr => <option key={pr} value={pr}>{pr}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-2 block">Preferred Session Time *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "morning", label: "Morning", time: "6:00 AM – 11:00 AM" },
                    { value: "evening", label: "Evening", time: "7:00 PM – 10:00 PM" },
                  ].map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setBookingForm(p => ({ ...p, session_time: s.value }))}
                      className={`p-4 rounded-xl border text-left transition ${
                        bookingForm.session_time === s.value
                          ? "border-orange-500 bg-orange-500/10 text-orange-600"
                          : "border-border hover:border-gold/40 text-text-muted"
                      }`}
                    >
                      <p className="font-semibold text-sm">{s.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{s.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block">Preferred Date (optional)</label>
                <input
                  type="date"
                  value={bookingForm.preferred_date}
                  onChange={e => setBookingForm(p => ({ ...p, preferred_date: e.target.value }))}
                  className="w-full bg-bg border border-border hover:border-gold/40 focus:border-orange-500 rounded-xl px-4 py-3 text-text outline-none transition"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={bookingForm.one_week_offer}
                  onChange={e => setBookingForm(p => ({ ...p, one_week_offer: e.target.checked }))}
                  className="mt-1 accent-orange-500"
                />
                <div>
                  <p className="text-sm text-orange-400 font-semibold group-hover:text-orange-300 transition">
                    Interested in 1 Week Trial for ₹499?
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">One-time offer for new members only</p>
                </div>
              </label>

              <div>
                <label className="text-xs text-text-muted mb-1 block">Message (optional)</label>
                <textarea
                  value={bookingForm.message}
                  onChange={e => setBookingForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Any questions or goals you want to share..."
                  rows={3}
                  className="w-full bg-bg border border-border hover:border-gold/40 focus:border-orange-500 rounded-xl px-4 py-3 text-text outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition text-sm tracking-wide"
              >
                {bookingLoading ? "Submitting..." : "Book Free Trial"}
              </button>
            </form>
          </div>
        )}

        {/* CONTACT FORM */}
        {activeTab === "contact" && (
          <div className="bg-surface border border-border rounded-3xl p-8">
            <h2 className="text-2xl font-black mb-2">Send Us a <span className="text-orange-500">Message</span></h2>
            <p className="text-text-muted text-sm mb-6">Have a question? We will reply within 24 hours.</p>

            {contactStatus && (
              <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${
                contactStatus.startsWith("success")
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}>
                {contactStatus.split(":").slice(1).join(":")}
              </div>
            )}

            <form onSubmit={handleContact} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Your Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Full name"
                    required
                    className="w-full bg-bg border border-border hover:border-gold/40 focus:border-orange-500 rounded-xl px-4 py-3 text-text outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Phone (optional)</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-bg border border-border hover:border-gold/40 focus:border-orange-500 rounded-xl px-4 py-3 text-text outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block">Email *</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-bg border border-border hover:border-gold/40 focus:border-orange-500 rounded-xl px-4 py-3 text-text outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1 block">Message *</label>
                <textarea
                  value={contactForm.message}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="What would you like to know?"
                  rows={5}
                  required
                  className="w-full bg-bg border border-border hover:border-gold/40 focus:border-orange-500 rounded-xl px-4 py-3 text-text outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition text-sm tracking-wide"
              >
                {contactLoading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        )}
      </section>

    </main>
  );
};

export default Contact;
