import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Hash,
  Check,
  AlertCircle,
  Copy,
  DollarSign,
  Building,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { PayLevelApi } from "../../../services/paylevelmasterapi";
import axios from "axios";

const AddEditPayLevel = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Dropdown data states
  const [payCommissions, setPayCommissions] = useState([]);
  const [empGrades, setEmpGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const [formData, setFormData] = useState({
    PC_id: "",
    EGM_id: "",
    PL_Code: "",
    St_Basic: "",
  });

  // Load dropdown data on mount
  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadPayLevelData();
    }
  }, [id]);

  // Filter grades based on selected commission
  useEffect(() => {
    if (formData.PC_id) {
      const filtered = empGrades.filter(
        (grade) => grade.PB_ID?.toString() == formData.PC_id,
      );
      setFilteredGrades(filtered);
    } else {
      setFilteredGrades([]);
    }
  }, [empGrades, formData.PC_id]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [commissions, grades] = await Promise.all([
        PayLevelApi.getPayCommissions(),
        axios.get(`${import.meta.env.VITE_API_URL}/emp-grade/all`,
           {
                  headers: {
                                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
                  }
             }
        ),
      ]);
      setPayCommissions(commissions);
      setEmpGrades(grades.data.data || []);
    } catch (error) {
      toast.error("Failed to load dropdown data!");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadPayLevelData = async () => {
    setLoading(true);
    try {
      const payLevel = await PayLevelApi.getById(id);

      setFormData({
        PC_id: payLevel.PC_id?.toString() || "",
        EGM_id: payLevel.EGM_id?.toString() || "",
        PL_Code: payLevel.PL_Code || "",
        St_Basic: payLevel.St_Basic?.toString() || "",
      });
    } catch (error) {
      toast.error("Failed to load pay level data!");
      navigate("/masters/payroll-pay-structures/pay-level");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name == "PL_Code") {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }
    if (name == "St_Basic") {
      processedValue = value.replace(/[^0-9.]/g, "");
      const decimalParts = processedValue.split(".");
      if (decimalParts.length > 2) {
        processedValue = decimalParts[0] + "." + decimalParts.slice(1).join("");
      }
      if (decimalParts[1] && decimalParts[1].length > 2) {
        processedValue =
          decimalParts[0] + "." + decimalParts[1].substring(0, 2);
      }
    }

    // Reset grade when commission changes
    if (name == "PC_id") {
      setFormData((prev) => ({
        ...prev,
        PC_id: processedValue,
        EGM_id: "", // Reset grade selection
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generateCodeSuggestions = () => {
    const selectedCommission = payCommissions.find(
      (c) => c.PC_Id?.toString() == formData.PC_id,
    );

    if (!selectedCommission) return [];

    const suggestions = [];
    const commissionName = selectedCommission.PC_Name;

    const words = commissionName.split(" ").filter((word) => word.length > 0);

    if (words.length >= 1) {
      const firstLetters = words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase();
      suggestions.push(firstLetters + "001");
      suggestions.push(firstLetters + "L01");

      if (words[0].length >= 2) {
        suggestions.push(words[0].substring(0, 2).toUpperCase() + "001");
      }
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.PC_id) {
      newErrors.PC_id = "Pay commission is required";
    }

    if (!formData.EGM_id) {
      newErrors.EGM_id = "Pay grade is required";
    }

    if (!formData.PL_Code.trim()) {
      newErrors.PL_Code = "Pay level code is required";
    } else if (formData.PL_Code.length > 10) {
      newErrors.PL_Code = "Pay level code must not exceed 10 characters";
    }

    if (!formData.St_Basic.trim()) {
      newErrors.St_Basic = "Starting basic pay is required";
    } else {
      const basicValue = parseFloat(formData.St_Basic);
      if (isNaN(basicValue)) {
        newErrors.St_Basic = "Starting basic must be a valid number";
      } else if (basicValue < 0) {
        newErrors.St_Basic = "Starting basic cannot be negative";
      }
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
      title: isEditMode ? "Update Pay Level?" : "Create New Pay Level?",
      text: isEditMode
        ? "Are you sure you want to update this pay level information?"
        : "Are you sure you want to create this new pay level?",
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
      const payLevelData = {
        PC_id: parseInt(formData.PC_id),
        EGM_id: parseInt(formData.EGM_id),
        PL_Code: formData.PL_Code.trim(),
        St_Basic: parseFloat(formData.St_Basic),
      };

      if (isEditMode) {
        await PayLevelApi.update(id, payLevelData);
        toast.success("Pay level updated successfully!");
      } else {
        await PayLevelApi.create(payLevelData);
        toast.success("Pay level created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/payroll-pay-structures/pay-level");
      }, 1500);
    } catch (error) {
      console.error("Error saving pay level:", error);

      if (error.errors) {
        const newErrors = {};
        Object.keys(error.errors).forEach((key) => {
          const errorKey = key == "EGM_id" ? "EGM_id" : key;
          newErrors[errorKey] = Array.isArray(error.errors[key])
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
            ? "Failed to update pay level. Please try again."
            : "Failed to create pay level. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/payroll-pay-structures/pay-level");
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const suggestions = generateCodeSuggestions();

  if (loading || loadingDropdowns) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pay level data...</p>
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
              navigate("/masters/payroll-pay-structures/pay-level")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Pay Level" : "Add New Pay Level"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update pay level master information"
                : "Create a new pay level master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3"></div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pay Level Information
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Pay Commission Dropdown - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Pay Commission <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="PC_id"
                  value={formData.PC_id}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.PC_id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white`}
                  required
                >
                  <option value="">Select Pay Commission</option>
                  {payCommissions.map((commission) => (
                    <option key={commission.PC_Id} value={commission.PC_Id}>
                      {commission.PC_Name}{" "}
                      {commission.structure_type
                        ? `(${commission.structure_type.PST_Type})`
                        : ""}
                    </option>
                  ))}
                </select>
                {formData.PC_id && !errors.PC_id && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.PC_id && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.PC_id ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PC_id}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select the pay commission (required)
                </p>
              )}
            </div>

            {/* Pay Grade Dropdown - Required (Simple dropdown) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Pay Grade <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="EGM_id"
                  value={formData.EGM_id}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.EGM_id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white ${
                    !formData.PC_id ? "bg-gray-50 cursor-not-allowed" : ""
                  }`}
                  required
                  disabled={!formData.PC_id}
                >
                  <option value="">
                    {!formData.PC_id
                      ? "First select pay commission"
                      : filteredGrades.length == 0
                        ? "No grades available"
                        : "Select Pay Grade"}
                  </option>
                  {filteredGrades.map((grade) => (
                    <option key={grade.EGM_Id} value={grade.EGM_Id}>
                      {grade.EGM_Name}
                    </option>
                  ))}
                </select>
                {formData.EGM_id && !errors.EGM_id && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.EGM_id && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.EGM_id ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.EGM_id}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {!formData.PC_id
                    ? "Select a pay commission first"
                    : filteredGrades.length == 0
                      ? "No grades available for selected commission"
                      : "Select the pay grade (required)"}
                </p>
              )}
            </div>

            {/* Pay Level Code - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Pay Level Code <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.PL_Code.length > 8
                        ? formData.PL_Code.length >= 10
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.PL_Code.length}/10 characters
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
                              PL_Code: suggestion,
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
                  name="PL_Code"
                  value={formData.PL_Code}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.PL_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase`}
                  placeholder="e.g., PL001, LVL01, L100"
                  required
                  maxLength={10}
                />
                {formData.PL_Code && !errors.PL_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.PL_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.PL_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.PL_Code)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.PL_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PL_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the pay level (required, max 10 characters)
                </p>
              )}
            </div>

            {/* Starting Basic - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Starting Basic (₹) <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.St_Basic.length > 10
                      ? "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.St_Basic.length} characters
                </span>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="St_Basic"
                  value={formData.St_Basic}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.St_Basic ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., 35000, 52000.50"
                  required
                />
                {formData.St_Basic && !errors.St_Basic && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.St_Basic && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.St_Basic ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.St_Basic}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Starting basic pay amount in rupees (required, numeric value)
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
                  {isEditMode ? "Update Pay Level" : "Create Pay Level"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditPayLevel;
