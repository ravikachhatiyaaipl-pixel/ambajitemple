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
  User,
  Link as LinkIcon,
  Calendar,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Hash,
  Mail,
  Phone,
  Shield,
  FileText,
  AlertCircle,
  Users,
  Clock,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import UserDepartmentMapping from "../../../services/userdepartmentmapping";

const UserDepartmentMappingList = ({ user }) => {
  const navigate = useNavigate();
  const [allMappings, setAllMappings] = useState([]);
  const [filteredMappings, setFilteredMappings] = useState([]);
  const [displayedMappings, setDisplayedMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("User-Department Mappings");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/settings/user-management/user-department-mapping";
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
    uniqueUsers: 0,
  });

  useEffect(() => {
    loadAllMappings();
  }, []);

  const loadAllMappings = async () => {
    setLoading(true);
    try {
      const response = await UserDepartmentMapping.getAll();

      if (response.status == true) {
        const data = response.data || [];
        setAllMappings(data);
        setFilteredMappings(data);

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
        uniqueUsers: 0,
      });
      return;
    }

    const uniqueDepartments = new Set();
    const uniqueUsers = new Set();

    mappingsData.forEach((mapping) => {
      if (mapping.Dpt_Id) {
        uniqueDepartments.add(mapping.Dpt_Id);
      }
      if (mapping.Usr_Id) {
        uniqueUsers.add(mapping.Usr_Id);
      }
    });

    setStats({
      totalMappings: mappingsData.length,
      uniqueDepartments: uniqueDepartments.size,
      uniqueUsers: uniqueUsers.size,
    });
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMappings(allMappings);
      setCurrentPage(1);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = allMappings.filter((mapping) => {
      const user = mapping.user;
      const departments = mapping.departments || mapping.department_list || [];
    
      // Check user fields
      if (user?.full_name?.toLowerCase().includes(searchLower)) return true;
      if (user?.Usr_Email?.toLowerCase().includes(searchLower)) return true;
      if (user?.Usr_Name?.toLowerCase().includes(searchLower)) return true;
      if (user?.Usr_Mobile?.includes(searchLower)) return true;
    
      // Check all department fields in the departments array
      for (const dept of departments) {
        if (dept?.Dpt_Desc?.toLowerCase().includes(searchLower)) return true;
        if (dept?.Dpt_Name?.toLowerCase().includes(searchLower)) return true;
        if (dept?.GrCod?.toLowerCase().includes(searchLower)) return true;
      }
    
      return false;
    });

    setFilteredMappings(filtered);
    setCurrentPage(1);
  }, [searchTerm, allMappings]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedMappings(filteredMappings.slice(startIndex, endIndex));

    const pages = Math.ceil(filteredMappings.length / itemsPerPage);
    setTotalPages(pages || 1);
  }, [filteredMappings, currentPage, itemsPerPage]);

  const handleDeleteMapping = async (id, userName, departmentName) => {
    const result = await Swal.fire({
      title: "Delete Mapping?",
      text: `Are you sure you want to delete mapping for "${userName}" with department "${departmentName}"?`,
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
        await UserDepartmentMapping.delete(id);
        await loadAllMappings();
        setSelectedItems([]);
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
          selectedItems.map((id) => UserDepartmentMapping.delete(id)),
        );
        await loadAllMappings();
        setSelectedItems([]);
        toast.success(`${selectedItems.length} mappings deleted successfully!`);
      } catch (error) {
        toast.error("Failed to delete some mappings");
      }
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setCurrentPage(1);
    loadAllMappings();
    toast.success("Data refreshed!");
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

  const getStatusBadge = (status) => {
    if (status == "1" || status == 1) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
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

  return (
    <div className="p-6">
      {/* Header with Back Button and Dynamic Title */}
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
            to="/settings/user-management/user-department-mapping/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Mapping
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Search by user name, email, department name.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">
                  {selectedItems.length} mapping(s) selected
                </p>
                <p className="text-sm text-red-700">
                  Bulk actions available for selected items
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 flex items-center transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedItems.length})
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

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
                            displayedMappings.map((m) => m.UDM_Id),
                          );
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created Date
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
                  const user = mapping.user;
                  const departments = mapping.departments || (mapping.department ? [mapping.department] : []);

                  return (
                    <tr
                      key={mapping.UDM_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/settings/user-management/user-department-mapping/view/${mapping.UDM_Id}`,
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
                            checked={selectedItems.includes(mapping.UDM_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([
                                  ...selectedItems,
                                  mapping.UDM_Id,
                                ]);
                              } else {
                                setSelectedItems(
                                  selectedItems.filter(
                                    (id) => id != mapping.UDM_Id,
                                  ),
                                );
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user?.full_name || "N/A"}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mt-0.5">
                              <Mail className="h-3 w-3 mr-1" />
                              <span>{user?.Usr_Email || "N/A"}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-0.5">
                              <Phone className="h-3 w-3 mr-1" />
                              <span>{user?.Usr_Mobile || "N/A"}</span>
                            </div>
                            {user?.role && (
                              <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                <Shield className="h-3 w-3 mr-1" />
                                <span>{user.role.Role_Name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Building className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {departments.length > 0 ? departments.map((dept) => (
                              <div key={dept.Dpt_id}>
                                <p className="font-medium text-gray-900 text-sm">{dept.Dpt_Desc || "N/A"}</p>
                                <p className="text-xs text-gray-500">{dept.Dpt_Name || ""}</p>
                              </div>
                            )) : <p className="text-sm text-gray-400">N/A</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(mapping.Status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {formatDate(mapping.created_at)}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(mapping.created_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/settings/user-management/user-department-mapping/view/${mapping.UDM_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View mapping details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/settings/user-management/user-department-mapping/edit/${mapping.UDM_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit mapping"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMapping(
                                mapping.UDM_Id,
                                user?.full_name || "Unknown User",
                                departments.map((d) => d.Dpt_Desc).join(", ") || "Unknown Department",
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
                          : "No user-department mappings yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No mappings match your search criteria. Try adjusting your search term."
                          : "Get started by creating your first mapping between a user and a department."}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/settings/user-management/user-department-mapping/create"
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

      {/* Pagination & Footer */}
      {displayedMappings.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredMappings.length)}{" "}
                of {filteredMappings.length} mappings
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
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage == totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDepartmentMappingList;
