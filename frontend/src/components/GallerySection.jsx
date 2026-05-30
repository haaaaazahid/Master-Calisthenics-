const GallerySection = () => {
  return (
    <section className="py-32 px-6 bg-[#0F172A]">

      <div className="max-w-7xl mx-auto">

        <h2 className="text-6xl text-center mb-20">
          MCI GALLERY
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="h-[300px] rounded-3xl bg-[#111827] border border-gray-800"></div>

          <div className="h-[300px] rounded-3xl bg-[#111827] border border-gray-800"></div>

          <div className="h-[300px] rounded-3xl bg-[#111827] border border-gray-800"></div>

          <div className="h-[300px] rounded-3xl bg-[#111827] border border-gray-800"></div>

          <div className="h-[300px] rounded-3xl bg-[#111827] border border-gray-800"></div>

          <div className="h-[300px] rounded-3xl bg-[#111827] border border-gray-800"></div>

        </div>

      </div>

    </section>
  );
};

export default GallerySection;