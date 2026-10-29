import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import BackButton from "../../../../components/backbutton";
import {
  Search,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  FileText,
  Users,
  Calendar,
  Eye,
  Play,
  Ban,
  ShieldCheck,
  Receipt,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import { CrudViewPage } from "../../../../components/crud/crudkit";

const SevaBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
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
  }, [statusFilter]);

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

  if (detail) {
    return (
      <CrudViewPage
        title={<>Booking {detail.receipt_no}</>}
        subtitle={<>{detail.service?.name} · {detail.perform_date}</>}
        onClose={() => setDetail(null)}
      >
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              ["Base Fee", detail.amount],
              ["Tax", detail.tax_amount],
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
          {detail.documents?.length > 0 && (
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
      </CrudViewPage>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center">
          <BackButton fallback="/dashboard" className="mr-4" />
          <div>
          <h1 className="text-2xl font-bold text-gray-900">Seva Bookings</h1>
          <p className="text-sm text-gray-500">
            All pooja / seva bookings by devotees with approval and scheduling
          </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search receipt, devotee, mobile"
              className="h-[38px] w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[38px] rounded-lg border border-gray-300 bg-white px-3 text-sm"
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

                      {b.status === "PENDING_APPROVAL" && (
                        <button
                          onClick={() => act(b.booking_id, "approve", { remarks: "Approved" })}
                          disabled={acting}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                          title="Approve"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {["PAID", "APPROVED"].includes(b.status) && (
                        <button
                          onClick={() => act(b.booking_id, "schedule")}
                          disabled={acting}
                          className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                          title="Schedule"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {b.status === "SCHEDULED" && (
                        <button
                          onClick={() => act(b.booking_id, "perform")}
                          disabled={acting}
                          className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                          title="Mark performed"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {b.status === "PERFORMED" && (
                        <button
                          onClick={() => act(b.booking_id, "complete")}
                          disabled={acting}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                          title="Complete"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {["PENDING_PAYMENT", "PAID", "APPROVED", "SCHEDULED"].includes(
                        b.status
                      ) && (
                        <button
                          onClick={() => {
                            const reason = window.prompt("Reason for cancellation:");
                            if (reason) act(b.booking_id, "cancel", { reason });
                          }}
                          disabled={acting}
                          className="rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                          title="Cancel"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      )}
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


      {detailLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-6 py-4 text-sm text-gray-700">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
            Loading booking details...
          </div>
        </div>
      )}
    </div>
  );
};

export default SevaBookings;