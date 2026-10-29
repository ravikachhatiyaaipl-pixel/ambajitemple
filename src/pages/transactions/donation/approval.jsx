import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  RefreshCw,
  ArrowLeft,
  Calendar,
  User,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Package,
  IndianRupee,
  Scale,
  Loader2,
  CheckCircle,
  UserCircle,
  Crown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import debounce from "lodash/debounce";
import DonationApi from "../../services/donationapi";

/**
 * S13 - DONATION APPROVAL DASHBOARD
 *
 * Flow (action_master stage 'DON'):
 *   26 Pending -> 27 HOD Approved -> 28 Admin Approved
 *                 27 -> 29 Query / 30 Sent Back / 31 Rejected
 *
 * Rule: HOD must approve first (26→27), then Admin approves (27→28).
 * Admin cannot approve Pending (26) - that's HOD's job.
 * Non-admin cannot approve their own entry (maker-checker).
 */
const DonationApproval = ({ user }) => {
  const navigate = useNavigate();

  const isAdmin = (user?.Usr_Role_Id === 1) || (user?.role_id === 1) || (user?.Usr_RoleId === 1);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("Donation Approval");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [chain, setChain] = useState([]);
  const [onlyMine, setOnlyMine] = useState(true);

  const statusLabel = (s) => {
    const m = { 26: "Pending", 27: "HOD Approved", 28: "Admin Approved", 29: "Query", 30: "Sent Back", 31: "Rejected" };
    return m[s] || String(s);
  };

  const statusColor = (s) => {
    if (s === 28) return "bg-emerald-100 text-emerald-700";
    if (s === 27) return "bg-blue-100 text-blue-700";
    if (s === 26) return "bg-amber-100 text-amber-700";
    if (s === 29) return "bg-orange-100 text-orange-700";
    if (s === 30) return "bg-purple-100 text-purple-700";
    if (s === 31) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/transactions/donation/approval";
      const currentMenuItem = menuDetails.find((item) => item.Menu_Links === currentPath);
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

  useEffect(() => {
    loadItems();
  }, [currentPage, searchDebounced, onlyMine]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 10 };
      if (searchDebounced) params.search = searchDebounced;
      const res = await DonationApi.getPendingApprovals(params);
      const data = res?.data;
      let list = data?.data || [];

      // Role-based filtering
      if (isAdmin) {
        list = list.filter((item) => [27, 29, 30, 31].includes(Number(item.status)));
      } else {
        list = list.filter((item) => [26, 29, 30].includes(Number(item.status)));
      }

      setItems(list);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        per_page: data?.per_page || 10,
        total: data?.total || 0,
        from: data?.from || 0,
        to: data?.to || 0,
      });
      if (res?.meta?.chain) setChain(res.meta.chain);
    } catch (e) {
      console.error("Failed to load donations:", e);
    } finally {
      setLoading(false);
    }
  };

  const canHodApprove = (item) => {
    return Number(item.status) === 26 && !isAdmin; // Pending - only HOD can approve
  };

  const canAdminApprove = (item) => {
    return Number(item.status) === 27 && isAdmin; // HOD Approved - only Admin can approve
  };

  const canQuery = (item) => {
    return [26, 27].includes(Number(item.status));
  };

  const canSentBack = (item) => {
    return [26, 27].includes(Number(item.status));
  };

  const handleAction = async (item, actionId, actionName) => {
    const confirmed = window.confirm(`Are you sure you want to ${actionName} this donation?`);
    if (!confirmed) return;

    try {
      const res = await DonationApi.act(item.transaction_id, {
        action_id: actionId,
        remarks: `Action: ${actionName}`,
      });
      if (res.success) {
        toast.success(`Donation ${actionName} successfully`);
        loadItems();
      } else {
        toast.error(res.message || "Action failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Error performing action");
    }
  };

  // ---- display-only helpers (UI) ----
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    let val = Number(amount || 0);
    if (!isFinite(val) || val < 0) val = 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
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

  const approvableCount = items.filter(
    (a) => canHodApprove(a) || canAdminApprove(a)
  ).length;

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isAdmin
                ? "Admin Approval Dashboard - Review HOD Approved donations"
                : "HOD Approval Dashboard - Review Pending donations"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadItems}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Role Badge */}
      <div
        className={`mb-6 p-3 rounded-lg border ${
          isAdmin
            ? "bg-blue-50 border-blue-200 text-blue-800"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}
      >
        <div className="flex items-center gap-2">
          {isAdmin ? <Crown className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {isAdmin ? "Admin Role" : "HOD Role"} -{" "}
            {isAdmin
              ? "Can approve HOD Approved (27) → Admin Approved (28)"
              : "Can approve Pending (26) → HOD Approved (27)"}
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by receipt no, donor or bill..."
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
        {[
          ["Awaiting Approval", items.length, "text-amber-600"],
          ["You can approve", approvableCount, "text-emerald-600"],
          ["Not in your authority", items.length - approvableCount, "text-gray-500"],
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
          All Donations
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  "Donation",
                  "Category",
                  "Donation Date",
                  "Donor",
                  "Weight",
                  "Valuation",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
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
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.transaction_id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/transactions/donation/approval/view/${item.transaction_id}`
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center shadow-sm mr-3">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {item.receipt_no}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.type?.type_name || "--"}  -{" "}
                            {item.purity?.purity_name || "--"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.category?.category_name || "--"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {formatDate(item.donation_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {item.donor?.donor_name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.donor?.donor_phone || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Scale className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {Number(item.weight_in_gram || 0).toFixed(3)} g
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.valuation_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(
                          item.status
                        )}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1 flex-wrap">
                        <Link
                          to={`/transactions/donation/approval/view/${item.transaction_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canHodApprove(item) && (
                          <button
                            onClick={() => handleAction(item, 27, "HOD Approve")}
                            className="px-3 py-1.5 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> HOD Approve
                          </button>
                        )}
                        {canAdminApprove(item) && (
                          <button
                            onClick={() => handleAction(item, 28, "Admin Approve")}
                            className="px-3 py-1.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Admin Approve
                          </button>
                        )}
                        {canQuery(item) && (
                          <button
                            onClick={() => handleAction(item, 29, "Query")}
                            className="px-3 py-1.5 text-[11px] font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" /> Query
                          </button>
                        )}
                        {canSentBack(item) && (
                          <button
                            onClick={() => handleAction(item, 30, "Sent Back")}
                            className="px-3 py-1.5 text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition flex items-center gap-1"
                          >
                            <UserCircle className="w-3 h-3" /> Sent Back
                          </button>
                        )}
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
                          ? "No matching donations found"
                          : "No donations pending for approval"}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "No donations pending approval for your role."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationApproval;
