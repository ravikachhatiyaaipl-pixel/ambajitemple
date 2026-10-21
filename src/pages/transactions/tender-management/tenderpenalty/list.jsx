import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  Copy,
  ChevronLeft,
  ChevronRight,
  Percent,
  Calculator,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Filter,
  X,
  Clock,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { tenderPenaltyApi } from "../../../services/tenderpenaltyapi";

const TenderPenaltyList = ({ user }) => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPenalties, setSelectedPenalties] = useState([]);
  const [sortField, setSortField] = useState("TA_Date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [pageTitle, setPageTitle] = useState("Tender Adjustment Master");
  const filterDropdownRef = useRef(null);

  const navigate = useNavigate();

  // Load page title from menu details (like reference code)
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/tender-management/tenderpenalty";

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

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status", color: "gray", icon: Filter },
    { value: "draft", label: "Draft", color: "yellow", icon: Clock },
    {
      value: "hod_app",
      label: "HOD Approved",
      color: "green",
      icon: CheckCircle,
    },
    { value: "hod_rej", label: "HOD Rejected", color: "red", icon: XCircle },
  ];

  useEffect(() => {
    loadPenalties();
  }, [currentPage, searchTerm, statusFilter]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadPenalties = async () => {
    setLoading(true);
    try {
      const response = await tenderPenaltyApi.getAll({
        page: currentPage,
        perPage: itemsPerPage,
        search: searchTerm,
        status: statusFilter != "all" ? statusFilter : undefined,
      });

      if (response.data) {
        setPenalties(response.data);
        setTotalItems(response.meta?.total || response.data.length);
        setTotalPages(response.meta?.last_page || 1);
      } else if (Array.isArray(response)) {
        setPenalties(response);
        setTotalItems(response.length);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load tender adjustments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField == field) {
      setSortDirection(sortDirection == "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedPenalties = [...penalties].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";

    if (aValue < bValue) return sortDirection == "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDeletePenalty = async (id, billNo) => {
    const result = await Swal.fire({
      title: "Delete Tender Adjustment?",
      text: `Are you sure you want to delete adjustment "${billNo || "ID: " + id}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await tenderPenaltyApi.delete(id);
        await loadPenalties();
        toast.success(`Tender adjustment deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete tender adjustment");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPenalties.length == 0) {
      toast.error("No tender adjustments selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedPenalties.length} selected tender adjustments?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedPenalties.map((id) =>
          tenderPenaltyApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadPenalties();
        setSelectedPenalties([]);
        toast.success(
          `${selectedPenalties.length} tender adjustments deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some tender adjustments");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    const num = parseFloat(amount);
    if (isNaN(num)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getPenaltyTypeColor = (type) => {
    return type == "A" || type == "Add"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getPenaltyTypeIcon = (type) => {
    return type == "A" || type == "Add" ? (
      <TrendingUp className="h-3 w-3 mr-1" />
    ) : (
      <TrendingDown className="h-3 w-3 mr-1" />
    );
  };

  const getFixPerDisplay = (fixPer) => {
    if (fixPer == "F") return "Fixed";
    if (fixPer == "P") return "Percentage";
    return fixPer;
  };

  const getLedgerDisplay = (ledger) => {
    if (!ledger) return "N/A";
    // Display English name if available, otherwise Gujarati name
    const displayName = ledger.Lg_Eng_Name || ledger.Lg_Name;
    return `${displayName} (${ledger.Lg_Code || "N/A"})`;
  };

  const getStatusBadge = (status, remarks) => {
    const statusConfig = {
      draft: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Draft",
      },
      hod_app: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "HOD Approved",
      },
      hod_rej: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "HOD Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
        >
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </span>
        {status == "hod_rej" && remarks && (
          <span
            className="text-xs text-red-600 mt-1 max-w-[200px]"
            title={remarks}
          >
            <span className="font-medium">Reason:</span>{" "}
            {remarks.length > 30 ? remarks.substring(0, 30) + "..." : remarks}
          </span>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

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
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              Manage and configure tender adjustments for contract compliance
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/transactions/tender-management/tenderpenalty/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Adjustment
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bill no..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`px-4 py-2.5 bg-white border rounded-lg flex items-center ${
                  statusFilter != "all"
                    ? "border-blue-500 text-blue-700 bg-blue-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                {statusOptions.find((s) => s.value == statusFilter)?.label ||
                  "Status"}
                {statusFilter != "all" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusFilter("all");
                    }}
                    className="ml-2 p-0.5 hover:bg-blue-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  {statusOptions.map((option) => {
                    const Icon = option.icon || Filter;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStatusFilter(option.value);
                          setShowFilterDropdown(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center hover:bg-gray-50 ${
                          statusFilter == option.value ? "bg-gray-100" : ""
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 mr-2 text-${option.color}-600`}
                        />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={loadPenalties}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {selectedPenalties.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedPenalties.length} adjustment(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedPenalties([])}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={
                      selectedPenalties.length == sortedPenalties.length &&
                      sortedPenalties.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPenalties(
                          sortedPenalties.map((p) => p.TA_Id),
                        );
                      } else {
                        setSelectedPenalties([]);
                      }
                    }}
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("TA_Date")}
                >
                  <div className="flex items-center">
                    Date
                    {sortField == "TA_Date" && (
                      <span className="ml-1">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Bill_No")}
                >
                  <div className="flex items-center">
                    Bill No
                    {sortField == "Bill_No" && (
                      <span className="ml-1">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub-Ledger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ledger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tender Allocation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Calculation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : sortedPenalties.length > 0 ? (
                sortedPenalties.map((penalty) => {
                  const penaltyId = penalty.TA_Id;
                  return (
                    <tr
                      key={penaltyId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedPenalties.includes(penaltyId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPenalties([
                                ...selectedPenalties,
                                penalty.TA_Id,
                              ]);
                            } else {
                              setSelectedPenalties(
                                selectedPenalties.filter(
                                  (id) => id != penaltyId,
                                ),
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(penalty.TA_Date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              penalty.Add_Deduct == "A" ||
                              penalty.Add_Deduct == "Add"
                                ? "bg-gradient-to-r from-green-500 to-green-600"
                                : "bg-gradient-to-r from-red-500 to-red-600"
                            }`}
                          >
                            <span className="text-white font-bold text-sm">
                              {penalty.Add_Deduct == "A" ||
                              penalty.Add_Deduct == "Add"
                                ? "A"
                                : "D"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {penalty.Bill_No || "N/A"}
                            </div>
                          </div>
                          {penalty.Bill_No && (
                            <button
                              onClick={() =>
                                handleCopyToClipboard(penalty.Bill_No)
                              }
                              className="ml-2 text-gray-400 hover:text-gray-600"
                              title="Copy bill no"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 flex items-center">
                            <User className="h-3 w-3 mr-1 text-gray-400" />
                            {penalty.subledger?.SL_Name || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {penalty.ledger ? (
                            <>
                              <div className="font-medium text-gray-900 flex items-center">
                                <BookOpen className="h-3 w-3 mr-1 text-gray-400" />
                                {penalty.ledger.Lg_Eng_Name ||
                                  penalty.ledger.Lg_Name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Code: {penalty.ledger.Lg_Code || "N/A"}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm max-w-xs">
                          <div className="font-medium text-gray-900 mb-1 flex items-start">
                            <Briefcase className="h-3 w-3 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                            <span>
                              {penalty.work_allocation?.tender?.Description ||
                                "N/A"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span>
                              Amount: {formatCurrency(penalty.WO_Amount)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPenaltyTypeColor(penalty.Add_Deduct)}`}
                          >
                            {getPenaltyTypeIcon(penalty.Add_Deduct)}
                            {penalty.Add_Deduct == "A" ||
                            penalty.Add_Deduct == "Add"
                              ? "Add"
                              : "Deduct"}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calculator className="h-3 w-3 mr-1" />
                            {getFixPerDisplay(penalty.Fix_Per)}
                            {penalty.Fix_Per == "P" && penalty.Percentage && (
                              <span className="ml-1 font-medium">
                                ({penalty.Percentage}%)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div
                            className={`font-bold ${
                              penalty.Add_Deduct == "A" ||
                              penalty.Add_Deduct == "Add"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {penalty.Add_Deduct == "A" ||
                            penalty.Add_Deduct == "Add"
                              ? "+"
                              : "-"}{" "}
                            {formatCurrency(penalty.Adj_Amount)}
                          </div>
                          {penalty.Fix_Per == "P" && penalty.Percentage && (
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <Percent className="h-3 w-3 mr-1" />
                              {penalty.Percentage}% of{" "}
                              {formatCurrency(penalty.WO_Amount)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(penalty.Status, penalty.Remarks)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/transactions/tender-management/tenderpenalty/view/${penaltyId}`}
                            className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/transactions/tender-management/tenderpenalty/edit/${penaltyId}`}
                            className="text-orange-600 hover:text-orange-900 p-1.5 hover:bg-orange-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDeletePenalty(penaltyId, penalty.Bill_No)
                            }
                            className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Calculator className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-1">
                        No tender adjustments found
                      </p>
                      <p className="text-sm mb-4">
                        {searchTerm || statusFilter != "all"
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first tender adjustment"}
                      </p>
                      {!searchTerm && statusFilter == "all" && (
                        <Link
                          to="/transactions/tender-management/tenderpenalty/create"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Adjustment
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

      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            adjustments
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg ${
                  currentPage == page
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage == totalPages}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderPenaltyList;
