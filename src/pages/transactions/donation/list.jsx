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
  Scale,
  IndianRupee,
  FileText,
  Package,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import debounce from "lodash/debounce";
import DonationApi from "../../services/donationapi";

/**
 * S12 - DONATION LIST (all donations with filters)
 */
const DonationList = ({ user }) => {
  const navigate = useNavigate();

  // Intl formatter - source me literal rupee sign nahi (encoding-safe)
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

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    DonationApi.getCategories()
      .then((r) => setCategories(r?.data?.data || r?.data || []))
      .catch(() => {});
  }, []);

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
  }, [currentPage, searchDebounced, categoryFilter, statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 10 };
      if (searchDebounced) params.search = searchDebounced;
      if (categoryFilter) params.category_id = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await DonationApi.getTransactions(params);
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
      toast.error(e.response?.data?.message || "Failed to load donations");
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
    const name = r.status_name || String(r.status || "").replace(/_/g, " ");
    const lower = name.toLowerCase();
    let cls = "bg-yellow-100 text-yellow-800";

    if (lower.includes("approv")) cls = "bg-green-100 text-green-800";
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
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Donation List</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              All gold / silver / diamond donations
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
            onClick={() => navigate("/transactions/donation/entry")}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            New Donation
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
              placeholder="Search by receipt no, donor or bill..."
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
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All Status</option>
            <option value="26">Pending</option>
            <option value="27">HOD Approved</option>
            <option value="28">Admin Approved</option>
            <option value="29">Query</option>
            <option value="30">Sent Back</option>
            <option value="31">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  "Receipt",
                  "Category / Type",
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
              ) : rows.length > 0 ? (
                rows.map((r) => (
                  <tr
                    key={r.transaction_id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/transactions/donation/approval/view/${r.transaction_id}`
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center shadow-sm mr-3">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-mono font-semibold text-gray-900 group-hover:text-blue-700">
                            {r.receipt_no}
                          </div>
                          <div className="text-xs text-gray-500">
                            Bill: {r.purchase_bill_no}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="font-medium">
                        {r.category?.category_name || "--"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.type?.type_name || "--"}  -{" "}
                        {r.purity?.purity_name || "--"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {formatDate(r.donation_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {r.donor?.donor_name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.donor?.donor_phone || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Scale className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {Number(r.weight_in_gram || 0).toFixed(3)} g
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(r.valuation_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(r)}</td>
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/transactions/donation/approval/view/${r.transaction_id}`}
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
                  <td colSpan="8" className="px-6 py-12 text-center text-sm text-gray-500">
                    No donations found.
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

export default DonationList;
