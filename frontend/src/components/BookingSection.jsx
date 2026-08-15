import { Link } from "react-router-dom";

const BookingSection = () => {
  return (
    <section className="py-24 px-6 bg-bg">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-5xl font-black mb-4">
          READY TO <span className="text-orange-500">START?</span>
        </h2>
        <p className="text-text-muted mb-8">Book your free trial session today. No commitment required.</p>
        <Link to="/contact">
          <button className="bg-orange-500 hover:bg-orange-600 transition text-white font-bold px-10 py-4 rounded-2xl text-lg">
            Book Free Trial
          </button>
        </Link>
      </div>
    </section>
  );
};

export default BookingSection;