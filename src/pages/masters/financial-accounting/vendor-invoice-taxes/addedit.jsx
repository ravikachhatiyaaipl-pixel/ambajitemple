import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Percent,
  Hash,
  Check,
  AlertCircle,
  Copy,
  Info,
  Calculator,
  BookOpen,
  ChevronDown,
  Search,
  ChevronUp,
  Globe,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { VendorInvoiceTaxesApi } from "../../../services/vendorinvoicetaxesapi";

const AddEditVendorInvoiceTaxes = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [ledgers, setLedgers] = useState([]);
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [loadingLedgers, setLoadingLedgers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Form state - updated to match API field names
  const [formData, setFormData] = useState({
    IC_Code: "",
    IC_Name: "",
    Percentage: "",
    Lg_Id: "",
  });

  useEffect(() => {
    loadLedgers();
    if (id && id != "create") {
      setIsEditMode(true);
      loadTaxTypeData();
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  const loadLedgers = async () => {
    setLoadingLedgers(true);
    try {
      const data = await VendorInvoiceTaxesApi.getLedgers();
      // Sort ledgers by code for better UX
      const sortedLedgers = (data || []).sort((a, b) => {
        return a.Lg_Code?.localeCompare(b.Lg_Code) || 0;
      });
      setLedgers(sortedLedgers);
      setFilteredLedgers(sortedLedgers);
    } catch (error) {
      toast.error("Failed to load ledgers!");
      console.error(error);
    } finally {
      setLoadingLedgers(false);
    }
  };

  const loadTaxTypeData = async () => {
    setLoading(true);
    try {
      const taxType = await VendorInvoiceTaxesApi.getById(id);

      setFormData({
        IC_Code: taxType.IC_Code || "",
        IC_Name: taxType.IC_Name || "",
        Percentage: taxType.Percentage || "",
        Lg_Id: taxType.Lg_Id ? taxType.Lg_Id.toString() : "",
      });
    } catch (error) {
      toast.error("Failed to load tax type data!");
      navigate("/masters/financial-accounting/vendor-invoice-taxes");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value.trim() == "") {
      setFilteredLedgers(ledgers);
    } else {
      const filtered = ledgers.filter(
        (ledger) =>
          ledger.Lg_Code?.toLowerCase().includes(value) ||
          ledger.Lg_Name?.toLowerCase().includes(value) ||
          ledger.Lg_Eng_Name?.toLowerCase().includes(value) ||
          `${ledger.Lg_Code} - ${ledger.Lg_Name}`.toLowerCase().includes(value),
      );
      setFilteredLedgers(filtered);
    }
  };

  const handleLedgerSelect = (ledgerId) => {
    setFormData((prev) => ({
      ...prev,
      Lg_Id: ledgerId.toString(),
    }));
    setIsDropdownOpen(false);
    setSearchTerm("");
    setFilteredLedgers(ledgers);

    if (errors.Lg_Id) {
      setErrors((prev) => ({ ...prev, Lg_Id: "" }));
    }
  };

  const getSelectedLedgerName = () => {
    if (!formData.Lg_Id) return "";
    const selectedLedger = ledgers.find(
      (ledger) => ledger.Lg_Id == parseInt(formData.Lg_Id),
    );
    if (!selectedLedger) return "";

    let displayName = `${selectedLedger.Lg_Code} - ${selectedLedger.Lg_Name}`;
    if (selectedLedger.Lg_Eng_Name) {
      displayName += ` (${selectedLedger.Lg_Eng_Name})`;
    }
    return displayName;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For IC_Code - auto uppercase
    if (name == "IC_Code") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    }
    // For Percentage - validate number with max 100
    else if (name == "Percentage") {
      // Allow empty string, numbers, and one decimal point
      const regex = /^\d*\.?\d{0,2}$/;
      if (value == "" || regex.test(value)) {
        // Ensure value doesn't exceed 100
        if (value != "" && parseFloat(value) > 100) {
          setFormData((prev) => ({
            ...prev,
            [name]: "100",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Generate code suggestions based on name
  const generateCodeSuggestions = () => {
    const name = formData.IC_Name.trim();
    if (!name) return [];

    const suggestions = [];

    // Take first letter of each word
    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 2) {
        suggestions.push(word.substring(0, 2).toUpperCase());
      }
      if (word.length >= 3) {
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
    } else if (words.length >= 2) {
      // First letter of each word
      const firstLetters = words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase();
      suggestions.push(firstLetters);

      // First two letters of first word + first letter of second
      if (words[0].length >= 2) {
        suggestions.push(
          (words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase(),
        );
      }
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    // IC_Name validation - required, max 100
    if (!formData.IC_Name.trim()) {
      newErrors.IC_Name = "Tax name is required";
    } else if (formData.IC_Name.length > 100) {
      newErrors.IC_Name = "Tax name must not exceed 100 characters";
    }

    // IC_Code validation - optional, max 20
    if (formData.IC_Code && formData.IC_Code.length > 20) {
      newErrors.IC_Code = "Tax code must not exceed 20 characters";
    }

    // Percentage validation - optional, numeric, 0-100
    if (formData.Percentage && formData.Percentage.trim() != "") {
      const perc = parseFloat(formData.Percentage);
      if (isNaN(perc)) {
        newErrors.Percentage = "Percentage must be a valid number";
      } else if (perc < 0 || perc > 100) {
        newErrors.Percentage = "Percentage must be between 0 and 100";
      }
    }

    // Lg_Id validation - required
    if (!formData.Lg_Id) {
      newErrors.Lg_Id = "Ledger is required";
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
      title: isEditMode ? "Update Tax Type?" : "Create New Tax Type?",
      text: isEditMode
        ? "Are you sure you want to update this tax type information?"
        : "Are you sure you want to create this new tax type?",
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
      const taxTypeData = {
        IC_Code: formData.IC_Code.trim().toUpperCase() || null,
        IC_Name: formData.IC_Name.trim(),
        Percentage:
          formData.Percentage && formData.Percentage.trim() != ""
            ? parseFloat(formData.Percentage)
            : null,
        Lg_Id: parseInt(formData.Lg_Id),
      };

      let response;
      if (isEditMode) {
        response = await VendorInvoiceTaxesApi.update(id, taxTypeData);
        toast.success("Tax type updated successfully!");
      } else {
        response = await VendorInvoiceTaxesApi.create(taxTypeData);
        toast.success("Tax type created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/vendor-invoice-taxes");
      }, 1500);
    } catch (error) {
      console.error("Error saving tax type:", error);

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
              ? "Failed to update tax type. Please try again."
              : "Failed to create tax type. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/vendor-invoice-taxes");
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const suggestions = generateCodeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tax type data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - No pageTitle from menu details */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/financial-accounting/vendor-invoice-taxes")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Tax Type" : "Add New Tax Type"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update tax type master information"
                : "Create a new tax type master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
              <Percent className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tax Type Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Ledger Dropdown with Search - Required */}
            <div ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ledger <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingLedgers ? (
                  <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading ledgers...</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.Lg_Id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.Lg_Id ? (
                        <span className="text-gray-900">
                          {getSelectedLedgerName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">Select a Ledger</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
                {errors.Lg_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}

                {/* Dropdown Menu */}
                {isDropdownOpen && !loadingLedgers && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          placeholder="Search by code, name, or English name..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Ledger List */}
                    <div className="overflow-y-auto max-h-64">
                      {filteredLedgers.length > 0 ? (
                        filteredLedgers.map((ledger) => (
                          <button
                            key={ledger.Lg_Id}
                            type="button"
                            onClick={() => handleLedgerSelect(ledger.Lg_Id)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 ${
                              formData.Lg_Id == ledger.Lg_Id.toString()
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded mr-2 text-xs">
                                    {ledger.Lg_Code}
                                  </span>
                                  {ledger.Lg_Name}
                                </div>
                                {ledger.Lg_Eng_Name && (
                                  <div className="text-xs text-gray-500 mt-1 flex items-center">
                                    <Globe className="h-3 w-3 mr-1" />
                                    {ledger.Lg_Eng_Name}
                                  </div>
                                )}
                              </div>
                            </div>
                            {formData.Lg_Id == ledger.Lg_Id.toString() && (
                              <div className="text-xs text-green-600 mt-1 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p>No ledgers found</p>
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{filteredLedgers.length} ledgers found</span>
                        <span>Total: {ledgers.length} ledgers</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {errors.Lg_Id ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Id}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select the associated ledger account for this tax type
                  (required)
                </p>
              )}
            </div>

            {/* IC_Name - Required with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Tax Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.IC_Name.length > 80
                      ? formData.IC_Name.length >= 100
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.IC_Name.length}/100 characters
                </span>
              </div>
              <div className="relative">
                <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="IC_Name"
                  value={formData.IC_Name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.IC_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Goods and Services Tax, Value Added Tax"
                  required
                  maxLength={100}
                />
                {formData.IC_Name && !errors.IC_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.IC_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.IC_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.IC_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Name of the tax type (required, max 100 characters)
                </p>
              )}
            </div>

            {/* IC_Code - Optional with Character Counter and Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Tax Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.IC_Code.length > 15
                        ? formData.IC_Code.length >= 20
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.IC_Code.length}/20 characters
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
                              IC_Code: suggestion,
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
                  name="IC_Code"
                  value={formData.IC_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.IC_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                  placeholder="e.g., GST, VAT, IGST (optional)"
                  maxLength={20}
                />
                {formData.IC_Code && !errors.IC_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.IC_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.IC_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.IC_Code)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.IC_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.IC_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the tax type (optional, max 20 characters)
                </p>
              )}
            </div>

            {/* Percentage - Optional with validation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Percentage (%){" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Percentage"
                  value={formData.Percentage}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Percentage ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., 18.00, 5.00 (optional)"
                />
                {formData.Percentage && !errors.Percentage && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Percentage && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Percentage ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Percentage}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Tax percentage rate (optional, 0-100, up to 2 decimal places)
                </p>
              )}
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
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Tax Type" : "Create Tax Type"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditVendorInvoiceTaxes;
