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
  Check,
  AlertCircle,
  Building2,
  IndianRupee,
  Home,
  Percent,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { CityHraClaApi } from "../../../services/cityhraclaapi";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const AddEditCityHra = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [cityGrades, setCityGrades] = useState([]);
  const [loadingCityGrades, setLoadingCityGrades] = useState(false);

  const [formData, setFormData] = useState({
    CGR_Id: "",
    HRA_1: "",
    CLA_1: "",
    Basic_From: "",
    Basic_To: "",
    HRA_Min: "",
    HRA_UT24: "",
    HRA_UT49: "",
    HRA_AB49: "",
    HRA_6th: "",
    HRA_7th: "",
  });

  useEffect(() => {
    loadCityGrades();
    if (id && id != "create") {
      setIsEditMode(true);
      loadCityHraData();
    }
  }, [id]);

  const loadCityGrades = async () => {
    setLoadingCityGrades(true);
    try {
      // Use the correct endpoint - city-grade/all instead of city-grade
      const response = await axios.get(`${API_BASE_URL}/city-grade/all`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      // The response structure: { success: true, message: "...", data: [...] }
      const gradesData = response.data?.data || [];

      // Sort by City_Name for better user experience
      const sortedGrades = [...gradesData].sort((a, b) =>
        (a.City_Name || "").localeCompare(b.City_Name || ""),
      );

      setCityGrades(sortedGrades);
    } catch (error) {
      console.error("Failed to load city grades:", error);
      toast.error("Failed to load city grades. Please refresh the page.");
      // Set empty array on error to prevent mapping issues
      setCityGrades([]);
    } finally {
      setLoadingCityGrades(false);
    }
  };

  const loadCityHraData = async () => {
    setLoading(true);
    try {
      const response = await CityHraClaApi.getById(id);
      const data = response.data;

      setFormData({
        CGR_Id: data.CGR_Id?.toString() || "",
        HRA_1: data.HRA_1?.toString() || "",
        CLA_1: data.CLA_1?.toString() || "",
        Basic_From: data.Basic_From?.toString() || "",
        Basic_To: data.Basic_To?.toString() || "",
        HRA_Min: data.HRA_Min?.toString() || "",
        HRA_UT24: data.HRA_UT24?.toString() || "",
        HRA_UT49: data.HRA_UT49?.toString() || "",
        HRA_AB49: data.HRA_AB49?.toString() || "",
        HRA_6th: data.HRA_6th?.toString() || "",
        HRA_7th: data.HRA_7th?.toString() || "",
      });
    } catch (error) {
      toast.error("Failed to load city HRA/CLA data!");
      navigate("/masters/administrative-masters/city-hra-cla");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // For numeric fields, allow only numbers
    if (name != "CGR_Id") {
      processedValue = value.replace(/[^0-9]/g, "");

      // Limit length to 8 digits for amount fields
      if (processedValue.length > 8) {
        processedValue = processedValue.substring(0, 8);
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

    if (!formData.CGR_Id) {
      newErrors.CGR_Id = "City Grade is required";
    }

    if (formData.Basic_From && formData.Basic_To) {
      const fromAmt = parseInt(formData.Basic_From);
      const toAmt = parseInt(formData.Basic_To);
      if (!isNaN(fromAmt) && !isNaN(toAmt) && toAmt <= fromAmt) {
        newErrors.Basic_To =
          "Basic To amount must be greater than Basic From amount";
      }
    }

    // Validate numeric fields are non-negative if provided
    const numericFields = [
      "HRA_1",
      "CLA_1",
      "Basic_From",
      "Basic_To",
      "HRA_Min",
      "HRA_UT24",
      "HRA_UT49",
      "HRA_AB49",
      "HRA_6th",
      "HRA_7th",
    ];

    numericFields.forEach((field) => {
      if (formData[field] && parseInt(formData[field]) < 0) {
        newErrors[field] = `${field.replace("_", " ")} must be at least 0`;
      }
    });

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
      title: isEditMode ? "Update Record?" : "Create New Record?",
      text: isEditMode
        ? "Are you sure you want to update this city HRA/CLA record?"
        : "Are you sure you want to create this new city HRA/CLA record?",
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
        CGR_Id: parseInt(formData.CGR_Id),
      };

      // Add optional fields only if they have values
      const optionalFields = [
        "HRA_1",
        "CLA_1",
        "Basic_From",
        "Basic_To",
        "HRA_Min",
        "HRA_UT24",
        "HRA_UT49",
        "HRA_AB49",
        "HRA_6th",
        "HRA_7th",
      ];

      optionalFields.forEach((field) => {
        if (formData[field]) {
          submitData[field] = parseInt(formData[field]);
        }
      });

      if (isEditMode) {
        await CityHraClaApi.update(id, submitData);
        toast.success("City HRA/CLA record updated successfully!");
      } else {
        await CityHraClaApi.create(submitData);
        toast.success("City HRA/CLA record created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/administrative-masters/city-hra-cla");
      }, 1500);
    } catch (error) {
      console.error("Error saving record:", error);

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
            ? "Failed to update record. Please try again."
            : "Failed to create record. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/administrative-masters/city-hra-cla");
  };

  const getCityGradeDisplay = (cg) => {
    if (!cg) return "Unknown";

    if (cg.City_Name && cg.Grade) {
      return `${cg.City_Name} - Grade ${cg.Grade}`;
    }
    if (cg.City_Name) return cg.City_Name;
    if (cg.Grade) return `Grade ${cg.Grade}`;
    return `ID: ${cg.CGR_Id || "N/A"}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading city HRA/CLA data...</p>
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
              navigate("/masters/administrative-masters/city-hra-cla")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit City HRA/CLA" : "Add New City HRA/CLA"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update city HRA/CLA master information"
                : "Create a new city HRA/CLA master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              City Grade Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* City Grade - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  City Grade <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="CGR_Id"
                  value={formData.CGR_Id}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.CGR_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white`}
                  disabled={loadingCityGrades}
                >
                  <option value="">Select City Grade</option>
                  {cityGrades.map((cg) => (
                    <option key={cg.CGR_Id} value={cg.CGR_Id}>
                      {getCityGradeDisplay(cg)}
                    </option>
                  ))}
                </select>
                {formData.CGR_Id && !errors.CGR_Id && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.CGR_Id && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.CGR_Id ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.CGR_Id}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select the city grade for this HRA/CLA configuration
                  (required)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Basic Salary Range */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <IndianRupee className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Salary Range
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic From */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Basic From (₹)
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Basic_From"
                  value={formData.Basic_From}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Basic_From ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 10000"
                />
              </div>
              {errors.Basic_From && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Basic_From}
                </p>
              )}
            </div>

            {/* Basic To */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Basic To (₹)
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Basic_To"
                  value={formData.Basic_To}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Basic_To ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 20000"
                />
              </div>
              {errors.Basic_To && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Basic_To}
                </p>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Basic salary range for this configuration (optional, Basic To must
            be greater than Basic From if both provided)
          </p>
        </div>

        {/* HRA/CLA Values */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
              <Home className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              HRA/CLA Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* HRA_1 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  HRA1 (₹)
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="HRA_1"
                  value={formData.HRA_1}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.HRA_1 ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 5000"
                />
              </div>
              {errors.HRA_1 && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HRA_1}
                </p>
              )}
            </div>

            {/* CLA_1 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  CLA 1 (₹)
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="CLA_1"
                  value={formData.CLA_1}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.CLA_1 ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 2000"
                />
              </div>
              {errors.CLA_1 && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.CLA_1}
                </p>
              )}
            </div>

            {/* HRA_Min */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  HRA Minimum (₹)
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="HRA_Min"
                  value={formData.HRA_Min}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.HRA_Min ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 3000"
                />
              </div>
              {errors.HRA_Min && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HRA_Min}
                </p>
              )}
            </div>

            {/* HRA_UT24 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  HRAUT24 (₹)
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="HRA_UT24"
                  value={formData.HRA_UT24}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.HRA_UT24 ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 4000"
                />
              </div>
              {errors.HRA_UT24 && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HRA_UT24}
                </p>
              )}
            </div>

            {/* HRA_UT49 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  HRAUT49 (₹)
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="HRA_UT49"
                  value={formData.HRA_UT49}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.HRA_UT49 ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 4500"
                />
              </div>
              {errors.HRA_UT49 && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HRA_UT49}
                </p>
              )}
            </div>

            {/* HRA_AB49 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  HRAAB49 (₹)
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="HRA_AB49"
                  value={formData.HRA_AB49}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.HRA_AB49 ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 5000"
                />
              </div>
              {errors.HRA_AB49 && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HRA_AB49}
                </p>
              )}
            </div>

            {/* HRA_6th */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  HRA6TH (₹)
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="HRA_6th"
                  value={formData.HRA_6th}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.HRA_6th ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 5500"
                />
              </div>
              {errors.HRA_6th && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HRA_6th}
                </p>
              )}
            </div>

            {/* HRA_7th */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  CLA7TH (₹)
                </label>
                <span className="text-xs text-gray-500">Optional</span>
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="HRA_7th"
                  value={formData.HRA_7th}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.HRA_7th ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 6000"
                />
              </div>
              {errors.HRA_7th && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HRA_7th}
                </p>
              )}
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            All HRA/CLA values are optional and must be non-negative integers
          </p>
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
                  {isEditMode ? "Update Record" : "Create Record"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditCityHra;
