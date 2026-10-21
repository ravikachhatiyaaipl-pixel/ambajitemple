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
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Key,
  AlertCircle,
  Copy,
  DollarSign,
  Percent,
  Calendar,
  TrendingUp,
  CreditCard,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import LoanTypeMasterApi from "../../../services/loantypemasterapi";

const AddEditLoanType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageTitle, setPageTitle] = useState("Loan Type Master");

  const [formData, setFormData] = useState({
    LT_Code: "",
    LT_Name: "",
    Loan_Mode: "IN",
    Max_Amount: "",
    Interest_Rate: "",
    Tenure_Years: "",
    Is_Active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/loan-management/loan-type-master";

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

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadLoanTypeData();
    }
  }, [id]);

  const loadLoanTypeData = async () => {
    setLoading(true);
    try {
      const response = await LoanTypeMasterApi.getById(id);
      if (response.success) {
        const loanType = response.data;

        let isActiveBoolean = true;

        if (loanType.Is_Active != undefined) {
          isActiveBoolean = loanType.Is_Active == 1;
        }

        setFormData({
          LT_Code: loanType.LT_Code || "",
          LT_Name: loanType.LT_Name || "",
          Loan_Mode: loanType.Loan_Mode || "IN",
          Max_Amount: loanType.Max_Amount || "",
          Interest_Rate: loanType.Interest_Rate || "",
          Tenure_Years: loanType.Tenure_Years || "",
          Is_Active: isActiveBoolean,
        });
      } else {
        toast.error("Failed to load loan type data!");
        navigate("/masters/loan-management/loan-type-master");
      }
    } catch (error) {
      console.error("Error loading loan type data:", error);
      toast.error("Failed to load loan type data!");
      navigate("/masters/loan-management/loan-type-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "LT_Code") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else if (name == "Is_Active") {
      setFormData((prev) => ({
        ...prev,
        Is_Active: checked,
      }));
    } else if (name == "Max_Amount" || name == "Interest_Rate") {
      const numericValue = value.replace(/[^0-9.]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else if (name == "Tenure_Years") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const generateCodeSuggestions = () => {
    const name = formData.LT_Name.trim();
    if (!name) return [];

    const suggestions = [];
    const words = name.split(" ").filter((word) => word.length > 0);

    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 2) {
        suggestions.push(word.substring(0, 2).toUpperCase());
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
      if (word.length >= 4) {
        suggestions.push(word.substring(0, 4).toUpperCase());
      }
    } else if (words.length >= 2) {
      suggestions.push(
        `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase(),
      );
      if (words[0].length >= 2 && words[1].length >= 2) {
        suggestions.push(
          `${words[0].substring(0, 2)}${words[1].substring(0, 2)}`.toUpperCase(),
        );
      }
      if (words[0].length >= 3) {
        suggestions.push(words[0].substring(0, 3).toUpperCase());
      }
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.LT_Code) {
      if (!/^[A-Z0-9]+$/.test(formData.LT_Code)) {
        newErrors.LT_Code = "Only uppercase letters and numbers allowed";
      } else if (formData.LT_Code.length > 20) {
        newErrors.LT_Code = "Maximum 20 characters allowed";
      }
    }

    if (!formData.LT_Name.trim()) {
      newErrors.LT_Name = "Loan type name is required";
    } else if (formData.LT_Name.length > 50) {
      newErrors.LT_Name = "Maximum 50 characters allowed";
    }

    if (formData.Max_Amount && parseFloat(formData.Max_Amount) < 0) {
      newErrors.Max_Amount = "Maximum amount cannot be negative";
    }

    if (formData.Interest_Rate && parseFloat(formData.Interest_Rate) < 0) {
      newErrors.Interest_Rate = "Interest rate cannot be negative";
    }

    if (formData.Tenure_Years && parseInt(formData.Tenure_Years) < 0) {
      newErrors.Tenure_Years = "Tenure years cannot be negative";
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
      title: isEditMode ? "Update Loan Type?" : "Create New Loan Type?",
      text: isEditMode
        ? "Are you sure you want to update this loan type?"
        : "Are you sure you want to create this new loan type?",
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
      const submitData = {
        LT_Code: formData.LT_Code ? formData.LT_Code.toUpperCase() : null,
        LT_Name: formData.LT_Name.trim(),
        Loan_Mode: formData.Loan_Mode,
        Max_Amount: formData.Max_Amount
          ? parseFloat(formData.Max_Amount)
          : null,
        Interest_Rate: formData.Interest_Rate
          ? parseFloat(formData.Interest_Rate)
          : null,
        Tenure_Years: formData.Tenure_Years
          ? parseInt(formData.Tenure_Years)
          : null,
        Is_Active: formData.Is_Active ? 1 : 0,
      };

      let response;
      if (isEditMode) {
        response = await LoanTypeMasterApi.update(id, submitData);
        toast.success("Loan type updated successfully!");
      } else {
        response = await LoanTypeMasterApi.create(submitData);
        toast.success("Loan type created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/loan-management/loan-type-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving loan type:", error);

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
            ? "Failed to update loan type. Please try again."
            : "Failed to create loan type. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/loan-management/loan-type-master");
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const suggestions = generateCodeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading loan type data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/loan-management/loan-type-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update loan type information"
                : "Create a new loan type"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Loan Type Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center mr-3">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Loan Type Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Loan Type Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Loan Type Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.LT_Name.length > 40
                      ? formData.LT_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.LT_Name.length}/50 characters
                </span>
              </div>
              <input
                type="text"
                name="LT_Name"
                value={formData.LT_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.LT_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Home Loan, Car Loan, Education Loan"
                required
                maxLength={50}
              />
              {errors.LT_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.LT_Name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Descriptive name for the loan type (max 50 characters)
              </p>
            </div>

            {/* Loan Type Code - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Loan Type Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.LT_Code.length > 16
                        ? formData.LT_Code.length >= 20
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.LT_Code.length}/20 characters
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
                              LT_Code: suggestion,
                            }));
                            if (errors.LT_Code) {
                              setErrors((prev) => ({ ...prev, LT_Code: null }));
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
                  name="LT_Code"
                  value={formData.LT_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${
                    errors.LT_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="HOME, CAR, EDU (optional)"
                  maxLength={20}
                />
                {formData.LT_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.LT_Code)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.LT_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.LT_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Optional: Unique code in uppercase letters and numbers only
                  (max 20 characters)
                </p>
              )}
            </div>

            {/* Loan Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Mode
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="Loan_Mode"
                    value="IN"
                    checked={formData.Loan_Mode == "IN"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inward</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="Loan_Mode"
                    value="OUT"
                    checked={formData.Loan_Mode == "OUT"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Outward</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Select whether this is an inward or outward loan type
              </p>
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Max_Amount"
                  value={formData.Max_Amount}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Max_Amount ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., 5000000"
                />
              </div>
              {errors.Max_Amount ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Max_Amount}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Maximum loan amount that can be sanctioned (optional)
                </p>
              )}
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Interest_Rate"
                  value={formData.Interest_Rate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Interest_Rate ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., 7.5"
                />
              </div>
              {errors.Interest_Rate ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Interest_Rate}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Interest rate percentage per annum (optional)
                </p>
              )}
            </div>

            {/* Tenure Years */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenure (Years)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Tenure_Years"
                  value={formData.Tenure_Years}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Tenure_Years ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., 20"
                />
              </div>
              {errors.Tenure_Years ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Tenure_Years}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Maximum tenure in years for this loan type (optional)
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
                Loan Type Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this loan type
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Inactive loan types won't be available for loan applications
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
                  {isEditMode ? "Update Loan Type" : "Create Loan Type"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditLoanType;
