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
  Calendar,
  Hash,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  Clock,
  Lock,
  Unlock,
  DollarSign,
  Building,
  Info,
  ChevronRight,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { FinancialYearApi } from "../../../services/financialyearapi";

const AddEditFinancialYear = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [financialYears, setFinancialYears] = useState([]);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Financial Year Management");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/settings/profile-management/financial-year-master";

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

  const [formData, setFormData] = useState({
    FY_Code: "",
    FY_Name: "",
    St_Date: "",
    Ed_Date: "",
    is_current_year: false,
    is_budget_open: false,
    is_transaction_open: false,
    PY_Id: "",
    NY_Id: "",
    Remarks: "",
    Status: "ACTIVE",
  });

  useEffect(() => {
    loadFinancialYears();

    if (id && id != "create") {
      setIsEditMode(true);
      loadFinancialYearData();
    }
  }, [id]);

  const loadFinancialYears = async () => {
    setLoadingYears(true);
    try {
      const response = await FinancialYearApi.getAll();
      const years = response || [];
      setFinancialYears(years);
    } catch (error) {
      console.error("Error loading financial years:", error);
      toast.error("Failed to load financial years");
    } finally {
      setLoadingYears(false);
    }
  };

  const loadFinancialYearData = async () => {
    setLoading(true);
    try {
      const financialYear = await FinancialYearApi.getById(id);

      setFormData({
        FY_Code: financialYear.FY_Code || "",
        FY_Name: financialYear.FY_Name || "",
        St_Date: financialYear.St_Date
          ? financialYear.St_Date.split("T")[0]
          : "",
        Ed_Date: financialYear.Ed_Date
          ? financialYear.Ed_Date.split("T")[0]
          : "",
        is_current_year:
          financialYear.is_current_year != undefined
            ? financialYear.is_current_year == true
            : false,
        is_budget_open:
          financialYear.is_budget_open != undefined
            ? financialYear.is_budget_open == true
            : false,
        is_transaction_open:
          financialYear.is_transaction_open != undefined
            ? financialYear.is_transaction_open == true
            : false,
        PY_Id: financialYear.PY_Id ? financialYear.PY_Id.toString() : "",
        NY_Id: financialYear.NY_Id ? financialYear.NY_Id.toString() : "",
        Remarks: financialYear.Remarks || "",
        Status: financialYear.Status || "ACTIVE",
      });
    } catch (error) {
      toast.error("Failed to load financial year data!");
      navigate("/settings/profile-management/financial-year-master");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const calculateDatesFromCode = (code) => {
    if (!code.match(/^\d{4}-\d{2}$/)) {
      return { St_Date: "", Ed_Date: "" };
    }

    try {
      const parts = code.split("-");
      const startYear = parseInt(parts[0]);
      const endYearShort = parseInt(parts[1]);

      const endYear = parseInt(parts[0].substring(0, 2) + parts[1]);

      const startDate = new Date(startYear, 3, 1);

      const endDate = new Date(endYear, 2, 31);
      return {
        St_Date: formatDate(startDate),
        Ed_Date: formatDate(endDate),
      };
    } catch (error) {
      console.error("Error calculating dates from code:", error);
      return { St_Date: "", Ed_Date: "" };
    }
  };

  const validateAndCalculateDates = (code) => {
    if (!code.match(/^\d{4}-\d{2}$/)) {
      return { isValid: false, St_Date: "", Ed_Date: "" };
    }

    const parts = code.split("-");
    const startYear = parseInt(parts[0]);
    const endYearShort = parseInt(parts[1]);
    const startYearShort = startYear % 100;
    const expectedEndYearShort = (startYearShort + 1) % 100;

    if (endYearShort != expectedEndYearShort) {
      return {
        isValid: false,
        St_Date: "",
        Ed_Date: "",
        error: `Financial year code should represent sequential years (e.g., ${startYear}-${String(expectedEndYearShort).padStart(2, "0")})`,
      };
    }

    const dates = calculateDatesFromCode(code);
    return { isValid: true, ...dates };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newFormData = {
      ...formData,
      [name]: type == "checkbox" ? checked : value,
    };

    if (name == "FY_Code") {
      const code = value.trim();
      newFormData.FY_Code = code;

      if (code && !formData.FY_Name && code.match(/^\d{4}-\d{2}$/)) {
        newFormData.FY_Name = `FY ${code}`;
      }

      if (code.match(/^\d{4}-\d{2}$/)) {
        const result = validateAndCalculateDates(code);

        if (result.isValid) {
          newFormData.St_Date = result.St_Date;
          newFormData.Ed_Date = result.Ed_Date;

          if (errors.St_Date || errors.Ed_Date) {
            setErrors((prev) => ({
              ...prev,
              St_Date: "",
              Ed_Date: "",
            }));
          }

          if (errors.FY_Code && errors.FY_Code.includes("sequential years")) {
            setErrors((prev) => ({
              ...prev,
              FY_Code: "",
            }));
          }
        } else {
          newFormData.St_Date = "";
          newFormData.Ed_Date = "";

          if (result.error) {
            setErrors((prev) => ({
              ...prev,
              FY_Code: result.error,
            }));
          }
        }
      } else {
        newFormData.St_Date = "";
        newFormData.Ed_Date = "";
      }
    }

    setFormData(newFormData);

    if (errors[name] && name != "FY_Code") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateYearCode = async () => {
    if (!formData.FY_Code.match(/^\d{4}-\d{2}$/)) {
      return false;
    }

    const parts = formData.FY_Code.split("-");
    const startYear = parseInt(parts[0]);
    const endYearShort = parseInt(parts[1]);

    const startYearShort = startYear % 100;
    const expectedEndYearShort = (startYearShort + 1) % 100;

    if (endYearShort != expectedEndYearShort) {
      setErrors((prev) => ({
        ...prev,
        FY_Code: `Financial year code should represent sequential years (e.g., ${startYear}-${String(expectedEndYearShort).padStart(2, "0")})`,
      }));
      return false;
    }
    return true;
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.FY_Code?.trim()) {
      newErrors.FY_Code = "Financial year code is required";
    } else if (formData.FY_Code.length > 9) {
      newErrors.FY_Code = `Maximum 9 characters allowed (${formData.FY_Code.length}/9)`;
    } else if (!formData.FY_Code.match(/^\d{4}-\d{2}$/)) {
      newErrors.FY_Code = "Format must be YYYY-YY (e.g., 2024-25)";
    }

    if (formData.FY_Name && formData.FY_Name.length > 20) {
      newErrors.FY_Name = `Maximum 20 characters allowed (${formData.FY_Name.length}/20)`;
    }

    if (!formData.St_Date) {
      newErrors.St_Date = "Start date is required";
    } else {
      const startDate = new Date(formData.St_Date);
      if (isNaN(startDate.getTime())) {
        newErrors.St_Date = "Invalid start date";
      }
    }

    if (!formData.Ed_Date) {
      newErrors.Ed_Date = "End date is required";
    } else {
      const endDate = new Date(formData.Ed_Date);
      if (isNaN(endDate.getTime())) {
        newErrors.Ed_Date = "Invalid end date";
      } else if (formData.St_Date) {
        const startDate = new Date(formData.St_Date);
        if (!isNaN(startDate.getTime()) && endDate <= startDate) {
          newErrors.Ed_Date = "End date must be after start date";
        }
      }
    }

    if (formData.St_Date && !newErrors.St_Date) {
      const startDate = new Date(formData.St_Date);
      if (startDate.getMonth() != 3 || startDate.getDate() != 1) {
        newErrors.St_Date =
          "Start date must be April 1 (based on financial year code)";
      }
    }

    if (formData.Ed_Date && !newErrors.Ed_Date) {
      const endDate = new Date(formData.Ed_Date);
      if (endDate.getMonth() != 2 || endDate.getDate() != 31) {
        newErrors.Ed_Date =
          "End date must be March 31 (based on financial year code)";
      }
    }

    if (formData.PY_Id && formData.PY_Id == formData.NY_Id) {
      newErrors.PY_Id = "Previous year and next year cannot be the same";
      newErrors.NY_Id = "Next year and previous year cannot be the same";
    }

    if (formData.PY_Id && formData.PY_Id == id) {
      newErrors.PY_Id = "Cannot set current year as previous year";
    }

    if (formData.NY_Id && formData.NY_Id == id) {
      newErrors.NY_Id = "Cannot set current year as next year";
    }

    if (formData.Remarks && formData.Remarks.length > 255) {
      newErrors.Remarks = `Remarks must not exceed 255 characters (${formData.Remarks.length}/255)`;
    }

    if (!["ACTIVE", "CLOSED", "LOCKED"].includes(formData.Status)) {
      newErrors.Status = "Status must be ACTIVE, CLOSED, or LOCKED";
    }

    setErrors(newErrors);

    const isCodeValid = await validateYearCode();

    return Object.keys(newErrors).length == 0 && isCodeValid;
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
      title: isEditMode
        ? "Update Financial Year?"
        : "Create New Financial Year?",
      text: isEditMode
        ? "Are you sure you want to update this financial year information?"
        : "Are you sure you want to create this new financial year?",
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
      const financialYearData = {
        FY_Code: formData.FY_Code.trim(),
        FY_Name: formData.FY_Name?.trim() || null,
        St_Date: formData.St_Date,
        Ed_Date: formData.Ed_Date,
        is_current_year: formData.is_current_year,
        is_budget_open: formData.is_budget_open,
        is_transaction_open: formData.is_transaction_open,
        PY_Id: formData.PY_Id ? parseInt(formData.PY_Id) : null,
        NY_Id: formData.NY_Id ? parseInt(formData.NY_Id) : null,
        Remarks: formData.Remarks?.trim() || null,
        Status: formData.Status,
      };

      let response;
      if (isEditMode) {
        response = await FinancialYearApi.update(id, financialYearData);
        toast.success("Financial year updated successfully!");
      } else {
        response = await FinancialYearApi.create(financialYearData);
        toast.success("Financial year created successfully!");
      }

      setTimeout(() => {
        navigate("/settings/profile-management/financial-year-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving financial year:", error);

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
              ? "Failed to update financial year. Please try again."
              : "Failed to create financial year. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/settings/profile-management/financial-year-master");
  };

  const calculateDuration = () => {
    if (formData.St_Date && formData.Ed_Date) {
      const startDate = new Date(formData.St_Date);
      const endDate = new Date(formData.Ed_Date);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const months =
          (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth());
        return months;
      }
    }
    return 0;
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getAvailableYears = (excludeId = null) => {
    return financialYears.filter(
      (year) => !excludeId || year.FY_Id != excludeId,
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading financial year data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/settings/profile-management/financial-year-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Financial Year" : "Add New Financial Year"}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Financial Year Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Year Code - FY_Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Financial Year Code <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.FY_Code.length > 7
                      ? formData.FY_Code.length >= 9
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.FY_Code.length}/9
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="FY_Code"
                  value={formData.FY_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.FY_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., 2024-25, 2025-26"
                  maxLength={9}
                />
                {formData.FY_Code && !errors.FY_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.FY_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.FY_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.FY_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the financial year (required, max 9
                  characters, format: YYYY-YY)
                </p>
              )}
            </div>

            {/* Financial Year Name - FY_Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Financial Year Name (Optional)
                </label>
                <span
                  className={`text-xs ${
                    formData.FY_Name.length > 16
                      ? formData.FY_Name.length >= 20
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.FY_Name.length}/20
                </span>
              </div>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="FY_Name"
                  value={formData.FY_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.FY_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., FY 2024-25"
                  maxLength={20}
                />
                {errors.FY_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.FY_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.FY_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Descriptive name for the financial year (optional, max 20
                  characters)
                </p>
              )}
            </div>

            {/* Start Date - St_Date - Auto-filled and Disabled */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  type="date"
                  name="St_Date"
                  value={formData.St_Date}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.St_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50`}
                  required
                  disabled
                  readOnly
                />
                {formData.St_Date && !errors.St_Date && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 z-20" />
                )}
                {errors.St_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500 z-20" />
                )}
              </div>
              {errors.St_Date ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.St_Date}
                </p>
              ) : formData.St_Date ? (
                <p className="mt-1 text-xs text-gray-500">
                  Financial year start date (auto-calculated as April 1,{" "}
                  {formatDateForDisplay(formData.St_Date)})
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Financial year start date (will be auto-calculated as April 1
                  based on financial year code)
                </p>
              )}
            </div>

            {/* End Date - Ed_Date - Auto-filled and Disabled */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  type="date"
                  name="Ed_Date"
                  value={formData.Ed_Date}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Ed_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50`}
                  required
                  disabled
                  readOnly
                />
                {formData.Ed_Date && !errors.Ed_Date && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 z-20" />
                )}
                {errors.Ed_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500 z-20" />
                )}
              </div>
              {errors.Ed_Date ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Ed_Date}
                </p>
              ) : formData.Ed_Date ? (
                <p className="mt-1 text-xs text-gray-500">
                  Financial year end date (auto-calculated as March 31,{" "}
                  {formatDateForDisplay(formData.Ed_Date)})
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Financial year end date (will be auto-calculated as March 31
                  of next year based on financial year code)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Year Relationships Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-3">
              <ChevronRight className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Year Relationships
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Previous Year - PY_Id */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Financial Year (Optional)
              </label>
              <div className="relative">
                <ArrowLeft className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingYears ? (
                  <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">
                      Loading financial years...
                    </span>
                  </div>
                ) : (
                  <select
                    name="PY_Id"
                    value={formData.PY_Id}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.PY_Id ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                  >
                    <option value="">
                      Select previous financial year (Optional)
                    </option>
                    {getAvailableYears(isEditMode ? id : null).map((year) => (
                      <option key={year.FY_Id} value={year.FY_Id}>
                        {year.FY_Code} - {year.FY_Name || "N/A"}
                      </option>
                    ))}
                  </select>
                )}
                {errors.PY_Id && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500 z-20" />
                )}
              </div>
              {errors.PY_Id ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PY_Id}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select the financial year that precedes this one (optional)
                </p>
              )}
            </div>

            {/* Next Year - NY_Id */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Financial Year (Optional)
              </label>
              <div className="relative">
                <ChevronRight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingYears ? (
                  <div className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">
                      Loading financial years...
                    </span>
                  </div>
                ) : (
                  <select
                    name="NY_Id"
                    value={formData.NY_Id}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.NY_Id ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                  >
                    <option value="">
                      Select next financial year (Optional)
                    </option>
                    {getAvailableYears(isEditMode ? id : null).map((year) => (
                      <option key={year.FY_Id} value={year.FY_Id}>
                        {year.FY_Code} - {year.FY_Name || "N/A"}
                      </option>
                    ))}
                  </select>
                )}
                {errors.NY_Id && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500 z-20" />
                )}
              </div>
              {errors.NY_Id ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.NY_Id}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select the financial year that follows this one (optional)
                </p>
              )}
            </div>
          </div>

          {/* Show selected relationships */}
          {(formData.PY_Id || formData.NY_Id) && !loadingYears && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div className="text-xs text-gray-700 space-y-1">
                {formData.PY_Id && (
                  <div className="flex items-center">
                    <ArrowLeft className="h-3 w-3 text-gray-500 mr-2" />
                    <span>
                      <strong>Previous:</strong>{" "}
                      {
                        financialYears.find(
                          (year) => year.FY_Id.toString() == formData.PY_Id,
                        )?.FY_Code
                      }
                    </span>
                  </div>
                )}
                {formData.NY_Id && (
                  <div className="flex items-center">
                    <ChevronRight className="h-3 w-3 text-gray-500 mr-2" />
                    <span>
                      <strong>Next:</strong>{" "}
                      {
                        financialYears.find(
                          (year) => year.FY_Id.toString() == formData.NY_Id,
                        )?.FY_Code
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status & Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <Building className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Status & Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Info className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  name="Status"
                  value={formData.Status}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="LOCKED">LOCKED</option>
                </select>
              </div>
              {errors.Status && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Status}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                ACTIVE: Year is currently in use | CLOSED: Year is completed |
                LOCKED: Year is locked for changes
              </p>
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Remarks (Optional)
                </label>
                <span
                  className={`text-xs ${
                    formData.Remarks.length > 200
                      ? formData.Remarks.length >= 255
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Remarks.length}/255
                </span>
              </div>
              <textarea
                name="Remarks"
                value={formData.Remarks}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.Remarks ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Additional notes about this financial year..."
                rows="3"
                maxLength={255}
              />
              {errors.Remarks ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Remarks}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Additional information or notes (optional, max 255 characters)
                </p>
              )}
            </div>

            {/* Toggle Settings */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Year */}
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_current_year"
                        checked={formData.is_current_year}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`block w-14 h-8 rounded-full ${
                          formData.is_current_year
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          formData.is_current_year
                            ? "transform translate-x-6"
                            : ""
                        }`}
                      ></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                      {formData.is_current_year ? (
                        <span className="flex items-center text-yellow-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Current Year
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          Not Current
                        </span>
                      )}
                    </div>
                  </label>
                </div>

                {/* Budget Open */}
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_budget_open"
                        checked={formData.is_budget_open}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`block w-14 h-8 rounded-full ${
                          formData.is_budget_open
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          formData.is_budget_open
                            ? "transform translate-x-6"
                            : ""
                        }`}
                      ></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                      {formData.is_budget_open ? (
                        <span className="flex items-center text-green-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Budget Open
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Budget Closed
                        </span>
                      )}
                    </div>
                  </label>
                </div>

                {/* Transaction Open */}
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_transaction_open"
                        checked={formData.is_transaction_open}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`block w-14 h-8 rounded-full ${
                          formData.is_transaction_open
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          formData.is_transaction_open
                            ? "transform translate-x-6"
                            : ""
                        }`}
                      ></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                      {formData.is_transaction_open ? (
                        <span className="flex items-center text-blue-600">
                          <Unlock className="h-4 w-4 mr-2" />
                          Transactions Open
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <Lock className="h-4 w-4 mr-2" />
                          Transactions Closed
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                • <strong>Current Year:</strong> Only one financial year should
                be marked as current at any time
                <br />• <strong>Budget Open:</strong> Allows budget entries and
                modifications
                <br />• <strong>Transactions Open:</strong> Allows financial
                transactions to be recorded
              </p>
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    ? "Update Financial Year"
                    : "Create Financial Year"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditFinancialYear;
