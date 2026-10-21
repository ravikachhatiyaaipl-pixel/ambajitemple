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
  ShieldAlert,
  MessageSquare,
  HelpCircle,
  Check,
  Users
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentApplicationApi from "../../../services/hall-rent-application-api";

const ViewHallRentApplication = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Hall Rent Application");

  const userId = (() => {
    if (user?.apiUserData?.Usr_Id) return user.apiUserData.Usr_Id;
    if (user?.Usr_Id) return user.Usr_Id;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.Usr_Id || userData.apiUserData?.Usr_Id || null;
      } catch (e) {}
    }
    return null;
  })();

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentApplicationApi.getById(id);
      const data = res?.data;
      setItem(data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rent-application");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete Application?`,
      text: `Are you sure you want to delete this hall rent application? This action cannot be undone.`,
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
      await HallRentApplicationApi.delete(id);
      toast.success("Application deleted successfully!");
      navigate("/masters/hall-shop-management/hall-rent-application");
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
        <p className="mt-4 text-gray-600">Loading application details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Application Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The application with ID #{id} does not exist.
          </p>
          <Link
            to="/masters/hall-shop-management/hall-rent-application"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
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
              navigate("/masters/hall-shop-management/hall-rent-application")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hall Rent Application Details
            </h1>
            <p className="text-gray-600 mt-1">
              Application for{" "}
              <span className="font-semibold">{item.rental?.hall?.HLM_Name || "N/A"}</span>
              <button
                onClick={() => copyToClipboard(item.rental?.hall?.HLM_Name || "")}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Copy hall name"
              >
                <Copy className="h-3 w-3 inline" />
              </button>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/hall-shop-management/hall-rent-application/edit/${id}`}
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
        {/* Application Information Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Application Information
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-0 divide-x divide-gray-200 flex-wrap">
              <div className="flex-1 min-w-[150px] px-4 first:pl-0 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Application Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">
                    {formatDate(item.HLRA_Date)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Hall</p>
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">
                    {item.rental?.hall?.HLM_Name || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Applicant</p>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">
                    {item.applicant?.Usr_Name || "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Event Details Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Event Details
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Event Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(item.HLRA_StDt)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Event Type</p>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.HLRA_Type || "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Event Mode</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.HLRA_Mode || "N/A"}
                  </span>
                </div>
              </div>
              {item.HLRA_SlSt && item.HLRA_SlEd && (
                <div className="col-span-full">
                  <p className="text-xs text-gray-500 mb-0.5">Time Slot</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatTime(item.HLRA_SlSt)} - {formatTime(item.HLRA_SlEd)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rental Details Card */}
        {item.rental && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Rental Details
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Rental Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatDate(item.rental.HLR_Date)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Full Day Rent</p>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.rental.HLR_FDR)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Half Day Rent</p>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.rental.HLR_HDR)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Hourly Rent</p>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.rental.HLR_HHR)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Tax %</p>
                  <span className="text-sm font-medium text-gray-900">
                    {item.rental.HLR_TXP || "0"}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information Card */}
        {(item.HLRA_Reason || item.HLRA_Remark) && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Additional Information
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.HLRA_Reason && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Reason</p>
                    <div className="text-sm text-gray-900">
                      {item.HLRA_Reason}
                    </div>
                  </div>
                )}
                {item.HLRA_Remark && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Remark</p>
                    <div className="text-sm text-gray-900">
                      {item.HLRA_Remark}
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

export default ViewHallRentApplication;