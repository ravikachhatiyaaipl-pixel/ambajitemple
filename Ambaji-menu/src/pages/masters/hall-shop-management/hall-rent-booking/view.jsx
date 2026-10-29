import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Building,
  User,
  Clock,
  Hash,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Printer,
  Copy,
  UserCheck,
  DollarSign,
  Percent,
  Tag,
  FileText
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentBookingApi from "../../../services/hall-rent-booking-api";

const ViewHallRentBooking = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Hall Rent Booking");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentBookingApi.getById(id);
      const data = res?.data;
      setItem(data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rent-booking");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete Booking?`,
      text: `Are you sure you want to delete this booking for "${item?.HLRB_EvNm}"? This action cannot be undone.`,
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
      await HallRentBookingApi.delete(id);
      toast.success("Booking deleted successfully!");
      navigate("/masters/hall-shop-management/hall-rent-booking");
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

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
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
    const hasQuery = item.r_status && item.Status_Remark;
    let colorClass = "bg-yellow-100 text-yellow-800";
    const statusLower = statusName.toLowerCase();

    if (statusLower.includes("approv") || statusLower.includes("accept")) {
      colorClass = "bg-green-100 text-green-800";
    } else if (statusLower.includes("reject") || statusLower.includes("deny") || statusLower.includes("query")) {
      colorClass = "bg-red-100 text-red-800";
    } else if (statusLower.includes("pend") || statusLower.includes("wait")) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (statusLower.includes("verif") || statusLower.includes("check")) {
      colorClass = "bg-blue-100 text-blue-800";
    }

    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
          <Clock className="h-4 w-4 mr-2" />
          {statusName}
        </span>
        {hasQuery && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            Query: {item.Status_Remark}
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
        <p className="mt-4 text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The booking with ID #{id} does not exist.
          </p>
          <Link
            to="/masters/hall-shop-management/hall-rent-booking"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
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
              navigate("/masters/hall-shop-management/hall-rent-booking")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hall Rent Booking Details
            </h1>
            <p className="text-gray-600 mt-1">
              Booking for{" "}
              <span className="font-semibold">{item.HLRB_EvNm}</span>
              <button
                onClick={() => copyToClipboard(item.HLRB_EvNm)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Copy event name"
              >
                <Copy className="h-3 w-3 inline" />
              </button>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/hall-shop-management/hall-rent-booking/edit/${id}`}
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
        {/* Booking Information Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Booking Information
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-0 divide-x divide-gray-200 flex-wrap">
              <div className="flex-1 min-w-[150px] px-4 first:pl-0 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Booking Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">
                    {formatDate(item.HLRB_Date)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Event Name</p>
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">
                    {item.HLRB_EvNm}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Event Type</p>
                <span className="text-sm text-gray-900">
                  {item.HLRB_EvTy || "—"}
                </span>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Hall & Application Info */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Hall & Application Details
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Hall</p>
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.hall?.HLM_Name || "N/A"}
                  </span>
                </div>
                {item.hall?.HLM_Code && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Code: {item.hall.HLM_Code}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Application</p>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    #{item.HLRA_Id} - {item.application?.rental?.hall?.HLM_Name || "N/A"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Applicant: {item.application?.applicant?.Usr_Name || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time Details */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Date & Time Details
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Start Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(item.HLRB_StDt)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">End Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(item.HLRB_EdDt)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Mode</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.HLRB_Mode || "N/A"}
                  </span>
                </div>
              </div>
              {item.HLRB_SLSt && item.HLRB_SlEd && (
                <div className="col-span-full">
                  <p className="text-xs text-gray-500 mb-0.5">Time Slot</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatTime(item.HLRB_SLSt)} - {formatTime(item.HLRB_SlEd)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Financial Details
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Hall Rent</p>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.HLRB_HlRt)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Security Deposit</p>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.HLRB_HlSd)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Cleaning Charges</p>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.HLRB_HClC)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Tax</p>
                <span className="text-sm font-medium text-gray-900">
                  {item.HLRB_TaxP || "0"}%
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Security Status</p>
                  <span className="text-sm font-medium text-gray-900">
                    {item.HLRB_SdStt || "—"}
                  </span>
                </div>
                {item.hod && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Approved By</p>
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {item.hod.Usr_Name || "N/A"}
                      </span>
                    </div>
                    {item.HLRB_HDT && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Date: {formatDate(item.HLRB_HDT)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        {(item.HLRB_Reason || item.HLRB_Remark) && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Additional Information
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.HLRB_Reason && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Reason</p>
                    <div className="text-sm text-gray-900">
                      {item.HLRB_Reason}
                    </div>
                  </div>
                )}
                {item.HLRB_Remark && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Remark</p>
                    <div className="text-sm text-gray-900">
                      {item.HLRB_Remark}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewHallRentBooking;