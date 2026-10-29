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
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Key,
  AlertCircle,
  Building,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import UserMasterApi from "../../../services/usermasterapi";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await UserMasterApi.getById(id);

      if (response.success) {
        setUserData(response.data);
      } else {
        toast.error(response.message || "Failed to load user data!");
        navigate("/settings/user-management/user-master");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data!");
      navigate("/settings/user-management/user-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userData) return;

    const result = await Swal.fire({
      title: "Delete User?",
      text: `Are you sure you want to delete user "${userData.Usr_Name}"? This action cannot be undone.`,
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
        await UserMasterApi.delete(id);
        toast.success(`User "${userData.Usr_Name}" deleted successfully!`);
        setTimeout(() => {
          navigate("/settings/user-management/user-master");
        }, 1500);
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = () => {
    if (!userData) return null;

    if (userData.is_locked) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          userData.is_active
            ? "bg-green-100 text-green-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {userData.is_active ? (
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
    );
  };

  const DepartmentBadge = ({ departments }) => {
    if (!departments || departments.length == 0) return null;

    return (
      <div className="flex flex-col gap-2">
        {departments.map((dept) => (
          <div key={dept.Dpt_id} className="inline-flex items-start gap-2">
            <Building className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {dept.Dpt_Desc || ""}
              </span>
              {dept.Dpt_Name && (
                <span className="text-xs text-gray-600">{dept.Dpt_Name}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading user details...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">User not found</p>
        <Link
          to="/settings/user-management/user-master"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to User List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/settings/user-management/user-master")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.Usr_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {getStatusBadge()}
                  {userData.role && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      {userData.role.Role_Name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/settings/user-management/user-master/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                User Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Username
                    </label>
                    <div className="mt-1 flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">
                        {userData.Usr_Name}
                      </span>
                    </div>
                  </div>
                  {userData.Usr_Email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email Address
                      </label>
                      <div className="mt-1 flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {userData.Usr_Email}
                        </span>
                      </div>
                    </div>
                  )}
                  {userData.Usr_Mobile && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Mobile Number
                      </label>
                      <div className="mt-1 flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {userData.Usr_Mobile}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900">
                        {userData.full_name || userData.Usr_Name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Account Created
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDate(userData.created_at)}
                      </span>
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
                      Account Status
                    </label>
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge()}
                        {userData.failed_login_attempts > 0 && (
                          <span className="text-xs text-amber-600">
                            ({userData.failed_login_attempts} failed attempts)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Multi-Factor Authentication
                    </label>
                    <div className="mt-1 flex items-center">
                      {userData.mfa_enabled ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-green-700 font-medium">
                            Enabled
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-500">Not enabled</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Login
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDate(userData.last_login)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Password Change
                    </label>
                    <div className="mt-1 flex items-center">
                      <Key className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDate(userData.last_password_change)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Role Information
            </h3>
            {userData.role ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Role Name
                  </label>
                  <div className="mt-1">
                    <span className="text-sm font-medium text-gray-900">
                      {userData.role.Role_Name}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No role assigned</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Session Timeout</span>
                <span className="text-sm font-medium text-gray-900">
                  {userData.session_timeout || 30} minutes
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Password Expiry</span>
                <span className="text-sm font-medium text-gray-900">
                  {userData.password_expiry_days || 90} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Days Since Login</span>
                <span className="text-sm font-bold text-blue-600">
                  {userData.days_since_last_login == "Never"
                    ? "Never"
                    : `${userData.days_since_last_login || 0} days`}
                </span>
              </div>
              {userData.locked_until && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Locked Until</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(userData.locked_until)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
