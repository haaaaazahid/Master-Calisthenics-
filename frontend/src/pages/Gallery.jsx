import { useState, useEffect } from "react";
import { getGallery } from "../api/api.js";

export default function Gallery() {
  const [folders, setFolders]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeFolder, setActiveFolder] = useState(null);
  const [lightbox, setLightbox]       = useState(null); // {url, caption}

  useEffect(() => {
    getGallery()
      .then(data => {
        if (data.success) {
          const withPhotos = data.folders.filter(f => f.photos && f.photos.length > 0);
          setFolders(withPhotos);
          if (withPhotos.length > 0) setActiveFolder(withPhotos[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const currentFolder = folders.find(f => f.id === activeFolder);

  return (
    <main className="bg-[#050816] text-white min-h-screen">

      {/* HERO */}
      <section className="pt-36 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
        <p className="text-orange-500 uppercase tracking-[0.3em] text-sm font-semibold mb-4">
          MCI In Action
        </p>
        <h1 className="text-6xl md:text-8xl font-black mb-6">GALLERY</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Real moments from our training sessions, competitions, and community events.
        </p>
      </section>

      {loading ? (
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-[#111827] rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : folders.length === 0 ? (
        <div className="text-center py-32 text-gray-600">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-xl">Gallery coming soon!</p>
          <p className="text-sm mt-2">Check back after our next session.</p>
        </div>
      ) : (
        <>
          {/* FOLDER TABS */}
          <div className="max-w-6xl mx-auto px-6 mb-10">
            <div className="flex flex-wrap gap-3">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    activeFolder === folder.id
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : "bg-[#111827] text-gray-400 border border-gray-700 hover:border-orange-500/50 hover:text-white"
                  }`}
                >
                  {folder.name}
                  <span className="ml-2 text-xs opacity-70">({folder.photos.length})</span>
                </button>
              ))}
            </div>
          </div>

          {/* PHOTO GRID */}
          <div className="max-w-6xl mx-auto px-6 pb-24">
            {currentFolder && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">{currentFolder.name}</h2>
                  <span className="text-gray-500 text-sm">{currentFolder.photos.length} photos</span>
                </div>
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {currentFolder.photos.map(photo => (
                    <div
                      key={photo.id}
                      onClick={() => setLightbox({ url: photo.image_url, caption: photo.caption })}
                      className="break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group relative"
                    >
                      <img
                        src={photo.image_url}
                        alt={photo.caption || "MCI Gallery"}
                        className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {photo.caption && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <p className="text-white text-sm font-medium">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-3xl hover:text-orange-400 transition"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
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
