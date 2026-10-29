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
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Key,
  Lock,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Copy,
  AlertCircle,
  UserCheck,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import RoleMasterApi from "../../../services/rolemasterapi";

const ViewRoleMaster = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    permissionsCount: 0,
  });

  useEffect(() => {
    loadRoleData();
  }, [id]);

  const loadRoleData = async () => {
    setLoading(true);
    try {
      const response = await RoleMasterApi.getById(id);

      if (response.success) {
        setRole(response.data);

        setAssignedUsers([
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            status: "Active",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            status: "Active",
          },
          {
            id: 3,
            name: "Robert Johnson",
            email: "robert@example.com",
            status: "Inactive",
          },
        ]);

        setPermissions([
          { id: 1, name: "Dashboard Access", granted: true },
          { id: 2, name: "User Management", granted: true },
          { id: 3, name: "Finance Reports", granted: true },
          { id: 4, name: "Settings Access", granted: false },
          { id: 5, name: "API Access", granted: true },
        ]);

        setStatistics({
          totalUsers: 3,
          activeUsers: 2,
          permissionsCount: 4,
        });
      } else {
        toast.error(response.message || "Failed to load role data!");
        navigate("/settings/user-management/user-role-master");
      }
    } catch (error) {
      toast.error("Failed to load role data!");
      navigate("/settings/user-management/user-role-master");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading role details...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Role not found</p>
        <Link
          to="/settings/user-management/user-role-master"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Role List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/settings/user-management/user-role-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {role.Role_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Key className="h-3 w-3 mr-1" />
                    {role.Role_Prefix}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role.Is_Active
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {role.Is_Active ? (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                  {role.TwoFacAuth == "Y" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Lock className="h-3 w-3 mr-1" />
                      2FA Required
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/settings/user-management/user-role-master/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab == "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Role Details
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab == "details" && (
            <>
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Role Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Role Name
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 font-medium">
                            {role.Role_Name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Role Prefix
                        </label>
                        <div className="mt-1 flex items-center">
                          <Key className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 font-medium">
                            {role.Role_Prefix}
                          </span>
                          <button
                            onClick={() =>
                              handleCopyToClipboard(role.Role_Prefix)
                            }
                            className="ml-2 text-gray-400 hover:text-gray-600"
                            title="Copy prefix"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Security Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Two Factor Authentication
                        </label>
                        <div className="mt-1 flex items-center">
                          {role.TwoFacAuth == "Y" ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-green-700 font-medium">
                                Required for users
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-gray-500">
                                Not required
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Status
                        </label>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              role.Is_Active
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {role.Is_Active ? (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Created Date
                        </label>
                        <div className="mt-1 flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {new Date(role.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Last Updated
                        </label>
                        <div className="mt-1 flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {new Date(role.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab == "users" && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Users with this Role ({statistics.totalUsers})
                </h2>
              </div>
              <div className="p-6">
                {assignedUsers.length > 0 ? (
                  <div className="space-y-4">
                    {assignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {user.name}
                            </h3>
                            <div className="mt-1 text-sm text-gray-500">
                              {user.email}
                            </div>
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  user.status == "Active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No users assigned to this role
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Assign this role to users in user management
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab == "permissions" && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Role Permissions ({statistics.permissionsCount})
                </h2>
              </div>
              <div className="p-6">
                {permissions.length > 0 ? (
                  <div className="space-y-3">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          {permission.granted ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300 mr-3" />
                          )}
                          <span
                            className={`${
                              permission.granted
                                ? "text-gray-900"
                                : "text-gray-400"
                            }`}
                          >
                            {permission.name}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            permission.granted
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {permission.granted ? "Granted" : "Denied"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No permissions configured</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Configure permissions for this role
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRoleMaster;
