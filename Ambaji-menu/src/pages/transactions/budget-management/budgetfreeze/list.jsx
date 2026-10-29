// src/pages/Finance/BudgetManagement/BudgetFreeze/List.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Edit,
  Eye,
  Calendar,
  Building,
  IndianRupee,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Filter,
  Snowflake,
  Lock,
  ChevronDown,
  PieChart,
  Shield,
} from "lucide-react";
import { toast } from "react-hot-toast";
import budgetEntryApi from "../../../services/budgetentryapi";

const BudgetFreezeList = ({ user }) => {
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
  const [statusFilter, setStatusFilter] = useState("P"); // Default to Approval
  const [pageTitle, setPageTitle] = useState("Budget Freeze Management");

  // Add summary state for totals
  const [summary, setSummary] = useState({
    total_amount: 0,
    formatted_total_amount: "₹ 0.00",
    total_records: 0,
  });

  // New states for filters (matching BudgetInitialEntryList pattern)
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFY, setSelectedFY] = useState(null);
  const [loadingFY, setLoadingFY] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Status counts - Both Approval (P) and Freeze (F)
  const [statusCounts, setStatusCounts] = useState({
    P: 0,
    F: 0,
  });

  // Status texts mapping
  const [statusTexts, setStatusTexts] = useState({
    P: "Approval",
    F: "Freeze",
  });

  // Helper function to safely get budget head name
  const getBudgetHeadName = (entry) => {
    if (entry.budget_head) {
      return entry.budget_head.gr_nm || "";
    }
    return "";
  };

  const getBudgetHeadCode = (entry) => {
    if (entry.budget_head) {
      return entry.budget_head.gr_cd || "";
    }
    return "";
  };

  // Load page title from menu details (like in BudgetInitialEntryList)
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/budget-management/budgetfreeze";

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

  // Load budget entries when page, status filter, selected FY, or search term changes
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

        // Show both P (Approval) and F (Freeze) statuses
        response.data.forEach((item) => {
          if (["P", "F"].includes(item.status_code)) {
            counts[item.status_code] = parseInt(item.count) || 0;
            texts[item.status_code] = item.status_text;
          }
        });

        setStatusCounts(counts);
        setStatusTexts((prev) => ({ ...prev, ...texts }));
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
        status: statusFilter, // Use selected status filter
        Fin_Year: selectedFY.FY_Id,
        is_latest: true,
      };

      // Add search param if exists (EXACTLY like reference code)
      if (searchTerm && searchTerm.trim() != "") {
        params.search = searchTerm.trim();
      }

      const response = await budgetEntryApi.getAll(params);

      if (response.success) {
        // Filter only P and F status entries
        const filteredEntries = (response.data || []).filter((entry) =>
          ["P", "F"].includes(entry.status),
        );
        setBudgetEntries(filteredEntries);

        // Update summary with totals from filtered entries
        const totalAmount = filteredEntries.reduce((sum, entry) => {
          return sum + (parseFloat(entry.amount) || 0);
        }, 0);

        setSummary({
          total_amount: totalAmount,
          formatted_total_amount: `₹ ${totalAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          total_records: filteredEntries.length,
        });

        if (response.pagination) {
          setTotalItems(response.pagination.total || 0);
          setTotalPages(response.pagination.last_page || 1);
        }
      } else {
        toast.error(response.message || "Failed to load budget entries");
      }
    } catch (error) {
      console.error("Error loading budget entries:", error);
      toast.error("Failed to load budget entries");
    } finally {
      setLoading(false);
    }
  };

  // EXACTLY like reference code - handle search input change
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
    setSearchTerm(""); // Clear search on FY change
  };

  // EXACTLY like reference code - refresh function
  const handleRefresh = () => {
    if (selectedFY) {
      Promise.all([loadStatusCounts(), loadBudgetEntries()]);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      P: {
        label: statusTexts.P || "Approval",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      F: {
        label: statusTexts.F || "Freeze",
        color: "bg-cyan-100 text-cyan-800",
        icon: Snowflake,
      },
    };

    const config = statusConfig[status] || statusConfig["P"];
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

  // Status cards data using API counts
  const statusCards = [
    {
      status: "P",
      label: statusTexts.P || "Approval",
      icon: CheckCircle,
      color: "green",
      count: statusCounts.P || 0,
      description: "Approved entries ready to freeze",
    },
    {
      status: "F",
      label: statusTexts.F || "Freeze",
      icon: Snowflake,
      color: "cyan",
      count: statusCounts.F || 0,
      description: "Frozen entries",
    },
  ];

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    isActive,
    onClick,
    description,
  }) => {
    const colors = {
      green: {
        bg: "bg-gradient-to-r from-green-500 to-green-600",
        text: "text-green-700",
        border: "border-green-200",
        ring: "ring-green-100",
      },
      cyan: {
        bg: "bg-gradient-to-r from-cyan-500 to-cyan-600",
        text: "text-cyan-700",
        border: "border-cyan-200",
        ring: "ring-cyan-100",
      },
    }[color];

    return (
      <button
        onClick={onClick}
        className={`w-full bg-white rounded-xl border ${
          isActive
            ? colors.border + " ring-2 ring-offset-2 " + colors.ring
            : colors.border
        } p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden text-left`}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
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
        {isActive && (
          <div className="mt-2 flex justify-center">
            <div
              className={`h-1 w-8 rounded-full ${
                color == "green" ? "bg-green-500" : "bg-cyan-500"
              }`}
            ></div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="p-6">
      {/* Header - Updated with dynamic pageTitle */}
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
              View, freeze and manage frozen budget entries
            </p>
          </div>
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

      {/* Loading state for initial load */}
      {!initialLoadComplete && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial year data...</p>
        </div>
      )}

      {/* Main content - only show after initial load */}
      {initialLoadComplete && (
        <>
          {/* Statistics Cards - Status wise */}
          {selectedFY && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {statusCards.map((card) => (
                <StatCard
                  key={card.status}
                  title={card.label}
                  value={card.count}
                  icon={card.icon}
                  color={card.color}
                  isActive={statusFilter == card.status}
                  onClick={() => {
                    setStatusFilter(card.status);
                    setCurrentPage(1);
                  }}
                  description={card.description}
                />
              ))}
            </div>
          )}

          {/* IMPROVED FINANCIAL YEAR SELECTION SECTION - Matches BudgetInitialEntryList */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Financial Year Dropdown with Enhanced Design */}
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

                  {/* Custom dropdown arrow with animation */}
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <div className="p-1 bg-blue-100 rounded-md group-hover:bg-blue-200 transition-colors duration-200">
                      <ChevronDown className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected FY Details Card with Enhanced Design */}
              {selectedFY && (
                <div className="flex-1 relative group">
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-lg"></div>

                  <div className="relative bg-white rounded-lg p-5 border-2 border-blue-100 shadow-md group-hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      {/* Icon with gradient background */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                          <Calendar className="h-7 w-7 text-white" />
                        </div>
                      </div>

                      {/* Year details */}
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

                        {/* Date range with improved formatting */}
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

          {/* EXACT SEARCH SECTION - Like reference code */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by department or budget head..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

          {/* Budget Entries Section - Only show when FY selected */}
          {selectedFY ? (
            <>
              {/* Budget Entries Table */}
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
                              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
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
                                  `/transactions/budget-management/budgetfreeze/view/${entry.budg_id}`,
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
                                <div>
                                  <div
                                    className={`text-sm font-bold ${
                                      entry.sug_amount
                                        ? "text-blue-700"
                                        : "text-gray-500"
                                    }`}
                                  >
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
                                  to={`/transactions/budget-management/budgetfreeze/view/${entry.budg_id}`}
                                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                  title="View entry details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                {entry.status == "P" && (
                                  <Link
                                    to={`/transactions/budget-management/budgetfreeze/edit/${entry.budg_id}`}
                                    className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-150"
                                    title="Freeze entry"
                                  >
                                    <Snowflake className="h-4 w-4" />
                                  </Link>
                                )}

                                {/* For Frozen status - Edit action */}
                                {entry.status == "F" && (
                                  <Link
                                    to={`/transactions/budget-management/budgetfreeze/edit/${entry.budg_id}`}
                                    className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-150"
                                    title="Edit frozen entry"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div
                                className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
                                  statusFilter == "P"
                                    ? "bg-green-100"
                                    : "bg-cyan-100"
                                }`}
                              >
                                {statusFilter == "P" ? (
                                  <CheckCircle className="h-8 w-8 text-green-400" />
                                ) : (
                                  <Snowflake className="h-8 w-8 text-cyan-400" />
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchTerm
                                  ? "No entries found"
                                  : `No ${statusCards
                                      .find((c) => c.status == statusFilter)
                                      ?.label?.toLowerCase()} entries found for ${selectedFY.FY_Name}`}
                              </h3>
                              <p className="text-gray-600 max-w-md mb-6">
                                {searchTerm
                                  ? "No entries match your search criteria. Try adjusting your search term."
                                  : statusFilter == "P"
                                    ? "No approved budget entries available for freezing."
                                    : "No frozen budget entries found."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination & Footer - EXACTLY like reference code */}
                {budgetEntries.length > 0 && (
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-t border-gray-200 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                        {totalItems} entries
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          statusFilter == "P"
                            ? "text-green-600"
                            : "text-cyan-600"
                        }`}
                      >
                        • Current Filter:{" "}
                        {
                          statusCards.find((c) => c.status == statusFilter)
                            ?.label
                        }{" "}
                        ({statusCounts[statusFilter] || 0})
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage == 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
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
                                  ? statusFilter == "P"
                                    ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-sm"
                                    : "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                                  : "bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}

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
            </>
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

export default BudgetFreezeList;