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
  Check,
  AlertCircle,
  Calculator,
  IndianRupee,
  Calendar,
  Tag,
  Hash,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { TaxSlabApi } from "../../../services/taxslabmasterapi";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const AddEditTaxSlab = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [financialYears, setFinancialYears] = useState([]);
  const [loadingFY, setLoadingFY] = useState(false);

  // Tax name options
  const taxNameOptions = [
    { value: "Income Tax", label: "Income Tax" },
    { value: "Professional Tax", label: "Professional Tax" },
  ];

  const [formData, setFormData] = useState({
    Tax_Name: "",
    FY_ID: "",
    From_Amt: "",
    To_Amt: "",
    TaxRate: "",
    Code: "",
    Stand_Deduc: "",
    Cess: "",
    Cess_Amount: "",
  });

  useEffect(() => {
    loadFinancialYears();
    if (id && id != "create") {
      setIsEditMode(true);
      loadTaxSlabData();
    }
  }, [id]);

  const loadFinancialYears = async () => {
    setLoadingFY(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/fy-master`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );
      // Filter only active financial years
      const activeFYs = (response.data.data || []).filter(
        (fy) => fy.Status == "ACTIVE",
      );
      setFinancialYears(activeFYs);
    } catch (error) {
      console.error("Failed to load financial years:", error);
      toast.error("Failed to load financial years");
    } finally {
      setLoadingFY(false);
    }
  };

  const loadTaxSlabData = async () => {
    setLoading(true);
    try {
      const response = await TaxSlabApi.getById(id);
      const taxSlab = response.data;

      setFormData({
        Tax_Name: taxSlab.Tax_Name || "",
        FY_ID: taxSlab.FY_ID?.toString() || "",
        From_Amt: taxSlab.From_Amt?.toString() || "",
        To_Amt: taxSlab.To_Amt?.toString() || "",
        TaxRate: taxSlab.TaxRate?.toString() || "",
        Code: taxSlab.Code || "",
        Stand_Deduc: taxSlab.Stand_Deduc?.toString() || "",
        Cess: taxSlab.Cess?.toString() || "",
        Cess_Amount: taxSlab.Cess_Amount?.toString() || "",
      });
    } catch (error) {
      toast.error("Failed to load tax slab data!");
      navigate("/masters/administrative-masters/tax-slab");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name == "From_Amt" || name == "To_Amt" || name == "Stand_Deduc" || name == "Cess_Amount") {
      // Allow only numbers for amount fields
      processedValue = value.replace(/[^0-9]/g, "");

      // Amount fields max 12 digits
      if (processedValue.length > 12) {
        processedValue = processedValue.substring(0, 12);
      }
    } else if (name == "TaxRate" || name == "Cess") {
      // Allow only numbers and decimal for percentage fields
      processedValue = value.replace(/[^0-9.]/g, "");
      
      // Prevent multiple decimal points
      const decimalCount = (processedValue.match(/\./g) || []).length;
      if (decimalCount > 1) {
        processedValue = processedValue.substring(0, processedValue.lastIndexOf('.'));
      }
      
      // Limit to 2 decimal places
      if (processedValue.includes('.')) {
        const parts = processedValue.split('.');
        if (parts[1] && parts[1].length > 2) {
          processedValue = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }
      
      // Max value 100 for TaxRate and Cess
      const numValue = parseFloat(processedValue);
      if (!isNaN(numValue) && numValue > 100) {
        processedValue = "100";
      }
      
      // TaxRate max 5 digits (including decimal)
      if (name == "TaxRate" && processedValue.length > 5) {
        processedValue = processedValue.substring(0, 5);
      }
      
      // Cess max 5 digits (including decimal)
      if (name == "Cess" && processedValue.length > 5) {
        processedValue = processedValue.substring(0, 5);
      }
    } else if (name == "Code") {
      // Code field max 4 characters, uppercase alphanumeric
      processedValue = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      if (processedValue.length > 4) {
        processedValue = processedValue.substring(0, 4);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Tax Name
    if (!formData.Tax_Name) {
      newErrors.Tax_Name = "Tax Name is required";
    } else if (
      !taxNameOptions.some((option) => option.value == formData.Tax_Name)
    ) {
      newErrors.Tax_Name = "Please select a valid tax name";
    }

    // Validate Financial Year
    if (!formData.FY_ID) {
      newErrors.FY_ID = "Financial Year is required";
    }

    // Validate From Amount
    if (!formData.From_Amt) {
      newErrors.From_Amt = "From Amount is required";
    } else {
      const fromAmt = parseInt(formData.From_Amt);
      if (isNaN(fromAmt)) {
        newErrors.From_Amt = "From Amount must be a valid number";
      } else if (fromAmt < 0) {
        newErrors.From_Amt = "From Amount must be at least 0";
      }
    }

    // Validate To Amount
    if (!formData.To_Amt) {
      newErrors.To_Amt = "To Amount is required";
    } else {
      const toAmt = parseInt(formData.To_Amt);
      if (isNaN(toAmt)) {
        newErrors.To_Amt = "To Amount must be a valid number";
      } else if (toAmt < 0) {
        newErrors.To_Amt = "To Amount must be at least 0";
      } else if (
        formData.From_Amt &&
        parseInt(toAmt) <= parseInt(formData.From_Amt)
      ) {
        newErrors.To_Amt = "To Amount must be greater than From Amount";
      }
    }

    // Validate Tax Rate
    if (!formData.TaxRate) {
      newErrors.TaxRate = "Tax Rate is required";
    } else {
      const taxRate = parseFloat(formData.TaxRate);
      if (isNaN(taxRate)) {
        newErrors.TaxRate = "Tax Rate must be a valid number";
      } else if (taxRate < 0) {
        newErrors.TaxRate = "Tax Rate must be at least 0";
      } else if (taxRate > 100) {
        newErrors.TaxRate = "Tax Rate must not exceed 100";
      }
    }

    // Validate Code (optional)
    if (formData.Code && formData.Code.length > 4) {
      newErrors.Code = "Code must not exceed 4 characters";
    }

    // Validate Standard Deduction (optional)
    if (formData.Stand_Deduc) {
      const standDeduc = parseInt(formData.Stand_Deduc);
      if (isNaN(standDeduc)) {
        newErrors.Stand_Deduc = "Standard Deduction must be a valid number";
      } else if (standDeduc < 0) {
        newErrors.Stand_Deduc = "Standard Deduction must be at least 0";
      }
    }

    // Validate Cess (optional)
    if (formData.Cess) {
      const cess = parseFloat(formData.Cess);
      if (isNaN(cess)) {
        newErrors.Cess = "Cess must be a valid number";
      } else if (cess < 0) {
        newErrors.Cess = "Cess must be at least 0";
      } else if (cess > 100) {
        newErrors.Cess = "Cess must not exceed 100%";
      }
    }

    // Validate Cess Amount (optional)
    if (formData.Cess_Amount) {
      const cessAmount = parseInt(formData.Cess_Amount);
      if (isNaN(cessAmount)) {
        newErrors.Cess_Amount = "Cess Amount must be a valid number";
      } else if (cessAmount < 0) {
        newErrors.Cess_Amount = "Cess Amount must be at least 0";
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
      title: isEditMode ? "Update Tax Slab?" : "Create New Tax Slab?",
      text: isEditMode
        ? "Are you sure you want to update this tax slab information?"
        : "Are you sure you want to create this new tax slab?",
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
      const taxSlabData = {
        Tax_Name: formData.Tax_Name,
        FY_ID: parseInt(formData.FY_ID),
        From_Amt: parseInt(formData.From_Amt),
        To_Amt: parseInt(formData.To_Amt),
        TaxRate: parseFloat(formData.TaxRate),
        Code: formData.Code || null,
        Stand_Deduc: formData.Stand_Deduc ? parseInt(formData.Stand_Deduc) : null,
        Cess: formData.Cess ? parseFloat(formData.Cess) : null,
        Cess_Amount: formData.Cess_Amount ? parseInt(formData.Cess_Amount) : null,
      };

      if (isEditMode) {
        await TaxSlabApi.update(id, taxSlabData);
        toast.success("Tax slab updated successfully!");
      } else {
        await TaxSlabApi.create(taxSlabData);
        toast.success("Tax slab created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/administrative-masters/tax-slab");
      }, 1500);
    } catch (error) {
      console.error("Error saving tax slab:", error);

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
            ? "Failed to update tax slab. Please try again."
            : "Failed to create tax slab. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/administrative-masters/tax-slab");
  };

  const getFinancialYearDisplay = (fy) => {
    if (fy.FY_Name) return fy.FY_Name;
    if (fy.FY_Code) return fy.FY_Code;
    return `FY ${fy.FY_Id}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tax slab data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/administrative-masters/tax-slab")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Tax Slab" : "Add New Tax Slab"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update tax slab master information"
                : "Create a new tax slab master record"}
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
              Tax Slab Information
            </h2>
          </div>

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Year */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Financial Year <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="FY_ID"
                  value={formData.FY_ID}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.FY_ID ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white`}
                  disabled={loadingFY}
                >
                  <option value="">Select Financial Year</option>
                  {financialYears.map((fy) => (
                    <option key={fy.FY_Id} value={fy.FY_Id}>
                      {getFinancialYearDisplay(fy)}
                    </option>
                  ))}
                </select>
                {formData.FY_ID && !errors.FY_ID && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.FY_ID && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.FY_ID ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.FY_ID}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select the financial year for this tax slab
                </p>
              )}
            </div>

            {/* Tax Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Tax Name <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="Tax_Name"
                  value={formData.Tax_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Tax_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">Select Tax Name</option>
                  {taxNameOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.Tax_Name && !errors.Tax_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Tax_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Tax_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Tax_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select the type of tax (Income Tax or Professional Tax)
                </p>
              )}
            </div>

            {/* Tax Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Tax Code <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.Code.length}/4 characters
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Code"
                  value={formData.Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., IT01, PT01"
                  maxLength={4}
                />
                {formData.Code && !errors.Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for this tax slab (max 4 characters, alphanumeric)
                </p>
              )}
            </div>

            {/* From Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  From Amount (₹) <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.From_Amt.length > 10
                      ? "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.From_Amt.length}/12 digits
                </span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="From_Amt"
                  value={formData.From_Amt}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.From_Amt ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 0, 250000, 500000"
                />
                {formData.From_Amt && !errors.From_Amt && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.From_Amt && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.From_Amt ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.From_Amt}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Starting income amount for this tax slab
                </p>
              )}
            </div>

            {/* To Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  To Amount (₹) <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.To_Amt.length > 10
                      ? "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.To_Amt.length}/12 digits
                </span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="To_Amt"
                  value={formData.To_Amt}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.To_Amt ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 250000, 500000, 1000000"
                />
                {formData.To_Amt && !errors.To_Amt && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.To_Amt && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.To_Amt ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.To_Amt}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Ending income amount for this tax slab
                </p>
              )}
            </div>

            {/* Tax Rate */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Tax Rate (%) <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.TaxRate.length > 2
                      ? formData.TaxRate.length >= 3
                        ? "text-amber-600"
                        : "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  {formData.TaxRate.length}/5 digits
                </span>
              </div>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="TaxRate"
                  value={formData.TaxRate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.TaxRate ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 0, 5, 10, 20.5, 30"
                />
                {formData.TaxRate && !errors.TaxRate && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.TaxRate && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.TaxRate ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TaxRate}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Tax rate percentage for this slab (0-100, supports up to 2 decimal places)
                </p>
              )}
            </div>

            {/* Standard Deduction */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Standard Deduction (₹) <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Stand_Deduc.length > 10
                      ? "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Stand_Deduc.length}/12 digits
                </span>
              </div>
              <div className="relative">
                <TrendingDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Stand_Deduc"
                  value={formData.Stand_Deduc}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Stand_Deduc ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 50000"
                />
                {formData.Stand_Deduc && !errors.Stand_Deduc && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Stand_Deduc && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Stand_Deduc ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Stand_Deduc}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Standard deduction amount applicable for this tax slab
                </p>
              )}
            </div>

            {/* Cess Percentage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Cess (%) <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Cess.length > 2
                      ? formData.Cess.length >= 3
                        ? "text-amber-600"
                        : "text-gray-500"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Cess.length}/5 digits
                </span>
              </div>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Cess"
                  value={formData.Cess}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Cess ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 4.00"
                />
                {formData.Cess && !errors.Cess && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Cess && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Cess ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Cess}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Cess percentage applicable (0-100, supports up to 2 decimal places)
                </p>
              )}
            </div>

            {/* Cess Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Cess Amount (₹) <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Cess_Amount.length > 10
                      ? "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Cess_Amount.length}/12 digits
                </span>
              </div>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Cess_Amount"
                  value={formData.Cess_Amount}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Cess_Amount ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 5000"
                />
                {formData.Cess_Amount && !errors.Cess_Amount && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Cess_Amount && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Cess_Amount ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Cess_Amount}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Fixed cess amount applicable for this tax slab
                </p>
              )}
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
                  {isEditMode ? "Update Tax Slab" : "Create Tax Slab"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditTaxSlab;