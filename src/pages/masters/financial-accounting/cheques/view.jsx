import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  User,
  DollarSign,
  Calendar,
  FileText,
  Building2,
  Hash,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Info,
  Banknote,
  Receipt,
  Briefcase,
  MapPin,
  Printer,
  Download,
  Eye,
  Layers,
  Ruler,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Palette,
  Maximize2,
  Minimize2,
  Grid,
  List,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChequesApi } from "../../../services/chequesapi";

const ViewCheques = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cheque, setCheque] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    loadChequeData();
  }, [id]);

  const loadChequeData = async () => {
    setLoading(true);
    try {
      const data = await ChequesApi.getById(id);
      setCheque(data);
    } catch (error) {
      console.error("Error loading cheque:", error);
      toast.error(
        error.response?.data?.message || "Failed to load cheque data!",
      );
      navigate("/masters/financial-accounting/cheques");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCheque = async () => {
    const result = await Swal.fire({
      title: "Delete Cheque?",
      text: `Are you sure you want to delete cheque "${cheque?.cheque_number}"? This action cannot be undone.`,
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
      await ChequesApi.delete(id);
      toast.success(`Cheque "${cheque?.cheque_number}" deleted successfully!`);
      navigate("/masters/financial-accounting/cheques");
    } catch (error) {
      console.error("Error deleting cheque:", error);
      toast.error(error.response?.data?.message || "Failed to delete cheque");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
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

  const getStatusBadge = () => {
    if (cheque?.cleared_date) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4 mr-1" />
          Cleared
        </span>
      );
    }
    if (cheque?.bounce_date) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="h-4 w-4 mr-1" />
          Bounced
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-4 w-4 mr-1" />
        Pending
      </span>
    );
  };

  // Helper function to render format field
  const renderFormatField = (label, value, icon = null, valueClass = "") => {
    if (value == undefined || value == null || value == "") return null;
    return (
      <div className="flex items-start py-2 border-b border-gray-100 last:border-0">
        {icon && <div className="flex-shrink-0 w-7 mt-0.5">{icon}</div>}
        <div className="flex-1">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            {label}
          </span>
          <div
            className={`mt-0.5 text-sm font-medium text-gray-900 ${valueClass}`}
          >
            {typeof value == "boolean" ? (value ? "Yes" : "No") : value}
          </div>
        </div>
      </div>
    );
  };

  // Render field position with proper formatting
  const renderPosition = (label, x, y, width = null, height = null) => {
    if (!x && !y) return null;
    return (
      <div className="bg-gray-50 rounded-lg p-3">
        <span className="text-xs font-medium text-gray-500 block mb-1">
          {label}
        </span>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className="font-mono text-gray-700">X: {x || "N/A"}</span>
          <span className="font-mono text-gray-700">Y: {y || "N/A"}</span>
          {width && <span className="font-mono text-gray-700">W: {width}</span>}
          {height && (
            <span className="font-mono text-gray-700">H: {height}</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading cheque details...</p>
      </div>
    );
  }

  if (!cheque) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">Cheque not found</p>
        <Link
          to="/masters/financial-accounting/cheques"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cheque List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate("/masters/financial-accounting/cheques")}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {cheque?.cheque_number || "N/A"}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    {getStatusBadge()}
                    {cheque?.payment_type && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Banknote className="h-3 w-3 mr-1" />
                        {cheque.payment_type}
                      </span>
                    )}
                    {cheque?.cheque_format?.format_name && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Layers className="h-3 w-3 mr-1" />
                        {cheque.cheque_format.format_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="flex items-center space-x-3">
          <Link
            to={`/masters/financial-accounting/cheques/edit/${id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div> */}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab == "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Details
          </button>
          {cheque?.status_action && (
            <button
              onClick={() => setActiveTab("status")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab == "status"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Status Info
            </button>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab == "details" && (
            <>
              {/* Cheque Information Card */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cheque Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Cheque Number
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 text-lg font-mono font-medium">
                            {cheque?.cheque_number || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Cheque Date
                        </label>
                        <div className="mt-1 flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {formatDate(cheque?.cheque_date)}
                          </span>
                        </div>
                      </div>
                      {cheque?.pdc_clearing_date && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            PDC Clearing Date
                          </label>
                          <div className="mt-1 flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {formatDate(cheque?.pdc_clearing_date)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Payment Type
                        </label>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Banknote className="h-3 w-3 mr-1" />
                            {cheque?.payment_type || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Organization
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {cheque?.organize?.Org_Name ||
                              cheque?.Org_Id ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Print Format
                        </label>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            <Layers className="h-3 w-3 mr-1" />
                            {cheque?.cheque_format?.format_name ||
                              "No Format Assigned"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payee & Amount Card */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payee & Amount Details
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Payee Name
                        </label>
                        <div className="mt-1 flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900 font-medium">
                            {cheque?.SL_Name || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Amount
                        </label>
                        <div className="mt-1">
                          <span className="text-xl font-bold text-green-600">
                            {formatCurrency(cheque?.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Amount in Words
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-700">
                          {cheque?.amount_words || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information Card */}
              {(cheque?.narration ||
                cheque?.ref_doc_number ||
                cheque?.ref_doc_type ||
                cheque?.department ||
                cheque?.cost_centre) && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Additional Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {cheque?.narration && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-500">
                            Narration
                          </label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-700">{cheque.narration}</p>
                          </div>
                        </div>
                      )}
                      {cheque?.ref_doc_number && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Reference Document Number
                          </label>
                          <div className="mt-1 flex items-center">
                            <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {cheque.ref_doc_number}
                            </span>
                          </div>
                        </div>
                      )}
                      {cheque?.ref_doc_type && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Reference Document Type
                          </label>
                          <div className="mt-1">
                            <span className="text-gray-900">
                              {cheque.ref_doc_type}
                            </span>
                          </div>
                        </div>
                      )}
                      {cheque?.department && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Department
                          </label>
                          <div className="mt-1 flex items-center">
                            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {cheque.department}
                            </span>
                          </div>
                        </div>
                      )}
                      {cheque?.cost_centre && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Cost Centre
                          </label>
                          <div className="mt-1 flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {cheque.cost_centre}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cheque Options Card */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cheque Options
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center">
                      {cheque?.is_account_payee ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-gray-700">Account Payee</span>
                    </div>
                    <div className="flex items-center">
                      {cheque?.is_not_negotiable ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-gray-700">Not Negotiable</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab == "bank" && (
            <>
              {/* Bank Account Information */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Bank Account Details
                  </h2>
                </div>
                <div className="p-6">
                  {cheque?.bank_account ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Account Name
                          </label>
                          <div className="mt-1 text-gray-900 font-medium">
                            {cheque.bank_account.account_name}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Account Number
                          </label>
                          <div className="mt-1 text-gray-900 font-mono">
                            {cheque.bank_account.account_number}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Account Type
                          </label>
                          <div className="mt-1 text-gray-900">
                            {cheque.bank_account.account_type}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            IFSC Code
                          </label>
                          <div className="mt-1 text-gray-900 font-mono">
                            {cheque.bank_account.ifsc}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Branch Name
                          </label>
                          <div className="mt-1 text-gray-900">
                            {cheque.bank_account.branch_name}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Bank Name
                          </label>
                          <div className="mt-1 text-gray-900">
                            {cheque.bank_account.bank?.bank_name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>No bank account information available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cheque Format Information - Enhanced */}
              {cheque?.cheque_format && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-purple-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Layers className="h-5 w-5 mr-2 text-purple-600" />
                      Cheque Format Details
                    </h2>
                  </div>
                  <div className="p-6">
                    {/* Format Header */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-purple-900">
                            {cheque.cheque_format.format_name}
                          </h3>
                          {cheque.cheque_format.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {cheque.cheque_format.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {cheque.cheque_format.is_default && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Default
                            </span>
                          )}
                          {cheque.cheque_format.is_active ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Layout Settings */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Ruler className="h-4 w-4 mr-1 text-gray-500" />
                        Page Layout Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">
                            Page Width
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {cheque.cheque_format.page_width_mm} mm
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">
                            Page Height
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {cheque.cheque_format.page_height_mm} mm
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">
                            Top Margin
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {cheque.cheque_format.top_margin_mm} mm
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">
                            Left Margin
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {cheque.cheque_format.left_margin_mm} mm
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Font Settings */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Type className="h-4 w-4 mr-1 text-gray-500" />
                        Font Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs text-gray-500 block">
                            Date Font
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {cheque.cheque_format.date_font_family} (
                            {cheque.cheque_format.date_font_size}px,{" "}
                            {cheque.cheque_format.date_font_weight})
                          </span>
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">
                              Color:{" "}
                            </span>
                            <span
                              className="inline-block w-4 h-4 rounded border border-gray-300 align-middle"
                              style={{
                                backgroundColor:
                                  cheque.cheque_format.date_color,
                              }}
                            ></span>
                            <span className="text-xs text-gray-600 ml-1">
                              {cheque.cheque_format.date_color}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs text-gray-500 block">
                            Payee Font
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {cheque.cheque_format.payee_font_family} (
                            {cheque.cheque_format.payee_font_size}px,{" "}
                            {cheque.cheque_format.payee_font_weight})
                          </span>
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">
                              Color:{" "}
                            </span>
                            <span
                              className="inline-block w-4 h-4 rounded border border-gray-300 align-middle"
                              style={{
                                backgroundColor:
                                  cheque.cheque_format.payee_color,
                              }}
                            ></span>
                            <span className="text-xs text-gray-600 ml-1">
                              {cheque.cheque_format.payee_color}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs text-gray-500 block">
                            Amount Number Font
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {cheque.cheque_format.amount_num_font_family} (
                            {cheque.cheque_format.amount_num_font_size}px,{" "}
                            {cheque.cheque_format.amount_num_font_weight})
                          </span>
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">
                              Color:{" "}
                            </span>
                            <span
                              className="inline-block w-4 h-4 rounded border border-gray-300 align-middle"
                              style={{
                                backgroundColor:
                                  cheque.cheque_format.amount_num_color,
                              }}
                            ></span>
                            <span className="text-xs text-gray-600 ml-1">
                              {cheque.cheque_format.amount_num_color}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs text-gray-500 block">
                            Amount Words Font
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {cheque.cheque_format.amount_word_font_family} (
                            {cheque.cheque_format.amount_word_font_size}px,{" "}
                            {cheque.cheque_format.amount_word_font_weight})
                          </span>
                          <div className="mt-1">
                            <span className="text-xs text-gray-500">
                              Color:{" "}
                            </span>
                            <span
                              className="inline-block w-4 h-4 rounded border border-gray-300 align-middle"
                              style={{
                                backgroundColor:
                                  cheque.cheque_format.amount_word_color,
                              }}
                            ></span>
                            <span className="text-xs text-gray-600 ml-1">
                              {cheque.cheque_format.amount_word_color}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Field Positions */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <AlignLeft className="h-4 w-4 mr-1 text-gray-500" />
                        Field Positions (mm)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {renderPosition(
                          "Date",
                          cheque.cheque_format.date_x,
                          cheque.cheque_format.date_y,
                          cheque.cheque_format.date_width,
                          cheque.cheque_format.date_height,
                        )}
                        {renderPosition(
                          "Payee",
                          cheque.cheque_format.payee_x,
                          cheque.cheque_format.payee_y,
                          cheque.cheque_format.payee_width,
                          cheque.cheque_format.payee_height,
                        )}
                        {renderPosition(
                          "Amount Number",
                          cheque.cheque_format.amount_num_x,
                          cheque.cheque_format.amount_num_y,
                          cheque.cheque_format.amount_num_width,
                          cheque.cheque_format.amount_num_height,
                        )}
                        {renderPosition(
                          "Amount Words",
                          cheque.cheque_format.amount_word_x,
                          cheque.cheque_format.amount_word_y,
                          cheque.cheque_format.amount_word_width,
                          cheque.cheque_format.amount_word_height,
                        )}
                        {cheque.cheque_format.sig1_x &&
                          renderPosition(
                            "Signature 1",
                            cheque.cheque_format.sig1_x,
                            cheque.cheque_format.sig1_y,
                            cheque.cheque_format.sig1_width,
                            cheque.cheque_format.sig1_height,
                          )}
                        {cheque.cheque_format.sig2_x &&
                          renderPosition(
                            "Signature 2",
                            cheque.cheque_format.sig2_x,
                            cheque.cheque_format.sig2_y,
                            cheque.cheque_format.sig2_width,
                            cheque.cheque_format.sig2_height,
                          )}
                      </div>
                    </div>

                    {/* Print Options */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <Printer className="h-4 w-4 mr-1 text-gray-500" />
                        Print Options
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        <div
                          className={`p-3 rounded-lg text-center ${cheque.cheque_format.print_date ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}
                        >
                          <CheckCircle
                            className={`h-5 w-5 mx-auto mb-1 ${cheque.cheque_format.print_date ? "text-green-500" : "text-gray-400"}`}
                          />
                          <span className="text-xs font-medium block">
                            Date
                          </span>
                          <span className="text-xs text-gray-500">
                            {cheque.cheque_format.print_date ? "Yes" : "No"}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-lg text-center ${cheque.cheque_format.print_payee ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}
                        >
                          <CheckCircle
                            className={`h-5 w-5 mx-auto mb-1 ${cheque.cheque_format.print_payee ? "text-green-500" : "text-gray-400"}`}
                          />
                          <span className="text-xs font-medium block">
                            Payee
                          </span>
                          <span className="text-xs text-gray-500">
                            {cheque.cheque_format.print_payee ? "Yes" : "No"}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-lg text-center ${cheque.cheque_format.print_amount_num ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}
                        >
                          <CheckCircle
                            className={`h-5 w-5 mx-auto mb-1 ${cheque.cheque_format.print_amount_num ? "text-green-500" : "text-gray-400"}`}
                          />
                          <span className="text-xs font-medium block">
                            Amount
                          </span>
                          <span className="text-xs text-gray-500">
                            {cheque.cheque_format.print_amount_num
                              ? "Yes"
                              : "No"}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-lg text-center ${cheque.cheque_format.print_amount_words ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}
                        >
                          <CheckCircle
                            className={`h-5 w-5 mx-auto mb-1 ${cheque.cheque_format.print_amount_words ? "text-green-500" : "text-gray-400"}`}
                          />
                          <span className="text-xs font-medium block">
                            Amount Words
                          </span>
                          <span className="text-xs text-gray-500">
                            {cheque.cheque_format.print_amount_words
                              ? "Yes"
                              : "No"}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-lg text-center ${cheque.cheque_format.print_signature ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}
                        >
                          <CheckCircle
                            className={`h-5 w-5 mx-auto mb-1 ${cheque.cheque_format.print_signature ? "text-green-500" : "text-gray-400"}`}
                          />
                          <span className="text-xs font-medium block">
                            Signature
                          </span>
                          <span className="text-xs text-gray-500">
                            {cheque.cheque_format.print_signature
                              ? "Yes"
                              : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab == "status" && cheque?.status_action && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Status Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status Name
                    </label>
                    <div className="mt-1 text-gray-900 font-medium">
                      {cheque.status_action.St_Name}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Stage
                    </label>
                    <div className="mt-1 text-gray-900">
                      {cheque.status_action.stage}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Approval Required
                    </label>
                    <div className="mt-1 text-gray-900">
                      {cheque.status_action.Is_Forward == "Y" ? "Yes" : "No"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Bank Selection Required
                    </label>
                    <div className="mt-1 text-gray-900">
                      {cheque.status_action.Is_Bank_Select == "Y"
                        ? "Yes"
                        : "No"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Timeline/Status Card */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="font-semibold text-gray-900">Status Timeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(cheque?.created_at)}
                    </p>
                  </div>
                </div>

                {cheque?.cleared_date && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Cleared
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(cheque?.cleared_date)}
                      </p>
                    </div>
                  </div>
                )}

                {cheque?.bounce_date && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Bounced
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(cheque?.bounce_date)}
                      </p>
                      {cheque?.bounce_reason && (
                        <p className="text-xs text-red-600 mt-1">
                          {cheque.bounce_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {!cheque?.cleared_date && !cheque?.bounce_date && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Pending
                      </p>
                      <p className="text-xs text-gray-500">
                        Awaiting clearance
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Last Updated
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(cheque?.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Format Info Card - Enhanced with more fields */}
          {cheque?.cheque_format && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-purple-100">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-purple-600" />
                  Format Quick Info
                </h3>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Format Name</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.format_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Page Size</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.page_width_mm} ×{" "}
                    {cheque.cheque_format.page_height_mm} mm
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date Format</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.date_format}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date Font</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.date_font_family} (
                    {cheque.cheque_format.date_font_size}px)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payee Font</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.payee_font_family} (
                    {cheque.cheque_format.payee_font_size}px)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Font</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.amount_num_font_family} (
                    {cheque.cheque_format.amount_num_font_size}px)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Words Font</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.amount_word_font_family} (
                    {cheque.cheque_format.amount_word_font_size}px)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Print Date</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.print_date ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Print Payee</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.print_payee ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Print Amount</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.print_amount_num ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Print Words</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.print_amount_words ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Print Signature</span>
                  <span className="font-medium text-gray-900">
                    {cheque.cheque_format.print_signature ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Clock component for pending status
const Clock = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default ViewCheques;
