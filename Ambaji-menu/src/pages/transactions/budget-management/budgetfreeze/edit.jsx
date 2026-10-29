// src/pages/Finance/BudgetManagement/BudgetFreeze/Edit.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  Building,
  IndianRupee,
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
  ChevronDown,
  CheckCircle,
  Clock,
  TrendingUp,
  FileCheck,
  XCircle,
  Snowflake,
  Lock,
  PieChart,
  Shield,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import budgetEntryApi from "../../../services/budgetentryapi";

const EditBudgetFreezeEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    Status: "F", // Default to Freeze
    Amount: "",
    Sug_Amount: "",
  });

  const [originalData, setOriginalData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isFrozenEdit, setIsFrozenEdit] = useState(false);

  // Status options
  const statusOptions = [
    {
      value: "F",
      label: "Freeze",
      icon: Snowflake,
      color: "bg-cyan-100 text-cyan-800",
    },
    {
      value: "R",
      label: "Revised",
      icon: RotateCcw,
      color: "bg-blue-100 text-blue-800",
    },
  ];

  // Get status value for API - Direct mapping from form value to API value
  const getStatusValueForApi = (value) => {
    console.log(`🔄 Mapping status: "${value}" → "${value}"`);
    // Return the value as-is since the API expects single-letter codes
    return value;
  };

  // Helper functions for budget head
  const getBudgetHeadName = () => {
    return originalData?.budget_head?.gr_nm || "N/A";
  };

  const getBudgetHeadCode = () => {
    return originalData?.budget_head?.gr_cd || "N/A";
  };

  useEffect(() => {
    if (id) {
      loadBudgetEntryData();
    }
  }, [id]);

  const loadBudgetEntryData = async () => {
    setLoading(true);
    try {
      const response = await budgetEntryApi.getById(id);
      if (response.success) {
        const entryData = response.data;
        setOriginalData(entryData);

        // Check if entry is frozen
        if (entryData.status ==  'F') {
          setIsFrozenEdit(true);
        }

        // IMPORTANT: For the dropdown, we want to show "F" if the entry is frozen,
        // but we want to allow the user to change it. So we set the default to "F"
        // if it's frozen, otherwise we set it to the current status.
        // But for editing frozen entries, we should default to "F" (Keep Frozen)
        // and let the user change to "R" if they want to revise.
        let defaultStatus = "F"; // Default to Freeze
        
        // If the entry is not frozen and has a valid status, use that
        if (entryData.status && entryData.status != 'F') {
          // Only use the current status if it's one of our options
          if (entryData.status ==  'F' || entryData.status ==  'R') {
            defaultStatus = entryData.status;
          }
        }

        console.log(`📋 Loading entry with status: "${entryData.status}", setting default to: "${defaultStatus}"`);

        // Set form data - Always set Status to "F" for frozen entries, 
        // or use the current status if it's already "R"
        setFormData({
          Status: defaultStatus,
          Amount: entryData.amount?.toString() || "",
          Sug_Amount: entryData.sug_amount?.toString() || "",
        });
      } else {
        toast.error("Failed to load budget entry data!");
        navigate("/transactions/budget-management/budgetfreeze");
      }
    } catch (error) {
      toast.error("Failed to load budget entry data!");
      navigate("/transactions/budget-management/budgetfreeze");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    console.log(`📝 Input changed: ${name} = "${value}"`);

    // For amount fields, allow only numbers and decimal
    if (name ==  "Amount" || name ==  "Sug_Amount") {
      const isValid = /^\d*\.?\d*$/.test(value);
      if (!isValid && value != "") return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Status validation
    if (!formData.Status) {
      newErrors.Status = "Status is required";
    }

    // Amount validation
    if (!formData.Amount) {
      newErrors.Amount = "Budget amount is required";
    } else if (parseFloat(formData.Amount) <= 0) {
      newErrors.Amount = "Budget amount must be greater than 0";
    } else if (parseFloat(formData.Amount) > 1000000000) {
      newErrors.Amount = "Amount must be less than ₹ 1,00,00,00,000";
    }

    // Suggested amount validation (optional but must be valid if provided)
    if (formData.Sug_Amount && parseFloat(formData.Sug_Amount) > 1000000000) {
      newErrors.Sug_Amount = "Suggested amount must be less than ₹ 1,00,00,00,000";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length ==  0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📋 Form Data before submit:", {
      Status: formData.Status,
      Amount: formData.Amount,
      Sug_Amount: formData.Sug_Amount,
    });

    if (!validateForm()) {
      const firstErrorKey = Object.keys(validationErrors).find(
        (key) => validationErrors[key],
      );
      if (firstErrorKey) {
        toast.error(validationErrors[firstErrorKey]);
      }
      return;
    }

    // Get the status value - this comes directly from the dropdown selection
    const selectedStatus = formData.Status;
    console.log(`📌 Selected status from dropdown: "${selectedStatus}"`);

    // Prepare data for API
    const submitData = {
      Status: selectedStatus, // This will be "F" or "R" based on dropdown selection
      Amount: parseFloat(formData.Amount),
    };

    // Always include Sug_Amount, send null if empty
    if (formData.Sug_Amount && formData.Sug_Amount.trim() != "") {
      submitData.Sug_Amount = parseFloat(formData.Sug_Amount);
    } else {
      submitData.Sug_Amount = null;
    }

    console.log("📤 Submitting to API:", JSON.stringify(submitData, null, 2));

    // Check if this is a frozen entry edit with status change
    const isStatusChangeToRevised = formData.Status ==  "R";
    const isStatusChangeToFreeze = formData.Status ==  "F";
    const isAmountChanged = parseFloat(formData.Amount) != parseFloat(originalData?.amount || 0);
    const isSuggestedAmountChanged = parseFloat(formData.Sug_Amount || 0) != parseFloat(originalData?.sug_amount || 0);

    // Build confirmation message
    let confirmationTitle = "Update Budget Entry?";
    let confirmationText = "";
    let confirmButtonText = "Yes, Update!";
    let icon = "question";

    if (isFrozenEdit && isStatusChangeToRevised) {
      confirmationTitle = "Revise Frozen Budget Entry";
      confirmationText = `This will set the entry to REVISED status for further changes. Amount will be updated to ₹ ${parseFloat(formData.Amount).toLocaleString('en-IN')}.`;
      confirmButtonText = "Yes, Revise!";
      icon = "warning";
    } else if (isFrozenEdit && isStatusChangeToFreeze && isAmountChanged) {
      confirmationTitle = "Update Frozen Budget Entry";
      confirmationText = `Amount will be updated from ₹ ${parseFloat(originalData?.amount || 0).toLocaleString('en-IN')} to ₹ ${parseFloat(formData.Amount).toLocaleString('en-IN')} and kept as FROZEN.`;
      confirmButtonText = "Yes, Update Frozen!";
      icon = "warning";
    } else if (isFrozenEdit && isStatusChangeToFreeze && !isAmountChanged && !isSuggestedAmountChanged) {
      confirmationTitle = "Keep Frozen Budget Entry";
      confirmationText = `No changes detected. The entry will remain FROZEN.`;
      confirmButtonText = "Yes, Keep Frozen!";
      icon = "info";
    } else if (!isFrozenEdit && isStatusChangeToFreeze) {
      confirmationTitle = "Freeze Budget Entry?";
      confirmationText = "Freezing will prevent any further modifications to this budget entry. Are you sure?";
      confirmButtonText = "Yes, Freeze!";
      icon = "warning";
    }

    // Show confirmation
    const result = await Swal.fire({
      title: confirmationTitle,
      text: confirmationText,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: isStatusChangeToFreeze ? "#E53935" : "#EF5350",
      cancelButtonColor: "#6b7280",
      confirmButtonText: confirmButtonText,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const response = await budgetEntryApi.update(id, submitData);

      console.log("✅ API Response:", response);

      if (formData.Status ==  "F" && isFrozenEdit) {
        toast.success("Frozen budget entry updated successfully!");
      } else if (formData.Status ==  "R" && isFrozenEdit) {
        toast.success("Frozen budget entry set to Revised status successfully!");
      } else if (formData.Status ==  "F") {
        toast.success("Budget entry frozen successfully!");
      } else {
        toast.success("Budget entry updated successfully!");
      }

      setTimeout(() => {
        navigate("/transactions/budget-management/budgetfreeze");
      }, 1500);
    } catch (error) {
      console.error("Error updating budget entry:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = apiErrors[key][0];
        });
        setValidationErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update budget entry. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/budget-management/budgetfreeze");
  };

  const formatAmount = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const getStatusBadge = (statusValue) => {
    const statusOptionsAll = {
      D: {
        label: "Draft",
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800",
      },
      R: {
        label: "Revised",
        icon: RotateCcw,
        color: "bg-blue-100 text-blue-800",
      },
      J: {
        label: "Justification",
        icon: FileCheck,
        color: "bg-amber-100 text-amber-800",
      },
      P: {
        label: "Approval",
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
      },
      F: {
        label: "Freeze",
        icon: Snowflake,
        color: "bg-cyan-100 text-cyan-800",
      },
      RJ: { label: "Reject", icon: XCircle, color: "bg-red-100 text-red-800" },
    };

    const statusOption = statusOptionsAll[statusValue];
    if (!statusOption) return null;

    const Icon = statusOption.icon;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusOption.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {statusOption.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading budget entry data...</p>
      </div>
    );
  }

  if (!originalData) {
    return (
      <div className="p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Budget Entry Not Found
        </h3>
        <p className="text-gray-600 mb-6">
          The requested budget entry could not be found.
        </p>
        <button
          onClick={() =>
            navigate("/transactions/budget-management/budgetfreeze")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  const isAlreadyFrozen = originalData.status ==  "F";
  const isStatusChanged = formData.Status != originalData.status;
  const isAmountChanged = parseFloat(formData.Amount) != parseFloat(originalData.amount || 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/budget-management/budgetfreeze")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAlreadyFrozen ? "Edit Frozen Budget Entry" : "Freeze Budget Entry"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAlreadyFrozen 
                ? "Update amount or set to Revised status for re-approval"
                : "Freeze approved budget entry to prevent further modifications"}
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner for Frozen Entry */}
      {isAlreadyFrozen && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-amber-500" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-amber-800">
                Editing Frozen Budget Entry
              </h3>
              <div className="mt-1 text-sm text-amber-700 space-y-1">
                <p>
                  This budget entry is <strong>Frozen</strong>. You can:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1 text-amber-700">
                  <li>Update the <strong>Amount</strong> and keep it <strong>Frozen</strong></li>
                  <li>Set it to <strong>Revised</strong> status for further changes and re-approval</li>
                  <li>Update the <strong>Suggested Amount</strong> (optional)</li>
                </ul>
                <div className="mt-2 p-2 bg-amber-100 rounded-md border border-amber-200">
                  <p className="text-xs text-amber-800">
                    <strong>Current Amount:</strong> ₹ {formatAmount(originalData.amount)} &nbsp;|&nbsp;
                    <strong>Current Suggested Amount:</strong> {originalData.sug_amount ? `₹ ${formatAmount(originalData.sug_amount)}` : 'Not set'} &nbsp;|&nbsp;
                    <strong>Status:</strong> {getStatusBadge(originalData.status)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Original Details Card - Read Only */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Budget Entry Details
            </h2>
            <div className="ml-4">{getStatusBadge(originalData.status)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Financial Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financial Year
              </label>
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">
                  {originalData.financial_year?.financial_year_name || "N/A"}
                </span>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Building className="h-4 w-4 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">
                  {originalData.department?.desc || "N/A"}
                </span>
              </div>
            </div>

            {/* Budget Head */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Head
              </label>
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <PieChart className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <span className="font-medium text-gray-900">
                    {getBudgetHeadName()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isAlreadyFrozen ? "Update Frozen Entry" : "Freeze Confirmation"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <div className="relative">
                <select
                  name="Status"
                  value={formData.Status}
                  onChange={handleInputChange}
                  className={`w-full pl-4 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                    validationErrors.Status
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  required
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Current selection: <strong className="text-blue-600">{formData.Status ==  "F" ? "Freeze" : "Revised"}</strong>
                {formData.Status ==  "F" 
                  ? " - Keep the entry frozen and update amount"
                  : " - Set to Revised for re-approval workflow"}
              </p>
              {validationErrors.Status && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.Status}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Amount"
                  value={formData.Amount}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.Amount
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter budget amount"
                  required
                />
                {formData.Amount && !validationErrors.Amount && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <span className="text-sm text-gray-500 mr-2">
                      ₹ {formatAmount(formData.Amount)}
                    </span>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              {validationErrors.Amount ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.Amount}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Enter the budget amount in Indian Rupees (₹)
                  {isAmountChanged && originalData && (
                    <span className="text-amber-600 ml-1">
                      (Changed from ₹ {formatAmount(originalData.amount)})
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Suggested Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suggested Amount
                <span className="text-xs text-gray-500 ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="Sug_Amount"
                  value={formData.Sug_Amount}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.Sug_Amount
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter suggested amount (optional)"
                />
                {formData.Sug_Amount && !validationErrors.Sug_Amount && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <span className="text-sm text-gray-500 mr-2">
                      ₹ {formatAmount(formData.Sug_Amount)}
                    </span>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              {validationErrors.Sug_Amount ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationErrors.Sug_Amount}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.Status ==  "F" 
                    ? "Optional: Update suggested amount for reference"
                    : "Suggested amount for the revised entry"}
                  {originalData.sug_amount && (
                    <span className="text-gray-400 ml-1">
                      (Current: ₹ {formatAmount(originalData.sug_amount)})
                    </span>
                  )}
                </p>
              )}
            </div>

           
          </div>

          {/* Status Change Information */}
          {isAlreadyFrozen && formData.Status ==  "R" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Revision Information
                  </h4>
                  <p className="text-xs text-blue-800 mt-1">
                    Setting this frozen entry to <strong>Revised</strong> status will:
                  </p>
                  <ul className="text-xs text-blue-800 mt-1 list-disc pl-5 space-y-1">
                    <li>Allow further modifications to the entry</li>
                    <li>Require re-approval through the approval workflow</li>
                    <li>Track the revision history</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isAlreadyFrozen && formData.Status ==  "F" && isAmountChanged && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-amber-900">
                    Amount Update Information
                  </h4>
                  <p className="text-xs text-amber-800 mt-1">
                    Updating the amount of a frozen entry will:
                  </p>
                  <ul className="text-xs text-amber-800 mt-1 list-disc pl-5 space-y-1">
                    <li>Update the budget amount directly</li>
                    <li>Keep the entry in <strong>Frozen</strong> status</li>
                    <li>Track the amount change in audit logs</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formData.Status ==  "F" 
                ? "Keep frozen and update amount"
                : "Set to Revised for further changes"}
              {isAmountChanged && " • Amount will be updated"}
              {formData.Sug_Amount && " • Suggested amount will be updated"}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              📤 Status to send: <strong>{formData.Status}</strong>
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
              className={`px-6 py-2.5 text-white rounded-lg hover:opacity-90 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                formData.Status ==  "R"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                  : isAlreadyFrozen
                    ? "bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800"
                    : "bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800"
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : formData.Status ==  "R" ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Set to Revised
                </>
              ) : isAlreadyFrozen ? (
                <>
                  <Snowflake className="h-4 w-4 mr-2" />
                  Update Frozen Entry
                </>
              ) : (
                <>
                  <Snowflake className="h-4 w-4 mr-2" />
                  Confirm Freeze
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBudgetFreezeEntry;