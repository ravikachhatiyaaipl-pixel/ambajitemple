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
  Briefcase,
  AlertCircle,
  Code,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmpTypeApi from "../../../services/emptypeapi";

const AddEditEmpType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    ETy_Code: "",
    ETy_Name: "",
    Is_Active: 1,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadTypeData();
    }
  }, [id]);

  const loadTypeData = async () => {
    setLoading(true);
    try {
      const response = await EmpTypeApi.getById(id);
      if (response.success) {
        const type = response.data;
        setFormData({
          ETy_Code: type.ETy_Code || "",
          ETy_Name: type.ETy_Name || "",
          Is_Active: type.Is_Active == 1 ? 1 : 0,
        });
      } else {
        toast.error("Failed to load employee type data!");
        navigate("/masters/administrative-masters/employee-type-master");
      }
    } catch (error) {
      toast.error("Failed to load employee type data!");
      navigate("/masters/administrative-masters/employee-type-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? (e.target.checked ? 1 : 0) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ETy_Name.trim()) {
      newErrors.ETy_Name = "Employee type name is required";
    } else if (formData.ETy_Name.length > 50) {
      newErrors.ETy_Name = `Maximum 50 characters allowed (${formData.ETy_Name.length}/50)`;
    }

    if (formData.ETy_Code && formData.ETy_Code.length > 20) {
      newErrors.ETy_Code = `Maximum 20 characters allowed (${formData.ETy_Code.length}/20)`;
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
      title: isEditMode ? "Update Employee Type?" : "Create New Employee Type?",
      text: isEditMode
        ? "Are you sure you want to update this employee type?"
        : "Are you sure you want to create this new employee type?",
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
        ...formData,
        ETy_Code: formData.ETy_Code || null,
        Is_Active: formData.Is_Active ? 1 : 0,
      };

      if (isEditMode) {
        await EmpTypeApi.update(id, submitData);
        toast.success("Employee type updated successfully!");
      } else {
        await EmpTypeApi.create(submitData);
        toast.success("Employee type created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/administrative-masters/employee-type-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving employee type:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const firstError = Object.values(apiErrors).flat()[0];
        toast.error(firstError || "Validation failed");

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
    navigate("/masters/administrative-masters/employee-type-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading employee type data...</p>
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
              navigate("/masters/administrative-masters/employee-type-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Employee Type" : "Add New Employee Type"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update employee type information"
                : "Create a new employee type"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Employee Type Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ETy_Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type Code
              </label>
              <div className="relative">
                <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="ETy_Code"
                  value={formData.ETy_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ETy_Code ? "border-red-300" : "border-gray-300"}`}
                  placeholder="e.g., FULLTIME, CONTRACT"
                  maxLength={20}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.ETy_Code ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.ETy_Code}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Optional. Max 20 characters.
                  </p>
                )}
                <span
                  className={`text-xs ${formData.ETy_Code?.length > 15 ? (formData.ETy_Code?.length >= 20 ? "text-red-600 font-bold" : "text-amber-600") : "text-gray-500"}`}
                >
                  {formData.ETy_Code?.length || 0}/20
                </span>
              </div>
            </div>

            {/* ETy_Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="ETy_Name"
                  value={formData.ETy_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ETy_Name ? "border-red-300" : "border-gray-300"}`}
                  placeholder="e.g., Full Time Employee"
                  maxLength={50}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.ETy_Name ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.ETy_Name}
                  </p>
                ) : null}
                <span
                  className={`text-xs ml-auto ${formData.ETy_Name.length > 40 ? (formData.ETy_Name.length >= 50 ? "text-red-600 font-bold" : "text-amber-600") : "text-gray-500"}`}
                >
                  {formData.ETy_Name.length}/50
                </span>
              </div>
            </div>

            {/* Active Status - Full width */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="Is_Active"
                    checked={formData.Is_Active == 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Is_Active: e.target.checked ? 1 : 0,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full transition-colors duration-200 ${formData.Is_Active == 1 ? "bg-green-400" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${formData.Is_Active == 1 ? "transform translate-x-6" : ""}`}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center">
                  {formData.Is_Active == 1 ? (
                    <ToggleRight className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {formData.Is_Active == 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-14">
                Set as active to make this type available for selection
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
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
              <X className="h-4 w-4 mr-2" /> Cancel
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
                  {isEditMode ? "Update Type" : "Create Type"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditEmpType;
