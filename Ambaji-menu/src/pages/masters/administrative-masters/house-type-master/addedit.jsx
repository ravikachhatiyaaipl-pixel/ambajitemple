import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Home,
  Hash,
  Check,
  AlertCircle,
  Copy,
  IndianRupee,
  Building2,
  Percent,
  Wallet,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { HouseTypeApi } from "../../../services/housetypemasterapi";

const AddEditHouseType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    House_Code: "",
    HOUSTYPE: "",
    Flat_Rate: "",
    Std_Rate: "",
    Eco_Rate: "",
    Mkt_Rate: "",
    Muni_Tax: "",
  });

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadHouseTypeData();
    }
  }, [id]);

  const loadHouseTypeData = async () => {
    setLoading(true);
    try {
      const houseType = await HouseTypeApi.getById(id);

      setFormData({
        House_Code: houseType.House_Code?.toString() || "",
        HOUSTYPE: houseType.HOUSTYPE || "",
        Flat_Rate: houseType.Flat_Rate?.toString() || "",
        Std_Rate: houseType.Std_Rate?.toString() || "",
        Eco_Rate: houseType.Eco_Rate?.toString() || "",
        Mkt_Rate: houseType.Mkt_Rate?.toString() || "",
        Muni_Tax: houseType.Muni_Tax?.toString() || "",
      });
    } catch (error) {
      toast.error("Failed to load house type data!");
      navigate("/masters/administrative-masters/house-type");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Handle numeric fields - allow only digits
    if (
      [
        "House_Code",
        "Flat_Rate",
        "Std_Rate",
        "Eco_Rate",
        "Mkt_Rate",
        "Muni_Tax",
      ].includes(name)
    ) {
      processedValue = value.replace(/[^0-9]/g, "");

      // Max 10 digits for all numeric fields
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

  const generateCodeSuggestions = () => {
    const name = formData.HOUSTYPE.trim();
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

    // HOUSTYPE validation - Required
    if (!formData.HOUSTYPE.trim()) {
      newErrors.HOUSTYPE = "House type name is required";
    } else if (formData.HOUSTYPE.length > 100) {
      newErrors.HOUSTYPE = "House type name must not exceed 100 characters";
    }

    // House_Code validation - Optional, max 10 digits
    if (formData.House_Code && formData.House_Code.length > 10) {
      newErrors.House_Code = "House code must not exceed 10 digits";
    }

    // Flat_Rate validation - Required
    if (!formData.Flat_Rate) {
      newErrors.Flat_Rate = "Flat rate is required";
    } else if (parseInt(formData.Flat_Rate) < 0) {
      newErrors.Flat_Rate = "Flat rate cannot be negative";
    } else if (parseInt(formData.Flat_Rate) > 9999999999) {
      newErrors.Flat_Rate = "Flat rate must not exceed 9,99,99,99,999";
    }

    // Std_Rate validation - Required
    if (!formData.Std_Rate) {
      newErrors.Std_Rate = "Standard rate is required";
    } else if (parseInt(formData.Std_Rate) < 0) {
      newErrors.Std_Rate = "Standard rate cannot be negative";
    } else if (parseInt(formData.Std_Rate) > 9999999999) {
      newErrors.Std_Rate = "Standard rate must not exceed 9,99,99,99,999";
    }

    // Eco_Rate validation - Required
    if (!formData.Eco_Rate) {
      newErrors.Eco_Rate = "Economic rate is required";
    } else if (parseInt(formData.Eco_Rate) < 0) {
      newErrors.Eco_Rate = "Economic rate cannot be negative";
    } else if (parseInt(formData.Eco_Rate) > 9999999999) {
      newErrors.Eco_Rate = "Economic rate must not exceed 9,99,99,99,999";
    }

    // Mkt_Rate validation - Required
    if (!formData.Mkt_Rate) {
      newErrors.Mkt_Rate = "Market rate is required";
    } else if (parseInt(formData.Mkt_Rate) < 0) {
      newErrors.Mkt_Rate = "Market rate cannot be negative";
    } else if (parseInt(formData.Mkt_Rate) > 9999999999) {
      newErrors.Mkt_Rate = "Market rate must not exceed 9,99,99,99,999";
    }

    // Muni_Tax validation - Required
    if (!formData.Muni_Tax) {
      newErrors.Muni_Tax = "Municipal tax is required";
    } else if (parseInt(formData.Muni_Tax) < 0) {
      newErrors.Muni_Tax = "Municipal tax cannot be negative";
    } else if (parseInt(formData.Muni_Tax) > 9999999999) {
      newErrors.Muni_Tax = "Municipal tax must not exceed 9,99,99,99,999";
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
      title: isEditMode ? "Update House Type?" : "Create New House Type?",
      text: isEditMode
        ? "Are you sure you want to update this house type information?"
        : "Are you sure you want to create this new house type?",
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
      const houseTypeData = {
        House_Code: formData.House_Code ? parseInt(formData.House_Code) : null,
        HOUSTYPE: formData.HOUSTYPE.trim(),
        Flat_Rate: parseInt(formData.Flat_Rate),
        Std_Rate: parseInt(formData.Std_Rate),
        Eco_Rate: parseInt(formData.Eco_Rate),
        Mkt_Rate: parseInt(formData.Mkt_Rate),
        Muni_Tax: parseInt(formData.Muni_Tax),
      };

      if (isEditMode) {
        await HouseTypeApi.update(id, houseTypeData);
        toast.success("House type updated successfully!");
      } else {
        await HouseTypeApi.create(houseTypeData);
        toast.success("House type created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/administrative-masters/house-type");
      }, 1500);
    } catch (error) {
      console.error("Error saving house type:", error);

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
            ? "Failed to update house type. Please try again."
            : "Failed to create house type. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/administrative-masters/house-type");
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const suggestions = generateCodeSuggestions();

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN").format(parseInt(value));
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading house type data...</p>
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
              navigate("/masters/administrative-masters/house-type")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit House Type" : "Add New House Type"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update house type master information"
                : "Create a new house type master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Home className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              House Type Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* House Type Name - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  House Type Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.HOUSTYPE.length > 80
                      ? formData.HOUSTYPE.length >= 100
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.HOUSTYPE.length}/100 characters
                </span>
              </div>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="HOUSTYPE"
                  value={formData.HOUSTYPE}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.HOUSTYPE ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Own House, Apartment, Villa"
                  required
                  maxLength={100}
                />
                {formData.HOUSTYPE && !errors.HOUSTYPE && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.HOUSTYPE && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.HOUSTYPE ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HOUSTYPE}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Name of the house type (required, max 100 characters)
                </p>
              )}
            </div>

            {/* House Code - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  House Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.House_Code.length > 8
                        ? formData.House_Code.length >= 10
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.House_Code.length}/10 digits
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
                              House_Code: suggestion.replace(/[^0-9]/g, ""),
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
                  name="House_Code"
                  value={formData.House_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.House_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., 101, 1001 (optional, max 10 digits)"
                  maxLength={10}
                />
                {formData.House_Code && !errors.House_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.House_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.House_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.House_Code)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.House_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.House_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the house type (optional, max 10 digits)
                </p>
              )}
            </div>

            {/* Rate Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flat Rate - Required */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Flat Rate (₹) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.Flat_Rate.length}/10 digits
                  </span>
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Flat_Rate"
                    value={formData.Flat_Rate}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 border ${
                      errors.Flat_Rate ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., 15000"
                    required
                    maxLength={10}
                  />
                  {formData.Flat_Rate && !errors.Flat_Rate && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {errors.Flat_Rate && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.Flat_Rate ? (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Flat_Rate}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Flat rate in rupees{" "}
                    {formData.Flat_Rate &&
                      `(₹${formatCurrency(formData.Flat_Rate)})`}
                  </p>
                )}
              </div>

              {/* Standard Rate - Required */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Standard Rate (₹) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.Std_Rate.length}/10 digits
                  </span>
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Std_Rate"
                    value={formData.Std_Rate}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 border ${
                      errors.Std_Rate ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., 12000"
                    required
                    maxLength={10}
                  />
                  {formData.Std_Rate && !errors.Std_Rate && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {errors.Std_Rate && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.Std_Rate ? (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Std_Rate}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Standard rate in rupees{" "}
                    {formData.Std_Rate &&
                      `(₹${formatCurrency(formData.Std_Rate)})`}
                  </p>
                )}
              </div>

              {/* Economic Rate - Required */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Economic Rate (₹) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.Eco_Rate.length}/10 digits
                  </span>
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Eco_Rate"
                    value={formData.Eco_Rate}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 border ${
                      errors.Eco_Rate ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., 10000"
                    required
                    maxLength={10}
                  />
                  {formData.Eco_Rate && !errors.Eco_Rate && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {errors.Eco_Rate && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.Eco_Rate ? (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Eco_Rate}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Economic rate in rupees{" "}
                    {formData.Eco_Rate &&
                      `(₹${formatCurrency(formData.Eco_Rate)})`}
                  </p>
                )}
              </div>

              {/* Market Rate - Required */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Market Rate (₹) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.Mkt_Rate.length}/10 digits
                  </span>
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="Mkt_Rate"
                    value={formData.Mkt_Rate}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 border ${
                      errors.Mkt_Rate ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., 18000"
                    required
                    maxLength={10}
                  />
                  {formData.Mkt_Rate && !errors.Mkt_Rate && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {errors.Mkt_Rate && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.Mkt_Rate ? (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Mkt_Rate}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Market rate in rupees{" "}
                    {formData.Mkt_Rate &&
                      `(₹${formatCurrency(formData.Mkt_Rate)})`}
                  </p>
                )}
              </div>
            </div>

            {/* Municipal Tax - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Municipal Tax (₹) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {formData.Muni_Tax.length}/10 digits
                </span>
              </div>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Muni_Tax"
                  value={formData.Muni_Tax}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Muni_Tax ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., 2500"
                  required
                  maxLength={10}
                />
                {formData.Muni_Tax && !errors.Muni_Tax && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Muni_Tax && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Muni_Tax ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Muni_Tax}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Municipal tax in rupees{" "}
                  {formData.Muni_Tax &&
                    `(₹${formatCurrency(formData.Muni_Tax)})`}
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
                  {isEditMode ? "Update House Type" : "Create House Type"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditHouseType;
