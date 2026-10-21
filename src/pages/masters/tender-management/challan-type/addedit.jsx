/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved...
 *
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Briefcase,
  Hash,
  Check,
  AlertCircle,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChallanTypeMasterApi } from "../../../services/challantypemasterapi";

const AddEditChallanType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    Cht_Name: "", // Changed from "name" to "Cht_Name"
    Cht_Code: "", // Changed from "code" to "Cht_Code"
    Is_Active: true, // UI uses boolean (true/false)
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadChallanData();
    }
  }, [id]);

  const loadChallanData = async () => {
    setLoading(true);
    try {
      const challan = await ChallanTypeMasterApi.getById(id);

      // Convert API response to UI boolean (Is_Active: true/false)
      let isActiveBoolean = true;

      // Check for different possible field names in response
      if (challan.Is_Active != undefined) {
        // Handle boolean value (true/false) or numeric (1/0)
        isActiveBoolean = challan.Is_Active == true || challan.Is_Active == 1;
      } else if (challan.Is_Active != undefined) {
        // Handle lowercase Is_Active
        isActiveBoolean = challan.Is_Active == true || challan.Is_Active == 1;
      } else if (challan.active != undefined) {
        // Handle active field
        isActiveBoolean = challan.active == true || challan.active == 1;
      }

      setFormData({
        Cht_Name: challan.Cht_Name || challan.name || "",
        Cht_Code: challan.Cht_Code || challan.code || "",
        Is_Active: isActiveBoolean, // Store as boolean for UI
      });
    } catch (error) {
      console.error("Error loading challan data:", error);
      toast.error("Failed to load challan type data!");
      navigate("/masters/tender-management/challan-type");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "Cht_Code") {
      // Auto-uppercase for code
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else if (name == "Is_Active") {
      // Handle checkbox toggle - store as boolean for UI
      setFormData((prev) => ({
        ...prev,
        Is_Active: checked,
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

  // Code suggestion logic
  const generateCodeSuggestions = () => {
    const name = formData.Cht_Name.trim();
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

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.Cht_Name.trim()) {
      newErrors.Cht_Name = "Challan name is required";
    } else if (formData.Cht_Name.length > 50) {
      newErrors.Cht_Name = "Challan name must not exceed 50 characters";
    }

    if (formData.Cht_Code && formData.Cht_Code.length > 20) {
      newErrors.Cht_Code = "Challan code must not exceed 20 characters";
    } else if (formData.Cht_Code && !/^[A-Z0-9]+$/.test(formData.Cht_Code)) {
      newErrors.Cht_Code =
        "Challan code must contain only uppercase letters and numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Challan Type?" : "Create New Challan Type?",
      text: isEditMode
        ? "Are you sure you want to update this challan type information?"
        : "Are you sure you want to create this new challan type?",
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
      // Prepare payload with correct field names matching the API expectations
      const challanData = {
        name: formData.Cht_Name.trim(), // Changed from "name" to "Cht_Name"
        code: formData.Cht_Code.trim() || null, // Changed from "code" to "Cht_Code"
        Is_Active: formData.Is_Active ? 1 : 0, // Convert boolean to 0/1 for API
      };

      console.log("Sending payload:", challanData); // Debug log

      if (isEditMode) {
        await ChallanTypeMasterApi.update(id, challanData);
        toast.success("Challan type updated successfully!");
      } else {
        await ChallanTypeMasterApi.create(challanData);
        toast.success("Challan type created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/tender-management/challan-type");
      }, 1500);
    } catch (error) {
      console.error("Error saving challan type:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          // Map API field names to form field names
          let formField = key;
          if (key == "Cht_Name") formField = "Cht_Name";
          if (key == "Cht_Code") formField = "Cht_Code";
          if (key == "Is_Active") formField = "Is_Active";
          fieldErrors[formField] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          error.message ||
            (isEditMode
              ? "Failed to update challan type. Please try again."
              : "Failed to create challan type. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/tender-management/challan-type");
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
        <p className="mt-4 text-gray-600">Loading challan type data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/tender-management/challan-type")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Challan Type" : "Add New Challan Type"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update challan type master information"
                : "Create a new challan type master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Challan Type Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Challan Name - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Challan Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Cht_Name.length > 40
                      ? formData.Cht_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Cht_Name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Cht_Name"
                  value={formData.Cht_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Cht_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Traffic Challan, Parking Challan"
                  required
                  maxLength={50}
                />
                {formData.Cht_Name && !errors.Cht_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Cht_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Cht_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Cht_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Descriptive name for the challan type (max 50 characters)
                </p>
              )}
            </div>

            {/* Challan Code - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Challan Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.Cht_Code.length > 15
                        ? formData.Cht_Code.length >= 20
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.Cht_Code.length}/20 characters
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
                              Cht_Code: suggestion,
                            }));
                            if (errors.Cht_Code) {
                              setErrors((prev) => ({ ...prev, Cht_Code: "" }));
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
                  name="Cht_Code"
                  value={formData.Cht_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Cht_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                  placeholder="e.g., CHT001, PARK002 (optional)"
                  maxLength={20}
                />
                {formData.Cht_Code && !errors.Cht_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Cht_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.Cht_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Cht_Code)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Cht_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Cht_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the challan type (optional, max 20 characters,
                  uppercase letters/numbers only)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Card - Matching other masters UI */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Challan Type Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this challan type
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inactive challan types won't be available for assignments
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

        {/* Action Buttons */}
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
                  {isEditMode ? "Update Challan Type" : "Create Challan Type"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditChallanType;
