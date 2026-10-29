import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Key,
  RefreshCw,
  Calendar,
  Clock,
  Lock,
  Smartphone,
  AtSign,
  Briefcase,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    user: {
      Usr_Name: '',
      Usr_Email: '',
      Usr_Mobile: '',
      role: null,
      is_active: true,
      is_locked: false,
      last_login: null,
      created_at: null,
      updated_at: null,
    },
    department: null
  });
  const [formData, setFormData] = useState({
    Usr_Name: "",
    Usr_Email: "",
    Usr_Mobile: "",
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        toast.error("Authentication token not found");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        const userData = response.data.data;
        const departmentData = userData.departments?.[0] || null;
        const roleData = userData.role;

        setProfileData({
          user: {
            Usr_Id: userData.Usr_Id,
            Usr_Name: userData.Usr_Name || "",
            Usr_Email: userData.Usr_Email || "",
            Usr_Mobile: userData.Usr_Mobile || "",
            Usr_Role_Id: userData.Usr_Role_Id,
            is_active: userData.is_active,
            is_locked: userData.is_locked,
            role: roleData,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
            last_login: userData.last_login || userData.created_at,
          },
          department: departmentData,
          employee: userData.employee,
        });

        setFormData((prev) => ({
          ...prev,
          Usr_Name: userData.Usr_Name || "",
          Usr_Email: userData.Usr_Email || "",
          Usr_Mobile: userData.Usr_Mobile || "",
        }));
      } else {
        toast.error(response.data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);

      if (error.response?.status ==  401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to load profile data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!formData.Usr_Name?.trim()) {
      newErrors.Usr_Name = "Username is required";
    } else if (formData.Usr_Name.length > 50) {
      newErrors.Usr_Name = `Maximum 50 characters allowed (${formData.Usr_Name.length}/50)`;
    }

    if (!formData.Usr_Email?.trim()) {
      newErrors.Usr_Email = "Email address is required";
    } else if (formData.Usr_Email.length > 50) {
      newErrors.Usr_Email = `Maximum 50 characters allowed (${formData.Usr_Email.length}/50)`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Usr_Email)) {
      newErrors.Usr_Email = "Invalid email format";
    }

    if (!formData.Usr_Mobile?.trim()) {
      newErrors.Usr_Mobile = "Mobile number is required";
    } else if (formData.Usr_Mobile.length > 15) {
      newErrors.Usr_Mobile = `Maximum 15 characters allowed (${formData.Usr_Mobile.length}/15)`;
    } else if (!/^\d{10}$/.test(formData.Usr_Mobile)) {
      newErrors.Usr_Mobile = "Mobile number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length ==  0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!formData.old_password?.trim()) {
      newErrors.old_password = "Current password is required";
    }

    if (!formData.new_password?.trim()) {
      newErrors.new_password = "New password is required";
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = "New password must be at least 6 characters";
    }

    if (!formData.new_password_confirmation?.trim()) {
      newErrors.new_password_confirmation = "Please confirm your new password";
    } else if (formData.new_password !=  formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length ==  0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: "Update Profile?",
      text: "Are you sure you want to update your profile information?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#E53935",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("auth_token");

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/profile`,
        {
          Usr_Name: formData.Usr_Name,
          Usr_Email: formData.Usr_Email,
          Usr_Mobile: formData.Usr_Mobile,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setEditMode(false);
        await fetchProfileData();

        // Update localStorage user data
        const amtUser = localStorage.getItem("amt_user");
        if (amtUser) {
          const userData = JSON.parse(amtUser);
          userData.Usr_Name = formData.Usr_Name;
          userData.Usr_Email = formData.Usr_Email;
          userData.Usr_Mobile = formData.Usr_Mobile;
          localStorage.setItem("amt_user", JSON.stringify(userData));
        }
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status ==  401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: "Change Password?",
      text: "Are you sure you want to change your password?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#E53935",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, change!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("auth_token");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/change-password`,
        {
          old_password: formData.old_password,
          new_password: formData.new_password,
          new_password_confirmation: formData.new_password_confirmation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Password changed successfully!");

        setFormData((prev) => ({
          ...prev,
          old_password: "",
          new_password: "",
          new_password_confirmation: "",
        }));
        setErrors({});
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status ==  401) {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to change password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData.user) {
      setFormData((prev) => ({
        ...prev,
        Usr_Name: profileData.user.Usr_Name || "",
        Usr_Email: profileData.user.Usr_Email || "",
        Usr_Mobile: profileData.user.Usr_Mobile || "",
      }));
    }
    setErrors({});
    setEditMode(false);
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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profileData.user || !profileData.user.Usr_Name) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load profile data</p>
        <button
          onClick={fetchProfileData}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const { user, department } = profileData;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">
              View and manage your personal information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchProfileData}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab ==  "profile"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab ==  "security"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            Security Settings
          </button>
        </nav>
      </div>

      {activeTab ==  "profile" ? (
        <form onSubmit={handleProfileSubmit} className="space-y-8">
          {/* Profile Header Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl shadow-lg p-6 text-white mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/50">
                  <span className="text-3xl font-bold text-white">
                    {user.Usr_Name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {user.Usr_Name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-indigo-100">
                    <AtSign className="h-4 w-4" />
                    <span>{user.Usr_Email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-indigo-100">
                    <Smartphone className="h-4 w-4" />
                    <span>{user.Usr_Mobile}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!editMode ? (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center transition-colors shadow-md"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 flex items-center transition-colors backdrop-blur border border-white/30"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="text"
                          name="Usr_Name"
                          value={formData.Usr_Name}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Usr_Name
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter username"
                          maxLength={50}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {user.Usr_Name}
                        </div>
                      )}
                    </div>
                    {errors.Usr_Name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Usr_Name}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 50 characters
                    </p>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="email"
                          name="Usr_Email"
                          value={formData.Usr_Email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Usr_Email
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter email address"
                          maxLength={50}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {user.Usr_Email}
                        </div>
                      )}
                    </div>
                    {errors.Usr_Email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Usr_Email}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Max 50 characters
                    </p>
                  </div>

                  {/* Mobile Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {editMode ? (
                        <input
                          type="tel"
                          name="Usr_Mobile"
                          value={formData.Usr_Mobile}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            errors.Usr_Mobile
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter mobile number"
                          maxLength={15}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                          {user.Usr_Mobile}
                        </div>
                      )}
                    </div>
                    {errors.Usr_Mobile && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Usr_Mobile}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      10 digits required
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {editMode && (
                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Activity Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Account Activity
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Last Login
                    </label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(user.last_login)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Account Created
                    </label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">
                      Last Updated
                    </label>
                    <div className="flex items-center">
                      <RefreshCw className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(user.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Role & Department */}
            <div className="space-y-6">
              {/* Role Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Role Information
                  </h3>
                </div>

                {user.role ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Role Name
                      </label>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {user.role.Role_Name}
                        </span>
                      </div>
                    </div>
                    {user.role.Role_Prefix && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">
                          Role Prefix
                        </label>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">
                            {user.role.Role_Prefix}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No role assigned</p>
                  </div>
                )}
              </div>

              {/* Department Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <Building className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Department Information
                  </h3>
                </div>

                {department ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">
                        Department
                      </label>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {department.Dpt_Name || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      No department assigned
                    </p>
                  </div>
                )}
              </div>

              {/* Account Status Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Status
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    {user.is_active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>

                  {user.is_locked && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Lock Status</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        // Security Settings Tab
        <form onSubmit={handlePasswordSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                <Key className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Change Password
              </h2>
            </div>

            <div className="max-w-xl space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="old_password"
                    value={formData.old_password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.old_password ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.old_password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.old_password}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.new_password ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter new password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.new_password}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="new_password_confirmation"
                    value={formData.new_password_confirmation}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.new_password_confirmation
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>
                {errors.new_password_confirmation && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.new_password_confirmation}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      old_password: "",
                      new_password: "",
                      new_password_confirmation: "",
                    }));
                    setErrors({});
                  }}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;