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
  Building2,
  Award,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { CityGradeApi } from "../../../services/citygrademasterapi";

const AddEditCityGrade = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    City_Name: "",
    Grade: "",
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadCityGradeData();
    }
  }, [id]);

  const loadCityGradeData = async () => {
    setLoading(true);
    try {
      const cityGrade = await CityGradeApi.getById(id);

      setFormData({
        City_Name: cityGrade.City_Name || "",
        Grade: cityGrade.Grade || "",
      });
    } catch (error) {
      toast.error("Failed to load city grade data!");
      navigate("/masters/administrative-masters/city-grade");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name == "City_Name") {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    if (name == "Grade") {
      // Allow uppercase, lowercase, and numbers
      processedValue = value.replace(/[^a-zA-Z0-9]/g, "");

      if (processedValue.length > 10) {
        processedValue = processedValue.substring(0, 10);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generateGradeSuggestions = () => {
    const cityName = formData.City_Name.trim();
    if (!cityName) return [];

    const suggestions = [];
    const firstChar = cityName.charAt(0).toUpperCase();

    suggestions.push(firstChar);
    suggestions.push(firstChar + "1");
    suggestions.push(firstChar + "01");

    if (cityName.length >= 3) {
      suggestions.push(firstChar + "A");
      suggestions.push(firstChar + "AA");
      suggestions.push(firstChar + "AAA");
      suggestions.push(firstChar + "001");
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.City_Name.trim()) {
      newErrors.City_Name = "City name is required";
    } else if (formData.City_Name.length > 100) {
      newErrors.City_Name = "City name must not exceed 100 characters";
    }

    if (!formData.Grade.trim()) {
      newErrors.Grade = "Grade is required";
    } else if (formData.Grade.length > 10) {
      newErrors.Grade = "Grade must not exceed 10 characters";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.Grade)) {
      newErrors.Grade = "Grade must contain only letters and numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update City Grade?" : "Create New City Grade?",
      text: isEditMode
        ? "Are you sure you want to update this city grade information?"
        : "Are you sure you want to create this new city grade?",
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
      const cityGradeData = {
        City_Name: formData.City_Name.trim(),
        Grade: formData.Grade.trim(),
      };

      if (isEditMode) {
        await CityGradeApi.update(id, cityGradeData);
        toast.success("City grade updated successfully!");
      } else {
        await CityGradeApi.create(cityGradeData);
        toast.success("City grade created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/administrative-masters/city-grade");
      }, 1500);
    } catch (error) {
      console.error("Error saving city grade:", error);

      if (error.errors) {
        const newErrors = {};

        Object.keys(error.errors).forEach((key) => {
          newErrors[key] = Array.isArray(error.errors[key])
            ? error.errors[key][0]
            : error.errors[key];
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else if (error.message) {
        if (
          error.message.includes("unique") ||
          error.message.includes("already exists")
        ) {
          setErrors({ City_Name: "This city name already exists" });
          toast.error("This city name already exists");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(
          isEditMode
            ? "Failed to update city grade. Please try again."
            : "Failed to create city grade. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/administrative-masters/city-grade");
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const suggestions = generateGradeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading city grade data...</p>
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
              navigate("/masters/administrative-masters/city-grade")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit City Grade" : "Add New City Grade"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update city grade master information"
                : "Create a new city grade master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              City Grade Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* City Name - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  City Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.City_Name.length > 80
                      ? formData.City_Name.length >= 100
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.City_Name.length}/100 characters
                </span>
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="City_Name"
                  value={formData.City_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.City_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                  required
                  maxLength={100}
                />
                {formData.City_Name && !errors.City_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.City_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.City_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.City_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Name of the city (required, max 100 characters, must be
                  unique)
                </p>
              )}
            </div>

            {/* Grade - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Grade <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.Grade.length > 8
                        ? formData.Grade.length >= 10
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.Grade.length}/10 characters
                  </span>
                  {suggestions.length > 0 && !isEditMode && (
                    <div className="text-xs text-gray-500">
                      Suggestions:{" "}
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              Grade: suggestion,
                            }));
                          }}
                          className="ml-2 px-2 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Grade"
                  value={formData.Grade}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Grade ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., A, AA, B1, C2, Grade1"
                  required
                  maxLength={10}
                />
                {formData.Grade && !errors.Grade && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Grade && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.Grade && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Grade)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy grade"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Grade ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Grade}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Grade classification (required, max 10 characters)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0"></div>
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
                  {isEditMode ? "Update City Grade" : "Create City Grade"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditCityGrade;
