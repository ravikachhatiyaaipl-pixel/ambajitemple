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
  Calendar,
  FileText,
  ToggleLeft,
  ToggleRight,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import RelationshipApi from "../../../services/relationshipapi";

const AddEditRelationship = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    Rela_Code: "",
    Rela_Name: "",
    Is_Active: 1,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadRelationshipData();
    }
  }, [id]);

  const loadRelationshipData = async () => {
    setLoading(true);
    try {
      const response = await RelationshipApi.getById(id);
      if (response.status == "success") {
        const relationship = response.data;
        setFormData({
          Rela_Code: relationship.Rela_Code || "",
          Rela_Name: relationship.Rela_Name || "",
          Is_Active: relationship.deleted_at ? 0 : 1,
        });
      } else {
        toast.error("Failed to load relationship data!");
        navigate("/masters/employee-personal-masters/relationship-master");
      }
    } catch (error) {
      toast.error("Failed to load relationship data!");
      navigate("/masters/employee-personal-masters/relationship-master");
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

    if (!formData.Rela_Code.trim()) {
      newErrors.Rela_Code = "Relationship code is required";
    } else if (formData.Rela_Code.length > 20) {
      newErrors.Rela_Code = `Maximum 20 characters allowed (${formData.Rela_Code.length}/20)`;
    }

    if (!formData.Rela_Name.trim()) {
      newErrors.Rela_Name = "Relationship name is required";
    } else if (formData.Rela_Name.length > 50) {
      newErrors.Rela_Name = `Maximum 50 characters allowed (${formData.Rela_Name.length}/50)`;
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
      title: isEditMode ? "Update Relationship?" : "Create New Relationship?",
      text: isEditMode
        ? "Are you sure you want to update this relationship?"
        : "Are you sure you want to create this new relationship?",
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
        Rela_Code: formData.Rela_Code,
        Rela_Name: formData.Rela_Name,
      };

      if (isEditMode) {
        await RelationshipApi.update(id, submitData);
        toast.success("Relationship updated successfully!");
      } else {
        await RelationshipApi.create(submitData);
        toast.success("Relationship created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/employee-personal-masters/relationship-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving relationship:", error);

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
    navigate("/masters/employee-personal-masters/relationship-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading relationship data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/employee-personal-masters/relationship-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Relationship" : "Add New Relationship"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update relationship information"
                : "Create a new relationship for the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Relationship Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Relationship Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Relationship Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Rela_Name.length > 40
                      ? formData.Rela_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Rela_Name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Rela_Name"
                  value={formData.Rela_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Rela_Name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., Father, Mother, Brother"
                  maxLength={50}
                />
              </div>
              {errors.Rela_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Rela_Name}
                </p>
              )}
            </div>

            {/* Relationship Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Relationship Code <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Rela_Code.length > 15
                      ? formData.Rela_Code.length >= 20
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Rela_Code.length}/20 characters
                </span>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Rela_Code"
                  value={formData.Rela_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Rela_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., FTH, MTH, BRO"
                  maxLength={20}
                />
              </div>
              {errors.Rela_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Rela_Code}
                </p>
              )}
            </div>

            {/* Active Status */}
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
                    className={`block w-14 h-8 rounded-full transition-colors duration-200 ${
                      formData.Is_Active == 1 ? "bg-green-400" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${
                        formData.Is_Active == 1 ? "transform translate-x-6" : ""
                      }`}
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
                Set as active to make this relationship available for selection
              </p>
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
                  {isEditMode ? "Update Relationship" : "Create Relationship"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditRelationship;
