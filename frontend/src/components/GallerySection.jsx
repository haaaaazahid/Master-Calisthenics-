import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGallery } from "../api/api.js";

export default function GallerySection() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    let alive = true;
    getGallery()
      .then((data) => {
        if (!alive) return;
        const folders = Array.isArray(data?.folders) ? data.folders : [];
        const flat = folders.flatMap((folder) => Array.isArray(folder.photos) ? folder.photos : []);
        setPhotos(flat.slice(0, 6));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section className="py-24 px-6 bg-bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-12 flex-wrap">
          <div>
            <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-3">MCI In Action</p>
            <h2 className="text-5xl md:text-6xl font-black">MCI GALLERY</h2>
          </div>
          <Link to="/gallery" className="text-orange-500 font-semibold hover:text-orange-400 transition">
            View Full Gallery →
          </Link>
        </div>

        {photos.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <Link key={photo.id} to="/gallery" className="h-[300px] rounded-3xl overflow-hidden bg-surface border border-border group">
                <img src={photo.image_url} alt={photo.caption || "MCI Gallery"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-[300px] rounded-3xl bg-surface border border-border" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
