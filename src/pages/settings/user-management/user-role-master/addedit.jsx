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
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Shield,
  Key,
  Lock,
  AlertCircle,
  Check,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import RoleMasterApi from "../../../services/rolemasterapi";

const AddEditRoleMaster = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    Role_Prefix: "",
    Role_Name: "",
    TwoFacAuth: "N",
    Is_Active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadRoleData();
    }
  }, [id]);

  const loadRoleData = async () => {
    setLoading(true);
    try {
      const response = await RoleMasterApi.getById(id);
      if (response.success) {
        const role = response.data;
        setFormData({
          Role_Prefix: role.Role_Prefix || "",
          Role_Name: role.Role_Name || "",
          TwoFacAuth: role.TwoFacAuth || "N",
          Is_Active: role.Is_Active != undefined ? role.Is_Active : true,
        });
      } else {
        toast.error("Failed to load role data!");
        navigate("/settings/user-management/user-role-master");
      }
    } catch (error) {
      toast.error("Failed to load role data!");
      navigate("/settings/user-management/user-role-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Prevent changes to Role_Prefix in edit mode
    if (isEditMode && name == "Role_Prefix") {
      return;
    }

    if (name == "Role_Prefix") {
      const upperValue = value.toUpperCase().replace(/[^A-Z]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const generatePrefixSuggestions = () => {
    const name = formData.Role_Name.trim();
    if (!name) return [];

    const suggestions = [];

    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 3) {
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
      if (word.length >= 4) {
        suggestions.push(word.substring(0, 4).toUpperCase());
      }
    } else if (words.length >= 2) {
      suggestions.push((words[0].charAt(0) + words[1].charAt(0)).toUpperCase());
      if (words[0].length >= 2) {
        suggestions.push(
          (words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase(),
        );
      }
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Role_Prefix.trim()) {
      newErrors.Role_Prefix = "Role prefix is required";
    } else if (formData.Role_Prefix.length > 10) {
      newErrors.Role_Prefix = `Maximum 10 characters allowed (${formData.Role_Prefix.length}/10)`;
    } else if (!/^[A-Z]+$/.test(formData.Role_Prefix)) {
      newErrors.Role_Prefix = "Only uppercase letters allowed";
    }

    if (!formData.Role_Name.trim()) {
      newErrors.Role_Name = "Role name is required";
    } else if (formData.Role_Name.length > 50) {
      newErrors.Role_Name = `Maximum 50 characters allowed (${formData.Role_Name.length}/50)`;
    }

    if (!formData.TwoFacAuth) {
      newErrors.TwoFacAuth = "Two Factor Authentication setting is required";
    } else if (!["Y", "N"].includes(formData.TwoFacAuth)) {
      newErrors.TwoFacAuth = "Invalid value";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Role?" : "Create New Role?",
      text: isEditMode
        ? "Are you sure you want to update this role?"
        : "Are you sure you want to create this new role?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      if (isEditMode) {
        await RoleMasterApi.update(id, formData);
        toast.success("Role updated successfully!");
      } else {
        await RoleMasterApi.create(formData);
        toast.success("Role created successfully!");
      }

      setTimeout(() => {
        navigate("/settings/user-management/user-role-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving role:", error);

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
      } else {
        toast.error(
          isEditMode
            ? "Failed to update role. Please try again."
            : "Failed to create role. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/settings/user-management/user-role-master");
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const suggestions = generatePrefixSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading role data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Role" : "Add New Role"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update role information"
                : "Create a new user role for the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Role Name Field with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Role_Name.length > 45
                      ? formData.Role_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Role_Name.length}/50 characters
                </span>
              </div>
              <input
                type="text"
                name="Role_Name"
                value={formData.Role_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Role_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Administrator, Finance Manager, HR Executive"
                maxLength={50}
              />
              {errors.Role_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Role_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Descriptive name for the role (max 50 characters)
                </p>
              )}
            </div>

            {/* Role Prefix Field with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Role Prefix <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.Role_Prefix.length > 8
                        ? formData.Role_Prefix.length >= 10
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.Role_Prefix.length}/10 characters
                  </span>
                  {suggestions.length > 0 && !isEditMode && (
                    <div className="text-xs text-gray-500">
                      Suggestions:{" "}
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              Role_Prefix: suggestion,
                            }));
                            if (errors.Role_Prefix) {
                              setErrors((prev) => ({
                                ...prev,
                                Role_Prefix: null,
                              }));
                            }
                          }}
                          className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Role_Prefix"
                  value={formData.Role_Prefix}
                  onChange={handleInputChange}
                  disabled={isEditMode}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase 
                    ${errors.Role_Prefix ? "border-red-300" : "border-gray-300"}
                    ${isEditMode ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white"}
                  `}
                  placeholder="ADM, FIN, HR"
                  maxLength={10}
                  readOnly={isEditMode}
                />
                {formData.Role_Prefix && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Role_Prefix)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy prefix"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Role_Prefix ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Role_Prefix}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {isEditMode
                    ? "Role prefix cannot be changed after creation"
                    : "Unique prefix in uppercase letters only (max 10 characters)"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <Lock className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Security Settings
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Two Factor Authentication{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`relative flex cursor-pointer rounded-lg border p-4 ${
                    formData.TwoFacAuth == "Y"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="TwoFacAuth"
                    value="Y"
                    checked={formData.TwoFacAuth == "Y"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div
                      className={`h-5 w-5 rounded-full border mr-3 flex items-center justify-center ${
                        formData.TwoFacAuth == "Y"
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.TwoFacAuth == "Y" && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Enable 2FA
                      </div>
                      <div className="text-xs text-gray-500">
                        Users must use two-factor authentication
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className={`relative flex cursor-pointer rounded-lg border p-4 ${
                    formData.TwoFacAuth == "N"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="TwoFacAuth"
                    value="N"
                    checked={formData.TwoFacAuth == "N"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div
                      className={`h-5 w-5 rounded-full border mr-3 flex items-center justify-center ${
                        formData.TwoFacAuth == "N"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.TwoFacAuth == "N" && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Disable 2FA
                      </div>
                      <div className="text-xs text-gray-500">
                        Two-factor authentication not required
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              {errors.TwoFacAuth && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TwoFacAuth}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Role Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this role
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inactive roles cannot be assigned to users
              </p>
            </div>
            <div className="flex">
              <label className="flex cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="Is_Active"
                    checked={formData.Is_Active}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full ${
                      formData.Is_Active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      formData.Is_Active ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  {formData.Is_Active ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-2" />
                      Inactive
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0"></div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Role" : "Create Role"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditRoleMaster;
