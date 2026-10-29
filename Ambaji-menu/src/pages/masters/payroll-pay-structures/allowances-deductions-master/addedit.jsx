/**
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Briefcase,
  AlertCircle,
  DollarSign,
  Hash,
  Percent,
  Type,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PayAlwdedApi from "../../../services/payalwdedapi";

const AddEditPayAlwded = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    PAD_Code: "",
    PAD_ShortName: "",
    PAD_Name: "",
    Percentage: "",
    Alw_Ded: "A", // Default to Allowance
    Lg_Id: user?.Lg_Id || "1",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await PayAlwdedApi.getById(id);
      if (response.status) {
        const data = response.data;
        setFormData({
          PAD_Code: data.PAD_Code || "",
          PAD_ShortName: data.PAD_ShortName || "",
          PAD_Name: data.PAD_Name || "",
          Percentage: data.Percentage || "",
          Alw_Ded: data.Alw_Ded || "A",
          Lg_Id: data.Lg_Id || "1",
        });
      } else {
        toast.error("Failed to load allowance/deduction data!");
        navigate(
          "/masters/payroll-pay-structures/allowances-deductions-master",
        );
      }
    } catch (error) {
      toast.error("Failed to load allowance/deduction data!");
      navigate("/masters/payroll-pay-structures/allowances-deductions-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.PAD_Code.trim()) {
      newErrors.PAD_Code = "Code is required";
    } else if (formData.PAD_Code.length > 20) {
      newErrors.PAD_Code = `Maximum 20 characters allowed (${formData.PAD_Code.length}/20)`;
    }

    if (!formData.PAD_ShortName.trim()) {
      newErrors.PAD_ShortName = "Short name is required";
    } else if (formData.PAD_ShortName.length > 10) {
      newErrors.PAD_ShortName = `Maximum 10 characters allowed (${formData.PAD_ShortName.length}/10)`;
    }

    if (!formData.PAD_Name.trim()) {
      newErrors.PAD_Name = "Name is required";
    } else if (formData.PAD_Name.length > 100) {
      newErrors.PAD_Name = `Maximum 100 characters allowed (${formData.PAD_Name.length}/100)`;
    }

    if (!formData.Percentage) {
      newErrors.Percentage = "Percentage is required";
    } else if (isNaN(parseFloat(formData.Percentage))) {
      newErrors.Percentage = "Percentage must be a valid number";
    } else if (parseFloat(formData.Percentage) < 0) {
      newErrors.Percentage = "Percentage cannot be negative";
    } else if (parseFloat(formData.Percentage) > 100) {
      newErrors.Percentage = "Percentage cannot exceed 100";
    }

    if (!formData.Alw_Ded) {
      newErrors.Alw_Ded = "Type is required";
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
      title: isEditMode
        ? "Update Allowance/Deduction?"
        : "Create New Allowance/Deduction?",
      text: isEditMode
        ? "Are you sure you want to update this record?"
        : "Are you sure you want to create this new record?",
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
        PAD_Code: formData.PAD_Code,
        PAD_ShortName: formData.PAD_ShortName,
        PAD_Name: formData.PAD_Name,
        Percentage: parseFloat(formData.Percentage),
        Alw_Ded: formData.Alw_Ded,
        Lg_Id: parseInt(formData.Lg_Id),
      };

      if (isEditMode) {
        await PayAlwdedApi.update(id, submitData);
        toast.success("Allowance/Deduction updated successfully!");
      } else {
        await PayAlwdedApi.create(submitData);
        toast.success("Allowance/Deduction created successfully!");
      }

      setTimeout(() => {
        navigate(
          "/masters/payroll-pay-structures/allowances-deductions-master",
        );
      }, 1500);
    } catch (error) {
      console.error("Error saving:", error);

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
            ? "Failed to update. Please try again."
            : "Failed to create. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/payroll-pay-structures/allowances-deductions-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/masters/payroll-pay-structures/allowances-deductions-master",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Allowance/Deduction"
                : "Add New Allowance/Deduction"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update allowance/deduction information"
                : "Create a new allowance or deduction for the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Allowance/Deduction Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Code <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.PAD_Code.length > 15
                      ? formData.PAD_Code.length >= 20
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.PAD_Code.length}/20 characters
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="PAD_Code"
                  value={formData.PAD_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.PAD_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., HRA, DA, PF"
                  maxLength={20}
                />
              </div>
              {errors.PAD_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PAD_Code}
                </p>
              )}
            </div>

            {/* Short Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Short Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.PAD_ShortName.length > 8
                      ? formData.PAD_ShortName.length >= 10
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.PAD_ShortName.length}/10 characters
                </span>
              </div>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="PAD_ShortName"
                  value={formData.PAD_ShortName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.PAD_ShortName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., HRA"
                  maxLength={10}
                />
              </div>
              {errors.PAD_ShortName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PAD_ShortName}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.PAD_Name.length > 80
                      ? formData.PAD_Name.length >= 100
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.PAD_Name.length}/100 characters
                </span>
              </div>
              <input
                type="text"
                name="PAD_Name"
                value={formData.PAD_Name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.PAD_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., House Rent Allowance"
                maxLength={100}
              />
              {errors.PAD_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PAD_Name}
                </p>
              )}
            </div>

            {/* Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Percentage (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="Percentage"
                  value={formData.Percentage}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Percentage ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., 10.50"
                />
              </div>
              {errors.Percentage && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Percentage}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="Alw_Ded"
                value={formData.Alw_Ded}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Alw_Ded ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="A">Allowance</option>
                <option value="D">Deduction</option>
              </select>
              {errors.Alw_Ded && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Alw_Ded}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
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
                  {isEditMode ? "Update Allowancw/Deduction" : "Create Allowancw/Deduction"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditPayAlwded;
