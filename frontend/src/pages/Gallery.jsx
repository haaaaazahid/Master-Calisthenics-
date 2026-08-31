import { useEffect, useState } from "react";
import { getGallery } from "../api/api.js";

export default function Gallery() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    let alive = true;
    getGallery()
      .then((data) => {
        if (!alive || !data?.success) return;

        // Express/MySQL returns { folders: [{ id, name, photos: [...] }] }.
        // Keep compatibility with the older flat { gallery: [...] } response too.
        let next = Array.isArray(data.folders) ? data.folders : [];
        if (!next.length) {
          const items = Array.isArray(data.gallery)
            ? data.gallery
            : Array.isArray(data.data)
            ? data.data
            : [];
          const grouped = {};
          items.forEach((item) => {
            const category = item.category || "training";
            if (!grouped[category]) {
              grouped[category] = {
                id: category,
                name: category.charAt(0).toUpperCase() + category.slice(1),
                photos: [],
              };
            }
            grouped[category].photos.push(item);
          });
          next = Object.values(grouped);
        }

        next = next
          .map((folder) => ({
            ...folder,
            photos: Array.isArray(folder.photos) ? folder.photos : [],
          }))
          .filter((folder) => folder.photos.length > 0);

        setFolders(next);
        setActiveFolder((current) =>
          current && next.some((folder) => folder.id === current)
            ? current
            : next[0]?.id ?? null
        );
      })
      .catch((error) => {
        console.error("Gallery load error:", error);
        if (alive) {
          setFolders([]);
          setActiveFolder(null);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const currentFolder = folders.find((folder) => folder.id === activeFolder);

  return (
    <main className="bg-bg text-text min-h-screen">
      <section className="pt-36 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
        <p className="text-orange-500 uppercase tracking-[0.3em] text-sm font-semibold mb-4">
          MCI In Action
        </p>
        <h1 className="text-6xl md:text-8xl font-black mb-6">GALLERY</h1>
        <p className="text-text-muted text-lg max-w-xl mx-auto">
          Real moments from our training sessions, competitions, and community events.
        </p>
      </section>

      {loading ? (
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : !currentFolder ? (
        <div className="text-center py-32 text-text-muted">
          <div className="text-xl font-medium">Gallery coming soon.</div>
        </div>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-6 mb-10">
            <div className="flex flex-wrap gap-3">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setActiveFolder(folder.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    activeFolder === folder.id
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : "bg-surface text-text-muted border border-border hover:border-orange-500/50 hover:text-accent"
                  }`}
                >
                  {folder.name}
                  <span className="ml-2 text-xs opacity-70">({folder.photos.length})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 pb-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{currentFolder.name}</h2>
              <span className="text-text-muted text-sm">{currentFolder.photos.length} photos</span>
            </div>

            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {currentFolder.photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightbox({ url: photo.image_url, caption: photo.caption })}
                  className="break-inside-avoid w-full rounded-2xl overflow-hidden cursor-pointer group relative text-left block"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.caption || "MCI Gallery"}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {photo.caption && (
                    <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-sm font-medium">{photo.caption}</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white text-3xl hover:text-orange-400 transition"
            onClick={() => setLightbox(null)}
            aria-label="Close gallery image"
          >
            ×
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.caption || "Gallery"}
              className="w-full max-h-[85vh] object-contain rounded-2xl"
            />
            {lightbox.caption && (
              <p className="text-gray-300 text-center mt-4">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
