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
  Hash,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  TrendingDown,
  Scale,
  Type,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DebtTypeMasterApi } from "../../../services/debttypemasterapi";

const AddEditDebtType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [options, setOptions] = useState({
    dt_cate_options: {},
    dt_lia_type_options: {},
  });

  const [formData, setFormData] = useState({
    DT_Code: "",
    DT_Name: "",
    DT_Cate: "",
    DT_Lia_type: "",
    Is_Active: true,
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadDebtTypeData();
    }
  }, [id]);

  const loadDebtTypeData = async () => {
    setLoading(true);
    try {
      const response = await DebtTypeMasterApi.getById(id);
      const debtType = response.data;

      setFormData({
        DT_Code: debtType.DT_Code || "",
        DT_Name: debtType.DT_Name || "",
        DT_Cate: debtType.DT_Cate || "",
        DT_Lia_type: debtType.DT_Lia_type || "",
        Is_Active: debtType.Is_Active != undefined ? debtType.Is_Active : true,
      });

      setOptions({
        dt_cate_options: response.options.dt_cate_options || {},
        dt_lia_type_options: response.options.dt_lia_type_options || {},
      });
    } catch (error) {
      toast.error("Failed to load debt type data!");
      navigate("/masters/grant-management/debt-type-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "DT_Code") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
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
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generateCodeSuggestions = () => {
    const name = formData.DT_Name.trim();
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

    if (formData.DT_Code && formData.DT_Code.length > 20) {
      newErrors.DT_Code = "Debt code must not exceed 20 characters";
    }

    if (!formData.DT_Name.trim()) {
      newErrors.DT_Name = "Debt name is required";
    } else if (formData.DT_Name.length > 50) {
      newErrors.DT_Name = "Debt name must not exceed 50 characters";
    }

    if (formData.DT_Cate) {
      const allowedCategories = ["Long Term", "Short Term"];
      if (!allowedCategories.includes(formData.DT_Cate)) {
        newErrors.DT_Cate = "Invalid debt category";
      }
    }

    if (formData.DT_Lia_type) {
      const allowedLiabilityTypes = ["Payable", "Deposit", "Loan"];
      if (!allowedLiabilityTypes.includes(formData.DT_Lia_type)) {
        newErrors.DT_Lia_type = "Invalid liability type";
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
      title: isEditMode ? "Update Debt Type?" : "Create New Debt Type?",
      text: isEditMode
        ? "Are you sure you want to update this debt type information?"
        : "Are you sure you want to create this new debt type?",
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
      const debtTypeData = {
        DT_Code: formData.DT_Code.trim() || null,
        DT_Name: formData.DT_Name.trim(),
        DT_Cate: formData.DT_Cate.trim() || null,
        DT_Lia_type: formData.DT_Lia_type.trim() || null,
        Is_Active: formData.Is_Active,
      };

      let response;
      if (isEditMode) {
        response = await DebtTypeMasterApi.update(id, debtTypeData);
        toast.success("Debt type updated successfully!");
      } else {
        response = await DebtTypeMasterApi.create(debtTypeData);
        toast.success("Debt type created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/grant-management/debt-type-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving debt type:", error);

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
              ? "Failed to update debt type. Please try again."
              : "Failed to create debt type. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/grant-management/debt-type-master");
  };

  const suggestions = generateCodeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading debt type data...</p>
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
              navigate("/masters/grant-management/debt-type-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Debt Type" : "Add New Debt Type"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update debt type master information"
                : "Create a new debt type master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Debt Type Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <TrendingDown className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Debt Type Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* DT_Name - Required with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Debt Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.DT_Name.length > 40
                      ? formData.DT_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.DT_Name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="DT_Name"
                  value={formData.DT_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.DT_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Bank Loan, Government Bond"
                  required
                  maxLength={50}
                />
                {formData.DT_Name && !errors.DT_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.DT_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.DT_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.DT_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Full name of the debt type (required, max 50 characters)
                </p>
              )}
            </div>

            {/* DT_Code - Optional with Character Counter and Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Debt Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.DT_Code.length > 15
                        ? formData.DT_Code.length >= 20
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.DT_Code.length}/20 characters
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
                              DT_Code: suggestion,
                            }));
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
                  name="DT_Code"
                  value={formData.DT_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.DT_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                  placeholder="e.g., BANK001, GOVT001 (optional)"
                  maxLength={20}
                />
                {formData.DT_Code && !errors.DT_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.DT_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.DT_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.DT_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the debt type (optional, max 20 characters,
                  uppercase only)
                </p>
              )}
            </div>

            {/* DT_Cate - Optional Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Debt Category{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  name="DT_Cate"
                  value={formData.DT_Cate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.DT_Cate ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">Select debt category (Optional)</option>
                  <option value="Long Term">Long Term</option>
                  <option value="Short Term">Short Term</option>
                </select>
                {errors.DT_Cate && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500 z-20" />
                )}
              </div>
              {errors.DT_Cate ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.DT_Cate}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Duration classification of the debt (optional)
                </p>
              )}
            </div>

            {/* DT_Lia_type - Optional Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liability Type{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  name="DT_Lia_type"
                  value={formData.DT_Lia_type}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.DT_Lia_type ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">Select liability type (Optional)</option>
                  <option value="Payable">Payable</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Loan">Loan</option>
                </select>
                {errors.DT_Lia_type && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500 z-20" />
                )}
              </div>
              {errors.DT_Lia_type ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.DT_Lia_type}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Type of liability (optional)
                </p>
              )}
            </div>

            {/* Is_Active Toggle */}
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
              <p className="text-xs text-gray-500">
                Enable or disable this debt type
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
                  {isEditMode ? "Update Debt Type" : "Create Debt Type"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditDebtType;
