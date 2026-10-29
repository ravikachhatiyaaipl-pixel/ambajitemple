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

import { useState, useEffect ,useRef} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Key,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  ChevronRight,
  UserCheck,
  ChevronDown,
  Calendar as CalendarIcon,
  Clock,
  Building,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import UserMasterApi from "../../../services/usermasterapi";
import { useFormatters } from "../../../../hooks/useformatters";
import { useSystemSettings } from "../../../../hooks/usesettings";

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("User Master");
  const isFirstRender = useRef(true);


  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/settings/user-management/user-master";

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

  const { getRowLimit } = useSystemSettings();
  const defaultRowLimit = getRowLimit();
  const [itemsPerPage, setItemsPerPage] = useState(defaultRowLimit);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortField, setSortField] = useState("Usr_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
  });

  const { formatDate, formatTime, formatDateTime, getAlignmentClass } =
    useFormatters();

  const perPageOptions = [
    { value: 25, label: "25 rows" },
    { value: 50, label: "50 rows" },
    { value: 75, label: "75 rows" },
    { value: 100, label: "100 rows" },
  ];

  useEffect(() => {
    loadUsers();
  }, [currentPage, itemsPerPage]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (filterStatus) {
        params.status = filterStatus;
      }
      if (filterRole) {
        params.role_id = filterRole;
      }

      const response = await UserMasterApi.getAll(params);

      if (response.success) {
        const usersData = response.data || [];
        setUsers(usersData);
        setTotalItems(response.meta?.total || 0);
        setTotalPages(response.meta?.last_page || 1);

        calculateStats(usersData);
        extractUniqueRoles(usersData);
      } else {
        toast.error(response.message || "Failed to load users");
      }
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const delayDebounceFn = setTimeout(() => {
  //     setCurrentPage(1);
  //     loadUsers();
  //   }, 500);

  //   return () => clearTimeout(delayDebounceFn);
  // }, [searchTerm, filterStatus, filterRole]);

  useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
    loadUsers();
  }, 500);

  return () => clearTimeout(delayDebounceFn);
}, [searchTerm, filterStatus, filterRole]);


  const handlePerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const extractUniqueRoles = (usersData) => {
    const rolesMap = new Map();

    usersData.forEach((user) => {
      if (user.role) {
        const roleId = user.role.Role_Id;
        if (!rolesMap.has(roleId)) {
          rolesMap.set(roleId, {
            Role_Id: roleId,
            Role_Name: user.role.Role_Name,
            Role_Prefix: user.role.Role_Prefix,
          });
        }
      }
    });

    setAvailableRoles(Array.from(rolesMap.values()));
  };

  const calculateStats = (usersData) => {
    const activeUsers = usersData.filter((u) => u.is_active).length;
    const lockedUsers = usersData.filter((u) => u.is_locked).length;
    const totalUsers = usersData.length;

    setStats({
      totalUsers,
      activeUsers,
      lockedUsers,
    });
  };

  const handleSort = (field) => {
    if (sortField == field) {
      setSortDirection(sortDirection == "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection == "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDeleteUser = async (userId, username) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
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
        await UserMasterApi.delete(userId);
        toast.success(`User "${username}" deleted successfully!`);
        loadUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length == 0) {
      toast.error("No users selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedUsers.length} selected users?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedUsers.map((id) => UserMasterApi.delete(id)));
        toast.success(`${selectedUsers.length} users deleted successfully!`);
        setSelectedUsers([]);
        loadUsers();
      } catch (error) {
        toast.error("Failed to delete some users");
      }
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterRole("");
    setCurrentPage(1);
  };

  const PerPageSelector = () => (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Show:</span>
      <div className="relative">
        <select
          value={itemsPerPage}
          onChange={(e) => handlePerPageChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg py-1.5 pl-3 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          {perPageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  const FormattedDateTimeCell = ({ date }) => {
    if (!date) {
      return (
        <div className="text-sm text-gray-500 italic">Never logged in</div>
      );
    }

    return (
      <div>
        <div className={`text-sm font-medium ${getAlignmentClass("text")}`}>
          {formatDate(date)}
        </div>
        <div className="text-xs text-gray-500 flex items-center mt-0.5">
          <Clock className="h-3 w-3 mr-1" />
          {formatTime(date)}
        </div>
      </div>
    );
  };

  const DepartmentBadge = ({ departments }) => {
    if (!departments || departments.length == 0) return null;

    return (
      <div className="flex flex-col gap-0.5">
        {departments.map((dept) => (
          <div key={dept.Dpt_id} className="inline-flex items-center gap-1 max-w-[200px]">
            <Building className="h-3 w-3 text-gray-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-900 truncate">
              {dept.Dpt_Desc || dept.Dpt_Name || ""}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const UserRow = ({ user }) => {
    const userId = user.Usr_Id;
    const username = user.Usr_Name;
    const email = user.Usr_Email;
    const mobile = user.Usr_Mobile;
    const isActive = user.is_active;
    const isLocked = user.is_locked;
    const lastLogin = user.last_login;
    const role = user.role;
    const accountStatus = user.account_status;
    const departments = user.departments || [];
    const createdDate = user.created_at;

    return (
      <tr
        key={userId}
        className="hover:bg-gray-50 transition-colors duration-150 group"
        onClick={(e) => {
          if (
            !e.target.closest('input[type="checkbox"]') &&
            !e.target.closest(".action-buttons")
          ) {
            navigate(`/settings/user-management/user-master/view/${userId}`);
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
              checked={selectedUsers.includes(userId)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedUsers([...selectedUsers, userId]);
                } else {
                  setSelectedUsers(selectedUsers.filter((id) => id != userId));
                }
              }}
            />
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {username?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="ml-4">
              <div
                className={`text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-150 ${getAlignmentClass("text")}`}
              >
                {username}
              </div>
              {departments.length > 0 && (
                <div className="mt-1">
                  <DepartmentBadge departments={departments} />
                </div>
              )}
            </div>
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="space-y-1">
            {email && (
              <div className="flex items-center text-sm">
                <Mail className="h-3 w-3 mr-1.5 text-gray-400" />
                <span className={`text-gray-700 ${getAlignmentClass("text")}`}>
                  {email}
                </span>
              </div>
            )}
            {mobile && (
              <div className="flex items-center text-sm">
                <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
                <span className={`text-gray-700 ${getAlignmentClass("text")}`}>
                  {mobile}
                </span>
              </div>
            )}
            {!email && !mobile && (
              <span className="text-sm text-gray-400 italic">
                No contact info
              </span>
            )}
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex items-center">
            {role ? (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200 ${getAlignmentClass("text")}`}
              >
                <Shield className="h-3 w-3 mr-1.5" />
                {role.Role_Name}
              </span>
            ) : (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 ${getAlignmentClass("text")}`}
              >
                <AlertCircle className="h-3 w-3 mr-1.5" />
                No Role
              </span>
            )}
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getAlignmentClass("text")} ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isActive ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </>
              )}
            </span>
            {isLocked && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 ${getAlignmentClass("text")}`}
              >
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </span>
            )}
          </div>
        </td>

        <td className="px-6 py-4">
          <FormattedDateTimeCell date={lastLogin} />
        </td>

        <td
          className="px-6 py-4 action-buttons"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-1">
            <Link
              to={`/settings/user-management/user-master/view/${userId}`}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
              title="View user details"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link
              to={`/settings/user-management/user-master/edit/${userId}`}
              className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
              title="Edit user"
            >
              <Edit className="h-4 w-4" />
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteUser(userId, username);
              }}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
              title="Delete user"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

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
      red: {
        bg: "from-red-500 to-red-600",
        text: "text-red-700",
        light: "bg-red-50",
        border: "border-red-200",
        iconBg: "bg-red-500",
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
            to="/settings/user-management/user-master/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New User
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
              placeholder="Search users by username, email, mobile..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <PerPageSelector />

            <button
              onClick={loadUsers}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>

            {(searchTerm || filterStatus || filterRole) && (
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

        {selectedUsers.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedUsers.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedUsers.length} user(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected users
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
                onClick={() => setSelectedUsers([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
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
                        selectedUsers.length == sortedUsers.length &&
                        sortedUsers.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(sortedUsers.map((u) => u.Usr_Id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Usr_Name")}
                >
                  <div className="flex items-center">
                    User Details
                    {sortField == "Usr_Name" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Login
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
                      <p className="mt-4 text-gray-600">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedUsers.length > 0 ? (
                sortedUsers.map((user) => (
                  <UserRow key={user.Usr_Id} user={user} />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterStatus || filterRole
                          ? "No users found"
                          : "No users yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterStatus || filterRole
                          ? "No users match your search criteria. Try adjusting your filters."
                          : "Get started by creating your first user account."}
                      </p>
                      {!searchTerm && !filterStatus && !filterRole && (
                        <Link
                          to="/settings/user-management/user-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First User
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
      {sortedUsers.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} users
                </span>
              </div>
              <PerPageSelector />
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

export default UserList;
