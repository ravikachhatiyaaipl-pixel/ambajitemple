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
  Tag,
  Hash,
  Check,
  AlertCircle,
  Copy,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { GrantCategoryMasterApi } from "../../../services/grantcategorymasterapi";

const AddEditGrantCategory = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    GC_Name: "",
    GC_Code: "",
    is_active: true, // UI uses boolean (true/false)
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadCategoryData();
    }
  }, [id]);

  const loadCategoryData = async () => {
    setLoading(true);
    try {
      const category = await GrantCategoryMasterApi.getById(id);

      // Convert API response to UI boolean (is_active: true/false)
      let isActiveBoolean = true;

      // Check for different possible field names in response
      if (category.Is_Active != undefined) {
        // Handle boolean value (true/false) - most common
        isActiveBoolean = category.Is_Active == true || category.Is_Active == 1;
      } else if (category.is_active != undefined) {
        // Handle lowercase is_active
        isActiveBoolean = category.is_active == true || category.is_active == 1;
      } else if (category.active != undefined) {
        // Handle active field
        isActiveBoolean = category.active == true || category.active == 1;
      }

      setFormData({
        GC_Name: category.GC_Name || "",
        GC_Code: category.GC_Code || "",
        is_active: isActiveBoolean, // Store as boolean for UI
      });
    } catch (error) {
      toast.error("Failed to load grant category data!");
      navigate("/masters/grant-management/grant-category-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "GC_Code") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else if (name == "is_active") {
      // Handle checkbox toggle - store as boolean for UI
      setFormData((prev) => ({
        ...prev,
        is_active: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generateCodeSuggestions = () => {
    const name = formData.GC_Name.trim();
    if (!name) return [];

    const suggestions = [];

    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 2) {
        suggestions.push(word.substring(0, 2).toUpperCase());
      }
      if (word.length >= 3) {
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
      suggestions.push(word.substring(0, 2).toUpperCase() + "001");
      suggestions.push(word.substring(0, 3).toUpperCase() + "001");
    } else if (words.length >= 2) {
      const firstLetters = words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase();
      suggestions.push(firstLetters);

      if (words[0].length >= 2) {
        suggestions.push(
          (words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase(),
        );
      }
      suggestions.push(firstLetters + "001");
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.GC_Name.trim()) {
      newErrors.GC_Name = "Category name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode
        ? "Update Grant Category?"
        : "Create New Grant Category?",
      text: isEditMode
        ? "Are you sure you want to update this grant category information?"
        : "Are you sure you want to create this new grant category?",
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
      // Convert UI boolean (is_active) to API payload (Is_Active: 0/1)
      const categoryData = {
        GC_Name: formData.GC_Name.trim(),
        GC_Code: formData.GC_Code.trim() || null,
        Is_Active: formData.is_active ? 1 : 0, // Convert boolean to 0/1 for API
      };

      let response;
      if (isEditMode) {
        response = await GrantCategoryMasterApi.update(id, categoryData);
        toast.success("Grant category updated successfully!");
      } else {
        response = await GrantCategoryMasterApi.create(categoryData);
        toast.success("Grant category created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/grant-management/grant-category-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving grant category:", error);

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};

        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            (isEditMode
              ? "Failed to update grant category. Please try again."
              : "Failed to create grant category. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/grant-management/grant-category-master");
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const suggestions = generateCodeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading grant category data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details as requested */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/grant-management/grant-category-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Grant Category" : "Add New Grant Category"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update grant category master information"
                : "Create a new grant category master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Tag className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Grant Category Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* GC_Name - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.GC_Name.length} characters
                </span>
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="GC_Name"
                  value={formData.GC_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.GC_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., Infrastructure Grant, Research Grant"
                  required
                />
                {formData.GC_Name && !errors.GC_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.GC_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.GC_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GC_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Name of the grant category (required)
                </p>
              )}
            </div>

            {/* GC_Code - Optional with Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Category Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {formData.GC_Code.length} characters
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
                              GC_Code: suggestion,
                            }));
                          }}
                          className="ml-2 px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="GC_Code"
                  value={formData.GC_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.GC_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase`}
                  placeholder="e.g., INF001, RES001 (optional)"
                />
                {formData.GC_Code && !errors.GC_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.GC_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.GC_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.GC_Code)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.GC_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GC_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the grant category (optional)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Card - Matching Zone Master UI */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Category Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this grant category
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inactive categories won't be available for grant assignment
              </p>
            </div>
            <div className="flex">
              <label className="flex cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full ${
                      formData.is_active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      formData.is_active ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  {formData.is_active ? (
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Category code should be unique across all grant categories if
              provided
            </p>
          </div>
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
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode
                    ? "Update Grant Category"
                    : "Create Grant Category"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditGrantCategory;
