import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  Percent,
  DollarSign,
  Edit,
  Calendar,
  Copy,
  AlertCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  Tag,
  User,
  Check,
  X,
  Shield,
  Building,
  Hash,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { tenderPenaltyApi } from "../../../services/tenderpenaltyapi";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ViewTenderPenaltyHodApproval = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [penalty, setPenalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadPenaltyData();
  }, [id]);

  const loadPenaltyData = async () => {
    setLoading(true);
    try {
      const data = await tenderPenaltyApi.getById(id);

      if (data) {
        // Map API response
        if (data.Add_Deduct == "A") data.Add_Deduct = "Add";
        if (data.Add_Deduct == "D") data.Add_Deduct = "Deduct";
        if (data.Fix_Per == "F") data.fix_per = "Fixed";
        if (data.Fix_Per == "P") data.fix_per = "Per";

        setShowActionButtons(data.Status?.toLowerCase() == "draft");
      }

      setPenalty(data);
    } catch (error) {
      toast.error("Failed to load tender adjustment data!");
      navigate(
        "/transactions/tender-management/work-order-penalty-hod-approval",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePenalty = async () => {
    const result = await Swal.fire({
      title: "Delete Tender Adjustment?",
      text: `Are you sure you want to delete adjustment "${penalty?.Bill_No || "ID: " + penalty?.TA_Id}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await tenderPenaltyApi.delete(id);
        toast.success("Tender adjustment deleted successfully!");
        navigate(
          "/transactions/tender-management/work-order-penalty-hod-approval",
        );
      } catch (error) {
        toast.error(error.message || "Failed to delete tender adjustment");
      }
    }
  };

  const handleApprove = async () => {
    const result = await Swal.fire({
      title: "Approve Tender Adjustment?",
      text: "Are you sure you want to approve this tender adjustment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tender-adjustments/${id}/status`,
        {
          Status: "hod_app",
          Remarks: null,
        },
        {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
      );

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Tender adjustment approved successfully!",
          icon: "success",
          confirmButtonColor: "#10B981",
        });
        loadPenaltyData();
        setShowActionButtons(false);
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error approving:", error);
      toast.error(
        error.response?.data?.message || "Failed to approve tender adjustment",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const openRejectModal = () => {
    setRejectModal(true);
    setRejectReason("");
  };

  const closeRejectModal = () => {
    setRejectModal(false);
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide rejection reason");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tender-adjustments/${id}/status`,
        {
          Status: "hod_rej",
          Remarks: rejectReason,
        },
        {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
      );

      if (response.data.success) {
        toast.success("Tender adjustment rejected!");
        closeRejectModal();
        loadPenaltyData();
        setShowActionButtons(false);
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error rejecting:", error);
      toast.error(
        error.response?.data?.message || "Failed to reject tender adjustment",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Draft",
      },
      hod_app: {
        color: "bg-green-100 text-green-800",
        label: "Approved",
      },
      hod_rej: {
        color: "bg-red-100 text-red-800",
        label: "Rejected",
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!penalty) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-900">Not Found</h2>
        <button
          onClick={() =>
            navigate(
              "/transactions/tender-management/work-order-penalty-hod-approval",
            )
          }
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate(
                  "/transactions/tender-management/work-order-penalty-hod-approval",
                )
              }
              className="mr-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                HOD Approval
              </h1>
              <p className="text-sm text-gray-500">
                Review and approve/reject tender adjustment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 mx-auto">
        {/* Penalty Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 w-full">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b w-full flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Penalty Information
            </h2>
            {/* Status Badge moved inside the card header */}
            {getStatusBadge(penalty.Status)}
          </div>

          <div className="p-6 w-full">
            {/* First Row - Date, Bill No, Sub-Ledger Name, Tender Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {/* Date */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(penalty.TA_Date)}
                </div>
              </div>

              {/* Bill No */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill No
                </div>
                <div className="flex items-center">
                  <span className="text-base font-semibold text-gray-900">
                    {penalty.Bill_No || "—"}
                  </span>
                  {penalty.Bill_No && (
                    <button
                      onClick={() => handleCopyToClipboard(penalty.Bill_No)}
                      className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Copy bill number"
                    >
                      <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Ledger Name */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub-Ledger Name
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {penalty.subledger?.SL_Name || "N/A"}
                </div>
              </div>

              {/* Tender Description - Now in the same row */}
              <div className="space-y-1 lg:col-span-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tender Description
                </div>
                <div className="text-base font-medium text-gray-900 line-clamp-2">
                  {penalty.work_allocation?.tender?.Description || "N/A"}
                </div>
              </div>
            </div>

            {/* Calculation Details */}
            <div className="mt-6 pt-6 border-t border-gray-200 w-full">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <Calculator className="h-4 w-4 mr-2 text-purple-600" />
                Calculation Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {/* Calculation Type */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calculation Type
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {penalty.fix_per == "Per" ? "Percentage" : "Fixed Amount"}
                  </div>
                </div>

                {/* Adjustment Type */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustment Type
                  </div>
                  <div
                    className={`text-base font-semibold ${
                      penalty.Add_Deduct == "Add"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {penalty.Add_Deduct}
                  </div>
                </div>

                {/* WO Amount */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Order Amount
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {formatCurrency(penalty.WO_Amount)}
                  </div>
                </div>

                {/* Adjustment Amount */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustment Amount
                  </div>
                  <div
                    className={`text-base font-bold ${
                      penalty.Add_Deduct == "Add"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {penalty.Add_Deduct == "Add" ? "+" : "-"}{" "}
                    {formatCurrency(penalty.Adj_Amount)}
                  </div>
                  {penalty.Fix_Per == "P" && penalty.Percentage && (
                    <div className="text-xs text-gray-500 mt-1">
                      ({penalty.Percentage}% of WO Amount)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* HOD Info if exists */}
            {(penalty.HOD_Officer ||
              penalty.HOD_Approved ||
              penalty.HOD_Reject) && (
              <div className="mt-6 pt-6 border-t border-gray-200 w-full">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-600" />
                  Approval Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {penalty.HOD_Officer && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">
                        HOD Officer
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {penalty.HOD_Officer}
                      </div>
                    </div>
                  )}
                  {penalty.HOD_Approved && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">
                        Approved Date
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {formatDateTime(penalty.HOD_Approved)}
                      </div>
                    </div>
                  )}
                  {penalty.HOD_Reject && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">
                        Rejected Date
                      </div>
                      <div className="text-sm font-medium text-red-600">
                        {formatDateTime(penalty.HOD_Reject)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Reason Display */}
        {penalty.Status?.toLowerCase() == "hod_rej" && penalty.Remarks && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-red-700 mb-1">
                  Rejection Reason
                </div>
                <div className="text-sm text-red-600">{penalty.Remarks}</div>
              </div>
            </div>
          </div>
        )}

        {/* HOD Approval Actions */}
        {showActionButtons && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <ShieldAlert className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    HOD Approval Required
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Review this tender adjustment and take decision
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleApprove}
                    disabled={isUpdating}
                    className="w-full px-4 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    ) : (
                      <Check className="h-5 w-5 mr-3" />
                    )}
                    <div className="text-left">
                      <div className="font-bold text-base">
                        {isUpdating ? "Processing..." : "Approve"}
                      </div>
                      <div className="text-xs font-normal opacity-90 mt-0.5">
                        Approve this tender adjustment
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={openRejectModal}
                    disabled={isUpdating}
                    className="w-full px-4 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <X className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-bold text-base">Reject</div>
                      <div className="text-xs font-normal opacity-90 mt-0.5">
                        Reject with reason
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Already Processed Message */}
        {!showActionButtons && penalty.Status?.toLowerCase() != "draft" && (
          <div className="mt-6 flex justify-center">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center max-w-md">
              <div className="inline-flex p-3 bg-gray-200 rounded-full mb-3">
                {penalty.Status == "hod_app" ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {penalty.Status == "hod_app"
                  ? "Already Approved"
                  : "Already Rejected"}
              </h3>
              <p className="text-sm text-gray-500">
                This adjustment has been{" "}
                {penalty.Status == "hod_app" ? "approved" : "rejected"} and
                cannot be modified.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Reject Tender Adjustment
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Please provide reason for rejection
              </p>
            </div>

            <div className="p-6">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-32 text-sm"
                autoFocus
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={closeRejectModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTenderPenaltyHodApproval;
