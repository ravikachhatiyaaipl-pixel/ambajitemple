import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Hash,
  ArrowLeft,
  Copy,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { HolidayApi } from "../../../services/holidaymasterapi";

const ListHoliday = ({ user }) => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedHolidays, setSelectedHolidays] = useState([]);
  const [sortField, setSortField] = useState("HL_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Holiday Master");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/leave-time-master/holidaymaster/create";

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

  useEffect(() => {
    loadHolidays();
  }, [currentPage, searchTerm, filterType, filterCategory, filterYear]);

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const result = await HolidayApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      // Ensure result.data is always an array
      const apiData = Array.isArray(result.data) ? result.data : [];

      let filteredData = [...apiData];

      // Apply additional filters
      if (filterType) {
        filteredData = filteredData.filter(
          (item) => item && item.HL_Type == filterType,
        );
      }
      if (filterCategory) {
        filteredData = filteredData.filter(
          (item) => item && item.HL_Cate == filterCategory,
        );
      }
      if (filterYear) {
        filteredData = filteredData.filter(
          (item) => item && item.CI_Year == filterYear,
        );
      }

      setHolidays(filteredData);
      setPagination(
        result.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: filteredData.length,
          from: 1,
          to: filteredData.length,
        },
      );
      setSelectedHolidays([]);
    } catch (error) {
      toast.error(error.message || "Failed to load holidays");
      console.error(error);
      setHolidays([]);
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

  // Safely sort holidays only if it's an array
  const sortedHolidays = Array.isArray(holidays)
    ? [...holidays].sort((a, b) => {
        // Skip sorting if items are null/undefined
        if (!a || !b) return 0;

        const aVal = a[sortField];
        const bVal = b[sortField];

        if (sortField == "HL_Date" || sortField == "created_at") {
          return sortDirection == "asc"
            ? new Date(aVal || 0) - new Date(bVal || 0)
            : new Date(bVal || 0) - new Date(aVal || 0);
        }

        if (typeof aVal == "boolean") {
          return sortDirection == "asc"
            ? aVal == bVal
              ? 0
              : aVal
                ? -1
                : 1
            : aVal == bVal
              ? 0
              : aVal
                ? 1
                : -1;
        }

        if ((aVal || "") < (bVal || "")) return sortDirection == "asc" ? -1 : 1;
        if ((aVal || "") > (bVal || "")) return sortDirection == "asc" ? 1 : -1;
        return 0;
      })
    : [];

  const handleDeleteHoliday = async (holidayId, holidayName) => {
    const result = await Swal.fire({
      title: "Delete Holiday?",
      text: `Are you sure you want to delete "${holidayName}"? This action cannot be undone.`,
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
        await HolidayApi.delete(holidayId);
        await loadHolidays();
        toast.success(`Holiday "${holidayName}" deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete holiday");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedHolidays.length == 0) {
      toast.error("No holidays selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedHolidays.length} selected holidays?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedHolidays.map((id) =>
          HolidayApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadHolidays();
        setSelectedHolidays([]);
        toast.success(
          `${selectedHolidays.length} holidays deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some holidays");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  // Safely calculate stats
  const holidaysArray = Array.isArray(holidays) ? holidays : [];
  const stats = {
    totalHolidays: pagination.total || 0,
    nationalHolidays: holidaysArray.filter((h) => h && h.HL_Type == "National")
      .length,
    gazettedHolidays: holidaysArray.filter((h) => h && h.HL_Cate == "Gazetted")
      .length,
    optionalHolidays: holidaysArray.filter((h) => h && h.HL_ISOptional == "Yes")
      .length,
    paidHolidays: holidaysArray.filter((h) => h && h.HL_ISPaid == "Yes").length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    return status ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getYesNoBadge = (value) => {
    return value == "Yes" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Yes
      </span>
    ) : value == "No" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        No
      </span>
    ) : (
      <span className="text-gray-400">—</span>
    );
  };

  // Safely generate unique values for filters
  const uniqueYears = [
    ...new Set(holidaysArray.map((h) => h && h.CI_Year).filter(Boolean)),
  ];

  const uniqueTypes = [
    ...new Set(holidaysArray.map((h) => h && h.HL_Type).filter(Boolean)),
  ];

  const uniqueCategories = [
    ...new Set(holidaysArray.map((h) => h && h.HL_Cate).filter(Boolean)),
  ];

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.last_page || 1,
      startPage + maxVisiblePages - 1,
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterCategory("");
    setFilterYear("");
    setSearchTerm("");
    setCurrentPage(1);
    loadHolidays();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/leave-time-master/holidaymaster/create"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Holiday
          </Link>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search holidays by name, code, year..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`group px-4 py-2.5 border rounded-lg flex items-center transition-all duration-200 ${
                showFilters || filterType || filterCategory || filterYear
                  ? "bg-purple-50 border-purple-300 text-purple-700"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(filterType || filterCategory || filterYear) && (
                <span className="ml-2 h-5 w-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">
                  {
                    [filterType, filterCategory, filterYear].filter(Boolean)
                      .length
                  }
                </span>
              )}
            </button>
            <button
              onClick={() => {
                clearFilters();
              }}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Year
              </label>
              <select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedHolidays.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedHolidays.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedHolidays.length} holiday(s) selected
                </span>
                <p className="text-xs text-purple-600">
                  Choose an action for selected holidays
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedHolidays([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedHolidays.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Holidays Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-offset-0"
                      checked={
                        holidaysArray.length > 0 &&
                        selectedHolidays.length == holidaysArray.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedHolidays(
                            holidaysArray.map((h) => h.HL_Id).filter(Boolean),
                          );
                        } else {
                          setSelectedHolidays([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("HL_Code")}
                >
                  <div className="flex items-center">
                    Holiday Code
                    {sortField == "HL_Code" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("HL_Name")}
                >
                  <div className="flex items-center">
                    Holiday Name
                    {sortField == "HL_Name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("CI_Year")}
                >
                  <div className="flex items-center">
                    Year
                    {sortField == "CI_Year" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("HL_Date")}
                >
                  <div className="flex items-center">
                    Holiday Date
                    {sortField == "HL_Date" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Paid
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
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading holidays...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedHolidays.length > 0 ? (
                sortedHolidays.map(
                  (holiday) =>
                    holiday && (
                      <tr
                        key={holiday.HL_Id || Math.random()}
                        className="hover:bg-gray-50 transition-colors duration-150 group"
                        onClick={(e) => {
                          if (
                            !e.target.closest('input[type="checkbox"]') &&
                            !e.target.closest(".action-buttons")
                          ) {
                            navigate(
                              `/masters/attendance-management/holiday/view/${holiday.HL_Id}`,
                            );
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td
                          className="px-4 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-offset-0"
                              checked={selectedHolidays.includes(holiday.HL_Id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedHolidays([
                                    ...selectedHolidays,
                                    holiday.HL_Id,
                                  ]);
                                } else {
                                  setSelectedHolidays(
                                    selectedHolidays.filter(
                                      (id) => id != holiday.HL_Id,
                                    ),
                                  );
                                }
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                              <span className="text-white font-semibold text-sm">
                                {holiday.HL_Code?.charAt(0) || "H"}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <Hash className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-150">
                                  {holiday.HL_Code || "—"}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {holiday.HL_Id}
                              </div>
                            </div>
                            {holiday.HL_Code && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyToClipboard(holiday.HL_Code);
                                }}
                                className="ml-2 p-1 hover:bg-purple-50 rounded transition-colors"
                                title="Copy code"
                              >
                                <Copy className="h-3 w-3 text-gray-400 hover:text-purple-600" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-150">
                            {holiday.HL_Name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {holiday.CI_Year || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(holiday.HL_Date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {holiday.HL_Type || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {holiday.HL_Cate || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getYesNoBadge(holiday.HL_ISPaid)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(holiday.HL_Status)}
                        </td>
                        <td
                          className="px-6 py-4 action-buttons"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center space-x-1">
                            <Link
                              to={`/masters/leave-time-master/holidaymaster/view/${holiday.HL_Id}`}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/masters/leave-time-master/holidaymaster/edit/${holiday.HL_Id}`}
                              className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            {!holiday.deleted_at && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteHoliday(
                                    holiday.HL_Id,
                                    holiday.HL_Name,
                                  );
                                }}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                )
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ||
                        filterType ||
                        filterCategory ||
                        filterYear
                          ? "No matching holidays found"
                          : "No holidays found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm ||
                        filterType ||
                        filterCategory ||
                        filterYear
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first holiday"}
                      </p>
                      {!searchTerm &&
                        !filterType &&
                        !filterCategory &&
                        !filterYear && (
                          <Link
                            to="/masters/leave-time-master/holidaymaster/create"
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Holiday
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

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
              {pagination.total || 0} holidays
            </span>
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
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage == page
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination.last_page || 1, prev + 1),
                )
              }
              disabled={currentPage == (pagination.last_page || 1)}
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

export default ListHoliday;
