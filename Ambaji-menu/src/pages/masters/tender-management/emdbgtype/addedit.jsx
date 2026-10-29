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
  Percent,
  Hash,
  Check,
  AlertCircle,
  Copy,
  Info,
  Calculator,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { EmdbgTypeApi } from "../../../services/emdbgtypemasterapi";

const AddEditEMDBGType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [codeError, setCodeError] = useState("");

  const [formData, setFormData] = useState({
    EBT_Code: "",
    EBT_Name: "",
    Percentage: "",
    Is_Active: true, // UI uses boolean (true/false)
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadEMDBGTypeData();
    }
  }, [id]);

  const loadEMDBGTypeData = async () => {
    setLoading(true);
    try {
      const emdbgType = await EmdbgTypeApi.getById(id);

      // Convert API response to UI boolean (Is_Active: true/false)
      let isActiveBoolean = true;

      // Check for different possible field names in response
      if (emdbgType.Is_Active != undefined) {
        // Handle boolean value (true/false) or numeric (1/0)
        isActiveBoolean =
          emdbgType.Is_Active == true || emdbgType.Is_Active == 1;
      } else if (emdbgType.is_active != undefined) {
        // Handle lowercase is_active
        isActiveBoolean =
          emdbgType.is_active == true || emdbgType.is_active == 1;
      } else if (emdbgType.active != undefined) {
        // Handle active field
        isActiveBoolean = emdbgType.active == true || emdbgType.active == 1;
      }

      setFormData({
        EBT_Code: emdbgType.EBT_Code || "",
        EBT_Name: emdbgType.EBT_Name || "",
        Percentage: emdbgType.Percentage?.toString() || "",
        Is_Active: isActiveBoolean, // Store as boolean for UI
      });
    } catch (error) {
      console.error("Error loading EMDBG type data:", error);
      toast.error("Failed to load EMDBG type data!");
      navigate("/masters/tender-management/emdbg-type");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "EBT_Code") {
      const processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
      setCodeError("");
    } else if (name == "Percentage") {
      let processedValue = value.replace(/[^0-9]/g, "");

      if (processedValue.length > 3) {
        processedValue = processedValue.substring(0, 3);
      }

      if (parseInt(processedValue) > 100) {
        processedValue = "100";
      }

      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
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

  const generateCodeSuggestions = () => {
    const name = formData.EBT_Name.trim();
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

    if (!formData.EBT_Name.trim()) {
      newErrors.EBT_Name = "EMDBG type name is required";
    } else if (formData.EBT_Name.length > 50) {
      newErrors.EBT_Name = "EMDBG type name must not exceed 50 characters";
    }

    if (formData.EBT_Code && formData.EBT_Code.length > 20) {
      newErrors.EBT_Code = "EMDBG type code must not exceed 20 characters";
    } else if (formData.EBT_Code && !/^[A-Z0-9]+$/.test(formData.EBT_Code)) {
      newErrors.EBT_Code =
        "EMDBG type code must contain only uppercase letters and numbers";
    }

    if (formData.Percentage) {
      const percentageValue = parseInt(formData.Percentage);
      if (isNaN(percentageValue)) {
        newErrors.Percentage = "Percentage must be a valid number";
      } else if (percentageValue < 0) {
        newErrors.Percentage = "Percentage cannot be negative";
      } else if (percentageValue > 100) {
        newErrors.Percentage = "Percentage must not exceed 100";
      }
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
      title: isEditMode ? "Update EMDBG Type?" : "Create New EMDBG Type?",
      text: isEditMode
        ? "Are you sure you want to update this EMDBG type information?"
        : "Are you sure you want to create this new EMDBG type?",
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
      const emdbgTypeData = {
        EBT_Code: formData.EBT_Code.trim() || null,
        EBT_Name: formData.EBT_Name.trim(),
        Percentage: formData.Percentage ? parseInt(formData.Percentage) : null,
        Is_Active: formData.Is_Active ? 1 : 0, // Convert boolean to 0/1 for API
      };

      console.log("Sending payload:", emdbgTypeData); // Debug log

      let response;
      if (isEditMode) {
        response = await EmdbgTypeApi.update(id, emdbgTypeData);
        toast.success("EMDBG type updated successfully!");
      } else {
        response = await EmdbgTypeApi.create(emdbgTypeData);
        toast.success("EMDBG type created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/tender-management/emdbg-type");
      }, 1500);
    } catch (error) {
      console.error("Error saving EMDBG type:", error);

      if (error.errors) {
        const newErrors = {};

        Object.keys(error.errors).forEach((key) => {
          newErrors[key] = Array.isArray(error.errors[key])
            ? error.errors[key][0]
            : error.errors[key];
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update EMDBG type. Please try again."
            : "Failed to create EMDBG type. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/tender-management/emdbg-type");
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading EMDBG type data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details as requested */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/tender-management/emdbg-type")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit EMDBG Type" : "Add New EMDBG Type"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update EMDBG type master information"
                : "Create a new EMDBG type master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Percent className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              EMDBG Type Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* EMDBG Type Name - Required with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  EMDBG Type Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.EBT_Name.length > 40
                      ? formData.EBT_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.EBT_Name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="EBT_Name"
                  value={formData.EBT_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.EBT_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., EMD Basic, EMD Standard, EMD Premium"
                  required
                  maxLength={50}
                />
                {formData.EBT_Name && !errors.EBT_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.EBT_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.EBT_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.EBT_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Name of the EMDBG type (required, max 50 characters)
                </p>
              )}
            </div>

            {/* EMDBG Type Code - Optional with Character Counter and Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  EMDBG Type Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.EBT_Code.length > 15
                        ? formData.EBT_Code.length >= 20
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.EBT_Code.length}/20 characters
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
                              EBT_Code: suggestion,
                            }));
                            setCodeError("");
                            if (errors.EBT_Code) {
                              setErrors((prev) => ({ ...prev, EBT_Code: "" }));
                            }
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
                  name="EBT_Code"
                  value={formData.EBT_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.EBT_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase`}
                  placeholder="e.g., EBT001, EMD001, BASIC001 (optional)"
                  maxLength={20}
                />
                {formData.EBT_Code && !errors.EBT_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.EBT_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.EBT_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.EBT_Code)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.EBT_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.EBT_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the EMDBG type (optional, max 20 characters,
                  uppercase letters/numbers only)
                </p>
              )}
            </div>

            {/* Percentage - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Percentage (%){" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Percentage.length > 2
                      ? formData.Percentage.length >= 3
                        ? "text-amber-600"
                        : "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Percentage.length}/3 digits
                </span>
              </div>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Percentage"
                  value={formData.Percentage}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Percentage ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 5, 10, 25, 50"
                />
                {formData.Percentage && !errors.Percentage && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Percentage && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Percentage ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Percentage}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Percentage value (optional, integer from 0 to 100)
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
                EMDBG Type Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this EMDBG type
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inactive EMDBG types won't be available for assignments
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
                  {isEditMode ? "Update EMDBG Type" : "Create EMDBG Type"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditEMDBGType;
