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
  DollarSign,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import SigniWorkApi from "../../../services/signiworkapi";

const AddEditSigniWork = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    SWrk_Code: "",
    SWrk_Name: "",
    SWrk_Fees: false,
    Is_Reimburse: false,
    Is_Active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadWorkData();
    }
  }, [id]);

  const loadWorkData = async () => {
    setLoading(true);
    try {
      const response = await SigniWorkApi.getById(id);
      if (response.success) {
        const work = response.data;
        setFormData({
          SWrk_Code: work.SWrk_Code || "",
          SWrk_Name: work.SWrk_Name || "",
          SWrk_Fees: work.SWrk_Fees == true || work.SWrk_Fees == 1,
          Is_Reimburse: work.Is_Reimburse == true || work.Is_Reimburse == 1,
          Is_Active: work.Is_Active == true || work.Is_Active == 1,
        });
      } else {
        toast.error("Failed to load significant work data!");
        navigate(
          "/masters/performance-discipline-masters/significant-work-master",
        );
      }
    } catch (error) {
      toast.error("Failed to load significant work data!");
      navigate(
        "/masters/performance-discipline-masters/significant-work-master",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));

    // Clear field-specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // SWrk_Name: Required, max 200 chars
    if (!formData.SWrk_Name.trim()) {
      newErrors.SWrk_Name = "Significant work name is required";
    } else if (formData.SWrk_Name.length > 200) {
      newErrors.SWrk_Name = `Maximum 200 characters allowed (${formData.SWrk_Name.length}/200)`;
    }

    // SWrk_Code: Optional, max 30 chars
    if (formData.SWrk_Code && formData.SWrk_Code.length > 30) {
      newErrors.SWrk_Code = `Maximum 30 characters allowed (${formData.SWrk_Code.length}/30)`;
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
        ? "Update Significant Work?"
        : "Create New Significant Work?",
      text: isEditMode
        ? "Are you sure you want to update this significant work?"
        : "Are you sure you want to create this new significant work?",
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
      // Prepare data for API: send null if code is empty string
      const submitData = {
        SWrk_Code: formData.SWrk_Code || null,
        SWrk_Name: formData.SWrk_Name,
        SWrk_Fees: formData.SWrk_Fees ? 1 : 0,
        Is_Reimburse: formData.Is_Reimburse ? 1 : 0,
        Is_Active: formData.Is_Active ? 1 : 0,
      };

      if (isEditMode) {
        await SigniWorkApi.update(id, submitData);
        toast.success("Significant work updated successfully!");
      } else {
        await SigniWorkApi.create(submitData);
        toast.success("Significant work created successfully!");
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(
          "/masters/performance-discipline-masters/significant-work-master",
        );
      }, 1500);
    } catch (error) {
      console.error("Error saving significant work:", error);

      // Handle API validation errors
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        // Display first error as toast
        const firstError = Object.values(apiErrors).flat()[0];
        toast.error(firstError || "Validation failed");

        // Set field-specific errors for UI
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
    navigate("/masters/performance-discipline-masters/significant-work-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading significant work data...</p>
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
              navigate(
                "/masters/performance-discipline-masters/significant-work-master",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Significant Work"
                : "Add New Significant Work"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update significant work information"
                : "Create a new significant work"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Significant Work Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SWrk_Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="SWrk_Name"
                  value={formData.SWrk_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.SWrk_Name ? "border-red-300" : "border-gray-300"}`}
                  placeholder="e.g., Document Signing"
                  maxLength={200}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.SWrk_Name ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.SWrk_Name}
                  </p>
                ) : null}
                <span
                  className={`text-xs ml-auto ${formData.SWrk_Name.length > 150 ? (formData.SWrk_Name.length >= 200 ? "text-red-600 font-bold" : "text-amber-600") : "text-gray-500"}`}
                >
                  {formData.SWrk_Name.length}/200
                </span>
              </div>
            </div>
            {/* SWrk_Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Code
              </label>
              <div className="relative">
                <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="SWrk_Code"
                  value={formData.SWrk_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.SWrk_Code ? "border-red-300" : "border-gray-300"}`}
                  placeholder="e.g., WRK001, SIGN001"
                  maxLength={30}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.SWrk_Code ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.SWrk_Code}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Optional. Max 30 characters.
                  </p>
                )}
                <span
                  className={`text-xs ${formData.SWrk_Code?.length > 25 ? (formData.SWrk_Code?.length >= 30 ? "text-red-600 font-bold" : "text-amber-600") : "text-gray-500"}`}
                >
                  {formData.SWrk_Code?.length || 0}/30
                </span>
              </div>
            </div>

            {/* SWrk_Fees */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="SWrk_Fees"
                    checked={formData.SWrk_Fees}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full transition-colors duration-200 ${formData.SWrk_Fees ? "bg-green-400" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${formData.SWrk_Fees ? "transform translate-x-6" : ""}`}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign
                    className={`h-5 w-5 mr-2 ${formData.SWrk_Fees ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Has Fees
                  </span>
                </div>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-14">
                Enable if this work has associated fees
              </p>
            </div>

            {/* Is_Reimburse */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="Is_Reimburse"
                    checked={formData.Is_Reimburse}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full transition-colors duration-200 ${formData.Is_Reimburse ? "bg-green-400" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${formData.Is_Reimburse ? "transform translate-x-6" : ""}`}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center">
                  <RotateCcw
                    className={`h-5 w-5 mr-2 ${formData.Is_Reimburse ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Is Reimbursable
                  </span>
                </div>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-14">
                Enable if this work can be reimbursed
              </p>
            </div>

            {/* Active Status - Full width */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="Is_Active"
                    checked={formData.Is_Active}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full transition-colors duration-200 ${formData.Is_Active ? "bg-green-400" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${formData.Is_Active ? "transform translate-x-6" : ""}`}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center">
                  {formData.Is_Active ? (
                    <ToggleRight className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {formData.Is_Active ? "Active" : "Inactive"}
                  </span>
                </div>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-14">
                Set as active to make this work available for selection
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
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-lg hover:from-purple-700 hover:to-pink-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Work" : "Create Work"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditSigniWork;
