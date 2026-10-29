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
  Plus,
  Trash2,
} from "lucide-react";
import BackButton from "../components/backbutton";

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

  const [view, setView] = useState("catalogue");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("ALL");
  const [activeMode, setActiveMode] = useState("ALL");
  const [coDonorText, setCoDonorText] = useState("");
  const coDonorRows = coDonorText.split("\n");
  const [donationAmount, setDonationAmount] = useState("");

  const [selectedService, setSelectedService] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [performDate, setPerformDate] = useState(() =>
    localDate(addDays(new Date(), 1))
  );
  // Catalogue ka daily limit kis date ka dikhana hai.
  // Default = SERVER ka aaj (browser timezone se mismatch na ho) -
  // isliye pehle khali bhejte hain, server quota_date bhejta hai.
  const [quotaDate, setQuotaDate] = useState("");
  // User ne khud date change ki hai ya nahi (auto rollover band karne ke liye)
  const [dateIsAuto, setDateIsAuto] = useState(true);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [quota, setQuota] = useState(null);
  const [groupSize, setGroupSize] = useState(1);
  const [packageLimit, setPackageLimit] = useState(null);
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
  const [bookingServiceFilter, setBookingServiceFilter] = useState("ALL");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [bookingSearch, setBookingSearch] = useState("");
  const [queryResponses, setQueryResponses] = useState({});
  const [activeBooking, setActiveBooking] = useState(null);
  const [paying, setPaying] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayBusy, setRazorpayBusy] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  useEffect(() => {
    loadCatalogue();
    loadMyBookings();
    loadPaymentModes();
    axios.get(`${base}/portal/seva/payment-config`, { headers })
      .then((res) => setRazorpayKeyId(res.data?.data?.enabled ? (res.data.data.key_id || "") : ""))
      .catch(() => setRazorpayKeyId(""));
  }, []);

  const loadCatalogue = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

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
   * Catalogue har 20 second me silently re-fetch hota hai - isse "X of Y left"
   * counter live update hota hai (kisi ke booking karte hi).
   * Din change hone par (midnight rollover) server naya date deta hai aur
   * counter naye din ka data dikhata hai.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) {
        return; // tab background me hai - zaroorat nahi
      }

      loadCatalogue(true);
    }, 20000);

    return () => clearInterval(timer);
  }, [dateIsAuto, quotaDate]);

  // Live refresh of the selected date's slots (per-slot remaining places).
  useEffect(() => {
    if (view !== "booking" || !selectedService || !selectedPackage) return undefined;

    const timer = setInterval(() => {
      if (document.hidden) return;
      loadSlots(selectedService, performDate, selectedPackage.package_id);
    }, 20000);

    return () => clearInterval(timer);
  }, [view, selectedService, selectedPackage?.package_id, performDate]);

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
    if (svc.service_mode === "TITHI_BHOJAN") {
      const pkg = (svc.packages || []).find((item) => String(item.package_id) === String(pkgId));
      if (!pkg?.effective_from || !pkg?.effective_to || !(pkg?.slot_times || []).length
        || date < pkg.effective_from || date > pkg.effective_to) {
        setSlots([]);
        setQuota(null);
        setPackageLimit(null);
        return;
      }
    }
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
        const freshSlots = res.data.data.slots || [];
        setSlots(freshSlots);
        setQuota(res.data.data.quota || null);
        setPackageLimit(res.data.data.package_limit || null);
        // Selected slot ki remaining places bhi live update karo.
        setSelectedSlot((cur) => (cur ? freshSlots.find((s) => s.slot_id === cur.slot_id) || cur : cur));
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load slots");
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const byCat = activeCat === "ALL" || s.category_id == activeCat;
      const byMode = activeMode === "ALL" || s.service_mode === activeMode;
      const byText = `${s.name} ${s.code} ${s.service_kind} ${
        s.short_description || ""
      } ${s.category?.name || ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      return byCat && byMode && byText;
    });
  }, [services, activeCat, activeMode, query]);

  // ---- My Bookings filters (service / status / search) ----
  const bookingServiceOptions = useMemo(() => {
    const map = new Map();
    myBookings.forEach((b) => {
      if (b.service?.service_id) map.set(String(b.service.service_id), b.service.name);
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [myBookings]);

  const visibleMyBookings = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase();
    return myBookings.filter((b) => {
      const byService = bookingServiceFilter === "ALL"
        || String(b.service?.service_id) === String(bookingServiceFilter);
      const byStatus = bookingStatusFilter === "ALL" || b.status === bookingStatusFilter;
      const byText = !q
        || `${b.receipt_no || ""} ${b.service?.name || ""} ${b.devotee_name || ""}`.toLowerCase().includes(q);
      return byService && byStatus && byText;
    });
  }, [myBookings, bookingServiceFilter, bookingStatusFilter, bookingSearch]);

  const BOOKING_STATUS_OPTIONS = [
    "PENDING_PAYMENT", "PENDING_APPROVAL", "QUERY_RAISED", "APPROVED", "SCHEDULED",
    "PERFORMED", "COMPLETED", "CANCELLED", "REJECTED", "REFUNDED",
  ];

  const dateForPackage = (pkg, currentDate) => {
    const today = localDate();
    const minDate = pkg?.effective_from && pkg.effective_from > today ? pkg.effective_from : today;
    if (currentDate < minDate) return minDate;
    if (pkg?.effective_to && currentDate > pkg.effective_to) return pkg.effective_to;
    return currentDate;
  };

  const formatBookingDate = (value) => value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN")
    : "Not configured";

  const selectService = (svc) => {
    const firstPkg = svc.packages?.[0] || null;
    const nextDate = dateForPackage(firstPkg, performDate);
    setSelectedService(svc);
    setSelectedPackage(firstPkg);
    setPerformDate(nextDate);
    setSelectedSlot(null);
    setSlots([]);
    setPackageLimit(null);
    setPricePreview(null);
    setDonationAmount("");
    setCoDonorText("");
    setPayMode("");
    // Tithi Bhojan: devotee chooses the people count (no group concept).
    setGroupSize(
      svc?.service_mode === "TITHI_BHOJAN"
        ? 1
        : Math.max(1, Number(firstPkg?.persons_per_booking ?? 1) || 1)
    );
    loadSlots(svc, nextDate, firstPkg?.package_id);
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

  // Persons actually served = GROUP size (alag "Persons Served" field nahi)
  const personsServed = selectedService?.service_mode === "TITHI_BHOJAN" ? groupSize : maxGroupSize;
  const tithiPackageNeedsSetup = selectedService?.service_mode === "TITHI_BHOJAN"
    && (!selectedPackage?.effective_from || !selectedPackage?.effective_to || !(selectedPackage?.slot_times || []).length);

  // Package total person-limit (live from the slots response, else catalogue).
  // Unlimited / no limit => null, so nothing is enforced or shown.
  const limitInfo = useMemo(() => {
    const info = packageLimit || (() => {
      const p = selectedPackage;
      if (!p || !p.person_limit) return null;
      const limit = Number(p.person_limit);
      const used = Number(p.limit_used ?? 0);
      const remaining = Math.max(0, limit - used);
      return { limit, used, remaining, unlimited: false, is_full: remaining <= 0 };
    })();

    if (!info || info.unlimited || !info.limit) return null;

    return info;
  }, [packageLimit, selectedPackage]);

  // Group size = package ka group size (client input NAHI - sab package se)
  useEffect(() => {
    if (selectedService?.service_mode !== "TITHI_BHOJAN") setGroupSize(maxGroupSize);
  }, [maxGroupSize, selectedService?.service_mode]);

  // Package change -> group size + slots (dynamic pattern) refresh
  const selectPackage = (pkg) => {
    const nextDate = dateForPackage(pkg, performDate);
    setSelectedPackage(pkg);
    setPerformDate(nextDate);
    setDonationAmount("");
    setGroupSize(
      selectedService?.service_mode === "TITHI_BHOJAN"
        ? 1
        : Math.max(1, Number(pkg?.persons_per_booking ?? 1) || 1)
    );
    setSelectedSlot(null);

    if (selectedService) {
      loadSlots(selectedService, nextDate, pkg?.package_id);
    }
  };
  const fetchPricePreview = async () => {
    if (!selectedService) return;
    if (selectedService.service_mode === "TITHI_BHOJAN"
      && (!selectedPackage?.effective_from || !selectedPackage?.effective_to || !(selectedPackage?.slot_times || []).length)) {
      setPricePreview(null);
      return;
    }
    try {
      const res = await axios.post(
        `${base}/portal/seva/price-preview`,
        {
          service_id: selectedService.service_id,
          persons: selectedService.service_mode === "TITHI_BHOJAN" ? groupSize : undefined,
          donation_amount: selectedPackage?.pricing_mode === "DONATION" && donationAmount ? Number(donationAmount) : undefined,
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
  }, [selectedService, selectedPackage, selectedSlot, performDate, groupSize, donationAmount]);

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
    const paymentManagedAtTemple = ["ANNASHETRA_DONATION", "TITHI_BHOJAN"].includes(selectedService.service_mode);

    if (tithiPackageNeedsSetup) return toast.error("This Tithi Bhojan package needs start/end dates and meal slots from the admin before booking.");
    if (selectedService.service_mode === "TITHI_BHOJAN" && !selectedSlot) return toast.error("Please select a meal slot.");
    if (selectedSlot?.closed) return toast.error("This meal slot has closed for today. Please pick another slot or date.");
    if (limitInfo && (limitInfo.is_full || limitInfo.remaining < groupSize)) {
      return toast.error(
        limitInfo.is_full
          ? "This package is fully booked. Please pick another package or date."
          : `Only ${limitInfo.remaining} places left in this package.`
      );
    }
    if (selectedSlot?.limit && (selectedSlot.is_full || selectedSlot.remaining < groupSize)) {
      return toast.error(
        selectedSlot.is_full
          ? "This slot is full. Please pick another slot."
          : `Only ${selectedSlot.remaining} places left in this slot.`
      );
    }
    if (paymentManagedAtTemple && !razorpayKeyId) return toast.error("Razorpay is not configured yet. Please try again after online payment setup is complete.");

    if (!devoteeName.trim()) return toast.error("Please enter your name");
    if (!devoteePhone.trim())
      return toast.error("Please enter your mobile number");
    if (!address.trim()) return toast.error("Please enter your address");
    if (!paymentManagedAtTemple && !payMode) return toast.error("Select payment option (Cash or Online)");

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
        if ((selectedService.slot_required || selectedService.service_mode === "TITHI_BHOJAN") && !selectedSlot)
      return toast.error("Please select a time slot");

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("service_id", selectedService.service_id);
      if (selectedPackage?.package_id)
        fd.append("package_id", selectedPackage.package_id);
      if (selectedSlot?.slot_id) fd.append("slot_id", selectedSlot.slot_id);
      fd.append("perform_date", selectedService.service_mode === "ANNASHETRA_DONATION" ? localDate() : performDate);
      if (selectedService.service_mode === "TITHI_BHOJAN") fd.append("persons", String(groupSize));
      if (selectedService.service_mode === "ANNASHETRA_DONATION") {
        coDonorText.split(/[,\n]/).map((name) => name.trim()).filter(Boolean).forEach((name) => fd.append("co_donors[]", name));
      }
      if (selectedPackage?.pricing_mode === "DONATION") fd.append("donation_amount", String(Number(donationAmount || selectedPackage.min_amount || 0)));
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
      if (!paymentManagedAtTemple) {
        fd.append("pay_now", "1");
        fd.append("payment_mode_id", payMode);
        if (paymentRef.trim()) fd.append("payment_ref", paymentRef.trim());
      }

      const res = await axios.post(`${base}/portal/seva/bookings`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        resetForm();
        await loadMyBookings();
        // Daily limit counter turant update ho - catalogue refresh
        loadCatalogue(true);
        setView("mybookings");
        if (paymentManagedAtTemple) {
          toast.success("Booking created. Opening secure payment checkout…");
          await startRazorpayPayment(res.data.data);
        } else {
          toast.success(res.data.paid ? "Booking confirmed! Payment recorded." : res.data.message || "Booking created. Please complete payment.");
        }
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

  const startRazorpayPayment = async (booking) => {
    if (!razorpayKeyId) return toast.error("Online payment is not configured yet.");
    try {
      setRazorpayBusy(booking.booking_id);
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Could not load the secure Razorpay checkout."));
          document.body.appendChild(script);
        });
      }
      const orderRes = await axios.post(`${base}/portal/seva/bookings/${booking.booking_id}/payment-order`, {}, { headers });
      const order = orderRes.data?.data;
      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        order_id: order.order_id,
        prefill: order.prefill,
        theme: { color: "#0f766e" },
        handler: async (result) => {
          try {
            const paid = await axios.post(`${base}/portal/seva/bookings/${booking.booking_id}/pay`, {
              amount: order.amount / 100,
              payment_mode_id: null,
              gateway: "RAZORPAY",
              gateway_order_id: result.razorpay_order_id,
              gateway_payment_id: result.razorpay_payment_id,
              gateway_signature: result.razorpay_signature,
            }, { headers });
            toast.success(paid.data?.message || "Payment successful. Booking updated.");
            await loadMyBookings();
          } catch (e) {
            toast.error(e.response?.data?.message || "Payment received; verification is pending. Refresh My Bookings shortly.");
          } finally {
            setRazorpayBusy(null);
          }
        },
        modal: { ondismiss: () => setRazorpayBusy(null) },
      });
      checkout.on("payment.failed", (event) => {
        toast.error(event.error?.description || "Razorpay payment failed.");
        setRazorpayBusy(null);
      });
      checkout.open();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Could not start Razorpay checkout.");
      setRazorpayBusy(null);
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
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                view === "mybookings"
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

      <main className="w-full px-4 py-6 sm:px-6">
        {/* ================= CATALOGUE ================= */}
        {view === "catalogue" && (
          <>
            <div className="mb-4">
              <BackButton
                to={user?.isApplicant ? "/applicant-dashboard" : "/devotee-dashboard"}
                label="Back to dashboard"
              />
            </div>
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
                    min={localDate()}
                    onChange={(e) => {
                      setDateIsAuto(false);
                      setQuotaDate(e.target.value);
                      setPerformDate(e.target.value);
                    }}
                    className="w-full border-0 p-0 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-0"
                  />
                </div>
                {dateIsAuto && (
                  <span
                    className="ml-1 inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
                    title="Live - updates every 20 seconds"
                  />
                )}
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {[['ALL', 'All services'], ['ANNASHETRA_DONATION', 'Annakshetra Donation'], ['TITHI_BHOJAN', 'Tithi Bhojan']].map(([mode, label]) => <button key={mode} onClick={() => setActiveMode(mode)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${activeMode === mode ? 'bg-teal-700 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200'}`}>{label}</button>)}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCat("ALL")}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    activeCat === "ALL"
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
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      activeCat == c.category_id
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
                    </div>

                    {/* Daily quota status - LIVE */}
                    {!svc.is_quota_unlimited && (
                      <div
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
              <div className="mb-4">
                <BackButton
                  onClick={() => setView("catalogue")}
                  label="Back to catalogue"
                />
              </div>

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
                <StepTitle n={1} title={selectedService.service_mode === "ANNASHETRA_DONATION" ? "Choose donation package" : "Choose date, slot and package"} />
                <div className="mt-4 space-y-4">
                  {selectedService.service_mode !== "ANNASHETRA_DONATION" && <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Perform date
                    </label>
                    <input
                      type="date"
                      value={performDate}
                      min={selectedPackage?.effective_from && selectedPackage.effective_from > localDate() ? selectedPackage.effective_from : localDate()}
                      max={selectedPackage?.effective_to || undefined}
                      onChange={(e) => {
                        setPerformDate(e.target.value);
                        setSelectedSlot(null);
                        loadSlots(
                          selectedService,
                          e.target.value,
                          selectedPackage?.package_id
                        );
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 sm:w-64"
                    />
                  </div>}

        {(selectedService.slot_required || selectedService.service_mode === "TITHI_BHOJAN") && (
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
                          {slots.map((sl) => {
                            const selectable = sl.available && !sl.closed && !sl.is_full;
                            return (
                              <button
                                key={sl.slot_id}
                                type="button"
                                disabled={!selectable}
                                onClick={() => setSelectedSlot(sl)}
                                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                                  selectedSlot?.slot_id === sl.slot_id
                                    ? "border-red-600 bg-red-50 ring-2 ring-red-100"
                                    : selectable
                                      ? "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/40"
                                      : "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                                }`}
                              >
                                <p className="text-sm font-bold text-gray-900">
                                  {sl.time_text || sl.start_time}
                                </p>
                                {sl.label && (
                                  <p className="text-[10px] text-gray-500">
                                    {sl.label}
                                  </p>
                                )}
                                {sl.closed ? (
                                  <p className="mt-0.5 text-[10px] font-semibold text-gray-500">
                                    Closed for today
                                  </p>
                                ) : sl.is_full ? (
                                  <p className="mt-0.5 text-[10px] font-semibold text-red-600">
                                    Full
                                  </p>
                                ) : sl.limit ? (
                                  <p className="mt-0.5 text-[10px] font-medium text-emerald-600">
                                    {sl.remaining} of {sl.limit} places left
                                  </p>
                                ) : (
                                  <p className="mt-0.5 text-[10px] font-medium text-emerald-600">
                                    Available
                                  </p>
                                )}
                              </button>
                            );
                          })}
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
                            disabled={pkg.is_limit_full}
                            onClick={() => selectPackage(pkg)}
                            className={`rounded-xl border px-3.5 py-3 text-left transition ${
                              pkg.is_limit_full
                                ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                                : selectedPackage?.package_id === pkg.package_id
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
                              {selectedService.service_mode !== "TITHI_BHOJAN" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                                  <Users className="h-3 w-3" />
                                  {pkg.persons_per_booking ?? pkg.max_persons ?? 1}{" "}
                                  person
                                  {(pkg.persons_per_booking ?? pkg.max_persons ?? 1) > 1
                                    ? "s"
                                    : ""}{" "}
                                  per booking
                                </span>
                              )}
                              {pkg.person_limit ? (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${pkg.is_limit_full ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                                  <Users className="h-3 w-3" />
                                  {pkg.is_limit_full ? "Full" : `${pkg.limit_remaining} of ${pkg.person_limit} places left`}
                                </span>
                              ) : null}
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
                      className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
                        quota.is_full
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

                  {selectedService.service_mode === "ANNASHETRA_DONATION" && (
                    <div className="rounded-xl border border-gray-200 bg-white p-3.5">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-700"><span>Co-donors (optional)</span><button type="button" onClick={() => setCoDonorText((value) => `${value}\n`)} className="inline-flex items-center gap-1 rounded-md bg-teal-700 px-2.5 py-1.5 text-white"><Plus className="h-3.5 w-3.5" /> Add co-donor</button></div>
                      <div className="space-y-2">{coDonorRows.map((name, index) => <div key={index} className="flex items-center gap-2"><input value={name} onChange={(e) => { const next = [...coDonorRows]; next[index] = e.target.value; setCoDonorText(next.join("\n")); }} placeholder={`Co-donor ${index + 1} name`} className="w-full rounded-lg border p-2 text-sm font-normal" />{coDonorRows.length > 1 && <button type="button" aria-label="Remove co-donor" onClick={() => setCoDonorText(coDonorRows.filter((_, i) => i !== index).join("\n"))} className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</div>)}</div>
                    </div>
                  )}

                  {/* Tithi Bhojan count is per booking and priced by the server. */}
                  {selectedService.service_mode === "TITHI_BHOJAN" && (
                    <div className="rounded-xl border border-gray-200 bg-white p-3.5">
                      <label className="mb-2 block text-xs font-semibold text-gray-700">Number of people (other than you)</label>
                      <input type="number" min="0" max="10000" value={Math.max(0, groupSize - 1)} onChange={(e) => setGroupSize(Math.max(1, (Number(e.target.value) || 0) + 1))} className="w-full rounded-lg border px-3 py-2" />
                      <p className="mt-1 text-[11px] text-gray-500">
                        Total for this booking: <span className="font-semibold text-gray-800">{groupSize}</span> people (including you).
                      </p>
                      {selectedSlot?.limit ? (
                        <p className={`mt-1 text-[11px] font-semibold ${selectedSlot.is_full ? "text-red-600" : "text-emerald-700"}`}>
                          {selectedSlot.is_full
                            ? `${selectedSlot.label || "This slot"} is full (${selectedSlot.limit} places).`
                            : `${selectedSlot.label || "This slot"}: ${selectedSlot.remaining} of ${selectedSlot.limit} places left.`}
                        </p>
                      ) : null}
                      {limitInfo && !limitInfo.unlimited && (
                        <p className={`mt-1 text-[11px] font-semibold ${limitInfo.is_full ? "text-red-600" : "text-emerald-700"}`}>
                          {limitInfo.is_full
                            ? "Package limit reached — booking closed."
                            : `${limitInfo.remaining} of ${limitInfo.limit} package places left.`}
                        </p>
                      )}
                    </div>
                  )}
                  {tithiPackageNeedsSetup && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">This package is visible but unavailable until admin configures its start date, end date, and at least one meal slot.</p>}

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
              {!['ANNASHETRA_DONATION', 'TITHI_BHOJAN'].includes(selectedService.service_mode) && requiredDocs.length > 0 && (
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
                ) : null}

                <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  JPG / PNG / PDF, max 5MB each. Dono side ki copy upload karein.
                </p>
              </div>
              )}
              {selectedService.service_mode === "ANNASHETRA_DONATION" && selectedPackage?.pricing_mode === "DONATION" && (
                <label className="mt-4 block rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-gray-700">Donation amount (₹)
                  <input required type="number" min={selectedPackage.min_amount || 1} max={selectedPackage.max_amount || undefined} step="0.01" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} className="mt-2 w-full rounded-lg border p-2 text-sm font-normal" />
                  <span className="mt-1 block font-normal text-gray-500">Enter the amount for this donation package.</span>
                </label>
              )}

              {/* STEP 4 */}
              {!["ANNASHETRA_DONATION", "TITHI_BHOJAN"].includes(selectedService.service_mode) ? (
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
                        className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          payMode === String(m.id)
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
              ) : null}

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
                    {!['ANNASHETRA_DONATION', 'TITHI_BHOJAN'].includes(selectedService.service_mode) && <div className="flex justify-between">
                      <dt className="text-gray-500">Tax</dt>
                      <dd className="font-semibold text-gray-900">
                        Rs. {money(pricePreview?.tax)}
                      </dd>
                    </div>}
                    <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                      <dt className="font-bold text-gray-900">Total</dt>
                      <dd className="font-bold text-red-600">
                        Rs. {money(pricePreview?.total ?? selectedService.current_fee)}
                      </dd>
                    </div>
                  </dl>

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

                  {selectedService.service_mode === "TITHI_BHOJAN" && <div className="mt-3 flex justify-between rounded-xl bg-gray-50 px-3 py-2.5 text-xs"><span className="text-gray-600">Total people (incl. you)</span><span className="font-semibold text-gray-900">{groupSize}</span></div>}

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

                  <button
                    onClick={handleBooking}
                    disabled={submitting || quota?.is_full || tithiPackageNeedsSetup}
                    className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                  >
                    {submitting
                      ? "Processing..."
                      : quota?.is_full
                        ? "Daily limit reached - booking unavailable"
                        : ["ANNASHETRA_DONATION", "TITHI_BHOJAN"].includes(selectedService.service_mode)
                          ? `Pay & Book - Rs. ${money(pricePreview?.total ?? selectedService.current_fee)}`
                          : `Pay Now - Rs. ${money(
                            pricePreview?.total ?? selectedService.current_fee
                          )}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MY BOOKINGS ================= */}
        {view === "mybookings" && (
          <div className="w-full">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center">
                <BackButton
                  onClick={() => setView("catalogue")}
                  title="Back to catalogue"
                  className="mr-4"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                  <p className="text-sm text-gray-500">
                    Your seva bookings, payments and receipts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setView("catalogue")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <Sparkles className="h-4 w-4" /> Book New Seva
              </button>
            </div>

            {myBookings.length > 0 && (
              <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <label className="text-xs font-medium text-gray-600">Service
                  <select value={bookingServiceFilter} onChange={(e) => setBookingServiceFilter(e.target.value)} className="mt-1 block min-w-44 rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="ALL">All services</option>
                    {bookingServiceOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium text-gray-600">Status
                  <select value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)} className="mt-1 block min-w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="ALL">All statuses</option>
                    {BOOKING_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium text-gray-600">Search
                  <input value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} placeholder="Receipt no, service" className="mt-1 block w-52 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </label>
                {(bookingServiceFilter !== "ALL" || bookingStatusFilter !== "ALL" || bookingSearch) && (
                  <button type="button" onClick={() => { setBookingServiceFilter("ALL"); setBookingStatusFilter("ALL"); setBookingSearch(""); }} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">Clear filters</button>
                )}
                <span className="ml-auto text-xs text-gray-500">{visibleMyBookings.length} of {myBookings.length}</span>
              </div>
            )}

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
            ) : visibleMyBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                <p className="text-sm font-medium text-gray-600">No bookings match these filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {visibleMyBookings.map((b) => (
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
                      {b.service?.service_mode !== "ANNASHETRA_DONATION" && <div>
                        <p className="text-gray-400">Perform date</p>
                        <p className="font-semibold text-gray-900">
                          {b.perform_date}
                        </p>
                      </div>}
                      {b.service?.service_mode !== "ANNASHETRA_DONATION" && <div>
                        <p className="text-gray-400">Persons</p>
                        <p className="font-semibold text-gray-900">{b.persons}</p>
                      </div>}
                      <div>
                        <p className="text-gray-400">Total</p>
                        <p className="font-semibold text-gray-900">
                          Rs. {money(b.total_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payment</p>
                        <p
                          className={`font-semibold ${
                            b.payment_status === "PAID"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {b.payment_status}
                        </p>
                      </div>
                    </div>

                    {(b.coupons || []).map((coupon) => (
                      <div key={coupon.coupon_id} className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs">
                        <p className="font-semibold text-emerald-800">Meal coupon: {coupon.coupon_no}</p>
                        <p className="mt-1 text-emerald-700">{coupon.persons} people · {coupon.meal_slot || "Meal slot"} · valid {coupon.valid_date}</p>
                      </div>
                    ))}

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
                      {(!["ANNASHETRA_DONATION", "TITHI_BHOJAN"].includes(b.service?.service_mode) || b.payment_status === "PAID") && <a
                        href={`${base}/portal/seva/bookings/${b.booking_id}/receipt?token=${token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <Receipt className="h-3.5 w-3.5" /> Receipt
                      </a>}

                      {b.status === "PENDING_PAYMENT" && razorpayKeyId && ["ANNASHETRA_DONATION", "TITHI_BHOJAN"].includes(b.service?.service_mode) && (
                        <button onClick={() => startRazorpayPayment(b)} disabled={razorpayBusy === b.booking_id} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
                          <IndianRupee className="h-3.5 w-3.5" /> {razorpayBusy === b.booking_id ? "Opening checkout…" : `Pay online · ₹${money(b.balance_amount)}`}
                        </button>
                      )}

                      {b.status === "PENDING_PAYMENT" && !["ANNASHETRA_DONATION", "TITHI_BHOJAN"].includes(b.service?.service_mode) && (
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
        className={`w-full rounded-xl border border-gray-200 py-2.5 pr-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 ${
          Icon ? "pl-9" : "pl-3.5"
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
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition ${
        file
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
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          file ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-700"
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
