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

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
            {/* <p className="text-sm text-gray-500">
            {isAdmin ? "Admin Approval Dashboard - Review HOD Approved donations" : "HOD Approval Dashboard - Review Pending donations"}
          </p> */}
          </div>
          
        </div>
        <button
          onClick={loadItems}
          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition flex items-center gap-2"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Role Badge */}
      <div className={`mb-6 p-3 rounded-lg ${isAdmin ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
        <div className="flex items-center gap-2">
          {isAdmin ? <Crown className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {isAdmin ? "Admin Role" : "HOD Role"} - {isAdmin ? "Can approve HOD Approved (27) → Admin Approved (28)" : "Can approve Pending (26) → HOD Approved (27)"}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={searchTerm} onChange={handleSearchChange}
                placeholder="Receipt No, Donor, Bill..."
                className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyMine(!onlyMine)}
              className={`px-3 py-2 text-xs font-medium rounded transition ${onlyMine ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              {onlyMine ? "Awaiting You" : "All Donations"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Type / Purity</th>
                <th className="px-4 py-3">Weight (g)</th>
                <th className="px-4 py-3">Valuation</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No donations pending approval for your role.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.transaction_id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.receipt_no}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.category?.category_name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.type?.type_name || "-"} / {item.purity?.purity_name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {Number(item.weight_in_gram || 0).toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      ₹{Number(item.valuation_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.donor?.donor_name || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/transactions/donation/approval/view/${item.transaction_id}`}
                          className="px-3 py-1.5 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </Link>
                        {canHodApprove(item) && (
                          <button
                            onClick={() => handleAction(item, 27, "HOD Approve")}
                            className="px-3 py-1.5 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> HOD Approve
                          </button>
                        )}
                        {canAdminApprove(item) && (
                          <button
                            onClick={() => handleAction(item, 28, "Admin Approve")}
                            className="px-3 py-1.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Admin Approve
                          </button>
                        )}
                        {canQuery(item) && (
                          <button
                            onClick={() => handleAction(item, 29, "Query")}
                            className="px-3 py-1.5 text-[11px] font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" /> Query
                          </button>
                        )}
                        {canSentBack(item) && (
                          <button
                            onClick={() => handleAction(item, 30, "Sent Back")}
                            className="px-3 py-1.5 text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition flex items-center gap-1"
                          >
                            <UserCircle className="w-3 h-3" /> Sent Back
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {pagination.from} to {pagination.to} of {pagination.total} entries
          </p>
          <div className="flex gap-1">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded text-xs transition ${p === currentPage ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationApproval;
