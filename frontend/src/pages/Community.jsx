import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getPosts,
  likePost as likePostApi,
  subscribe as subscribeApi,
} from "../api/api.js";

const communityImage = "/Community.jpeg";

const typeColors = {
  announcement: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    label: "Announcement",
  },

  workout: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    label: "Workout",
  },

  photo: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    label: "Photo",
  },

  video: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    label: "Video",
  },
};

/* ============================================================
   HELPERS
============================================================ */

function safeString(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function getAuthorName(author) {
  const name = safeString(author, "MCI Coach").trim();

  return name || "MCI Coach";
}

function getAuthorInitial(author) {
  return getAuthorName(author).charAt(0).toUpperCase();
}

function getLikes(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, number);
}

function formatDate(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizePost(post) {
  return {
    ...post,

    id: safeString(post?.id),

    author: getAuthorName(post?.author),

    title: safeString(
      post?.title,
      "Untitled Post"
    ),

    content: safeString(post?.content),

    post_type: safeString(
      post?.post_type,
      "announcement"
    ).toLowerCase(),

    image_url: safeString(
      post?.image_url
    ).trim(),

    video_url: safeString(
      post?.video_url
    ).trim(),

    likes: getLikes(
      post?.likes
    ),

    created_at:
      post?.created_at || "",
  };
}

function getVideoEmbedUrl(url) {
  const value = safeString(url).trim();

  if (!value) {
    return "";
  }

  try {
    if (value.includes("/embed/")) {
      return value;
    }

    if (value.includes("youtube.com/watch")) {
      const parsed = new URL(value);
      const videoId =
        parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (value.includes("youtu.be/")) {
      const parsed = new URL(value);
      const videoId =
        parsed.pathname.replace("/", "");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return value;
  } catch {
    return value;
  }
}

/* ============================================================
   COMMUNITY PAGE
============================================================ */

export default function Community() {
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [liked, setLiked] =
    useState({});

  const [subEmail, setSubEmail] =
    useState("");

  const [subName, setSubName] =
    useState("");

  const [subStatus, setSubStatus] =
    useState(null);

  const [subLoading, setSubLoading] =
    useState(false);

  /*
   * Stores the selected post image for the fullscreen lightbox.
   *
   * {
   *   image: "...",
   *   title: "..."
   * }
   */
  const [postLightbox, setPostLightbox] =
    useState(null);

  /* ==========================================================
     LOAD POSTS
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      try {
        setLoading(true);
        setError("");

        const data = await getPosts();

        if (!mounted) {
          return;
        }

        if (!data || !data.success) {
          throw new Error(
            data?.error ||
            data?.message ||
            "Unable to load community posts."
          );
        }

        const sourcePosts =
          Array.isArray(data.posts)
            ? data.posts
            : Array.isArray(data.data)
            ? data.data
            : [];

        const normalizedPosts =
          sourcePosts
            .map(normalizePost)
            .filter(
              (post) => post.id
            );

        setPosts(normalizedPosts);
      } catch (err) {
        console.error(
          "Community posts API error:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load community updates right now."
          );

          setPosts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     LIKE
  ========================================================== */

  async function handleLike(id) {
    if (!id || liked[id]) {
      return;
    }

    setLiked((previous) => ({
      ...previous,
      [id]: true,
    }));

    setPosts((previous) =>
      previous.map((post) => {
        if (post.id !== id) {
          return post;
        }

        return {
          ...post,
          likes:
            getLikes(post.likes) + 1,
        };
      })
    );

    try {
      await likePostApi(id);
    } catch (err) {
      console.error(
        "Like post error:",
        err
      );

      // Roll back optimistic UI.
      setLiked((previous) => {
        const next = {
          ...previous,
        };

        delete next[id];

        return next;
      });

      setPosts((previous) =>
        previous.map((post) => {
          if (post.id !== id) {
            return post;
          }

          return {
            ...post,
            likes: Math.max(
              0,
              getLikes(post.likes) - 1
            ),
          };
        })
      );
    }
  }

  /* ==========================================================
     SUBSCRIBE
  ========================================================== */

  async function handleSubscribe(event) {
    event.preventDefault();

    const email =
      subEmail.trim();

    if (!email) {
      return;
    }

    setSubLoading(true);
    setSubStatus(null);

    try {
      await subscribeApi(
        email,
        subName.trim()
      );

      setSubStatus("success");
      setSubEmail("");
      setSubName("");
    } catch (err) {
      console.error(
        "Subscribe error:",
        err
      );

      setSubStatus("error");
    } finally {
      setSubLoading(false);
    }
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="bg-bg text-text min-h-screen">

      {/* ======================================================
          COMMUNITY HERO
      ======================================================= */}

      <section className="relative min-h-[65vh] md:min-h-[72vh] overflow-hidden">

        <img
          src={communityImage}
          alt="Master Calisthenics India community"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />

        {/* Soft overlay so the photograph stays visible */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Very subtle bottom transition */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg via-bg/25 to-transparent" />

        <div className="relative z-10 min-h-[65vh] md:min-h-[72vh] flex items-end">

          <div className="w-full max-w-7xl mx-auto px-6 pb-14 md:pb-20">

            <p className="text-orange-500 uppercase tracking-[0.3em] text-sm font-bold mb-5 drop-shadow-[0_2px_5px_rgba(0,0,0,0.25)]">
              Mira Road's Strongest Community
            </p>

            <h1 className="text-white text-5xl sm:text-6xl md:text-8xl font-black leading-[0.92] tracking-tight max-w-5xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              THE
              <br />
              COMMUNITY
            </h1>

            <p className="text-white/90 text-lg md:text-xl max-w-2xl mt-7 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
              More than fitness. A community built on discipline,
              strength, friendship, and transformation.
            </p>

          </div>
        </div>
      </section>

      {/* ======================================================
          PILLARS
      ======================================================= */}

      <section className="max-w-6xl mx-auto py-20 px-6">

        <div className="grid md:grid-cols-3 gap-8">

          {[
            {
              number: "01",
              title: "Events",
              desc: "Community workouts, outdoor sessions and competitions across Mumbai.",
            },

            {
              number: "02",
              title: "Brotherhood",
              desc: "A supportive, disciplined environment built on accountability and growth.",
            },

            {
              number: "03",
              title: "Transformations",
              desc: "Real people achieving stronger, healthier physiques naturally, every day.",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="bg-surface/80 backdrop-blur-xl p-10 rounded-[24px] border border-border hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300 group"
            >

              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-sm mb-6">
                {item.number}
              </div>

              <h2 className="text-2xl font-bold mb-3 text-orange-500 group-hover:text-orange-400 transition">
                {item.title}
              </h2>

              <p className="text-text-muted leading-relaxed">
                {item.desc}
              </p>

            </div>
          ))}

        </div>
      </section>

      {/* ======================================================
          JOIN COMMUNITY
      ======================================================= */}

      <section className="max-w-3xl mx-auto px-6 pb-16">

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-900/10 border border-orange-500/30 rounded-3xl p-10 text-center">

          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-sm font-black">
            MCI
          </div>

          <h2 className="text-3xl font-black mb-2">
            Join the MCI Community
          </h2>

          <p className="text-text-muted mb-8">
            Get notified whenever we post updates, offers,
            competitions, and new batches.
          </p>

          {subStatus === "success" ? (

            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">

              <div className="text-3xl mb-2 text-green-400">
                ✓
              </div>

              <p className="text-green-400 font-semibold">
                You're in! We'll notify you of new updates.
              </p>

            </div>

          ) : (

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col gap-4"
            >

              <input
                type="text"
                placeholder="Your name (optional)"
                value={subName}
                onChange={(event) =>
                  setSubName(event.target.value)
                }
                className="w-full bg-bg border border-border rounded-xl px-5 py-3 text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
              />

              <input
                type="email"
                placeholder="Your email address *"
                value={subEmail}
                onChange={(event) =>
                  setSubEmail(event.target.value)
                }
                required
                className="w-full bg-bg border border-border rounded-xl px-5 py-3 text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
              />

              <button
                type="submit"
                disabled={subLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition text-white font-bold py-4 rounded-xl text-lg"
              >
                {subLoading
                  ? "Joining..."
                  : "Join Community"}
              </button>

              {subStatus === "error" && (
                <p className="text-red-400 text-sm">
                  Something went wrong. Please try again.
                </p>
              )}

              <p className="text-text-muted text-xs">
                No spam. Unsubscribe anytime.
              </p>

            </form>

          )}

        </div>
      </section>

      {/* ======================================================
          LIVE POSTS FEED
      ======================================================= */}

      <section className="max-w-3xl mx-auto pb-24 px-6">

        <div className="flex items-center gap-4 mb-3">

          <h2 className="text-4xl font-black">
            Latest Updates
          </h2>

          <span className="flex items-center gap-1.5 bg-green-500/10 text-green-500 text-xs px-3 py-1 rounded-full font-medium">

            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />

            Live

          </span>
        </div>

        <p className="text-text-muted mb-10">
          Straight from our coaches and community.
        </p>

        {/* ====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="space-y-4">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-surface rounded-2xl h-48 animate-pulse"
              />
            ))}

          </div>
        )}

        {/* ====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">

            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 font-black">
              !
            </div>

            <p className="text-red-400 font-semibold">
              {error}
            </p>

            <p className="text-text-muted text-sm mt-2">
              Please refresh the page and try again.
            </p>

          </div>
        )}

        {/* ====================================================
            EMPTY
        ===================================================== */}

        {!loading &&
          !error &&
          posts.length === 0 && (
            <div className="text-center py-20 text-text-muted">

              <div className="text-4xl mb-4 text-orange-500 font-black">
                MCI
              </div>

              <p>
                No posts yet. Check back soon!
              </p>

            </div>
          )}

        {/* ====================================================
            POSTS
        ===================================================== */}

        {!loading &&
          !error &&
          posts.length > 0 && (

            <div className="space-y-6">

              {posts.map((post) => {

                const type =
                  typeColors[
                    post.post_type
                  ] || {
                    bg: "bg-orange-500/10",
                    text: "text-orange-500",
                    label:
                      post.post_type ||
                      "Post",
                  };

                const videoUrl =
                  getVideoEmbedUrl(
                    post.video_url
                  );

                return (
                  <article
                    key={post.id}
                    className="bg-surface-alt rounded-2xl overflow-hidden border border-border hover:border-orange-500/30 transition-all duration-300"
                  >

                    {/* ==================================================
                        POST IMAGE
                    =================================================== */}

                    {post.image_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setPostLightbox({
                            image:
                              post.image_url,
                            title:
                              post.title,
                          })
                        }
                        className="relative block w-full overflow-hidden cursor-zoom-in group text-left"
                        aria-label={`Open image: ${post.title}`}
                      >

                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                        <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          View image
                        </span>

                      </button>
                    )}

                    {/* ==================================================
                        VIDEO
                    =================================================== */}

                    {videoUrl && (
                      <div className="aspect-video">

                        <iframe
                          src={videoUrl}
                          title={post.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />

                      </div>
                    )}

                    {/* ==================================================
                        CONTENT
                    =================================================== */}

                    <div className="p-6">

                      <div className="flex items-center justify-between mb-4 gap-4">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm">
                            {getAuthorInitial(
                              post.author
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-text">
                              {getAuthorName(
                                post.author
                              )}
                            </p>

                            <p className="text-xs text-text-muted">
                              {formatDate(
                                post.created_at
                              )}
                            </p>
                          </div>

                        </div>

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${type.bg} ${type.text}`}
                        >
                          {type.label}
                        </span>

                      </div>

                      <h3 className="text-xl font-bold mb-2 leading-snug">
                        {post.title}
                      </h3>

                      {post.content && (
                        <p className="text-text-muted text-sm leading-relaxed mb-5">
                          {post.content}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleLike(post.id)
                        }
                        className={`flex items-center gap-2 text-sm font-medium transition-all px-4 py-2 rounded-xl ${
                          liked[post.id]
                            ? "text-orange-400 bg-orange-500/10"
                            : "text-text-muted hover:text-orange-400 hover:bg-orange-500/10"
                        }`}
                      >

                        <span>
                          {liked[post.id]
                            ? "Liked"
                            : "Like"}
                        </span>

                        <span>
                          {getLikes(
                            post.likes
                          )}
                        </span>

                      </button>

                    </div>
                  </article>
                );
              })}

            </div>
          )}

      </section>

      {/* ======================================================
          POST IMAGE LIGHTBOX
      ======================================================= */}

      <AnimatePresence>
        {postLightbox && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            onClick={() =>
              setPostLightbox(null)
            }
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 20,
              }}
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="relative w-full max-w-6xl max-h-[92vh]"
            >

              {/* Close */}
              <button
                type="button"
                onClick={() =>
                  setPostLightbox(null)
                }
                aria-label="Close image"
                className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 w-11 h-11 rounded-full bg-black/70 border border-white/20 text-white text-2xl flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-colors"
              >
                ×
              </button>

              {/* Full-size image */}
              <div className="flex items-center justify-center">

                <img
                  src={postLightbox.image}
                  alt={
                    postLightbox.title ||
                    "Community image"
                  }
                  className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl"
                />

              </div>

              {/* Caption */}
              {postLightbox.title && (
                <div className="text-center mt-4">

                  <p className="text-white text-base sm:text-lg font-semibold">
                    {postLightbox.title}
                  </p>

                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}