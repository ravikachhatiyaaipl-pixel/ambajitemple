import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  Hash,
  Check,
  AlertCircle,
  Copy,
  Info,
  CalendarDays,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { HolidayApi } from "../../../services/holidaymasterapi";

const AddEditHoliday = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");

  const [formData, setFormData] = useState({
    HL_Code: "",
    HL_Name: "",
    CI_Year: new Date().getFullYear().toString(),
    HL_Date: "",
    HL_Type: "National",
    HL_Cate: "Gazetted",
    HL_ISPaid: "Yes",
    HL_ISOptional: "No",
    HL_ISCmpnst: "No",
    HL_AttnImpact: "Full Day",
    HL_PayImpact: "Full Day",
    HL_OTAllowed: "No",
    HL_Status: true,
    Remarks: "",
  });

  // Options for dropdowns
  const holidayTypes = [
    "National",
    "Regional",
    "Restricted",
    "Bank Holiday",
    "Other",
  ];
  const holidayCategories = [
    "Gazetted",
    "Non-Gazetted",
    "Optional",
    "Compensatory",
    "Other",
  ];
  const yesNoOptions = ["Yes", "No"];
  const impactOptions = ["Full Day", "Half Day", "No Impact"];

  // Update date constraints when year changes
  useEffect(() => {
    if (formData.CI_Year) {
      const year = parseInt(formData.CI_Year);
      if (!isNaN(year)) {
        // Set min and max dates for the selected year
        setMinDate(`${year}-01-01`);
        setMaxDate(`${year}-12-31`);

        if (!isEditMode && !formData.HL_Date) {
          const today = new Date();
          const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
          const currentDay = String(today.getDate()).padStart(2, "0");

          const suggestedDate = `${year}-${currentMonth}-${currentDay}`;

          // Check if the date is valid
          const testDate = new Date(suggestedDate);
          if (
            !isNaN(testDate.getTime()) &&
            testDate.getFullYear() == year &&
            testDate.getMonth() + 1 == parseInt(currentMonth) &&
            testDate.getDate() == parseInt(currentDay)
          ) {
            setFormData((prev) => ({ ...prev, HL_Date: suggestedDate }));
          } else {
            // If invalid (like Feb 29 in non-leap year), set to first of month
            const fallbackDate = `${year}-${currentMonth}-01`;
            setFormData((prev) => ({ ...prev, HL_Date: fallbackDate }));
          }
        }
        // If there's an existing date, validate it
        else if (formData.HL_Date) {
          const selectedDate = new Date(formData.HL_Date);
          const selectedYear = selectedDate.getFullYear();

          // If year doesn't match, adjust the date to same month/day in new year
          if (selectedYear != year) {
            const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const day = String(selectedDate.getDate()).padStart(2, "0");

            const adjustedDate = `${year}-${month}-${day}`;
            const testDate = new Date(adjustedDate);

            // Check if the adjusted date is valid
            if (
              !isNaN(testDate.getTime()) &&
              testDate.getFullYear() == year &&
              testDate.getMonth() + 1 == parseInt(month) &&
              testDate.getDate() == parseInt(day)
            ) {
              setFormData((prev) => ({ ...prev, HL_Date: adjustedDate }));
            } else {
              // If invalid (like Feb 29), set to Feb 28
              if (month == "02" && day == "29") {
                setFormData((prev) => ({ ...prev, HL_Date: `${year}-02-28` }));
              } else {
                // Otherwise set to first of month
                setFormData((prev) => ({
                  ...prev,
                  HL_Date: `${year}-${month}-01`,
                }));
              }
            }
          }
        }
      }
    }
  }, [formData.CI_Year, isEditMode]);

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadHolidayData();
    }
  }, [id]);

  const loadHolidayData = async () => {
    setLoading(true);
    try {
      const holiday = await HolidayApi.getById(id);

      setFormData({
        HL_Code: holiday.HL_Code || "",
        HL_Name: holiday.HL_Name || "",
        CI_Year:
          holiday.CI_Year?.toString() || new Date().getFullYear().toString(),
        HL_Date: holiday.HL_Date || "",
        HL_Type: holiday.HL_Type || "National",
        HL_Cate: holiday.HL_Cate || "Gazetted",
        HL_ISPaid: holiday.HL_ISPaid || "Yes",
        HL_ISOptional: holiday.HL_ISOptional || "No",
        HL_ISCmpnst: holiday.HL_ISCmpnst || "No",
        HL_AttnImpact: holiday.HL_AttnImpact || "Full Day",
        HL_PayImpact: holiday.HL_PayImpact || "Full Day",
        HL_OTAllowed: holiday.HL_OTAllowed || "No",
        HL_Status: holiday.HL_Status == true || holiday.HL_Status == 1,
        Remarks: holiday.Remarks || "",
      });
    } catch (error) {
      toast.error("Failed to load holiday data!");
      navigate("/masters/leave-time-master/holidaymaster");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    if (name == "HL_Code") {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    if (name == "CI_Year") {
      processedValue = value.replace(/[^0-9]/g, "").substring(0, 4);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Generate code suggestions based on name
  const generateCodeSuggestions = () => {
    const name = formData.HL_Name.trim();
    if (!name) return [];

    const suggestions = [];
    const year = formData.CI_Year || new Date().getFullYear();

    // Take first letter of each word
    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 2) {
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
      // Add with year
      suggestions.push(word.substring(0, 3).toUpperCase() + year.slice(-2));
    } else if (words.length >= 2) {
      // First letter of each word
      const firstLetters = words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase();
      suggestions.push(firstLetters);
      suggestions.push(firstLetters + year.slice(-2));
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    // HL_Name validation - required
    if (!formData.HL_Name.trim()) {
      newErrors.HL_Name = "Holiday name is required";
    } else if (formData.HL_Name.length > 255) {
      newErrors.HL_Name = "Holiday name must not exceed 255 characters";
    }

    // HL_Code validation - optional
    if (formData.HL_Code && formData.HL_Code.length > 255) {
      newErrors.HL_Code = "Holiday code must not exceed 255 characters";
    }

    // CI_Year validation - required
    if (!formData.CI_Year) {
      newErrors.CI_Year = "Year is required";
    } else {
      const year = parseInt(formData.CI_Year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 5) {
        newErrors.CI_Year = `Year must be between 1900 and ${currentYear + 5}`;
      }
    }

    // HL_Date validation
    if (!formData.HL_Date) {
      newErrors.HL_Date = "Holiday date is required";
    } else {
      // Validate that the date falls within the selected year
      const selectedDate = new Date(formData.HL_Date);
      const selectedYear = selectedDate.getFullYear();
      const expectedYear = parseInt(formData.CI_Year);

      if (!isNaN(expectedYear) && selectedYear != expectedYear) {
        newErrors.HL_Date = `Holiday date must be in the year ${expectedYear}`;
      }
    }

    // HL_Type validation
    if (!formData.HL_Type) {
      newErrors.HL_Type = "Holiday type is required";
    }

    // HL_Cate validation
    if (!formData.HL_Cate) {
      newErrors.HL_Cate = "Holiday category is required";
    }

    // HL_ISPaid validation
    if (!formData.HL_ISPaid) {
      newErrors.HL_ISPaid = "Paid holiday status is required";
    }

    // HL_ISOptional validation
    if (!formData.HL_ISOptional) {
      newErrors.HL_ISOptional = "Optional holiday status is required";
    }

    // HL_ISCmpnst validation
    if (!formData.HL_ISCmpnst) {
      newErrors.HL_ISCmpnst = "Compensatory status is required";
    }

    // HL_AttnImpact validation
    if (!formData.HL_AttnImpact) {
      newErrors.HL_AttnImpact = "Attendance impact is required";
    }

    // HL_PayImpact validation
    if (!formData.HL_PayImpact) {
      newErrors.HL_PayImpact = "Pay impact is required";
    }

    // HL_OTAllowed validation
    if (!formData.HL_OTAllowed) {
      newErrors.HL_OTAllowed = "OT allowed status is required";
    }

    // Remarks validation - optional
    if (formData.Remarks && formData.Remarks.length > 255) {
      newErrors.Remarks = "Remarks must not exceed 255 characters";
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
      title: isEditMode ? "Update Holiday?" : "Create New Holiday?",
      text: isEditMode
        ? "Are you sure you want to update this holiday information?"
        : "Are you sure you want to create this new holiday?",
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
      const holidayData = {
        HL_Code: formData.HL_Code.trim() || null,
        HL_Name: formData.HL_Name.trim(),
        CI_Year: formData.CI_Year,
        HL_Date: formData.HL_Date,
        HL_Type: formData.HL_Type,
        HL_Cate: formData.HL_Cate,
        HL_ISPaid: formData.HL_ISPaid,
        HL_ISOptional: formData.HL_ISOptional,
        HL_ISCmpnst: formData.HL_ISCmpnst,
        HL_AttnImpact: formData.HL_AttnImpact,
        HL_PayImpact: formData.HL_PayImpact,
        HL_OTAllowed: formData.HL_OTAllowed,
        HL_Status: formData.HL_Status ? 1 : 0,
        Remarks: formData.Remarks.trim() || null,
      };

      if (isEditMode) {
        await HolidayApi.update(id, holidayData);
        toast.success("Holiday updated successfully!");
      } else {
        await HolidayApi.create(holidayData);
        toast.success("Holiday created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/leave-time-master/holidaymaster");
      }, 1500);
    } catch (error) {
      console.error("Error saving holiday:", error);

      // Handle backend validation errors
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
            ? "Failed to update holiday. Please try again."
            : "Failed to create holiday. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/leave-time-master/holidaymaster");
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading holiday data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/leave-time-master/holidaymaster")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Holiday" : "Add New Holiday"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update holiday master information"
                : "Create a new holiday master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Holiday Name - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Holiday Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.HL_Name.length > 200
                      ? formData.HL_Name.length >= 255
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.HL_Name.length}/255 characters
                </span>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="HL_Name"
                  value={formData.HL_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.HL_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., Independence Day, Republic Day"
                  required
                  maxLength={255}
                />
                {formData.HL_Name && !errors.HL_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.HL_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.HL_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Name of the holiday (required, max 255 characters)
                </p>
              )}
            </div>

            {/* Holiday Code - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Holiday Code
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.HL_Code.length > 200
                        ? formData.HL_Code.length >= 255
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.HL_Code.length}/255 characters
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
                              HL_Code: suggestion,
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
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="HL_Code"
                  value={formData.HL_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.HL_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase`}
                  placeholder="e.g., INDEP001, REPUBLIC24"
                  maxLength={255}
                />
                {formData.HL_Code && !errors.HL_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.HL_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.HL_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.HL_Code)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.HL_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the holiday (optional, max 255 characters)
                </p>
              )}
            </div>

            {/* Year - Input field instead of dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Year <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="CI_Year"
                  value={formData.CI_Year}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.CI_Year ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 2024"
                  required
                  maxLength={4}
                />
                {formData.CI_Year && !errors.CI_Year && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.CI_Year && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.CI_Year ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.CI_Year}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Year of the holiday (required, 4 digits)
                </p>
              )}
            </div>

            {/* Holiday Date - Dynamic based on selected year */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Holiday Date <span className="text-red-500">*</span>
                </label>
                {formData.CI_Year && (
                  <span className="text-xs text-purple-600">
                    {formData.CI_Year} only
                  </span>
                )}
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="HL_Date"
                  value={formData.HL_Date}
                  onChange={handleInputChange}
                  min={minDate}
                  max={maxDate}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.HL_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  required
                  disabled={!formData.CI_Year}
                />
                {formData.HL_Date && !errors.HL_Date && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.HL_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.HL_Date ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_Date}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.CI_Year
                    ? `Date auto-suggested based on today's date (${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })})`
                    : "Enter a year first"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rest of the form remains the same... */}
        {/* Holiday Type and Category */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Holiday Type & Category
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Holiday Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Type <span className="text-red-500">*</span>
              </label>
              <select
                name="HL_Type"
                value={formData.HL_Type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border ${
                  errors.HL_Type ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                required
              >
                {holidayTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.HL_Type && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_Type}
                </p>
              )}
            </div>

            {/* Holiday Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Category <span className="text-red-500">*</span>
              </label>
              <select
                name="HL_Cate"
                value={formData.HL_Cate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border ${
                  errors.HL_Cate ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                required
              >
                {holidayCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.HL_Cate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_Cate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Holiday Attributes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Holiday Attributes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Paid Holiday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid Holiday <span className="text-red-500">*</span>
              </label>
              <select
                name="HL_ISPaid"
                value={formData.HL_ISPaid}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border ${
                  errors.HL_ISPaid ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                required
              >
                {yesNoOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.HL_ISPaid && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_ISPaid}
                </p>
              )}
            </div>

            {/* Optional Holiday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Optional Holiday <span className="text-red-500">*</span>
              </label>
              <select
                name="HL_ISOptional"
                value={formData.HL_ISOptional}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border ${
                  errors.HL_ISOptional ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                required
              >
                {yesNoOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.HL_ISOptional && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_ISOptional}
                </p>
              )}
            </div>

            {/* Compensatory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compensatory <span className="text-red-500">*</span>
              </label>
              <select
                name="HL_ISCmpnst"
                value={formData.HL_ISCmpnst}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border ${
                  errors.HL_ISCmpnst ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                required
              >
                {yesNoOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.HL_ISCmpnst && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_ISCmpnst}
                </p>
              )}
            </div>

            {/* Attendance Impact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendance Impact <span className="text-red-500">*</span>
              </label>
              <select
                name="HL_AttnImpact"
                value={formData.HL_AttnImpact}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border ${
                  errors.HL_AttnImpact ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                required
              >
                {impactOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.HL_AttnImpact && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_AttnImpact}
                </p>
              )}
            </div>

            {/* Pay Impact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Impact <span className="text-red-500">*</span>
              </label>
              <select
                name="HL_PayImpact"
                value={formData.HL_PayImpact}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border ${
                  errors.HL_PayImpact ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                required
              >
                {impactOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.HL_PayImpact && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_PayImpact}
                </p>
              )}
            </div>

            {/* OT Allowed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OT Allowed <span className="text-red-500">*</span>
              </label>
              <select
                name="HL_OTAllowed"
                value={formData.HL_OTAllowed}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border ${
                  errors.HL_OTAllowed ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                required
              >
                {yesNoOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.HL_OTAllowed && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_OTAllowed}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status and Remarks */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="HL_Status"
                    value="true"
                    checked={formData.HL_Status == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, HL_Status: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="HL_Status"
                    value="false"
                    checked={formData.HL_Status == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, HL_Status: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <span
                  className={`text-xs ${
                    formData.Remarks.length > 200
                      ? formData.Remarks.length >= 255
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Remarks.length}/255 characters
                </span>
              </div>
              <textarea
                name="Remarks"
                value={formData.Remarks}
                onChange={handleInputChange}
                rows="3"
                className={`w-full px-3 py-2.5 border ${
                  errors.Remarks ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="Enter any additional notes or remarks..."
                maxLength={255}
              ></textarea>
              {errors.Remarks && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Remarks}
                </p>
              )}
            </div>
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
                  {isEditMode ? "Update Holiday" : "Create Holiday"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditHoliday;
