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
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import IncExamApi from "../../../services/incexamapi";

const AddEditIncExam = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    EEd_Code: "",
    EEd_Name: "",
    Is_Active: true,
    Is_Mandatory: "Y",
    Is_Technical: "N",
    Is_Professional: "Y",
    Is_Promotional: "N",
    Rec_Valid: "Y",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadExamData();
    }
  }, [id]);

  const loadExamData = async () => {
    setLoading(true);
    try {
      const response = await IncExamApi.getById(id);
      if (response.success) {
        const exam = response.data;
        setFormData({
          EEd_Code: exam.EEd_Code || "",
          EEd_Name: exam.EEd_Name || "",
          Is_Active: exam.Is_Active == true || exam.Is_Active == 1,
          Is_Mandatory: exam.Is_Mandatory || "Y",
          Is_Technical: exam.Is_Technical || "N",
          Is_Professional: exam.Is_Professional || "Y",
          Is_Promotional: exam.Is_Promotional || "N",
          Rec_Valid: exam.Rec_Valid || "Y",
        });
      } else {
        toast.error("Failed to load increment exam data!");
        navigate(
          "/masters/performance-discipline-masters/increment-exam-master",
        );
      }
    } catch (error) {
      toast.error("Failed to load increment exam data!");
      navigate("/masters/performance-discipline-masters/increment-exam-master");
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

  const handleRadioChange = (name, value) => {
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

    // EEd_Name: Required, max 100 chars
    if (!formData.EEd_Name.trim()) {
      newErrors.EEd_Name = "Exam name is required";
    } else if (formData.EEd_Name.length > 100) {
      newErrors.EEd_Name = `Maximum 100 characters allowed (${formData.EEd_Name.length}/100)`;
    }

    // EEd_Code: Optional, max 20 chars
    if (formData.EEd_Code && formData.EEd_Code.length > 20) {
      newErrors.EEd_Code = `Maximum 20 characters allowed (${formData.EEd_Code.length}/20)`;
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
        ? "Update Increment Exam?"
        : "Create New Increment Exam?",
      text: isEditMode
        ? "Are you sure you want to update this increment exam?"
        : "Are you sure you want to create this new increment exam?",
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
      // Prepare data for API
      const submitData = {
        EEd_Code: formData.EEd_Code || null,
        EEd_Name: formData.EEd_Name,
        Is_Active: formData.Is_Active ? 1 : 0,
        Is_Mandatory: formData.Is_Mandatory,
        Is_Technical: formData.Is_Technical,
        Is_Professional: formData.Is_Professional,
        Is_Promotional: formData.Is_Promotional,
        Rec_Valid: formData.Rec_Valid,
      };

      if (isEditMode) {
        await IncExamApi.update(id, submitData);
        toast.success("Increment exam updated successfully!");
      } else {
        await IncExamApi.create(submitData);
        toast.success("Increment exam created successfully!");
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(
          "/masters/performance-discipline-masters/increment-exam-master",
        );
      }, 1500);
    } catch (error) {
      console.error("Error saving increment exam:", error);

      // Handle API validation errors
      if (error.errors) {
        // Set field-specific errors for UI
        const fieldErrors = {};
        Object.keys(error.errors).forEach((key) => {
          fieldErrors[key] = error.errors[key][0];
        });
        setErrors(fieldErrors);

        // Display first error as toast
        const firstError = Object.values(error.errors).flat()[0];
        toast.error(firstError || "Validation failed");
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
    navigate("/masters/performance-discipline-masters/increment-exam-master");
  };

  // Radio button component for Y/N options
  const RadioGroup = ({
    name,
    value,
    onChange,
    label,
    options = ["Y", "N"],
  }) => {
    return (
      <div className="flex items-center space-x-4">
        {options.map((option) => (
          <label key={option} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value == option}
              onChange={(e) => onChange(name, e.target.value)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">
              {option == "Y" ? "Yes" : "No"}
            </span>
          </label>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading increment exam data...</p>
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
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Increment Exam" : "Add New Increment Exam"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update increment exam information"
                : "Create a new increment exam"}
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
              Increment Exam Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EEd_Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="EEd_Name"
                  value={formData.EEd_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.EEd_Name ? "border-red-300" : "border-gray-300"}`}
                  placeholder="e.g., Preliminary Examination"
                  maxLength={100}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.EEd_Name ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.EEd_Name}
                  </p>
                ) : null}
                <span
                  className={`text-xs ml-auto ${formData.EEd_Name.length > 75 ? (formData.EEd_Name.length >= 100 ? "text-red-600 font-bold" : "text-amber-600") : "text-gray-500"}`}
                >
                  {formData.EEd_Name.length}/100
                </span>
              </div>
            </div>

            {/* EEd_Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Code
              </label>
              <div className="relative">
                <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="EEd_Code"
                  value={formData.EEd_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.EEd_Code ? "border-red-300" : "border-gray-300"}`}
                  placeholder="e.g., EXM001, PRE001"
                  maxLength={20}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.EEd_Code ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.EEd_Code}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Optional. Max 20 characters.
                  </p>
                )}
                <span
                  className={`text-xs ${formData.EEd_Code?.length > 15 ? (formData.EEd_Code?.length >= 20 ? "text-red-600 font-bold" : "text-amber-600") : "text-gray-500"}`}
                >
                  {formData.EEd_Code?.length || 0}/20
                </span>
              </div>
            </div>

            {/* Is_Mandatory */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Is Mandatory <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                name="Is_Mandatory"
                value={formData.Is_Mandatory}
                onChange={handleRadioChange}
              />
              {errors.Is_Mandatory && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Is_Mandatory}
                </p>
              )}
            </div>

            {/* Is_Technical */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Is Technical <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                name="Is_Technical"
                value={formData.Is_Technical}
                onChange={handleRadioChange}
              />
              {errors.Is_Technical && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Is_Technical}
                </p>
              )}
            </div>

            {/* Is_Professional */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Is Professional <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                name="Is_Professional"
                value={formData.Is_Professional}
                onChange={handleRadioChange}
              />
              {errors.Is_Professional && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Is_Professional}
                </p>
              )}
            </div>

            {/* Is_Promotional */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Is Promotional <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                name="Is_Promotional"
                value={formData.Is_Promotional}
                onChange={handleRadioChange}
              />
              {errors.Is_Promotional && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Is_Promotional}
                </p>
              )}
            </div>

            {/* Rec_Valid */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Record Valid <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                name="Rec_Valid"
                value={formData.Rec_Valid}
                onChange={handleRadioChange}
              />
              {errors.Rec_Valid && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Rec_Valid}
                </p>
              )}
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
                Set as active to make this exam available for selection
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Exam" : "Create Exam"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditIncExam;
