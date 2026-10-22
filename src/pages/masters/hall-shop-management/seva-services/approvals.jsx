<<<<<<< HEAD
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
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
=======
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Building,
  User,
  Clock,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Package,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import debounce from "lodash/debounce";
import SevaApprovalApi from "../../../services/sevaapprovalapi";

/**
 * Seva Approvals - index
 *
 * Design: Shop Rent Application Approval list ka EXACT mirror
 * (same header, action bar, stat cards, "Awaiting You / All Applications"
 * toggle, table, pagination aur empty state).
 *
 * Flow (Action Master stage SEV se 100% dynamic):
 *   Booking -> HOD Approved -> Admin Approved -> Approved (final)
 */
const SevaApprovals = ({ user }) => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("Seva Approvals");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  // Seva booking approvals screen jaisa - chain + "awaiting you" list
  const [chain, setChain] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [onlyMine, setOnlyMine] = useState(true);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]"
      );
      const currentPath =
        "/masters/hall-shop-management/seva-bookings-approval";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchDebounced(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setCurrentPage(1);
  };

  // Sirf page / search change par fetch (render loop nahi banega)
  useEffect(() => {
    loadItems();
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchDebounced]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 10 };
      if (searchDebounced) params.search = searchDebounced;
      const res = await SevaApprovalApi.getAll(params);
      const data = res?.data;
      setItems(data?.data || []);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        per_page: data?.per_page || 10,
        total: data?.total || 0,
        from: data?.from || 0,
        to: data?.to || 0,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load approvals");
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seva Approvals</h1>
          <p className="text-sm text-gray-500">
            Approval flow is driven by Action Master (stage SEV) - change the
            flow there and this screen updates automatically
          </p>
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
=======
  // Pending approvals (authority filtered) + live chain
  const loadPending = async () => {
    try {
      const params = { stage: "SEV", per_page: 200 };
      if (searchDebounced) params.search = searchDebounced;
      const res = await SevaApprovalApi.getPendingApprovals(params);
      setPendingItems(res?.data || []);
      if (res?.meta?.chain) setChain(res.meta.chain);
    } catch (error) {
      console.error("Error loading pending approvals:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = String(time).slice(0, 5).split(":").map(Number);
    if (Number.isNaN(h)) return String(time).slice(0, 5);
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${
      h < 12 ? "AM" : "PM"
    }`;
  };

  const getStatusDisplay = (item) => {
    if (item?.status) return item.status;
    if (item?.current_action?.St_Name) return item.current_action.St_Name;
    return "Pending";
  };

  const getStatusBadge = (item) => {
    if (!item) return null;

    const statusName = getStatusDisplay(item);
    const hasQuery = item?.status === "QUERY_RAISED" && item?.remarks;
    let colorClass = "bg-yellow-100 text-yellow-800";
    const statusLower = statusName.toLowerCase();

    if (
      statusLower.includes("approv") ||
      statusLower.includes("accept")
    ) {
      colorClass = "bg-green-100 text-green-800";
    } else if (
      statusLower.includes("reject") ||
      statusLower.includes("deny") ||
      statusLower.includes("query")
    ) {
      colorClass = "bg-red-100 text-red-800";
    } else if (
      statusLower.includes("pend") ||
      statusLower.includes("wait")
    ) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (
      statusLower.includes("verif") ||
      statusLower.includes("check")
    ) {
      colorClass = "bg-blue-100 text-blue-800";
    } else if (statusLower.includes("schedul")) {
      colorClass = "bg-indigo-100 text-indigo-800";
    } else if (
      statusLower.includes("complet") ||
      statusLower.includes("perform")
    ) {
      colorClass = "bg-blue-100 text-blue-800";
    } else if (statusLower.includes("cancel")) {
      colorClass = "bg-gray-200 text-gray-700";
    }

    return (
      <div className="flex flex-col gap-0.5">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
        >
          <Clock className="h-3 w-3 mr-1" />
          {String(statusName).replace(/_/g, " ")}
        </span>
        {hasQuery && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Query: {item.remarks}
          </span>
        )}
        {item?.current_action && item?.status === "PENDING_APPROVAL" && (
          <div className="text-xs text-gray-400 mt-1">
            At: {item.current_action.St_Name}
          </div>
        )}
      </div>
    );
  };

  const handleRefresh = () => {
    loadItems();
    loadPending();
    setSearchTerm("");
    toast.success("Data refreshed successfully!");
  };

  const renderPagination = () => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(pagination.last_page, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const displayItems = onlyMine ? pendingItems : items;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Review and approve seva bookings
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
          </button>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by receipt no, devotee or seva..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats + filter */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        {[
          ["Awaiting Approval", pendingItems.length, "text-amber-600"],
          [
            "You can approve",
            pendingItems.filter((a) => a.can_approve).length,
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
            "text-emerald-600",
          ],
          [
            "Not in your authority",
<<<<<<< HEAD
            rows.filter((r) => !r.can_approve).length,
=======
            pendingItems.filter((a) => !a.can_approve).length,
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
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

<<<<<<< HEAD
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
=======
      {/* Filter toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setOnlyMine(true)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
            onlyMine
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"
          }`}
        >
          Awaiting You
        </button>
        <button
          onClick={() => setOnlyMine(false)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
            !onlyMine
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"
          }`}
        >
          All Bookings
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Seva
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Perform Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Devotee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Persons
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : displayItems.length > 0 ? (
                displayItems.map((item) => (
                  <tr
                    key={item.booking_id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/masters/hall-shop-management/seva-bookings-approval/view/${item.booking_id}`
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm mr-3">
                          <Building className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {item.service?.name || "—"}
                          </div>
                          {item.receipt_no && (
                            <div className="text-xs font-medium text-blue-600">
                              {item.receipt_no}
                            </div>
                          )}
                          {item.service?.priest_required && !item.priest_id && (
                            <div className="text-xs text-amber-600">
                              Priest not assigned
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Package className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {item.package?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {formatDate(item.perform_date)}
                      </div>
                      {item.slot && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(item.slot.start_time)} -{" "}
                          {formatTime(item.slot.end_time)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {item.devotee_name || "N/A"}
                      </div>
                      {item.devotee_mobile && (
                        <div className="text-xs text-gray-500">
                          {item.devotee_mobile}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Users className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {item.group_size ?? item.persons} group
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.persons} served
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹
                        {Number(item.total_amount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      {item.payment_status && (
                        <div className="text-xs text-gray-500">
                          {item.payment_status}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item)}</td>
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/hall-shop-management/seva-bookings-approval/view/${item.booking_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View & Approve"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching bookings found"
                          : "No bookings pending for approval"}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "All bookings have been processed"}
                      </p>
                    </div>
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
            entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage == page
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.last_page, p + 1))
              }
              disabled={currentPage == pagination.last_page}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </button>
>>>>>>> 1df1ea3a27d9e1a4d71457bb4c11d39a93d84339
          </div>
        </div>
      )}
    </div>
  );
};

export default SevaApprovals;
