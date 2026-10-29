import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import BackButton from "../../../../components/backbutton";
import {
  ShieldCheck,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Users,
  Calendar,
  Package,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";

/**
 * Seva Approvals - 100% DYNAMIC (Action Master stage SEV se).
 *
 * Action Master me flow change karte hi (step add/remove/reorder/authority
 * change) ye list aur approve/reject buttons apne aap update ho jate hain.
 */
const SevaApprovals = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [query, setQuery] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [querying, setQuerying] = useState(null);
  const [queryReason, setQueryReason] = useState("");

  const token = localStorage.getItem("auth_token");
  const base = import.meta.env.VITE_API_URL;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [apprRes, chainRes] = await Promise.all([
        axios.get(`${base}/seva/bookings/pending-approvals?per_page=200`, {
          headers,
        }),
        axios.get(`${base}/seva/approval-chain?stage=SEV`, { headers }),
      ]);

      if (apprRes.data?.success) {
        setRows(apprRes.data.data || []);
      }
      if (chainRes.data?.success) {
        setChain(chainRes.data.data || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const term = `${r.receipt_no || ""} ${r.devotee_name || ""} ${
          r.devotee_mobile || ""
        } ${r.service?.name || ""}`.toLowerCase();
        return term.includes(query.trim().toLowerCase());
      }),
    [rows, query]
  );

  const handleRaiseQuery = async (row) => {
    if (!queryReason.trim()) {
      toast.error("Please enter the query details");
      return;
    }
    try {
      setWorking(true);
      const res = await axios.post(
        `${base}/seva/bookings/${row.booking_id}/query`,
        { reason: queryReason.trim() },
        { headers }
      );

      if (res.data?.success) {
        toast.success(
          "Query raised - booking sent back to the devotee for clarification"
        );
        setQuerying(null);
        setQueryReason("");
        fetchAll();
      } else {
        toast.error(res.data?.message || "Query failed");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Query failed");
    } finally {
      setWorking(false);
    }
  };

  const handleApprove = async (row) => {
    try {
      setWorking(true);
      const res = await axios.post(
        `${base}/seva/bookings/${row.booking_id}/approve`,
        { remarks: "Approved" },
        { headers }
      );

      if (res.data?.success) {
        toast.success(
          res.data.data?.status === "APPROVED"
            ? "Approved - booking is fully approved"
            : "Approved - moved to next approval step"
        );
        setRejecting(null);
        fetchAll();
      } else {
        toast.error(res.data?.message || "Approval failed");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed");
    } finally {
      setWorking(false);
    }
  };

  const handleReject = async (row) => {
    if (!reason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    try {
      setWorking(true);
      const res = await axios.post(
        `${base}/seva/bookings/${row.booking_id}/reject`,
        { reason: reason.trim() },
        { headers }
      );

      if (res.data?.success) {
        toast.success("Booking rejected");
        setRejecting(null);
        setReason("");
        fetchAll();
      } else {
        toast.error(res.data?.message || "Reject failed");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Reject failed");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center">
          <BackButton fallback="/dashboard" className="mr-4" />
          <div>
          <h1 className="text-2xl font-bold text-gray-900">Seva Approvals</h1>
          <p className="text-sm text-gray-500">
            Approval flow is driven by Action Master (stage SEV) - change the
            flow there and this screen updates automatically
          </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search receipt / devotee / seva"
              className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* APPROVAL CHAIN (dynamic) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <ShieldCheck className="h-4 w-4" /> Current approval flow
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {chain.length === 0 && (
            <p className="text-sm text-gray-500">
              No Action Master flow configured for stage SEV. Add actions with
              stage = SEV to enable approvals.
            </p>
          )}
          {chain.map((step, i) => (
            <div key={step.Act_Id} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300">→</span>}
              <div
                className={`rounded-lg border px-3 py-2 ${
                  step.is_start
                    ? "border-gray-200 bg-gray-50"
                    : "border-indigo-200 bg-indigo-50"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wide text-gray-500">
                  Step {step.step_no}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {step.St_Name}
                </p>
                <p className="text-[10px] text-gray-500">
                  {step.Authorities && step.Authorities.length > 0
                    ? `Authority: ${
                        Array.isArray(step.Authorities)
                          ? step.Authorities.join(", ")
                          : step.Authorities
                      }`
                    : "Any authorised user"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Pending", rows.length, "text-amber-600"],
          [
            "You can approve",
            rows.filter((r) => r.can_approve).length,
            "text-emerald-600",
          ],
          [
            "Not in your authority",
            rows.filter((r) => !r.can_approve).length,
            "text-gray-500",
          ],
          ["Steps in flow", chain.length, "text-indigo-600"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Receipt",
                  "Devotee",
                  "Seva",
                  "Package",
                  "Perform Date",
                  "Persons",
                  "Pending Action",
                  "Amount",
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
              {filtered.map((r) => (
                <tr key={r.booking_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-gray-800">
                      {r.receipt_no}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {r.devotee_name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {r.devotee_mobile}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.service?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {r.package?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {r.perform_date}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <p className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      {r.group_size ?? r.persons} group
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {r.persons} served
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "QUERY_RAISED" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        <AlertTriangle className="h-3 w-3" />
                        Query raised
                      </span>
                    ) : r.current_action ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                        <ShieldCheck className="h-3 w-3" />
                        {r.current_action.St_Name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                    {r.status === "QUERY_RAISED" && r.remarks && (
                      <p className="mt-1 max-w-[14rem] truncate text-[11px] text-amber-700">
                        {r.remarks}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    Rs. {Number(r.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {r.can_approve ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleApprove(r)}
                          disabled={working}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </button>
                        {r.status === "PENDING_APPROVAL" && (
                          <button
                            onClick={() => {
                              setQuerying(r.booking_id);
                              setQueryReason("");
                            }}
                            disabled={working}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" /> Query
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setRejecting(r.booking_id);
                            setReason("");
                          }}
                          disabled={working}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                        <AlertTriangle className="h-3 w-3" /> Not in your
                        authority
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-gray-600">
                      No bookings pending approval.
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-xs text-gray-500">
                      A booking appears here only when its service has
                      <strong> Permission Approval = Yes</strong>. Services with
                      Permission Approval = No are scheduled directly and never
                      reach this screen.
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-xs text-gray-500">
                      Check the service master (Seva Services) and the{" "}
                      <strong>Seva Action Master</strong> screen to configure the
                      flow.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUERY MODAL */}
      {querying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">
              Raise a query
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              The booking goes back to the devotee for clarification. Once the
              devotee responds, it will come back to you for approval.
            </p>
            <textarea
              rows={4}
              value={queryReason}
              onChange={(e) => setQueryReason(e.target.value)}
              placeholder="What clarification is needed from the devotee?"
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-200"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setQuerying(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleRaiseQuery(rows.find((x) => x.booking_id === querying))
                }
                disabled={working}
                className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {working ? "Sending..." : "Send Query"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">
              Reject booking
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              The devotee will be informed and the amount will be refunded.
            </p>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection"
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-200"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setRejecting(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleReject(rows.find((x) => x.booking_id === rejecting))
                }
                disabled={working}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {working ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SevaApprovals;
