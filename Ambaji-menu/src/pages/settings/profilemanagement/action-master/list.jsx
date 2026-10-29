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
  GitMerge,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Hash,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  UserCheck,
  UserCog,
  FileText,
  AlertCircle,
  Building,
  Layers,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ActionMasterApi } from "../../../services/actionmasterapi";

const ActionMasterList = ({ user }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedActions, setSelectedActions] = useState([]);
  const [sortField, setSortField] = useState("Act_Id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pageTitle, setPageTitle] = useState("Actions Master");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/settings/profile-management/action-master";
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
    loadActions();
  }, [currentPage, searchTerm]);

  const loadActions = async () => {
    setLoading(true);
    try {
      const response = await ActionMasterApi.getAll({
        page: currentPage,
        perPage: itemsPerPage,
        search: searchTerm,
      });

      setActions(response.data);
      setTotalItems(response.meta.total);
      setTotalPages(response.meta.last_page);
      setSelectedActions([]);
    } catch (error) {
      toast.error(error.message || "Failed to load actions");
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

  const sortedActions = [...actions].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";

    if (aValue < bValue) return sortDirection == "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDeleteAction = async (actionId, actionName) => {
    const result = await Swal.fire({
      title: "Delete Action?",
      text: `Are you sure you want to delete "${actionName}"? This action cannot be undone.`,
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
        await ActionMasterApi.delete(actionId);
        await loadActions();
        toast.success(`Action "${actionName}" deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete action");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedActions.length == 0) {
      toast.error("No actions selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedActions.length} selected actions?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedActions.map((id) =>
          ActionMasterApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadActions();
        setSelectedActions([]);
        toast.success(
          `${selectedActions.length} actions deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some actions");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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

  // Helper to get department name - Now uses department object directly from API
  const getDepartmentName = (action) => {
    // First check if we have department object directly in the action
    if (action.department && action.department.Dpt_Desc) {
      return (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {action.department.Dpt_Desc}
          </div>
          <div className="text-xs text-gray-500">
            {action.department.Dpt_Name || "—"}
          </div>
        </div>
      );
    }

    // Fallback: try to get from authorities_details
    if (!action.authorities_details || action.authorities_details.length == 0) {
      return (
        <div>
          <div className="text-sm font-medium text-gray-900">—</div>
          <div className="text-xs text-gray-500">
            ID: {action.Dpt_id || "—"}
          </div>
        </div>
      );
    }

    // Get department from first authority's department
    const firstAuth = action.authorities_details[0];
    if (firstAuth.departments && firstAuth.departments.length > 0) {
      const dept = firstAuth.departments[0];
      return (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {dept.Dpt_Desc || "—"}
          </div>
          <div className="text-xs text-gray-500">{dept.Dpt_Name || "—"}</div>
        </div>
      );
    }

    return (
      <div>
        <div className="text-sm font-medium text-gray-900">—</div>
        <div className="text-xs text-gray-500">ID: {action.Dpt_id || "—"}</div>
      </div>
    );
  };

  // Helper to get authority names from authorities_details
  const getAuthorityNames = (authoritiesDetails) => {
    if (!authoritiesDetails || authoritiesDetails.length == 0) return "—";
    return authoritiesDetails
      .map((a) => a.Dsg_Desc || a.Dsg_EName || `Designation ${a.Dsg_id}`)
      .join(", ");
  };

  // Helper to get viewer names from viewers_details (array of designation objects)
  const getViewerNames = (action) => {
    if (!action.viewers_details || action.viewers_details.length == 0) {
      return "—";
    }
    return action.viewers_details
      .map((v) => v.Dsg_Desc || v.Dsg_EName || `Designation ${v.Dsg_id}`)
      .join(", ");
  };

  // Helper to get previous status display - Shows name from previous_status object
  const getPreviousStatusDisplay = (action) => {
    if (!action.Previous_Status) {
      return "—";
    }

    // If we have the previous_status object with details
    if (action.previous_status && action.previous_status.St_Name) {
      return (
        <div className="flex items-center">
          <Hash className="h-3 w-3 text-amber-400 mr-1 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            {action.previous_status.St_Name}
          </span>
        </div>
      );
    }

    // Fallback: just show the ID
    return (
      <div className="flex items-center">
        <Hash className="h-3 w-3 text-amber-400 mr-1" />
        <span className="text-sm text-gray-700">
          ID: {action.Previous_Status}
        </span>
      </div>
    );
  };

  // Truncate long text
  const truncateText = (text, maxLength = 30) => {
    if (!text) return "—";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

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
            <p className="text-gray-600 mt-1">
              Manage status actions for enquiries
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/settings/profile-management/action-master/create"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Action
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
              placeholder="Search by ID, status name, stage, or remarks..."
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
              onClick={loadActions}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedActions.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedActions.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedActions.length} action(s) selected
                </span>
                <p className="text-xs text-purple-600">
                  Choose an action for selected items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedActions([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedActions.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions Table */}
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
                        selectedActions.length == sortedActions.length &&
                        sortedActions.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedActions(
                            sortedActions.map((a) => a.Act_Id),
                          );
                        } else {
                          setSelectedActions([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("stage")}
                >
                  <div className="flex items-center">
                    <Layers className="h-3 w-3 mr-1 text-amber-500" />
                    Stage
                    {sortField == "stage" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Building className="h-3 w-3 mr-1 text-blue-500" />
                    Department
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("St_Name")}
                >
                  <div className="flex items-center">
                    <GitMerge className="h-3 w-3 mr-1 text-purple-500" />
                    Status Name
                    {sortField == "St_Name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Hash className="h-3 w-3 mr-1 text-amber-500" />
                    Previous Status
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1 text-purple-500" />
                    Authorities
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <UserCheck className="h-3 w-3 mr-1 text-green-500" />
                    Viewers
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 mr-1 text-gray-500" />
                    Remarks
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Send className="h-3 w-3 mr-1 text-purple-500" />
                    Is Forward
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
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading actions...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedActions.length > 0 ? (
                sortedActions.map((action) => (
                  <tr
                    key={action.Act_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/settings/profile-management/action-master/view/${action.Act_Id}`,
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
                          checked={selectedActions.includes(action.Act_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedActions([
                                ...selectedActions,
                                action.Act_Id,
                              ]);
                            } else {
                              setSelectedActions(
                                selectedActions.filter(
                                  (id) => id != action.Act_Id,
                                ),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            action.stage
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {action.stage || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Building className="h-3 w-3 text-blue-400 mr-1 mt-1 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                          {getDepartmentName(action)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {action.St_Name || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPreviousStatusDisplay(action)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Users className="h-3 w-3 text-purple-400 mr-1 mt-1 flex-shrink-0" />
                        <span
                          className="text-sm text-gray-700"
                          title={getAuthorityNames(action.authorities_details)}
                        >
                          {action.authorities_details &&
                          action.authorities_details.length > 0
                            ? truncateText(
                                getAuthorityNames(action.authorities_details),
                                20,
                              )
                            : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <UserCheck className="h-3 w-3 text-green-400 mr-1 mt-1 flex-shrink-0" />
                        <span
                          className="text-sm text-gray-700"
                          title={getViewerNames(action)}
                        >
                          {truncateText(getViewerNames(action), 20)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-3 w-3 text-gray-400 mr-1" />
                        <span
                          className="text-sm text-gray-700"
                          title={action.Act_Remarks}
                        >
                          {truncateText(action.Act_Remarks || "—", 15)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {action.Is_Forward == "Y" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            No
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/settings/profile-management/action-master/view/${action.Act_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/settings/profile-management/action-master/edit/${action.Act_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!action.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAction(action.Act_Id, action.St_Name);
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
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <GitMerge className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching actions found"
                          : "No actions found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first action"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/settings/profile-management/action-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Action
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
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            actions
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

export default ActionMasterList;
