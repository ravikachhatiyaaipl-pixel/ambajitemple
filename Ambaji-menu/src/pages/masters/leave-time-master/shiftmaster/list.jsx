import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ShiftApi } from "../../../services/shiftapi";

const ListShift = ({ user }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [sortField, setSortField] = useState("Sf_Id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterType, setFilterType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Shift Management");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/leave-time-master/shiftmaster";
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
    loadShifts();
  }, [currentPage, searchTerm, filterType]);

  const loadShifts = async () => {
    setLoading(true);
    try {
      console.log("Loading shifts with params:", {
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      const result = await ShiftApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      // Extract data based on different possible response structures
      let apiData = [];
      let paginationData = {};

      // Check if result has data property
      if (result.data) {
        // If data is an array, use it directly
        if (Array.isArray(result.data)) {
          apiData = result.data;
          paginationData = result.meta || {
            current_page: currentPage,
            last_page: 1,
            per_page: itemsPerPage,
            total: apiData.length,
            from: 1,
            to: apiData.length,
          };
        }
        // If data is an object with a data property (like { data: [...], meta: {...} })
        else if (result.data.data && Array.isArray(result.data.data)) {
          apiData = result.data.data;
          paginationData = result.data.meta ||
            result.meta || {
              current_page: currentPage,
              last_page: 1,
              per_page: itemsPerPage,
              total: apiData.length,
              from: 1,
              to: apiData.length,
            };
        }
        // If data is an object with items/rows property
        else if (result.data.items && Array.isArray(result.data.items)) {
          apiData = result.data.items;
          paginationData = result.data.pagination ||
            result.meta || {
              current_page: currentPage,
              last_page: 1,
              per_page: itemsPerPage,
              total: apiData.length,
              from: 1,
              to: apiData.length,
            };
        }
        // If result itself is the array
        else if (Array.isArray(result)) {
          apiData = result;
          paginationData = {
            current_page: currentPage,
            last_page: 1,
            per_page: itemsPerPage,
            total: apiData.length,
            from: 1,
            to: apiData.length,
          };
        }
        // If none of the above, try to use result.data as is
        else {
          apiData = [];
          console.warn("Unexpected data structure:", result);
        }
      } else if (Array.isArray(result)) {
        apiData = result;
        paginationData = {
          current_page: currentPage,
          last_page: 1,
          per_page: itemsPerPage,
          total: apiData.length,
          from: 1,
          to: apiData.length,
        };
      }

      // Apply type filter if needed
      let filteredData = apiData;
      if (filterType != "") {
        filteredData = apiData.filter(
          (item) => item && item.Sf_Type == filterType,
        );
      }

      setShifts(filteredData);
      setPagination(paginationData);
      setSelectedShifts([]);

      if (filteredData.length == 0) {
        console.log("No shifts found with current filters");
      }
    } catch (error) {
      console.error("Error loading shifts:", error);
      toast.error(error.message || "Failed to load shifts");
      setShifts([]);
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

  const sortedShifts = [...shifts].sort((a, b) => {
    if (!a || !b) return 0;
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal == "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortDirection == "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDelete = async (shiftId, shiftName) => {
    const result = await Swal.fire({
      title: "Delete Shift?",
      text: `Are you sure you want to delete shift "${shiftName}"?`,
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
        await ShiftApi.delete(shiftId);
        toast.success(`Shift deleted successfully!`);
        loadShifts();
      } catch (error) {
        toast.error(error.message || "Failed to delete shift");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedShifts.length == 0) {
      toast.error("No shifts selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedShifts.length} selected shifts?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedShifts.map((id) => ShiftApi.delete(id));
        await Promise.all(deletePromises);
        setSelectedShifts([]);
        toast.success(`${selectedShifts.length} shifts deleted successfully!`);
        loadShifts();
      } catch (error) {
        toast.error("Failed to delete some shifts");
      }
    }
  };

  const stats = {
    total: pagination.total || shifts.length || 0,
    regular: shifts.filter((s) => s && s.Sf_Type == "Regular").length,
    rotational: shifts.filter((s) => s && s.Sf_Type == "Rotational").length,
    flexible: shifts.filter((s) => s && s.Sf_Type == "Flexible").length,
    split: shifts.filter((s) => s && s.Sf_Type == "Split").length,
  };

  const clearFilters = () => {
    setFilterType("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const lastPage =
      pagination.last_page || Math.ceil(pagination.total / itemsPerPage) || 1;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Format time to display properly
  const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    return timeStr;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Total: {stats.total} shifts
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/leave-time-master/shiftmaster/create"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Shift
          </Link>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by shift code or name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className={`px-4 py-2.5 border rounded-lg flex items-center transition-all duration-200 ${
                showFilters || filterType
                  ? "bg-purple-50 border-purple-300 text-purple-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {filterType && (
                <span className="ml-2 h-5 w-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">
                  1
                </span>
              )}
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Shift Type
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
                  <option value="Regular">Regular</option>
                  <option value="Rotational">Rotational</option>
                  <option value="Flexible">Flexible</option>
                  <option value="Split">Split</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedShifts.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedShifts.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedShifts.length} shift(s) selected
                </span>
                <p className="text-xs text-purple-600">Choose an action</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedShifts([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 flex items-center transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedShifts.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    checked={
                      shifts.length > 0 &&
                      selectedShifts.length == shifts.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedShifts(
                          shifts.map((s) => s.Sf_Id).filter(Boolean),
                        );
                      } else {
                        setSelectedShifts([]);
                      }
                    }}
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Sf_Id")}
                >
                  <div className="flex items-center">
                    ID
                    {sortField == "Sf_Id" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Sf_Code")}
                >
                  <div className="flex items-center">
                    Code
                    {sortField == "Sf_Code" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Sf_Name")}
                >
                  <div className="flex items-center">
                    Shift Name
                    {sortField == "Sf_Name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Sf_Type")}
                >
                  <div className="flex items-center">
                    Type
                    {sortField == "Sf_Type" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Timing
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Week Off
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
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                    </div>
                    <p className="mt-4 text-gray-600">Loading shifts...</p>
                  </td>
                </tr>
              ) : sortedShifts.length > 0 ? (
                sortedShifts.map(
                  (shift) =>
                    shift && (
                      <tr
                        key={shift.Sf_Id}
                        className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                        onClick={(e) => {
                          if (
                            !e.target.closest('input[type="checkbox"]') &&
                            !e.target.closest(".action-buttons")
                          ) {
                            navigate(
                              `/masters/leave-time-master/shiftmaster/view/${shift.Sf_Id}`,
                            );
                          }
                        }}
                      >
                        <td
                          className="px-4 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            checked={selectedShifts.includes(shift.Sf_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedShifts([
                                  ...selectedShifts,
                                  shift.Sf_Id,
                                ]);
                              } else {
                                setSelectedShifts(
                                  selectedShifts.filter(
                                    (id) => id != shift.Sf_Id,
                                  ),
                                );
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{shift.Sf_Id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                          {shift.Sf_Code || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                              <span className="text-white font-semibold text-sm">
                                {shift.Sf_Name?.charAt(0) || "S"}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                                {shift.Sf_Name || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              shift.Sf_Type == "Regular"
                                ? "bg-blue-100 text-blue-800"
                                : shift.Sf_Type == "Rotational"
                                  ? "bg-green-100 text-green-800"
                                  : shift.Sf_Type == "Flexible"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-pink-100 text-pink-800"
                            }`}
                          >
                            {shift.Sf_Type || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatTime(shift.Sf_Stime)} -{" "}
                            {formatTime(shift.Sf_Etime)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {shift.Sf_Hours ? `${shift.Sf_Hours} hrs` : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {shift.Sf_WkOff || "—"}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 action-buttons"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center space-x-1">
                            <Link
                              to={`/masters/leave-time-master/shiftmaster/view/${shift.Sf_Id}`}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/masters/leave-time-master/shiftmaster/edit/${shift.Sf_Id}`}
                              className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit Shift"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() =>
                                handleDelete(shift.Sf_Id, shift.Sf_Name)
                              }
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Shift"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                )
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterType
                          ? "No matching shifts found"
                          : "No shifts found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterType
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first shift"}
                      </p>
                      {!searchTerm && !filterType && (
                        <Link
                          to="/masters/leave-time-master/shiftmaster/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Shift
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
          <span className="text-sm text-gray-700">
            Showing {pagination.from || (currentPage - 1) * itemsPerPage + 1} to{" "}
            {pagination.to ||
              Math.min(currentPage * itemsPerPage, pagination.total)}{" "}
            of {pagination.total || 0} shifts
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-gray-700 transition-colors"
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
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-gray-700 transition-colors"
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

export default ListShift;
