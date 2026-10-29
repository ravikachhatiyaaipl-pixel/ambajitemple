import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Building2,
  Hash,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BanksApi } from "../../../services/banksapi";

const AddEditBanks = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state - matches API payload
  const [formData, setFormData] = useState({
    bank_code: "",
    bank_name: "",
    short_name: "",
    ifsc_prefix: "",
    is_active: true,
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadBankData();
    }
  }, [id]);

  const loadBankData = async () => {
    setLoading(true);
    try {
      const bank = await BanksApi.getById(id);
      setFormData({
        bank_code: bank.bank_code || "",
        bank_name: bank.bank_name || "",
        short_name: bank.short_name || "",
        ifsc_prefix: bank.ifsc_prefix || "",
        is_active: bank.is_active != undefined ? bank.is_active : true,
      });
    } catch (error) {
      console.error("Error loading bank:", error);
      toast.error("Failed to load bank data!");
      navigate("/masters/financial-accounting/banks");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Auto uppercase for bank_code and ifsc_prefix
    if (name == "bank_code" || name == "ifsc_prefix") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Generate code suggestions based on bank name
  const generateCodeSuggestions = () => {
    const name = formData.bank_name.trim();
    if (!name) return [];

    const suggestions = [];
    const words = name.split(" ").filter((word) => word.length > 0);

    // Take first 3-4 letters of first word
    if (words[0] && words[0].length >= 3) {
      suggestions.push(words[0].substring(0, 3).toUpperCase());
      if (words[0].length >= 4) {
        suggestions.push(words[0].substring(0, 4).toUpperCase());
      }
    }

    // First letters of each word
    if (words.length >= 2) {
      const firstLetters = words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase();
      suggestions.push(firstLetters);
    }

    // Add number suffix
    if (suggestions.length > 0) {
      suggestions.push(suggestions[0] + "001");
    }

    return [...new Set(suggestions)];
  };

  // Generate IFSC prefix suggestions
  const generateIfscSuggestions = () => {
    const name = formData.bank_name.trim();
    const shortName = formData.short_name.trim();

    const suggestions = [];

    if (shortName) {
      suggestions.push(shortName.toUpperCase().substring(0, 4));
    }

    if (name) {
      const words = name.split(" ").filter((w) => w.length > 0);
      if (words.length >= 2) {
        const firstLetters = words
          .map((w) => w.charAt(0))
          .join("")
          .toUpperCase();
        suggestions.push(firstLetters.substring(0, 4));
      }

      if (words[0] && words[0].length >= 3) {
        suggestions.push(words[0].substring(0, 4).toUpperCase());
      }
    }

    return [...new Set(suggestions)];
  };

  const validateForm = () => {
    const newErrors = {};

    // bank_code validation - required, max 20
    if (!formData.bank_code.trim()) {
      newErrors.bank_code = "Bank code is required";
    } else if (formData.bank_code.length > 20) {
      newErrors.bank_code = "Bank code must not exceed 20 characters";
    } else if (!/^[A-Z0-9]+$/.test(formData.bank_code)) {
      newErrors.bank_code =
        "Bank code must contain only uppercase letters and numbers";
    }

    // bank_name validation - required, max 100
    if (!formData.bank_name.trim()) {
      newErrors.bank_name = "Bank name is required";
    } else if (formData.bank_name.length > 100) {
      newErrors.bank_name = "Bank name must not exceed 100 characters";
    }

    // short_name validation - optional, max 20
    if (formData.short_name && formData.short_name.length > 20) {
      newErrors.short_name = "Short name must not exceed 20 characters";
    }

    // ifsc_prefix validation - optional, max 10
    if (formData.ifsc_prefix && formData.ifsc_prefix.length > 10) {
      newErrors.ifsc_prefix = "IFSC prefix must not exceed 10 characters";
    } else if (
      formData.ifsc_prefix &&
      !/^[A-Z0-9]+$/.test(formData.ifsc_prefix)
    ) {
      newErrors.ifsc_prefix =
        "IFSC prefix must contain only uppercase letters and numbers";
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
      title: isEditMode ? "Update Bank?" : "Create New Bank?",
      text: isEditMode
        ? "Are you sure you want to update this bank information?"
        : "Are you sure you want to create this new bank?",
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
      const bankData = {
        bank_code: formData.bank_code.trim().toUpperCase(),
        bank_name: formData.bank_name.trim(),
        short_name: formData.short_name.trim() || null,
        ifsc_prefix: formData.ifsc_prefix.trim().toUpperCase() || null,
        is_active: formData.is_active,
      };

      if (isEditMode) {
        await BanksApi.update(id, bankData);
        toast.success("Bank updated successfully!");
      } else {
        await BanksApi.create(bankData);
        toast.success("Bank created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/banks");
      }, 1500);
    } catch (error) {
      console.error("Error saving bank:", error);

      // Handle backend validation errors
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};

        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            (isEditMode
              ? "Failed to update bank. Please try again."
              : "Failed to create bank. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/banks");
  };

  const codeSuggestions = generateCodeSuggestions();
  const ifscSuggestions = generateIfscSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading bank data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/financial-accounting/banks")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Bank" : "Add New Bank"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update bank master information"
                : "Create a new bank master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Bank Code - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Bank Code <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.bank_code.length > 16
                        ? formData.bank_code.length >= 20
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.bank_code.length}/20 characters
                  </span>
                  {codeSuggestions.length > 0 && !isEditMode && (
                    <div className="text-xs text-gray-500">
                      Suggestions:{" "}
                      {codeSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              bank_code: suggestion,
                            }));
                          }}
                          className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
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
                  name="bank_code"
                  value={formData.bank_code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.bank_code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                  placeholder="e.g., SBI001, HDFC002"
                  maxLength={20}
                />
              </div>
              {errors.bank_code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.bank_code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the bank (e.g., SBI001, HDFC002)
                </p>
              )}
            </div>

            {/* Bank Name - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.bank_name.length > 80
                      ? formData.bank_name.length >= 100
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.bank_name.length}/100 characters
                </span>
              </div>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.bank_name ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="e.g., State Bank of India, HDFC Bank"
                maxLength={100}
              />
              {errors.bank_name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.bank_name}
                </p>
              ) : null}
            </div>

            {/* Short Name - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Short Name{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.short_name.length > 16
                      ? formData.short_name.length >= 20
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.short_name.length}/20 characters
                </span>
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.short_name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., SBI, HDFC, ICICI"
                  maxLength={20}
                />
              </div>
              {errors.short_name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.short_name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Short name or abbreviation for the bank
                </p>
              )}
            </div>

            {/* IFSC Prefix - Optional with Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  IFSC Prefix{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.ifsc_prefix.length > 8
                        ? formData.ifsc_prefix.length >= 10
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.ifsc_prefix.length}/10 characters
                  </span>
                  {ifscSuggestions.length > 0 && !isEditMode && (
                    <div className="text-xs text-gray-500">
                      Suggestions:{" "}
                      {ifscSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              ifsc_prefix: suggestion,
                            }));
                          }}
                          className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="ifsc_prefix"
                  value={formData.ifsc_prefix}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.ifsc_prefix ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                  placeholder="e.g., SBIN, HDFC, ICIC"
                  maxLength={10}
                />
              </div>
              {errors.ifsc_prefix ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.ifsc_prefix}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  First 4 characters of IFSC code (e.g., SBIN for SBI)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bank Status
              </h3>
              <p className="text-sm text-gray-600">
                Activate or deactivate this bank
              </p>
            </div>
            <div className="flex">
              <label className="flex cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`block w-14 h-8 rounded-full ${
                      formData.is_active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      formData.is_active ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  {formData.is_active ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-2" />
                      Inactive
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Bank code and IFSC prefix are automatically converted to uppercase
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
                  {isEditMode ? "Update Bank" : "Create Bank"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditBanks;
