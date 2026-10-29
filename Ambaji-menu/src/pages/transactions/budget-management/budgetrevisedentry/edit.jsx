// src/pages/Finance/BudgetManagement/BudgetRevisedEntry/Edit.jsx
import { useState, useEffect, useRef } from "react";
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
  Clock,
  TrendingUp,
  FileCheck,
  XCircle,
  Upload,
  Paperclip,
  X as XIcon,
  Eye,
  PieChart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import budgetEntryApi from "../../../services/budgetentryapi";

const EditBudgetRevisedEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fncId, setFncId] = useState(null); // State for dynamic Fnc_Id

  // New state for file uploads
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    Status: "",
    Sug_Amount: "",
    Amount: "", // New field for Revised status
  });

  const [originalData, setOriginalData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Helper functions for budget head
  const getBudgetHeadName = () => {
    return originalData?.budget_head?.gr_nm || "N/A";
  };

  const getBudgetHeadCode = () => {
    return originalData?.budget_head?.gr_cd || "N/A";
  };

  // Load Fnc_Id from menu details on component mount (like reference code)
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/budget-management/budgetrevisedentry";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Id) {
        setFncId(currentMenuItem.Fnc_Id);
        console.log("Fnc_Id loaded:", currentMenuItem.Fnc_Id); // For debugging
      } else {
        console.warn("Fnc_Id not found in menu details for path:", currentPath);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // Status options based on original status
  const getStatusOptions = () => {
    if (originalData?.status == "R") {
      // For Revised status, only Draft is allowed
      return [
        {
          value: "D",
          label: "Draft",
          icon: Clock,
          color: "bg-yellow-100 text-yellow-800",
        },
      ];
    } else if (originalData?.status == "J" || originalData?.status == "RJ") {
      // For Justification/Reject status, only Draft is allowed
      return [
        {
          value: "D",
          label: "Draft",
          icon: Clock,
          color: "bg-yellow-100 text-yellow-800",
        },
      ];
    }
    // Default - should not happen
    return [
      {
        value: "D",
        label: "Draft",
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800",
      },
    ];
  };

  // Get status value for API
  const getStatusValueForApi = (value) => {
    const statusMap = {
      D: "Draft",
    };
    return statusMap[value] || value;
  };

  // Function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // Remove data:image/*;base64, prefix
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to validate file
  const validateFile = (file) => {
    // Allowed MIME types
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    // Max file size 10MB
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error(`File type not supported: ${file.type}`);
      return false;
    }

    if (file.size > maxSize) {
      toast.error(
        `File size too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Max 10MB allowed.`,
      );
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);

    // Check if adding these files would exceed 10 files limit
    if (uploadedFiles.length + files.length > 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    const validFiles = files.filter((file) => validateFile(file));

    if (validFiles.length == 0) return;

    setUploadingFiles(true);

    try {
      const newFiles = await Promise.all(
        validFiles.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            base64: base64,
            file: file, // Keep reference for preview
          };
        }),
      );

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      toast.success(`Added ${newFiles.length} file(s)`);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error converting files:", error);
      toast.error("Failed to process files");
    } finally {
      setUploadingFiles(false);
    }
  };

  // Remove uploaded file
  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i != index));
  };

  // Remove existing document
  const removeExistingDocument = (index) => {
    setExistingDocuments((prev) => prev.filter((_, i) => i != index));
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

        // Load existing documents if available
        if (entryData.beg_doc && Array.isArray(entryData.beg_doc)) {
          setExistingDocuments(entryData.beg_doc);
        }

        // Set form data based on original status
        if (entryData.status == "R") {
          // For Revised status: Amount becomes editable, Sug_Amount is readonly
          setFormData({
            Status: "D", // Always Draft for revision
            Sug_Amount: entryData.sug_amount?.toString() || "",
            Amount: entryData.amount?.toString() || "", // Budget amount becomes editable
          });
        } else {
          // For other statuses (J, RJ): Keep original behavior
          setFormData({
            Status: "D", // Always set to Draft for revision
            Sug_Amount: entryData.sug_amount?.toString() || "",
            Amount: entryData.amount?.toString() || "", // Keep original amount
          });
        }
      } else {
        toast.error("Failed to load budget entry data!");
        navigate("/transactions/budget-management/budgetrevisedentry");
      }
    } catch (error) {
      toast.error("Failed to load budget entry data!");
      navigate("/transactions/budget-management/budgetrevisedentry");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For amount fields, allow only numbers and decimal
    if (name == "Sug_Amount" || name == "Amount") {
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

    // Different validation based on original status
    if (originalData?.status == "R") {
      // Revised status: Amount is required (Budget Amount becomes editable)
      if (!formData.Amount) {
        newErrors.Amount = "Budget amount is required";
      } else if (parseFloat(formData.Amount) <= 0) {
        newErrors.Amount = "Budget amount must be greater than 0";
      } else if (parseFloat(formData.Amount) > 1000000000) {
        newErrors.Amount = "Amount must be less than ₹ 1,00,00,00,000";
      }

      // Sug_Amount is optional for Revised status
      if (formData.Sug_Amount && parseFloat(formData.Sug_Amount) > 1000000000) {
        newErrors.Sug_Amount =
          "Suggested amount must be less than ₹ 1,00,00,00,000";
      }
    } else {
      // J or RJ status: Sug_Amount is required
      if (!formData.Sug_Amount) {
        newErrors.Sug_Amount = "Suggested amount is required";
      } else if (parseFloat(formData.Sug_Amount) <= 0) {
        newErrors.Sug_Amount = "Suggested amount must be greater than 0";
      } else if (parseFloat(formData.Sug_Amount) > 1000000000) {
        newErrors.Sug_Amount = "Amount must be less than ₹ 1,00,00,00,000";
      }
    }

    // Special validation for Justification status when uploading revisions
    if (
      originalData?.status == "J" &&
      uploadedFiles.length == 0 &&
      existingDocuments.length == 0
    ) {
      newErrors.Beg_Doc =
        "At least one document is required for Justification status";
    } else if (uploadedFiles.length + existingDocuments.length > 10) {
      newErrors.Beg_Doc = "Maximum 10 documents allowed";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if Fnc_Id is loaded when files are being uploaded
    if (originalData?.status == "J" && uploadedFiles.length > 0) {
      if (!fncId) {
        toast.error(
          "Function ID not available for document upload. Please refresh the page.",
        );
        return;
      }
    }

    if (!validateForm()) {
      const firstErrorKey = Object.keys(validationErrors).find(
        (key) => validationErrors[key],
      );
      if (firstErrorKey) {
        toast.error(validationErrors[firstErrorKey]);
      }
      return;
    }

    // Prepare data for API
    const submitData = {
      Status: getStatusValueForApi(formData.Status),
    };

    // For Revised status: Send Amount to backend (it will become the new Budget Amount)
    if (originalData?.status == "R") {
      submitData.Amount = formData.Amount ? parseFloat(formData.Amount) : null;
      // Sug_Amount is optional for Revised status
      if (formData.Sug_Amount) {
        submitData.Sug_Amount = parseFloat(formData.Sug_Amount);
      }
    } else {
      // For J/RJ status: Only send Sug_Amount
      submitData.Sug_Amount = formData.Sug_Amount
        ? parseFloat(formData.Sug_Amount)
        : null;
    }

    // Add Beg_Doc if original status is Justification and there are uploaded files
    if (originalData?.status == "J" && uploadedFiles.length > 0) {
      submitData.Beg_Doc = uploadedFiles.map((file) => file.base64);
      submitData.Fnc_Id = fncId; // Dynamic Fnc_Id from menu details
    }

    const result = await Swal.fire({
      title: "Update Budget Revision?",
      text:
        originalData?.status == "R"
          ? "Are you sure you want to update this Revised budget entry? This will create a new Draft version with updated budget amount."
          : "Are you sure you want to update this budget revision?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, update!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const response = await budgetEntryApi.update(id, submitData);
      toast.success("Budget revision updated successfully!");

      setTimeout(() => {
        navigate("/transactions/budget-management/budgetrevisedentry");
      }, 1500);
    } catch (error) {
      console.error("Error updating budget revision:", error);

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
        toast.error("Failed to update budget revision. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/budget-management/budgetrevisedentry");
  };

  const formatAmount = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes == 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("word")) return "📝";
    if (type.includes("excel") || type.includes("sheet")) return "📊";
    return "📎";
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
        icon: TrendingUp,
        color: "bg-blue-100 text-blue-800",
      },
      J: {
        label: "Justification",
        icon: FileCheck,
        color: "bg-amber-100 text-amber-800",
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
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
            navigate("/transactions/budget-management/budgetrevisedentry")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  const isRevisedStatus = originalData.status == "R";
  const isJustificationStatus = originalData.status == "J";
  const isRejectStatus = originalData.status == "RJ";
  const statusOptions = getStatusOptions();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/budget-management/budgetrevisedentry")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Revise Budget Entry
            </h1>
            <p className="text-gray-600 mt-1">
              {isRevisedStatus
                ? "Update budget amount for revised entry"
                : "Update budget entry with suggested amount"}
            </p>
          </div>
        </div>
      </div>

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

            {/* Budget Head - Replaced Ledger */}
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

            {/* Current Budget Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Budget Amount
              </label>
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <IndianRupee className="h-4 w-4 text-green-600 mr-2" />
                <span className="font-bold text-green-700">
                  {originalData.formatted_amount || "₹ 0.00"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Actual: ₹ {originalData.amount?.toLocaleString() || "0"}
              </p>
            </div>

            {/* Current Suggested Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Suggested Amount
              </label>
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <IndianRupee className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-700">
                  {originalData.sug_amount
                    ? `${formatAmount(originalData.sug_amount)}`
                    : "₹ 0.00"}
                </span>
              </div>
            </div>

            {/* Document Count (if Justification) */}
            {isJustificationStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Documents
                </label>
                <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Paperclip className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="font-medium text-amber-700">
                    {existingDocuments.length} document(s)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revision Form Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isRevisedStatus ? "Budget Amount Revision" : "Budget Revision"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status - Fixed to Draft */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status *
              </label>
              <div className="relative">
                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">
                    Draft (Will be created for further review)
                  </span>
                </div>
                <input type="hidden" name="Status" value="D" />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                A new Draft entry will be created for approval process
              </p>
            </div>

            {/* Conditional Fields based on original status */}
            {isRevisedStatus ? (
              // For Revised status: Budget Amount becomes editable
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Budget Amount *
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
                    placeholder="Enter new budget amount"
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
                    Enter the revised budget amount
                  </p>
                )}
              </div>
            ) : (
              // For J/RJ status: Suggested Amount is editable
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suggested Amount *
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
                    placeholder="Enter suggested amount"
                    required
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
                    Enter the suggested amount for budget revision
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Document Upload - Only when original status is Justification */}
          {isJustificationStatus && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <div className="h-6 w-6 rounded-lg bg-amber-500 flex items-center justify-center mr-2">
                  <Paperclip className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-md font-semibold text-gray-900">
                  Justification Documents
                </h3>
              </div>

              <div className="mb-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    validationErrors.Beg_Doc
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                  />
                  <Upload
                    className={`h-10 w-10 mx-auto mb-3 ${
                      validationErrors.Beg_Doc
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  />
                  <h3 className="text-md font-medium text-gray-900 mb-2">
                    Drop files here or click to upload
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Supporting documents for justification (Max 10 files, 10MB
                    each)
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                  >
                    Select Files
                  </button>
                </div>

                {validationErrors.Beg_Doc && (
                  <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.Beg_Doc}
                  </p>
                )}

                {/* Upload Progress */}
                {uploadingFiles && (
                  <div className="mt-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-sm text-gray-600">
                      Processing files...
                    </span>
                  </div>
                )}
              </div>

              {/* Uploaded Files List */}
              {(uploadedFiles.length > 0 || existingDocuments.length > 0) && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Uploaded Documents (
                    {uploadedFiles.length + existingDocuments.length}/10)
                  </h3>

                  {/* Existing Documents (if any) */}
                  {existingDocuments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-600">
                        Existing Documents:
                      </h4>
                      {existingDocuments.map((doc, index) => (
                        <div
                          key={`existing-${index}`}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex items-center">
                            <span className="text-lg mr-3">
                              {getFileIcon(doc.url || "")}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {doc.name || `Document ${index + 1}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {doc.url
                                  ? "Existing document"
                                  : "Uploaded previously"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {doc.url && (
                              <button
                                type="button"
                                onClick={() => window.open(doc.url, "_blank")}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingDocument(index)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Remove"
                            >
                              <XIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {existingDocuments.length > 0 && (
                        <h4 className="text-xs font-medium text-gray-600">
                          New Documents:
                        </h4>
                      )}
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={`new-${index}`}
                          className="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
                        >
                          <div className="flex items-center">
                            <span className="text-lg mr-3">
                              {getFileIcon(file.type)}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • {file.type}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUploadedFile(index)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Remove"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fnc_Id warning if not loaded */}
              {isJustificationStatus && uploadedFiles.length > 0 && !fncId && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <p className="text-sm text-yellow-700">
                      Function ID not loaded. Document upload may not work.
                      Please refresh the page.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount Comparison */}
          {(formData.Amount || formData.Sug_Amount) && originalData.amount && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-amber-900">
                    Amount Comparison
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-amber-800">
                        Current Budget Amount:
                      </p>
                      <p className="text-sm font-bold text-amber-900">
                        ₹ {formatAmount(originalData.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-800">
                        {isRevisedStatus
                          ? "New Budget Amount:"
                          : "Suggested Amount:"}
                      </p>
                      <p className="text-sm font-bold text-amber-900">
                        {isRevisedStatus
                          ? `₹ ${formatAmount(formData.Amount)}`
                          : `₹ ${formatAmount(formData.Sug_Amount)}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-800 mt-2">
                    Difference: ₹{" "}
                    {formatAmount(
                      Math.abs(
                        parseFloat(
                          isRevisedStatus
                            ? formData.Amount
                            : formData.Sug_Amount || 0,
                        ) - parseFloat(originalData.amount),
                      ),
                    )}
                    <span
                      className={`ml-2 font-medium ${
                        parseFloat(
                          isRevisedStatus
                            ? formData.Amount
                            : formData.Sug_Amount || 0,
                        ) > parseFloat(originalData.amount)
                          ? "text-green-600"
                          : parseFloat(
                                isRevisedStatus
                                  ? formData.Amount
                                  : formData.Sug_Amount || 0,
                              ) < parseFloat(originalData.amount)
                            ? "text-red-600"
                            : "text-amber-600"
                      }`}
                    >
                      {parseFloat(
                        isRevisedStatus
                          ? formData.Amount
                          : formData.Sug_Amount || 0,
                      ) > parseFloat(originalData.amount)
                        ? "(Increase)"
                        : parseFloat(
                              isRevisedStatus
                                ? formData.Amount
                                : formData.Sug_Amount || 0,
                            ) < parseFloat(originalData.amount)
                          ? "(Decrease)"
                          : "(No Change)"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Change Information */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  Workflow Information
                </h4>
                <p className="text-xs text-blue-800 mt-1">
                  {isRevisedStatus
                    ? "This Revised entry will create a new Draft version with updated budget amount for approval."
                    : "This entry will be updated and moved back to Draft status for further review."}
                  {isJustificationStatus &&
                    " Uploaded documents will be carried forward."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isRevisedStatus
                ? "Creating new Draft version for approval process"
                : "Updating entry for further review process"}
              {isJustificationStatus &&
                " • Documents are required for Justification status"}
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
              disabled={
                saving ||
                (isJustificationStatus && uploadedFiles.length > 0 && !fncId) // Disable if justification with files but no Fnc_Id
              }
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isRevisedStatus ? "Update Budget Amount" : "Update Revision"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBudgetRevisedEntry;
