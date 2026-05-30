const InstagramSection = () => {
  return (
    <section className="py-32 px-6 bg-[#0F172A]">

      <div className="max-w-7xl mx-auto text-center">

        <h2 className="text-6xl mb-8">
          FOLLOW MCI
        </h2>

        <p className="text-gray-400 mb-16">
          Daily workouts, transformations and calisthenics content.
        </p>

        <div className="grid md:grid-cols-4 gap-6">

          <div className="h-[250px] rounded-3xl bg-[#111827] border border-gray-800"></div>

          <div className="h-[250px] rounded-3xl bg-[#111827] border border-gray-800"></div>

          <div className="h-[250px] rounded-3xl bg-[#111827] border border-gray-800"></div>

          <div className="h-[250px] rounded-3xl bg-[#111827] border border-gray-800"></div>

        </div>

      </div>

    </section>
  );
};

export default InstagramSection;