import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  Hash,
  Code,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmpLanguageApi from "../../../services/emplanguageapi";

const AddEditEmpLanguage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    ELg_Code: "",
    Elg_Name: "",
    Is_Active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadLanguageData();
    }
  }, [id]);

  const loadLanguageData = async () => {
    setLoading(true);
    try {
      const response = await EmpLanguageApi.getById(id);
      if (response.success) {
        const language = response.data;
        setFormData({
          ELg_Code: language.ELg_Code || "",
          Elg_Name: language.Elg_Name || "",
          Is_Active: language.Is_Active == true || language.Is_Active == 1,
        });
      } else {
        toast.error("Failed to load employee language data!");
        navigate("/masters/employee-records/employee-language-master");
      }
    } catch (error) {
      toast.error("Failed to load employee language data!");
      navigate("/masters/employee-records/employee-language-master");
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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // ELg_Code is nullable, max 10 chars
    if (formData.ELg_Code && formData.ELg_Code.length > 10) {
      newErrors.ELg_Code = `Maximum 10 characters allowed (${formData.ELg_Code.length}/10)`;
    }

    // Elg_Name is required, max 50 chars
    if (!formData.Elg_Name.trim()) {
      newErrors.Elg_Name = "Language name is required";
    } else if (formData.Elg_Name.length > 50) {
      newErrors.Elg_Name = `Maximum 50 characters allowed (${formData.Elg_Name.length}/50)`;
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
        ? "Update Employee Language?"
        : "Create New Employee Language?",
      text: isEditMode
        ? "Are you sure you want to update this employee language?"
        : "Are you sure you want to create this new employee language?",
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
        ELg_Code: formData.ELg_Code || null,
        Elg_Name: formData.Elg_Name,
        Is_Active: formData.Is_Active,
      };

      if (isEditMode) {
        await EmpLanguageApi.update(id, submitData);
        toast.success("Employee language updated successfully!");
      } else {
        await EmpLanguageApi.create(submitData);
        toast.success("Employee language created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/employee-records/employee-language-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving employee language:", error);

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
    navigate("/masters/employee-records/employee-language-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading employee language data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/employee-records/employee-language-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Employee Language"
                : "Add New Employee Language"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update employee language information"
                : "Create a new employee language for the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Language Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Language Code
                </label>
                <span
                  className={`text-xs ${
                    formData.ELg_Code.length > 7
                      ? formData.ELg_Code.length >= 10
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.ELg_Code.length}/10 characters
                </span>
              </div>
              <div className="relative">
                <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="ELg_Code"
                  value={formData.ELg_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.ELg_Code ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., ENG, HIN, GUJ"
                  maxLength={10}
                />
              </div>
              {errors.ELg_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.ELg_Code}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Optional. Maximum 10 characters.
              </p>
            </div>

            {/* Language Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Language Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Elg_Name.length > 35
                      ? formData.Elg_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Elg_Name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Elg_Name"
                  value={formData.Elg_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Elg_Name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., English, Hindi, Gujarati"
                  maxLength={50}
                />
              </div>
              {errors.Elg_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Elg_Name}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status
              </label>
              <div className="flex items-center space-x-6">
                <label className="inline-flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="Is_Active"
                    checked={formData.Is_Active == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Active: true }))
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Active
                  </span>
                </label>
                <label className="inline-flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="Is_Active"
                    checked={formData.Is_Active == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Active: false }))
                    }
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                    Inactive
                  </span>
                </label>
              </div>
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
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Language" : "Create Language"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditEmpLanguage;
