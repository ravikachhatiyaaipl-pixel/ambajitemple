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
  Award,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Hash,
  Building,
  ArrowLeft,
  DollarSign,
  FileCheck,
  Calendar,
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { GrantTypeMasterApi } from "../../../services/granttypemasterapi";

const GrantTypeList = ({ user }) => {
  const [grantTypes, setGrantTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterNature, setFilterNature] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedGrantTypes, setSelectedGrantTypes] = useState([]);
  const [sortField, setSortField] = useState("GT_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Grant Type Master");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/grant-management/grant-type-master";

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
    loadGrantTypes();
  }, [currentPage, searchTerm]);

  const loadGrantTypes = async () => {
    setLoading(true);
    try {
      const response = await GrantTypeMasterApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      setGrantTypes(response.data);
      setPagination(response.pagination);
      setSelectedGrantTypes([]);
    } catch (error) {
      toast.error(error.message || "Failed to load grant types");
      console.error(error);
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

  const sortedGrantTypes = [...grantTypes].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";

    if (aValue < bValue) return sortDirection == "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  // Helper function to get nature display text
  const getNatureDisplay = (natureCode) => {
    if (natureCode == "R") return "Revenue";
    if (natureCode == "C") return "Capital";
    return natureCode;
  };

  const filteredGrantTypes = sortedGrantTypes.filter((grantType) => {
    const matchesSearch =
      grantType.GT_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grantType.GT_Code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grantType.grant_authority?.GA_Name?.toLowerCase().includes(
        searchTerm.toLowerCase(),
      ) ||
      grantType.grant_category?.GC_Name?.toLowerCase().includes(
        searchTerm.toLowerCase(),
      );

    const matchesActiveStatus =
      !filterStatus ||
      (filterStatus == "active" && grantType.Is_Active) ||
      (filterStatus == "inactive" && !grantType.Is_Active);

    const matchesNature = !filterNature || grantType.GT_Nature == filterNature;

    const matchesCategory =
      !filterCategory ||
      grantType.grant_category?.GC_Id?.toString() == filterCategory;

    return (
      matchesSearch && matchesActiveStatus && matchesNature && matchesCategory
    );
  });

  const handleDeleteGrantType = async (grantTypeId, grantTypeName) => {
    const result = await Swal.fire({
      title: "Delete Grant Type?",
      text: `Are you sure you want to delete "${grantTypeName}"? This action cannot be undone.`,
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
        await GrantTypeMasterApi.delete(grantTypeId);
        await loadGrantTypes();
        toast.success(`Grant type "${grantTypeName}" deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete grant type");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGrantTypes.length == 0) {
      toast.error("No grant types selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedGrantTypes.length} selected grant types?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedGrantTypes.map((id) =>
          GrantTypeMasterApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadGrantTypes();
        setSelectedGrantTypes([]);
        toast.success(
          `${selectedGrantTypes.length} grant types deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some grant types");
      }
    }
  };

  const stats = {
    totalGrantTypes: pagination.total,
    activeGrantTypes: grantTypes.filter((g) => g.Is_Active).length,
    inactiveGrantTypes: grantTypes.filter((g) => !g.Is_Active).length,
    revenueGrants: grantTypes.filter((g) => g.GT_Nature == "R").length,
    capitalGrants: grantTypes.filter((g) => g.GT_Nature == "C").length,
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

  // Get unique categories for filter
  const getUniqueCategories = () => {
    const categories = new Map();
    grantTypes.forEach((grantType) => {
      if (grantType.grant_category) {
        categories.set(
          grantType.grant_category.GC_Id,
          grantType.grant_category,
        );
      }
    });
    return Array.from(categories.values());
  };

  return (
    <div className="p-6">
      {/* Header - WITH pageTitle from menu details */}
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
            to="/masters/grant-management/grant-type-master/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Grant Type
          </Link>
        </div>
      </div>

      {/* Action Bar - Enhanced */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search grant types by name, code"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadGrantTypes}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions - Enhanced */}
        {selectedGrantTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedGrantTypes.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedGrantTypes.length} grant type(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected grant types
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedGrantTypes([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedGrantTypes.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grant Types Table - Enhanced with row click navigation */}
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
                        selectedGrantTypes.length ==
                          filteredGrantTypes.length &&
                        filteredGrantTypes.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGrantTypes(
                            filteredGrantTypes.map((g) => g.GT_Id),
                          );
                        } else {
                          setSelectedGrantTypes([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("GT_Code")}
                >
                  <div className="flex items-center">
                    Grant Code
                    {sortField == "GT_Code" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("GT_Name")}
                >
                  <div className="flex items-center">
                    Grant Name
                    {sortField == "GT_Name" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Grant Fund Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading grant types...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredGrantTypes.length > 0 ? (
                filteredGrantTypes.map((grantType) => (
                  <tr
                    key={grantType.GT_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/grant-management/grant-type-master/view/${grantType.GT_Id}`,
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
                          checked={selectedGrantTypes.includes(grantType.GT_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGrantTypes([
                                ...selectedGrantTypes,
                                grantType.GT_Id,
                              ]);
                            } else {
                              setSelectedGrantTypes(
                                selectedGrantTypes.filter(
                                  (id) => id != grantType.GT_Id,
                                ),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {grantType.GT_Code?.charAt(0) || "G"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                              {grantType.GT_Code || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                        {grantType.GT_Name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {grantType.grant_category ? (
                        <div className="flex items-center">
                          <FolderTree className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">
                            {grantType.grant_category.GC_Name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          No category
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {grantType.GT_Nature && (
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 text-gray-400 mr-2" />
                            <span className="text-xs">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  grantType.GT_Nature == "R"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {getNatureDisplay(grantType.GT_Nature)}
                              </span>
                            </span>
                          </div>
                        )}
                        {grantType.GT_Condition && (
                          <div className="flex items-center">
                            <FileCheck className="h-3 w-3 text-gray-400 mr-2" />
                            <span className="text-xs">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  grantType.GT_Condition == "Y"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {grantType.GT_Condition == "Y"
                                  ? "Conditional"
                                  : "Unconditional"}
                              </span>
                            </span>
                          </div>
                        )}
                        {grantType.GT_Act_Mode && (
                          <div className="flex items-center">
                            <TrendingUp className="h-3 w-3 text-gray-400 mr-2" />
                            <span className="text-xs">
                              <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                                {grantType.GT_Act_Mode}
                              </span>
                            </span>
                          </div>
                        )}
                        {(grantType.GT_Utl_From_Date ||
                          grantType.GT_Utl_To_Date) && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-gray-400 mr-2" />
                            <span className="text-xs">
                              {grantType.GT_Utl_From_Date
                                ? formatDate(grantType.GT_Utl_From_Date)
                                : "N/A"}{" "}
                              -{" "}
                              {grantType.GT_Utl_To_Date
                                ? formatDate(grantType.GT_Utl_To_Date)
                                : "N/A"}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {grantType.grant_authority ? (
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                            <Building className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {grantType.grant_authority.GA_Name}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <Building className="h-4 w-4 mr-2" />
                          <span className="text-sm">No Grant Fund Source</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div>
                          {grantType.Is_Active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(grantType.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(grantType.created_at)}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/grant-management/grant-type-master/view/${grantType.GT_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/grant-management/grant-type-master/edit/${grantType.GT_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!grantType.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGrantType(
                                grantType.GT_Id,
                                grantType.GT_Name,
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
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Award className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ||
                        filterStatus ||
                        filterNature ||
                        filterCategory
                          ? "No matching grant types found"
                          : "No grant types found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm ||
                        filterStatus ||
                        filterNature ||
                        filterCategory
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first grant type"}
                      </p>
                      {!searchTerm &&
                        !filterStatus &&
                        !filterNature &&
                        !filterCategory && (
                          <Link
                            to="/masters/grant-management/grant-type-master/create"
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Grant Type
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

      {/* Pagination - Enhanced */}
      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              grant types
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
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
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

export default GrantTypeList;
