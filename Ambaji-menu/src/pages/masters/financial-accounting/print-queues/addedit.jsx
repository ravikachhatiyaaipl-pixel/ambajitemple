import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Printer,
  Hash,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Info,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { PrintQueuesApi } from "../../../services/printqueuesapi";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const AddEditPrintQueues = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [cheques, setCheques] = useState([]);
  const [loadingCheques, setLoadingCheques] = useState(false);
  const [selectedChequeDetails, setSelectedChequeDetails] = useState(null);

  // Form state - matches API payload
  const [formData, setFormData] = useState({
    cheque_id: "",
    status: "",
    queued_at: "",
    priority: 5,
    printed_at: null,
  });

  // Fetch cheques list for dropdown
  useEffect(() => {
    fetchCheques();
  }, []);

  const fetchCheques = async () => {
    setLoadingCheques(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/cheques/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.data.success) {
        setCheques(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching cheques:", error);
      toast.error("Failed to load cheques list");
    } finally {
      setLoadingCheques(false);
    }
  };

  // Function to get current datetime in local format for datetime-local input
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Function to convert UTC date to local datetime-local format
  const formatToLocalDateTime = (utcDateString) => {
    if (!utcDateString) return "";
    const date = new Date(utcDateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadPrintQueueData();
    } else {
      // Set default queued_at for new entry with current local datetime
      setFormData((prev) => ({
        ...prev,
        queued_at: getCurrentDateTimeLocal(),
        status: "32",
      }));
    }
  }, [id]);

  const loadPrintQueueData = async () => {
    setLoading(true);
    try {
      const queue = await PrintQueuesApi.getById(id);

      setFormData({
        cheque_id: queue.cheque_id || "",
        status: queue.status || "32",
        queued_at: formatToLocalDateTime(queue.queued_at),
        priority: queue.priority || 5,
        printed_at: queue.printed_at || null,
      });

      // Fetch cheque details for display
      if (queue.cheque_id) {
        fetchChequeDetails(queue.cheque_id);
      }
    } catch (error) {
      console.error("Error loading print queue:", error);
      toast.error("Failed to load print queue data!");
      navigate("/masters/financial-accounting/print-queues");
    } finally {
      setLoading(false);
    }
  };

  const fetchChequeDetails = async (chequeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheques/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.data.success) {
        const cheque = response.data.data.find(
          (c) => c.cheque_id == parseInt(chequeId),
        );
        setSelectedChequeDetails(cheque || null);
      }
    } catch (error) {
      console.error("Error fetching cheque details:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));

    // If cheque_id changes, fetch cheque details
    if (name == "cheque_id" && value) {
      fetchChequeDetails(value);
    } else if (name == "cheque_id" && !value) {
      setSelectedChequeDetails(null);
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cheque_id) {
      newErrors.cheque_id = "Cheque is required";
    } else if (isNaN(formData.cheque_id) || formData.cheque_id <= 0) {
      newErrors.cheque_id = "Cheque must be a valid positive number";
    }

    if (!formData.status && formData.status != 0) {
      newErrors.status = "Status is required";
    } else if (isNaN(formData.status)) {
      newErrors.status = "Status must be a valid number";
    }

    if (!formData.queued_at) {
      newErrors.queued_at = "Queue date and time is required";
    }

    if (!formData.priority && formData.priority != 0) {
      newErrors.priority = "Priority is required";
    } else if (
      isNaN(formData.priority) ||
      formData.priority < 1 ||
      formData.priority > 10
    ) {
      newErrors.priority = "Priority must be between 1 and 10";
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
      title: isEditMode ? "Update Print Queue?" : "Add to Print Queue?",
      text: isEditMode
        ? "Are you sure you want to update this print queue information?"
        : "Are you sure you want to add this cheque to print queue?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isEditMode ? "Yes, update!" : "Yes, add!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      // Convert local datetime to UTC format for API
      const localDateTime = new Date(formData.queued_at);
      const year = localDateTime.getFullYear();
      const month = String(localDateTime.getMonth() + 1).padStart(2, "0");
      const day = String(localDateTime.getDate()).padStart(2, "0");
      const hours = String(localDateTime.getHours()).padStart(2, "0");
      const minutes = String(localDateTime.getMinutes()).padStart(2, "0");
      const seconds = String(localDateTime.getSeconds()).padStart(2, "0");
      const utcDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      const queueData = {
        cheque_id: parseInt(formData.cheque_id),
        status: parseInt(formData.status),
        queued_at: utcDateTime,
        priority: parseInt(formData.priority),
        printed_at: formData.printed_at || null,
      };

      if (isEditMode) {
        await PrintQueuesApi.update(id, queueData);
        toast.success("Print queue updated successfully!");
      } else {
        await PrintQueuesApi.create(queueData);
        toast.success("Cheque added to print queue successfully!");
      }

      setTimeout(() => {
        navigate("/masters/financial-accounting/print-queues");
      }, 1500);
    } catch (error) {
      console.error("Error saving print queue:", error);

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
              ? "Failed to update print queue. Please try again."
              : "Failed to add to print queue. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/print-queues");
  };

  const getPriorityLabel = (priority) => {
    if (priority <= 2) return "High Priority";
    if (priority <= 4) return "Medium Priority";
    return "Low Priority";
  };

  const getPriorityColor = (priority) => {
    if (priority <= 2) return "text-red-600";
    if (priority <= 4) return "text-yellow-600";
    return "text-green-600";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading print queue data...</p>
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
              navigate("/masters/financial-accounting/print-queues")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Print Queue" : "Add to Print Queue"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update print queue information"
                : "Add a new cheque to print queue"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Printer className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Print Queue Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Cheque ID - Required Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Cheque <span className="text-red-500">*</span>
                </label>
                {loadingCheques && (
                  <span className="text-xs text-gray-400">
                    Loading cheques...
                  </span>
                )}
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="cheque_id"
                  value={formData.cheque_id}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.cheque_id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                  disabled={loadingCheques}
                >
                  <option value="">Select a cheque...</option>
                  {cheques.map((cheque) => (
                    <option key={cheque.cheque_id} value={cheque.cheque_id}>
                      {cheque.SL_Name} - {formatCurrency(cheque.amount)} -{" "}
                      {cheque.cheque_number}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.cheque_id ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.cheque_id}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Select the cheque to be added to print queue
                </p>
              )}
            </div>

            {/* Selected Cheque Details Display */}
            {selectedChequeDetails && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">
                  Selected Cheque Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-blue-600">Cheque Number</span>
                    <p className="font-medium text-gray-800">
                      {selectedChequeDetails.cheque_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-600">Payee Name</span>
                    <p className="font-medium text-gray-800">
                      {selectedChequeDetails.SL_Name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-600">Amount</span>
                    <p className="font-medium text-gray-800">
                      {formatCurrency(selectedChequeDetails.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-600">Cheque Date</span>
                    <p className="font-medium text-gray-800">
                      {selectedChequeDetails.cheque_date
                        ? new Date(
                            selectedChequeDetails.cheque_date,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-600">Payment Type</span>
                    <p className="font-medium text-gray-800">
                      {selectedChequeDetails.payment_type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-blue-600">Bank Account</span>
                    <p className="font-medium text-gray-800">
                      {selectedChequeDetails.bank_account?.account_name ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status - Required */}
            {/* <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status Code <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.status ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter status code"
                />
              </div>
              {errors.status ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.status}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Status code for the print queue (e.g., 32 for Account HOD
                  Approval)
                </p>
              )}
            </div> */}

            {/* Queue Date/Time - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Queue Date & Time <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="datetime-local"
                  name="queued_at"
                  value={formData.queued_at || ""}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.queued_at ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {errors.queued_at ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.queued_at}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Date and time when the cheque was queued for printing
                </p>
              )}
            </div>

            {/* Priority - Required */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {formData.priority && (
                      <span className={getPriorityColor(formData.priority)}>
                        {getPriorityLabel(formData.priority)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="range"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  step="1"
                  className="w-full py-2"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>High (1)</span>
                <span>Medium (3-4)</span>
                <span>Low (5+)</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <input
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className={`w-24 px-3 py-1.5 border ${
                    errors.priority ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center`}
                />
                <span className="text-xs text-gray-500">
                  Priority level (1 = Highest, 10 = Lowest)
                </span>
              </div>
              {errors.priority ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.priority}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Printed Status Card (Only show in edit mode if printed) */}
        {isEditMode && formData.printed_at && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Print Status
                </h3>
                <p className="text-sm text-gray-600">
                  This cheque has been printed
                </p>
              </div>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Printed
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-600">
                Printed at: {new Date(formData.printed_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Important Information
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Priority levels: 1-2 (High Priority), 3-4 (Medium Priority),
                5-10 (Low Priority). Status code 32 indicates "Account HOD
                Approval" stage.
              </p>
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Queue" : "Add to Queue"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditPrintQueues;
