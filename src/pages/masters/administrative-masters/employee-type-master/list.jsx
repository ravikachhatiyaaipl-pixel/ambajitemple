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
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Briefcase,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Code,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmpTypeApi from "../../../services/emptypeapi";

const EmpTypeList = ({ user }) => {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortField, setSortField] = useState("ETy_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Employee Type Master");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/masters/administrative-masters/employee-type-master";
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

  // Load stats on component mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load paginated data when dependencies change
  useEffect(() => {
    loadTypes();
  }, [currentPage, itemsPerPage, searchTerm, filterStatus]);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const response = await EmpTypeApi.getPaginated(
        currentPage,
        itemsPerPage,
        searchTerm,
        filterStatus,
      );

      if (response.success && response.data) {
        // Sort the data client-side if needed
        let sortedData = [...(response.data.data || [])];
        sortedData.sort((a, b) => {
          let aValue, bValue;
          if (sortField == "status") {
            aValue = a.Is_Active == 1 ? 1 : 0;
            bValue = b.Is_Active == 1 ? 1 : 0;
          } else {
            aValue = a[sortField];
            bValue = b[sortField];
          }

          if (typeof aValue == "string") {
            const comparison = aValue.localeCompare(bValue || "");
            return sortDirection == "asc" ? comparison : -comparison;
          } else {
            if ((aValue || 0) < (bValue || 0))
              return sortDirection == "asc" ? -1 : 1;
            if ((aValue || 0) > (bValue || 0))
              return sortDirection == "asc" ? 1 : -1;
            return 0;
          }
        });

        setTypes(sortedData);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.last_page || 1);
      } else {
        setTypes([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error("Failed to load employee types");
      console.error(error);
      setTypes([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await EmpTypeApi.getAllForStats();
      if (response.success && response.data) {
        const allTypes = response.data.data || [];
        setStats({
          total: response.data.total || 0,
          active: allTypes.filter((t) => t.Is_Active == 1).length,
          inactive: allTypes.filter((t) => t.Is_Active != 1).length,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSort = (field) => {
    if (sortField == field) {
      setSortDirection(sortDirection == "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    // Re-fetch data with new sort
    loadTypes();
  };

  const handleDelete = async (id, typeName) => {
    const result = await Swal.fire({
      title: "Delete Employee Type?",
      text: `Are you sure you want to delete "${typeName}"? This action cannot be undone.`,
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
        await EmpTypeApi.delete(id);
        toast.success(`Employee type "${typeName}" deleted successfully!`);

        // Reload current page
        await loadTypes();
        // Reload stats
        await loadStats();

        // If current page becomes empty and we're not on page 1, go to previous page
        if (types.length == 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error("Failed to delete employee type");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTypes.length == 0) {
      toast.error("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedTypes.length} selected items?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedTypes.map((id) => EmpTypeApi.delete(id)));
        setSelectedTypes([]);
        toast.success(`${selectedTypes.length} items deleted successfully!`);

        // Reload current page
        await loadTypes();
        // Reload stats
        await loadStats();

        // Check if we need to adjust page
        if (types.length == selectedTypes.length && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error("Failed to delete some items");
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([loadTypes(), loadStats()]);
      toast.success("Data refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const StatCard = ({ title, value, subValue, icon: Icon, color }) => {
    const colors =
      {
        blue: {
          bg: "from-blue-500 to-blue-600",
          text: "text-blue-700",
          light: "bg-blue-50",
          border: "border-blue-200",
          iconBg: "bg-blue-500",
        },
        green: {
          bg: "from-green-500 to-green-600",
          text: "text-green-700",
          light: "bg-green-50",
          border: "border-green-200",
          iconBg: "bg-green-500",
        },
        gray: {
          bg: "from-gray-500 to-gray-600",
          text: "text-gray-700",
          light: "bg-gray-50",
          border: "border-gray-200",
          iconBg: "bg-gray-500",
        },
      }[color] || colors.blue;

    return (
      <div
        className={`bg-white rounded-xl border ${colors.border} p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colors.light} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        ></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subValue && (
              <p className={`text-sm font-medium ${colors.text}`}>{subValue}</p>
            )}
          </div>
          <div
            className={`${colors.iconBg} text-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
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
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/administrative-masters/employee-type-master/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Type
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code..."
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

        {/* Bulk Action Bar */}
        {selectedTypes.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedTypes.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedTypes.length} item(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
              </button>
              <button
                onClick={() => setSelectedTypes([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={
                      selectedTypes.length == types.length && types.length > 0
                    }
                    onChange={(e) => {
                      setSelectedTypes(
                        e.target.checked ? types.map((t) => t.ETy_Id) : [],
                      );
                    }}
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("ETy_Code")}
                >
                  <div className="flex items-center">
                    Code{" "}
                    {sortField == "ETy_Code" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("ETy_Name")}
                >
                  <div className="flex items-center">
                    Name{" "}
                    {sortField == "ETy_Name" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status{" "}
                    {sortField == "status" && (
                      <span className="ml-1 text-blue-600">
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading employee types...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : types.length > 0 ? (
                types.map((type) => (
                  <tr
                    key={type.ETy_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/administrative-masters/employee-type-master/view/${type.ETy_Id}`,
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
                        className="h-4 w-4 text-blue-600 rounded"
                        checked={selectedTypes.includes(type.ETy_Id)}
                        onChange={(e) => {
                          setSelectedTypes((prev) =>
                            e.target.checked
                              ? [...prev, type.ETy_Id]
                              : prev.filter((id) => id != type.ETy_Id),
                          );
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Code className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {type.ETy_Code || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {type.ETy_Name?.charAt(0) || "E"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                            {type.ETy_Name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          type.Is_Active == 1
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {type.Is_Active == 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/administrative-masters/employee-type-master/view/${type.ETy_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/administrative-masters/employee-type-master/edit/${type.ETy_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(type.ETy_Id, type.ETy_Name)
                          }
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Briefcase className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No employee types found
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterStatus != "all"
                          ? "Try adjusting your search or filter criteria"
                          : "Get started by creating your first employee type."}
                      </p>
                      {!searchTerm && filterStatus == "all" && (
                        <Link
                          to="/masters/administrative-masters/employee-type-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Type
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
      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              items
            </span>
            {(searchTerm || filterStatus != "all") && (
              <span className="text-sm text-gray-500">(filtered)</span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage == totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpTypeList;
