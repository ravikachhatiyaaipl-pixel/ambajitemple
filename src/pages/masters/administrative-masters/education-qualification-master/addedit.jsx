import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  GraduationCap,
  AlertCircle,
  Code,
  Tag,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  Brain,
  Briefcase,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EducationApi from "../../../services/educationApi";

const AddEditEducation = ({ user }) => {
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
    Is_Professional: "N",
    Is_Promotional: "N",
    Rec_Valid: "Y",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id != "create" && id != "add") {
      setIsEditMode(true);
      loadEducationData();
    } else {
      setIsEditMode(false);
    }
  }, [id]);

  const loadEducationData = async () => {
    setLoading(true);
    try {
      const response = await EducationApi.getById(id);
      console.log("API Response:", response); // Debug log

      if (response.success) {
        const edu = response.data;
        console.log("Education Data:", edu); // Debug log

        setFormData({
          EEd_Code: edu.EEd_Code || "",
          EEd_Name: edu.EEd_Name || "",
          // Handle Is_Active: could be boolean, number, or string
          Is_Active:
            edu.Is_Active == true || edu.Is_Active == 1 || edu.Is_Active == "1",
          // Handle Y/N fields - ensure they're "Y" or "N"
          Is_Mandatory:
            edu.Is_Mandatory == "Y" ||
            edu.Is_Mandatory == 1 ||
            edu.Is_Mandatory == true
              ? "Y"
              : "N",
          Is_Technical:
            edu.Is_Technical == "Y" ||
            edu.Is_Technical == 1 ||
            edu.Is_Technical == true
              ? "Y"
              : "N",
          Is_Professional:
            edu.Is_Professional == "Y" ||
            edu.Is_Professional == 1 ||
            edu.Is_Professional == true
              ? "Y"
              : "N",
          Is_Promotional:
            edu.Is_Promotional == "Y" ||
            edu.Is_Promotional == 1 ||
            edu.Is_Promotional == true
              ? "Y"
              : "N",
          Rec_Valid:
            edu.Rec_Valid == "Y" || edu.Rec_Valid == 1 || edu.Rec_Valid == true
              ? "Y"
              : "N",
        });
      } else {
        toast.error("Failed to load education qualification data!");
        navigate(
          "/masters/administrative-masters/education-qualification-master",
        );
      }
    } catch (error) {
      console.error("Error loading education:", error);
      toast.error("Failed to load education qualification data!");
      navigate(
        "/masters/administrative-masters/education-qualification-master",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type == "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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
    if (!formData.EEd_Name || !formData.EEd_Name.trim()) {
      newErrors.EEd_Name = "Education qualification name is required";
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
        ? "Update Education Qualification?"
        : "Create New Education Qualification?",
      text: isEditMode
        ? "Are you sure you want to update this education qualification?"
        : "Are you sure you want to create this new education qualification?",
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
      // Prepare data for API - exactly as per API requirements
      const submitData = {
        EEd_Code: formData.EEd_Code || null,
        EEd_Name: formData.EEd_Name.trim(),
        // Is_Active as number (0 or 1)
        Is_Active: formData.Is_Active ? 1 : 0,
        // All Y/N fields as strings "Y" or "N"
        Is_Mandatory: formData.Is_Mandatory,
        Is_Technical: formData.Is_Technical,
        Is_Professional: formData.Is_Professional,
        Is_Promotional: formData.Is_Promotional,
        Rec_Valid: formData.Rec_Valid,
      };

      console.log("Submitting data:", submitData); // Debug log

      if (isEditMode) {
        await EducationApi.update(id, submitData);
        toast.success("Education qualification updated successfully!");
      } else {
        await EducationApi.create(submitData);
        toast.success("Education qualification created successfully!");
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(
          "/masters/administrative-masters/education-qualification-master",
        );
      }, 1500);
    } catch (error) {
      console.error("Error saving education qualification:", error);

      // Handle API validation errors
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        console.log("API Errors:", apiErrors); // Debug log

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
    navigate("/masters/administrative-masters/education-qualification-master");
  };

  // Radio button component for Y/N options
  const RadioGroup = ({ name, value, onChange, label }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex space-x-6">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name={name}
            value="Y"
            checked={value == "Y"}
            onChange={(e) => onChange(name, e.target.value)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" /> Yes
          </span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name={name}
            value="N"
            checked={value == "N"}
            onChange={(e) => onChange(name, e.target.value)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 flex items-center">
            <XCircle className="h-4 w-4 text-red-600 mr-1" /> No
          </span>
        </label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading education qualification data...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Education Qualification"
                : "Add New Education Qualification"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update education qualification information"
                : "Create a new education qualification"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Qualification Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EEd_Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification Code
              </label>
              <div className="relative">
                <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="EEd_Code"
                  value={formData.EEd_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.EEd_Code ? "border-red-300" : "border-gray-300"}`}
                  placeholder="e.g., BSC01, MSC01, EXM001"
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

            {/* EEd_Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="EEd_Name"
                  value={formData.EEd_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.EEd_Name ? "border-red-300" : "border-gray-300"}`}
                  placeholder="e.g., Bachelor of Science, Preliminary Examination"
                  maxLength={100}
                />
              </div>
              <div className="flex justify-between mt-1">
                {errors.EEd_Name ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.EEd_Name}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">Required field</p>
                )}
                <span
                  className={`text-xs ${formData.EEd_Name.length > 75 ? (formData.EEd_Name.length >= 100 ? "text-red-600 font-bold" : "text-amber-600") : "text-gray-500"}`}
                >
                  {formData.EEd_Name.length}/100
                </span>
              </div>
            </div>

            {/* Is_Mandatory */}
            <div className="md:col-span-1">
              <RadioGroup
                name="Is_Mandatory"
                value={formData.Is_Mandatory}
                onChange={handleRadioChange}
                label="Is Mandatory"
              />
            </div>

            {/* Is_Technical */}
            <div className="md:col-span-1">
              <RadioGroup
                name="Is_Technical"
                value={formData.Is_Technical}
                onChange={handleRadioChange}
                label="Is Technical"
              />
            </div>

            {/* Is_Professional */}
            <div className="md:col-span-1">
              <RadioGroup
                name="Is_Professional"
                value={formData.Is_Professional}
                onChange={handleRadioChange}
                label="Is Professional"
              />
            </div>

            {/* Is_Promotional */}
            <div className="md:col-span-1">
              <RadioGroup
                name="Is_Promotional"
                value={formData.Is_Promotional}
                onChange={handleRadioChange}
                label="Is Promotional"
              />
            </div>

            {/* Rec_Valid */}
            <div className="md:col-span-1">
              <RadioGroup
                name="Rec_Valid"
                value={formData.Rec_Valid}
                onChange={handleRadioChange}
                label="Record Valid"
              />
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
                Set as active to make this qualification available for selection
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
                  {isEditMode ? "Update Qualification" : "Create Qualification"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditEducation;
