import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Briefcase,
  AlertCircle,
  Tag,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  RotateCcw,
  Calendar,
  FileText,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SpecialDutyApi } from "../../../services/specialdutymasterapi";

const AddEditSpecialDuty = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    SDt_Code: "",
    SDt_Name: "",
    SDt__Desc: "",
    SDt__SDate: "",
    SDt__EDate: "",
    SDt_Fees: false,
    Is_Reimburse: false,
    Is_Active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id !=  "create") {
      setIsEditMode(true);
      loadSpecialDutyData();
    }
  }, [id]);

  // const loadSpecialDutyData = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await SpecialDutyApi.getById(id);
  //     if (response.success) {
  //       const specialDuty = response.data;
  //       setFormData({
  //         SDt_Code: specialDuty.SDt_Code || "",
  //         SDt_Name: specialDuty.SDt_Name || "",
  //         SDt__Desc: specialDuty.SDt__Desc || "",
  //         SDt__SDate: specialDuty.SDt__SDate || "",
  //         SDt__EDate: specialDuty.SDt__EDate || "",
  //         SDt_Fees: specialDuty.SDt_Fees ==  true || specialDuty.SDt_Fees ==  1,
  //         Is_Reimburse: specialDuty.Is_Reimburse ==  true || specialDuty.Is_Reimburse ==  1,
  //         Is_Active: specialDuty.Is_Active ==  true || specialDuty.Is_Active ==  1,
  //       });
  //     } else {
  //       toast.error("Failed to load special duty data!");
  //       navigate("/masters/performance-discipline-masters/special-duty");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to load special duty data!");
  //     navigate("/masters/performance-discipline-masters/special-duty");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadSpecialDutyData = async () => {
  setLoading(true);
  try {
    // API returns the data directly, not wrapped in success property
    const specialDuty = await SpecialDutyApi.getById(id);
    
    // Check if we got valid data
    if (specialDuty && specialDuty.SDt_Id) {
      setFormData({
        SDt_Code: specialDuty.SDt_Code || "",
        SDt_Name: specialDuty.SDt_Name || "",
        SDt__Desc: specialDuty.SDt__Desc || "",
        SDt__SDate: specialDuty.SDt__SDate || "",
        SDt__EDate: specialDuty.SDt__EDate || "",
        SDt_Fees: specialDuty.SDt_Fees ==  true || specialDuty.SDt_Fees ==  1,
        Is_Reimburse: specialDuty.Is_Reimburse ==  true || specialDuty.Is_Reimburse ==  1,
        Is_Active: specialDuty.Is_Active ==  true || specialDuty.Is_Active ==  1,
      });
    } else {
      throw new Error("Invalid data structure received from API");
    }
  } catch (error) {
    console.error("Error loading special duty:", error);
    toast.error(error.message || "Failed to load special duty data!");
    navigate("/masters/performance-discipline-masters/special-duty");
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type ==  "checkbox" ? checked : value,
    }));

    // Clear field-specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // SDt_Name: Required, max 50 chars
    if (!formData.SDt_Name.trim()) {
      newErrors.SDt_Name = "Special duty name is required";
    } else if (formData.SDt_Name.length > 50) {
      newErrors.SDt_Name = `Maximum 50 characters allowed (${formData.SDt_Name.length}/50)`;
    }

    // SDt_Code: Optional, max 20 chars, alphanumeric
    if (formData.SDt_Code && formData.SDt_Code.length > 20) {
      newErrors.SDt_Code = `Maximum 20 characters allowed (${formData.SDt_Code.length}/20)`;
    } else if (formData.SDt_Code && !/^[a-zA-Z0-9]+$/.test(formData.SDt_Code)) {
      newErrors.SDt_Code = "Only alphanumeric characters allowed";
    }

    // SDt__Desc: Optional, max 150 chars
    if (formData.SDt__Desc && formData.SDt__Desc.length > 150) {
      newErrors.SDt__Desc = `Maximum 150 characters allowed (${formData.SDt__Desc.length}/150)`;
    }

    // Date validation
    if (formData.SDt__SDate && formData.SDt__EDate) {
      const startDate = new Date(formData.SDt__SDate);
      const endDate = new Date(formData.SDt__EDate);
      if (endDate < startDate) {
        newErrors.SDt__EDate = "End date must be after or equal to start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length ==  0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await Swal.fire({
      title: isEditMode
        ? "Update Special Duty?"
        : "Create New Special Duty?",
      text: isEditMode
        ? "Are you sure you want to update this special duty?"
        : "Are you sure you want to create this new special duty?",
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
      // Prepare data for API: send null if empty string
      const submitData = {
        SDt_Code: formData.SDt_Code || null,
        SDt_Name: formData.SDt_Name,
        SDt__Desc: formData.SDt__Desc || null,
        SDt__SDate: formData.SDt__SDate || null,
        SDt__EDate: formData.SDt__EDate || null,
        SDt_Fees: formData.SDt_Fees ? 1 : 0,
        Is_Reimburse: formData.Is_Reimburse ? 1 : 0,
        Is_Active: formData.Is_Active ? 1 : 0,
      };

      if (isEditMode) {
        await SpecialDutyApi.update(id, submitData);
        toast.success("Special duty updated successfully!");
      } else {
        await SpecialDutyApi.create(submitData);
        toast.success("Special duty created successfully!");
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigate("/masters/performance-discipline-masters/special-duty");
      }, 1500);
    } catch (error) {
      console.error("Error saving special duty:", error);

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
            : "Failed to create. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/performance-discipline-masters/special-duty");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading special duty data...</p>
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
              navigate("/masters/performance-discipline-masters/special-duty")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Special Duty"
                : "Add New Special Duty"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update special duty information"
                : "Create a new special duty"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Special Duty Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SDt_Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duty Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="SDt_Name"
                  value={formData.SDt_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.SDt_Name ? "border-red-300" : "border-gray-300"}`}
                  placeholder="e.g., Election Duty, Night Shift Duty"
                  maxLength={50}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.SDt_Name ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.SDt_Name}
                  </p>
                ) : null}
              </div>
            </div>

            {/* SDt_Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duty Code
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="SDt_Code"
                  value={formData.SDt_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.SDt_Code ? "border-red-300" : "border-gray-300"}`}
                  placeholder="e.g., SD001, ELEC001"
                  maxLength={20}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.SDt_Code ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.SDt_Code}
                  </p>
                ) : null}
              </div>
            </div>            

            {/* SDt__SDate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="SDt__SDate"
                  value={formData.SDt__SDate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.SDt__SDate ? "border-red-300" : "border-gray-300"}`}
                />
              </div>
              {errors.SDt__SDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SDt__SDate}
                </p>
              )}
            </div>

            {/* SDt__EDate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="SDt__EDate"
                  value={formData.SDt__EDate}
                  onChange={handleInputChange}
                  min={formData.SDt__SDate}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.SDt__EDate ? "border-red-300" : "border-gray-300"}`}
                />
              </div>
              {errors.SDt__EDate ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.SDt__EDate}
                </p>
              ) : null}
            </div>

            {/* SDt__Desc - Full width */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="SDt__Desc"
                  value={formData.SDt__Desc}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.SDt__Desc ? "border-red-300" : "border-gray-300"}`}
                  placeholder="Enter description (optional, max 150 characters)"
                  maxLength={150}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.SDt__Desc ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.SDt__Desc}
                  </p>
                ) : null}
                <span
                  className={`text-xs ml-auto ${formData.SDt__Desc.length > 120 ? (formData.SDt__Desc.length >= 150 ? "text-red-600 font-bold" : "text-amber-600") : "text-gray-500"}`}
                >
                  {formData.SDt__Desc.length}/150
                </span>
              </div>
            </div>            
          </div>
          <div className="flex flex-wrap items-center gap-6">
  {/* SDt_Fees */}
  <label className="flex items-center space-x-3 cursor-pointer">
    <div className="relative">
      <input
        type="checkbox"
        name="SDt_Fees"
        checked={formData.SDt_Fees}
        onChange={handleInputChange}
        className="sr-only"
      />
      <div
        className={`block w-14 h-8 rounded-full transition-colors duration-200 ${formData.SDt_Fees ? "bg-green-400" : "bg-gray-300"}`}
      >
        <div
          className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${formData.SDt_Fees ? "transform translate-x-6" : ""}`}
        ></div>
      </div>
    </div>
    <div className="flex items-center">
      <DollarSign
        className={`h-5 w-5 mr-2 ${formData.SDt_Fees ? "text-green-600" : "text-gray-400"}`}
      />
      <span className="text-sm font-medium text-gray-700">
        Has Fees
      </span>
    </div>
  </label>

  {/* Is_Reimburse */}
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

  {/* Is_Active */}
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
                  {isEditMode ? "Update Duty" : "Create Duty"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditSpecialDuty;