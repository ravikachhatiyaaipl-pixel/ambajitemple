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
  Target,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  ArrowLeft,
  FileText,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SchemeMasterApi } from "../../../services/schememasterapi";

const SchemeList = ({ user }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedSchemes, setSelectedSchemes] = useState([]);
  const [sortField, setSortField] = useState("Sch_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Scheme Master Management");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/grant-management/scheme-master";

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
    loadSchemes();
  }, [currentPage, searchTerm]);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const result = await SchemeMasterApi.getAll({
        per_page: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      if (result.data && result.data.data) {
        const schemesData = result.data.data || [];
        setSchemes(schemesData);

        setPagination({
          current_page: result.data.current_page || 1,
          last_page: result.data.last_page || 1,
          per_page: result.data.per_page || itemsPerPage,
          total: result.data.total || 0,
          from: result.data.from || 0,
          to: result.data.to || 0,
        });
      } else {
        setSchemes([]);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: itemsPerPage,
          total: 0,
          from: 0,
          to: 0,
        });
      }

      setSelectedSchemes([]);
    } catch (error) {
      toast.error("Failed to load schemes");
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

  const sortedSchemes = [...schemes].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField == "grant_type") {
      aValue = a.grant_type?.GT_Name || "";
      bValue = b.grant_type?.GT_Name || "";
    } else if (sortField == "department") {
      aValue = a.department?.Dpt_Name || "";
      bValue = b.department?.Dpt_Name || "";
    }

    if (aValue < bValue) return sortDirection == "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const filteredSchemes = sortedSchemes.filter((scheme) => {
    const matchesSearch =
      scheme.Sch_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.Sch_Code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.grant_type?.GT_Name?.toLowerCase().includes(
        searchTerm.toLowerCase(),
      ) ||
      scheme.grant_type?.GT_Code?.toLowerCase().includes(
        searchTerm.toLowerCase(),
      ) ||
      scheme.Status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !filterStatus ||
      (filterStatus == "active" && scheme.Is_Active) ||
      (filterStatus == "inactive" && !scheme.Is_Active);

    return matchesSearch && matchesStatus;
  });

  const handleDeleteScheme = async (schemeId, schemeName) => {
    const result = await Swal.fire({
      title: "Delete Scheme?",
      text: `Are you sure you want to delete "${schemeName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await SchemeMasterApi.delete(schemeId);
      await loadSchemes();
      toast.success(`Scheme "${schemeName}" deleted successfully!`);
      setSelectedSchemes(selectedSchemes.filter((id) => id != schemeId));
    } catch (error) {
      toast.error(error.message || "Failed to delete scheme");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSchemes.length == 0) {
      toast.error("No schemes selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedSchemes.length} selected schemes?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const deletePromises = selectedSchemes.map((id) =>
        SchemeMasterApi.delete(id),
      );
      await Promise.all(deletePromises);

      await loadSchemes();
      setSelectedSchemes([]);
      toast.success(
        `${selectedSchemes.length} scheme(s) deleted successfully!`,
      );
    } catch (error) {
      toast.error("Failed to delete some schemes");
    }
  };

  const stats = {
    totalSchemes: pagination.total,
    activeSchemes: schemes.filter((s) => s.Is_Active).length,
    inactiveSchemes: schemes.filter((s) => !s.Is_Active).length,
    totalBudget: schemes.reduce((sum, s) => sum + parseFloat(s.Budget || 0), 0),
    activeBudget: schemes
      .filter((s) => s.Is_Active)
      .reduce((sum, s) => sum + parseFloat(s.Budget || 0), 0),
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const formatDateTime = (dateString) => {
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
            to="/masters/grant-management/scheme-master/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Scheme
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
              placeholder="Search schemes by name, code"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadSchemes}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions - Enhanced */}
        {selectedSchemes.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedSchemes.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedSchemes.length} scheme(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected schemes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedSchemes([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedSchemes.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Schemes Table - Enhanced with row click navigation */}
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
                        selectedSchemes.length == filteredSchemes.length &&
                        filteredSchemes.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSchemes(
                            filteredSchemes.map((s) => s.Sch_id),
                          );
                        } else {
                          setSelectedSchemes([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Sch_Name")}
                >
                  <div className="flex items-center">
                    Scheme Details
                    {sortField == "Sch_Name" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("grant_type")}
                >
                  <div className="flex items-center">
                    Grant Type & Budget
                    {sortField == "grant_type" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Timeline
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
                      <p className="mt-4 text-gray-600">Loading schemes...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSchemes.length > 0 ? (
                filteredSchemes.map((scheme) => (
                  <tr
                    key={scheme.Sch_id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/grant-management/scheme-master/view/${scheme.Sch_id}`,
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
                          checked={selectedSchemes.includes(scheme.Sch_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSchemes([
                                ...selectedSchemes,
                                scheme.Sch_id,
                              ]);
                            } else {
                              setSelectedSchemes(
                                selectedSchemes.filter(
                                  (id) => id != scheme.Sch_id,
                                ),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {scheme.Sch_Name?.charAt(0) || "S"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                            {scheme.Sch_Name}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs font-medium text-gray-600">
                              {scheme.Sch_Code}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {scheme.grant_type ? (
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <FileText className="h-3 w-3 mr-2 text-blue-500" />
                              <span className="text-gray-900">
                                {scheme.grant_type.GT_Name}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No grant type assigned
                          </div>
                        )}
                        {scheme.Budget && (
                          <div className="flex items-center text-sm">
                            <span className="font-medium text-gray-900">
                              {formatCurrency(parseFloat(scheme.Budget))}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {scheme.St_Date && (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-2 text-blue-500" />
                            <span className="text-gray-900">
                              Start: {formatDate(scheme.St_Date)}
                            </span>
                          </div>
                        )}
                        {scheme.Ed_Date && (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-2 text-red-500" />
                            <span className="text-gray-900">
                              End: {formatDate(scheme.Ed_Date)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          {scheme.Is_Active ? (
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
                        {/* {scheme.Status && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {scheme.Status}
                          </span>
                        )} */}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/grant-management/scheme-master/view/${scheme.Sch_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/grant-management/scheme-master/edit/${scheme.Sch_id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!scheme.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScheme(
                                scheme.Sch_id,
                                scheme.Sch_Name,
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Target className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterStatus
                          ? "No matching schemes found"
                          : "No schemes found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterStatus
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first scheme"}
                      </p>
                      {!searchTerm && !filterStatus && (
                        <Link
                          to="/masters/grant-management/scheme-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Scheme
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
              schemes
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

export default SchemeList;
