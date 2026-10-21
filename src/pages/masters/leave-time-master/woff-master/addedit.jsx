// components/woff-pattern/addedit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, ArrowLeft, Info, AlertCircle, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { WoffPatternApi } from "../../../services/woffpatternapi";

const AddEditWoffPattern = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize pattern_data with 42 days (6 weeks)
  const initializePatternData = () => {
    return {
      days: Array(42).fill(0),
    };
  };

  const [formData, setFormData] = useState({
    WOP_name: "",
    WOP_code: "",
    pattern_data: initializePatternData(),
    Is_Active: true,
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadWoffPatternData();
    }
  }, [id]);

  const loadWoffPatternData = async () => {
    setLoading(true);
    try {
      const data = await WoffPatternApi.getById(id);

      // Parse pattern_data if it's a string
      let patternData = initializePatternData();
      if (data.pattern_data) {
        try {
          const parsed =
            typeof data.pattern_data == "string"
              ? JSON.parse(data.pattern_data)
              : data.pattern_data;
          patternData = {
            days: parsed.days || Array(42).fill(0),
          };
        } catch (e) {
          console.error("Error parsing pattern_data:", e);
        }
      }

      setFormData({
        WOP_name: data.WOP_name || "",
        WOP_code: data.WOP_code || "",
        pattern_data: patternData,
        Is_Active: data.Is_Active == true || data.Is_Active == 1,
      });
    } catch (error) {
      console.error("Error loading woff pattern:", error);
      toast.error("Failed to load woff pattern data!");
      navigate("/masters/leave-time-master/woff-master");
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

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle day toggle in the pattern grid
  const handleDayToggle = (index) => {
    setFormData((prev) => ({
      ...prev,
      pattern_data: {
        days: prev.pattern_data.days.map((day, i) =>
          i == index ? (day == 1 ? 0 : 1) : day,
        ),
      },
    }));
  };

  // Handle bulk pattern fill
  const handleBulkFill = (value) => {
    setFormData((prev) => ({
      ...prev,
      pattern_data: {
        days: prev.pattern_data.days.map(() => value),
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.WOP_name?.trim()) {
      newErrors.WOP_name = "Pattern name is required";
    }

    if (formData.WOP_name?.length > 100) {
      newErrors.WOP_name = "Name cannot exceed 100 characters";
    }

    if (formData.WOP_code?.length > 50) {
      newErrors.WOP_code = "Code cannot exceed 50 characters";
    }

    // Validate pattern_data has 42 days
    if (
      !formData.pattern_data.days ||
      formData.pattern_data.days.length != 42
    ) {
      newErrors.pattern_data = "Invalid pattern data";
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
      title: isEditMode ? "Update Woff Pattern?" : "Create New Woff Pattern?",
      text: isEditMode
        ? "Are you sure you want to update this woff pattern?"
        : "Are you sure you want to create this woff pattern?",
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
      const payload = {
        WOP_name: formData.WOP_name,
        WOP_code: formData.WOP_code || null,
        pattern_data: formData.pattern_data,
        Is_Active: formData.Is_Active ? 1 : 0,
      };

      if (isEditMode) {
        await WoffPatternApi.update(id, payload);
        toast.success("Woff pattern updated successfully!");
      } else {
        await WoffPatternApi.create(payload);
        toast.success("Woff pattern created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/leave-time-master/woff-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving woff pattern:", error);

      // Handle validation errors from backend
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
            ? "Failed to update woff pattern."
            : "Failed to create woff pattern.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/leave-time-master/woff-master");
  };

  // Get day name for a given index (0 = Monday, 6 = Sunday)
  const getDayName = (index) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days[index % 7];
  };

  // Get week number for a given index
  const getWeekNumber = (index) => {
    return Math.floor(index / 7) + 1;
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading woff pattern data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/leave-time-master/woff-master")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Woff Pattern" : "Add New Woff Pattern"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update weekoff pattern information"
                : "Create a new weekoff pattern master"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Woff Pattern Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Weekoff Pattern Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Pattern Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekoff Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="WOP_name"
                value={formData.WOP_name}
                onChange={handleInputChange}
                placeholder="e.g., Weekend Pattern, Rotational Shift"
                className={`w-full px-4 py-2.5 border ${
                  errors.WOP_name ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                maxLength="100"
              />
              {errors.WOP_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.WOP_name}
                </p>
              )}
            </div>

            {/* Pattern Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekoff Code
              </label>
              <input
                type="text"
                name="WOP_code"
                value={formData.WOP_code}
                onChange={handleInputChange}
                placeholder="e.g., WP001, ROT001"
                className={`w-full px-4 py-2.5 border ${
                  errors.WOP_code ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                maxLength="50"
              />
              {errors.WOP_code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.WOP_code}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Active"
                    checked={formData.Is_Active == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Active: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="Is_Active"
                    checked={formData.Is_Active == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, Is_Active: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          {/* Pattern Grid Section */}
          <div className="border-t pt-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-900">
                  Weekly Pattern (6 Weeks)
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkFill(0)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkFill(1)}
                  className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Set All as Off
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 bg-gray-50 border">
                      Week
                    </th>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <th
                          key={day}
                          className="px-2 py-2 text-xs font-medium text-gray-700 bg-gray-50 border text-center"
                        >
                          {day}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4, 5].map((week) => (
                    <tr key={week}>
                      <td className="px-2 py-2 text-sm font-medium text-gray-600 bg-gray-50 border text-center">
                        Week {week + 1}
                      </td>
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                        const index = week * 7 + day;
                        const isOff = formData.pattern_data.days[index] == 1;
                        return (
                          <td
                            key={day}
                            className="px-2 py-2 border text-center"
                          >
                            <button
                              type="button"
                              onClick={() => handleDayToggle(index)}
                              className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                                isOff
                                  ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {isOff ? "OFF" : "ON"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Day Off</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-gray-600">Working Day</span>
                </div>
              </div>
              <div className="text-gray-500">
                Total Off Days:{" "}
                {formData.pattern_data.days.filter((d) => d == 1).length}
              </div>
            </div>

            {errors.pattern_data && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.pattern_data}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <span className="text-xs text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </span>
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
                  {isEditMode ? "Update Woff Pattern" : "Create Woff Pattern"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditWoffPattern;
