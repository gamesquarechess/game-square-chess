import React, { useState, useEffect } from "react";
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Award,
  ShieldCheck,
  Menu,
  X,
  CheckCircle2,
  Crown,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  Camera,
  Send,
  IndianRupee,
  Target,
  Eye,
  GraduationCap,
  Brain,
  Medal,
  LayoutDashboard,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://game-square-chess.onrender.com/api";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const defaultTournaments = [
  {
    id: "sample-1",
    title: "Game Square Grand Championship",
    date: "December 15, 2026",
    location: "Puducherry",
    fee: 500,
    players: 64,
    category: "Open",
    description:
      "Compete against talented players in our flagship chess championship.",
  },
  {
    id: "sample-2",
    title: "Young Kings Chess Cup",
    date: "December 22, 2026",
    location: "Puducherry",
    fee: 300,
    players: 40,
    category: "Under 16",
    description: "A special tournament for young and upcoming chess players.",
  },
  {
    id: "sample-3",
    title: "Weekend Blitz Arena",
    date: "December 28, 2026",
    location: "Puducherry",
    fee: 200,
    players: 32,
    category: "Blitz",
    description:
      "Show your speed and strategy in an exciting blitz tournament.",
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=900",
  "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=900",
  "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=900",
  "https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=900",
  "https://images.unsplash.com/photo-1604948501466-4e9c339b9c24?w=900",
  "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=900",
];

const coaches = [
  {
    name: "Professional Chess Coaching",
    role: "Skill Development",
    icon: GraduationCap,
  },
  {
    name: "Tournament Preparation",
    role: "Competitive Training",
    icon: Trophy,
  },
  {
    name: "Strategic Thinking",
    role: "Chess Improvement",
    icon: Brain,
  },
];

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const [tournamentsList, setTournamentsList] = useState(defaultTournaments);
  const [resultsList, setResultsList] = useState([]);
  const [adminTab, setAdminTab] = useState("tournaments");
  const [editingTournamentId, setEditingTournamentId] = useState(null);
  const [savingTournament, setSavingTournament] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [tournamentError, setTournamentError] = useState("");
  const [resultError, setResultError] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const isLoggedIn = Boolean(user && token);
  const isAdmin = user?.role === "admin";
  const isPlayer = user?.role === "player";
  const emptyTournamentForm = {
    title: "",
    date: "",
    location: "Puducherry",
    fee: "",
    players: "",
    category: "Open",
    description: "",
  };
  const [tForm, setTForm] = useState(emptyTournamentForm);
  const [rForm, setRForm] = useState({
    tournamentTitle: "",
    date: "",
    firstPlace: "",
    secondPlace: "",
    thirdPlace: "",
  });

  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [selectedTournament, setSelectedTournament] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const [adminRegistrations, setAdminRegistrations] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");

  const [authLoading, setAuthLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetOtpMode, setResetOtpMode] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetLoading, setResetLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    fideId: "",
  });

  // Restore saved login
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("gsq_token");
      const savedUser = localStorage.getItem("gsq_user");

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        fetch(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then(async (response) => {
            const data = await response.json();
            if (!response.ok || !data.success || !data.user)
              throw new Error("Session expired");
            setUser(data.user);
            localStorage.setItem("gsq_user", JSON.stringify(data.user));
          })
          .catch(() => {
            setToken(null);
            setUser(null);
            localStorage.removeItem("gsq_token");
            localStorage.removeItem("gsq_user");
          });
      }
    } catch (error) {
      console.error("Unable to restore login:", error);
      localStorage.removeItem("gsq_token");
      localStorage.removeItem("gsq_user");
    }
  }, []);
  useEffect(() => {
    const savedToken = localStorage.getItem("gsq_token");
    const savedUser = localStorage.getItem("gsq_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Session restore error:", error);

        localStorage.removeItem("gsq_token");
        localStorage.removeItem("gsq_user");
      }
    }

    setAuthInitialized(true);
  }, []);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      const [tournamentResponse, resultResponse] = await Promise.all([
        fetch(`${API_URL}/tournaments`),
        fetch(`${API_URL}/results`),
      ]);

      const tournamentData = await tournamentResponse.json();
      const resultData = await resultResponse.json();

      if (tournamentResponse.ok) {
        const items =
          tournamentData.tournaments ||
          tournamentData.data?.tournaments ||
          tournamentData.data ||
          [];
        if (Array.isArray(items)) setTournamentsList(items);
      }

      if (resultResponse.ok) {
        const items =
          resultData.results ||
          resultData.data?.results ||
          resultData.data ||
          [];
        if (Array.isArray(items)) setResultsList(items);
      }
    } catch (error) {
      console.error("Unable to load public tournament data:", error);
    }
  };

  // Fetch admin registrations
  useEffect(() => {
    if (activeTab === "admin" && user?.role === "admin" && token) {
      fetchAdminData();
    }
  }, [activeTab, user, token]);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const fetchAdminData = async () => {
    setLoadingAdmin(true);
    setAdminError("");

    try {
      const response = await fetch(`${API_URL}/admin/registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load registrations.");
      }

      setAdminRegistrations(data.registrations || data.data || []);
    } catch (error) {
      console.error("Admin Fetch Error:", error);
      setAdminError(error.message);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const handleTournamentSubmit = async (e) => {
    e.preventDefault();
    setSavingTournament(true);
    setTournamentError("");

    const payload = {
      ...tForm,
      fee: Number(tForm.fee),
      players: Number(tForm.players),
    };

    try {
      const isEditing = Boolean(editingTournamentId);
      const response = await fetch(
        isEditing
          ? `${API_URL}/tournaments/${editingTournamentId}`
          : `${API_URL}/tournaments`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to save tournament.");
      }

      setTForm(emptyTournamentForm);
      setEditingTournamentId(null);
      await fetchPublicData();
      showToast(
        isEditing
          ? "Tournament updated successfully."
          : "Tournament created successfully.",
      );
    } catch (error) {
      setTournamentError(error.message);
    } finally {
      setSavingTournament(false);
    }
  };

  const handleEditTournament = (tournament) => {
    setEditingTournamentId(tournament._id || tournament.id);
    setTForm({
      title: tournament.title || "",
      date: tournament.date ? String(tournament.date).slice(0, 10) : "",
      location: tournament.location || "",
      fee: tournament.fee ?? "",
      players: tournament.players ?? "",
      category: tournament.category || "Open",
      description: tournament.description || "",
    });
    setAdminTab("tournaments");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteTournament = async (tournament) => {
    const id = tournament._id || tournament.id;

    if (!id) return;

    showConfirm(
      `Are you sure you want to delete "${tournament.title}"?`,
      async () => {
        try {
          const response = await fetch(`${API_URL}/tournaments/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
          });

          const data = await response.json();

          if (!response.ok || data.success === false) {
            throw new Error(data.message || "Unable to delete tournament.");
          }

          await fetchPublicData();
          showToast("Tournament deleted successfully!");
        } catch (error) {
          showToast(error.message, "error");
        }
      },
    );
  };

  const handlePublishResult = async (e) => {
    e.preventDefault();
    setSavingResult(true);
    setResultError("");

    try {
      const response = await fetch(`${API_URL}/results`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(rForm),
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to publish result.");
      }
      setRForm({
        tournamentTitle: "",
        date: "",
        firstPlace: "",
        secondPlace: "",
        thirdPlace: "",
      });
      await fetchPublicData();
      showToast("Tournament result published successfully!");
    } catch (error) {
      setResultError(error.message);
    } finally {
      setSavingResult(false);
    }
  };

  const handleDeleteResult = async (result) => {
    const id = result._id || result.id;

    if (!id) return;

    showConfirm(
      "Are you sure you want to delete this published result?",
      async () => {
        try {
          const response = await fetch(`${API_URL}/results/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
          });

          const data = await response.json();

          if (!response.ok || data.success === false) {
            throw new Error(data.message || "Unable to delete result.");
          }

          await fetchPublicData();
          showToast("Published result deleted successfully!");
        } catch (error) {
          showToast(error.message, "error");
        }
      },
    );
  };

  const navItems = [
    "home",
    "about",
    "tournaments",
    "results",
    "gallery",
    "contact",
  ];

  const changePage = (page) => {
    setActiveTab(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthModal(true);
    setMobileMenuOpen(false);
  };

  // Login and Registration
  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const name = String(formData.get("name") || "").trim();
    const fideId = String(formData.get("fideId") || "").trim() || "Unrated";

    if (!email || !password) {
      showToast("Enter email and password.", "error");
      return;
    }

    if (authMode === "register") {
      if (password.length < 8) {
        showToast("Password must contain at least 8 characters.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }
    }

    setAuthLoading(true);

    try {
      const endpoint =
        authMode === "register"
          ? `${API_URL}/auth/register`
          : `${API_URL}/auth/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          fideId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (authMode === "register") {
        setPendingEmail(email);
        setOtpMode(true);

        showToast("OTP sent successfully! Check your email.");
        return;
      }

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("gsq_token", data.token);
      localStorage.setItem("gsq_user", JSON.stringify(data.user));

      setAuthModal(false);

      if (data.user.role === "admin") {
        changePage("admin");
      }

      showToast("Login successful! Welcome back.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Authentication failed.", "error");
    } finally {
      setAuthLoading(false);
    }
  };
  const handleResendOTP = async () => {
    if (resendCountdown > 0 || resendLoading) return;

    setResendLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to resend OTP.");
      }

      setResendCountdown(30);

      showToast("New OTP sent successfully! Please check your email.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setResendLoading(false);
    }
  };
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setResetLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      setResetOtpMode(true);

      showToast("Password reset OTP sent to your email!");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setResetLoading(false);
    }
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetOtp.length !== 6) {
      showToast("Enter the 6-digit OTP.");
      return;
    }

    if (newPassword.length < 8) {
      showToast("Password must contain at least 8 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          otp: resetOtp,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Password reset failed.");
      }

      setForgotPasswordMode(false);
      setResetOtpMode(false);
      setResetOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setForgotEmail("");

      setAuthMode("login");

      showToast("Password reset successfully! Please login.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setResetLoading(false);
    }
  };
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      showToast("Enter the 6-digit OTP.");
      return;
    }

    setAuthLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingEmail,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "OTP verification failed.");
      }

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("gsq_token", data.token);
      localStorage.setItem("gsq_user", JSON.stringify(data.user));

      setOtpMode(false);
      setOtp("");
      setAuthModal(false);

      if (data.user.role === "admin") {
        changePage("admin");
      }

      showToast("Email verified! Your account has been created.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("gsq_token");
    localStorage.removeItem("gsq_user");

    setAuthModal(false);
    setOtpMode(false);
    setForgotPasswordMode(false);
    setResetOtpMode(false);

    setOtp("");
    setResetOtp("");

    setActiveTab("home");
    setMobileMenuOpen(false);

    showToast("You have successfully logged out.");
  };
  // Tournament registration with Razorpay checkout
  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!selectedTournament) return;
    if (!user || !token) {
      openAuth("login");
      return;
    }
    setRegistrationLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded)
        throw new Error(
          "Unable to load Razorpay checkout. Please check your internet connection.",
        );

      const orderResponse = await fetch(`${API_URL}/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tournamentId: selectedTournament._id }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData.success)
        throw new Error(orderData.message || "Unable to create payment order.");

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Game Square Chess",
        description: `Registration: ${selectedTournament.title}`,
        order_id: orderData.order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: { tournamentId: selectedTournament._id },
        theme: { color: "#fbbf24" },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch(
              `${API_URL}/verify-and-register`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  tournamentId: selectedTournament._id,
                  playerName: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  age: formData.age,
                  fideId: formData.fideId || "Unrated",
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              },
            );
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.success)
              throw new Error(
                verifyData.message || "Payment verification failed.",
              );
            setSelectedTournament(null);
            setBookingSuccess(true);
            setFormData({
              name: "",
              email: "",
              phone: "",
              age: "",
              fideId: "",
            });
            await fetchAdminDataIfAdmin();
          } catch (error) {
            showToast(
              error.message ||
                "Payment was received but registration verification failed. Contact the academy with your payment ID.",
            );
          } finally {
            setRegistrationLoading(false);
          }
        },
        modal: { ondismiss: () => setRegistrationLoading(false) },
      };
      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (response) => {
        setRegistrationLoading(false);
        showToast(
          response.error?.description || "Payment failed. Please try again.",
        );
      });
      checkout.open();
    } catch (error) {
      setRegistrationLoading(false);
      showToast(error.message || "Unable to start payment.");
    }
  };

  const fetchAdminDataIfAdmin = async () => {
    if (user?.role === "admin") await fetchAdminData();
  };

  // Contact form demo
  const handleContact = (e) => {
    e.preventDefault();

    setContactLoading(true);

    setTimeout(() => {
      setContactSent(true);
      setContactLoading(false);
      e.target.reset();
    }, 500);
  };

  const openRegistration = (tournament) => {
    if (!user) {
      setSelectedTournament(tournament);
      openAuth("login");
      return;
    }

    setSelectedTournament(tournament);
    setBookingSuccess(false);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      age: "",
      fideId: user.fideId === "Unrated" ? "" : user.fideId || "",
    });
  };

  const closeRegistration = () => {
    setSelectedTournament(null);
  };
  const showToast = (message, type = "success") => {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);
  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({
      message,
      onConfirm,
    });
  };

  // Section heading
  const SectionTitle = ({ eyebrow, title, description }) => (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <p className="text-amber-400 uppercase tracking-[0.25em] text-xs font-bold mb-3">
        {eyebrow}
      </p>

      <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
        {title}
      </h2>

      {description && (
        <p className="text-slate-400 leading-relaxed">{description}</p>
      )}
    </div>
  );

  // Tournament card
  const TournamentCard = ({ tournament }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:-translate-y-2 hover:border-amber-400/50 transition duration-300 flex flex-col justify-between">
      <div>
        <div className="h-44 bg-gradient-to-br from-amber-400/20 to-slate-800 flex items-center justify-center">
          <Trophy size={60} className="text-amber-400" />
        </div>

        <div className="p-6">
          <span className="bg-amber-400/10 text-amber-400 text-xs px-3 py-1 rounded-full font-semibold">
            {tournament.category}
          </span>

          <h3 className="text-xl font-bold text-white mt-4 mb-3">
            {tournament.title}
          </h3>

          <p className="text-slate-400 text-sm mb-5">
            {tournament.description}
          </p>

          <div className="space-y-2.5 text-sm text-slate-300">
            <p className="flex items-center gap-2">
              <Calendar size={16} className="text-amber-400" />
              {tournament.date}
            </p>

            <p className="flex items-center gap-2">
              <MapPin size={16} className="text-amber-400" />
              {tournament.location}
            </p>

            <p className="flex items-center gap-2">
              <Users size={16} className="text-amber-400" />
              {tournament.players} Seats
            </p>

            <p className="flex items-center gap-2">
              <IndianRupee size={16} className="text-amber-400" />
              Entry Fee: ₹{tournament.fee}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        <button
          onClick={() => openRegistration(tournament)}
          className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3.5 rounded-xl transition"
        >
          Register Now
        </button>
      </div>
    </div>
  );

  // HOME PAGE
  const HomePage = () => (
    <>
      <section className="relative min-h-[650px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={galleryImages[0]}
            alt="Chess board"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-950/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-amber-400/30 bg-amber-400/10 text-amber-300 px-4 py-2 rounded-full text-sm mb-8">
              <Crown size={16} />
              Welcome to Game Square Chess
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Think Smart.
              <br />
              <span className="text-amber-400">Play Strong.</span>
              <br />
              Win Big.
            </h1>

            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl mb-9">
              Discover your potential, sharpen your strategy, and experience the
              excitement of competitive chess.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => changePage("tournaments")}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-7 py-4 rounded-xl font-bold flex items-center gap-2 transition"
              >
                Explore Tournaments <ArrowRight size={18} />
              </button>

              <button
                onClick={() => changePage("about")}
                className="border border-white/30 hover:bg-white/10 text-white px-7 py-4 rounded-xl font-bold transition"
              >
                About Academy
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            eyebrow="Why Game Square Chess"
            title="More Than Just a Game"
            description="We believe chess develops patience, concentration, confidence, and strategic thinking."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, number: "100+", label: "Chess Enthusiasts" },
              { icon: Trophy, number: "10+", label: "Tournament Events" },
              { icon: Award, number: "50+", label: "Awards & Achievements" },
              { icon: ShieldCheck, number: "100%", label: "Passion for Chess" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center hover:border-amber-400/50 transition"
              >
                <item.icon className="text-amber-400 mx-auto mb-4" size={35} />

                <h3 className="text-3xl font-black text-white mb-2">
                  {item.number}
                </h3>

                <p className="text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            eyebrow="Upcoming Events"
            title="Featured Tournaments"
            description="Take your place on the board and challenge yourself."
          />

          <div className="grid md:grid-cols-3 gap-7">
            {tournamentsList.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => changePage("tournaments")}
              className="text-amber-400 font-bold hover:text-amber-300 inline-flex items-center gap-2"
            >
              View All Tournaments <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </>
  );

  // ABOUT PAGE
  const AboutPage = () => (
    <>
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src={galleryImages[1]}
            alt="Chess pieces"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm font-bold mb-4">
            About Our Academy
          </p>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            About <span className="text-amber-400">Game Square Chess</span>
          </h1>

          <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Building chess skills, developing champions, and bringing chess
            enthusiasts together through learning and competition.
          </p>
        </div>
      </section>

      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-amber-400 uppercase tracking-widest text-sm font-bold mb-4">
              Who We Are
            </p>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
              Growing Together Through Chess
            </h2>

            <p className="text-slate-400 leading-8 mb-5">
              Game Square Chess is a chess-focused platform designed to bring
              players, learners, and chess enthusiasts together. Our goal is to
              create opportunities for players to learn, practise, participate
              in tournaments, and improve their game.
            </p>

            <p className="text-slate-400 leading-8 mb-7">
              Whether you are a beginner learning your first moves or an
              experienced player preparing for competition, we aim to provide an
              encouraging environment where every move is a learning
              opportunity.
            </p>

            <button
              onClick={() => changePage("tournaments")}
              className="bg-amber-400 text-slate-950 px-7 py-4 rounded-xl font-bold hover:bg-amber-300 transition"
            >
              Explore Tournaments{" "}
              <ArrowRight className="inline ml-2" size={18} />
            </button>
          </div>

          <img
            src={galleryImages[2]}
            alt="Chess board"
            className="rounded-3xl w-full h-[420px] object-cover"
          />
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            eyebrow="Our Purpose"
            title="Mission & Vision"
            description="The principles that guide our chess community."
          />

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-9">
              <Target className="text-amber-400 mb-6" size={40} />

              <h3 className="text-2xl font-bold text-white mb-4">
                Our Mission
              </h3>

              <p className="text-slate-400 leading-8">
                To encourage chess learning and participation by providing
                opportunities for practice, skill development, friendly
                competition, and tournament experiences.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-9">
              <Eye className="text-amber-400 mb-6" size={40} />

              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>

              <p className="text-slate-400 leading-8">
                To build a strong and supportive chess community that inspires
                young talents, develops confident players, and creates
                opportunities for chess enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            eyebrow="What We Offer"
            title="Our Approach to Chess"
            description="We focus on helping players develop their knowledge and confidence."
          />

          <div className="grid md:grid-cols-3 gap-7">
            {coaches.map((item, index) => (
              <div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center hover:border-amber-400/50 transition"
              >
                <item.icon className="text-amber-400 mx-auto mb-6" size={38} />

                <h3 className="text-xl font-bold text-white mb-2">
                  {item.name}
                </h3>

                <p className="text-slate-400">{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            eyebrow="Our Values"
            title="What Makes Chess Special?"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "Critical Thinking",
                text: "Develop logical and analytical thinking.",
              },
              {
                icon: ShieldCheck,
                title: "Discipline",
                text: "Build patience and focus through practice.",
              },
              {
                icon: Medal,
                title: "Achievement",
                text: "Set goals and celebrate progress.",
              },
              {
                icon: Users,
                title: "Community",
                text: "Learn, compete, and grow together.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-2xl p-7 border border-slate-700"
              >
                <item.icon className="text-amber-400 mb-5" size={32} />

                <h3 className="text-white font-bold text-lg mb-2">
                  {item.title}
                </h3>

                <p className="text-slate-400 text-sm leading-6">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  // TOURNAMENTS PAGE
  const TournamentsPage = () => (
    <section className="py-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle
          eyebrow="Compete & Win"
          title="Upcoming Tournaments"
          description="Find your next challenge and register for an upcoming chess event."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {tournamentsList.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      </div>
    </section>
  );

  // GALLERY PAGE
  const GalleryPage = () => (
    <section className="py-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle
          eyebrow="Our Moments"
          title="Chess Gallery"
          description="Explore chess moments, events, and tournament experiences."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl h-72 bg-slate-800"
            >
              <img
                src={image}
                alt={`Chess gallery ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-6">
                <p className="text-white font-bold flex items-center gap-2">
                  <Camera size={18} />
                  Game Square Chess
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // PUBLIC RESULTS PAGE
  const ResultsPage = () => (
    <section className="py-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle
          eyebrow="Tournament Winners"
          title="Published Results"
          description="Official results published by the Game Square Chess admin."
        />
        {resultsList.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
            No tournament results have been published yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultsList.map((result, index) => (
              <div
                key={result._id || result.id || index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-7"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="text-amber-400" size={30} />
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                    Official Result
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {result.tournamentTitle || result.tournament || "Tournament"}
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  {result.date
                    ? new Date(result.date).toLocaleDateString()
                    : ""}
                </p>
                <div className="space-y-3">
                  {[
                    ["1st Place", result.firstPlace],
                    ["2nd Place", result.secondPlace],
                    ["3rd Place", result.thirdPlace],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-4 bg-slate-800 rounded-xl p-3"
                    >
                      <span className="text-slate-400">{label}</span>
                      <span className="text-white font-semibold text-right">
                        {value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  // CONTACT PAGE
  const ContactPage = () => (
    <section className="py-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle
          eyebrow="Contact Us"
          title="Let's Connect"
          description="Have questions about tournaments or chess activities? Send us a message."
        />

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-7">
              Contact Information
            </h3>

            <div className="space-y-7">
              <div className="flex gap-4">
                <MapPin className="text-amber-400" />
                <div>
                  <h4 className="text-white font-bold mb-1">Location</h4>
                  <p className="text-slate-400">Karaikal, India</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="text-amber-400" />
                <div>
                  <h4 className="text-white font-bold mb-1">Phone</h4>
                  {/* <p className="text-slate-400">9486830161</p> */}
                  <p className="text-slate-400">
                    Contact academy for details - 9486830161
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Mail className="text-amber-400" />
                <div>
                  <h4 className="text-white font-bold mb-1">Email</h4>
                  <p className="text-slate-400">
                    Contact us for enquiries @gamesquarechess@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="text-amber-400" />
                <div>
                  <h4 className="text-white font-bold mb-1">Working Hours</h4>
                  <p className="text-slate-400">Mon-Sat 10AM-6PM</p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleContact}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-7">
              Send Us a Message
            </h3>

            <div className="space-y-5">
              <input
                required
                type="text"
                placeholder="Your Name"
                className="form-input"
              />

              <input
                required
                type="email"
                placeholder="Your Email"
                className="form-input"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="form-input"
              />

              <textarea
                required
                rows="5"
                placeholder="Your Message"
                className="form-input resize-none"
              />

              <button
                type="submit"
                disabled={contactLoading}
                className="w-full bg-amber-400 text-slate-950 py-4 rounded-xl font-bold hover:bg-amber-300 transition flex justify-center items-center gap-2 disabled:opacity-60"
              >
                {contactLoading ? "Sending..." : "Send Message"}
                <Send size={18} />
              </button>

              {contactSent && (
                <p className="text-green-400 text-center">
                  Demo message submitted successfully!
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );

  // ADMIN DASHBOARD
  const adminPageContent = (
    <section className="py-16 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-5 mb-10">
          <div>
            <p className="text-amber-400 uppercase tracking-widest text-sm font-bold mb-2">
              Administration
            </p>
            <h1 className="text-4xl font-black text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-2">
              Create, update and delete tournaments, publish results, and view
              registrations.
            </p>
          </div>
          <button
            onClick={() => {
              fetchPublicData();
              fetchAdminData();
            }}
            className="bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-bold h-fit"
          >
            Refresh Dashboard
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <Trophy className="text-amber-400 mb-3" size={30} />
            <p className="text-slate-400">Tournaments</p>
            <h2 className="text-3xl font-black text-white">
              {tournamentsList.length}
            </h2>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <Medal className="text-amber-400 mb-3" size={30} />
            <p className="text-slate-400">Published Results</p>
            <h2 className="text-3xl font-black text-white">
              {resultsList.length}
            </h2>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <Users className="text-amber-400 mb-3" size={30} />
            <p className="text-slate-400">Registrations</p>
            <h2 className="text-3xl font-black text-white">
              {adminRegistrations.length}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-7">
          {[
            ["tournaments", "Manage Tournaments"],
            ["results", "Publish Results"],
            ["registrations", "Registrations"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setAdminTab(key)}
              className={`px-5 py-3 rounded-xl font-bold transition ${adminTab === key ? "bg-amber-400 text-slate-950" : "bg-slate-900 text-slate-300 border border-slate-700 hover:border-amber-400"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {adminTab === "tournaments" && (
          <div className="grid lg:grid-cols-2 gap-7">
            <form
              onSubmit={handleTournamentSubmit}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-white">
                  {editingTournamentId
                    ? "Update Tournament"
                    : "Create Tournament"}
                </h2>
                {editingTournamentId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTournamentId(null);
                      setTForm(emptyTournamentForm);
                    }}
                    className="text-sm text-amber-400"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <input
                className="form-input"
                required
                placeholder="Tournament title"
                value={tForm.title}
                onChange={(e) => setTForm({ ...tForm, title: e.target.value })}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  className="form-input"
                  required
                  type="date"
                  value={tForm.date}
                  onChange={(e) => setTForm({ ...tForm, date: e.target.value })}
                />
                <input
                  className="form-input"
                  required
                  placeholder="Location"
                  value={tForm.location}
                  onChange={(e) =>
                    setTForm({ ...tForm, location: e.target.value })
                  }
                />
                <input
                  className="form-input"
                  required
                  type="number"
                  min="0"
                  placeholder="Entry fee (₹)"
                  value={tForm.fee}
                  onChange={(e) => setTForm({ ...tForm, fee: e.target.value })}
                />
                <input
                  className="form-input"
                  required
                  type="number"
                  min="1"
                  placeholder="Available seats"
                  value={tForm.players}
                  onChange={(e) =>
                    setTForm({ ...tForm, players: e.target.value })
                  }
                />
              </div>
              <select
                className="form-input"
                value={tForm.category}
                onChange={(e) =>
                  setTForm({ ...tForm, category: e.target.value })
                }
              >
                <option>Open</option>
                <option>Under 16</option>
                <option>Under 12</option>
                <option>Blitz</option>
                <option>Rapid</option>
                <option>Classical</option>
              </select>
              <textarea
                className="form-input resize-none"
                rows="3"
                placeholder="Tournament description"
                value={tForm.description}
                onChange={(e) =>
                  setTForm({ ...tForm, description: e.target.value })
                }
              />
              {tournamentError && (
                <p className="text-red-400 text-sm">{tournamentError}</p>
              )}
              <button
                disabled={savingTournament}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 py-3 rounded-xl font-bold disabled:opacity-60"
              >
                {savingTournament
                  ? "Saving..."
                  : editingTournamentId
                    ? "Update Tournament"
                    : "Create Tournament"}
              </button>
            </form>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-5">
                Existing Tournaments
              </h2>
              {tournamentsList.length === 0 ? (
                <p className="text-slate-400">No tournaments found.</p>
              ) : (
                <div className="space-y-4">
                  {tournamentsList.map((tournament, index) => (
                    <div
                      key={tournament._id || tournament.id || index}
                      className="border border-slate-700 rounded-xl p-4"
                    >
                      <h3 className="text-white font-bold">
                        {tournament.title}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">
                        {tournament.date} · {tournament.location} · ₹
                        {tournament.fee}
                      </p>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleEditTournament(tournament)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-amber-400 py-2 rounded-lg font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTournament(tournament)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {adminTab === "results" && (
          <div className="grid lg:grid-cols-2 gap-7">
            <form
              onSubmit={handlePublishResult}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-xl font-bold text-white">
                Publish Tournament Results
              </h2>
              <input
                className="form-input"
                required
                placeholder="Tournament name"
                value={rForm.tournamentTitle}
                onChange={(e) =>
                  setRForm({ ...rForm, tournamentTitle: e.target.value })
                }
                list="tournament-options"
              />
              <datalist id="tournament-options">
                {tournamentsList.map((t, i) => (
                  <option key={t._id || t.id || i} value={t.title} />
                ))}
              </datalist>
              <input
                className="form-input"
                type="date"
                value={rForm.date}
                onChange={(e) => setRForm({ ...rForm, date: e.target.value })}
              />
              <input
                className="form-input"
                required
                placeholder="1st place player name"
                value={rForm.firstPlace}
                onChange={(e) =>
                  setRForm({ ...rForm, firstPlace: e.target.value })
                }
              />
              <input
                className="form-input"
                required
                placeholder="2nd place player name"
                value={rForm.secondPlace}
                onChange={(e) =>
                  setRForm({ ...rForm, secondPlace: e.target.value })
                }
              />
              <input
                className="form-input"
                required
                placeholder="3rd place player name"
                value={rForm.thirdPlace}
                onChange={(e) =>
                  setRForm({ ...rForm, thirdPlace: e.target.value })
                }
              />
              {resultError && (
                <p className="text-red-400 text-sm">{resultError}</p>
              )}
              <button
                disabled={savingResult}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 py-3 rounded-xl font-bold disabled:opacity-60"
              >
                {savingResult ? "Publishing..." : "Publish Result"}
              </button>
            </form>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-5">
                Published Results
              </h2>
              {resultsList.length === 0 ? (
                <p className="text-slate-400">No results published yet.</p>
              ) : (
                <div className="space-y-4">
                  {resultsList.map((result, index) => (
                    <div
                      key={result._id || result.id || index}
                      className="border border-slate-700 rounded-xl p-4"
                    >
                      <h3 className="text-white font-bold">
                        {result.tournamentTitle || result.tournament}
                      </h3>
                      <p className="text-slate-400 text-sm mt-2">
                        1st: {result.firstPlace} · 2nd: {result.secondPlace} ·
                        3rd: {result.thirdPlace}
                      </p>
                      <button
                        onClick={() => handleDeleteResult(result)}
                        className="mt-3 text-red-400 text-sm font-semibold"
                      >
                        Delete Result
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {adminTab === "registrations" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                Tournament Registrations
              </h2>
            </div>
            {loadingAdmin ? (
              <p className="p-8 text-center text-amber-400">
                Loading registrations...
              </p>
            ) : adminError ? (
              <div className="p-8 text-center">
                <p className="text-red-400 mb-4">{adminError}</p>
                <button
                  onClick={fetchAdminData}
                  className="text-amber-400 font-bold"
                >
                  Try Again
                </button>
              </div>
            ) : adminRegistrations.length === 0 ? (
              <p className="p-8 text-center text-slate-400">
                No registrations found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-800 text-slate-300 text-sm">
                    <tr>
                      <th className="p-4">Player Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Tournament</th>
                      <th className="p-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminRegistrations.map((registration, index) => (
                      <tr
                        key={registration._id || registration.id || index}
                        className="border-t border-slate-800 text-slate-300"
                      >
                        <td className="p-4">
                          {registration.playerName || registration.name || "-"}
                        </td>
                        <td className="p-4">{registration.email || "-"}</td>
                        <td className="p-4">{registration.phone || "-"}</td>
                        <td className="p-4">
                          {registration.tournamentTitle || "-"}
                        </td>
                        <td className="p-4 text-amber-400 font-bold">
                          ₹{registration.amountPaid || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          key={toast.id}
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border min-w-[280px] max-w-sm animate-slide-in ${
            toast.type === "error"
              ? "bg-red-950 border-red-500 text-red-300"
              : toast.type === "warning"
                ? "bg-amber-950 border-amber-500 text-amber-300"
                : "bg-green-950 border-green-500 text-green-300"
          }`}
        >
          <CheckCircle2 size={22} />

          <p className="flex-1 text-sm font-semibold">{toast.message}</p>

          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}
      <style>{`
        .form-input {
          width: 100%;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 14px 16px;
          color: white;
          outline: none;
        }

        .form-input:focus {
          border-color: #fbbf24;
        }

        .form-input::placeholder {
          color: #94a3b8;
        }
          @keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
      `}</style>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => changePage("home")}
            className="flex items-center gap-3 text-left"
          >
            <div className="bg-amber-400 text-slate-950 p-2 rounded-xl">
              <Crown size={24} />
            </div>

            <div>
              <span className="font-black text-xl tracking-tight text-white block leading-none">
                GAME SQUARE
              </span>

              <span className="text-[10px] tracking-[0.25em] text-amber-400 font-bold uppercase">
                Chess Academy
              </span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-7">
            {navItems.map((tab) => (
              <button
                key={tab}
                onClick={() => changePage(tab)}
                className={
                  "capitalize text-sm font-semibold transition " +
                  (activeTab === tab
                    ? "text-amber-400"
                    : "text-slate-300 hover:text-white")
                }
              >
                {tab}
              </button>
            ))}

            {user?.role === "admin" && (
              <button
                onClick={() => changePage("admin")}
                className={
                  "text-sm font-semibold flex items-center gap-2 " +
                  (activeTab === "admin"
                    ? "text-amber-400"
                    : "text-slate-300 hover:text-white")
                }
              >
                <LayoutDashboard size={17} />
                Admin
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-slate-300">Hi, {user.name}</span>

                <button
                  onClick={handleLogout}
                  className="border border-slate-600 px-5 py-2 rounded-lg hover:border-amber-400 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => openAuth("login")}
                className="bg-amber-400 text-slate-950 px-5 py-2.5 rounded-lg font-bold hover:bg-amber-300 transition"
              >
                Login / Register
              </button>
            )}
          </div>

          <button
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={27} /> : <Menu size={27} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-6 py-5 space-y-4">
            {navItems.map((tab) => (
              <button
                key={tab}
                onClick={() => changePage(tab)}
                className={
                  "block capitalize font-semibold w-full text-left " +
                  (activeTab === tab ? "text-amber-400" : "text-slate-300")
                }
              >
                {tab}
              </button>
            ))}

            {user?.role === "admin" && (
              <button
                onClick={() => changePage("admin")}
                className="block text-amber-400 font-semibold"
              >
                Admin Dashboard
              </button>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="text-amber-400 font-bold"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => openAuth("login")}
                className="text-amber-400 font-bold"
              >
                Login / Register
              </button>
            )}
          </div>
        )}
      </nav>

      {/* PAGE CONTENT */}
      <main className="flex-grow">
        {activeTab === "home" && <HomePage />}
        {activeTab === "about" && <AboutPage />}
        {activeTab === "tournaments" && <TournamentsPage />}
        {activeTab === "results" && <ResultsPage />}
        {activeTab === "gallery" && <GalleryPage />}
        {activeTab === "contact" && <ContactPage />}

        {activeTab === "admin" &&
          (user?.role === "admin" ? (
            adminPageContent
          ) : (
            <section className="min-h-screen flex items-center justify-center">
              <div className="text-center p-8">
                <ShieldCheck
                  size={45}
                  className="text-amber-400 mx-auto mb-4"
                />

                <h2 className="text-2xl font-bold text-white mb-3">
                  Admin Access Required
                </h2>

                <p className="text-slate-400 mb-5">
                  Please login with an administrator account.
                </p>

                <button
                  onClick={() => openAuth("login")}
                  className="bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-bold"
                >
                  Login
                </button>
              </div>
            </section>
          ))}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-amber-400 p-2 rounded-xl">
                  <Crown className="text-slate-950" size={25} />
                </div>

                <div>
                  <h3 className="font-black text-xl">GAME SQUARE</h3>
                  <p className="text-amber-400 text-xs tracking-[0.3em]">
                    CHESS
                  </p>
                </div>
              </div>

              <p className="text-slate-400 leading-7">
                Think smart, play strong, and grow with the Game Square Chess
                community.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-5">Quick Links</h3>

              <div className="grid grid-cols-2 gap-4">
                {navItems.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => changePage(tab)}
                    className="text-slate-400 hover:text-amber-400 text-left capitalize transition"
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-5">
                Get in Touch
              </h3>

              <p className="text-slate-400 flex items-center gap-3 mb-4">
                <MapPin size={18} className="text-amber-400" />
                Karaikal, India
              </p>

              <button
                onClick={() => changePage("contact")}
                className="text-amber-400 font-bold hover:text-amber-300"
              >
                Contact Us <ArrowRight className="inline" size={17} />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-7 text-center">
            <p className="text-slate-500 text-sm">
              © 2026 Game Square Chess. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* LOGIN / REGISTER MODAL */}
      {authModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md relative my-8">
            <button
              onClick={() => {
                setAuthModal(false);
                setForgotPasswordMode(false);
                setResetOtpMode(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
              aria-label="Close login"
            >
              <X size={23} />
            </button>

            <div className="text-center mb-7">
              <div className="bg-amber-400 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Crown className="text-slate-950" size={28} />
              </div>

              <h2 className="text-2xl font-black text-white">
                {forgotPasswordMode
                  ? resetOtpMode
                    ? "Reset Password"
                    : "Forgot Password"
                  : otpMode
                    ? "Verify Your Email"
                    : authMode === "login"
                      ? "Welcome Back"
                      : "Create Account"}
              </h2>

              <p className="text-slate-400 text-sm mt-2">
                {forgotPasswordMode
                  ? resetOtpMode
                    ? "Enter your OTP and create a new password."
                    : "Enter your registered email to receive a reset OTP."
                  : otpMode
                    ? `Enter the 6-digit OTP sent to ${pendingEmail}`
                    : authMode === "login"
                      ? "Login to continue your chess journey."
                      : "Join the Game Square Chess community."}
              </p>
            </div>

            {/* FORGOT PASSWORD SCREEN */}
            {forgotPasswordMode ? (
              !resetOtpMode ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Registered Email Address"
                    className="form-input"
                  />

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-amber-400 text-slate-950 py-3.5 rounded-xl font-bold disabled:opacity-50"
                  >
                    {resetLoading ? "Sending OTP..." : "Send Reset OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotPasswordMode(false)}
                    className="w-full text-slate-400 py-2"
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <input
                    type="email"
                    value={forgotEmail}
                    readOnly
                    className="form-input opacity-70"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    required
                    value={resetOtp}
                    onChange={(e) =>
                      setResetOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Enter 6-digit OTP"
                    className="form-input text-center tracking-[0.5em] text-xl"
                  />

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="form-input"
                  />

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="form-input"
                  />

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-amber-400 text-slate-950 py-3.5 rounded-xl font-bold disabled:opacity-50"
                  >
                    {resetLoading ? "Updating Password..." : "Reset Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResetOtpMode(false);
                      setResetOtp("");
                    }}
                    className="w-full text-slate-400 py-2"
                  >
                    Back
                  </button>
                </form>
              )
            ) : otpMode ? (
              /* REGISTRATION OTP SCREEN */

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit OTP"
                  className="form-input text-center tracking-[0.5em] text-xl"
                  required
                />

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-amber-400 text-slate-950 py-3.5 rounded-xl font-bold"
                >
                  {authLoading ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading || resendCountdown > 0}
                  className="w-full border border-amber-400 text-amber-400 py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {resendLoading
                    ? "Sending OTP..."
                    : resendCountdown > 0
                      ? `Resend OTP in ${resendCountdown}s`
                      : "Resend OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpMode(false);
                    setOtp("");
                  }}
                  className="w-full text-slate-400 py-2"
                >
                  Back to Signup
                </button>
              </form>
            ) : (
              /* LOGIN AND REGISTRATION SCREEN */

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" && (
                  <>
                    <input
                      name="name"
                      required
                      placeholder="Full Name"
                      className="form-input"
                    />

                    <input
                      name="age"
                      required
                      placeholder="Age"
                      className="form-input"
                      type="number"
                    />

                    <input
                      name="fideId"
                      placeholder="FIDE ID (Optional)"
                      className="form-input"
                    />
                  </>
                )}

                <input
                  name="email"
                  required
                  type="email"
                  placeholder="Email Address"
                  className="form-input"
                />

                <input
                  name="password"
                  required
                  type="password"
                  minLength={authMode === "register" ? 8 : 1}
                  placeholder="Password"
                  className="form-input"
                />

                {authMode === "register" && (
                  <input
                    name="confirmPassword"
                    required
                    type="password"
                    minLength={8}
                    placeholder="Confirm Password"
                    className="form-input"
                  />
                )}

                {authMode === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordMode(true);
                        setResetOtpMode(false);
                        setForgotEmail("");
                      }}
                      className="text-amber-400 text-sm font-semibold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-amber-400 text-slate-950 py-3.5 rounded-xl font-bold"
                >
                  {authLoading
                    ? "Please wait..."
                    : authMode === "login"
                      ? "Login"
                      : "Create Account"}
                </button>
              </form>
            )}

            {!otpMode && !forgotPasswordMode && (
              <p className="text-center text-slate-400 text-sm mt-6">
                {authMode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}

                <button
                  type="button"
                  onClick={() =>
                    setAuthMode(authMode === "login" ? "register" : "login")
                  }
                  className="text-amber-400 font-bold ml-2"
                >
                  {authMode === "login" ? "Register" : "Login"}
                </button>
              </p>
            )}
          </div>
        </div>
      )}
      {/* TOURNAMENT REGISTRATION MODAL */}
      {selectedTournament && user && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-7 w-full max-w-lg relative my-8">
            <button
              onClick={closeRegistration}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
              aria-label="Close registration"
            >
              <X size={23} />
            </button>

            <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-2">
              Tournament Registration
            </p>

            <h2 className="text-2xl font-black text-white mb-2 pr-8">
              {selectedTournament.title}
            </h2>

            <p className="text-slate-400 text-sm mb-6">
              Complete your details to register for this tournament.
            </p>

            <form onSubmit={handleRegistration} className="space-y-4">
              <input
                required
                placeholder="Player Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="form-input"
              />

              <input
                required
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="form-input"
              />

              <input
                required
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                className="form-input"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: e.target.value,
                    })
                  }
                  className="form-input"
                />

                <input
                  placeholder="FIDE ID (Optional)"
                  value={formData.fideId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fideId: e.target.value,
                    })
                  }
                  className="form-input"
                />
              </div>

              <div className="bg-slate-800 rounded-xl p-4 flex justify-between items-center">
                <span className="text-slate-300">Registration Fee</span>

                <span className="text-amber-400 font-black text-xl">
                  ₹{selectedTournament.fee}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                You will be redirected to secure Razorpay Checkout. Your
                registration is confirmed only after the payment is verified by
                the server.
              </p>

              <button
                type="submit"
                disabled={registrationLoading}
                className="w-full bg-amber-400 text-slate-950 py-4 rounded-xl font-bold hover:bg-amber-300 transition disabled:opacity-60"
              >
                {registrationLoading
                  ? "Opening secure checkout..."
                  : "Pay & Register"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION SUCCESS MODAL */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-9 max-w-sm w-full text-center">
            <div className="bg-green-400/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="text-green-400" size={45} />
            </div>

            <h2 className="text-2xl font-black text-white mb-3">
              Registration Submitted!
            </h2>

            <p className="text-slate-400 mb-7">
              Your tournament registration was submitted successfully.
            </p>

            <button
              onClick={() => setBookingSuccess(false)}
              className="w-full bg-amber-400 text-slate-950 py-3 rounded-xl font-bold"
            >
              Continue
            </button>
          </div>
        </div>
      )}
      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-7 max-w-sm w-full">
            <h2 className="text-xl font-bold text-white mb-3">
              Confirm Action
            </h2>

            <p className="text-slate-400 mb-7">{confirmDialog.message}</p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  await action();
                }}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
