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
import { Save, X, ArrowLeft, AlertCircle, Tag, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import CasteMasterApi from "../../../services/castemasterapi";

const AddEditCaste = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    caste_name: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id != "create" && id != "add") {
      setIsEditMode(true);
      loadCasteData();
    } else {
      setIsEditMode(false);
      setFormData({
        caste_name: "",
      });
    }
  }, [id]);

  const loadCasteData = async () => {
    setLoading(true);
    try {
      const response = await CasteMasterApi.getById(id);

      if (response.status && response.data) {
        const caste = response.data;
        setFormData({
          caste_name: caste.caste_name || "",
        });
      } else {
        toast.error(response.message || "Failed to load caste data!");
        navigate("/masters/administrative-masters/caste-master");
      }
    } catch (error) {
      console.error("Error loading caste:", error);
      toast.error(
        error.response?.data?.message || "Failed to load caste data!",
      );
      navigate("/masters/administrative-masters/caste-master");
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

    if (!formData.caste_name || !formData.caste_name.trim()) {
      newErrors.caste_name = "Caste name is required";
    } else if (formData.caste_name.length > 50) {
      newErrors.caste_name = `Maximum 50 characters allowed (${formData.caste_name.length}/50)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Caste?" : "Create New Caste?",
      text: isEditMode
        ? "Are you sure you want to update this caste?"
        : "Are you sure you want to create this new caste?",
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
        caste_name: formData.caste_name.trim(),
      };

      let response;
      if (isEditMode) {
        response = await CasteMasterApi.update(id, submitData);
        if (response.status) {
          toast.success("Caste updated successfully!");
        } else {
          throw new Error(response.message || "Update failed");
        }
      } else {
        response = await CasteMasterApi.create(submitData);
        if (response.status) {
          toast.success("Caste created successfully!");
        } else {
          throw new Error(response.message || "Creation failed");
        }
      }

      setTimeout(() => {
        navigate("/masters/administrative-masters/caste-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving caste:", error);

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
      } else if (error.message) {
        toast.error(error.message);
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
    navigate("/masters/administrative-masters/caste-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading caste data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Caste" : "Add New Caste"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? "Update caste information" : "Create a new caste"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 max-w-full">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Caste Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* caste_name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caste Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="caste_name"
                  value={formData.caste_name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.caste_name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="e.g., General, OBC, SC, ST"
                  maxLength={50}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.caste_name ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                    {errors.caste_name}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Required. Max 50 characters.
                  </p>
                )}
                <span
                  className={`text-xs ${
                    formData.caste_name.length > 40
                      ? formData.caste_name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.caste_name.length}/50
                </span>
              </div>
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
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Caste" : "Create Caste"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditCaste;
