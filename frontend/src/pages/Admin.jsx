import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { apiFetch } from "../api/api.js";
import ThemeToggle from "../components/ThemeToggle";

/* ============================================================
   AUTH STORAGE
============================================================ */

const TOKEN_KEY = "mci_token";
const ADMIN_KEY = "mci_admin";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function getAdmin() {
  try {
    return JSON.parse(
      localStorage.getItem(ADMIN_KEY) || "null"
    );
  } catch {
    return null;
  }
}

function saveAuth(data) {
  if (!data?.token) return;

  localStorage.setItem(
    TOKEN_KEY,
    data.token
  );

  localStorage.setItem(
    ADMIN_KEY,
    JSON.stringify(data.admin || null)
  );
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

/* ============================================================
   HELPERS
============================================================ */

function safeArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeBoolean(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

function formatNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString("en-IN")
    : "0";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatOfferDiscount(offer) {
  const type = String(
    offer?.discount_type || "text"
  ).toLowerCase();

  const value = offer?.discount_value;

  if (
    type === "percentage" &&
    value !== null &&
    value !== undefined &&
    value !== ""
  ) {
    return `${Number(value)}% OFF`;
  }

  if (
    type === "fixed" &&
    value !== null &&
    value !== undefined &&
    value !== ""
  ) {
    return `₹${Number(
      value
    ).toLocaleString("en-IN")} OFF`;
  }

  return "CUSTOM OFFER";
}

/* ============================================================
   THEME-FRIENDLY STYLES
============================================================ */

const inputClass =
  "w-full rounded-xl border border-border bg-bg text-text px-4 py-3 placeholder:text-text-muted/60 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10";

const textareaClass =
  "w-full min-h-32 rounded-xl border border-border bg-bg text-text px-4 py-3 placeholder:text-text-muted/60 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 resize-y";

const buttonPrimary =
  "rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 font-bold transition";

const buttonSecondary =
  "rounded-xl border border-border bg-surface hover:bg-bg text-text-muted hover:text-text px-5 py-3 font-semibold transition";

const buttonDanger =
  "rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 font-semibold transition";

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <label className="block">
      <span className="block text-sm text-text-muted font-medium mb-2">
        {label}

        {required && (
          <span className="text-orange-500 ml-1">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ value }) {
  const status = String(
    value || "pending"
  ).toLowerCase();

  const classes = {
    pending:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 border-yellow-500/20",

    confirmed:
      "bg-green-500/10 text-green-600 dark:text-green-300 border-green-500/20",

    completed:
      "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20",

    cancelled:
      "bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/20",

    approved:
      "bg-green-500/10 text-green-600 dark:text-green-300 border-green-500/20",

    rejected:
      "bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/20",

    published:
      "bg-green-500/10 text-green-600 dark:text-green-300 border-green-500/20",

    unpublished:
      "bg-gray-500/10 text-gray-600 dark:text-gray-300 border-gray-500/20",

    active:
      "bg-green-500/10 text-green-600 dark:text-green-300 border-green-500/20",

    inactive:
      "bg-gray-500/10 text-gray-600 dark:text-gray-300 border-gray-500/20",

    featured:
      "bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/20",

    read:
      "bg-gray-500/10 text-gray-600 dark:text-gray-300 border-gray-500/20",

    unread:
      "bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/20",

    manual:
      "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20",

    google:
      "bg-green-500/10 text-green-600 dark:text-green-300 border-green-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        classes[status] ||
        "bg-gray-500/10 text-text-muted border-border"
      }`}
    >
      {value || "pending"}
    </span>
  );
}

/* ============================================================
   MAIN
============================================================ */

export default function Admin() {
  /* ==========================================================
     AUTH
  ========================================================== */

  const [token, setToken] =
    useState(getToken);

  const [admin, setAdmin] =
    useState(getAdmin);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loginLoading, setLoginLoading] =
    useState(false);

  const [loginError, setLoginError] =
    useState("");

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const [activeTab, setActiveTab] =
    useState("dashboard");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  /* ==========================================================
     GLOBAL UI
  ========================================================== */

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* ==========================================================
     DATA
  ========================================================== */

  const [dashboard, setDashboard] =
    useState(null);

  const [bookings, setBookings] =
    useState([]);

  const [contacts, setContacts] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [posts, setPosts] =
    useState([]);

  const [trainers, setTrainers] =
    useState([]);

  const [gallery, setGallery] =
    useState([]);

  const [programs, setPrograms] =
    useState([]);

  const [offers, setOffers] =
    useState([]);

  /* ==========================================================
     BOOKINGS
  ========================================================== */

  const [bookingSearch, setBookingSearch] =
    useState("");

  const [bookingStatus, setBookingStatus] =
    useState("");

  const [bookingPage, setBookingPage] =
    useState(1);

  const [bookingTotal, setBookingTotal] =
    useState(0);

  const [bookingTotalPages, setBookingTotalPages] =
    useState(1);

  /* ==========================================================
     CONTACTS
  ========================================================== */

  const [contactSearch, setContactSearch] =
    useState("");

  const [contactFilter, setContactFilter] =
    useState("all");

  /* ==========================================================
     POSTS
  ========================================================== */

  const [postForm, setPostForm] =
    useState({
      title: "",
      content: "",
      author: "",
      post_type: "announcement",
      video_url: "",
      imageFile: null,
      preview: null,
    });

  /* ==========================================================
     TRAINERS
  ========================================================== */

  const [trainerForm, setTrainerForm] =
    useState({
      name: "",
      role: "",
      bio: "",
      imageFile: null,
      preview: null,
    });

  /* ==========================================================
     PROGRAMS
  ========================================================== */

  const emptyProgramForm = {
    title: "",
    subtitle: "",
    icon: "",
    color: "#f97316",
    features: "",
    pricing: "",
    is_featured: false,
    active: true,
    sort_order: 0,
  };

  const [programForm, setProgramForm] =
    useState(emptyProgramForm);

  const [editingProgramId, setEditingProgramId] =
    useState(null);

  /* ==========================================================
     OFFERS
  ========================================================== */

  const emptyOfferForm = {
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    promo_code: "",
    start_date: "",
    end_date: "",
    active: true,
    is_featured: false,
    sort_order: 0,
  };

  const [offerForm, setOfferForm] =
    useState(emptyOfferForm);

  const [editingOfferId, setEditingOfferId] =
    useState(null);

  /* ==========================================================
     GALLERY
  ========================================================== */

  const [galleryFile, setGalleryFile] =
    useState(null);

  const [selectedGalleryFolder, setSelectedGalleryFolder] =
    useState("");

  const [openGalleryFolder, setOpenGalleryFolder] =
    useState(null);

  const [newFolderName, setNewFolderName] =
    useState("");

  /* ==========================================================
     PASSWORD
  ========================================================== */

  const [passwordForm, setPasswordForm] =
    useState({
      current: "",
      newPassword: "",
      confirm: "",
    });

  /* ==========================================================
     GOOGLE LOGIN
  ========================================================== */

  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const googleInitializedRef =
    useRef(false);

  /* ==========================================================
     MESSAGES
  ========================================================== */

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const showSuccess = (message) => {
    setErrorMessage("");
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  const showError = (message) => {
    setSuccessMessage("");
    setErrorMessage(message);
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const logout = useCallback(() => {
    clearAuth();

    setToken("");
    setAdmin(null);
    setActiveTab("dashboard");

    setEmail("");
    setPassword("");
  }, []);

  /* ==========================================================
     EMAIL/PASSWORD LOGIN
  ========================================================== */

  async function handleLogin(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setLoginError(
        "Enter your email and password."
      );
      return;
    }

    try {
      setLoginLoading(true);
      setLoginError("");

      const data = await apiFetch(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      if (
        !data?.success ||
        !data?.token
      ) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Login failed."
        );
      }

      saveAuth(data);

      setToken(data.token);
      setAdmin(data.admin || null);

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setLoginError(
        error?.message ||
          "Unable to log in."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  /* ==========================================================
     GOOGLE LOGIN
  ========================================================== */

  const handleGoogleLogin =
    useCallback(
      async (googleResponse) => {
        if (!googleResponse?.credential) {
          showError(
            "Google did not provide a valid credential."
          );
          return;
        }

        try {
          setLoginLoading(true);
          clearMessages();

          const data =
            await apiFetch(
              "/auth/google",
              {
                method: "POST",
                body: JSON.stringify({
                  credential:
                    googleResponse.credential,
                }),
              }
            );

          if (
            !data?.success ||
            !data?.token
          ) {
            throw new Error(
              data?.message ||
                data?.error ||
                "Google sign-in failed."
            );
          }

          saveAuth(data);

          setToken(data.token);
          setAdmin(
            data.admin || null
          );

          showSuccess(
            "Google sign-in successful."
          );
        } catch (error) {
          console.error(
            "Google login error:",
            error
          );

          showError(
            error?.message ||
              "Google sign-in failed."
          );
        } finally {
          setLoginLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    if (token) return;

    if (!GOOGLE_CLIENT_ID) return;

    if (googleInitializedRef.current) {
      return;
    }

    function initializeGoogle() {
      if (
        !window.google?.accounts?.id
      ) {
        return;
      }

      const container =
        document.getElementById(
          "google-signin-btn"
        );

      if (!container) return;

      if (googleInitializedRef.current) {
        return;
      }

      container.innerHTML = "";

      window.google.accounts.id.initialize(
        {
          client_id:
            GOOGLE_CLIENT_ID,
          callback:
            handleGoogleLogin,
          auto_select: false,
          cancel_on_tap_outside:
            true,
        }
      );

      window.google.accounts.id.renderButton(
        container,
        {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 300,
        }
      );

      googleInitializedRef.current = true;
    }

    if (
      window.google?.accounts?.id
    ) {
      initializeGoogle();
      return;
    }

    const existingScript =
      document.getElementById(
        "mci-google-script"
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        initializeGoogle,
        { once: true }
      );

      return;
    }

    const script =
      document.createElement(
        "script"
      );

    script.id =
      "mci-google-script";

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload =
      initializeGoogle;

    document.head.appendChild(
      script
    );
  }, [
    token,
    GOOGLE_CLIENT_ID,
    handleGoogleLogin,
  ]);

  /* ==========================================================
     GENERIC REQUEST
  ========================================================== */

  async function runRequest(
    request,
    successMessage = ""
  ) {
    try {
      setLoading(true);
      clearMessages();

      const result =
        await request();

      if (successMessage) {
        showSuccess(
          successMessage
        );
      }

      return result;
    } catch (error) {
      console.error(
        "Admin request error:",
        error
      );

      if (
        error?.status === 401 ||
        error?.status === 403
      ) {
        logout();

        showError(
          "Your admin session expired. Please log in again."
        );

        return null;
      }

      showError(
        error?.message ||
          "Something went wrong."
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
     LOADERS
  ========================================================== */

  const loadDashboard =
    useCallback(async () => {
      const data =
        await apiFetch(
          "/admin/dashboard"
        );

      if (data?.success) {
        setDashboard(data);
      }

      return data;
    }, []);

  const loadPrograms =
    useCallback(async () => {
      const data =
        await apiFetch(
          "/admin/programs"
        );

      if (data?.success) {
        setPrograms(
          safeArray(data.programs)
        );
      }

      return data;
    }, []);

  const loadOffers =
    useCallback(async () => {
      const data =
        await apiFetch(
          "/admin/offers"
        );

      if (data?.success) {
        setOffers(
          safeArray(data.offers)
        );
      }

      return data;
    }, []);

  const loadBookings =
    useCallback(async () => {
      const params =
        new URLSearchParams();

      if (bookingSearch.trim()) {
        params.set(
          "search",
          bookingSearch.trim()
        );
      }

      if (bookingStatus) {
        params.set(
          "status",
          bookingStatus
        );
      }

      params.set(
        "page",
        String(bookingPage)
      );

      params.set(
        "limit",
        "20"
      );

      const query =
        params.toString();

      const data =
        await apiFetch(
          `/admin/bookings${
            query
              ? `?${query}`
              : ""
          }`
        );

      if (data?.success) {
        setBookings(
          safeArray(data.bookings)
        );

        setBookingTotal(
          Number(
            data.total || 0
          )
        );

        setBookingTotalPages(
          Number(
            data.totalPages || 1
          )
        );
      }

      return data;
    }, [
      bookingSearch,
      bookingStatus,
      bookingPage,
    ]);

  const loadContacts =
    useCallback(async () => {
      const params =
        new URLSearchParams();

      if (contactSearch.trim()) {
        params.set(
          "search",
          contactSearch.trim()
        );
      }

      if (
        contactFilter ===
        "read"
      ) {
        params.set(
          "read",
          "1"
        );
      }

      if (
        contactFilter ===
        "unread"
      ) {
        params.set(
          "read",
          "0"
        );
      }

      const query =
        params.toString();

      const data =
        await apiFetch(
          `/admin/contacts${
            query
              ? `?${query}`
              : ""
          }`
        );

      if (data?.success) {
        setContacts(
          safeArray(
            data.contacts
          )
        );
      }

      return data;
    }, [
      contactSearch,
      contactFilter,
    ]);

  const loadReviews =
    useCallback(async () => {
      const data =
        await apiFetch(
          "/admin/reviews"
        );

      if (data?.success) {
        setReviews(
          safeArray(
            data.reviews
          )
        );
      }

      return data;
    }, []);

  const loadPosts =
    useCallback(async () => {
      const data =
        await apiFetch(
          "/admin/posts"
        );

      if (data?.success) {
        setPosts(
          safeArray(
            data.posts
          )
        );
      }

      return data;
    }, []);

  const loadTrainers =
    useCallback(async () => {
      const data =
        await apiFetch(
          "/admin/trainers"
        );

      if (data?.success) {
        setTrainers(
          safeArray(
            data.trainers
          )
        );
      }

      return data;
    }, []);

  const loadGallery =
    useCallback(async () => {
      const data =
        await apiFetch(
          "/admin/gallery"
        );

      if (data?.success) {
        setGallery(
          safeArray(
            data.folders ||
              data.gallery ||
              []
          )
        );
      }

      return data;
    }, []);

  /* ==========================================================
     LOAD ACTIVE TAB
  ========================================================== */

  useEffect(() => {
    if (!token) return;

    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErrorMessage("");

        switch (activeTab) {
          case "dashboard":
            await loadDashboard();
            break;

          case "programs":
            await loadPrograms();
            break;

          case "offers":
            await loadOffers();
            break;

          case "bookings":
            await loadBookings();
            break;

          case "contacts":
            await loadContacts();
            break;

          case "reviews":
            await loadReviews();
            break;

          case "posts":
            await loadPosts();
            break;

          case "trainers":
            await loadTrainers();
            break;

          case "gallery":
            await loadGallery();
            break;

          default:
            break;
        }
      } catch (error) {
        if (!alive) return;

        console.error(
          "Admin data load error:",
          error
        );

        if (
          error?.status === 401 ||
          error?.status === 403
        ) {
          logout();
        } else {
          showError(
            error?.message ||
              "Failed to load data."
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [
    token,
    activeTab,
    loadDashboard,
    loadPrograms,
    loadOffers,
    loadBookings,
    loadContacts,
    loadReviews,
    loadPosts,
    loadTrainers,
    loadGallery,
    logout,
  ]);

  /* ==========================================================
     BOOKINGS ACTIONS
  ========================================================== */

  async function updateBookingStatus(
    id,
    status
  ) {
    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/bookings/${id}`,
            {
              method: "PATCH",
              body: JSON.stringify({
                status,
              }),
            }
          ),
        "Booking status updated."
      );

    if (result?.success) {
      setBookings((current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                }
              : item
        )
      );
    }
  }

  async function deleteBooking(
    id
  ) {
    if (
      !window.confirm(
        "Delete this booking permanently?"
      )
    ) {
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/bookings/${id}`,
            {
              method: "DELETE",
            }
          ),
        "Booking deleted."
      );

    if (result?.success) {
      setBookings((current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
      );
    }
  }

  /* ==========================================================
     CONTACT ACTIONS
  ========================================================== */

  async function markContactRead(
    id
  ) {
    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/contacts/${id}/read`,
            {
              method: "PATCH",
            }
          ),
        "Message marked as read."
      );

    if (result?.success) {
      setContacts((current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  is_read: 1,
                }
              : item
        )
      );
    }
  }

  async function deleteContact(
    id
  ) {
    if (
      !window.confirm(
        "Delete this message permanently?"
      )
    ) {
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/contacts/${id}`,
            {
              method: "DELETE",
            }
          ),
        "Contact message deleted."
      );

    if (result?.success) {
      setContacts((current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
      );
    }
  }

  /* ==========================================================
     REVIEW ACTIONS
  ========================================================== */

  async function approveReview(
    id
  ) {
    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/reviews/${id}/approve`,
            {
              method: "PATCH",
            }
          ),
        "Review approved."
      );

    if (result?.success) {
      setReviews((current) =>
        current.map(
          (review) =>
            review.id === id
              ? {
                  ...review,
                  approved: 1,
                  status:
                    "approved",
                }
              : review
        )
      );
    }
  }

  async function rejectReview(
    id
  ) {
    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/reviews/${id}/reject`,
            {
              method: "PATCH",
            }
          ),
        "Review rejected."
      );

    if (result?.success) {
      setReviews((current) =>
        current.map(
          (review) =>
            review.id === id
              ? {
                  ...review,
                  approved: 0,
                  featured: 0,
                  status:
                    "rejected",
                }
              : review
        )
      );
    }
  }

  async function featureReview(
    id
  ) {
    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/reviews/${id}/feature`,
            {
              method: "PATCH",
            }
          ),
        "Featured status updated."
      );

    if (result?.success) {
      setReviews((current) =>
        current.map(
          (review) =>
            review.id === id
              ? {
                  ...review,
                  featured:
                    result.featured,
                }
              : review
        )
      );
    }
  }

  async function deleteReview(
    id
  ) {
    if (
      !window.confirm(
        "Delete this review permanently?"
      )
    ) {
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/reviews/${id}`,
            {
              method: "DELETE",
            }
          ),
        "Review deleted."
      );

    if (result?.success) {
      setReviews((current) =>
        current.filter(
          (review) =>
            review.id !== id
        )
      );
    }
  }

  /* ==========================================================
     POSTS
  ========================================================== */

  async function createPost(
    event
  ) {
    event.preventDefault();

    if (
      !postForm.title.trim() ||
      !postForm.content.trim()
    ) {
      showError(
        "Post title and content are required."
      );
      return;
    }

    const result =
      await runRequest(
        async () => {
          const formData =
            new FormData();

          formData.append(
            "title",
            postForm.title.trim()
          );

          formData.append(
            "content",
            postForm.content.trim()
          );

          formData.append(
            "author",
            postForm.author.trim() ||
              admin?.name ||
              "MCI Admin"
          );

          formData.append(
            "post_type",
            postForm.post_type
          );

          if (
            postForm.video_url.trim()
          ) {
            formData.append(
              "video_url",
              postForm.video_url.trim()
            );
          }

          if (
            postForm.imageFile
          ) {
            formData.append(
              "image",
              postForm.imageFile
            );
          }

          return apiFetch(
            "/admin/posts",
            {
              method: "POST",
              body: formData,
            }
          );
        },
        "Post created successfully."
      );

    if (result?.success) {
      setPostForm({
        title: "",
        content: "",
        author: "",
        post_type:
          "announcement",
        video_url: "",
        imageFile: null,
        preview: null,
      });

      await loadPosts();
    }
  }

  async function togglePost(
    id
  ) {
    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/posts/${id}/toggle`,
            {
              method: "PATCH",
            }
          ),
        "Post visibility updated."
      );

    if (result?.success) {
      setPosts((current) =>
        current.map(
          (post) =>
            post.id === id
              ? {
                  ...post,
                  published:
                    !normalizeBoolean(
                      post.published
                    ),
                }
              : post
        )
      );
    }
  }

  async function deletePost(
    id
  ) {
    if (
      !window.confirm(
        "Delete this post permanently?"
      )
    ) {
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/posts/${id}`,
            {
              method: "DELETE",
            }
          ),
        "Post deleted."
      );

    if (result?.success) {
      setPosts((current) =>
        current.filter(
          (post) =>
            post.id !== id
        )
      );
    }
  }

  /* ==========================================================
     TRAINERS
  ========================================================== */

  async function createTrainer(
    event
  ) {
    event.preventDefault();

    if (
      !trainerForm.name.trim() ||
      !trainerForm.role.trim()
    ) {
      showError(
        "Trainer name and role are required."
      );
      return;
    }

    const result =
      await runRequest(
        async () => {
          const formData =
            new FormData();

          formData.append(
            "name",
            trainerForm.name.trim()
          );

          formData.append(
            "role",
            trainerForm.role.trim()
          );

          formData.append(
            "bio",
            trainerForm.bio.trim()
          );

          if (
            trainerForm.imageFile
          ) {
            formData.append(
              "image",
              trainerForm.imageFile
            );
          }

          return apiFetch(
            "/admin/trainers",
            {
              method: "POST",
              body: formData,
            }
          );
        },
        "Trainer created successfully."
      );

    if (result?.success) {
      setTrainerForm({
        name: "",
        role: "",
        bio: "",
        imageFile: null,
        preview: null,
      });

      await loadTrainers();
    }
  }

  async function deleteTrainer(
    id
  ) {
    if (
      !window.confirm(
        "Delete this trainer permanently?"
      )
    ) {
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/trainers/${id}`,
            {
              method: "DELETE",
            }
          ),
        "Trainer deleted."
      );

    if (result?.success) {
      setTrainers((current) =>
        current.filter(
          (trainer) =>
            trainer.id !== id
        )
      );
    }
  }

  /* ==========================================================
     PROGRAMS
  ========================================================== */

  function resetProgramForm() {
    setProgramForm(
      emptyProgramForm
    );

    setEditingProgramId(
      null
    );
  }

  function startEditingProgram(
    program
  ) {
    const features =
      safeArray(
        program.features
      );

    const pricing =
      safeArray(
        program.pricing
      );

    setEditingProgramId(
      program.id
    );

    setProgramForm({
      title:
        program.title || "",

      subtitle:
        program.subtitle || "",

      icon:
        program.icon || "",

      color:
        program.color ||
        "#f97316",

      features:
        features.join("\n"),

      pricing:
        pricing
          .map((pair) => {
            if (!Array.isArray(pair)) {
              return "";
            }

            return `${pair[0] || ""} | ${
              pair[1] || ""
            }`;
          })
          .filter(Boolean)
          .join("\n"),

      is_featured:
        normalizeBoolean(
          program.is_featured
        ),

      active:
        program.active ===
        undefined
          ? true
          : normalizeBoolean(
              program.active
            ),

      sort_order:
        Number(
          program.sort_order ||
            0
        ),
    });
  }

  async function saveProgram(
    event
  ) {
    event.preventDefault();

    if (
      !programForm.title.trim()
    ) {
      showError(
        "Program title is required."
      );
      return;
    }

    const features =
      programForm.features
        .split("\n")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);

    const pricing =
      programForm.pricing
        .split("\n")
        .map((line) => {
          const parts =
            line.split("|");

          return [
            (parts[0] || "")
              .trim(),

            (
              parts
                .slice(1)
                .join("|") || ""
            ).trim(),
          ];
        })
        .filter(
          ([name]) =>
            Boolean(name)
        );

    const payload = {
      title:
        programForm.title.trim(),

      subtitle:
        programForm.subtitle.trim(),

      icon:
        programForm.icon.trim(),

      color:
        programForm.color ||
        "#f97316",

      features,

      pricing,

      is_featured:
        programForm.is_featured
          ? 1
          : 0,

      active:
        programForm.active
          ? 1
          : 0,

      sort_order:
        Number(
          programForm.sort_order ||
            0
        ),
    };

    const result =
      await runRequest(
        () =>
          editingProgramId
            ? apiFetch(
                `/admin/programs/${editingProgramId}`,
                {
                  method: "PUT",
                  body: JSON.stringify(
                    payload
                  ),
                }
              )
            : apiFetch(
                "/admin/programs",
                {
                  method: "POST",
                  body: JSON.stringify(
                    payload
                  ),
                }
              ),
        editingProgramId
          ? "Program updated successfully."
          : "Program created successfully."
      );

    if (result?.success) {
      resetProgramForm();
      await loadPrograms();
    }
  }

  async function deleteProgram(
    id
  ) {
    if (
      !window.confirm(
        "Delete this program permanently?"
      )
    ) {
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/programs/${id}`,
            {
              method: "DELETE",
            }
          ),
        "Program deleted successfully."
      );

    if (result?.success) {
      setPrograms((current) =>
        current.filter(
          (program) =>
            program.id !== id
        )
      );

      if (
        editingProgramId === id
      ) {
        resetProgramForm();
      }
    }
  }

  /* ==========================================================
     OFFERS
  ========================================================== */

  function resetOfferForm() {
    setOfferForm(
      emptyOfferForm
    );

    setEditingOfferId(
      null
    );
  }

  function startEditingOffer(
    offer
  ) {
    setEditingOfferId(
      offer.id
    );

    setOfferForm({
      title:
        offer.title || "",

      description:
        offer.description ||
        "",

      discount_type:
        offer.discount_type ||
        "percentage",

      discount_value:
        offer.discount_value ??
        "",

      promo_code:
        offer.promo_code ||
        "",

      start_date:
        offer.start_date
          ? String(
              offer.start_date
            ).slice(0, 10)
          : "",

      end_date:
        offer.end_date
          ? String(
              offer.end_date
            ).slice(0, 10)
          : "",

      active:
        normalizeBoolean(
          offer.active
        ),

      is_featured:
        normalizeBoolean(
          offer.is_featured
        ),

      sort_order:
        Number(
          offer.sort_order ||
            0
        ),
    });
  }

  async function saveOffer(
    event
  ) {
    event.preventDefault();

    if (
      !offerForm.title.trim()
    ) {
      showError(
        "Offer title is required."
      );
      return;
    }

    if (
      offerForm.start_date &&
      offerForm.end_date &&
      offerForm.end_date <
        offerForm.start_date
    ) {
      showError(
        "End date cannot be before start date."
      );
      return;
    }

    if (
      offerForm.discount_type !==
        "text" &&
      offerForm.discount_value !==
        "" &&
      Number(
        offerForm.discount_value
      ) < 0
    ) {
      showError(
        "Discount value cannot be negative."
      );
      return;
    }

    const payload = {
      title:
        offerForm.title.trim(),

      description:
        offerForm.description.trim(),

      discount_type:
        offerForm.discount_type,

      discount_value:
        offerForm.discount_type ===
          "text" ||
        offerForm.discount_value ===
          ""
          ? null
          : Number(
              offerForm.discount_value
            ),

      promo_code:
        offerForm.promo_code.trim(),

      start_date:
        offerForm.start_date ||
        null,

      end_date:
        offerForm.end_date ||
        null,

      active:
        offerForm.active
          ? 1
          : 0,

      is_featured:
        offerForm.is_featured
          ? 1
          : 0,

      sort_order:
        Number(
          offerForm.sort_order ||
            0
        ),
    };

    const result =
      await runRequest(
        () =>
          editingOfferId
            ? apiFetch(
                `/admin/offers/${editingOfferId}`,
                {
                  method: "PUT",
                  body: JSON.stringify(
                    payload
                  ),
                }
              )
            : apiFetch(
                "/admin/offers",
                {
                  method: "POST",
                  body: JSON.stringify(
                    payload
                  ),
                }
              ),
        editingOfferId
          ? "Offer updated successfully."
          : "Offer created successfully."
      );

    if (result?.success) {
      resetOfferForm();
      await loadOffers();
    }
  }

  async function deleteOffer(
    id
  ) {
    if (
      !window.confirm(
        "Delete this offer permanently?"
      )
    ) {
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/offers/${id}`,
            {
              method: "DELETE",
            }
          ),
        "Offer deleted successfully."
      );

    if (result?.success) {
      setOffers((current) =>
        current.filter(
          (offer) =>
            offer.id !== id
        )
      );

      if (
        editingOfferId === id
      ) {
        resetOfferForm();
      }
    }
  }

  /* ==========================================================
     GALLERY
  ========================================================== */

  async function createGalleryFolder(
    event
  ) {
    event.preventDefault();

    if (!newFolderName.trim()) {
      showError(
        "Enter a folder name."
      );
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            "/admin/gallery/folders",
            {
              method: "POST",
              body: JSON.stringify({
                name:
                  newFolderName.trim(),
              }),
            }
          ),
        "Gallery folder created."
      );

    if (result?.success) {
      setNewFolderName("");
      await loadGallery();
    }
  }

  async function deleteGalleryFolder(
    id
  ) {
    if (
      !window.confirm(
        "Delete this folder and its photos permanently?"
      )
    ) {
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/gallery/folders/${id}`,
            {
              method: "DELETE",
            }
          ),
        "Gallery folder deleted."
      );

    if (result?.success) {
      setGallery((current) =>
        current.filter(
          (folder) =>
            folder.id !== id
        )
      );

      if (
        openGalleryFolder ===
        id
      ) {
        setOpenGalleryFolder(
          null
        );
      }
    }
  }

  async function uploadGalleryImage(
    event
  ) {
    event.preventDefault();

    if (!galleryFile) {
      showError(
        "Select an image first."
      );
      return;
    }

    const result =
      await runRequest(
        async () => {
          const formData =
            new FormData();

          formData.append(
            "image",
            galleryFile
          );

          if (
            selectedGalleryFolder
          ) {
            formData.append(
              "folder_id",
              selectedGalleryFolder
            );
          }

          return apiFetch(
            "/admin/gallery/photos",
            {
              method: "POST",
              body: formData,
            }
          );
        },
        "Gallery image uploaded."
      );

    if (result?.success) {
      setGalleryFile(null);

      await loadGallery();

      if (
        selectedGalleryFolder
      ) {
        setOpenGalleryFolder(
          Number(
            selectedGalleryFolder
          )
        );
      }
    }
  }

  async function deleteGalleryPhoto(
    id
  ) {
    if (
      !window.confirm(
        "Delete this gallery image permanently?"
      )
    ) {
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            `/admin/gallery/photos/${id}`,
            {
              method: "DELETE",
            }
          ),
        "Gallery image deleted."
      );

    if (result?.success) {
      await loadGallery();
    }
  }

  /* ==========================================================
     PASSWORD
  ========================================================== */

  async function changePassword(
    event
  ) {
    event.preventDefault();

    if (
      !passwordForm.current ||
      !passwordForm.newPassword ||
      !passwordForm.confirm
    ) {
      showError(
        "Complete all password fields."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirm
    ) {
      showError(
        "New passwords do not match."
      );
      return;
    }

    const result =
      await runRequest(
        () =>
          apiFetch(
            "/auth/change-password",
            {
              method: "POST",
              body: JSON.stringify({
                currentPassword:
                  passwordForm.current,

                newPassword:
                  passwordForm.newPassword,
              }),
            }
          ),
        "Password changed successfully."
      );

    if (result?.success) {
      setPasswordForm({
        current: "",
        newPassword: "",
        confirm: "",
      });
    }
  }

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "⌂",
    },

    {
      id: "bookings",
      label: "Trial Requests",
      icon: "▣",
    },

    {
      id: "contacts",
      label: "Contact Queries",
      icon: "✉",
    },

    {
      id: "programs",
      label: "Programs",
      icon: "◈",
    },

    {
      id: "offers",
      label: "Offers",
      icon: "🔥",
    },

    {
      id: "trainers",
      label: "Trainers",
      icon: "♙",
    },

    {
      id: "posts",
      label: "Community Posts",
      icon: "◉",
    },

    {
      id: "reviews",
      label: "Reviews",
      icon: "★",
    },

    {
      id: "gallery",
      label: "Gallery",
      icon: "▧",
    },

    {
      id: "settings",
      label: "Settings",
      icon: "⚙",
    },
  ];

  /* ==========================================================
     LOGIN
  ========================================================== */

  if (!token) {
    return (
      <main className="min-h-screen bg-bg text-text flex items-center justify-center px-5 py-10 transition-colors duration-300">

        <div className="absolute top-5 right-5">
          <ThemeToggle aria-label="Toggle light and dark theme" />
        </div>

        <div className="w-full max-w-md">

          <div className="text-center mb-8">

            <p className="text-orange-500 text-xs font-black uppercase tracking-[0.35em]">
              Master Calisthenics India
            </p>

            <h1 className="text-4xl sm:text-5xl font-black mt-3">
              Admin Portal
            </h1>

            <p className="text-text-muted mt-3">
              Secure management dashboard
            </p>

          </div>

          <div className="rounded-3xl border border-border bg-surface p-7 shadow-2xl">

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              <Field
                label="Admin Email"
                required
              >
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="admin@example.com"
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field
                label="Password"
                required
              >
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  className={
                    inputClass
                  }
                />
              </Field>

              {loginError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className={
                  buttonPrimary +
                  " w-full"
                }
              >
                {loginLoading
                  ? "Signing in..."
                  : "Sign In"}
              </button>

            </form>

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="relative my-7">
                  <div className="border-t border-border" />

                  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-surface px-3 text-xs text-text-muted">
                    OR
                  </span>
                </div>

                <div
                  id="google-signin-btn"
                  className="min-h-[44px] flex justify-center"
                />
              </>
            )}

            <p className="text-center text-xs text-text-muted mt-5 leading-relaxed">
              Only authorized administrator
              accounts should use this portal.
            </p>

          </div>

        </div>
      </main>
    );
  }

  /* ==========================================================
     DASHBOARD DATA
  ========================================================== */

  const stats =
    dashboard?.stats || {};

  const totalBookings =
    Number(
      stats.total_bookings ||
        dashboard?.bookings ||
        0
    );

  const totalPrograms =
    Number(
      stats.total_programs ??
        programs.length
    );

  const totalOffers =
    Number(
      stats.total_offers ??
        offers.length
    );

  const totalTrainers =
    Number(
      stats.total_trainers ??
        trainers.length
    );

  const totalPosts =
    Number(
      stats.total_posts ??
        posts.length
    );

  const totalReviews =
    Number(
      stats.total_reviews ??
        reviews.length
    );

  const pendingReviews =
    Number(
      stats.pending_reviews || 0
    );

  const unreadContacts =
    Number(
      stats.unread_contacts || 0
    );

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300">

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {successMessage && (
        <div className="fixed top-5 right-5 z-[300] max-w-sm rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-600 dark:text-green-300 shadow-2xl">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-5 right-5 z-[300] max-w-sm rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-300 shadow-2xl">
          {errorMessage}
        </div>
      )}

      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="lg:hidden sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur px-4 py-4 flex items-center justify-between">

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(
              true
            )
          }
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-bg transition"
          aria-label="Open admin menu"
        >
          ☰
        </button>

        <div className="text-center">

          <p className="text-orange-500 text-[10px] font-black tracking-[0.3em]">
            MCI
          </p>

          <p className="text-sm font-black">
            ADMIN
          </p>

        </div>

        <div className="flex items-center gap-2">

          <ThemeToggle aria-label="Toggle light and dark theme" />

          <button
            type="button"
            onClick={logout}
            className="text-xs text-text-muted hover:text-text transition"
          >
            Logout
          </button>

        </div>

      </header>

      {/* ======================================================
          MOBILE BACKDROP
      ====================================================== */}

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() =>
            setMobileMenuOpen(
              false
            )
          }
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-surface border-r border-border transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >

        <div className="h-full flex flex-col">

          {/* BRAND */}

          <div className="px-6 py-7 border-b border-border">

            <p className="text-orange-500 text-xs font-black uppercase tracking-[0.3em]">
              Master Calisthenics India
            </p>

            <h2 className="text-2xl font-black mt-2">
              Admin Portal
            </h2>

            <p className="text-text-muted text-xs mt-2 break-all">
              {admin?.email}
            </p>

          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">

            {navigation.map(
              (item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setActiveTab(
                      item.id
                    );

                    setMobileMenuOpen(
                      false
                    );

                    clearMessages();
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                    activeTab ===
                    item.id
                      ? "bg-orange-500 text-white"
                      : "text-text-muted hover:bg-bg hover:text-text"
                  }`}
                >

                  <span className="w-6 text-center">
                    {item.icon}
                  </span>

                  <span className="font-medium">
                    {item.label}
                  </span>

                  {item.id ===
                    "reviews" &&
                    pendingReviews >
                      0 && (
                      <span className="ml-auto text-[10px] rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 px-2 py-0.5">
                        {
                          pendingReviews
                        }
                      </span>
                    )}

                  {item.id ===
                    "contacts" &&
                    unreadContacts >
                      0 && (
                      <span className="ml-auto text-[10px] rounded-full bg-red-500/20 text-red-600 dark:text-red-300 px-2 py-0.5">
                        {
                          unreadContacts
                        }
                      </span>
                    )}

                </button>
              )
            )}

          </nav>

          {/* SIDEBAR FOOTER */}

          <div className="p-4 border-t border-border space-y-3">

            <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3">

              <div>
                <p className="text-xs text-text-muted">
                  Theme
                </p>

                <p className="text-sm font-semibold">
                  Appearance
                </p>
              </div>

              <ThemeToggle aria-label="Toggle light and dark theme" />

            </div>

            <button
              type="button"
              onClick={logout}
              className={
                buttonSecondary +
                " w-full"
              }
            >
              Sign Out
            </button>

          </div>

        </div>
      </aside>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="lg:ml-72 min-h-screen">

        {/* DESKTOP HEADER */}

        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between border-b border-border bg-surface/90 backdrop-blur px-8 py-5">

          <div>

            <p className="text-orange-500 text-xs uppercase tracking-[0.25em] font-black">
              MCI Control Center
            </p>

            <h1 className="text-2xl font-black mt-1 capitalize">
              {activeTab ===
              "bookings"
                ? "Trial Requests"
                : activeTab ===
                  "contacts"
                ? "Contact Queries"
                : activeTab ===
                  "posts"
                ? "Community Posts"
                : activeTab}
            </h1>

          </div>

          <div className="flex items-center gap-4">

            <ThemeToggle aria-label="Toggle light and dark theme" />

            <div className="text-right">

              <p className="text-sm font-bold">
                {admin?.name ||
                  "Administrator"}
              </p>

              <p className="text-xs text-text-muted">
                {admin?.role ||
                  "admin"}
              </p>

            </div>

            <div className="w-11 h-11 rounded-full bg-orange-500/15 text-orange-500 flex items-center justify-center font-black">
              {String(
                admin?.name || "A"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>

        </header>

        <main className="p-4 sm:p-6 lg:p-8">

          {/* TOP LOADING BAR */}

          {loading && (
            <div className="fixed top-0 left-0 right-0 lg:left-72 h-1 z-[250] overflow-hidden bg-border">
              <div className="w-1/3 h-full bg-orange-500 animate-pulse" />
            </div>
          )}

          {/* ==================================================
              DASHBOARD
          ================================================== */}

          {activeTab ===
            "dashboard" && (
            <section>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

                {[
                  [
                    "Trial Requests",
                    totalBookings,
                  ],

                  [
                    "Programs",
                    totalPrograms,
                  ],

                  [
                    "Offers",
                    totalOffers,
                  ],

                  [
                    "Trainers",
                    totalTrainers,
                  ],

                  [
                    "Community Posts",
                    totalPosts,
                  ],

                  [
                    "Reviews",
                    totalReviews,
                  ],
                ].map(
                  ([label, value]) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() => {
                        const tabMap = {
                          "Trial Requests":
                            "bookings",
                          Programs:
                            "programs",
                          Offers:
                            "offers",
                          Trainers:
                            "trainers",
                          "Community Posts":
                            "posts",
                          Reviews:
                            "reviews",
                        };

                        setActiveTab(
                          tabMap[label] ||
                            "dashboard"
                        );
                      }}
                      className="text-left rounded-2xl border border-border bg-surface p-6 hover:border-orange-500/40 hover:-translate-y-0.5 transition"
                    >

                      <p className="text-sm text-text-muted">
                        {label}
                      </p>

                      <p className="text-4xl font-black mt-2">
                        {formatNumber(
                          value
                        )}
                      </p>

                    </button>
                  )
                )}

              </div>

              <div className="grid xl:grid-cols-2 gap-6 mt-7">

                {/* PENDING ACTIONS */}

                <div className="rounded-2xl border border-border bg-surface p-6">

                  <p className="text-orange-500 text-xs uppercase tracking-wider font-black">
                    Attention
                  </p>

                  <h2 className="text-xl font-black mt-1 mb-5">
                    Pending Actions
                  </h2>

                  <div className="space-y-3">

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "reviews"
                        )
                      }
                      className="w-full flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3 hover:border-orange-500/40 transition"
                    >

                      <span>
                        Pending Reviews
                      </span>

                      <span className="font-black text-orange-500">
                        {
                          pendingReviews
                        }
                      </span>

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "contacts"
                        )
                      }
                      className="w-full flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3 hover:border-orange-500/40 transition"
                    >

                      <span>
                        Unread Messages
                      </span>

                      <span className="font-black text-orange-500">
                        {
                          unreadContacts
                        }
                      </span>

                    </button>

                  </div>

                </div>

                {/* ACCOUNT */}

                <div className="rounded-2xl border border-border bg-surface p-6">

                  <p className="text-orange-500 text-xs uppercase tracking-wider font-black">
                    Authentication
                  </p>

                  <h2 className="text-xl font-black mt-1">
                    {admin?.name ||
                      "Administrator"}
                  </h2>

                  <p className="text-text-muted text-sm mt-1">
                    {admin?.email}
                  </p>

                  <p className="text-orange-500 text-xs mt-4 uppercase tracking-wider">
                    {admin?.role ||
                      "administrator"}
                  </p>

                </div>

              </div>

            </section>
          )}

          {/* ==================================================
              BOOKINGS
          ================================================== */}

          {activeTab ===
            "bookings" && (
            <section>

              <div className="flex flex-col md:flex-row gap-3 mb-6">

                <input
                  value={
                    bookingSearch
                  }
                  onChange={(event) => {
                    setBookingSearch(
                      event.target.value
                    );
                    setBookingPage(
                      1
                    );
                  }}
                  placeholder="Search name, email or phone..."
                  className={
                    inputClass
                  }
                />

                <select
                  value={
                    bookingStatus
                  }
                  onChange={(event) => {
                    setBookingStatus(
                      event.target.value
                    );
                    setBookingPage(
                      1
                    );
                  }}
                  className={
                    inputClass
                  }
                >

                  <option value="">
                    All statuses
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="confirmed">
                    Confirmed
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

              <div className="rounded-2xl border border-border bg-surface overflow-hidden">

                <div className="overflow-x-auto">

                  <table className="min-w-[1050px] w-full text-sm">

                    <thead className="border-b border-border text-text-muted">

                      <tr>

                        <th className="text-left px-5 py-4">
                          Name
                        </th>

                        <th className="text-left px-5 py-4">
                          Contact
                        </th>

                        <th className="text-left px-5 py-4">
                          Program
                        </th>

                        <th className="text-left px-5 py-4">
                          Status
                        </th>

                        <th className="text-left px-5 py-4">
                          Created
                        </th>

                        <th className="text-left px-5 py-4">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-border">

                      {bookings.length ===
                      0 ? (
                        <tr>

                          <td
                            colSpan="6"
                            className="px-5 py-12 text-center text-text-muted"
                          >
                            No trial requests found.
                          </td>

                        </tr>
                      ) : (
                        bookings.map(
                          (booking) => (
                            <tr
                              key={
                                booking.id
                              }
                              className="hover:bg-bg/70 transition"
                            >

                              <td className="px-5 py-4">

                                <p className="font-semibold">
                                  {booking.name ||
                                    booking.full_name ||
                                    "—"}
                                </p>

                              </td>

                              <td className="px-5 py-4 text-text-muted">

                                <div>
                                  {
                                    booking.email
                                  }
                                </div>

                                <div>
                                  {
                                    booking.phone
                                  }
                                </div>

                              </td>

                              <td className="px-5 py-4 text-text-muted">
                                {booking.program ||
                                  booking.program_name ||
                                  "—"}
                              </td>

                              <td className="px-5 py-4">

                                <select
                                  value={
                                    booking.status ||
                                    "pending"
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateBookingStatus(
                                      booking.id,
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  className="rounded-lg border border-border bg-bg px-3 py-2 text-text"
                                >

                                  <option value="pending">
                                    Pending
                                  </option>

                                  <option value="confirmed">
                                    Confirmed
                                  </option>

                                  <option value="completed">
                                    Completed
                                  </option>

                                  <option value="cancelled">
                                    Cancelled
                                  </option>

                                </select>

                              </td>

                              <td className="px-5 py-4 text-text-muted">
                                {formatDate(
                                  booking.created_at
                                )}
                              </td>

                              <td className="px-5 py-4">

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteBooking(
                                      booking.id
                                    )
                                  }
                                  className="text-red-500 hover:text-red-400"
                                >
                                  Delete
                                </button>

                              </td>

                            </tr>
                          )
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                <div className="border-t border-border px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">

                  <p className="text-sm text-text-muted">
                    {formatNumber(
                      bookingTotal
                    )}{" "}
                    requests
                  </p>

                  <div className="flex items-center gap-3">

                    <button
                      type="button"
                      disabled={
                        bookingPage <=
                        1
                      }
                      onClick={() =>
                        setBookingPage(
                          (page) =>
                            Math.max(
                              1,
                              page -
                                1
                            )
                        )
                      }
                      className={
                        buttonSecondary
                      }
                    >
                      Previous
                    </button>

                    <span className="text-sm text-text-muted">
                      {bookingPage} /{" "}
                      {
                        bookingTotalPages
                      }
                    </span>

                    <button
                      type="button"
                      disabled={
                        bookingPage >=
                        bookingTotalPages
                      }
                      onClick={() =>
                        setBookingPage(
                          (page) =>
                            Math.min(
                              bookingTotalPages,
                              page +
                                1
                            )
                        )
                      }
                      className={
                        buttonSecondary
                      }
                    >
                      Next
                    </button>

                  </div>

                </div>

              </div>

            </section>
          )}

          {/* ==================================================
              CONTACTS
          ================================================== */}

          {activeTab ===
            "contacts" && (
            <section>

              <div className="flex flex-col md:flex-row gap-3 mb-6">

                <input
                  value={
                    contactSearch
                  }
                  onChange={(event) =>
                    setContactSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search contact queries..."
                  className={
                    inputClass
                  }
                />

                <select
                  value={
                    contactFilter
                  }
                  onChange={(event) =>
                    setContactFilter(
                      event.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                >

                  <option value="all">
                    All
                  </option>

                  <option value="unread">
                    Unread
                  </option>

                  <option value="read">
                    Read
                  </option>

                </select>

              </div>

              <div className="space-y-4">

                {contacts.length ===
                0 ? (
                  <div className="rounded-2xl border border-border bg-surface p-12 text-center text-text-muted">
                    No contact queries found.
                  </div>
                ) : (
                  contacts.map(
                    (contact) => (
                      <article
                        key={
                          contact.id
                        }
                        className="rounded-2xl border border-border bg-surface p-6"
                      >

                        <div className="flex flex-col lg:flex-row justify-between gap-4">

                          <div>

                            <h3 className="font-bold text-lg">
                              {contact.name ||
                                contact.full_name ||
                                "Unknown"}
                            </h3>

                            <p className="text-sm text-text-muted mt-1">
                              {
                                contact.email
                              }

                              {contact.phone
                                ? ` • ${contact.phone}`
                                : ""}
                            </p>

                          </div>

                          <div className="flex items-center gap-3">

                            <StatusBadge
                              value={
                                Number(
                                  contact.is_read
                                )
                                  ? "read"
                                  : "unread"
                              }
                            />

                            <button
                              type="button"
                              onClick={() =>
                                markContactRead(
                                  contact.id
                                )
                              }
                              disabled={Boolean(
                                Number(
                                  contact.is_read
                                )
                              )}
                              className={
                                buttonSecondary
                              }
                            >
                              {Number(
                                contact.is_read
                              )
                                ? "Read"
                                : "Mark Read"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteContact(
                                  contact.id
                                )
                              }
                              className="text-red-500 hover:text-red-400 text-sm"
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                        <p className="text-text-muted leading-7 mt-5 whitespace-pre-wrap">
                          {contact.message ||
                            "—"}
                        </p>

                        <p className="text-xs text-text-muted mt-4">
                          {formatDate(
                            contact.created_at
                          )}
                        </p>

                      </article>
                    )
                  )
                )}

              </div>

            </section>
          )}

          {/* ==================================================
              PROGRAMS
          ================================================== */}

          {activeTab ===
            "programs" && (
            <section className="grid xl:grid-cols-[430px_1fr] gap-6">

              {/* FORM */}

              <form
                onSubmit={
                  saveProgram
                }
                className="rounded-2xl border border-border bg-surface p-6 h-fit"
              >

                <p className="text-orange-500 text-xs uppercase tracking-widest font-black">
                  Program CMS
                </p>

                <h2 className="text-xl font-black mt-1 mb-6">
                  {editingProgramId
                    ? "Edit Program"
                    : "Create Program"}
                </h2>

                <div className="space-y-4">

                  <Field
                    label="Title"
                    required
                  >
                    <input
                      value={
                        programForm.title
                      }
                      onChange={(event) =>
                        setProgramForm(
                          (form) => ({
                            ...form,
                            title:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="Group Batch Training"
                    />
                  </Field>

                  <Field label="Subtitle">
                    <input
                      value={
                        programForm.subtitle
                      }
                      onChange={(event) =>
                        setProgramForm(
                          (form) => ({
                            ...form,
                            subtitle:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="Calisthenics + functional fitness"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">

                    <Field label="Icon">
                      <input
                        value={
                          programForm.icon
                        }
                        onChange={(event) =>
                          setProgramForm(
                            (form) => ({
                              ...form,
                              icon:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        placeholder="💪"
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <Field label="Accent Color">
                      <input
                        type="color"
                        value={
                          programForm.color
                        }
                        onChange={(event) =>
                          setProgramForm(
                            (form) => ({
                              ...form,
                              color:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        className="w-full h-[48px] rounded-xl border border-border bg-bg p-1"
                      />
                    </Field>

                  </div>

                  <Field label="Features — one per line">
                    <textarea
                      value={
                        programForm.features
                      }
                      onChange={(event) =>
                        setProgramForm(
                          (form) => ({
                            ...form,
                            features:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        textareaClass
                      }
                      placeholder={
                        "Calisthenics & functional fitness\nSkill learning\nMobility & flexibility"
                      }
                    />
                  </Field>

                  <Field label="Pricing — Name | Price">
                    <textarea
                      value={
                        programForm.pricing
                      }
                      onChange={(event) =>
                        setProgramForm(
                          (form) => ({
                            ...form,
                            pricing:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        textareaClass
                      }
                      placeholder={
                        "1 Month | ₹4,000\n3 Months | ₹10,999\n6 Months | ₹18,999"
                      }
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">

                    <Field label="Sort Order">
                      <input
                        type="number"
                        value={
                          programForm.sort_order
                        }
                        onChange={(event) =>
                          setProgramForm(
                            (form) => ({
                              ...form,
                              sort_order:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <label className="flex items-center gap-3 text-sm text-text-muted pt-8">

                      <input
                        type="checkbox"
                        checked={
                          programForm.active
                        }
                        onChange={(event) =>
                          setProgramForm(
                            (form) => ({
                              ...form,
                              active:
                                event
                                  .target
                                  .checked,
                            })
                          )
                        }
                        className="accent-orange-500"
                      />

                      Active

                    </label>

                  </div>

                  <label className="flex items-center gap-3 text-sm text-text-muted">

                    <input
                      type="checkbox"
                      checked={
                        programForm.is_featured
                      }
                      onChange={(event) =>
                        setProgramForm(
                          (form) => ({
                            ...form,
                            is_featured:
                              event
                                .target
                                .checked,
                          })
                        )
                      }
                      className="accent-orange-500"
                    />

                    Featured / Most Popular

                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className={
                      buttonPrimary +
                      " w-full"
                    }
                  >
                    {editingProgramId
                      ? "Update Program"
                      : "Create Program"}
                  </button>

                  {editingProgramId && (
                    <button
                      type="button"
                      onClick={
                        resetProgramForm
                      }
                      className={
                        buttonSecondary +
                        " w-full"
                      }
                    >
                      Cancel Editing
                    </button>
                  )}

                </div>

              </form>

              {/* LIST */}

              <div className="space-y-4">

                {programs.length ===
                0 ? (
                  <div className="rounded-2xl border border-border bg-surface p-12 text-center">

                    <div className="text-4xl mb-4">
                      ◈
                    </div>

                    <p className="text-text-muted">
                      No programs found.
                    </p>

                  </div>
                ) : (
                  programs.map(
                    (program) => (
                      <article
                        key={
                          program.id
                        }
                        className="rounded-2xl border border-border bg-surface p-6"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <StatusBadge
                                value={
                                  normalizeBoolean(
                                    program.active
                                  )
                                    ? "active"
                                    : "inactive"
                                }
                              />

                              {normalizeBoolean(
                                program.is_featured
                              ) && (
                                <StatusBadge value="featured" />
                              )}

                            </div>

                            <div className="flex items-start gap-3 mt-3">

                              {program.icon && (
                                <span className="text-3xl">
                                  {
                                    program.icon
                                  }
                                </span>
                              )}

                              <div>

                                <h3 className="text-2xl font-black">
                                  {
                                    program.title
                                  }
                                </h3>

                                <p className="text-text-muted mt-1">
                                  {
                                    program.subtitle
                                  }
                                </p>

                              </div>

                            </div>

                          </div>

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                startEditingProgram(
                                  program
                                )
                              }
                              className={
                                buttonSecondary
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteProgram(
                                  program.id
                                )
                              }
                              className={
                                buttonDanger
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                        <div className="mt-6">

                          <p className="text-xs uppercase tracking-wider text-text-muted mb-2">
                            Features
                          </p>

                          <ul className="space-y-1 text-sm text-text-muted">

                            {safeArray(
                              program.features
                            )
                              .slice(
                                0,
                                10
                              )
                              .map(
                                (
                                  feature,
                                  index
                                ) => (
                                  <li
                                    key={
                                      index
                                    }
                                  >
                                    <span className="text-orange-500 mr-2">
                                      ✓
                                    </span>

                                    {String(
                                      feature
                                    )}

                                  </li>
                                )
                              )}

                          </ul>

                        </div>

                        <div className="mt-6">

                          <p className="text-xs uppercase tracking-wider text-text-muted mb-2">
                            Pricing
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {safeArray(
                              program.pricing
                            ).map(
                              (
                                pair,
                                index
                              ) =>
                                Array.isArray(
                                  pair
                                ) && (
                                  <span
                                    key={
                                      index
                                    }
                                    className="rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-muted"
                                  >
                                    {
                                      pair[0]
                                    }{" "}
                                    —{" "}
                                    <strong className="text-text">
                                      {
                                        pair[1]
                                      }
                                    </strong>
                                  </span>
                                )
                            )}

                          </div>

                        </div>

                      </article>
                    )
                  )
                )}

              </div>

            </section>
          )}

          {/* ==================================================
              OFFERS
          ================================================== */}

          {activeTab ===
            "offers" && (
            <section className="grid xl:grid-cols-[430px_1fr] gap-6">

              {/* OFFER FORM */}

              <form
                onSubmit={
                  saveOffer
                }
                className="rounded-2xl border border-border bg-surface p-6 h-fit"
              >

                <p className="text-orange-500 text-xs uppercase tracking-widest font-black">
                  Offers CMS
                </p>

                <h2 className="text-xl font-black mt-1 mb-6">
                  {editingOfferId
                    ? "Edit Offer"
                    : "Create Offer"}
                </h2>

                <div className="space-y-4">

                  <Field
                    label="Offer Title"
                    required
                  >
                    <input
                      value={
                        offerForm.title
                      }
                      onChange={(event) =>
                        setOfferForm(
                          (form) => ({
                            ...form,
                            title:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="Summer Strength Offer"
                    />
                  </Field>

                  <Field label="Description">
                    <textarea
                      value={
                        offerForm.description
                      }
                      onChange={(event) =>
                        setOfferForm(
                          (form) => ({
                            ...form,
                            description:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        textareaClass
                      }
                      placeholder="Limited-time offer for new members..."
                    />
                  </Field>

                  <Field label="Discount Type">

                    <select
                      value={
                        offerForm.discount_type
                      }
                      onChange={(event) =>
                        setOfferForm(
                          (form) => ({
                            ...form,
                            discount_type:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    >

                      <option value="percentage">
                        Percentage
                      </option>

                      <option value="fixed">
                        Fixed Amount
                      </option>

                      <option value="text">
                        Custom Text
                      </option>

                    </select>

                  </Field>

                  {offerForm.discount_type !==
                    "text" && (
                    <Field label="Discount Value">

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          offerForm.discount_value
                        }
                        onChange={(event) =>
                          setOfferForm(
                            (form) => ({
                              ...form,
                              discount_value:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        placeholder={
                          offerForm.discount_type ===
                          "percentage"
                            ? "20"
                            : "500"
                        }
                        className={
                          inputClass
                        }
                      />

                    </Field>
                  )}

                  <Field label="Promo Code">

                    <input
                      value={
                        offerForm.promo_code
                      }
                      onChange={(event) =>
                        setOfferForm(
                          (form) => ({
                            ...form,
                            promo_code:
                              event
                                .target
                                .value
                                .toUpperCase(),
                          })
                        )
                      }
                      placeholder="MCI20"
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <div className="grid grid-cols-2 gap-3">

                    <Field label="Start Date">
                      <input
                        type="date"
                        value={
                          offerForm.start_date
                        }
                        onChange={(event) =>
                          setOfferForm(
                            (form) => ({
                              ...form,
                              start_date:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <Field label="End Date">
                      <input
                        type="date"
                        value={
                          offerForm.end_date
                        }
                        onChange={(event) =>
                          setOfferForm(
                            (form) => ({
                              ...form,
                              end_date:
                                event
                                  .target
                                  .value,
                            })
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>

                  </div>

                  <Field label="Sort Order">

                    <input
                      type="number"
                      value={
                        offerForm.sort_order
                      }
                      onChange={(event) =>
                        setOfferForm(
                          (form) => ({
                            ...form,
                            sort_order:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <label className="flex items-center gap-3 text-sm text-text-muted">

                    <input
                      type="checkbox"
                      checked={
                        offerForm.active
                      }
                      onChange={(event) =>
                        setOfferForm(
                          (form) => ({
                            ...form,
                            active:
                              event.target
                                .checked,
                          })
                        )
                      }
                      className="accent-orange-500"
                    />

                    Active / Visible

                  </label>

                  <label className="flex items-center gap-3 text-sm text-text-muted">

                    <input
                      type="checkbox"
                      checked={
                        offerForm.is_featured
                      }
                      onChange={(event) =>
                        setOfferForm(
                          (form) => ({
                            ...form,
                            is_featured:
                              event.target
                                .checked,
                          })
                        )
                      }
                      className="accent-orange-500"
                    />

                    Featured Offer

                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className={
                      buttonPrimary +
                      " w-full"
                    }
                  >
                    {editingOfferId
                      ? "Update Offer"
                      : "Create Offer"}
                  </button>

                  {editingOfferId && (
                    <button
                      type="button"
                      onClick={
                        resetOfferForm
                      }
                      className={
                        buttonSecondary +
                        " w-full"
                      }
                    >
                      Cancel Editing
                    </button>
                  )}

                </div>

              </form>

              {/* OFFERS LIST */}

              <div className="space-y-4">

                {offers.length ===
                0 ? (
                  <div className="rounded-2xl border border-border bg-surface p-12 text-center">

                    <div className="text-5xl mb-4">
                      🔥
                    </div>

                    <h3 className="font-black text-xl">
                      No offers yet
                    </h3>

                    <p className="text-text-muted mt-2">
                      Create your first offer using the form.
                    </p>

                  </div>
                ) : (
                  offers.map(
                    (offer) => (
                      <article
                        key={
                          offer.id
                        }
                        className="rounded-2xl border border-border bg-surface p-6"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <StatusBadge
                                value={
                                  normalizeBoolean(
                                    offer.active
                                  )
                                    ? "active"
                                    : "inactive"
                                }
                              />

                              {normalizeBoolean(
                                offer.is_featured
                              ) && (
                                <StatusBadge value="featured" />
                              )}

                            </div>

                            <h3 className="text-2xl font-black mt-3">
                              {
                                offer.title
                              }
                            </h3>

                            {offer.description && (
                              <p className="text-text-muted mt-2 leading-relaxed">
                                {
                                  offer.description
                                }
                              </p>
                            )}

                          </div>

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                startEditingOffer(
                                  offer
                                )
                              }
                              className={
                                buttonSecondary
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteOffer(
                                  offer.id
                                )
                              }
                              className={
                                buttonDanger
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                        <div className="mt-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 p-5">

                          <p className="text-orange-500 text-xs uppercase tracking-wider">
                            Discount
                          </p>

                          <p className="text-3xl font-black mt-1">
                            {formatOfferDiscount(
                              offer
                            )}
                          </p>

                          {offer.promo_code && (
                            <p className="text-sm text-text-muted mt-3">
                              Code:{" "}
                              <strong className="text-text tracking-wider">
                                {
                                  offer.promo_code
                                }
                              </strong>
                            </p>
                          )}

                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-text-muted">

                          {offer.start_date && (
                            <span>
                              Start:{" "}
                              {formatDateOnly(
                                offer.start_date
                              )}
                            </span>
                          )}

                          {offer.end_date && (
                            <span>
                              End:{" "}
                              {formatDateOnly(
                                offer.end_date
                              )}
                            </span>
                          )}

                          <span>
                            Order:{" "}
                            {
                              offer.sort_order ??
                              0
                            }
                          </span>

                        </div>

                      </article>
                    )
                  )
                )}

              </div>

            </section>
          )}

          {/* ==================================================
              POSTS
          ================================================== */}

          {activeTab ===
            "posts" && (
            <section className="grid xl:grid-cols-[420px_1fr] gap-6">

              <form
                onSubmit={
                  createPost
                }
                className="rounded-2xl border border-border bg-surface p-6 h-fit"
              >

                <p className="text-orange-500 text-xs uppercase tracking-widest font-black">
                  Community
                </p>

                <h2 className="text-xl font-black mt-1 mb-6">
                  Create Post
                </h2>

                <div className="space-y-4">

                  <Field
                    label="Title"
                    required
                  >
                    <input
                      value={
                        postForm.title
                      }
                      onChange={(event) =>
                        setPostForm(
                          (form) => ({
                            ...form,
                            title:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Author">
                    <input
                      value={
                        postForm.author
                      }
                      onChange={(event) =>
                        setPostForm(
                          (form) => ({
                            ...form,
                            author:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Type">

                    <select
                      value={
                        postForm.post_type
                      }
                      onChange={(event) =>
                        setPostForm(
                          (form) => ({
                            ...form,
                            post_type:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    >

                      <option value="announcement">
                        Announcement
                      </option>

                      <option value="workout">
                        Workout
                      </option>

                      <option value="photo">
                        Photo
                      </option>

                      <option value="video">
                        Video
                      </option>

                    </select>

                  </Field>

                  <Field
                    label="Content"
                    required
                  >
                    <textarea
                      value={
                        postForm.content
                      }
                      onChange={(event) =>
                        setPostForm(
                          (form) => ({
                            ...form,
                            content:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        textareaClass
                      }
                    />
                  </Field>

                  <Field label="Video URL">
                    <input
                      value={
                        postForm.video_url
                      }
                      onChange={(event) =>
                        setPostForm(
                          (form) => ({
                            ...form,
                            video_url:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Image">

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {

                        const file =
                          event.target.files?.[0] ||
                          null;

                        setPostForm(
                          (form) => ({
                            ...form,
                            imageFile:
                              file,
                            preview:
                              file
                                ? URL.createObjectURL(
                                    file
                                  )
                                : null,
                          })
                        );

                      }}
                      className="w-full text-sm text-text-muted"
                    />

                  </Field>

                  {postForm.preview && (
                    <img
                      src={
                        postForm.preview
                      }
                      alt="Post preview"
                      className="w-full h-44 object-cover rounded-xl border border-border"
                    />
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={
                      buttonPrimary +
                      " w-full"
                    }
                  >
                    Create Post
                  </button>

                </div>

              </form>

              <div className="space-y-4">

                {posts.length ===
                0 ? (
                  <div className="rounded-2xl border border-border bg-surface p-12 text-center text-text-muted">
                    No posts found.
                  </div>
                ) : (
                  posts.map(
                    (post) => (
                      <article
                        key={
                          post.id
                        }
                        className="rounded-2xl border border-border bg-surface p-6"
                      >

                        {post.image_url && (
                          <img
                            src={
                              post.image_url
                            }
                            alt={
                              post.title
                            }
                            className="w-full h-52 object-cover rounded-xl mb-5 border border-border"
                          />
                        )}

                        <div className="flex justify-between gap-4">

                          <div>

                            <div className="flex flex-wrap gap-2">

                              <StatusBadge
                                value={
                                  post.post_type ||
                                  "post"
                                }
                              />

                              <StatusBadge
                                value={
                                  normalizeBoolean(
                                    post.published
                                  )
                                    ? "published"
                                    : "unpublished"
                                }
                              />

                            </div>

                            <h3 className="font-black text-xl mt-3">
                              {
                                post.title
                              }
                            </h3>

                            <p className="text-text-muted text-sm mt-1">
                              {
                                post.author
                              }
                            </p>

                          </div>

                          <div className="flex flex-col items-end gap-3">

                            <button
                              type="button"
                              onClick={() =>
                                togglePost(
                                  post.id
                                )
                              }
                              className="text-orange-500 hover:text-orange-400 text-sm"
                            >
                              {normalizeBoolean(
                                post.published
                              )
                                ? "Unpublish"
                                : "Publish"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deletePost(
                                  post.id
                                )
                              }
                              className="text-red-500 hover:text-red-400 text-sm"
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                        <p className="text-text-muted mt-5 leading-7">
                          {
                            post.content
                          }
                        </p>

                        <p className="text-xs text-text-muted mt-4">
                          {formatDate(
                            post.created_at
                          )}
                        </p>

                      </article>
                    )
                  )
                )}

              </div>

            </section>
          )}

          {/* ==================================================
              TRAINERS
          ================================================== */}

          {activeTab ===
            "trainers" && (
            <section className="grid xl:grid-cols-[400px_1fr] gap-6">

              <form
                onSubmit={
                  createTrainer
                }
                className="rounded-2xl border border-border bg-surface p-6 h-fit"
              >

                <p className="text-orange-500 text-xs uppercase tracking-widest font-black">
                  Team
                </p>

                <h2 className="text-xl font-black mt-1 mb-6">
                  Add Trainer
                </h2>

                <div className="space-y-4">

                  <Field
                    label="Name"
                    required
                  >
                    <input
                      value={
                        trainerForm.name
                      }
                      onChange={(event) =>
                        setTrainerForm(
                          (form) => ({
                            ...form,
                            name:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field
                    label="Role"
                    required
                  >
                    <input
                      value={
                        trainerForm.role
                      }
                      onChange={(event) =>
                        setTrainerForm(
                          (form) => ({
                            ...form,
                            role:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </Field>

                  <Field label="Bio">

                    <textarea
                      value={
                        trainerForm.bio
                      }
                      onChange={(event) =>
                        setTrainerForm(
                          (form) => ({
                            ...form,
                            bio:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        textareaClass
                      }
                    />

                  </Field>

                  <Field label="Image">

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {

                        const file =
                          event.target.files?.[0] ||
                          null;

                        setTrainerForm(
                          (form) => ({
                            ...form,
                            imageFile:
                              file,
                            preview:
                              file
                                ? URL.createObjectURL(
                                    file
                                  )
                                : null,
                          })
                        );

                      }}
                      className="w-full text-sm text-text-muted"
                    />

                  </Field>

                  {trainerForm.preview && (
                    <img
                      src={
                        trainerForm.preview
                      }
                      alt="Trainer preview"
                      className="w-full h-52 object-cover rounded-xl border border-border"
                    />
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={
                      buttonPrimary +
                      " w-full"
                    }
                  >
                    Add Trainer
                  </button>

                </div>

              </form>

              <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-5">

                {trainers.length ===
                0 ? (
                  <div className="sm:col-span-2 2xl:col-span-3 rounded-2xl border border-border bg-surface p-12 text-center text-text-muted">
                    No trainers found.
                  </div>
                ) : (
                  trainers.map(
                    (trainer) => (
                      <article
                        key={
                          trainer.id
                        }
                        className="overflow-hidden rounded-2xl border border-border bg-surface"
                      >

                        {trainer.image_url ||
                        trainer.image ? (
                          <img
                            src={
                              trainer.image_url ||
                              trainer.image
                            }
                            alt={
                              trainer.name
                            }
                            className="w-full h-64 object-cover"
                          />
                        ) : (
                          <div className="w-full h-64 flex items-center justify-center bg-orange-500/10 text-7xl opacity-60">
                            👤
                          </div>
                        )}

                        <div className="p-5">

                          <h3 className="text-xl font-black">
                            {
                              trainer.name
                            }
                          </h3>

                          <p className="text-orange-500 text-sm mt-1">
                            {
                              trainer.role
                            }
                          </p>

                          {trainer.bio && (
                            <p className="text-text-muted text-sm leading-6 mt-3">
                              {
                                trainer.bio
                              }
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              deleteTrainer(
                                trainer.id
                              )
                            }
                            className="text-red-500 text-sm mt-5 hover:text-red-400"
                          >
                            Delete Trainer
                          </button>

                        </div>

                      </article>
                    )
                  )
                )}

              </div>

            </section>
          )}

          {/* ==================================================
              REVIEWS
          ================================================== */}

          {activeTab ===
            "reviews" && (
            <section className="space-y-4">

              {reviews.length ===
              0 ? (
                <div className="rounded-2xl border border-border bg-surface p-12 text-center text-text-muted">
                  No reviews found.
                </div>
              ) : (
                reviews.map(
                  (review) => {

                    const rating =
                      Math.max(
                        0,
                        Math.min(
                          5,
                          Number(
                            review.rating
                          ) || 0
                        )
                      );

                    const approved =
                      review.status ===
                        "approved" ||
                      normalizeBoolean(
                        review.approved
                      );

                    const rejected =
                      review.status ===
                      "rejected";

                    return (
                      <article
                        key={
                          review.id
                        }
                        className="rounded-2xl border border-border bg-surface p-6"
                      >

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                          <div className="flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-black text-lg">
                                {
                                  review.name ||
                                  "MCI Member"
                                }
                              </h3>

                              <StatusBadge
                                value={
                                  review.source ||
                                  "manual"
                                }
                              />

                              <StatusBadge
                                value={
                                  approved
                                    ? "approved"
                                    : rejected
                                    ? "rejected"
                                    : "pending"
                                }
                              />

                              {normalizeBoolean(
                                review.featured
                              ) && (
                                <StatusBadge value="featured" />
                              )}

                            </div>

                            <div className="text-orange-500 mt-2 text-lg tracking-wider">

                              {"★".repeat(
                                rating
                              )}

                              <span className="text-text-muted/30">
                                {"★".repeat(
                                  5 -
                                    rating
                                )}
                              </span>

                            </div>

                            {review.program && (
                              <p className="text-text-muted text-xs mt-2">
                                {
                                  review.program
                                }
                              </p>
                            )}

                            <p className="text-text-muted italic mt-5 leading-7">
                              “
                              {review.review_text ||
                                review.review ||
                                ""}
                              ”
                            </p>

                            {review.google_review_id && (
                              <p className="text-xs text-text-muted mt-4 break-all">
                                Google Review ID:{" "}
                                {
                                  review.google_review_id
                                }
                              </p>
                            )}

                          </div>

                          <div className="flex flex-wrap lg:flex-col gap-2">

                            {!approved && (
                              <button
                                type="button"
                                onClick={() =>
                                  approveReview(
                                    review.id
                                  )
                                }
                                className="rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-300 px-4 py-2 text-sm font-semibold hover:bg-green-500/20 transition"
                              >
                                Approve
                              </button>
                            )}

                            {!rejected && (
                              <button
                                type="button"
                                onClick={() =>
                                  rejectReview(
                                    review.id
                                  )
                                }
                                className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-300 px-4 py-2 text-sm font-semibold hover:bg-yellow-500/20 transition"
                              >
                                Reject
                              </button>
                            )}

                            {approved && (
                              <button
                                type="button"
                                onClick={() =>
                                  featureReview(
                                    review.id
                                  )
                                }
                                className="rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-300 px-4 py-2 text-sm font-semibold hover:bg-orange-500/20 transition"
                              >
                                {normalizeBoolean(
                                  review.featured
                                )
                                  ? "Unfeature"
                                  : "Feature"}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                deleteReview(
                                  review.id
                                )
                              }
                              className={
                                buttonDanger
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                        <p className="text-xs text-text-muted mt-5">
                          Submitted:{" "}
                          {formatDate(
                            review.created_at
                          )}
                        </p>

                      </article>
                    );
                  }
                )
              )}

            </section>
          )}

          {/* ==================================================
              GALLERY
          ================================================== */}

          {activeTab ===
            "gallery" && (
            <section>

              {/* UPLOAD + CREATE FOLDER */}

              <div className="grid xl:grid-cols-2 gap-6 mb-8">

                <form
                  onSubmit={
                    uploadGalleryImage
                  }
                  className="rounded-2xl border border-border bg-surface p-6"
                >

                  <p className="text-orange-500 text-xs uppercase tracking-widest font-black">
                    Gallery
                  </p>

                  <h2 className="text-xl font-black mt-1 mb-6">
                    Upload Image
                  </h2>

                  <div className="space-y-4">

                    <Field label="Image">

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setGalleryFile(
                            event.target.files?.[0] ||
                              null
                          )
                        }
                        className="w-full text-sm text-text-muted"
                      />

                    </Field>

                    <Field label="Folder">

                      <select
                        value={
                          selectedGalleryFolder
                        }
                        onChange={(event) =>
                          setSelectedGalleryFolder(
                            event.target.value
                          )
                        }
                        className={
                          inputClass
                        }
                      >

                        <option value="">
                          Default / No Folder
                        </option>

                        {gallery.map(
                          (folder) => (
                            <option
                              key={
                                folder.id
                              }
                              value={
                                folder.id
                              }
                            >
                              {
                                folder.name
                              }
                            </option>
                          )
                        )}

                      </select>

                    </Field>

                    <button
                      type="submit"
                      disabled={
                        loading
                      }
                      className={
                        buttonPrimary +
                        " w-full"
                      }
                    >
                      Upload Image
                    </button>

                  </div>

                </form>

                <form
                  onSubmit={
                    createGalleryFolder
                  }
                  className="rounded-2xl border border-border bg-surface p-6 h-fit"
                >

                  <p className="text-orange-500 text-xs uppercase tracking-widest font-black">
                    Folder Management
                  </p>

                  <h2 className="text-xl font-black mt-1 mb-6">
                    Create Gallery Folder
                  </h2>

                  <div className="space-y-4">

                    <Field
                      label="Folder Name"
                      required
                    >
                      <input
                        value={
                          newFolderName
                        }
                        onChange={(event) =>
                          setNewFolderName(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Events"
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <button
                      type="submit"
                      disabled={
                        loading
                      }
                      className={
                        buttonPrimary +
                        " w-full"
                      }
                    >
                      Create Folder
                    </button>

                  </div>

                </form>

              </div>

              {/* FOLDER LIST */}

              <div className="space-y-5">

                {gallery.length ===
                0 ? (
                  <div className="rounded-2xl border border-border bg-surface p-12 text-center text-text-muted">
                    No gallery folders found.
                  </div>
                ) : (
                  gallery.map(
                    (folder) => {

                      const photos =
                        safeArray(
                          folder.photos
                        );

                      const open =
                        Number(
                          openGalleryFolder
                        ) ===
                        Number(
                          folder.id
                        );

                      return (
                        <div
                          key={
                            folder.id
                          }
                          className="rounded-2xl border border-border bg-surface overflow-hidden"
                        >

                          {/* CLICKABLE FOLDER */}

                          <button
                            type="button"
                            onClick={() =>
                              setOpenGalleryFolder(
                                open
                                  ? null
                                  : folder.id
                              )
                            }
                            className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-bg transition"
                          >

                            <div>

                              <div className="flex items-center gap-3">

                                <span className="text-2xl">
                                  📁
                                </span>

                                <div>

                                  <h3 className="text-xl font-black">
                                    {
                                      folder.name ||
                                      folder.title ||
                                      `Folder ${folder.id}`
                                    }
                                  </h3>

                                  <p className="text-sm text-text-muted mt-1">
                                    {
                                      photos.length
                                    }{" "}
                                    {photos.length ===
                                    1
                                      ? "photo"
                                      : "photos"}
                                  </p>

                                </div>

                              </div>

                            </div>

                            <div className="flex items-center gap-3">

                              <span className="text-text-muted text-2xl">
                                {open
                                  ? "⌃"
                                  : "⌄"}
                              </span>

                            </div>

                          </button>

                          {/* OPEN FOLDER */}

                          {open && (
                            <div className="border-t border-border p-6">

                              <div className="flex items-center justify-between mb-5">

                                <div>

                                  <p className="text-xs uppercase tracking-wider text-orange-500 font-black">
                                    Open Folder
                                  </p>

                                  <h4 className="text-lg font-black mt-1">
                                    {
                                      folder.name
                                    }
                                  </h4>

                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteGalleryFolder(
                                      folder.id
                                    )
                                  }
                                  className="text-red-500 hover:text-red-400 text-sm"
                                >
                                  Delete Folder
                                </button>

                              </div>

                              {photos.length ===
                              0 ? (
                                <div className="rounded-xl border border-dashed border-border py-12 text-center text-text-muted">
                                  This folder has no photos yet.
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">

                                  {photos.map(
                                    (photo) => (
                                      <div
                                        key={
                                          photo.id
                                        }
                                        className="group rounded-2xl overflow-hidden border border-border bg-bg"
                                      >

                                        <div className="relative">

                                          <img
                                            src={
                                              photo.image_url
                                            }
                                            alt={
                                              photo.caption ||
                                              folder.name ||
                                              "MCI Gallery"
                                            }
                                            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                          />

                                          <button
                                            type="button"
                                            onClick={() =>
                                              deleteGalleryPhoto(
                                                photo.id
                                              )
                                            }
                                            className="absolute top-2 right-2 rounded-lg bg-black/70 text-white text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition"
                                          >
                                            Delete
                                          </button>

                                        </div>

                                        {photo.caption && (
                                          <p className="p-3 text-xs text-text-muted">
                                            {
                                              photo.caption
                                            }
                                          </p>
                                        )}

                                      </div>
                                    )
                                  )}

                                </div>
                              )}

                            </div>
                          )}

                        </div>
                      );
                    }
                  )
                )}

              </div>

            </section>
          )}

          {/* ==================================================
              SETTINGS
          ================================================== */}

          {activeTab ===
            "settings" && (
            <section className="max-w-xl">

              <div className="rounded-2xl border border-border bg-surface p-6">

                <p className="text-orange-500 text-xs uppercase tracking-widest font-black">
                  Security
                </p>

                <h2 className="text-xl font-black mt-1 mb-6">
                  Change Admin Password
                </h2>

                <form
                  onSubmit={
                    changePassword
                  }
                  className="space-y-4"
                >

                  <Field label="Current Password">

                    <input
                      type="password"
                      value={
                        passwordForm.current
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (form) => ({
                            ...form,
                            current:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="New Password">

                    <input
                      type="password"
                      value={
                        passwordForm.newPassword
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (form) => ({
                            ...form,
                            newPassword:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <Field label="Confirm New Password">

                    <input
                      type="password"
                      value={
                        passwordForm.confirm
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (form) => ({
                            ...form,
                            confirm:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className={
                        inputClass
                      }
                    />

                  </Field>

                  <button
                    type="submit"
                    disabled={loading}
                    className={
                      buttonPrimary
                    }
                  >
                    Change Password
                  </button>

                </form>

              </div>

            </section>
          )}

        </main>

      </div>
    </div>
  );
}