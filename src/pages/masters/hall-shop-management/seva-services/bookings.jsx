import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import qrcode from "../../../../utils/qrcode-generator.mjs";
import {
  Search,
  Loader2,
  X,
  CheckCircle,
  Clock,
  IndianRupee,
  FileText,
  Users,
  Calendar,
  Eye,
  ShieldCheck,
  Receipt,
  User,
  Phone,
  MapPin,
  Plus,
  Trash2,
  QrCode,
} from "lucide-react";

/** Render a QR code as an inline SVG data URL (no runtime dependency needed). */
function buildQrSvg(text, size = 260) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const margin = 2;
  const total = count + margin * 2;
  const scale = size / total;
  const cell = scale.toFixed(2);
  let path = "";
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.isDark(row, col)) {
        path += `M${((col + margin) * scale).toFixed(2)} ${((row + margin) * scale).toFixed(2)}h${cell}v${cell}h-${cell}z`;
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#ffffff"/><path d="${path}" fill="#000000"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SevaBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modeFilter, setModeFilter] = useState(() => new URLSearchParams(window.location.search).get("service_mode") || "");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [slotFilter, setSlotFilter] = useState("");
  const [slotOptions, setSlotOptions] = useState([]);
  const [services, setServices] = useState([]);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterSaving, setCounterSaving] = useState(false);
  const [counter, setCounter] = useState({ service_id: "", package_id: "", slot_id: "", perform_date: new Date().toISOString().slice(0,10), devotee_name: "", devotee_mobile: "", persons: 1, co_donors: [], payment_mode_id: "", payment_ref: "" });
  const [counterSlots, setCounterSlots] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [qr, setQr] = useState(null);
  const [qrModeId, setQrModeId] = useState("");
  const [qrRef, setQrRef] = useState("");

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (modeFilter) params.service_mode = modeFilter;
      if (serviceFilter) params.service_id = serviceFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (slotFilter) params.slot_id = slotFilter;
      const res = await axios.get(`${base}/seva/bookings`, { headers, params });
      if (res.data?.success) {
        setBookings(res.data.data?.data || res.data.data || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [statusFilter, modeFilter, serviceFilter, fromDate, toDate, slotFilter]);

  // Load all active services for the per-service filter dropdown.
  useEffect(() => {
    axios.get(`${base}/seva/services?active_only=1&per_page=200`, { headers })
      .then((res) => {
        const list = res.data?.data?.data || [];
        setServices(list);
      })
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    axios.get(`${base}/portal/seva/payment-modes`, { headers })
      .then((res) => setPaymentModes(res.data?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!fromDate || !toDate || modeFilter !== "TITHI_BHOJAN") { setSlotOptions([]); setSlotFilter(""); return; }
    axios.get(`${base}/seva/slots`, { headers, params: { from: fromDate, to: toDate } })
      .then((res) => setSlotOptions((res.data?.data || []).filter((s) => s.service?.service_mode === "TITHI_BHOJAN")))
      .catch((e) => toast.error(e.response?.data?.message || "Could not load meal slots"));
  }, [fromDate, toDate, modeFilter]);

  const filtered = useMemo(
    () =>
      bookings.filter((b) =>
        `${b.receipt_no || ""} ${b.devotee_name || ""} ${b.devotee_mobile || ""} ${
          b.service?.name || ""
        }`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      ),
    [bookings, query]
  );

  // ---- Counter booking: bookable packages for the selected service ----
  // Tithi Bhojan packages are only bookable inside their start/end window and
  // only once meal slots are configured; expired/unconfigured ones are hidden.
  const todayStr = new Date().toISOString().slice(0, 10);
  const counterService = useMemo(
    () => services.find((s) => String(s.service_id) === String(counter.service_id)) || null,
    [services, counter.service_id]
  );
  const isCounterTithi = counterService?.service_mode === "TITHI_BHOJAN";
  const counterPackages = useMemo(() => {
    const list = counterService?.packages || [];
    if (!isCounterTithi) return list;
    return list.filter((p) => p.effective_from && p.effective_to && p.effective_to >= todayStr);
  }, [counterService, isCounterTithi, todayStr]);
  const counterPackage =
    counterPackages.find((p) => String(p.package_id) === String(counter.package_id)) || counterPackages[0] || null;
  const counterDateMin = isCounterTithi
    ? (counterPackage?.effective_from && counterPackage.effective_from > todayStr ? counterPackage.effective_from : todayStr)
    : todayStr;
  const counterDateMax = isCounterTithi ? (counterPackage?.effective_to || undefined) : undefined;
  const counterTithiNeedsSetup = isCounterTithi
    && (!counterPackage || !counterPackage.effective_from || !counterPackage.effective_to || !(counterPackage.slot_times || []).length);
  const counterLimit = counterPackage?.person_limit
    ? {
        limit: Number(counterPackage.person_limit),
        remaining: Number(counterPackage.limit_remaining ?? 0),
        is_full: !!counterPackage.is_limit_full,
      }
    : null;
  const counterLimitBlocked = !!counterLimit
    && (counterLimit.is_full || counterLimit.remaining < Math.max(1, Number(counter.persons || 1)));
  const counterSlot = counterSlots.find((s) => String(s.slot_id) === String(counter.slot_id)) || null;
  const counterSlotBlocked = !!counterSlot?.limit
    && (counterSlot.is_full || Number(counterSlot.remaining) < Math.max(1, Number(counter.persons || 1)));

  const openDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await axios.get(`${base}/seva/bookings/${id}`, { headers });
      if (res.data?.success) setDetail(res.data.data);
      else toast.error(res.data?.message || "Failed to load details");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load details");
    } finally {
      setDetailLoading(false);
    }
  };

  const openCounter = async () => {
    try {
      const res = await axios.get(`${base}/seva/services?active_only=1&per_page=200`, { headers });
      const list = res.data?.data?.data || [];
      setServices(list);
      setCounter((p) => ({ ...p, service_id: list.find((s) => !modeFilter || s.service_mode === modeFilter)?.service_id || list[0]?.service_id || "" }));
      setCounterOpen(true);
    } catch (e) { toast.error(e.response?.data?.message || "Could not load services"); }
  };

  // Keep the selected package aligned with the bookable list.
  useEffect(() => {
    if (!counterOpen || !counterPackage) return;
    if (String(counter.package_id) !== String(counterPackage.package_id)) {
      setCounter((p) => ({ ...p, package_id: String(counterPackage.package_id), slot_id: "" }));
    }
  }, [counterOpen, counterPackage?.package_id]);

  // Keep the meal date inside the package's start/end window.
  useEffect(() => {
    if (!counterOpen || !isCounterTithi || !counterPackage) return;
    let date = counter.perform_date || counterDateMin;
    if (date < counterDateMin) date = counterDateMin;
    if (counterDateMax && date > counterDateMax) date = counterDateMax;
    if (date !== counter.perform_date) setCounter((p) => ({ ...p, perform_date: date, slot_id: "" }));
  }, [counterOpen, isCounterTithi, counterPackage?.package_id, counterDateMin, counterDateMax]);

  // Load meal slots only for a properly configured package and in-window date.
  useEffect(() => {
    if (!counterOpen) return;
    setCounterSlots([]);
    setCounter((p) => (p.slot_id ? { ...p, slot_id: "" } : p));

    if (!isCounterTithi || counterTithiNeedsSetup || !counterPackage) return;

    const date = counter.perform_date;
    if (!date || date < counterDateMin || (counterDateMax && date > counterDateMax)) return;

    let cancelled = false;
    axios.get(`${base}/portal/seva/slots`, {
      headers,
      params: { service_id: counterService.service_id, package_id: counterPackage.package_id, date },
    })
      .then((r) => { if (!cancelled) setCounterSlots(r.data?.data?.slots || []); })
      .catch(() => { if (!cancelled) setCounterSlots([]); });

    return () => { cancelled = true; };
  }, [counterOpen, counterService?.service_id, counterPackage?.package_id, counter.perform_date, isCounterTithi, counterTithiNeedsSetup, counterDateMin, counterDateMax]);

  const submitCounter = async (e) => {
    e.preventDefault();
    if (isCounterTithi && counterTithiNeedsSetup) {
      return toast.error("Configure the package start date, end date and meal slots before booking.");
    }
    if (isCounterTithi && !counter.slot_id) {
      return toast.error("Please select a meal slot.");
    }
    if (isCounterTithi && counterLimitBlocked) {
      return toast.error(counterLimit?.is_full ? "Package limit reached." : `Only ${counterLimit?.remaining} places left in this package.`);
    }
    if (isCounterTithi && counterSlotBlocked) {
      return toast.error(counterSlot?.is_full ? "This slot is full." : `Only ${counterSlot?.remaining} places left in this slot.`);
    }
    try {
      setCounterSaving(true);
      const payload = { ...counter, co_donors: counter.co_donors.filter(Boolean).map((n) => n.trim()), persons: Number(counter.persons || 1), package_id: counter.package_id || null, slot_id: counter.slot_id || null, payment_mode_id: counter.payment_mode_id || null, payment_ref: counter.payment_ref || null };
      delete payload.co_donor_text;
      const res = await axios.post(`${base}/seva/bookings`, payload, { headers });
      toast.success(`Counter booking created: ${res.data?.data?.receipt_no || ""}`);
      setCounterOpen(false);
      setCounter({ service_id: "", package_id: "", slot_id: "", perform_date: new Date().toISOString().slice(0,10), devotee_name: "", devotee_mobile: "", persons: 1, co_donors: [], payment_mode_id: "", payment_ref: "" });
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || Object.values(e.response?.data?.errors || {}).flat().join(", ") || "Counter booking failed"); }
    finally { setCounterSaving(false); }
  };

  const act = async (id, action, extra = {}) => {
    try {
      setActing(`${id}-${action}`);
      const res = await axios.post(
        `${base}/seva/bookings/${id}/${action}`,
        extra,
        { headers }
      );
      if (res.data?.success) {
        toast.success(res.data.message || "Updated");
        fetchAll();
        if (detail && detail.booking_id === id) openDetail(id);
      } else {
        toast.error(res.data?.message || "Action failed");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Action failed");
    } finally {
      setActing(null);
    }
  };

  const redeemMealCoupon = async (coupon) => {
    const raw = window.prompt(`People served (maximum ${coupon.persons})`, String(coupon.persons));
    if (raw === null) return;
    const persons = Number(raw);
    if (!Number.isInteger(persons) || persons < 1 || persons > Number(coupon.persons)) return toast.error("Enter a valid number of people.");
    try {
      const res = await axios.post(`${base}/seva/coupons/redeem`, { coupon_id: coupon.coupon_id, persons }, { headers });
      toast.success(res.data?.message || "Coupon redeemed");
      await openDetail(detail.booking_id);
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || "Coupon redemption failed"); }
  };

  const showPaymentQr = async (bookingId) => {
    try {
      const res = await axios.get(`${base}/seva/bookings/${bookingId}/payment-qr`, { headers });
      if (!res.data?.success) throw new Error(res.data?.message || "Payment QR unavailable");
      const image = buildQrSvg(res.data.data.upi_uri, 260);
      const firstOnline = paymentModes.find((m) => !m.is_cash);
      setQrModeId(firstOnline ? String(firstOnline.id) : "");
      setQrRef("");
      setQr({ ...res.data.data, image });
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Could not load payment QR");
    }
  };

  const confirmQrPayment = async (bookingId) => {
    if (!qrModeId) return toast.error("No online payment mode is configured.");
    try {
      const res = await axios.post(`${base}/seva/bookings/${bookingId}/pay`, {
        amount: qr.amount,
        payment_mode_id: Number(qrModeId),
        payment_ref: qrRef || null,
      }, { headers });
      toast.success(res.data?.message || "Payment recorded");
      setQr(null);
      setQrRef("");
      await openDetail(bookingId);
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || "Payment could not be recorded"); }
  };

  const statusBadge = (s) => {
    const map = {
      PENDING_PAYMENT: "bg-amber-100 text-amber-800",
      PENDING_APPROVAL: "bg-blue-100 text-blue-800",
      APPROVED: "bg-cyan-100 text-cyan-800",
      SCHEDULED: "bg-indigo-100 text-indigo-800",
      PERFORMED: "bg-emerald-100 text-emerald-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-gray-200 text-gray-700",
      REJECTED: "bg-red-100 text-red-800",
      REFUNDED: "bg-purple-100 text-purple-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return map[s] || "bg-gray-100 text-gray-700";
  };

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) =>
        ["PENDING_PAYMENT", "PENDING_APPROVAL"].includes(b.status)
      ).length,
      scheduled: bookings.filter((b) =>
        ["APPROVED", "SCHEDULED"].includes(b.status)
      ).length,
      completed: bookings.filter((b) =>
        ["PERFORMED", "COMPLETED"].includes(b.status)
      ).length,
    }),
    [bookings]
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{modeFilter === "ANNASHETRA_DONATION" ? "Annakshetra Donations" : modeFilter === "TITHI_BHOJAN" ? "Tithi Bhojan Bookings" : "Seva Bookings"}</h1>
          <p className="text-sm text-gray-500">
            All pooja / seva bookings by devotees with approval and scheduling
          </p>
        </div>
        <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All Seva Bookings</option><option value="ANNASHETRA_DONATION">Annakshetra Donations</option><option value="TITHI_BHOJAN">Tithi Bhojan</option>
        </select>
        <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All Services</option>
          {services.map((s) => (
            <option key={s.service_id} value={s.service_id}>{s.name}</option>
          ))}
        </select>
        <button onClick={openCounter} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Counter booking</button>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search receipt, devotee, mobile"
              className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            {[
              "PENDING_PAYMENT",
              "PENDING_APPROVAL",
              "APPROVED",
              "SCHEDULED",
              "PERFORMED",
              "COMPLETED",
              "CANCELLED",
              "REJECTED",
            ].map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {modeFilter === "TITHI_BHOJAN" && <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <label className="text-xs text-gray-600">Booking date from<input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (toDate && e.target.value > toDate) setToDate(""); setSlotFilter(""); }} className="mt-1 block rounded border p-2" /></label>
        <label className="text-xs text-gray-600">Booking date to<input type="date" min={fromDate || undefined} value={toDate} onChange={(e) => { setToDate(e.target.value); setSlotFilter(""); }} className="mt-1 block rounded border p-2" /></label>
        <label className="text-xs text-gray-600">Meal slot<select disabled={!fromDate || !toDate} value={slotFilter} onChange={(e) => setSlotFilter(e.target.value)} className="mt-1 block min-w-48 rounded border p-2"><option value="">All slots</option>{slotOptions.map((s) => <option key={s.slot_id} value={s.slot_id}>{s.slot_date} · {s.label || s.start_time}</option>)}</select></label>
        {(fromDate || toDate || slotFilter) && <button onClick={() => { setFromDate(""); setToDate(""); setSlotFilter(""); }} className="rounded border px-3 py-2 text-sm">Clear date/slot filters</button>}
      </div>}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Total Bookings", stats.total, "text-gray-900", Receipt],
          ["Pending Action", stats.pending, "text-amber-600", Clock],
          ["Scheduled", stats.scheduled, "text-indigo-600", Calendar],
          ["Completed", stats.completed, "text-emerald-600", CheckCircle],
        ].map(([label, value, color, Icon]) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
              </div>
              <Icon className={`h-6 w-6 ${color.replace("text-", "text-")} opacity-40`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Receipt",
                  "Devotee",
                  "Service",
                  "Perform Date",
                  "Persons",
                  "Amount",
                  "Payment",
                  "Status",
                  "Approval",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => (
                <tr key={b.booking_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-gray-800">
                      {b.receipt_no}
                    </span>
                    <p className="text-[11px] text-gray-500">
                      #{b.booking_id}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {b.devotee_name}
                    </p>
                    <p className="text-xs text-gray-500">{b.devotee_mobile}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-800">
                      {b.service?.name || "—"}
                    </p>
                    {b.package && (
                      <p className="text-[11px] text-gray-500">
                        {b.package.name}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {b.perform_date}
                    {b.slot && (
                      <p className="text-[11px] text-gray-500">
                        {String(b.slot.start_time).slice(0, 5)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.persons}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{Number(b.total_amount).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Paid ₹{Number(b.amount_paid).toFixed(2)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        b.payment_status === "PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.payment_status === "PARTIAL"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadge(
                        b.status
                      )}`}
                    >
                      {b.status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === "PENDING_APPROVAL" && b.current_action ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                        <ShieldCheck className="h-3 w-3" />
                        {b.current_action.St_Name}
                      </span>
                    ) : b.status === "APPROVED" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                        Direct
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openDetail(b.booking_id)}
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Booking {detail.receipt_no}
                </h3>
                <p className="text-xs text-gray-500">
                  {detail.service?.name} · {detail.perform_date}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              {/* Devotee */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                <p className="mb-2 text-xs font-semibold text-gray-700">
                  Devotee Details
                </p>
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">
                      {detail.devotee_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">
                      {detail.devotee_mobile || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">
                      {detail.devotee_email || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600">Gotra:</span>
                    <span className="font-medium text-gray-900">
                      {detail.gotra || "-"}
                    </span>
                  </div>
                  {detail.address && (
                    <div className="flex items-start gap-1.5 sm:col-span-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium text-gray-900">
                        {detail.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amounts */}
              {detail.co_donors?.length > 0 && <div className="rounded-xl border border-teal-200 bg-teal-50 p-3"><p className="text-xs font-semibold text-teal-800">Co-donors</p><p className="mt-1 text-xs text-teal-900">{detail.co_donors.join(", ")}</p></div>}
              {detail.coupons?.length > 0 && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs font-semibold text-emerald-800">Issued meal coupons</p>{detail.coupons.map(c => <div key={c.coupon_id} className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900"><span>{c.coupon_no} · {c.persons} people · {c.meal_slot || "Slot"} · {c.status}</span>{c.status === "ISSUED" && <button onClick={() => redeemMealCoupon(c)} className="rounded bg-emerald-700 px-2 py-1 font-semibold text-white">Mark served</button>}</div>)}</div>}

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  ["Base Fee", detail.amount],
                  ...(!["ANNASHETRA_DONATION", "TITHI_BHOJAN"].includes(detail.service?.service_mode) ? [["Tax", detail.tax_amount]] : []),
                  ["Total", detail.total_amount],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                  >
                    <p className="text-[10px] uppercase tracking-wide text-gray-500">
                      {l}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{Number(v || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Payment collection */}
              {detail.payment_status !== "PAID" && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-200 bg-teal-50 p-3">
                  <div>
                    <p className="text-xs font-semibold text-teal-800">Outstanding balance</p>
                    <p className="text-sm font-bold text-teal-900">₹{(Number(detail.total_amount || 0) - Number(detail.amount_paid || 0)).toFixed(2)}</p>
                  </div>
                  <button onClick={() => showPaymentQr(detail.booking_id)} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white">
                    <QrCode className="h-4 w-4" /> Show payment QR
                  </button>
                </div>
              )}

              {/* Payments */}
              {detail.payments?.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-gray-700">
                    Payments
                  </p>
                  <div className="rounded-lg border border-gray-200">
                    {detail.payments.map((p) => (
                      <div
                        key={p.payment_id}
                        className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 text-xs last:border-0"
                      >
                        <span className="font-semibold text-gray-900">₹{Number(p.amount).toFixed(2)}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">{p.gateway || "—"}</span>
                        <span className="font-mono text-[10px] text-gray-500">{p.gateway_payment_id || p.gateway_order_id || ""}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${p.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{p.status}</span>
                        <span className="text-[10px] text-gray-400">{p.paid_at ? String(p.paid_at).slice(0, 16).replace("T", " ") : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lines */}
              {detail.lines?.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-gray-700">
                    Items
                  </p>
                  <div className="rounded-lg border border-gray-200">
                    {detail.lines.map((l) => (
                      <div
                        key={l.line_id}
                        className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-xs last:border-0"
                      >
                        <span className="text-gray-700">{l.description}</span>
                        <span className="font-semibold text-gray-900">
                          ₹{Number(l.line_total).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {!['ANNASHETRA_DONATION', 'TITHI_BHOJAN'].includes(detail.service?.service_mode) && detail.documents?.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-gray-700">
                    Documents
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detail.documents.map((d) => (
                      <a
                        key={d.doc_id}
                        href={`${import.meta.env.VITE_API_URL.replace("/api", "")}/storage/${d.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {d.doc_side || d.doc_type} ({d.file_name})
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow */}
              {detail.workflow?.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-gray-700">
                    Workflow
                  </p>
                  <div className="space-y-1.5">
                    {detail.workflow.map((w) => (
                      <div
                        key={w.wf_id}
                        className="flex items-center gap-2 text-[11px] text-gray-600"
                      >
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="font-medium text-gray-800">
                          {w.action}
                        </span>
                        <span>
                          {w.from_status || "NEW"} → {w.to_status}
                        </span>
                        <span className="text-gray-400">
                          {w.acted_at
                            ? String(w.acted_at).slice(0, 16).replace("T", " ")
                            : ""}
                        </span>
                        {w.remarks && (
                          <span className="text-gray-500">({w.remarks})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
              {detail.receipt_no && (
                <a
                  href={`${import.meta.env.VITE_API_URL}/portal/seva/bookings/${detail.booking_id}/receipt?token=${localStorage.getItem("auth_token")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Receipt className="h-4 w-4" /> Receipt
                </a>
              )}
              <button
                onClick={() => setDetail(null)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-6 py-4 text-sm text-gray-700">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
            Loading booking details...
          </div>
        </div>
      )}

      {qr && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">UPI payment QR</h3>
              <button onClick={() => setQr(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-1 text-xs text-gray-500">{qr.receipt_no}</p>
            <img src={qr.image} alt="UPI payment QR" className="mx-auto mt-3 h-56 w-56" />
            <p className="mt-2 text-xl font-bold text-gray-900">₹{Number(qr.amount).toFixed(2)}</p>
            <p className="text-[11px] text-gray-500">{qr.payee_name} · {qr.vpa}</p>
            <div className="mt-4 space-y-2 text-left">
              <label className="block text-xs font-medium">Online payment mode
                <select value={qrModeId} onChange={(e) => setQrModeId(e.target.value)} className="mt-1 w-full rounded border p-2 text-sm">
                  {paymentModes.filter((m) => !m.is_cash).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>
              <label className="block text-xs font-medium">UPI / txn reference (optional)
                <input value={qrRef} onChange={(e) => setQrRef(e.target.value)} className="mt-1 w-full rounded border p-2 text-sm" />
              </label>
              <button onClick={() => confirmQrPayment(qr.booking_id)} className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white">Mark payment received</button>
            </div>
          </div>
        </div>
      )}

      {counterOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"><form onSubmit={submitCounter} className="w-full max-w-2xl space-y-6 rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-teal-600" /> Manual counter booking
            </h2>
            <p className="text-xs text-gray-500 mt-1">Book seva/coupon at the temple counter</p>
          </div>
          <button type="button" onClick={() => { setCounterOpen(false); setCounter({ service_id: "", package_id: "", slot_id: "", perform_date: new Date().toISOString().slice(0,10), devotee_name: "", devotee_mobile: "", persons: 1, co_donors: [], payment_mode_id: "", payment_ref: "" }); }}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
        </div>

        {/* Service & Package */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Service <span className="text-red-500">*</span></label>
          <select required value={counter.service_id} onChange={e => setCounter(p=>({...p,service_id:e.target.value,package_id:"",slot_id:"",co_donors:[]}))} className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
            {services.filter(s=>!modeFilter||s.service_mode===modeFilter).map(s=><option key={s.service_id} value={s.service_id}>{s.name}</option>)}
          </select>

          <label className="block text-xs font-semibold text-gray-600 mb-1">Package</label>
          <select disabled={!counterPackages.length} value={counter.package_id} onChange={e=>setCounter(p=>({...p,package_id:e.target.value,slot_id:""}))} className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
            {!counterPackages.length && <option value="">No bookable package</option>}
            {counterPackages.map(p=><option key={p.package_id} value={p.package_id}>{p.name} · ₹{Number(p.fee).toLocaleString("en-IN")}</option>)}
          </select>
        </div>

        {/* Date & Slot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {counterService?.service_mode !== "ANNASHETRA_DONATION" && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Meal date <span className="text-red-500">*</span></label>
              <input type="date" required min={isCounterTithi ? counterDateMin : undefined} max={isCounterTithi ? counterDateMax : undefined} value={counter.perform_date} onChange={e=>setCounter(p=>({...p,perform_date:e.target.value,slot_id:""}))} className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
          )}
          {isCounterTithi && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Number of people</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={()=>setCounter(p=>({...p,persons:Math.max(1,(p.persons||1)-1)}))} className="w-8 h-8 rounded-lg border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50">-</button>
                <input type="number" min="1" max="10000" readOnly value={counter.persons || 1} className="w-12 rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-center focus:outline-none" />
                <button type="button" onClick={()=>setCounter(p=>({...p,persons:(p.persons||1)+1}))} className="w-8 h-8 rounded-lg border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50">+</button>
              </div>
              <p className="mt-1 text-[10px] text-gray-500">Total: <span className="font-semibold text-gray-800">{counter.persons || 1}</span> people</p>
            </div>
          )}
        </div>

        {isCounterTithi && !counterTithiNeedsSetup && (
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Meal slot <span className="text-red-500">*</span></label>
            <select required value={counter.slot_id} onChange={e=>setCounter(p=>({...p,slot_id:e.target.value}))} className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
              <option value="">Choose slot</option>
              {counterSlots.map(s=><option key={s.slot_id} value={s.slot_id}>{(s.time_text || s.start_time || "")}{s.label ? ` · ${s.label}` : ""}{s.limit ? ` · ${s.is_full ? "Full" : `${s.remaining} left`}` : ""}</option>)}
            </select>
          </div>
        )}

        {isCounterTithi && counterSlot?.limit && <p className={`rounded-lg px-3 py-2 text-xs font-semibold ${counterSlotBlocked ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{counterSlot.is_full ? `${counterSlot.label || "This slot"} is full` : `${counterSlot.label || "This slot"}: ${counterSlot.remaining} of ${counterSlot.limit} places left.`}</p>}
        {isCounterTithi && counterTithiNeedsSetup && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 border border-amber-200">{counterPackages.length === 0 ? "No bookable Tithi Bhojan package — configure start/end dates and meal slots." : "Package needs start date, end date and at least one meal slot."}</p>}
        {isCounterTithi && !counterTithiNeedsSetup && <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800 border border-teal-200">Total: ₹{(Number(counterPackage?.fee || 0) * Number(counter.persons || 1)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{counterPackage?.effective_from && counterPackage?.effective_to ? ` · Window ${counterPackage.effective_from} to ${counterPackage.effective_to}` : ""}</p>}
        {isCounterTithi && counterLimit && <p className={`rounded-lg px-3 py-2 text-xs font-semibold ${counterLimitBlocked ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{counterLimit.is_full ? "Package limit reached" : `${counterLimit.remaining} of ${counterLimit.limit} package places left.`}</p>}

        {/* Devotee Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Devotee name <span className="text-red-500">*</span></label>
            <input required value={counter.devotee_name} onChange={e=>setCounter(p=>({...p,devotee_name:e.target.value}))} className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Mobile number</label>
            <input value={counter.devotee_mobile} onChange={e=>setCounter(p=>({...p,devotee_mobile:e.target.value}))} className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="10-digit mobile" />
          </div>
        </div>

        {/* Co-donors (Annakshetra only) */}
        {services.find(s=>String(s.service_id)===String(counter.service_id))?.service_mode === "ANNASHETRA_DONATION" && (
          <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-600">Co-donors (optional)</label>
              <button type="button" onClick={()=>setCounter(p=>({...p,co_donors:[...p.co_donors,""]}))} className="inline-flex items-center gap-1 rounded bg-teal-600 px-2 py-1 text-xs text-white hover:bg-teal-700 transition">
                <Plus className="h-3 w-3" /> Add co-donor
              </button>
            </div>
            <div className="space-y-2">
              {counter.co_donors.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <input value={name} onChange={e=>setCounter(p=>{const next=[...p.co_donors];next[index]=e.target.value;return{...p,co_donors:next};})} placeholder={`Co-donor ${index+1} name`} className="flex-1 rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                  {counter.co_donors.length > 1 && <button type="button" onClick={()=>setCounter(p=>({...p,co_donors:p.co_donors.filter((_,i)=>i!==index)}))} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 transition"><Trash2 className="h-4 w-4" /></button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Collection */}
        <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-200">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-gray-600">Collect payment now (optional)</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Payment mode</label>
              <select value={counter.payment_mode_id || ""} onChange={e=>setCounter(p=>({...p,payment_mode_id:e.target.value,payment_ref:""}))} className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
                <option value="">Leave unpaid — use QR later</option>
                {paymentModes.map(m=><option key={m.id} value={m.id}>{m.name}{m.is_cash ? " (cash)" : " (online)"}</option>)}
              </select>
            </div>
            {(() => { const sel = paymentModes.find(m=>String(m.id)===String(counter.payment_mode_id)); return sel && !sel.is_cash ? (
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">Reference / UPI txn ID</label>
                <input value={counter.payment_ref || ""} onChange={e=>setCounter(p=>({...p,payment_ref:e.target.value}))} placeholder="Enter reference" className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
            ) : null; })()}
          </div>
          <p className="mt-2 text-[11px] text-gray-500">Cash is recorded instantly. For UPI/Online/Cheque, select the mode and enter the reference. Or create unpaid and use "Show payment QR" from booking details.</p>
        </div>

        <button disabled={counterSaving || (isCounterTithi && counterTithiNeedsSetup) || (isCounterTithi && counterLimitBlocked) || (isCounterTithi && counterSlotBlocked)} className="w-full rounded-lg bg-teal-700 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none">
          {counterSaving ? "Saving…" : "Create booking"}
        </button>
      </form></div>}
    </div>
  );
};

export default SevaBookings;
