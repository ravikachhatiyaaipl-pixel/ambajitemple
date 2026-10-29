import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calculator,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Hash,
  Copy,
  Percent,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DaRateApi } from "../../../services/daratemasterapi";

const DaRateList = ({ user }) => {
  const [daRates, setDaRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDaRates, setSelectedDaRates] = useState([]);
  const [sortField, setSortField] = useState("Fr_Date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("DA Rate Master");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/masters/payroll-pay-structures/da-hra-ta-rate-master";
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
    loadDaRates();
  }, [currentPage, searchTerm]);

  const loadDaRates = async () => {
    setLoading(true);
    try {
      const result = await DaRateApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      // Safely extract data with fallbacks
      const data = result?.data || [];

      // Ensure data is an array
      const dataArray = Array.isArray(data) ? data : [];

      setDaRates(dataArray);

      // Handle pagination safely
      if (result?.meta) {
        setPagination(result.meta);
      } else {
        setPagination({
          current_page: currentPage,
          last_page: Math.ceil(dataArray.length / itemsPerPage) || 1,
          per_page: itemsPerPage,
          total: dataArray.length,
          from: dataArray.length > 0 ? 1 : 0,
          to: dataArray.length,
        });
      }

      setSelectedDaRates([]);
    } catch (error) {
      console.error("Error loading DA rates:", error);
      toast.error(error?.message || "Failed to load DA rates");
      // Set empty array on error to prevent iteration issues
      setDaRates([]);
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

  // Safe sorting with null checks
  const sortedDaRates = () => {
    if (!Array.isArray(daRates) || daRates.length == 0) {
      return [];
    }

    return [...daRates].sort((a, b) => {
      // Safely get values with fallbacks
      const aVal = a && a[sortField] != undefined ? a[sortField] : "";
      const bVal = b && b[sortField] != undefined ? b[sortField] : "";

      if (sortField == "Da_Rate" || sortField == "DR_Sr") {
        const aNum = parseFloat(aVal) || 0;
        const bNum = parseFloat(bVal) || 0;
        return sortDirection == "asc" ? aNum - bNum : bNum - aNum;
      }

      if (
        sortField == "Fr_Date" ||
        sortField == "To_Date" ||
        sortField == "Eff_Date"
      ) {
        const aDate = aVal ? new Date(aVal).getTime() : 0;
        const bDate = bVal ? new Date(bVal).getTime() : 0;
        return sortDirection == "asc" ? aDate - bDate : bDate - aDate;
      }

      if (aVal < bVal) return sortDirection == "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection == "asc" ? 1 : -1;
      return 0;
    });
  };

  // Function to get serial number based on pagination and index
  const getSerialNumber = (index) => {
    return (currentPage - 1) * itemsPerPage + index + 1;
  };

  const handleDeleteDaRate = async (daRateId, daRateSr) => {
    const result = await Swal.fire({
      title: "Delete DA Rate?",
      text: `Are you sure you want to delete DA Rate ${daRateSr}? This action cannot be undone.`,
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
        await DaRateApi.delete(daRateId);
        await loadDaRates();
        toast.success(`DA Rate #${daRateSr} deleted successfully!`);
      } catch (error) {
        toast.error(error?.message || "Failed to delete DA rate");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDaRates.length == 0) {
      toast.error("No DA rates selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedDaRates.length} selected DA rates?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedDaRates.map((id) =>
          DaRateApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadDaRates();
        setSelectedDaRates([]);
        toast.success(
          `${selectedDaRates.length} DA rates deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some DA rates");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  // Safe stats calculation
  const stats = {
    totalDaRates: pagination.total || 0,
    avgDaRate:
      Array.isArray(daRates) && daRates.length > 0
        ? (
            daRates.reduce((sum, item) => {
              const rate =
                item && item.Da_Rate ? parseFloat(item.Da_Rate) || 0 : 0;
              return sum + rate;
            }, 0) / daRates.length
          ).toFixed(2)
        : 0,
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
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (value) => {
    if (value == null || value == undefined || value == "") return "—";
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "—";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const formatNumber = (value) => {
    if (value == null || value == undefined || value == "") return "—";
    return value.toString();
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.last_page,
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

  const sortedData = sortedDaRates();

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
            to="/masters/payroll-pay-structures/da-hra-ta-rate-master/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New DA Rate
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
              placeholder="Search DA rates by serial, commission, or date..."
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
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
                loadDaRates();
              }}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedDaRates.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedDaRates.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedDaRates.length} DA rate(s) selected
                </span>
                <p className="text-xs text-purple-600">
                  Choose an action for selected rates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedDaRates([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedDaRates.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DA Rates Table */}
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
                        Array.isArray(daRates) &&
                        daRates.length > 0 &&
                        selectedDaRates.length == daRates.length
                      }
                      onChange={(e) => {
                        if (e.target.checked && Array.isArray(daRates)) {
                          setSelectedDaRates(
                            daRates.map((c) => c?.DR_Id).filter(Boolean),
                          );
                        } else {
                          setSelectedDaRates([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("DR_Sr")}
                >
                  <div className="flex items-center">
                    Sr. No.
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pay Commission
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Fr_Date")}
                >
                  <div className="flex items-center">
                    From Date
                    {sortField == "Fr_Date" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("To_Date")}
                >
                  <div className="flex items-center">
                    To Date
                    {sortField == "To_Date" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Eff_Date")}
                >
                  <div className="flex items-center">
                    Effective Date
                    {sortField == "Eff_Date" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Da_Rate")}
                >
                  <div className="flex items-center">
                    DA Rate
                    {sortField == "Da_Rate" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading DA rates...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length > 0 ? (
                sortedData.map((daRate, index) => (
                  <tr
                    key={daRate?.DR_Id || Math.random()}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons") &&
                        daRate?.DR_Id
                      ) {
                        navigate(
                          `/masters/payroll-pay-structures/da-hra-ta-rate-master/view/${daRate.DR_Id}`,
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
                          checked={selectedDaRates.includes(daRate?.DR_Id)}
                          onChange={(e) => {
                            if (e.target.checked && daRate?.DR_Id) {
                              setSelectedDaRates([
                                ...selectedDaRates,
                                daRate.DR_Id,
                              ]);
                            } else {
                              setSelectedDaRates(
                                selectedDaRates.filter(
                                  (id) => id != daRate?.DR_Id,
                                ),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {getSerialNumber(index)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            
                            <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-150">
                              {getSerialNumber(index)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-150">
                        {daRate?.commission?.PC_Name || daRate?.PC_Name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {formatDate(daRate?.Fr_Date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {formatDate(daRate?.To_Date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {formatDate(daRate?.Eff_Date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-2">
                          <DollarSign className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-bold text-green-700">
                          {formatCurrency(daRate?.Da_Rate)}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/payroll-pay-structures/da-hra-ta-rate-master/view/${daRate?.DR_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/payroll-pay-structures/da-hra-ta-rate-master/edit/${daRate?.DR_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!daRate?.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (daRate?.DR_Id && daRate?.DR_Sr) {
                                handleDeleteDaRate(daRate.DR_Id, daRate.DR_Sr);
                              }
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
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Calculator className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching DA rates found"
                          : "No DA rates found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first DA rate"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/payroll-pay-structures/da-hra-ta-rate-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First DA Rate
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
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              DA rates
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
                  Math.min(pagination.last_page, prev + 1),
                )
              }
              disabled={currentPage == pagination.last_page}
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

export default DaRateList;