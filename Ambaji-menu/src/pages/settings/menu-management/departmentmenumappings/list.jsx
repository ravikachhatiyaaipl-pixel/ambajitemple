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
  Plus,
  Edit,
  Trash2,
  Eye,
  Building,
  Menu,
  Link as LinkIcon,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  Hash,
  AlertCircle,
  Search,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import DepartmentMenuMappingsApi from "../../../services/departmentmenumappingsapi";

const DepartmentMenuMappingsList = ({ user }) => {
  const navigate = useNavigate();
  const [allMappings, setAllMappings] = useState([]);
  const [displayedMappings, setDisplayedMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Department-Menu Mappings");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/settings/menu-management/branch-menu-mapping";
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

  const [stats, setStats] = useState({
    totalMappings: 0,
    uniqueDepartments: 0,
    totalMenuLinks: 0,
  });

  useEffect(() => {
    loadMappings();
  }, []);

  useEffect(() => {
    if (allMappings.length > 0) {
      let filtered = allMappings;
      if (searchTerm) {
        filtered = allMappings.filter(
          (mapping) =>
            mapping.department?.Dpt_Desc?.toLowerCase().includes(
              searchTerm.toLowerCase(),
            ) ||
            mapping.department?.Dpt_Name?.toLowerCase().includes(
              searchTerm.toLowerCase(),
            ) ||
            mapping.department?.GrCod?.toLowerCase().includes(
              searchTerm.toLowerCase(),
            ),
        );
      }

      setTotalItems(filtered.length);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = filtered.slice(startIndex, endIndex);
      setDisplayedMappings(paginatedData);
    } else if (allMappings.length == 0 && !loading) {
      setTotalItems(0);
      setTotalPages(1);
      setDisplayedMappings([]);
    }
  }, [allMappings, searchTerm, currentPage, itemsPerPage, loading]);

  const loadMappings = async () => {
    setLoading(true);
    try {
      const response = await DepartmentMenuMappingsApi.getAll();

      if (response.success) {
        const data = response.data || [];
        setAllMappings(data);
        setCurrentPage(1);
        setSelectedItems([]);
        calculateStatistics(data);
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

  const calculateStatistics = (mappingsData) => {
    if (!mappingsData || mappingsData.length == 0) {
      setStats({
        totalMappings: 0,
        uniqueDepartments: 0,
        totalMenuLinks: 0,
      });
      return;
    }

    const uniqueDepartments = new Set();
    let totalMenuLinks = 0;

    mappingsData.forEach((mapping) => {
      if (mapping.Dpt_Id) {
        uniqueDepartments.add(mapping.Dpt_Id);
      }

      if (mapping.Fnc_Id && Array.isArray(mapping.Fnc_Id)) {
        totalMenuLinks += mapping.Fnc_Id.length;
      }
    });

    setStats({
      totalMappings: mappingsData.length,
      uniqueDepartments: uniqueDepartments.size,
      totalMenuLinks: totalMenuLinks,
    });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDeleteMapping = async (id, departmentName, menuCount) => {
    const displayName = departmentName || "Unknown";
    const result = await Swal.fire({
      title: "Delete Mapping?",
      text: `Are you sure you want to delete mapping for "${displayName}" with ${menuCount} menu(s)?`,
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
        await DepartmentMenuMappingsApi.delete(id);
        await loadMappings();
        toast.success("Mapping deleted successfully!");
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
        await Promise.all(
          selectedItems.map((id) => DepartmentMenuMappingsApi.delete(id)),
        );
        await loadMappings();
        setSelectedItems([]);
        toast.success(`${selectedItems.length} mappings deleted successfully!`);
      } catch (error) {
        toast.error("Failed to delete some mappings");
      }
    }
  };

  const StatCard = ({ title, value, subValue, icon: Icon, color }) => {
    const colorClasses = {
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
      purple: {
        bg: "from-purple-500 to-purple-600",
        text: "text-purple-700",
        light: "bg-purple-50",
        border: "border-purple-200",
        iconBg: "bg-purple-500",
      },
    }[color];

    return (
      <div
        className={`bg-white rounded-xl border ${colorClasses.border} p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses.light} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        ></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subValue && (
              <p className={`text-sm font-medium ${colorClasses.text}`}>
                {subValue}
              </p>
            )}
          </div>
          <div
            className={`${colorClasses.iconBg} text-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
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

  const getMenuNames = (mapping) => {
    if (!mapping.menus || !Array.isArray(mapping.menus)) {
      return "No menus";
    }

    if (mapping.menus.length == 0) {
      return "No menus";
    }

    if (mapping.menus.length == 1) {
      return mapping.menus[0].Fnc_Desc || mapping.menus[0].Fnc_Title || "Menu";
    }

    const firstMenu = mapping.menus[0];
    return `${firstMenu.Fnc_Desc || firstMenu.Fnc_Title || "Menu"} +${mapping.menus.length - 1} more`;
  };

  const getMenuCodes = (mapping) => {
    if (!mapping.menus || !Array.isArray(mapping.menus)) {
      return "N/A";
    }

    if (mapping.menus.length == 0) {
      return "N/A";
    }

    if (mapping.menus.length == 1) {
      return mapping.menus[0].GrCod;
    }

    return `${mapping.menus[0].GrCod}, ...`;
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
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/settings/menu-management/branch-menu-mapping/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Mapping
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by department name, description or code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={loadMappings}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>

            {searchTerm && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center transition-all duration-200"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
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
                        selectedItems.length == displayedMappings.length &&
                        displayedMappings.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(
                            displayedMappings.map((m) => m.DMM_Id),
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
                  Menus
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created Date
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading mappings...</p>
                    </div>
                  </td>
                </tr>
              ) : displayedMappings.length > 0 ? (
                displayedMappings.map((mapping) => {
                  const department = mapping.department || {};
                  const menus = mapping.menus || [];
                  const menuCount = mapping.Fnc_Id?.length || 0;

                  return (
                    <tr
                      key={mapping.DMM_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/settings/menu-management/branch-menu-mapping/view/${mapping.DMM_Id}`,
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
                            checked={selectedItems.includes(mapping.DMM_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([
                                  ...selectedItems,
                                  mapping.DMM_Id,
                                ]);
                              } else {
                                setSelectedItems(
                                  selectedItems.filter(
                                    (id) => id != mapping.DMM_Id,
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
                              {department?.Dpt_Desc ||
                                department?.Dpt_Name ||
                                "N/A"}
                            </span>
                          </div>
                          {department?.GrCod && (
                            <div className="flex items-center text-sm">
                              <Hash className="h-3 w-3 text-gray-400 mr-1.5" />
                              <span className="text-gray-600">
                                Code: {department?.GrCod || "N/A"}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Menu className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <span className="font-medium text-gray-900">
                                {menuCount} Menu(s)
                              </span>
                              {menuCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                                  {menuCount} linked
                                </span>
                              )}
                            </div>
                          </div>
                          {menuCount > 0 && (
                            <>
                              <div className="flex items-center text-sm">
                                <Hash className="h-3 w-3 text-gray-400 mr-1.5" />
                                <span className="text-gray-600">
                                  Codes: {getMenuCodes(mapping)}
                                </span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Menu className="h-3 w-3 text-gray-400 mr-1.5" />
                                <span className="text-gray-600 truncate max-w-xs">
                                  {getMenuNames(mapping)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(mapping.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {mapping.Status == "1" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/settings/menu-management/branch-menu-mapping/view/${mapping.DMM_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View mapping details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/settings/menu-management/branch-menu-mapping/edit/${mapping.DMM_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit mapping"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMapping(
                                mapping.DMM_Id,
                                department?.Dpt_Desc || department?.Dpt_Name,
                                menuCount,
                              );
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete mapping"
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <LinkIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No mappings found"
                          : "No department-menu mappings yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No mappings match your search criteria. Try adjusting your search term."
                          : "Get started by creating your first mapping between a department and multiple menus."}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/settings/menu-management/branch-menu-mapping/create"
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
      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              mappings
            </span>
            <span className="text-sm text-gray-500">
              • Total Links: {stats.totalMenuLinks}
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

            {/* Smart pagination with ellipsis - exactly like UserList example */}
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

export default DepartmentMenuMappingsList;
