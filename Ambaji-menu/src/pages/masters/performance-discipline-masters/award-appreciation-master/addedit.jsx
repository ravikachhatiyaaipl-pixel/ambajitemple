import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Award,
  Hash,
  Check,
  AlertCircle,
  Copy,
  Calendar,
  Building2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { AwardMasterApi } from "../../../services/awardmasterapi";

const AddEditAward = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    Awrd_Code: "",
    Awrd_Name: "",
    Awrd_Year: "",
    Awrding_Auth: "",
    Is_Active: 1, // Default active
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadAwardData();
    }
  }, [id]);

  const loadAwardData = async () => {
    setLoading(true);
    try {
      const award = await AwardMasterApi.getById(id);

      setFormData({
        Awrd_Code: award.Awrd_Code || "",
        Awrd_Name: award.Awrd_Name || "",
        Awrd_Year: award.Awrd_Year?.toString() || "",
        Awrding_Auth: award.Awrding_Auth || "",
        Is_Active: award.Is_Active ? 1 : 0,
      });
    } catch (error) {
      toast.error("Failed to load award data!");
      navigate("/masters/performance-discipline-masters/award");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    // Handle numeric fields
    if (name == "Awrd_Year") {
      processedValue = value.replace(/[^0-9]/g, "");
      if (processedValue.length > 4) {
        processedValue = processedValue.substring(0, 4);
      }
    }

    // Handle checkbox for Is_Active
    if (name == "Is_Active") {
      processedValue = checked ? 1 : 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generateCodeSuggestions = () => {
    const name = formData.Awrd_Name.trim();
    if (!name) return [];

    const suggestions = [];

    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 2) {
        suggestions.push(word.substring(0, 2).toUpperCase());
      }
      if (word.length >= 3) {
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
      suggestions.push(word.substring(0, 2).toUpperCase() + "001");
      suggestions.push(word.substring(0, 3).toUpperCase() + "001");
    } else if (words.length >= 2) {
      const firstLetters = words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase();
      suggestions.push(firstLetters);

      if (words[0].length >= 2) {
        suggestions.push(
          (words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase(),
        );
      }
      suggestions.push(firstLetters + "001");
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    // Awrd_Name validation - Required
    if (!formData.Awrd_Name.trim()) {
      newErrors.Awrd_Name = "Award name is required";
    } else if (formData.Awrd_Name.length > 50) {
      newErrors.Awrd_Name = "Award name must not exceed 50 characters";
    }

    // Awrd_Code validation - Optional, max 20 chars
    if (formData.Awrd_Code && formData.Awrd_Code.length > 20) {
      newErrors.Awrd_Code = "Award code must not exceed 20 characters";
    }

    // Awrd_Year validation - Optional, must be 4 digits if provided
    if (formData.Awrd_Year) {
      if (!/^\d{4}$/.test(formData.Awrd_Year)) {
        newErrors.Awrd_Year = "Year must be a 4-digit number";
      }
    }

    // Awrding_Auth validation - Optional, max 100 chars
    if (formData.Awrding_Auth && formData.Awrding_Auth.length > 100) {
      newErrors.Awrding_Auth =
        "Awarding authority must not exceed 100 characters";
    }

    // Is_Active validation - Required boolean
    if (formData.Is_Active == undefined || formData.Is_Active == null) {
      newErrors.Is_Active = "Status is required";
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
      title: isEditMode ? "Update Award?" : "Create New Award?",
      text: isEditMode
        ? "Are you sure you want to update this award information?"
        : "Are you sure you want to create this new award?",
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
      const awardData = {
        Awrd_Code: formData.Awrd_Code || null,
        Awrd_Name: formData.Awrd_Name.trim(),
        Awrd_Year: formData.Awrd_Year ? parseInt(formData.Awrd_Year) : null,
        Awrding_Auth: formData.Awrding_Auth || null,
        Is_Active: formData.Is_Active,
      };

      if (isEditMode) {
        await AwardMasterApi.update(id, awardData);
        toast.success("Award updated successfully!");
      } else {
        await AwardMasterApi.create(awardData);
        toast.success("Award created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/performance-discipline-masters/award");
      }, 1500);
    } catch (error) {
      console.error("Error saving award:", error);

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
        toast.error(error.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update award. Please try again."
            : "Failed to create award. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/performance-discipline-masters/award");
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const suggestions = generateCodeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading award data...</p>
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
              navigate("/masters/performance-discipline-masters/award")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Award" : "Add New Award"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update award master information"
                : "Create a new award master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Award className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Award Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Award Name - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Award Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Awrd_Name.length > 40
                      ? formData.Awrd_Name.length >= 50
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Awrd_Name.length}/50 characters
                </span>
              </div>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Awrd_Name"
                  value={formData.Awrd_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Awrd_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., Best Employee, Performance Award"
                  required
                  maxLength={50}
                />
                {formData.Awrd_Name && !errors.Awrd_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Awrd_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Awrd_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Awrd_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Name of the award (required, max 50 characters)
                </p>
              )}
            </div>

            {/* Award Code - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Award Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.Awrd_Code.length > 15
                        ? formData.Awrd_Code.length >= 20
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.Awrd_Code.length}/20 characters
                  </span>
                </div>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Awrd_Code"
                  value={formData.Awrd_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Awrd_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., AW001, PERF2025 (optional, max 20 chars)"
                  maxLength={20}
                />
                {formData.Awrd_Code && !errors.Awrd_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Awrd_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.Awrd_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.Awrd_Code)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.Awrd_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Awrd_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the award (optional, max 20 characters)
                </p>
              )}
            </div>

            {/* Award Year - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Award Year{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.Awrd_Year.length}/4 digits
                </span>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Awrd_Year"
                  value={formData.Awrd_Year}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Awrd_Year ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 2025 (4 digits)"
                  maxLength={4}
                />
                {formData.Awrd_Year && !errors.Awrd_Year && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Awrd_Year && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Awrd_Year ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Awrd_Year}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Year of the award (optional, must be 4 digits)
                </p>
              )}
            </div>

            {/* Awarding Authority - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Awarding Authority{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Awrding_Auth.length > 80
                      ? formData.Awrding_Auth.length >= 100
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Awrding_Auth.length}/100 characters
                </span>
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Awrding_Auth"
                  value={formData.Awrding_Auth}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Awrding_Auth ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., HR Department, Management Committee"
                  maxLength={100}
                />
                {formData.Awrding_Auth && !errors.Awrding_Auth && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Awrding_Auth && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Awrding_Auth ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Awrding_Auth}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Authority granting the award (optional, max 100 characters)
                </p>
              )}
            </div>

            {/* Is_Active - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="Is_Active"
                      value="1"
                      checked={formData.Is_Active == 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          Is_Active: parseInt(e.target.value),
                        })
                      }
                      className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="Is_Active"
                      value="0"
                      checked={formData.Is_Active == 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          Is_Active: parseInt(e.target.value),
                        })
                      }
                      className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>
              {errors.Is_Active ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Is_Active}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Current status of the award record
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
                  {isEditMode ? "Update Award" : "Create Award"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditAward;
