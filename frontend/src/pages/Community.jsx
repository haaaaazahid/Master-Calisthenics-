import { useState, useEffect } from "react";
import { getPosts, likePost as likePostApi, subscribe as subscribeApi } from "../api/api.js";

const typeColors = {
  announcement: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    label: "📢 Announcement",
  },

  workout: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    label: "💪 Workout",
  },

  photo: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    label: "📸 Photo",
  },

  video: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    label: "🎥 Video",
  },
};


/* ============================================================
   HELPERS
============================================================ */

function safeString(value, fallback = "") {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}


function getAuthorName(author) {
  const name = safeString(author, "MCI Coach").trim();

  return name || "MCI Coach";
}


function getAuthorInitial(author) {
  const name = getAuthorName(author);

  return name.charAt(0).toUpperCase();
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

    content: safeString(
      post?.content
    ),

    post_type: safeString(
      post?.post_type,
      "announcement"
    ).toLowerCase(),

    image_url: safeString(
      post?.image_url
    ),

    video_url: safeString(
      post?.video_url
    ),

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
    /*
     * Already an embed URL
     */
    if (value.includes("/embed/")) {
      return value;
    }

    /*
     * YouTube watch URL
     */
    if (value.includes("youtube.com/watch")) {
      const parsed = new URL(value);
      const videoId = parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    /*
     * YouTube short URL
     */
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

        setPosts(
          normalizedPosts
        );

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
     Optimistically bump the like count in the UI, then call the
     real backend (PATCH /posts/:id/like). If the request fails,
     roll the optimistic update back.
  ========================================================== */

  function handleLike(id) {

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

    likePostApi(id).catch((err) => {
      console.error("Like post error:", err);

      // Roll back the optimistic update on failure.
      setLiked((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });

      setPosts((previous) =>
        previous.map((post) => {
          if (post.id !== id) return post;
          return { ...post, likes: Math.max(0, getLikes(post.likes) - 1) };
        })
      );
    });

  }


  /* ==========================================================
     SUBSCRIBE
     Calls the real backend (POST /subscribe), which stores the
     subscriber in MySQL. New community posts trigger an email
     to everyone in that table (see subscriberController.js).
  ========================================================== */

  async function handleSubscribe(e) {

    e.preventDefault();

    if (!subEmail.trim()) {
      return;
    }

    setSubLoading(true);
    setSubStatus(null);

    try {

      await subscribeApi(subEmail.trim(), subName.trim());

      setSubStatus("success");

      setSubEmail("");
      setSubName("");

    } catch (err) {

      console.error("Subscribe error:", err);
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
          HERO
      ======================================================= */}

      <section
        className="h-[70vh] bg-cover bg-center relative flex items-center justify-center"
        style={{
          backgroundImage:
            "url('/src/assets/community.jpg')",
        }}
      >

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-bg" />

        <div className="relative z-10 text-center px-6">

          <p className="text-orange-500 uppercase tracking-[0.3em] text-sm font-semibold mb-4">
            Mira Road's Strongest Community
          </p>

          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            THE COMMUNITY
          </h1>

          <p className="text-text-muted text-xl max-w-2xl mx-auto leading-relaxed">
            More than fitness. A brotherhood of discipline,
            strength and transformation.
          </p>

        </div>

      </section>


      {/* ======================================================
          PILLARS
      ======================================================= */}

      <section className="max-w-6xl mx-auto py-20 px-6">

        <div className="grid md:grid-cols-3 gap-8">

          {[
            {
              icon: "🏆",
              title: "Events",
              desc: "Community workouts, outdoor sessions and competitions across Mumbai.",
            },

            {
              icon: "🤝",
              title: "Brotherhood",
              desc: "A supportive, disciplined environment built on accountability and growth.",
            },

            {
              icon: "🔥",
              title: "Transformations",
              desc: "Real people achieving elite physiques naturally, every day.",
            },
          ].map((item, i) => (

            <div
              key={i}
              className="bg-surface/80 backdrop-blur-xl p-10 rounded-[24px] border border-border hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300 group"
            >

              <div className="text-4xl mb-4">
                {item.icon}
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

          <div className="text-4xl mb-3">
            📬
          </div>

          <h2 className="text-3xl font-black mb-2">
            Join the MCI Community
          </h2>

          <p className="text-text-muted mb-8">
            Get notified whenever we post updates, offers,
            competitions, and new batches — straight to your inbox.
          </p>


          {subStatus === "success" ? (

            <div className="bg-green-500/20 border border-green-500/40 rounded-2xl p-6">

              <div className="text-3xl mb-2">
                ✅
              </div>

              <p className="text-green-400 font-semibold">
                You're in! We'll notify you of every new update.
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
                onChange={(e) =>
                  setSubName(e.target.value)
                }
                className="w-full bg-bg border border-border rounded-xl px-5 py-3 text-text placeholder-text-muted focus:outline-none focus:border-orange-500 transition"
              />

              <input
                type="email"
                placeholder="Your email address *"
                value={subEmail}
                onChange={(e) =>
                  setSubEmail(e.target.value)
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
                  : "Join Community 🚀"}

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

          <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium">

            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />

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

            {[1, 2, 3].map((i) => (

              <div
                key={i}
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

            <div className="text-4xl mb-3">
              ⚠️
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

              <div className="text-6xl mb-4">
                📭
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
                    bg: "bg-gray-500/20",
                    text: "text-text-muted",
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
                    className="bg-surface-alt rounded-2xl overflow-hidden border border-border hover:border-orange-500/30 transition-all duration-300 group"
                  >


                    {/* ==================================================
                        IMAGE
                    =================================================== */}

                    {post.image_url && (

                      <div className="relative overflow-hidden">

                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full max-h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                      </div>

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


                      {/* AUTHOR + META */}

                      <div className="flex items-center justify-between mb-4">

                        <div className="flex items-center gap-3">


                          {/* AUTHOR AVATAR */}

                          <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">

                            {getAuthorInitial(
                              post.author
                            )}

                          </div>


                          {/* AUTHOR */}

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


                        {/* TYPE */}

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${type.bg} ${type.text}`}
                        >

                          {type.label}

                        </span>

                      </div>


                      {/* TITLE */}

                      <h3 className="text-xl font-bold mb-2 leading-snug">

                        {post.title}

                      </h3>


                      {/* CONTENT */}

                      {post.content && (

                        <p className="text-text-muted text-sm leading-relaxed mb-5">

                          {post.content}

                        </p>

                      )}


                      {/* LIKE BUTTON */}

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

                        <span className="text-lg">

                          {liked[post.id]
                            ? "❤️"
                            : "🤍"}

                        </span>

                        <span>

                          {getLikes(
                            post.likes
                          )}{" "}

                          {liked[post.id]
                            ? "Liked!"
                            : "likes"}

                        </span>

                      </button>

                    </div>

                  </article>

                );

              })}

            </div>

          )}

      </section>

    </main>

  );

}