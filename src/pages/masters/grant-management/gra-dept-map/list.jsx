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
  Building,
  BookOpen,
  Link as LinkIcon,
  ChevronRight,
  CheckCircle,
  X,
  ArrowRight,
  ChevronLeft,
  RefreshCw,
  PieChart,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import GraDeptMapApi from "../../../services/gradeptmapapi";

const GraDeptMapList = ({ user }) => {
  const navigate = useNavigate();
  const [allMappings, setAllMappings] = useState([]);
  const [filteredMappings, setFilteredMappings] = useState([]);
  const [displayedMappings, setDisplayedMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Grant Department Mapping");
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/grant-management/gra-dept-map";
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

  // Load mappings when page or search term changes
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      loadAllMappings();
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [currentPage, searchTerm]);

  const loadAllMappings = async () => {
    setLoading(true);
    try {
      const response = await GraDeptMapApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      if (response.success) {
        const data = response.data || [];
        setAllMappings(data);
        setFilteredMappings(data);
        setPagination(response.pagination);
        setSelectedItems([]);
      } else {
        toast.error(response.message || "Failed to load mappings");
      }
    } catch (error) {
      console.error("Error loading mappings:", error);
      toast.error("Failed to load mappings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDisplayedMappings(filteredMappings);
  }, [filteredMappings]);

  const handleDeleteMapping = async (id, departmentName, grantTypeCount) => {
    const result = await Swal.fire({
      title: "Delete Mapping?",
      text: `Are you sure you want to delete mapping for "${departmentName}" with ${grantTypeCount} grant type(s)?`,
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
        const response = await GraDeptMapApi.delete(id);
        if (response.success) {
          await loadAllMappings();
          toast.success("Mapping deleted successfully!");
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast.error("Failed to delete mapping");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length == 0) {
      toast.error("No mappings selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedItems.length} selected mappings?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedItems.map((id) => GraDeptMapApi.delete(id)));
        await loadAllMappings();
        setSelectedItems([]);
        toast.success(`${selectedItems.length} mappings deleted successfully!`);
      } catch (error) {
        toast.error("Failed to delete some mappings");
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Updated: Get grant type names for display
  const getGrantTypeNames = (mapping) => {
    if (!mapping.all_grant_types || !Array.isArray(mapping.all_grant_types)) {
      return "No grant types";
    }

    if (mapping.all_grant_types.length == 0) {
      return "No grant types";
    }

    if (mapping.all_grant_types.length == 1) {
      return mapping.all_grant_types[0].GT_Name;
    }

    return `${mapping.all_grant_types[0].GT_Name} +${mapping.all_grant_types.length - 1} more`;
  };

  const getGrantTypeCodes = (mapping) => {
    if (!mapping.all_grant_types || !Array.isArray(mapping.all_grant_types)) {
      return "N/A";
    }

    if (mapping.all_grant_types.length == 0) {
      return "N/A";
    }

    if (mapping.all_grant_types.length == 1) {
      return mapping.all_grant_types[0].GT_Code;
    }

    return `${mapping.all_grant_types[0].GT_Code}, ...`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6">
      {/* Header with Back Button and pageTitle */}
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
            to="/masters/grant-management/gra-dept-map/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Mapping
          </Link>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by department name"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadAllMappings}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedItems.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedItems.length} mapping(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected mappings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedItems.length})
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
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                      checked={
                        displayedMappings.length > 0 &&
                        selectedItems.length == displayedMappings.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(
                            displayedMappings.map((m) => m.GDM_Id),
                          );
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Grant Types
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading mappings...</p>
                    </div>
                  </td>
                </tr>
              ) : displayedMappings.length > 0 ? (
                displayedMappings.map((mapping) => {
                  const department = mapping.department;
                  const grantTypes = mapping.all_grant_types || [];
                  const grantTypeCount = mapping.GT_Id?.length || 0;

                  return (
                    <tr
                      key={mapping.GDM_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/grant-management/gra-dept-map/view/${mapping.GDM_Id}`,
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
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                            checked={selectedItems.includes(mapping.GDM_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([
                                  ...selectedItems,
                                  mapping.GDM_Id,
                                ]);
                              } else {
                                setSelectedItems(
                                  selectedItems.filter(
                                    (id) => id != mapping.GDM_Id,
                                  ),
                                );
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">
                              {department?.Dpt_Desc || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-600">
                              {department?.Dpt_Name || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <span className="font-medium text-gray-900">
                                {grantTypeCount} Grant Type(s)
                              </span>
                              {grantTypeCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                                  {grantTypeCount} linked
                                </span>
                              )}
                            </div>
                          </div>
                          {grantTypeCount > 0 && (
                            <>
                              <div className="flex items-center text-sm">
                                <span className="text-gray-600 truncate max-w-xs">
                                  {getGrantTypeNames(mapping)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/grant-management/gra-dept-map/view/${mapping.GDM_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View mapping details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/grant-management/gra-dept-map/edit/${mapping.GDM_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit mapping"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {!mapping.deleted_at && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMapping(
                                  mapping.GDM_Id,
                                  department?.Dpt_Desc ||
                                    department?.Dpt_Name ||
                                    "Unknown",
                                  grantTypeCount,
                                );
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                              title="Delete mapping"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <LinkIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No mappings found"
                          : "No department-grant type mappings yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No mappings match your search criteria. Try adjusting your search term."
                          : "Get started by creating your first mapping between a department and grant types."}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/grant-management/gra-dept-map/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Mapping
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
              mappings
            </span>
            <span className="text-sm text-gray-500 ml-2">
              • Total Grant Types:{" "}
              {displayedMappings.reduce(
                (acc, m) => acc + (m.GT_Id?.length || 0),
                0,
              )}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage == page
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
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

export default GraDeptMapList;
