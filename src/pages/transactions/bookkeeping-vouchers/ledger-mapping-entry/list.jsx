import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  XCircle as XCircleIcon,
  Folder,
  PieChart,
  Gift,
  Tag,
  IndianRupee,
  Building2,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import debounce from "lodash/debounce";

const API_BASE = import.meta.env.VITE_API_URL;
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
});

const STATUS_BADGE = {
  D:  { label: "Draft",         color: "bg-yellow-100 text-yellow-800" },
  R:  { label: "Revised",       color: "bg-blue-100 text-blue-800" },
  P:  { label: "Approved",      color: "bg-green-100 text-green-800" },
  F:  { label: "Freeze",        color: "bg-purple-100 text-purple-800" },
  A:  { label: "Active",        color: "bg-teal-100 text-teal-800" },
  I:  { label: "Inactive",      color: "bg-gray-100 text-gray-800" },
  RR: { label: "Re-Revised",    color: "bg-cyan-100 text-cyan-800" },
  RJ: { label: "Rejected",      color: "bg-red-100 text-red-800" },
  J:  { label: "Justification", color: "bg-amber-100 text-amber-800" },
};

/* ── helpers ── */
const formatAmount = (val) => {
  const n = parseFloat(val) || 0;
  return "₹ " + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getDepartments = (item) => {
  const seen = new Set();
  const depts = [];
  (item.grant_mappings || []).forEach((gm) => {
    const d = gm.department;
    if (d && !seen.has(d.Dpt_id)) {
      seen.add(d.Dpt_id);
      depts.push(d.Dpt_Desc || d.Dpt_Name || `Dept ${d.Dpt_id}`);
    }
  });
  return depts;
};

const getLatestBudgetEntry = (item) => {
  const entries = item.budget_entries || [];
  if (!entries.length) return null;
  return entries.find((e) => e.is_latest) || entries[entries.length - 1];
};

/* ══════════════════════════════════════════════════════════════ */
const LedgerMappingList = ({ user }) => {
  const navigate = useNavigate();

  const [records, setRecords]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [pagination, setPagination]     = useState({
    current_page: 1, last_page: 1, per_page: 25, total: 0, from: 0, to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Ledger Mapping Entry");
  const ITEMS_PER_PAGE = 10;

  /* page title from menu */
  useEffect(() => {
    try {
      const menu = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const item = menu.find(
        (m) => m.Menu_Links ==  "/transactions/bookkeeping-vouchers/ledger-mapping-entry"
      );
      if (item?.Fnc_Title) setPageTitle(item.Fnc_Title);
    } catch (_) {}
  }, []);

  /* debounced search */
  const debouncedSearch = useCallback(
    debounce((val) => { setSearchDebounced(val); setCurrentPage(1); }, 500),
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

  useEffect(() => { fetchRecords(); }, [currentPage, searchDebounced]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: ITEMS_PER_PAGE, page: currentPage });
      if (searchDebounced.trim()) params.append("search", searchDebounced.trim());

      const res = await axios.get(
        `${API_BASE}/lst-combined-lgr-grt-bgt?${params.toString()}`,
        authHeader()
      );

      if (res.data?.success) {
        const payload = res.data.data;
        const rows = Array.isArray(payload) ? payload : (payload?.data || []);
        setRecords(rows);
        setPagination({
          current_page: payload?.current_page || 1,
          last_page:    payload?.last_page    || 1,
          per_page:     payload?.per_page     || ITEMS_PER_PAGE,
          total:        payload?.total        || rows.length,
          from:         payload?.from         || 1,
          to:           payload?.to           || rows.length,
        });
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    const id = item.ledger?.Lg_Id;
    if (!id) return toast.error("Cannot determine record ID");

    Swal.fire({
      title: "Delete Record?",
      text: `Are you sure you want to delete "${item.ledger?.Lg_Name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const res = await axios.delete(`${API_BASE}/combined-lgr-grt-bgt/${id}`, authHeader());
          if (!res.data?.success) throw new Error(res.data?.message || "Delete failed");
          return res.data;
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error.message}`);
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        toast.success("Record deleted successfully!");
        fetchRecords();
      }
    });
  };

  /* pagination page numbers */
  const renderPagination = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end   = Math.min(pagination.last_page, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const hasActiveFilters = !!searchTerm;

  /* ── RENDER ── */
  return (
    <div className="p-6">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage combined ledger, grant &amp; budget records
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/transactions/bookkeeping-vouchers/ledger-mapping-entry/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group text-sm"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New
          </Link>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ledger name, code..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-300 flex items-center text-sm"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
            <button
              onClick={fetchRecords}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ledger Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Group</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Budget Head</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Grant Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Financial Year</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Budget Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">

              {/* Loading */}
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
                      <p className="mt-4 text-gray-600">Loading records...</p>
                    </div>
                  </td>
                </tr>

              /* Rows */
              ) : records.length > 0 ? (
                records.map((item, idx) => {
                  const lg          = item.ledger || {};
                  const latestEntry = getLatestBudgetEntry(item);
                  const depts       = getDepartments(item);
                  const lgId        = lg.Lg_Id;
                  const badge       = latestEntry
                    ? STATUS_BADGE[latestEntry.status] || { label: latestEntry.status_text || latestEntry.status, color: "bg-gray-100 text-gray-700" }
                    : null;

                  return (
                    <tr
                      key={lgId ?? idx}
                      className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                      onClick={(e) => {
                        if (!e.target.closest(".action-buttons")) {
                          navigate(`/transactions/bookkeeping-vouchers/ledger-mapping-entry/view/${lgId}`);
                        }
                      }}
                    >
                    

                      {/* Ledger Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {lg.Lg_Name?.charAt(0) || "L"}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                              {lg.Lg_Name || "—"}
                            </p>
                            {lg.Lg_Eng_Name && lg.Lg_Eng_Name !=  lg.Lg_Name && (
                              <p className="text-xs text-gray-400 leading-snug mt-0.5">{lg.Lg_Eng_Name}</p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {lg.Lg_Code && (
                                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">
                                  {lg.Lg_Code}
                                </span>
                              )}
                              {lg.Lg_Sub ==  "yes" && (
                                <span className="inline-flex items-center text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                                  <Tag className="h-2.5 w-2.5 mr-0.5" /> Sub
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="px-6 py-4">
                        {lg.ledger_group ? (
                          <div className="flex items-start gap-1.5">
                            <Folder className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-900 font-medium line-clamp-2">
                              {lg.ledger_group.Gr_Nm}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <Folder className="h-4 w-4 mr-1.5" />
                            <span className="text-sm">—</span>
                          </div>
                        )}
                      </td>

                      {/* Budget Head */}
                      <td className="px-6 py-4">
                        {lg.budget_head ? (
                          <div className="flex items-start gap-1.5">
                            <PieChart className="h-3.5 w-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-900 font-medium line-clamp-2">{lg.budget_head.Gr_Nm}</p>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">{lg.budget_head.Gr_Cd}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <PieChart className="h-4 w-4 mr-1.5" />
                            <span className="text-sm">—</span>
                          </div>
                        )}
                      </td>

                      {/* Grant Type */}
                      <td className="px-6 py-4">
                        {lg.grant_type ? (
                          <div className="flex items-center gap-1.5">
                            <Gift className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-900 font-medium">{lg.grant_type.GT_Name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <Gift className="h-4 w-4 mr-1.5" />
                            <span className="text-sm">—</span>
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4">
                        {depts.length > 0 ? (
                          <div className="flex items-start gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="space-y-0.5">
                              {depts.slice(0, 2).map((d, i) => (
                                <p key={i} className="text-sm text-gray-700 leading-snug">{d}</p>
                              ))}
                              {depts.length > 2 && (
                                <span className="text-xs text-blue-500">+{depts.length - 2} more</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <Building2 className="h-4 w-4 mr-1.5" />
                            <span className="text-sm">—</span>
                          </div>
                        )}
                      </td>

                      {/* Financial Year */}
                      <td className="px-6 py-4">
                        {latestEntry?.financial_year ? (
                          <div className="flex items-start gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {latestEntry.financial_year.financial_year_code}
                              </p>
                              <p className="text-xs text-gray-400">
                                {latestEntry.financial_year.financial_year_name}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      {/* Amount — from the latest budget entry for this ledger's selected budget head */}
                      <td className="px-6 py-4 text-right">
                        {latestEntry ? (
                          <div className="flex items-center justify-end gap-1">
                            <IndianRupee className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-900">
                              {latestEntry.formatted_amount
                                ? latestEntry.formatted_amount.replace("₹ ", "")
                                : formatAmount(latestEntry.amount).replace("₹ ", "")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No budget</span>
                        )}
                      </td>

                      {/* Budget Status */}
                      <td className="px-6 py-4 text-center">
                        {badge ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Ledger Status */}
                      <td className="px-6 py-4 text-center">
                        {lg.Lg_Status ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 action-buttons" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/transactions/bookkeeping-vouchers/ledger-mapping-entry/view/${lgId}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/transactions/bookkeeping-vouchers/ledger-mapping-entry/edit/${lgId}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })

              /* Empty */
              ) : (
                <tr>
                  <td colSpan="11" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? "No matching records found" : "No records found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "Try adjusting your search term"
                          : "Get started by adding your first ledger mapping"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/transactions/bookkeeping-vouchers/ledger-mapping-entry/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Record
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {pagination.from} to {pagination.to} of {pagination.total} entries
            {searchTerm && " (filtered)"}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage ==  1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>

            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  currentPage ==  page
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                    : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={currentPage ==  pagination.last_page}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LedgerMappingList;
