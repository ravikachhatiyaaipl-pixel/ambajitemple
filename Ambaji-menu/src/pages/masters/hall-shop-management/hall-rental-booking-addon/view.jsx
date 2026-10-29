import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Building,
  Package,
  DollarSign,
  Percent,
  Hash,
  Copy,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentalBookingAddonApi from "../../../services/hall-rental-booking-addon-api";

const ViewHallRentalBookingAddon = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Hall Rental Booking Addon");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentalBookingAddonApi.getById(id);
      const data = res?.data;
      setItem(data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rental-booking-addon");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete Addon?`,
      text: `Are you sure you want to delete "${item?.addon?.HLA_Name}" from this booking? This action cannot be undone.`,
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
      await HallRentalBookingAddonApi.delete(id);
      toast.success("Addon deleted successfully!");
      navigate("/masters/hall-shop-management/hall-rental-booking-addon");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading addon details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Addon Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The addon with ID #{id} does not exist.
          </p>
          <Link
            to="/masters/hall-shop-management/hall-rental-booking-addon"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Addons
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
              navigate("/masters/hall-shop-management/hall-rental-booking-addon")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Booking Addon Details
            </h1>
            <p className="text-gray-600 mt-1">
              Addon:{" "}
              <span className="font-semibold">{item.addon?.HLA_Name || "N/A"}</span>
              <button
                onClick={() => copyToClipboard(item.addon?.HLA_Name || "")}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Copy addon name"
              >
                <Copy className="h-3 w-3 inline" />
              </button>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/hall-shop-management/hall-rental-booking-addon/edit/${id}`}
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
        {/* Addon Information Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Addon Information
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-0 divide-x divide-gray-200 flex-wrap">
              <div className="flex-1 min-w-[150px] px-4 first:pl-0 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Addon Name</p>
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">
                    {item.addon?.HLA_Name || "N/A"}
                  </span>
                </div>
                {item.addon?.HLA_Code && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Code: {item.addon.HLA_Code}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Serial Number</p>
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.HLBA_Sr || "-"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.HLA_Amt)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Quantity</p>
                <span className="text-sm font-medium text-gray-900">
                  {item.HLA_Qty || 1}
                </span>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Tax</p>
                <div className="flex items-center gap-1">
                  <Percent className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.HLA_TXP || "0"}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Information Card */}
        {item.booking && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Booking Information
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Event Name</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {item.booking.HLRB_EvNm || "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Event Type</p>
                  <span className="text-sm text-gray-900">
                    {item.booking.HLRB_EvTy || "N/A"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Booking Date</p>
                  <span className="text-sm text-gray-900">
                    {formatDate(item.booking.HLRB_Date)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Hall</p>
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {item.booking.hall?.HLM_Name || "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Mode</p>
                  <span className="text-sm text-gray-900">
                    {item.booking.HLRB_Mode || "N/A"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                  <span className="text-sm text-gray-900">
                    {formatDate(item.booking.HLRB_StDt)} - {formatDate(item.booking.HLRB_EdDt)}
                  </span>
                </div>
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
                  {formatDate(item.created_at)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Last Updated</p>
                <span className="text-sm text-gray-900">
                  {formatDate(item.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHallRentalBookingAddon;