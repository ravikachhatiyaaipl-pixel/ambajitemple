// src/pages/Finance/BudgetManagement/BudgetInitialEntry/List.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Building,
  IndianRupee,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart,
  Clock,
  RotateCcw,
  Ban,
  FileCheck,
  Shield,
  ChevronDown,
  Lock,
  PieChart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import budgetEntryApi from "../../../services/budgetentryapi";

const BudgetInitialEntryList = ({ user }) => {
  const navigate = useNavigate();
  const [budgetEntries, setBudgetEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pageTitle, setPageTitle] = useState(
    "Budget Initial Entries Management",
  );
  const [summary, setSummary] = useState({
    total_amount: 0,
    formatted_total_amount: "₹ 0.00",
    total_records: 0,
  });

  // States for filters
  const [statusFilter, setStatusFilter] = useState("D");
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFY, setSelectedFY] = useState(null);
  const [loadingFY, setLoadingFY] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Status options with counts from API
  const [statusCounts, setStatusCounts] = useState({
    D: 0,
    R: 0,
    P: 0,
    F: 0,
    RR: 0,
    RJ: 0,
    J: 0,
    A: 0,
    I: 0,
  });

  // Status texts mapping from API
  const [statusTexts, setStatusTexts] = useState({
    D: "Draft",
    R: "Revised",
    J: "Justification",
    P: "Approve",
    F: "Freeze",
    RJ: "Reject",
    A: "Active",
    I: "Inactive",
    RR: "Re-Revised",
  });

  // Condition for editable and deletable statuses
  const canEditEntry = (status) => {
    return status == "D" || status == "R" || status == "RR" || status == "J" || status == "F";
  };

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/budget-management/budgetinitialentry";

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

  // Load financial years on component mount
  useEffect(() => {
    loadFinancialYears();
  }, []);

  // Load budget entries when page, status filter, or selected FY changes
  useEffect(() => {
    if (initialLoadComplete && selectedFY) {
      loadBudgetEntries();
    }
  }, [currentPage, statusFilter, selectedFY, searchTerm]);

  // Load status counts when selected FY changes
  useEffect(() => {
    if (initialLoadComplete && selectedFY) {
      loadStatusCounts();
    }
  }, [selectedFY]);

  // Load financial years from API
  const loadFinancialYears = async () => {
    try {
      setLoadingFY(true);

      const response = await budgetEntryApi.getFinancialYears();

      if (response.success && response.data) {
        setFinancialYears(response.data);

        // Find current financial year
        const currentFY = response.data.find(
          (year) => year.is_current_year == true,
        );

        // Set selected FY to current year or first year if no current year
        setSelectedFY(
          currentFY || (response.data.length > 0 ? response.data[0] : null),
        );

        setInitialLoadComplete(true);
      } else {
        toast.error("Failed to load financial years");
        setInitialLoadComplete(true);
      }
    } catch (error) {
      console.error("Error loading financial years:", error);
      toast.error("Failed to load financial years");
      setInitialLoadComplete(true);
    } finally {
      setLoadingFY(false);
    }
  };

  // Load status counts from API based on selected FY
  const loadStatusCounts = async () => {
    if (!selectedFY) return;

    try {
      const params = {};

      const response = await budgetEntryApi.getStatusCounts(params);

      if (response.success && response.data) {
        const counts = {};
        const texts = {};
        let totalAmount = 0;
        let totalRecords = 0;

        response.data.forEach((item) => {
          const statusCode = item.status_code;
          counts[statusCode] = parseInt(item.count) || 0;
          texts[statusCode] = item.status_text;
          totalAmount += parseFloat(item.amount) || 0;
          totalRecords += parseInt(item.count) || 0;
        });

        setStatusCounts(counts);
        setStatusTexts(texts);

        setSummary((prev) => ({
          ...prev,
          total_records: totalRecords,
          total_amount: totalAmount,
          formatted_total_amount: `₹ ${totalAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        }));
      }
    } catch (error) {
      console.error("Error loading status counts:", error);
    }
  };

  // Load budget entries based on selected FY and filters
  const loadBudgetEntries = async () => {
    if (!selectedFY) return;

    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        status: statusFilter,
        Fin_Year: selectedFY.FY_Id,
        is_latest: true,
      };

      // Add search param if exists
      if (searchTerm && searchTerm.trim() != "") {
        params.search = searchTerm.trim();
      }

      const response = await budgetEntryApi.getAll(params);

      if (response.success) {
        setBudgetEntries(response.data || []);

        if (response.summary) {
          setSummary(response.summary);
        }

        if (response.pagination) {
          setTotalItems(response.pagination.total || 0);
          setTotalPages(response.pagination.last_page || 1);
        }
      }
    } catch (error) {
      console.error("Error loading budget entries:", error);
      toast.error("Failed to load budget entries");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle financial year change
  const handleFYChange = (e) => {
    const fyId = parseInt(e.target.value);
    const selected = financialYears.find((fy) => fy.FY_Id == fyId);
    setSelectedFY(selected);
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const handleDeleteEntry = async (id, status) => {
    // Check if entry can be deleted based on status
    if (!canEditEntry(status)) {
      const statusLabel = statusTexts[status] || status;
      toast.error(
        `Cannot delete ${statusLabel} entries. Only Draft, Revised, Re-Revised, and Justification entries can be deleted.`,
      );
      return;
    }

    const result = await Swal.fire({
      title: "Delete Budget Entry?",
      text: `Are you sure you want to delete this budget entry?`,
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
        await budgetEntryApi.delete(id);
        await loadStatusCounts();
        await loadBudgetEntries();
        toast.success("Budget entry deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete budget entry");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length == 0) {
      toast.error("No entries selected");
      return;
    }

    // Check if any selected entry cannot be deleted
    const nonDeletableEntries = budgetEntries
      .filter(
        (entry) =>
          selectedItems.includes(entry.budg_id) && !canEditEntry(entry.status),
      )
      .map((entry) => ({
        id: entry.budg_id,
        status: statusTexts[entry.status] || entry.status,
      }));

    if (nonDeletableEntries.length > 0) {
      const statusList = [
        ...new Set(nonDeletableEntries.map((e) => e.status)),
      ].join(", ");
      toast.error(
        `${nonDeletableEntries.length} selected ${nonDeletableEntries.length == 1 ? "entry has" : "entries have"} status ${statusList}. Only Draft, Revised, Re-Revised, and Justification entries can be deleted.`,
      );
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedItems.length} selected budget entries? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setBulkDeleting(true);
    try {
      const deletePromises = selectedItems.map((id) =>
        budgetEntryApi.delete(id).catch((error) => {
          console.error(`Failed to delete entry ${id}:`, error);
          return { success: false, id };
        }),
      );

      const results = await Promise.all(deletePromises);

      const successfulDeletes = results.filter(
        (result) => result?.success != false,
      ).length;
      const failedDeletes = results.length - successfulDeletes;

      if (failedDeletes == 0) {
        toast.success(
          `${successfulDeletes} budget entries deleted successfully!`,
        );
      } else if (successfulDeletes > 0) {
        toast.success(
          `${successfulDeletes} entries deleted. ${failedDeletes} entries failed.`,
        );
      } else {
        toast.error("Failed to delete all selected entries");
      }

      await loadStatusCounts();
      await loadBudgetEntries();
      setSelectedItems([]);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete entries. Please try again.");
    } finally {
      setBulkDeleting(false);
    }
  };

  // Refresh function
  const handleRefresh = () => {
    loadBudgetEntries();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      D: {
        label: statusTexts.D || "Draft",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      R: {
        label: statusTexts.R || "Revised",
        color: "bg-blue-100 text-blue-800",
        icon: RotateCcw,
      },
      J: {
        label: statusTexts.J || "Justification",
        color: "bg-amber-100 text-amber-800",
        icon: FileCheck,
      },
      P: {
        label: statusTexts.P || "Approved",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      F: {
        label: statusTexts.F || "Frozen",
        color: "bg-purple-100 text-purple-800",
        icon: Shield,
      },
      RJ: {
        label: statusTexts.RJ || "Rejected",
        color: "bg-red-100 text-red-800",
        icon: Ban,
      },
      A: {
        label: statusTexts.A || "Active",
        color: "bg-teal-100 text-teal-800",
        icon: CheckCircle,
      },
      I: {
        label: statusTexts.I || "Inactive",
        color: "bg-gray-100 text-gray-800",
        icon: Clock,
      },
      RR: {
        label: statusTexts.RR || "Re-Revised",
        color: "bg-cyan-100 text-cyan-800",
        icon: RotateCcw,
      },
    };

    const config = statusConfig[status] || statusConfig["D"];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Helper function to safely get department name
  const getDepartmentName = (entry) => {
    if (entry.department) {
      return entry.department.desc || "";
    }
    return "";
  };

  const getDepartmentEnglishName = (entry) => {
    if (entry.department) {
      return entry.department.name || "";
    }
    return "";
  };

  // Helper function to safely get budget head name
  const getBudgetHeadName = (entry) => {
    if (entry.budget_head) {
      return entry.budget_head.gr_nm || "";
    }
    return "";
  };

  const StatCard = ({
    title,
    value,
    subValue,
    icon: Icon,
    color,
    status,
    count,
    isActive,
    onClick,
  }) => {
    const colors = {
      yellow: {
        bg: "bg-gradient-to-r from-yellow-500 to-amber-600",
        text: "text-yellow-700",
        border: "border-yellow-200",
        iconBg: "bg-yellow-500",
        gradient: "from-yellow-500 to-amber-600",
      },
      blue: {
        bg: "bg-gradient-to-r from-blue-500 to-blue-600",
        text: "text-blue-700",
        border: "border-blue-200",
        iconBg: "bg-blue-500",
        gradient: "from-blue-500 to-blue-600",
      },
      green: {
        bg: "bg-gradient-to-r from-green-500 to-green-600",
        text: "text-green-700",
        border: "border-green-200",
        iconBg: "bg-green-500",
        gradient: "from-green-500 to-green-600",
      },
      purple: {
        bg: "bg-gradient-to-r from-purple-500 to-purple-600",
        text: "text-purple-700",
        border: "border-purple-200",
        iconBg: "bg-purple-500",
        gradient: "from-purple-500 to-purple-600",
      },
      cyan: {
        bg: "bg-gradient-to-r from-cyan-500 to-cyan-600",
        text: "text-cyan-700",
        border: "border-cyan-200",
        iconBg: "bg-cyan-500",
        gradient: "from-cyan-500 to-cyan-600",
      },
      red: {
        bg: "bg-gradient-to-r from-red-500 to-red-600",
        text: "text-red-700",
        border: "border-red-200",
        iconBg: "bg-red-500",
        gradient: "from-red-500 to-red-600",
      },
      amber: {
        bg: "bg-gradient-to-r from-amber-500 to-amber-600",
        text: "text-amber-700",
        border: "border-amber-200",
        iconBg: "bg-amber-500",
        gradient: "from-amber-500 to-amber-600",
      },
      teal: {
        bg: "bg-gradient-to-r from-teal-500 to-teal-600",
        text: "text-teal-700",
        border: "border-teal-200",
        iconBg: "bg-teal-500",
        gradient: "from-teal-500 to-teal-600",
      },
      gray: {
        bg: "bg-gradient-to-r from-gray-500 to-gray-600",
        text: "text-gray-700",
        border: "border-gray-200",
        iconBg: "bg-gray-500",
        gradient: "from-gray-500 to-gray-600",
      },
    }[color];

    return (
      <button
        onClick={onClick}
        className={`w-full bg-white rounded-xl border ${
          isActive
            ? colors.border + " ring-2 ring-offset-2 " + colors.text
            : colors.border
        } p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden text-left`}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subValue && (
              <p className={`text-sm font-medium ${colors.text}`}>{subValue}</p>
            )}
          </div>
          <div
            className={`text-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300 ${colors.bg}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {isActive && (
          <div className="absolute top-3 right-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        )}
      </button>
    );
  };

  // Status cards data using API counts
  const statusCards = [
    {
      status: "D",
      label: statusTexts.D || "Draft",
      icon: Clock,
      color: "yellow",
      count: statusCounts.D || 0,
    },
    {
      status: "R",
      label: statusTexts.R || "Revised",
      icon: RotateCcw,
      color: "blue",
      count: statusCounts.R || 0,
    },
    {
      status: "J",
      label: statusTexts.J || "Justification",
      icon: FileCheck,
      color: "amber",
      count: statusCounts.J || 0,
    },
    {
      status: "P",
      label: statusTexts.P || "Approved",
      icon: CheckCircle,
      color: "green",
      count: statusCounts.P || 0,
    },
    {
      status: "F",
      label: statusTexts.F || "Frozen",
      icon: Shield,
      color: "purple",
      count: statusCounts.F || 0,
    },
    {
      status: "RJ",
      label: statusTexts.RJ || "Rejected",
      icon: Ban,
      color: "red",
      count: statusCounts.RJ || 0,
    },
    {
      status: "RR",
      label: statusTexts.RR || "Re-Revised",
      icon: RotateCcw,
      color: "cyan",
      count: statusCounts.RR || 0,
    },
  ];

  return (
    <div className="p-6">
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
            <p className="text-gray-600 mt-1">
              Manage budget allocations, track financial year budgets, and
              monitor departmental allocations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/transactions/budget-management/budgetinitialentry/create"
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Entry
          </Link>
        </div>
      </div>

      {/* Loading state for initial load */}
      {!initialLoadComplete && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial year data...</p>
        </div>
      )}

      {/* Main content - only show after initial load */}
      {initialLoadComplete && (
        <>
          {/* Statistics Cards - Status wise */}
          {selectedFY && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              {statusCards.map((card) => (
                <StatCard
                  key={card.status}
                  title={card.label}
                  value={card.count}
                  subValue="entries"
                  icon={card.icon}
                  color={card.color}
                  status={card.status}
                  count={card.count}
                  isActive={statusFilter == card.status}
                  onClick={() => {
                    setStatusFilter(card.status);
                    setCurrentPage(1);
                  }}
                />
              ))}
            </div>
          )}

          {/* Financial Year Selection */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Financial Year Dropdown */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  <label
                    htmlFor="financial-year"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Select Financial Year
                  </label>
                  {loadingFY && (
                    <div className="ml-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <select
                    id="financial-year"
                    value={selectedFY?.FY_Id || ""}
                    onChange={handleFYChange}
                    className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg appearance-none bg-white shadow-sm group-hover:shadow-md transition-shadow duration-200"
                    disabled={loadingFY}
                  >
                    <option value="" disabled className="text-gray-500">
                      Choose a financial year...
                    </option>
                    {financialYears.map((fy) => (
                      <option key={fy.FY_Id} value={fy.FY_Id} className="py-2">
                        {fy.FY_Name} ({fy.FY_Code})
                        {fy.is_current_year ? " Current Year" : ""}
                      </option>
                    ))}
                  </select>

                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <div className="p-1 bg-blue-100 rounded-md group-hover:bg-blue-200 transition-colors duration-200">
                      <ChevronDown className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected FY Details Card */}
              {selectedFY && (
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-lg"></div>

                  <div className="relative bg-white rounded-lg p-5 border-2 border-blue-100 shadow-md group-hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                          <Calendar className="h-7 w-7 text-white" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {selectedFY.FY_Name}
                          </h3>
                          {selectedFY.is_current_year && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              Current Year
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">From:</span>
                            <span>
                              {new Date(selectedFY.St_Date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                          <div className="flex items-center gap-1">
                            <span className="font-medium">To:</span>
                            <span>
                              {new Date(selectedFY.Ed_Date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by department or budget head..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Budget Entries Table */}
          {selectedFY ? (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Budget Head
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Budget Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Suggested Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
                            <p className="mt-4 text-gray-600">
                              Loading budget entries...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : budgetEntries.length > 0 ? (
                      budgetEntries.map((entry) => (
                        <tr
                          key={entry.budg_id}
                          className="hover:bg-gray-50 transition-colors duration-150 group"
                          onClick={(e) => {
                            if (!e.target.closest(".action-buttons")) {
                              navigate(
                                `/transactions/budget-management/budgetinitialentry/view/${entry.budg_id}`,
                              );
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Building className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-900">
                                  {getDepartmentName(entry)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 pl-6">
                                {getDepartmentEnglishName(entry)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <PieChart className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">
                                {getBudgetHeadName(entry)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-bold text-green-700">
                                  {entry.formatted_amount || "₹ 0.00"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <IndianRupee className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-bold text-blue-700">
                                  {entry.sug_amount
                                    ? `₹ ${parseFloat(
                                        entry.sug_amount,
                                      ).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}`
                                    : "₹ 0.00"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {getStatusBadge(entry.status)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(entry.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(entry.created_at).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </td>
                          <td
                            className="px-6 py-4 action-buttons"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center space-x-1">
                              <Link
                                to={`/transactions/budget-management/budgetinitialentry/view/${entry.budg_id}`}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                title="View entry details"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>

                              {canEditEntry(entry.status) ? (
                                <Link
                                  to={`/transactions/budget-management/budgetinitialentry/edit/${entry.budg_id}`}
                                  className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-150"
                                  title="Edit entry"
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                              ) : (
                                <button
                                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors duration-150 cursor-not-allowed"
                                  title={`Cannot edit ${statusTexts[entry.status] || entry.status} entry`}
                                  disabled
                                >
                                  {
                                  entry.status == "P" ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : entry.status == "RJ" ? (
                                    <Ban className="h-4 w-4" />
                                  ) : (
                                    <Edit className="h-4 w-4" />
                                  )}
                                </button>
                              )}

                              {canEditEntry(entry.status) ? (
                                <button
                                  onClick={() =>
                                    handleDeleteEntry(
                                      entry.budg_id,
                                      entry.status,
                                    )
                                  }
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                                  title="Delete entry"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors duration-150 cursor-not-allowed"
                                  title={`Cannot delete ${statusTexts[entry.status] || entry.status} entry`}
                                  disabled
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                              <IndianRupee className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {searchTerm || statusFilter != "D"
                                ? "No entries found"
                                : "No draft budget entries yet"}
                            </h3>
                            <p className="text-gray-600 max-w-md mb-6">
                              {searchTerm
                                ? "No entries match your search criteria. Try adjusting your search term."
                                : statusFilter != "D"
                                  ? `No ${statusCards
                                      .find((c) => c.status == statusFilter)
                                      ?.label?.toLowerCase()} entries found for ${selectedFY.FY_Name}.`
                                  : "Get started by creating your first budget entry to allocate funds for departments."}
                            </p>
                            {!searchTerm && statusFilter == "D" && (
                              <Link
                                to="/transactions/budget-management/budgetinitialentry/create"
                                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-sm hover:shadow"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Entry
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination & Footer */}
              {budgetEntries.length > 0 && (
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-t border-gray-200 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                      {totalItems} entries
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage == 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
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
                              ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-sm"
                              : "bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
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
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Financial Year Selected
              </h3>
              <p className="text-gray-600">
                Please select a financial year from the dropdown above to view
                budget entries.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetInitialEntryList;
