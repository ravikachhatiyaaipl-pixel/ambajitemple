import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  FileText,
  Building,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  ArrowLeft,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  DollarSign,
  Shield,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { NocEntryApi } from "../../../services/nocentryapi";

const NocEntryHodApprovalList = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("draft");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("HOD Approval - NOC Entries");

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/tender-management/noc-approval-entry";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // Status tabs configuration for HOD approval
  const statusTabs = [
    {
      status: "draft",
      label: "Pending Approval",
      icon: Clock,
      color: "yellow",
    },
    {
      status: "hod_app",
      label: "Approved",
      icon: CheckCircle,
      color: "green",
    },
    {
      status: "hod_rej",
      label: "Rejected",
      icon: XCircle,
      color: "red",
    },
  ];

  // Load entries on component mount and when filters change
  useEffect(() => {
    loadEntries();
  }, [currentPage, searchTerm, statusFilter]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const response = await NocEntryApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        statusFilter,
      );

      setEntries(response.entries || []);
      setTotalItems(response.pagination?.total || 0);
      setTotalPages(response.pagination?.last_page || 1);
    } catch (error) {
      toast.error("Failed to load NOC entries");
      console.error("Error loading entries:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadEntries();
  };

  // Handle status filter change
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Clear search
  const clearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Refresh handler
  const handleRefresh = () => {
    loadEntries();
    toast.success("Data refreshed successfully!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const truncateText = (text, length = 60) => {
    if (!text) return "N/A";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  // Get status badge
  const getStatusBadge = (status, remarks) => {
    const statusConfig = {
      draft: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        label: "Pending Approval",
        icon: Clock,
      },
      hod_app: {
        color: "bg-green-100 text-green-800 border border-green-200",
        label: "Approved",
        icon: CheckCircle,
      },
      hod_rej: {
        color: "bg-red-100 text-red-800 border border-red-200",
        label: "Rejected",
        icon: XCircle,
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <div className="flex flex-col">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}
        >
          <IconComponent className="h-3 w-3 mr-1" />
          {config.label}
        </span>
        {status?.toLowerCase() == "hod_rej" && remarks && (
          <div
            className="mt-1 text-xs text-red-600 truncate max-w-xs"
            title={remarks}
          >
            <span className="font-medium">Reason:</span>{" "}
            {remarks.length > 30 ? remarks.substring(0, 30) + "..." : remarks}
          </div>
        )}
      </div>
    );
  };

  // Get current status option
  const getCurrentStatusOption = () => {
    return (
      statusTabs.find((opt) => opt.status == statusFilter) || statusTabs[0]
    );
  };

  return (
    <div className="p-6">
      {/* Header - With dynamic pageTitle */}
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
            <p className="text-gray-600 mt-1">
              Review and approve/reject NOC entries
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-all"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Tabs - Only Pending, Approved, Rejected */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700">
            Filter by Status
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = statusFilter == tab.status;

            const colorClasses = {
              yellow: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
              green: "bg-green-100 text-green-700 hover:bg-green-200",
              red: "bg-red-100 text-red-700 hover:bg-red-200",
            };

            return (
              <button
                key={tab.status}
                onClick={() => handleStatusFilter(tab.status)}
                className={`
                  inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? `${colorClasses[tab.color]} ring-2 ring-offset-1 ring-${tab.color}-400`
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {tab.label}
                {isActive && (
                  <span className="ml-2 bg-white rounded-full p-0.5">
                    <CheckCircle className={`h-3 w-3 text-${tab.color}-600`} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tender description, vendor name, reference ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-24 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearFilters}
              className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* NOC Entries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Work Allocation Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Work Order Amount
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading NOC entries...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : entries.length > 0 ? (
                entries.map((entry) => {
                  const entryId = entry.WNE_Id;
                  const workAllocation = entry.work_allocation;
                  const tender = workAllocation?.tender;
                  const vendor = entry.subledger;

                  return (
                    <tr
                      key={entryId}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(entry.WNE_Date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {/* Reference ID */}
                          {workAllocation?.WA_RefId && (
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <Hash className="h-3 w-3 mr-1" />
                              Ref: {workAllocation.WA_RefId}
                            </div>
                          )}

                          {/* Tender Description */}
                          {tender && (
                            <>
                              <div
                                className="text-sm font-medium text-gray-900 mb-1"
                                title={tender.Description}
                              >
                                {truncateText(tender.Description, 50)}
                              </div>

                              {/* Work Order Amount - Now displayed inline with tender */}
                              <div className="flex items-center text-sm font-semibold text-green-600">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {formatCurrency(workAllocation.WO_Amount)}
                              </div>

                              {/* Tender Date (optional) */}
                              <div className="text-xs text-gray-400 mt-1">
                                Tender Date: {formatDate(tender.Tnd_Date)}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {vendor ? (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-900">
                              {vendor.SL_Name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {workAllocation?.WO_Amount ? (
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(workAllocation.WO_Amount)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(entry.Status, entry.Remarks)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/transactions/tender-management/noc-approval-entry/view/${entryId}`}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View Details & Approve/Reject"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No{" "}
                        {statusFilter == "draft"
                          ? "pending "
                          : statusFilter == "hod_app"
                            ? "approved "
                            : statusFilter == "hod_rej"
                              ? "rejected "
                              : ""}
                        NOC entries found
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No entries match your search criteria. Try adjusting your search."
                          : statusFilter == "draft"
                            ? "There are no pending NOC entries waiting for your approval."
                            : statusFilter == "hod_app"
                              ? "No approved NOC entries found."
                              : "No rejected NOC entries found."}
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
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage == pageNum
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage == totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
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

export default NocEntryHodApprovalList;
