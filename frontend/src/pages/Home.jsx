import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPrograms,
  getPosts,
  getReviews,
  getTrainers,
} from "../api/api.js";


// Trainer images
import coachAman from "../assets/trainers/coach-aman.jpeg";
import coachHeaven from "../assets/trainers/coach-heaven.jpeg";
import coachKabir from "../assets/trainers/coach-kabir.jpeg";
import coachKunal from "../assets/trainers/coach-kunal.jpeg";
import coachBali from "../assets/trainers/Coach Bali.jpeg";
import coachSunny from "../assets/trainers/Coach Sunny.jpeg";
import coachZahid from "../assets/trainers/Coach Zahid.jpeg";
import coachVedant from "../assets/trainers/Coach Vedant.jpeg";


// ---------------------------------------------------------
// FALLBACK TRAINERS
// Used automatically if API returns no trainers.
// ---------------------------------------------------------

const FALLBACK_TRAINERS = [
  {
    name: "Founder Vaibhav",
    role: "Founder & Head Coach",
    image: null,
  },
  {
    name: "Coach Kunal",
    role: "Calisthenics Coach",
    image: coachKunal,
  },
  {
    name: "Coach Bali",
    role: "Calisthenics Coach",
    image: coachBali,
  },
  {
    name: "Coach Aman",
    role: "Calisthenics Coach",
    image: coachAman,
  },
  {
    name: "Coach Aryan",
    role: "Calisthenics Coach",
    image: null,
  },
  {
    name: "Coach Kabir",
    role: "Calisthenics Coach",
    image: coachKabir,
  },
  {
    name: "Coach Vedant",
    role: "Calisthenics Coach",
    image: coachVedant,
  },
  {
    name: "Coach Vedang",
    role: "Calisthenics Coach",
    image: null,
  },
  {
    name: "Coach Heaven",
    role: "Calisthenics Coach",
    image: coachHeaven,
  },
  {
    name: "Coach Sunny",
    role: "Calisthenics Coach",
    image: coachSunny,
  },
  {
    name: "Coach Zahid",
    role: "Calisthenics Coach",
    image: coachZahid,
  },
];


// ---------------------------------------------------------
// POST TYPE COLORS
// ---------------------------------------------------------

const typeColors = {
  announcement: "bg-blue-500/20 text-blue-400",
  workout: "bg-orange-500/20 text-orange-400",
  photo: "bg-purple-500/20 text-purple-400",
  video: "bg-green-500/20 text-green-400",
};


// ---------------------------------------------------------
// SAFE JSON HELPERS
// Prevent malformed API data from crashing React.
// ---------------------------------------------------------

function safeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}


function safeRating(value) {
  const rating = Number(value);

  if (Number.isNaN(rating)) {
    return 0;
  }

  return Math.min(5, Math.max(0, Math.round(rating)));
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}


// =========================================================
// HOME PAGE
// =========================================================

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [lightbox, setLightbox] = useState(null);


  // -------------------------------------------------------
  // LOAD API DATA
  // -------------------------------------------------------

  useEffect(() => {
    getPrograms()
      .then((data) => {
        setPrograms(
          Array.isArray(data?.programs)
            ? data.programs.slice(0, 3)
            : []
        );
      })
      .catch((error) => {
        console.error("Programs API error:", error);
        setPrograms([]);
      });


    getPosts()
      .then((data) => {
        setPosts(
          Array.isArray(data?.posts)
            ? data.posts.slice(0, 3)
            : []
        );
      })
      .catch((error) => {
        console.error("Posts API error:", error);
        setPosts([]);
      });


    getReviews()
      .then((data) => {
        setReviews(
          Array.isArray(data?.reviews)
            ? data.reviews.slice(0, 3)
            : []
        );
      })
      .catch((error) => {
        console.error("Reviews API error:", error);
        setReviews([]);
      });


    getTrainers()
      .then((data) => {
        setTrainers(
          Array.isArray(data?.trainers)
            ? data.trainers
            : []
        );
      })
      .catch((error) => {
        console.error("Trainers API error:", error);
        setTrainers([]);
      });
  }, []);


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <main className="bg-[#0B0F19] text-white overflow-hidden">


      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">

        <img
  src="/hero.jpg"
  alt="MCI Athletes"
  className="absolute inset-0 w-full h-full object-cover"
/>

        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-[#0B0F19]" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-orange-500 uppercase tracking-[0.3em] text-sm font-semibold mb-6"
          >
            Mira Road, Mumbai — Est. 2020
          </motion.p>


          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.95]"
          >
            TRAIN SMART
            <span className="text-orange-500"> • </span>
            MOVE BETTER
            <br />
            LIVE STRONG
          </motion.h1>


          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.5,
              duration: 0.8,
            }}
            className="text-gray-300 text-lg md:text-xl mt-8 leading-relaxed max-w-2xl mx-auto"
          >
            Build real strength, mobility, and endurance with professional
            calisthenics & functional fitness training.
          </motion.p>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-5 mt-10 justify-center flex-wrap"
          >

            <Link to="/contact">
              <button
                type="button"
                className="bg-orange-500 hover:bg-orange-600 transition text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-orange-500/30"
              >
                Book Free Trial
              </button>
            </Link>


            <Link to="/programs">
              <button
                type="button"
                className="border border-gray-600 hover:border-orange-500 hover:text-orange-400 transition px-10 py-4 rounded-2xl text-lg"
              >
                Explore Programs
              </button>
            </Link>

          </motion.div>

        </div>


        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">

          <div className="w-0.5 h-8 bg-white/40 rounded-full" />

          <div className="text-xs text-white/40 uppercase tracking-widest">
            Scroll
          </div>

        </div>

      </section>


      {/* =================================================
          STATS
      ================================================= */}

      <section className="py-20 px-6">

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-6 text-center">

          {[
            {
              num: "500+",
              label: "Students Trained",
            },
            {
              num: "5+",
              label: "Years Experience",
            },
            {
              num: "100%",
              label: "Natural Training",
            },
          ].map((stat, index) => (

            <motion.div
              key={stat.label}
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.15,
              }}
              viewport={{
                once: true,
              }}
            >

              <h2 className="text-5xl md:text-7xl font-black text-orange-500">
                {stat.num}
              </h2>

              <p className="text-gray-400 mt-2 text-sm uppercase tracking-wider">
                {stat.label}
              </p>

            </motion.div>

          ))}

        </div>

      </section>


      {/* =================================================
          ABOUT / WHY MCI
      ================================================= */}

      <section className="py-24 px-6 bg-[#0F172A]">

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">

          <motion.div
            initial={{
              opacity: 0,
              x: -60,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            viewport={{
              once: true,
            }}
          >

            <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-4">
              Our Story
            </p>

            <h2 className="text-5xl md:text-6xl font-black mb-8">
              WHY{" "}
              <span className="text-orange-500">
                MCI?
              </span>
            </h2>

            <p className="text-gray-400 text-lg leading-9 mb-6">
              Master Calisthenics India was born from a simple belief —
              your body is the most powerful tool you own. We combine elite
              calisthenics programming with real coaching to help beginners
              and advanced athletes transform physically and mentally.
            </p>

            <p className="text-gray-400 text-lg leading-9 mb-10">
              Located in Mira Road, Mumbai — our gym is a space where
              discipline meets community.
            </p>

            <Link to="/about">
              <button
                type="button"
                className="bg-orange-500 hover:bg-orange-600 transition text-white px-8 py-4 rounded-xl font-bold"
              >
                Learn More About Us →
              </button>
            </Link>

          </motion.div>


          <motion.div
            initial={{
              opacity: 0,
              x: 60,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            viewport={{
              once: true,
            }}
            className="grid grid-cols-2 gap-4"
          >

            {[
              {
                icon: "💪",
                title: "Strength",
                desc: "Elite upper body & core strength through structured progressions.",
              },
              {
                icon: "🧘",
                title: "Mobility",
                desc: "Flexibility & body control for life-long athletic longevity.",
              },
              {
                icon: "🏃",
                title: "Conditioning",
                desc: "Cardio, HIIT & endurance built into every session.",
              },
              {
                icon: "🤝",
                title: "Community",
                desc: "Train with motivated athletes who push each other every day.",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="bg-[#0B0F19] border border-gray-800 rounded-2xl p-6 hover:border-orange-500/40 transition"
              >

                <div className="text-3xl mb-3">
                  {item.icon}
                </div>

                <h3 className="text-lg font-bold text-orange-400 mb-2">
                  {item.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>

              </div>

            ))}

          </motion.div>

        </div>

      </section>


      {/* =================================================
          PROGRAMS
      ================================================= */}

      <section className="py-24 px-6 bg-[#0B0F19]">

        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between mb-16 flex-wrap gap-4">

            <div>

              <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-3">
                Train With Us
              </p>

              <h2 className="text-5xl md:text-7xl font-black">
                OUR PROGRAMS
              </h2>

            </div>

            <Link
              to="/programs"
              className="text-orange-400 hover:text-orange-300 transition font-medium"
            >
              View All Programs →
            </Link>

          </div>


          <div className="grid md:grid-cols-3 gap-8">

            {programs.length > 0
              ? programs.map((program, index) => {

                  const features = safeArray(program.features);
                  const pricing = safeArray(program.pricing);

                  const startingPrice =
                    pricing.length > 1
                      ? pricing[1]?.[1]
                      : pricing[0]?.[1];


                  return (

                    <motion.div
                      key={program.id ?? index}
                      initial={{
                        opacity: 0,
                        y: 40,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.1,
                      }}
                      viewport={{
                        once: true,
                      }}
                      className={`bg-[#111827] border rounded-[28px] p-8 hover:border-orange-500/60 transition-all duration-500 hover:-translate-y-1 ${
                        Boolean(program.is_featured)
                          ? "border-orange-500/40 ring-1 ring-orange-500/20"
                          : "border-gray-800"
                      }`}
                    >

                      {Boolean(program.is_featured) && (
                        <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold mb-4 inline-block">
                          ⭐ Most Popular
                        </span>
                      )}


                      <h3 className="text-2xl font-bold text-orange-400 mb-2">
                        {program.title}
                      </h3>

                      <p className="text-gray-500 text-sm mb-6">
                        {program.subtitle}
                      </p>


                      <ul className="space-y-2 mb-8">

                        {features
                          .slice(0, 4)
                          .map((feature, featureIndex) => (

                            <li
                              key={featureIndex}
                              className="flex items-center gap-2 text-gray-400 text-sm"
                            >
                              <span className="text-orange-500 text-xs">
                                ✓
                              </span>

                              {String(feature)}

                            </li>

                          ))}

                      </ul>


                      {startingPrice && (
                        <div className="border-t border-gray-700 pt-6">

                          <p className="text-xs text-gray-500 mb-1">
                            Starting from
                          </p>

                          <p className="text-2xl font-black text-white">
                            {startingPrice}
                          </p>

                        </div>
                      )}


                      <Link to="/contact">

                        <button
                          type="button"
                          className="mt-6 w-full bg-orange-500/10 hover:bg-orange-500 border border-orange-500/40 hover:border-orange-500 text-orange-400 hover:text-white transition-all font-bold py-3 rounded-xl"
                        >
                          Book Trial
                        </button>

                      </Link>

                    </motion.div>

                  );
                })

              : (
                <div className="md:col-span-3 text-center py-16">

                  <p className="text-gray-500">
                    Programs are currently loading...
                  </p>

                </div>
              )}

          </div>

        </div>

      </section>


      {/* =================================================
          TRAINERS
      ================================================= */}

      <section className="py-24 px-6 bg-[#0F172A]">

        <div className="max-w-7xl mx-auto">

          <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-3 text-center">
            Meet the Team
          </p>

          <h2 className="text-5xl md:text-6xl font-black text-center mb-16">
            OUR TRAINERS
          </h2>


          <div className="grid md:grid-cols-3 gap-10">

            {(trainers.length > 0
              ? trainers
              : FALLBACK_TRAINERS
            ).map((trainer, index) => {

              const image =
                trainer.image_url ||
                trainer.image ||
                null;

              return (

                <motion.div
                  key={trainer.id ?? trainer.name ?? index}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.06,
                  }}
                  viewport={{
                    once: true,
                  }}
                  onClick={() =>
                    setLightbox({
                      name: trainer.name,
                      role: trainer.role,
                      image,
                      bio: trainer.bio,
                    })
                  }
                  className="cursor-pointer bg-[#0B0F19] border border-gray-800 rounded-3xl overflow-hidden hover:border-orange-500/40 transition-all hover:-translate-y-1 group"
                >

                  {image ? (

                    <img
                      src={image}
                      alt={trainer.name}
                      className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                  ) : (

                    <div className="h-72 bg-gradient-to-br from-orange-500/20 to-orange-900/20 flex items-center justify-center">

                      <span className="text-8xl opacity-30">
                        👤
                      </span>

                    </div>

                  )}


                  <div className="p-7">

                    <h3 className="text-2xl font-bold text-orange-400">
                      {trainer.name}
                    </h3>

                    <p className="text-gray-400 mt-1 text-sm">
                      {trainer.role}
                    </p>

                    {trainer.bio && (
                      <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                        {trainer.bio}
                      </p>
                    )}

                  </div>

                </motion.div>

              );
            })}

          </div>

        </div>

      </section>


      {/* =================================================
          LATEST POSTS
      ================================================= */}

      {posts.length > 0 && (

        <section className="py-24 px-6 bg-[#0B0F19]">

          <div className="max-w-7xl mx-auto">

            <div className="flex items-end justify-between mb-16 flex-wrap gap-4">

              <div>

                <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-3">
                  Fresh From the Gym
                </p>

                <h2 className="text-5xl md:text-6xl font-black">
                  LATEST UPDATES
                </h2>

              </div>


              <Link
                to="/community"
                className="text-orange-400 hover:text-orange-300 transition font-medium"
              >
                View All Posts →
              </Link>

            </div>


            <div className="grid md:grid-cols-3 gap-8">

              {posts.map((post, index) => {

                const postType =
                  post.post_type || "photo";

                return (

                  <motion.article
                    key={post.id ?? index}
                    initial={{
                      opacity: 0,
                      y: 30,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.1,
                    }}
                    viewport={{
                      once: true,
                    }}
                    className="bg-[#111827] rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500/30 transition-all hover:-translate-y-1 group"
                  >

                    {post.image_url ? (

                      <img
                        src={post.image_url}
                        alt={post.title || "MCI update"}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                    ) : (

                      <div
                        className={`h-48 flex items-center justify-center text-5xl ${
                          typeColors[postType] ||
                          "bg-gray-800/40 text-gray-600"
                        }`}
                      >
                        {postType === "workout"
                          ? "💪"
                          : postType === "announcement"
                          ? "📢"
                          : postType === "video"
                          ? "🎥"
                          : "📸"}
                      </div>

                    )}


                    <div className="p-6">

                      <div className="flex items-center gap-2 mb-3">

                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            typeColors[postType] ||
                            "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {postType}
                        </span>

                        <span className="text-xs text-gray-600">
                          {formatDate(post.created_at)}
                        </span>

                      </div>


                      <h3 className="font-bold text-lg mb-2 leading-snug">
                        {post.title || "MCI Update"}
                      </h3>


                      <p className="text-gray-500 text-sm line-clamp-2">
                        {post.content || ""}
                      </p>


                      <div className="flex items-center gap-1 mt-4 text-gray-600 text-sm">
                        <span>❤️</span>
                        <span>
                          {post.likes ?? 0} likes
                        </span>
                      </div>

                    </div>

                  </motion.article>

                );
              })}

            </div>

          </div>

        </section>

      )}


      {/* =================================================
          TESTIMONIALS
      ================================================= */}

      {reviews.length > 0 && (

        <section className="py-24 px-6 bg-[#0F172A]">

          <div className="max-w-6xl mx-auto">

            <p className="text-orange-500 uppercase tracking-[0.2em] text-sm mb-3 text-center">
              Real Results
            </p>

            <h2 className="text-5xl md:text-6xl font-black text-center mb-16">
              WHAT OUR MEMBERS SAY
            </h2>


            <div className="grid md:grid-cols-3 gap-8">

              {reviews.map((review, index) => {

                const rating = safeRating(review.rating);

                const reviewText =
                  review.review_text ||
                  review.review ||
                  "Amazing training experience.";


                return (

                  <motion.div
                    key={review.id ?? index}
                    initial={{
                      opacity: 0,
                      y: 30,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.1,
                    }}
                    viewport={{
                      once: true,
                    }}
                    className="bg-[#0B0F19] border border-gray-800 rounded-3xl p-8 hover:border-orange-500/30 transition-all"
                  >

                    <div className="flex gap-1 mb-5">

                      {[...Array(rating)].map((_, starIndex) => (
                        <span
                          key={`filled-${starIndex}`}
                          className="text-orange-400"
                        >
                          ★
                        </span>
                      ))}


                      {[...Array(5 - rating)].map((_, starIndex) => (
                        <span
                          key={`empty-${starIndex}`}
                          className="text-gray-700"
                        >
                          ★
                        </span>
                      ))}

                    </div>


                    <p className="text-gray-300 leading-8 italic mb-6">
                      "{reviewText}"
                    </p>


                    <div className="border-t border-gray-800 pt-5 flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">

                        {String(
                          review.name || "?"
                        ).charAt(0).toUpperCase()}

                      </div>


                      <div>

                        <p className="font-semibold text-white">
                          {review.name || "MCI Member"}
                        </p>

                        {review.program && (
                          <p className="text-xs text-gray-500">
                            {review.program}
                          </p>
                        )}

                      </div>

                    </div>

                  </motion.div>

                );
              })}

            </div>

          </div>

        </section>

      )}


      {/* =================================================
          CTA
      ================================================= */}

      <section className="py-32 px-6 bg-[#0B0F19]">

        <div className="max-w-4xl mx-auto">

          <div className="relative rounded-3xl border border-orange-500/40 p-10 md:p-16 text-center overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-900/5" />

            <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />


            <div className="relative z-10">

              <h2 className="text-5xl md:text-6xl font-black mb-6">
                READY TO{" "}
                <span className="text-orange-500">
                  TRANSFORM?
                </span>
              </h2>


              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Join Master Calisthenics India and begin your transformation
                journey today. First trial is always free.
              </p>


              <div className="flex gap-5 justify-center flex-wrap">

                <Link to="/contact">

                  <button
                    type="button"
                    className="bg-orange-500 hover:bg-orange-600 transition text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-2xl shadow-orange-500/30"
                  >
                    Book Free Trial
                  </button>

                </Link>


                <a
                  href="https://wa.me/918433599778"
                  target="_blank"
                  rel="noreferrer"
                >

                  <button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 transition text-white font-bold px-10 py-4 rounded-2xl text-lg"
                  >
                    💬 WhatsApp Us
                  </button>

                </a>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          TRAINER LIGHTBOX
      ================================================= */}

      <AnimatePresence>

        {lightbox && (

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
              duration: 0.25,
            }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="relative max-w-lg w-full bg-[#0B0F19] border border-gray-800 rounded-3xl overflow-hidden"
            >

              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Close trainer profile"
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-orange-500 text-white flex items-center justify-center text-xl transition-colors"
              >
                ×
              </button>


              {lightbox.image ? (

                <img
                  src={lightbox.image}
                  alt={lightbox.name}
                  className="w-full max-h-[70vh] object-cover"
                />

              ) : (

                <div className="h-72 bg-gradient-to-br from-orange-500/20 to-orange-900/20 flex items-center justify-center">

                  <span className="text-9xl opacity-30">
                    👤
                  </span>

                </div>

              )}


              <div className="p-8 text-center">

                <h3 className="text-3xl font-black text-orange-400">
                  {lightbox.name}
                </h3>

                <p className="text-gray-400 mt-2">
                  {lightbox.role}
                </p>

                {lightbox.bio && (
                  <p className="text-gray-500 mt-4 leading-relaxed">
                    {lightbox.bio}
                  </p>
                )}

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </main>
  );
}