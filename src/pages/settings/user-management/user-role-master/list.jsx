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
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Key,
  Cpu,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import RoleMasterApi from "../../../services/rolemasterapi";

const RoleMasterList = ({ user }) => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [sortField, setSortField] = useState("Role_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("User Role Master");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/settings/user-management/user-role-master";

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
    loadRoles();
  }, [currentPage]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm,
        status: filterStatus,
      };

      const response = await RoleMasterApi.getAll(params);

      if (response.success) {
        const rolesData = response.data.data || [];
        setRoles(rolesData);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.last_page || 1);

        calculateStats(rolesData);
      } else if (Array.isArray(response)) {
        setRoles(response);
        setTotalItems(response.length);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
        calculateStats(response);
      } else {
        toast.error(response.message || "Failed to load roles");
      }
    } catch (error) {
      toast.error("Failed to load roles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (rolesData) => {
    const activeRoles = rolesData.filter(
      (r) => r.Is_Active || r.is_active,
    ).length;
    const twoFactorEnabled = rolesData.filter(
      (r) => r.TwoFacAuth == "Y" || r.two_factor_auth == "Y",
    ).length;
    const totalRoles = rolesData.length;

    setStats({
      totalRoles: totalRoles,
      activeRoles: activeRoles,
      twoFactorEnabled: twoFactorEnabled,
      inactiveRoles: totalRoles - activeRoles,
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm != "" || filterStatus != "") {
        setCurrentPage(1);
        loadRoles();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterStatus]);

  const handleSort = (field) => {
    if (sortField == field) {
      setSortDirection(sortDirection == "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedRoles = [...roles].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection == "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDeleteRole = async (roleId, roleName) => {
    const result = await Swal.fire({
      title: "Delete Role?",
      text: `Are you sure you want to delete "${roleName}"? This action cannot be undone.`,
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
        await RoleMasterApi.delete(roleId);
        await loadRoles();
        toast.success(`Role "${roleName}" deleted successfully!`);
      } catch (error) {
        toast.error("Failed to delete role");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRoles.length == 0) {
      toast.error("No roles selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedRoles.length} selected roles?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedRoles.map((id) => RoleMasterApi.delete(id)));
        await loadRoles();
        setSelectedRoles([]);
        toast.success(`${selectedRoles.length} roles deleted successfully!`);
      } catch (error) {
        toast.error("Failed to delete some roles");
      }
    }
  };

  const handleCopyPrefix = (prefix) => {
    navigator.clipboard.writeText(prefix);
    toast.success(`Copied: ${prefix}`);
  };

  const [stats, setStats] = useState({
    totalRoles: 0,
    activeRoles: 0,
    twoFactorEnabled: 0,
    inactiveRoles: 0,
  });

  const StatCard = ({ title, value, subValue, icon: Icon, color, to }) => {
    const colors = {
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
      amber: {
        bg: "from-amber-500 to-amber-600",
        text: "text-amber-700",
        light: "bg-amber-50",
        border: "border-amber-200",
        iconBg: "bg-amber-500",
      },
    }[color];

    const content = (
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

    return to ? (
      <Link to={to} className="block">
        {content}
      </Link>
    ) : (
      content
    );
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
            to="/settings/user-management/user-role-master/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Role
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles by name, prefix..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadRoles}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {selectedRoles.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedRoles.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedRoles.length} role(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected roles
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
                onClick={() => setSelectedRoles([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

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
                        selectedRoles.length == sortedRoles.length &&
                        sortedRoles.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles(
                            sortedRoles.map((r) => r.Role_Id || r.id),
                          );
                        } else {
                          setSelectedRoles([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Role_Name")}
                >
                  <div className="flex items-center">
                    Role Details
                    {sortField == "Role_Name" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Role_Prefix")}
                >
                  <div className="flex items-center">
                    Role Prefix
                    {sortField == "Role_Prefix" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Security
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading roles...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedRoles.length > 0 ? (
                sortedRoles.map((role) => {
                  const roleId = role.Role_Id || role.id;
                  const roleName = role.Role_Name || role.name;
                  const rolePrefix = role.Role_Prefix || role.prefix;
                  const isActive = role.Is_Active || role.is_active;
                  const twoFactorEnabled =
                    role.TwoFacAuth == "Y" || role.two_factor_auth == "Y";
                  const createdAt = role.created_at;

                  return (
                    <tr
                      key={roleId}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/settings/user-management/user-role-master/view/${roleId}`,
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
                            checked={selectedRoles.includes(roleId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRoles([...selectedRoles, roleId]);
                              } else {
                                setSelectedRoles(
                                  selectedRoles.filter((id) => id != roleId),
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
                              {roleName?.charAt(0) || "R"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                              {roleName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200">
                            <Key className="h-3 w-3 mr-1.5" />
                            {rolePrefix}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPrefix(rolePrefix);
                            }}
                            className="ml-2 p-1 hover:bg-blue-50 rounded transition-colors duration-150"
                            title="Copy prefix"
                          >
                            <Copy className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {twoFactorEnabled ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border border-purple-200">
                              <CheckCircle className="h-3 w-3 mr-1.5" />
                              2FA Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200">
                              <XCircle className="h-3 w-3 mr-1.5" />
                              2FA Disabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {isActive ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1.5" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-200">
                              <XCircle className="h-3 w-3 mr-1.5" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/settings/user-management/user-role-master/view/${roleId}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View role details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/settings/user-management/user-role-master/edit/${roleId}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit role"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(roleId, roleName);
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete role"
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterStatus
                          ? "No roles found"
                          : "No roles yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterStatus
                          ? "No roles match your search criteria. Try adjusting your filters or search term."
                          : "Get started by creating your first user role to define access permissions and security settings."}
                      </p>
                      {!searchTerm && !filterStatus && (
                        <Link
                          to="/settings/user-management/user-role-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Role
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

      {sortedRoles.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} roles
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

export default RoleMasterList;
