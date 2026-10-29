// src/pages/Finance/BudgetManagement/BudgetJustificationUploads/Edit.jsx
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
  ChevronDown,
  FileCheck,
  X as XIcon,
  Eye,
  Upload,
  Paperclip,
  File,
  Download,
  PieChart,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import budgetEntryApi from "../../../services/budgetentryapi";

const EditBudgetJustificationUploads = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fncId, setFncId] = useState(null);

  // File upload state
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [documentsToRemove, setDocumentsToRemove] = useState([]);
  const fileInputRef = useRef(null);

  const [originalData, setOriginalData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Helper functions for budget head
  const getBudgetHeadName = () => {
    return originalData?.budget_head?.gr_nm || "N/A";
  };

  const getBudgetHeadCode = () => {
    return originalData?.budget_head?.gr_cd || "N/A";
  };

  // Load Fnc_Id from menu details on component mount
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/budget-management/budgetjustificationuploads";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Id) {
        setFncId(currentMenuItem.Fnc_Id);
        console.log("Fnc_Id loaded:", currentMenuItem.Fnc_Id);
      } else {
        console.warn("Fnc_Id not found in menu details for path:", currentPath);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadBudgetEntryData();
    }
  }, [id]);

  // Function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to validate file
  const validateFile = (file) => {
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

    const maxSize = 10 * 1024 * 1024; // 10MB

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

    const totalDocuments = uploadedFiles.length + existingDocuments.length;
    if (totalDocuments + files.length > 10) {
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
            file: file,
            isNew: true,
            uploadedAt: new Date().toISOString(),
          };
        }),
      );

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      toast.success(`Added ${newFiles.length} file(s)`);

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
    const docToRemove = existingDocuments[index];
    setDocumentsToRemove((prev) => [...prev, docToRemove.doc_lib_id]);
    setExistingDocuments((prev) => prev.filter((_, i) => i != index));
    toast.success("Document marked for removal");
  };

  const loadBudgetEntryData = async () => {
    setLoading(true);
    try {
      const response = await budgetEntryApi.getById(id);
      if (response.success) {
        const entryData = response.data;
        setOriginalData(entryData);

        // Load existing documents from Beg_Doc array
        if (entryData.Beg_Doc && Array.isArray(entryData.Beg_Doc)) {
          console.log("Loading existing documents:", entryData.Beg_Doc);
          setExistingDocuments(entryData.Beg_Doc);
        }
      } else {
        toast.error("Failed to load budget entry data!");
        navigate("/transactions/budget-management/budgetjustificationuploads");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load budget entry data!");
      navigate("/transactions/budget-management/budgetjustificationuploads");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const totalDocuments = uploadedFiles.length + existingDocuments.length;
    if (totalDocuments == 0) {
      newErrors.Beg_Doc =
        "At least one document is required for Justification status";
    } else if (totalDocuments > 10) {
      newErrors.Beg_Doc = "Maximum 10 documents allowed";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if Fnc_Id is loaded when files are being uploaded
    if (uploadedFiles.length > 0 && !fncId) {
      toast.error(
        "Function ID not available for document upload. Please refresh the page.",
      );
      return;
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

    // Check if any changes were made
    if (uploadedFiles.length == 0 && documentsToRemove.length == 0) {
      toast.error("No changes to save");
      return;
    }

    const result = await Swal.fire({
      title: "Update Justification Documents?",
      text: "Are you sure you want to update the justification documents for this entry?",
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
      // Prepare data for API
      const submitData = {
        Status: "J", // Keep as Justification status
      };

      // Add new files if any
      if (uploadedFiles.length > 0) {
        submitData.Beg_Doc = uploadedFiles.map((file) => file.base64);
        submitData.Fnc_Id = fncId;
      }

      // Add documents to remove if any
      if (documentsToRemove.length > 0) {
        submitData.remove_documents = documentsToRemove;
      }

      console.log("Submitting data:", submitData);

      const response = await budgetEntryApi.update(id, submitData);

      if (response.success) {
        toast.success("Justification documents updated successfully!");
        setTimeout(() => {
          navigate(
            "/transactions/budget-management/budgetjustificationuploads",
          );
        }, 1500);
      } else {
        toast.error(response.message || "Failed to update documents");
      }
    } catch (error) {
      console.error("Error updating documents:", error);

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
        toast.error("Failed to update documents. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/budget-management/budgetjustificationuploads");
  };

  const formatAmount = (amount) => {
    if (!amount) return "0.00";
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
    if (!type) return "📎";
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("word")) return "📝";
    if (type.includes("excel") || type.includes("sheet")) return "📊";
    return "📎";
  };

  // Get file icon component
  const getFileIconComponent = (type) => {
    if (!type) return <File className="h-5 w-5 text-gray-400" />;
    if (type.includes("pdf"))
      return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes("image"))
      return <File className="h-5 w-5 text-blue-500" />;
    if (type.includes("word"))
      return <FileText className="h-5 w-5 text-blue-700" />;
    if (type.includes("excel") || type.includes("sheet"))
      return <FileText className="h-5 w-5 text-green-600" />;
    return <File className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (statusValue) => {
    const statusOptions = {
      J: {
        label: "Justification",
        icon: FileCheck,
        color: "bg-amber-100 text-amber-800",
      },
      D: {
        label: "Draft",
        icon: FileText,
        color: "bg-gray-100 text-gray-800",
      },
    };

    const statusOption = statusOptions[statusValue];
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto"></div>
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
            navigate(
              "/transactions/budget-management/budgetjustificationuploads",
            )
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  const totalDocuments = existingDocuments.length + uploadedFiles.length;
  const hasChanges = uploadedFiles.length > 0 || documentsToRemove.length > 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/transactions/budget-management/budgetjustificationuploads",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Justification Documents
            </h1>
            <p className="text-gray-600 mt-1">
              Update supporting documents for budget justification
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
                  {originalData.department?.desc ||
                    originalData.department?.name ||
                    "N/A"}
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
                  <span className="ml-2 text-xs text-gray-500">
                    ({getBudgetHeadCode()})
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount
              </label>
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <IndianRupee className="h-4 w-4 text-green-600 mr-2" />
                <span className="font-bold text-green-700">
                  ₹ {formatAmount(originalData.amount)}
                </span>
              </div>
            </div>

            {/* Suggested Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suggested Amount
              </label>
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <IndianRupee className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-700">
                  ₹ {formatAmount(originalData.sug_amount)}
                </span>
              </div>
            </div>

            {/* Current Document Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Documents
              </label>
              <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Paperclip className="h-4 w-4 text-amber-600 mr-2" />
                <span className="font-medium text-amber-700">
                  {originalData.document_count || 0} document(s)
                </span>
              </div>
            </div>
          </div>

          {/* Document Summary */}
          {originalData.document_summary && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Total Size:{" "}
                {originalData.document_summary.formatted_total_size || "0 B"} |
                Images: {originalData.document_summary.by_category?.images || 0}{" "}
                | Documents:{" "}
                {originalData.document_summary.by_category?.documents || 0}
              </p>
            </div>
          )}
        </div>

        {/* Document Management Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-3">
              <Paperclip className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Document Management
            </h2>
            <span className="ml-4 text-sm text-gray-500">
              ({totalDocuments}/10 documents)
            </span>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
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
                className={`h-12 w-12 mx-auto mb-4 ${
                  validationErrors.Beg_Doc ? "text-red-400" : "text-gray-400"
                }`}
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to upload
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Supporting documents for justification (Max 10 files, 10MB each)
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
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

            {/* Fnc_Id warning if not loaded */}
            {uploadedFiles.length > 0 && !fncId && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  <p className="text-sm text-yellow-700">
                    Function ID not loaded. Document upload may not work. Please
                    refresh the page.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Document Lists */}
          {(uploadedFiles.length > 0 || existingDocuments.length > 0) && (
            <div className="space-y-6">
              {/* Existing Documents */}
              {existingDocuments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Existing Documents ({existingDocuments.length})
                  </h3>
                  <div className="space-y-2">
                    {existingDocuments.map((doc, index) => (
                      <div
                        key={`existing-${doc.doc_lib_id || index}`}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <span className="text-lg mr-3">
                            {getFileIcon(doc.mime || doc.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.name ||
                                doc.original_name ||
                                `Document ${index + 1}`}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span>
                                {doc.formatted_size || formatFileSize(doc.size)}
                              </span>
                              {doc.uploaded_at && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>
                                    Uploaded:{" "}
                                    {new Date(
                                      doc.uploaded_at,
                                    ).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="View"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}
                          {doc.url && (
                            <a
                              href={doc.url}
                              download={doc.name || doc.original_name}
                              className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              title="Download"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingDocument(index)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Remove"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    New Documents to Upload ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={`new-${index}`}
                        className="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <span className="text-lg mr-3">
                            {getFileIcon(file.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatFileSize(file.size)} • Ready to upload
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(index)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded ml-4"
                          title="Remove"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Documents Message */}
          {existingDocuments.length == 0 && uploadedFiles.length == 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No documents uploaded yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Upload at least one document for justification
              </p>
            </div>
          )}

          {/* Document Requirements Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  Document Requirements
                </h4>
                <p className="text-xs text-blue-800 mt-1 space-y-1">
                  • At least one document is required for justification status
                  <br />
                  • Maximum 10 documents allowed total
                  <br />
                  • Maximum file size: 10MB per file
                  <br />
                  • Supported formats: PDF, Images, Word, Excel
                  <br />• Removing existing documents will delete them
                  permanently
                </p>
              </div>
            </div>
          </div>

          {/* Documents to Remove Summary */}
          {documentsToRemove.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">
                  {documentsToRemove.length} document(s) will be permanently
                  removed
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              {hasChanges
                ? "You have unsaved changes to your documents"
                : "No changes to save"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total documents after save: {totalDocuments} (Minimum 1 required)
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
                saving || !hasChanges || (uploadedFiles.length > 0 && !fncId)
              }
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-lg hover:from-amber-700 hover:to-orange-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Documents
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBudgetJustificationUploads;
