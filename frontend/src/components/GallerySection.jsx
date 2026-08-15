const GallerySection = () => {
  return (
    <section className="py-32 px-6 bg-bg-secondary">

      <div className="max-w-7xl mx-auto">

        <h2 className="text-6xl text-center mb-20">
          MCI GALLERY
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="h-[300px] rounded-3xl bg-surface border border-border"></div>

          <div className="h-[300px] rounded-3xl bg-surface border border-border"></div>

          <div className="h-[300px] rounded-3xl bg-surface border border-border"></div>

          <div className="h-[300px] rounded-3xl bg-surface border border-border"></div>

          <div className="h-[300px] rounded-3xl bg-surface border border-border"></div>

          <div className="h-[300px] rounded-3xl bg-surface border border-border"></div>

        </div>

      </div>

    </section>
  );
};

export default GallerySection;