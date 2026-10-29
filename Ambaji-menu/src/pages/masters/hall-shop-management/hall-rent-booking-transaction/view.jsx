import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Building,
  DollarSign,
  Hash,
  CreditCard,
  Receipt,
  Copy,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentBookingTransactionApi from "../../../services/hall-rent-booking-transaction-api";

const ViewHallRentBookingTransaction = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Hall Rent Booking Transaction");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentBookingTransactionApi.getById(id);
      const data = res?.data;
      setItem(data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rent-booking-transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete Transaction?`,
      text: `Are you sure you want to delete this transaction? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await HallRentBookingTransactionApi.delete(id);
      toast.success("Transaction deleted successfully!");
      navigate("/masters/hall-shop-management/hall-rent-booking-transaction");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeLabel = (type) => {
    const types = {
      SD: "Security Deposit",
      Rent: "Rent",
      Adj: "Adjustment",
      FFT: "Food & Facility Tax",
      LtFe: "Late Fee",
      Tax: "Tax",
      Trf: "Transfer",
      AdOn: "Add-on",
      Rfnd: "Refund",
      RfCn: "Refund Cancellation",
    };
    return types[type] || type || "N/A";
  };

  const getTypeBadge = (type) => {
    const colors = {
      SD: "bg-blue-100 text-blue-800",
      Rent: "bg-green-100 text-green-800",
      Adj: "bg-yellow-100 text-yellow-800",
      FFT: "bg-purple-100 text-purple-800",
      LtFe: "bg-red-100 text-red-800",
      Tax: "bg-orange-100 text-orange-800",
      Trf: "bg-indigo-100 text-indigo-800",
      AdOn: "bg-pink-100 text-pink-800",
      Rfnd: "bg-teal-100 text-teal-800",
      RfCn: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusDisplay = () => {
    if (!item) return "Pending";

    if (item.r_status) {
      return item.r_status.St_Name || "Pending";
    }
    if (item.status) {
      return item.status.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = () => {
    if (!item) return null;

    const statusName = getStatusDisplay();
    const hasQuery = item.r_status && item.HLRBTRN_Status_Remark;
    let colorClass = "bg-yellow-100 text-yellow-800";
    const statusLower = statusName.toLowerCase();

    if (statusLower.includes("approv") || statusLower.includes("accept")) {
      colorClass = "bg-green-100 text-green-800";
    } else if (
      statusLower.includes("reject") ||
      statusLower.includes("deny") ||
      statusLower.includes("query")
    ) {
      colorClass = "bg-red-100 text-red-800";
    } else if (statusLower.includes("pend") || statusLower.includes("wait")) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (statusLower.includes("verif") || statusLower.includes("check")) {
      colorClass = "bg-blue-100 text-blue-800";
    }

    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
        >
          <Clock className="h-4 w-4 mr-2" />
          {statusName}
        </span>
        {hasQuery && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            Query: {item.HLRBTRN_Status_Remark}
          </span>
        )}
      </div>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading transaction details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Transaction Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The transaction with ID #{id} does not exist.
          </p>
          <Link
            to="/masters/hall-shop-management/hall-rent-booking-transaction"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/masters/hall-shop-management/hall-rent-booking-transaction",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Transaction Details
            </h1>
            <p className="text-gray-600 mt-1">
              Bill:{" "}
              <span className="font-semibold">
                {item.HLRBTRN_BlNo || "N/A"}
              </span>
              <button
                onClick={() => copyToClipboard(item.HLRBTRN_BlNo || "")}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Copy bill number"
              >
                <Copy className="h-3 w-3 inline" />
              </button>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/hall-shop-management/hall-rent-booking-transaction/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Transaction Information Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Transaction Information
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-0 divide-x divide-gray-200 flex-wrap">
              <div className="flex-1 min-w-[150px] px-4 first:pl-0 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Transaction Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">
                    {formatDate(item.HLRBTRN_Date)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Transaction Type</p>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(item.HLRBTRN_Type)}`}
                  >
                    {getTypeLabel(item.HLRBTRN_Type)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(item.HLRBTRN_Amt)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Credit / Debit</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.HLRBTRN_CD == "C" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {item.HLRBTRN_CD == "C" ? "Credit" : "Debit"}
                </span>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Related Records Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Related Records
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {item.booking && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Booking</p>
                  <div className="flex items-center gap-1">
                    <Receipt className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {item.booking.HLRB_EvNm || "N/A"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.booking.HLRB_EvTy || "N/A"} -{" "}
                    {formatDate(item.booking.HLRB_Date)}
                  </div>
                </div>
              )}
              {item.hall && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Hall</p>
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {item.hall.HLM_Name || "N/A"}
                    </span>
                  </div>
                  {item.hall.HLM_Code && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Code: {item.hall.HLM_Code}
                    </div>
                  )}
                </div>
              )}
              {item.recovery_center && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    Recovery Center
                  </p>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {item.recovery_center.CCC_Name || "N/A"}
                    </span>
                  </div>
                  {item.recovery_center.CCC_Code && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Code: {item.recovery_center.CCC_Code}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        {item.HLRBTRN_Remark && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Additional Information
              </h2>
            </div>
            <div className="px-5 py-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Remark</p>
                <div className="text-sm text-gray-900">
                  {item.HLRBTRN_Remark}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Details */}
        {(item.hod || item.HLRBTRN_HOD) && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Approval Details
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.hod && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Approved By</p>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {item.hod.Usr_Name || "N/A"}
                      </span>
                    </div>
                  </div>
                )}
                {item.HLRBTRN_HDT && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">
                      Approval Date
                    </p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(item.HLRBTRN_HDT)}
                      </span>
                    </div>
                  </div>
                )}
                {item.HLRBTRN_Status_Remark && (
                  <div className="col-span-full">
                    <p className="text-xs text-gray-500 mb-0.5">
                      Status Remark
                    </p>
                    <div className="text-sm text-gray-900">
                      {item.HLRBTRN_Status_Remark}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Creation Details */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Record Details
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Created At</p>
                <span className="text-sm text-gray-900">
                  {formatDateTime(item.created_at)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Last Updated</p>
                <span className="text-sm text-gray-900">
                  {formatDateTime(item.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHallRentBookingTransaction;
