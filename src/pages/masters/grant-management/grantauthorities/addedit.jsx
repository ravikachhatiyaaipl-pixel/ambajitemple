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
  Building,
  Hash,
  CheckCircle,
  XCircle,
  Check,
  AlertCircle,
  Shield,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { GrantAuthoritiesMasterApi } from "../../../services/grantauthorityapi";

const AddEditGrantAuthority = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    GA_Code: "",
    GA_Name: "",
    is_active: true,
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadGrantAuthorityData();
    }
  }, [id]);

  const loadGrantAuthorityData = async () => {
    setLoading(true);
    try {
      const authority = await GrantAuthoritiesMasterApi.getById(id);

      // Convert API response to UI boolean (is_active: true/false)
      let isActiveBoolean = true;

      // Check for different possible field names in response
      if (authority.Is_Active != undefined) {
        // Handle boolean value (true/false) or numeric (1/0)
        isActiveBoolean =
          authority.Is_Active == true || authority.Is_Active == 1;
      } else if (authority.is_active != undefined) {
        // Handle lowercase is_active
        isActiveBoolean =
          authority.is_active == true || authority.is_active == 1;
      } else if (authority.active != undefined) {
        // Handle active field
        isActiveBoolean = authority.active == true || authority.active == 1;
      }

      console.log("Authority data loaded:", authority); // Debug log
      console.log("Is_Active value:", authority.Is_Active); // Debug log
      console.log("isActiveBoolean:", isActiveBoolean); // Debug log

      setFormData({
        GA_Code: authority.GA_Code || "",
        GA_Name: authority.GA_Name || "",
        is_active: isActiveBoolean, // Store as boolean for UI
      });
    } catch (error) {
      console.error("Error loading grant authority data:", error);
      toast.error("Failed to load grant authority data!");
      navigate("/masters/grant-management/grant-authorities-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "GA_Code") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
      setCodeError("");
    } else if (name == "is_active") {
      // Handle checkbox toggle - store as boolean for UI
      setFormData((prev) => ({
        ...prev,
        is_active: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generateCodeSuggestions = () => {
    const name = formData.GA_Name.trim();
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

    if (formData.GA_Code && formData.GA_Code.length > 50) {
      newErrors.GA_Code = "Authority code must not exceed 50 characters";
    } else if (formData.GA_Code && !/^[A-Z0-9]+$/.test(formData.GA_Code)) {
      newErrors.GA_Code =
        "Authority code must contain only uppercase letters and numbers";
    }

    if (!formData.GA_Name.trim()) {
      newErrors.GA_Name = "Authority name is required";
    } else if (formData.GA_Name.length > 50) {
      newErrors.GA_Name = "Authority name must not exceed 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode
        ? "Update Grant Authority?"
        : "Create New Grant Authority?",
      text: isEditMode
        ? "Are you sure you want to update this grant authority information?"
        : "Are you sure you want to create this new grant authority?",
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
      // API service will convert is_active to Is_Active with 1/0
      const authorityData = {
        GA_Code: formData.GA_Code.trim() || null,
        GA_Name: formData.GA_Name.trim(),
        is_active: formData.is_active, // Send boolean, API service will convert
      };

      console.log("Sending data to API:", authorityData); // Debug log

      let response;
      if (isEditMode) {
        response = await GrantAuthoritiesMasterApi.update(id, authorityData);
        toast.success("Grant authority updated successfully!");
      } else {
        response = await GrantAuthoritiesMasterApi.create(authorityData);
        toast.success("Grant authority created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/grant-management/grant-authorities-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving grant authority:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          let formField = key;
          if (key == "GA_Code") formField = "GA_Code";
          if (key == "GA_Name") formField = "GA_Name";
          if (key == "Is_Active") formField = "is_active";
          fieldErrors[formField] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          error.message ||
            (isEditMode
              ? "Failed to update grant authority. Please try again."
              : "Failed to create grant authority. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/grant-management/grant-authorities-master");
  };

  const suggestions = generateCodeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading grant authority data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/grant-management/grant-authorities-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Grant Authority" : "Add New Grant Authority"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update grant authority master information"
                : "Create a new grant authority master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Grant Authority Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* GA_Name - Required with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Authority Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.GA_Name.length > 40
                      ? formData.GA_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.GA_Name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="GA_Name"
                  value={formData.GA_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.GA_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Central Grant Authority, State Grant Board"
                  required
                  maxLength={50}
                />
                {formData.GA_Name && !errors.GA_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.GA_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.GA_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GA_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Full name of the grant authority (required, max 50 characters)
                </p>
              )}
            </div>

            {/* GA_Code - Optional with Character Counter and Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Authority Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.GA_Code.length > 40
                        ? formData.GA_Code.length >= 50
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.GA_Code.length}/50 characters
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
                              GA_Code: suggestion,
                            }));
                            if (errors.GA_Code) {
                              setErrors((prev) => ({ ...prev, GA_Code: "" }));
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
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="GA_Code"
                  value={formData.GA_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.GA_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                  placeholder="e.g., CGA001, SGB001 (optional)"
                  maxLength={50}
                />
                {formData.GA_Code && !errors.GA_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.GA_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.GA_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GA_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the grant authority (optional, max 50
                  characters, uppercase letters/numbers only)
                </p>
              )}
            </div>

            {/* Status Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex items-center">
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
              <p className="text-xs text-gray-500">
                Only active authorities will be available for selection in grant
                types
              </p>
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
                  {isEditMode
                    ? "Update Grant Authority"
                    : "Create Grant Authority"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditGrantAuthority;
