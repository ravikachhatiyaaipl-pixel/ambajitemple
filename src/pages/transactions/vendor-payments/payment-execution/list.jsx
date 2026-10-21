import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  FileText,
  Building,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  ArrowLeft,
  CreditCard,
  Receipt,
  Filter,
  BookOpen,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  RefreshCw,
  X,
  Banknote,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { BillChallanEntryApi } from "../../../services/billchallanentryapi";

const PaymentExecutionList = ({ user }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("acco_app");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Payment Execution");

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/vendor-payments/payment-execution";

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

  // Status tabs configuration for Payment Execution
  const statusTabs = [
    {
      status: "acco_app",
      label: "Accounts Approved",
      icon: CheckCircle,
      color: "blue",
    },
    {
      status: "paid",
      label: "Paid",
      icon: DollarSign,
      color: "purple",
    },
    {
      status: "cancelled",
      label: "Cancelled",
      icon: XCircle,
      color: "red",
    },
  ];

  // Load vouchers on component mount and when filters change
  useEffect(() => {
    loadVouchers();
  }, [currentPage, searchTerm, statusFilter]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const response = await BillChallanEntryApi.getAll({
        page: currentPage,
        perPage: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
      });

      if (response.success && response.data) {
        const responseData = response.data;
        setVouchers(responseData.data || []);
        setTotalItems(responseData.total || 0);
        setTotalPages(responseData.last_page || 1);
      } else {
        setVouchers([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error("Failed to load payment vouchers");
      console.error(error);
      setVouchers([]);
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
    loadVouchers();
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
    loadVouchers();
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

  // Get payment status badge
  const getStatusBadge = (status, remarks) => {
    const statusConfig = {
      draft: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Draft",
        icon: Clock,
      },
      hod_app: {
        color: "bg-green-100 text-green-800",
        label: "HOD Approved",
        icon: CheckCircle,
      },
      hod_query: {
        color: "bg-amber-100 text-amber-800",
        label: "HOD Query",
        icon: AlertCircle,
      },
      acco_app: {
        color: "bg-blue-100 text-blue-800",
        label: "Accounts Approved",
        icon: CheckCircle,
      },
      acco_query: {
        color: "bg-orange-100 text-orange-800",
        label: "Accounts Query",
        icon: AlertCircle,
      },
      paid: {
        color: "bg-purple-100 text-purple-800",
        label: "Paid",
        icon: DollarSign,
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        label: "Cancelled",
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
        {status?.toLowerCase() == "cancelled" && remarks && (
          <div
            className="mt-1 text-xs text-gray-500 truncate max-w-xs"
            title={remarks}
          >
            <span className="font-medium">Remarks:</span> {remarks}
          </div>
        )}
      </div>
    );
  };

  // Helper function to get tender description
  const getTenderDescription = (voucher) => {
    return voucher.work_allocation?.tender?.Description || null;
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
              Process payment for approved vouchers
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

      {/* Status Tabs */}
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
              blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
              purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
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
            placeholder="Search by voucher number, department, vendor..."
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

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalItems}</span>{" "}
          total vouchers
          <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
            {statusTabs.find((t) => t.status == statusFilter)?.label ||
              "Accounts Approved"}
          </span>
          {searchTerm && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
              <Search className="h-3 w-3 mr-1" />"{searchTerm}"
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Voucher Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department & Ledger
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vendor / Work Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount & Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Bill Date
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
                        Loading payment vouchers...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : vouchers.length > 0 ? (
                vouchers.map((voucher) => {
                  const tenderDescription = getTenderDescription(voucher);

                  return (
                    <tr
                      key={voucher.PV_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {voucher.PV_No || `Voucher #${voucher.PV_Id}`}
                              </div>
                              {voucher.PV_No && (
                                <button
                                  onClick={() =>
                                    handleCopyToClipboard(voucher.PV_No)
                                  }
                                  className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Copy voucher number"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {/* Department Section */}
                          <div className="flex items-start">
                            <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {voucher.department?.Dpt_Desc || "N/A"}
                              </div>
                              {voucher.department?.Dpt_Name && (
                                <div className="text-xs text-gray-500">
                                  {voucher.department.Dpt_Name}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Ledger Section */}
                          <div className="flex items-start border-t border-gray-100 pt-2">
                            <BookOpen className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              {voucher.ledger?.Lg_Name && (
                                <div className="text-sm font-medium text-gray-900">
                                  {voucher.ledger.Lg_Name}
                                </div>
                              )}
                              {voucher.ledger?.Lg_Eng_Name && (
                                <div className="text-xs text-gray-500">
                                  {voucher.ledger.Lg_Eng_Name}
                                </div>
                              )}
                              {voucher.ledger?.Lg_Code && (
                                <div className="text-xs text-gray-500">
                                  {voucher.ledger.Lg_Code}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {/* Vendor Section */}
                          <div className="flex items-start">
                            <Users className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {voucher.sub_ledger?.SL_Name || "N/A"}
                              </div>
                            </div>
                          </div>

                          {/* Work Description Section */}
                          {tenderDescription && (
                            <div className="flex items-start border-t border-gray-100 pt-2">
                              <Briefcase className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="text-xs font-medium text-gray-700">
                                  Work Description:
                                </div>
                                <div
                                  className="text-sm text-gray-600 max-w-xs"
                                  title={tenderDescription}
                                >
                                  {tenderDescription.length > 60
                                    ? `${tenderDescription.substring(0, 60)}...`
                                    : tenderDescription}
                                </div>
                                {voucher.work_allocation?.tender
                                  ?.tendertype && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Type:{" "}
                                    {
                                      voucher.work_allocation.tender.tendertype
                                        .TnT_Name
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(voucher.Net_Amt)}
                          </div>
                          <div>
                            {getStatusBadge(voucher.Status, voucher.Remarks)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(voucher.PV_Chln_Date)}
                        </div>
                        {voucher.hod_approved_at && (
                          <div className="text-xs text-green-600 mt-1">
                            HOD Approved: {formatDate(voucher.hod_approved_at)}
                          </div>
                        )}
                        {voucher.Acct_Approved && (
                          <div className="text-xs text-blue-600 mt-1">
                            Accounts Approved:{" "}
                            {formatDate(voucher.Acct_Approved)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/transactions/vendor-payments/payment-execution/view/${voucher.PV_Id}`}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="Process Payment"
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
                        <Banknote className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No payment vouchers found
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No vouchers match your search criteria. Try adjusting your search."
                          : `No ${statusTabs.find((t) => t.status == statusFilter)?.label || "accounts approved"} vouchers available for payment execution.`}
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
            vouchers
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

export default PaymentExecutionList;
