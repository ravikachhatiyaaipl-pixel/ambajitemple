import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  Sparkles,
  Calendar,
  Clock,
  IndianRupee,
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  X,
  Loader2,
  Search,
  Package,
  Receipt,
  FileText,
  Upload,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  User,
  Flame,
  Utensils,
  Moon,
  RefreshCw,
  Ticket,
  Gift,
  Handshake,
  HandCoins,
  CalendarCheck,
} from "lucide-react";

const KIND_META = {
  POOJA: { label: "Pooja", cls: "bg-orange-100 text-orange-700", Icon: Sparkles },
  YAGNA: { label: "Yagna", cls: "bg-amber-100 text-amber-700", Icon: Flame },
  BHOG: { label: " offerings", cls: "bg-rose-100 text-rose-700", Icon: Utensils },
  THAAL: { label: "Thaal", cls: "bg-emerald-100 text-emerald-700", Icon: Utensils },
  RATRI_PUJA: { label: "Ratri Puja", cls: "bg-indigo-100 text-indigo-700", Icon: Moon },
  SUBSCRIPTION: { label: "Subscription", cls: "bg-blue-100 text-blue-700", Icon: RefreshCw },
  RAJBHOG_COUPON: { label: "Coupon", cls: "bg-pink-100 text-pink-700", Icon: Ticket },
  TITHI_BHOJAN: { label: "Tithi Bhojan", cls: "bg-teal-100 text-teal-700", Icon: Utensils },
  SPONSORSHIP: { label: "Sponsorship", cls: "bg-gray-100 text-gray-700", Icon: Handshake },
};

const SevaPortal = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

<<<<<<< HEAD
=======
  // ---------- LOCAL date helpers ----------
  // NOTE: toISOString() UTC deta hai - browser timezone UTC se peeche ho to
  // date ek din aage dikhta hai. Isliye local date use karte hain.
  const localDate = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const addDays = (d, days) => {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  };

>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
  const [view, setView] = useState("catalogue");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("ALL");

  const [selectedService, setSelectedService] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
<<<<<<< HEAD
  const [performDate, setPerformDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  // Catalogue ka daily limit kis date ka dikhana hai (default = aaj)
  const [quotaDate, setQuotaDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
=======
  const [performDate, setPerformDate] = useState(() =>
    localDate(addDays(new Date(), 1))
  );
  // Catalogue ka daily limit kis date ka dikhana hai.
  // Default = SERVER ka aaj (browser timezone se mismatch na ho) -
  // isliye pehle khali bhejte hain, server quota_date bhejta hai.
  const [quotaDate, setQuotaDate] = useState("");
  // User ne khud date change ki hai ya nahi (auto rollover band karne ke liye)
  const [dateIsAuto, setDateIsAuto] = useState(true);
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [quota, setQuota] = useState(null);
  const [groupSize, setGroupSize] = useState(1);
  const [pricePreview, setPricePreview] = useState(null);

  const [devoteeName, setDevoteeName] = useState(
    user?.name || user?.username || ""
  );
  const [devoteePhone, setDevoteePhone] = useState(
    user?.apiUserData?.Usr_Mobile || ""
  );
  const [devoteeEmail, setDevoteeEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [gotra, setGotra] = useState("");
  const [remarks, setRemarks] = useState("");

  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [extraDocs, setExtraDocs] = useState({});

  const [payMode, setPayMode] = useState("");
  const [paymentRef, setPaymentRef] = useState("");

  // Is service ke liye required documents (API se aate hain)
  const requiredDocs = useMemo(
    () => selectedService?.required_documents || [],
    [selectedService]
  );

  const [myBookings, setMyBookings] = useState([]);
  const [queryResponses, setQueryResponses] = useState({});
  const [activeBooking, setActiveBooking] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payAmount, setPayAmount] = useState("");

  useEffect(() => {
    loadCatalogue();
    loadMyBookings();
    loadPaymentModes();
  }, []);

  const loadCatalogue = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
<<<<<<< HEAD
      const res = await axios.get(`${base}/portal/seva/catalogue`, {
        headers,
        params: { date: quotaDate },
      });
      if (res.data?.success) {
        setCategories(res.data.data.categories || []);
        setServices(res.data.data.services || []);
=======

      // Date tabhi bhejo jab user ne khud choose ki ho - warna SERVER ka aaj use karo
      // (browser/server timezone mismatch na ho)
      const params = {};
      if (!dateIsAuto && quotaDate) {
        params.date = quotaDate;
      }

      const res = await axios.get(`${base}/portal/seva/catalogue`, {
        headers,
        params,
      });

      if (res.data?.success) {
        setCategories(res.data.data.categories || []);
        setServices(res.data.data.services || []);

        // Server jo date use kar raha hai, wahi humare selector me dikhao
        const serverDate = res.data.data.quota_date;
        if (serverDate) {
          setQuotaDate(serverDate);
        }
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
      }
    } catch (e) {
      if (!silent) {
        toast.error(e.response?.data?.message || "Failed to load services");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  /**
   * REAL-TIME daily limit refresh.
   *
<<<<<<< HEAD
   * Catalogue har 20 second me silently re-fetch hota hai - isse "X of Y left
   * today" counter live update hota hai (kisi ke booking karte hi).
   * Silent refresh user ka scroll/selection disturb nahi karta.
=======
   * Catalogue har 20 second me silently re-fetch hota hai - isse "X of Y left"
   * counter live update hota hai (kisi ke booking karte hi).
   * Din change hone par (midnight rollover) server naya date deta hai aur
   * counter naye din ka data dikhata hai.
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
   */
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) {
        return; // tab background me hai - zaroorat nahi
      }
<<<<<<< HEAD
=======

>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
      loadCatalogue(true);
    }, 20000);

    return () => clearInterval(timer);
<<<<<<< HEAD
  }, []);
=======
  }, [dateIsAuto, quotaDate]);
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339

  // Page focus hone par bhi turant refresh
  useEffect(() => {
    const onFocus = () => loadCatalogue(true);
    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Catalogue date badle to turant reload
  useEffect(() => {
    loadCatalogue(true);
  }, [quotaDate]);


  const loadMyBookings = async () => {
    try {
      const res = await axios.get(`${base}/portal/seva/bookings`, { headers });
      if (res.data?.success) {
        setMyBookings(res.data.data?.data || []);
      }
    } catch (e) {
      // ignore
    }
  };

  // Query ka response devotee bhejta hai
  const handleRespondQuery = async (booking) => {
    const text = (queryResponses[booking.booking_id] || "").trim();

    if (!text) {
      toast.error("Please type your response");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${base}/portal/seva/bookings/${booking.booking_id}/respond-query`,
        { response: text },
        { headers }
      );

      if (res.data?.success) {
        toast.success(
          "Response submitted - booking is back with the temple for approval"
        );
        setQueryResponses((p) => ({ ...p, [booking.booking_id]: "" }));
        loadMyBookings();
      } else {
        toast.error(res.data?.message || "Failed to submit response");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const loadPaymentModes = async () => {
    try {
      const res = await axios.get(`${base}/portal/seva/payment-modes`, { headers });
      if (res.data?.success) {
        setPaymentModes(res.data.data || []);
      }
    } catch (e) {
      // ignore
    }
  };

  const loadSlots = async (svc, date, pkgId) => {
    if (!svc) return;
    try {
      const res = await axios.get(`${base}/portal/seva/slots`, {
        headers,
        params: {
          service_id: svc.service_id,
          date,
          package_id: pkgId || undefined,
        },
      });
      if (res.data?.success) {
        setSlots(res.data.data.slots || []);
        setQuota(res.data.data.quota || null);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load slots");
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const byCat = activeCat === "ALL" || s.category_id == activeCat;
      const byText = `${s.name} ${s.code} ${s.service_kind} ${s.short_description || ""
        } ${s.category?.name || ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      return byCat && byText;
    });
  }, [services, activeCat, query]);

  const selectService = (svc) => {
    const firstPkg = svc.packages?.[0] || null;
    setSelectedService(svc);
    setSelectedPackage(firstPkg);
    setSelectedSlot(null);
    setSlots([]);
    setPricePreview(null);
    setPayMode("");
    // Group size default = package ka group size
    setGroupSize(
      Math.max(1, Number(firstPkg?.persons_per_booking ?? 1) || 1)
    );
    loadSlots(svc, performDate, firstPkg?.package_id);
    setView("booking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Max persons a single booking of the selected package can serve
  const maxGroupSize = Math.max(
    1,
    Number(
      selectedPackage?.persons_per_booking ??
      selectedPackage?.max_persons ??
      selectedService?.max_persons ??
      1
    ) || 1
  );

  // Persons actually served under the temple (PACKAGE se decide)
  const personsServed = Math.max(
    1,
    Math.min(
      Number(
        selectedPackage?.persons_served_count ??
        selectedPackage?.persons_served ??
        maxGroupSize
      ) || 1,
      maxGroupSize
    )
  );

  // Group size = package ka group size (client input NAHI - sab package se)
  useEffect(() => {
    setGroupSize(maxGroupSize);
  }, [maxGroupSize]);

  // Package change -> group size + slots (dynamic pattern) refresh
  const selectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setGroupSize(Math.max(1, Number(pkg?.persons_per_booking ?? 1) || 1));
    setSelectedSlot(null);

    if (selectedService) {
      loadSlots(selectedService, performDate, pkg?.package_id);
    }
  };
  const fetchPricePreview = async () => {
    if (!selectedService) return;
    try {
      const res = await axios.post(
        `${base}/portal/seva/price-preview`,
        {
          service_id: selectedService.service_id,
          package_id: selectedPackage?.package_id || null,
          slot_id: selectedSlot?.slot_id || null,
          perform_date: performDate,
        },
        { headers }
      );
      if (res.data?.success) setPricePreview(res.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || "Price preview failed");
    }
  };

  useEffect(() => {
    if (selectedService && view === "booking") {
      fetchPricePreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService, selectedPackage, selectedSlot, performDate]);

  const resetForm = () => {
    setAadhaarFront(null);
    setAadhaarBack(null);
    setPayMode("");
    setPaymentRef("");
    setAddress("");
    setGotra("");
    setRemarks("");
    setSelectedSlot(null);
    setActiveBooking(null);
  };

  const handleBooking = async () => {
    if (!selectedService) return;

    if (!devoteeName.trim()) return toast.error("Please enter your name");
    if (!devoteePhone.trim())
      return toast.error("Please enter your mobile number");
    if (!address.trim()) return toast.error("Please enter your address");
    if (!payMode) return toast.error("Select payment option (Cash or Online)");

    // Mapped documents check
    for (const doc of requiredDocs) {
      if (!doc.is_required) continue;
      if (doc.code === "AADHAAR_FRONT" && !aadhaarFront)
        return toast.error("Please upload Aadhaar front side");
      if (doc.code === "AADHAAR_BACK" && !aadhaarBack)
        return toast.error("Please upload Aadhaar back side");
      if (
        doc.code !== "AADHAAR_FRONT" &&
        doc.code !== "AADHAAR_BACK" &&
        !extraDocs[doc.code]
      ) {
        return toast.error(`Please upload ${doc.name}`);
      }
    }

    // Aadhaar tabhi mandatory jab mapped hai
    if (requiredDocs.length === 0) {
      if (aadhaarFront && !aadhaarBack)
        return toast.error("Please upload Aadhaar back side");
      if (!aadhaarFront && aadhaarBack)
        return toast.error("Please upload Aadhaar front side");
    }

    if (selectedService.requires_gotra && !gotra.trim())
      return toast.error("Gotra is required for this seva");
    if (selectedService.slot_required && !selectedSlot)
      return toast.error("Please select a time slot");

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("service_id", selectedService.service_id);
      if (selectedPackage?.package_id)
        fd.append("package_id", selectedPackage.package_id);
      if (selectedSlot?.slot_id) fd.append("slot_id", selectedSlot.slot_id);
      fd.append("perform_date", performDate);
      fd.append("devotee_name", devoteeName.trim());
      fd.append("devotee_mobile", devoteePhone.trim());
      if (devoteeEmail.trim())
        fd.append("devotee_email", devoteeEmail.trim());
      if (address.trim()) fd.append("address", address.trim());
      if (gotra.trim()) fd.append("gotra", gotra.trim());
      if (remarks.trim()) fd.append("remarks", remarks.trim());

      if (aadhaarFront) fd.append("aadhaar_front", aadhaarFront);
      if (aadhaarBack) fd.append("aadhaar_back", aadhaarBack);
      Object.entries(extraDocs).forEach(([code, file]) => {
        if (file) fd.append(`document_${code}`, file);
      });
      fd.append("pay_now", "1");
      fd.append("payment_mode_id", payMode);
      if (paymentRef.trim()) fd.append("payment_ref", paymentRef.trim());

      const res = await axios.post(`${base}/portal/seva/bookings`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        toast.success(
          res.data.paid
            ? "Booking confirmed! Payment recorded."
            : "Booking created. Please complete payment."
        );
        resetForm();
        loadMyBookings();
        // Daily limit counter turant update ho - catalogue refresh
        loadCatalogue(true);
        setView("mybookings");
      } else {
        toast.error(res.data?.message || "Booking failed");
      }
    } catch (e) {
      const errs = e.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(", ")
        : e.response?.data?.message;
      toast.error(errs || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (booking) => {
    const amt = Number(payAmount || booking.balance_amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    if (!payMode) return toast.error("Select payment mode");
    try {
      setPaying(true);
      const res = await axios.post(
        `${base}/portal/seva/bookings/${booking.booking_id}/pay`,
        { amount: amt, payment_mode_id: Number(payMode) },
        { headers }
      );
      if (res.data?.success) {
        toast.success("Payment recorded");
        setActiveBooking(null);
        loadMyBookings();
      } else {
        toast.error(res.data?.message || "Payment failed");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const statusStyle = (s) =>
  ({
    PENDING_PAYMENT: "bg-amber-100 text-amber-700",
    PENDING_APPROVAL: "bg-blue-100 text-blue-700",
    QUERY_RAISED: "bg-amber-100 text-amber-700",
    APPROVED: "bg-cyan-100 text-cyan-700",
    SCHEDULED: "bg-indigo-100 text-indigo-700",
    PERFORMED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-200 text-gray-600",
    REJECTED: "bg-red-100 text-red-700",
  }[s] || "bg-gray-100 text-gray-700");

  const money = (n) =>
    Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50/40">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/40">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-20 border-b border-red-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/ambajilogo.png"
              alt="Ambaji Temple"
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight text-gray-900">
                Ambaji Temple
              </p>
              <p className="text-[11px] leading-tight text-gray-500">
                Seva / Pooja Booking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">
                {devoteeName || "Devotee"}
              </p>
              <p className="text-xs text-gray-500">{devoteePhone}</p>
            </div>
            <button
              onClick={() => setView("mybookings")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${view === "mybookings"
                ? "bg-red-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Receipt className="h-4 w-4" /> My Bookings
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* ================= CATALOGUE ================= */}
        {view === "catalogue" && (
          <>
            <div
              className="relative overflow-hidden rounded-2xl px-6 py-7 text-white shadow-md sm:px-8"
              style={{
                background:
                  "linear-gradient(120deg,#B71C1C 0%,#E53935 55%,#F5B800 140%)",
              }}
            >
              <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/10" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  Book a Seva / Pooja
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-white/85">
                  Choose a seva, pick a date and slot, share your details and pay
                  in one go. Your receipt is generated instantly.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative lg:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search seva, puja, yagna..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </div>

              {/* Daily limit kis date ka dikhana hai */}
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <Calendar className="h-4 w-4 shrink-0 text-red-500" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">
                    Daily limit for
                  </p>
                  <input
                    type="date"
                    value={quotaDate}
<<<<<<< HEAD
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => {
=======
                    min={localDate()}
                    onChange={(e) => {
                      setDateIsAuto(false);
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
                      setQuotaDate(e.target.value);
                      setPerformDate(e.target.value);
                    }}
                    className="w-full border-0 p-0 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-0"
                  />
                </div>
<<<<<<< HEAD
                <span
                  className="ml-1 inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
                  title="Live - updates every 20 seconds"
                />
=======
                {dateIsAuto && (
                  <span
                    className="ml-1 inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
                    title="Live - updates every 20 seconds"
                  />
                )}
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCat("ALL")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${activeCat === "ALL"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"
                    }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.category_id}
                    onClick={() => setActiveCat(c.category_id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${activeCat == c.category_id
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"
                      }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredServices.map((svc) => {
                const meta = KIND_META[svc.service_kind] || {
                  label: svc.service_kind,
                  cls: "bg-gray-100 text-gray-700",
                  Icon: Sparkles,
                };
                const KindIcon = meta.Icon;
                const pkgCount = svc.packages?.length || 0;

                return (
                  <div
                    key={svc.service_id}
                    className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-amber-50 text-red-600">
                        <KindIcon className="h-5 w-5" />
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                        {svc.needs_approval && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
                            Approval
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-gray-900">
                      {svc.name}
                    </h3>
                    {svc.category && (
                      <p className="mt-0.5 text-xs font-medium text-red-600">
                        {svc.category.name}
                      </p>
                    )}
                    <p className="mt-1.5 line-clamp-2 min-h-[2.2rem] text-xs leading-relaxed text-gray-500">
                      {svc.short_description ||
                        "Performed at Ambaji Temple with traditional rituals."}
                    </p>

                    <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {svc.max_persons || 1} person
                        {svc.max_persons > 1 ? "s" : ""} per booking
                      </div>
                      {pkgCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-gray-400" />
                          {pkgCount} package{pkgCount > 1 ? "s" : ""}
                        </div>
                      )}
                      {svc.slot_required && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          Time slots required
                        </div>
                      )}
                      {svc.duration_minutes > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {svc.duration_minutes} min pooja duration
                        </div>
                      )}
                    </div>

                    {/* Daily quota status - LIVE */}
                    {!svc.is_quota_unlimited && (
                      <div
<<<<<<< HEAD
                        className={`mt-3 flex items-center justify-between rounded-lg px-2.5 py-2 text-[11px] font-medium ${svc.is_quota_full
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700"
                          }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          Daily limit
                          <span
                            className="ml-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
                            title="Live - updates every 20 seconds"
                          />
                        </span>
                        <span>
                          {svc.is_quota_full
                            ? `Full (${svc.daily_quota}/${svc.daily_quota} booked)`
                            : `${svc.quota_remaining} of ${svc.daily_quota} left on ${fmtDate(svc.quota_date)}`}
                        </span>
=======
                        className={`mt-3 rounded-lg px-2.5 py-2 text-[11px] font-medium ${
                          svc.is_quota_full
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            Daily limit
                          </span>
                          <span className="whitespace-nowrap text-[10px] font-normal opacity-70">
                            {svc.quota_date ? fmtDate(svc.quota_date) : ""}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12px] font-semibold">
                          {svc.is_quota_full
                            ? `Full - ${svc.daily_quota}/${svc.daily_quota} booked`
                            : `${svc.quota_remaining} of ${svc.daily_quota} left`}
                        </p>
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
                      </div>
                    )}

                    <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          Starts at
                        </p>
                        <p className="text-lg font-bold text-red-600">
                          Rs. {money(svc.current_fee)}
                        </p>
                      </div>
                      {svc.is_quota_full ? (
                        <button
                          disabled
                          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-500"
                        >
                          Daily limit reached
                        </button>
                      ) : (
                        <button
                          onClick={() => selectService(svc)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          Book Now <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredServices.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                <Sparkles className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-600">
                  No seva found
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Try a different search or category.
                </p>
              </div>
            )}
          </>
        )}

        {/* ================= BOOKING FORM ================= */}
        {view === "booking" && selectedService && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <button
                onClick={() => setView("catalogue")}
                className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600"
              >
                <ChevronLeft className="h-4 w-4" /> Back to catalogue
              </button>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-amber-50 text-red-600">
                    {(() => {
                      const M = KIND_META[selectedService.service_kind];
                      const I = M?.Icon || Sparkles;
                      return <I className="h-5 w-5" />;
                    })()}
                  </span>
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold text-gray-900">
                      {selectedService.name}
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {selectedService.short_description ||
                        "Performed at Ambaji Temple"}
                    </p>
                    {selectedService.category && (
                      <p className="mt-0.5 text-xs font-medium text-red-600">
                        {selectedService.category.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* STEP 1 */}
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <StepTitle n={1} title="Choose date, slot and package" />
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Perform date
                    </label>
                    <input
                      type="date"
                      value={performDate}
<<<<<<< HEAD
                      min={new Date().toISOString().slice(0, 10)}
=======
                      min={localDate()}
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
                      onChange={(e) => {
                        setPerformDate(e.target.value);
                        loadSlots(
                          selectedService,
                          e.target.value,
                          selectedPackage?.package_id
                        );
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 sm:w-64"
                    />
                  </div>

                  {selectedService.slot_required && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                        Time slot
                      </label>
                      {slots.length === 0 ? (
                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          No slots available for this date. Please pick another
                          date.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {slots.map((sl) => (
                            <button
                              key={sl.slot_id}
                              type="button"
                              disabled={!sl.available}
                              onClick={() => setSelectedSlot(sl)}
                              className={`rounded-xl border px-3 py-2.5 text-left transition ${selectedSlot?.slot_id === sl.slot_id
                                ? "border-red-600 bg-red-50 ring-2 ring-red-100"
                                : sl.available
                                  ? "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/40"
                                  : "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                                }`}
                            >
                              <p className="text-sm font-bold text-gray-900">
                                {sl.start_time}
                              </p>
                              {sl.label && (
                                <p className="text-[10px] text-gray-500">
                                  {sl.label}
                                </p>
                              )}
                              {sl.capacity > 0 && (
                                <p className="mt-0.5 text-[10px] font-medium text-emerald-600">
                                  {sl.capacity - sl.booked} seats left
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedService.packages?.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                        Package
                      </label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {selectedService.packages.map((pkg) => (
                          <button
                            key={pkg.package_id}
                            type="button"
                            onClick={() => selectPackage(pkg)}
                            className={`rounded-xl border px-3.5 py-3 text-left transition ${selectedPackage?.package_id === pkg.package_id
                              ? "border-red-600 bg-red-50 ring-2 ring-red-100"
                              : "border-gray-200 bg-white hover:border-red-300"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-gray-900">
                                {pkg.name}
                              </p>
                              <p className="text-sm font-bold text-red-600">
                                Rs. {money(pkg.fee)}
                              </p>
                            </div>
                            {pkg.description && (
                              <p className="mt-0.5 text-[11px] text-gray-500">
                                {pkg.description}
                              </p>
                            )}
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-medium text-gray-600">
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                                <Users className="h-3 w-3" />
                                {pkg.persons_per_booking ?? pkg.max_persons ?? 1}{" "}
                                person
                                {(pkg.persons_per_booking ?? pkg.max_persons ?? 1) > 1
                                  ? "s"
                                  : ""}{" "}
                                per booking
                              </span>
                              {pkg.duration_minutes > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                                  <Clock className="h-3 w-3" />
                                  {pkg.duration_minutes} min pooja
                                </span>
                              )}
                            </div>
                            {(pkg.included_list || []).length > 0 && (
                              <ul className="mt-1.5 space-y-0.5">
                                {(pkg.included_list || []).map((inc, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-1.5 text-[11px] text-gray-600"
                                  >
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                                    <span>{inc}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Daily quota status for selected date */}
                  {quota && !quota.unlimited && (
                    <div
                      className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium ${quota.is_full
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          Daily limit for {performDate}
                        </span>
                        <span>
                          {quota.is_full
                            ? `Full (${quota.used}/${quota.limit} booked)`
                            : `${quota.remaining} of ${quota.limit} places left`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* GROUP & SERVED PERSONS - sab PACKAGE se decide */}
                  <div className="rounded-xl border border-gray-200 bg-white p-3.5">
                    <p className="mb-2 text-xs font-semibold text-gray-700">
                      Your group
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-gray-500">
                          Persons in your group
                        </p>
                        <p className="mt-0.5 text-lg font-bold text-gray-900">
                          {groupSize}
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-emerald-700">
                          Served under the temple
                        </p>
                        <p className="mt-0.5 text-lg font-bold text-emerald-800">
                          {personsServed}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-gray-600">
                      This package is for a group of{" "}
                      <strong>{groupSize}</strong> person
                      {groupSize > 1 ? "s" : ""}. Out of them{" "}
                      <strong>{personsServed}</strong> will be served under the
                      temple.
                    </p>
                    {quota && !quota.unlimited && (
                      <p
                        className={`mt-2 rounded-lg px-2 py-1.5 text-[11px] font-medium ${quota.remaining < personsServed
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-800"
                          }`}
                      >
                        {quota.remaining < personsServed
                          ? `Only ${quota.remaining} place${quota.remaining === 1 ? "" : "s"
                          } left — this booking is not possible right now.`
                          : `${personsServed} place${personsServed > 1 ? "s" : ""
                          } will be reserved (out of ${quota.remaining
                          } available).`}
                      </p>
                    )}
                  </div>

                  {/* WHAT'S INCLUDED - package bullets */}
                  {(selectedPackage?.included_list || []).length > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                      <p className="mb-1.5 text-xs font-semibold text-emerald-900">
                        What's included
                      </p>
                      <ul className="space-y-1">
                        {selectedPackage.included_list.map((inc, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[12px] text-emerald-900"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>

              {/* STEP 2 */}
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <StepTitle n={2} title="Your details" />
                <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    required
                    icon={User}
                    value={devoteeName}
                    onChange={(v) => setDevoteeName(v)}
                    placeholder="Your name"
                  />
                  <Field
                    label="Mobile number"
                    required
                    icon={Phone}
                    value={devoteePhone}
                    onChange={(v) => setDevoteePhone(v)}
                    placeholder="10-digit mobile"
                  />
                  <Field
                    label="Email"
                    icon={Mail}
                    value={devoteeEmail}
                    onChange={(v) => setDevoteeEmail(v)}
                    placeholder="your@email.com"
                  />
                  <Field
                    label="Gotra"
                    required={!!selectedService.requires_gotra}
                    value={gotra}
                    onChange={(v) => setGotra(v)}
                    placeholder="Your gotra / family name"
                  />
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Full address with city, district and PIN code"
                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Remarks (optional)
                    </label>
                    <input
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Anything else we should know"
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
                <StepTitle n={3} title="Upload required documents" />
                {requiredDocs.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {requiredDocs.map((doc) => {
                      return (
                        <div key={doc.document_id}>
                          {doc.code === "AADHAAR_FRONT" && (
                            <FileDrop
                              label="Aadhaar Front side"
                              required
                              file={aadhaarFront}
                              onChange={setAadhaarFront}
                            />
                          )}
                          {doc.code === "AADHAAR_BACK" && (
                            <FileDrop
                              label="Aadhaar Back side"
                              required
                              file={aadhaarBack}
                              onChange={setAadhaarBack}
                            />
                          )}
                          {doc.code !== "AADHAAR_FRONT" &&
                            doc.code !== "AADHAAR_BACK" && (
                              <FileDrop
                                label={doc.name}
                                required={doc.is_required}
                                file={extraDocs[doc.code] || null}
                                onChange={(file) =>
                                  setExtraDocs((p) => ({ ...p, [doc.code]: file }))
                                }
                              />
                            )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs text-amber-800">
                    No documents are required for this seva.
                  </p>
                )}
                <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  JPG / PNG / PDF, max 5MB each. Dono side ki copy upload karein.
                </p>
              </div>

              {/* STEP 4 */}
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
                <StepTitle n={4} title="Payment" />
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    How would you like to pay? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {paymentModes.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPayMode(String(m.id))}
                        className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition ${payMode === String(m.id)
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                          : "border-gray-200 bg-white text-gray-700 hover:border-emerald-400"
                          }`}
                      >
                        {m.is_cash ? (
                          <IndianRupee className="h-4 w-4" />
                        ) : m.is_digital ? (
                          <Receipt className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        {m.name}
                      </button>
                    ))}
                  </div>
                  {paymentModes.length === 0 && (
                    <p className="text-xs text-gray-500">
                      Loading payment modes...
                    </p>
                  )}
                </div>

                {payMode && (
                  <div className="mt-3.5">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Payment reference / transaction no
                    </label>
                    <input
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="UPI ref / cheque no (optional for cash)"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                )}
              </div>

              <div className="h-4" />
            </div>

            {/* ---- STICKY SUMMARY ---- */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-900">Order Summary</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {selectedService.name}
                    {selectedPackage ? ` - ${selectedPackage.name}` : ""}
                  </p>

                  <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Base fee</dt>
                      <dd className="font-semibold text-gray-900">
                        Rs. {money(pricePreview?.fee ?? selectedService.current_fee)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Tax</dt>
                      <dd className="font-semibold text-gray-900">
                        Rs. {money(pricePreview?.tax)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                      <dt className="font-bold text-gray-900">Total</dt>
                      <dd className="font-bold text-red-600">
                        Rs. {money(pricePreview?.total ?? selectedService.current_fee)}
                      </dd>
                    </div>
                  </dl>

                  {selectedSlot?.tenure_text && (
                    <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                        Your seva tenure
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-gray-900">
                        {selectedSlot.tenure_text}
                      </p>
                    </div>
                  )}

                  {(selectedPackage?.included_list || []).length > 0 && (
                    <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        What's included
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {selectedPackage.included_list.map((inc, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[11px] text-gray-700"
                          >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-3 flex justify-between rounded-xl bg-gray-50 px-3 py-2.5 text-xs">
                    <span className="text-gray-600">Persons in your group</span>
                    <span className="font-semibold text-gray-900">
                      {groupSize}
                    </span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-gray-50 px-3 py-2.5 text-xs mt-2">
                    <span className="text-gray-600">Served under the temple</span>
                    <span className="font-semibold text-gray-900">
                      {personsServed}
                    </span>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={submitting || quota?.is_full}
                    className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                  >
                    {submitting
                      ? "Processing..."
                      : quota?.is_full
                        ? "Daily limit reached - booking unavailable"
                        : `Pay Now - Rs. ${money(
                          pricePreview?.total ?? selectedService.current_fee
                        )}`}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-gray-500">
                    Booking and payment are confirmed together. Receipt is
                    generated instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MY BOOKINGS ================= */}
        {view === "mybookings" && (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-sm text-gray-500">
                  Your seva bookings, payments and receipts
                </p>
              </div>
              <button
                onClick={() => setView("catalogue")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <Sparkles className="h-4 w-4" /> Book New Seva
              </button>
            </div>

            {myBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                <CalendarCheck className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-600">
                  No bookings yet
                </p>
                <button
                  onClick={() => setView("catalogue")}
                  className="mt-3 text-sm font-semibold text-red-600 hover:underline"
                >
                  Browse seva services
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {myBookings.map((b) => (
                  <div
                    key={b.booking_id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-gray-900">
                          {b.service?.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-gray-500">
                          {b.receipt_no}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(
                          b.status
                        )}`}
                      >
                        {b.status?.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <p className="text-gray-400">Perform date</p>
                        <p className="font-semibold text-gray-900">
                          {b.perform_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Persons</p>
                        <p className="font-semibold text-gray-900">{b.persons}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total</p>
                        <p className="font-semibold text-gray-900">
                          Rs. {money(b.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payment</p>
                        <p
                          className={`font-semibold ${b.payment_status === "PAID"
                            ? "text-emerald-600"
                            : "text-amber-600"
                            }`}
                        >
                          {b.payment_status}
                        </p>
                      </div>
                    </div>

                    {/* QUERY - devotee se clarification maangi gayi */}
                    {b.status === "QUERY_RAISED" && (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                        <p className="text-xs font-semibold text-amber-800">
                          Query from the temple
                        </p>
                        {b.remarks && (
                          <p className="mt-1 text-[12px] leading-relaxed text-amber-900">
                            {b.remarks}
                          </p>
                        )}
                        <div className="mt-2.5">
                          <textarea
                            rows={2}
                            value={queryResponses[b.booking_id] || ""}
                            onChange={(e) =>
                              setQueryResponses((p) => ({
                                ...p,
                                [b.booking_id]: e.target.value,
                              }))
                            }
                            placeholder="Type your clarification / response"
                            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-100"
                          />
                          <button
                            onClick={() => handleRespondQuery(b)}
                            disabled={
                              submitting ||
                              !(queryResponses[b.booking_id] || "").trim()
                            }
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Submit Response
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                      <a
                        href={`${base}/portal/seva/bookings/${b.booking_id}/receipt`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Receipt className="h-3.5 w-3.5" /> Receipt
                      </a>

                      {b.status === "PENDING_PAYMENT" && (
                        <button
                          onClick={() => {
                            setActiveBooking(b);
                            setPayAmount(b.balance_amount);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                        >
                          <IndianRupee className="h-3.5 w-3.5" /> Pay Rs.{" "}
                          {money(b.balance_amount)}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeBooking && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">
                      Pay for {activeBooking.service?.name}
                    </h3>
                    <button
                      onClick={() => setActiveBooking(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                        Payment mode
                      </label>
                      <select
                        value={payMode}
                        onChange={(e) => setPayMode(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">Select mode</option>
                        {paymentModes.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => handlePay(activeBooking)}
                      disabled={paying}
                      className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {paying ? "Processing..." : "Pay Now"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

/* ---------- small presentational helpers ---------- */

const StepTitle = ({ n, title }) => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
      {n}
    </span>
    <h2 className="text-sm font-bold text-gray-900">{title}</h2>
  </div>
);

const Field = ({ label, value, onChange, placeholder, required, icon: Icon }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e && e.target ? e.target.value : e)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-gray-200 py-2.5 pr-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 ${Icon ? "pl-9" : "pl-3.5"
          }`}
      />
    </div>
  </div>
);

const FileDrop = ({ label, required, file, onChange }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition ${file
        ? "border-emerald-400 bg-emerald-50"
        : "border-gray-300 bg-white hover:border-amber-400 hover:bg-amber-50/50"
        }`}
    >
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;

          if (f) {
            const allowed = ["image/jpeg", "image/png", "application/pdf"];

            if (!allowed.includes(f.type)) {
              toast.error("Only JPG, PNG or PDF file is allowed");
              e.target.value = "";
              return;
            }

            if (f.size > 5 * 1024 * 1024) {
              toast.error("File size must be less than 5 MB");
              e.target.value = "";
              return;
            }
          }

          onChange(f);
        }}
      />
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${file ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-700"
          }`}
      >
        {file ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-gray-800">
          {file ? file.name : `Tap to upload ${label.toLowerCase()}`}
        </span>
        <span className="block text-[10px] text-gray-500">
          {file
            ? `${(file.size / 1024).toFixed(0)} KB - click to change`
            : "JPG / PNG / PDF, max 5MB"}
        </span>
      </span>
    </label>
  </div>
);

export default SevaPortal;