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
  Check,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PayStructureTypeApi from "../../../services/paystructuretypeapi";

const AddEditPayStructureType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    PST_Type: "",
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
      const response = await PayStructureTypeApi.getById(id);
      if (response.success) {
        const type = response.data;
        setFormData({
          PST_Type: type.PST_Type || "",
        });
      } else {
        toast.error("Failed to load pay structure type data!");
        navigate("/masters/payroll-pay-structures/pay-structure-type-master");
      }
    } catch (error) {
      toast.error("Failed to load pay structure type data!");
      navigate("/masters/payroll-pay-structures/pay-structure-type-master");
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

    if (!formData.PST_Type.trim()) {
      newErrors.PST_Type = "Pay structure type is required";
    } else if (formData.PST_Type.length > 30) {
      newErrors.PST_Type = `Maximum 30 characters allowed (${formData.PST_Type.length}/30)`;
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
        ? "Update Pay Structure Type?"
        : "Create New Pay Structure Type?",
      text: isEditMode
        ? "Are you sure you want to update this pay structure type?"
        : "Are you sure you want to create this new pay structure type?",
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
      if (isEditMode) {
        await PayStructureTypeApi.update(id, formData);
        toast.success("Pay structure type updated successfully!");
      } else {
        await PayStructureTypeApi.create(formData);
        toast.success("Pay structure type created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/payroll-pay-structures/pay-structure-type-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving pay structure type:", error);

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
    navigate("/masters/payroll-pay-structures/pay-structure-type-master");
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pay structure type data...</p>
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
                "/masters/payroll-pay-structures/pay-structure-type-master",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Pay Structure Type"
                : "Add New Pay Structure Type"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update pay structure type information"
                : "Create a new pay structure type for the system"}
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
              Pay Structure Type Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Pay Structure Type Field with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Pay Structure Type <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.PST_Type.length > 25
                      ? formData.PST_Type.length >= 30
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.PST_Type.length}/30 characters
                </span>
              </div>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="PST_Type"
                  value={formData.PST_Type}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.PST_Type ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., Monthly, Hourly, Annual, Contract"
                  maxLength={30}
                />
                {formData.PST_Type && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.PST_Type)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.PST_Type ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PST_Type}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Enter the pay structure type name (max 30 characters)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required field - Pay
              structure type must be unique
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

export default AddEditPayStructureType;
