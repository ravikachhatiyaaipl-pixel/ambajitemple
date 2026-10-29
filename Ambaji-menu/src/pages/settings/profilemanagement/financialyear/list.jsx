/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Hash,
  ArrowLeft,
  Lock,
  Unlock,
  DollarSign,
  Clock,
  ChevronRight,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { FinancialYearApi } from "../../../services/financialyearapi";

const FinancialYearList = ({ user }) => {
  const [allYears, setAllYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [displayedYears, setDisplayedYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCurrentYear, setFilterCurrentYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedYears, setSelectedYears] = useState([]);
  const [sortField, setSortField] = useState("St_Date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pageTitle, setPageTitle] = useState("Financial Year Management");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/settings/profile-management/financial-year-master";
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
    loadAllFinancialYears();
  }, []);

  const loadAllFinancialYears = async () => {
    setLoading(true);
    try {
      const data = await FinancialYearApi.getAll();
      setAllYears(data);
      setFilteredYears(data);
    } catch (error) {
      toast.error(error.message || "Failed to load financial years");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...allYears];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (year) =>
          year.FY_Code?.toLowerCase().includes(term) ||
          year.FY_Name?.toLowerCase().includes(term) ||
          year.Remarks?.toLowerCase().includes(term),
      );
    }

    if (filterStatus) {
      filtered = filtered.filter((year) => year.Status == filterStatus);
    }

    if (filterCurrentYear) {
      filtered = filtered.filter((year) =>
        filterCurrentYear == "current"
          ? year.is_current_year
          : !year.is_current_year,
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (
        sortField == "St_Date" ||
        sortField == "Ed_Date" ||
        sortField == "created_at"
      ) {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (aValue < bValue) return sortDirection == "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection == "asc" ? 1 : -1;
      return 0;
    });

    setFilteredYears(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    filterStatus,
    filterCurrentYear,
    allYears,
    sortField,
    sortDirection,
  ]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedYears(filteredYears.slice(startIndex, endIndex));
  }, [filteredYears, currentPage, itemsPerPage]);

  const handleSort = (field) => {
    if (sortField == field) {
      setSortDirection(sortDirection == "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteYear = async (yearId, yearCode) => {
    const result = await Swal.fire({
      title: "Delete Financial Year?",
      text: `Are you sure you want to delete "${yearCode}"? This action cannot be undone.`,
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
        await FinancialYearApi.delete(yearId);
        await loadAllFinancialYears();
        setSelectedYears([]);
        toast.success(`Financial year "${yearCode}" deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete financial year");
      }
    }
  };

  const handleSetCurrentYear = async (yearId, yearCode) => {
    const result = await Swal.fire({
      title: "Set as Current Year?",
      text: `Are you sure you want to set "${yearCode}" as the current financial year?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, set as current",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const yearToUpdate = allYears.find((y) => y.FY_Id == yearId);

        if (!yearToUpdate) {
          toast.error("Financial year not found");
          return;
        }

        const updateData = {
          ...yearToUpdate,
          is_current_year: true,
        };

        await FinancialYearApi.update(yearId, updateData);
        await loadAllFinancialYears();

        toast.success(`"${yearCode}" set as current financial year`);
      } catch (error) {
        toast.error(error.message || "Failed to set current year");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedYears.length == 0) {
      toast.error("No financial years selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedYears.length} selected financial years?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          selectedYears.map((id) => FinancialYearApi.delete(id)),
        );
        await loadAllFinancialYears();
        setSelectedYears([]);
        toast.success(
          `${selectedYears.length} financial year(s) deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some financial years");
      }
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterCurrentYear("");
    loadAllFinancialYears();
    toast.success("Data refreshed!");
  };

  const stats = {
    totalYears: allYears.length,
    activeYears: allYears.filter((y) => y.Status == "ACTIVE").length,
    currentYear: allYears.find((y) => y.is_current_year),
    lockedYears: allYears.filter((y) => y.Status == "LOCKED").length,
    closedYears: allYears.filter((y) => y.Status == "CLOSED").length,
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      case "LOCKED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getToggleBadgeColor = (value, type) => {
    if (value) {
      switch (type) {
        case "budget":
          return "bg-green-100 text-green-800";
        case "transaction":
          return "bg-blue-100 text-blue-800";
        case "current":
          return "bg-yellow-100 text-yellow-800";
        default:
          return "bg-green-100 text-green-800";
      }
    }
    return "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(filteredYears.length / itemsPerPage);

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
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/settings/profile-management/financial-year-master/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Financial Year
          </Link>
        </div>
      </div>

      {/* Current Year Banner */}
      {stats.currentYear && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-yellow-500 text-white flex items-center justify-center mr-4">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-yellow-900">
                  Current Financial Year
                </h3>
                <p className="text-sm text-yellow-800">
                  {stats.currentYear.FY_Code} •{" "}
                  {formatDate(stats.currentYear.St_Date)} to{" "}
                  {formatDate(stats.currentYear.Ed_Date)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {stats.currentYear.is_budget_open && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Budget Open
                </span>
              )}
              {stats.currentYear.is_transaction_open && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Unlock className="h-3 w-3 mr-1" />
                  Transactions Open
                </span>
              )}
              {stats.currentYear.Status == "ACTIVE" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search financial years by code, name, or remarks..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="LOCKED">Locked</option>
            </select>

            <select
              value={filterCurrentYear}
              onChange={(e) => setFilterCurrentYear(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              <option value="current">Current Year</option>
              <option value="not-current">Other Years</option>
            </select>

            <button
              onClick={handleRefresh}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {selectedYears.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedYears.length} year(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedYears([])}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Mappings Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                      checked={
                        selectedYears.length == displayedYears.length &&
                        displayedYears.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedYears(displayedYears.map((y) => y.FY_Id));
                        } else {
                          setSelectedYears([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("FY_Code")}
                >
                  <div className="flex items-center">
                    Financial Year
                    {sortField == "FY_Code" && (
                      <span className="ml-1">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status & Settings
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : displayedYears.length > 0 ? (
                displayedYears.map((year) => (
                  <tr
                    key={year.FY_Id}
                    className="hover:bg-gray-50 transition-colors group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/settings/profile-management/financial-year-master/view/${year.FY_Id}`,
                        );
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={selectedYears.includes(year.FY_Id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedYears([...selectedYears, year.FY_Id]);
                          } else {
                            setSelectedYears(
                              selectedYears.filter((id) => id != year.FY_Id),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {year.FY_Code?.split("-")[0]?.slice(-2) || "FY"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {year.FY_Code}
                            </div>
                            {year.is_current_year && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {year.FY_Name || "No name"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-400 mr-2" />
                          <span className="text-sm">
                            <span className="font-medium">From:</span>{" "}
                            {formatDate(year.St_Date)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-400 mr-2" />
                          <span className="text-sm">
                            <span className="font-medium">To:</span>{" "}
                            {formatDate(year.Ed_Date)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(year.Status)}`}
                          >
                            {year.Status == "ACTIVE" && (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {year.Status == "LOCKED" && (
                              <Lock className="h-3 w-3 mr-1" />
                            )}
                            {year.Status == "CLOSED" && (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {year.Status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getToggleBadgeColor(year.is_budget_open, "budget")}`}
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            {year.is_budget_open
                              ? "Budget Open"
                              : "Budget Closed"}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getToggleBadgeColor(year.is_transaction_open, "transaction")}`}
                          >
                            {year.is_transaction_open ? (
                              <Unlock className="h-3 w-3 mr-1" />
                            ) : (
                              <Lock className="h-3 w-3 mr-1" />
                            )}
                            {year.is_transaction_open ? "Tx Open" : "Tx Closed"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/settings/profile-management/financial-year-master/view/${year.FY_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/settings/profile-management/financial-year-master/edit/${year.FY_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!year.is_current_year && (
                          <button
                            onClick={() =>
                              handleSetCurrentYear(year.FY_Id, year.FY_Code)
                            }
                            className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded transition-colors"
                            title="Set as Current Year"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteYear(year.FY_Id, year.FY_Code)
                          }
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterStatus || filterCurrentYear
                          ? "No financial years found"
                          : "No financial years yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterStatus || filterCurrentYear
                          ? "No financial years match your search criteria. Try adjusting your filters."
                          : "Get started by adding your first financial year."}
                      </p>
                      {!searchTerm && !filterStatus && !filterCurrentYear && (
                        <Link
                          to="/settings/profile-management/financial-year-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Financial Year
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
      {displayedYears.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredYears.length)} of{" "}
              {filteredYears.length} financial years
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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

export default FinancialYearList;
