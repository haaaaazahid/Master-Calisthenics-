import { useEffect, useState } from "react";
import { getOffers } from "../api/api.js";

function formatOffer(offer) {
  const type = String(
    offer?.discount_type || "text"
  ).toLowerCase();

  const value = offer?.discount_value;

  if (type === "percentage" && value !== null && value !== undefined && value !== "") {
    return `${Number(value)}% OFF`;
  }

  if (type === "fixed" && value !== null && value !== undefined && value !== "") {
    return `₹${Number(value).toLocaleString("en-IN")} OFF`;
  }

  if (offer?.promo_code) {
    return offer.promo_code;
  }

  return "SPECIAL OFFER";
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOffers() {
      try {
        setLoading(true);
        setError("");

        const data = await getOffers();

        if (!mounted) return;

        if (!data?.success) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to load offers."
          );
        }

        setOffers(
          Array.isArray(data.offers)
            ? data.offers
            : []
        );
      } catch (err) {
        console.error("Offers load error:", err);

        if (mounted) {
          setError(
            "Unable to load current offers right now."
          );
          setOffers([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOffers();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-bg text-text pt-28 transition-colors duration-300">

      {/* HERO */}
      <section className="px-6 pt-10 pb-20">
        <div className="max-w-7xl mx-auto text-center">

          <p className="text-orange-500 uppercase tracking-[0.3em] text-sm font-bold mb-4">
            Train More. Pay Less.
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9]">
            MCI
            <span className="text-orange-500">
              {" "}OFFERS
            </span>
          </h1>

          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mt-7 leading-relaxed">
            Limited-time training offers and special membership deals
            from Master Calisthenics India.
          </p>

        </div>
      </section>

      {/* OFFERS */}
      <section className="px-6 pb-28">
        <div className="max-w-6xl mx-auto">

          {loading && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-72 rounded-3xl bg-surface border border-border animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center">
              <div className="text-4xl mb-4">
                ⚠️
              </div>

              <p className="text-red-400 font-semibold">
                {error}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            offers.length === 0 && (
              <div className="rounded-3xl border border-border bg-surface p-14 text-center">
                <div className="text-5xl mb-5">
                  🔥
                </div>

                <h2 className="text-3xl font-black mb-3">
                  No active offers right now
                </h2>

                <p className="text-text-muted">
                  Check back soon for new MCI offers.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            offers.length > 0 && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">

                {offers.map((offer) => (
                  <article
                    key={offer.id}
                    className={`relative overflow-hidden rounded-3xl border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                      Number(offer.is_featured)
                        ? "border-orange-500/60"
                        : "border-border"
                    }`}
                  >

                    {Number(offer.is_featured) === 1 && (
                      <div className="absolute top-5 right-5 z-10">
                        <span className="rounded-full bg-orange-500 text-white text-xs font-black px-3 py-1.5">
                          FEATURED
                        </span>
                      </div>
                    )}

                    <div className="p-8">

                      <p className="text-orange-500 text-xs uppercase tracking-[0.2em] font-black mb-4">
                        Limited Offer
                      </p>

                      <h2 className="text-3xl font-black leading-tight">
                        {offer.title}
                      </h2>

                      <div className="mt-7 inline-flex rounded-2xl bg-orange-500/10 border border-orange-500/20 px-5 py-3">
                        <span className="text-orange-500 text-2xl font-black">
                          {formatOffer(offer)}
                        </span>
                      </div>

                      {offer.description && (
                        <p className="text-text-muted leading-7 mt-6">
                          {offer.description}
                        </p>
                      )}

                      {offer.promo_code && (
                        <div className="mt-6 rounded-xl border border-border bg-bg px-4 py-3">
                          <p className="text-xs text-text-muted uppercase tracking-wider">
                            Promo Code
                          </p>

                          <p className="text-text font-black tracking-wider mt-1">
                            {offer.promo_code}
                          </p>
                        </div>
                      )}

                      {(offer.start_date ||
                        offer.end_date) && (
                        <p className="text-xs text-text-muted mt-5">
                          {offer.start_date
                            ? formatDate(
                                offer.start_date
                              )
                            : "Now"}
                          {" — "}
                          {offer.end_date
                            ? formatDate(
                                offer.end_date
                              )
                            : "Until further notice"}
                        </p>
                      )}

                      <a
                        href="/contact"
                        className="block mt-7 text-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 transition"
                      >
                        Claim Offer
                      </a>

                    </div>
                  </article>
                ))}

              </div>
            )}

        </div>
      </section>
    </main>
  );
}