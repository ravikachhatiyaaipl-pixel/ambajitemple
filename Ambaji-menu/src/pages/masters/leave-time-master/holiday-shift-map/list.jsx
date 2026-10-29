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
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { HolidayShiftMapApi } from "../../../services/holidayshiftmapapi";

const ListHolidayShiftMapping = ({ user }) => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedMappings, setSelectedMappings] = useState([]);
  const [sortField, setSortField] = useState("HLSF_Id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Holiday Shift Mapping");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/leave-time-master/holiday-shift-map";
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
    loadMappings();
  }, [currentPage, searchTerm, filterStatus]);

  const loadMappings = async () => {
    setLoading(true);
    try {
      const result = await HolidayShiftMapApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      let apiData = Array.isArray(result.data) ? result.data : [];

      // Apply status filter
      if (filterStatus != "") {
        apiData = apiData.filter(
          (item) =>
            item &&
            (filterStatus == "active"
              ? item.HDS_Status == true
              : item.HDS_Status == false),
        );
      }

      setMappings(apiData);
      setPagination(
        result.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: apiData.length,
          from: 1,
          to: apiData.length,
        },
      );
      setSelectedMappings([]);
    } catch (error) {
      toast.error(error.message || "Failed to load mappings");
      console.error(error);
      setMappings([]);
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

  const sortedMappings = [...mappings].sort((a, b) => {
    if (!a || !b) return 0;
    let aVal, bVal;

    // Handle nested fields for sorting
    if (sortField == "holiday_name") {
      aVal = a.holiday_master?.HL_Name || "";
      bVal = b.holiday_master?.HL_Name || "";
    } else if (sortField == "shift_name") {
      aVal = a.shift_master?.Sf_Name || "";
      bVal = b.shift_master?.Sf_Name || "";
    } else {
      aVal = a[sortField];
      bVal = b[sortField];
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
  });

  const handleDelete = async (mapId, holidayName, shiftName) => {
    const result = await Swal.fire({
      title: "Delete Mapping?",
      text: `Are you sure you want to remove "${holidayName}" for shift "${shiftName}"?`,
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
        await HolidayShiftMapApi.delete(mapId);
        await loadMappings();
        toast.success(`Mapping deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete mapping");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMappings.length == 0) {
      toast.error("No mappings selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedMappings.length} selected mappings?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedMappings.map((id) =>
          HolidayShiftMapApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadMappings();
        setSelectedMappings([]);
        toast.success(
          `${selectedMappings.length} mappings deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some mappings");
      }
    }
  };

  const stats = {
    total: pagination.total || 0,
    active: mappings.filter((m) => m && m.HDS_Status == true).length,
    inactive: mappings.filter((m) => m && m.HDS_Status == false).length,
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

  const clearFilters = () => {
    setFilterStatus("");
    setSearchTerm("");
    setCurrentPage(1);
    loadMappings();
  };

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
            to="/masters/leave-time-master/holiday-shift-map/create"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Mapping
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
              placeholder="Search by holiday or shift name..."
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
                showFilters || filterStatus
                  ? "bg-purple-50 border-purple-300 text-purple-700"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters{" "}
              {filterStatus && (
                <span className="ml-2 h-5 w-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">
                  1
                </span>
              )}
            </button>
            <button
              onClick={clearFilters}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedMappings.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedMappings.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedMappings.length} mapping(s) selected
                </span>
                <p className="text-xs text-purple-600">Choose an action</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedMappings([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedMappings.length})
              </button>
            </div>
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
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    checked={
                      mappings.length > 0 &&
                      selectedMappings.length == mappings.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMappings(
                          mappings.map((m) => m.HLSF_Id).filter(Boolean),
                        );
                      } else {
                        setSelectedMappings([]);
                      }
                    }}
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("HLSF_Id")}
                >
                  <div className="flex items-center">
                    ID{" "}
                    {sortField == "HLSF_Id" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("holiday_name")}
                >
                  <div className="flex items-center">
                    Holiday{" "}
                    {sortField == "holiday_name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("shift_name")}
                >
                  <div className="flex items-center">
                    Shift{" "}
                    {sortField == "shift_name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("HDS_Status")}
                >
                  <div className="flex items-center">
                    Status{" "}
                    {sortField == "HDS_Status" && (
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading mappings...</p>
                  </td>
                </tr>
              ) : sortedMappings.length > 0 ? (
                sortedMappings.map(
                  (map) =>
                    map && (
                      <tr
                        key={map.HLSF_Id}
                        className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                        onClick={(e) => {
                          if (
                            !e.target.closest('input[type="checkbox"]') &&
                            !e.target.closest(".action-buttons")
                          ) {
                            navigate(
                              `/masters/leave-time-master/holiday-shift-map/view/${map.HLSF_Id}`,
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
                            className="h-4 w-4 text-purple-600 rounded border-gray-300"
                            checked={selectedMappings.includes(map.HLSF_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMappings([
                                  ...selectedMappings,
                                  map.HLSF_Id,
                                ]);
                              } else {
                                setSelectedMappings(
                                  selectedMappings.filter(
                                    (id) => id != map.HLSF_Id,
                                  ),
                                );
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{map.HLSF_Id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                              <span className="text-white font-semibold text-sm">
                                {map.holiday_master?.HL_Name?.charAt(0) || "H"}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                                {map.holiday_master?.HL_Name || "—"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Code: {map.holiday_master?.HL_Code || "—"} |
                                Date: {map.holiday_master?.HL_Date}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
                              <Clock className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                                {map.shift_master?.Sf_Name || "—"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Code: {map.shift_master?.Sf_Code || "—"} | Time:{" "}
                                {map.shift_master?.Sf_Stime} -{" "}
                                {map.shift_master?.Sf_Etime}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(map.HDS_Status)}
                        </td>
                        <td
                          className="px-6 py-4 action-buttons"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center space-x-1">
                            <Link
                              to={`/masters/leave-time-master/holiday-shift-map/view/${map.HLSF_Id}`}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/masters/leave-time-master/holiday-shift-map/edit/${map.HLSF_Id}`}
                              className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            {!map.deleted_at && (
                              <button
                                onClick={() =>
                                  handleDelete(
                                    map.HLSF_Id,
                                    map.holiday_master?.HL_Name,
                                    map.shift_master?.Sf_Name,
                                  )
                                }
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterStatus
                          ? "No matching mappings found"
                          : "No mappings found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterStatus
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first mapping"}
                      </p>
                      {!searchTerm && !filterStatus && (
                        <Link
                          to="/masters/leave-time-master/holiday-shift-map/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add First Mapping
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
            Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
            {pagination.total || 0} mappings
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
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
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListHolidayShiftMapping;
