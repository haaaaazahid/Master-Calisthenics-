const Testimonials = () => {
  return (
    <section className="py-32 px-6 bg-[#0F172A]">

      <div className="max-w-6xl mx-auto text-center">

        <h2 className="text-6xl mb-20">
          WHAT OUR MEMBERS SAY
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-[#111827] p-10 rounded-3xl border border-gray-800">

            <p className="text-gray-400 leading-8">
              “Lost 10kg and gained confidence. Best training environment.”
            </p>

            <h3 className="mt-8 text-orange-500 text-2xl">
              Rahul
            </h3>

          </div>

          <div className="bg-[#111827] p-10 rounded-3xl border border-gray-800">

            <p className="text-gray-400 leading-8">
              “Learned handstands and improved my strength massively.”
            </p>

            <h3 className="mt-8 text-orange-500 text-2xl">
              Amaan
            </h3>

          </div>

          <div className="bg-[#111827] p-10 rounded-3xl border border-gray-800">

            <p className="text-gray-400 leading-8">
              “The coaching quality and community is next level.”
            </p>

            <h3 className="mt-8 text-orange-500 text-2xl">
              Zaid
            </h3>

          </div>

        </div>

      </div>

    </section>
  );
};

export default Testimonials;