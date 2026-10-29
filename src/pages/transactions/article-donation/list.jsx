import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  RefreshCw,
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Package,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import debounce from "lodash/debounce";
import ArticleDonationApi from "../../services/articleDonationApi";

/**
 * ARTICLE & MATERIAL DONATION LIST (all article donations with filters)
 * Design - Donation (Gold) List jaisa same.
 */
const ArticleDonationList = ({ user }) => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchDebounced(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchDebounced, statusFilter, fromFilter, toFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 10 };
      if (searchDebounced) params.search = searchDebounced;
      if (statusFilter) params.status = statusFilter;
      if (fromFilter) params.from = fromFilter;
      if (toFilter) params.to = toFilter;

      const res = await ArticleDonationApi.getTransactions(params);
      const data = res?.data;
      setRows(data?.data || []);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        per_page: data?.per_page || 10,
        total: data?.total || 0,
        from: data?.from || 0,
        to: data?.to || 0,
      });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load article donations");
    } finally {
      setLoading(false);
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

  const statusBadge = (r) => {
    const name = r.status_name || STATUS_LABELS[r.status] || String(r.status);
    const lower = String(name).toLowerCase();
    let cls = "bg-yellow-100 text-yellow-800";

    if (lower.includes("admin approved")) cls = "bg-green-100 text-green-800";
    else if (lower.includes("hod")) cls = "bg-blue-100 text-blue-800";
    else if (
      lower.includes("reject") ||
      lower.includes("query") ||
      lower.includes("sent back")
    )
      cls = "bg-red-100 text-red-800";
    else if (lower.includes("pend")) cls = "bg-yellow-100 text-yellow-800";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
      >
        <Clock className="h-3 w-3 mr-1" />
        {name}
      </span>
    );
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
            <h1 className="text-2xl font-bold text-gray-900">
              Article &amp; Material Donation List
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              All article / material donations with approval status
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={load}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => navigate("/transactions/article-donation/entry")}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            New Article Donation
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by article, donor or phone..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                debouncedSearch(e.target.value);
              }}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSearchDebounced("");
                }}
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
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All Status</option>
            <option value="32">Pending</option>
            <option value="33">HOD Approved</option>
            <option value="34">Admin Approved</option>
            <option value="35">Query</option>
            <option value="36">Sent Back</option>
            <option value="37">Rejected</option>
          </select>

          <input
            type="date"
            value={fromFilter}
            onChange={(e) => {
              setFromFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          />
          <input
            type="date"
            value={toFilter}
            onChange={(e) => {
              setToFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          />
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
                  "Donation Date",
                  "Donor",
                  "Qty / Weight",
                  "Storage",
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
              ) : rows.length > 0 ? (
                rows.map((r) => (
                  <tr
                    key={r.article_id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/transactions/article-donation/approval/view/${r.article_id}`
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center shadow-sm mr-3">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                            {r.article_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID #{r.article_id}
                            {r.article_size ? ` - ${r.article_size}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {formatDate(r.purchase_date || r.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {r.donor_name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.donor_phone || ""}
                      </div>
                      {Array.isArray(r.co_donors) && r.co_donors.length > 0 && (
                        <div className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                          <Users className="h-3 w-3" />
                          {r.co_donors.length} co-donor
                          {r.co_donors.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        Qty: {r.article_quantity || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.article_weight
                          ? `${Number(r.article_weight).toFixed(3)} kg`
                          : "--"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {r.storage_location?.SPM_Name || "--"}
                      </div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(r)}</td>
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/transactions/article-donation/approval/view/${r.article_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                    No article donations found.
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
            Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
            entries
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

const STATUS_LABELS = {
  32: "Pending",
  33: "HOD Approved",
  34: "Admin Approved",
  35: "Query",
  36: "Sent Back",
  37: "Rejected",
};

export default ArticleDonationList;
