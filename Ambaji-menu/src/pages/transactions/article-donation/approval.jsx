import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  RefreshCw,
  ArrowLeft,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Package,
  Loader2,
  CheckCircle,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import debounce from "lodash/debounce";
import ArticleDonationApi from "../../services/articleDonationApi";

/**
 * ARTICLE DONATION APPROVAL DASHBOARD
 * Design - Donation (Gold) Approval jaisa same.
 *
 * Flow (action_master stage 'ART') - DYNAMIC:
 *   32 Pending -> 33 HOD Approved -> 34 Admin Approved
 *                 33 -> 35 Query / 36 Sent Back / 37 Rejected
 * Buttons item ke allowed_actions (Action Master se) se aate hain.
 */
const ArticleDonationApproval = ({ user }) => {
  const navigate = useNavigate();

  const isAdmin = (user?.Usr_Role_Id === 1) || (user?.role_id === 1) || (user?.Usr_RoleId === 1);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("Article Donation Approval");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [onlyMine, setOnlyMine] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/transactions/article-donation/approval";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchDebounced, onlyMine, statusFilter]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 10 };
      if (searchDebounced) params.search = searchDebounced;
      if (onlyMine) params.status = "";
      else if (statusFilter) params.status = statusFilter;

      const res = await ArticleDonationApi.getPendingApprovals(params);
      const data = res?.data;
      let list = data?.data || [];

      setItems(list);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        per_page: data?.per_page || 10,
        total: data?.total || 0,
        from: data?.from || 0,
        to: data?.to || 0,
      });
    } catch (e) {
      console.error("Failed to load articles:", e);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (s) => {
    const m = { 32: "Pending", 33: "HOD Approved", 34: "Admin Approved", 35: "Query", 36: "Sent Back", 37: "Rejected" };
    return m[s] || String(s);
  };

  const statusColor = (s) => {
    if (s === 34) return "bg-emerald-100 text-emerald-700";
    if (s === 33) return "bg-blue-100 text-blue-700";
    if (s === 32) return "bg-amber-100 text-amber-700";
    if (s === 35) return "bg-orange-100 text-orange-700";
    if (s === 36) return "bg-purple-100 text-purple-700";
    if (s === 37) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  // Action button style per action name
  const actionBtnCls = (name) => {
    const lower = String(name || "").toLowerCase();
    if (lower.includes("admin approved"))
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100";
    if (lower.includes("hod"))
      return "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100";
    if (lower.includes("query"))
      return "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100";
    if (lower.includes("sent back"))
      return "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100";
    if (lower.includes("reject"))
      return "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100";
    return "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100";
  };

  const handleAction = async (item, action, remark = null) => {
    const confirmed = window.confirm(`Are you sure you want to "${action.St_Name}" this article donation?`);
    if (!confirmed) return;

    try {
      const res = await ArticleDonationApi.act(item.article_id, {
        action_id: action.Act_Id,
        remarks: remark || `Action: ${action.St_Name}`,
      });
      if (res.success) {
        toast.success(`Article donation "${action.St_Name}" successfully`);
        loadItems();
      } else {
        toast.error(res.message || "Action failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Error performing action");
    }
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

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
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
            <p className="text-gray-500 text-sm mt-0.5">Review article donations</p>
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

      {/* Filters */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by article, donor, phone..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            disabled={onlyMine}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm disabled:opacity-50"
          >
            <option value="">All Status</option>
            <option value="32">Pending</option>
            <option value="33">HOD Approved</option>
            <option value="35">Query</option>
            <option value="36">Sent Back</option>
            <option value="37">Rejected</option>
          </select>
          <button
            onClick={() => setOnlyMine(!onlyMine)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${onlyMine ? "bg-red-600 text-white shadow-sm" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            {onlyMine ? "Awaiting You" : "All Articles"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  "Article",
                  "Donor",
                  "Qty / Weight",
                  "Storage",
                  "Date",
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.article_id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center shadow-sm mr-3">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {item.article_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID #{item.article_id}
                            {item.article_size ? ` - ${item.article_size}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {item.donor_name || "-"}
                      </div>
                      <div className="text-xs text-gray-500">{item.donor_phone || ""}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        Qty: {item.article_quantity || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.article_weight
                          ? `${Number(item.article_weight).toFixed(3)} kg`
                          : "--"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.storage_location?.SPM_Name || "--"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.purchase_date
                        ? new Date(item.purchase_date).toLocaleDateString("en-IN")
                        : item.created_at?.slice(0, 10) || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(item.status)}`}>
                        {isAdmin && Number(item.status) === 32
                          ? "Waiting for HOD Approval"
                          : item.status_name || statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Link
                          to={`/transactions/article-donation/approval/view/${item.article_id}`}
                          className="px-3 py-1.5 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </Link>
                        {(item.allowed_actions || [])
                          .filter((a) => !isAdmin || Number(a.Act_Id) !== 37)
                          .map((a) => (
                          <button
                            key={a.Act_Id}
                            onClick={() => handleAction(item, a)}
                            className={`px-3 py-1.5 text-[11px] font-medium rounded transition flex items-center gap-1 ${actionBtnCls(a.St_Name)}`}
                          >
                            {a.Is_Forward === "Y" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {a.St_Name}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                    No article donations pending approval for your role.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {pagination.from} to {pagination.to} of {pagination.total} entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
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
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDonationApproval;
