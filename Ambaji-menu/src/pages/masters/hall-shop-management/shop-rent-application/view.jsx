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
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import ShopRentApplicationApi from "../../../services/shoprentapplicationapi";

const ViewShopRentApplication = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Shop Rent Application");
  const [activityLogs, setActivityLogs] = useState([]);

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
      const res = await ShopRentApplicationApi.getById(id);
      const data = res?.data;
      setItem(data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/shop-rent-application");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Delete Application?`,
      text: `Are you sure you want to delete this application for "${item?.Busi_Name}"? This action cannot be undone.`,
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
      await ShopRentApplicationApi.delete(id);
      toast.success("Application deleted successfully!");
      navigate("/masters/hall-shop-management/shop-rent-application");
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
    
    // Priority: r_status (backward/query status) first
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
    // Query remark only shows when r_status exists
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
        {item.SPRA_R_Status && !item.r_status && (
          <div className="text-xs text-gray-400 mt-1">
            Next: Pending
          </div>
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
            to="/masters/hall-shop-management/shop-rent-application"
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
              navigate("/masters/hall-shop-management/shop-rent-application")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Shop Rent Application Details
            </h1>
            <p className="text-gray-600 mt-1">
              Application for{" "}
              <span className="font-semibold">{item.Busi_Name}</span>
              <button
                onClick={() => copyToClipboard(item.Busi_Name)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Copy business name"
              >
                <Copy className="h-3 w-3 inline" />
              </button>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/masters/hall-shop-management/shop-rent-application/edit/${id}`}
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
                    {formatDate(item.SPRA_Date)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Business Name</p>
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900">
                    {item.Busi_Name}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Business Type</p>
                <span className="text-sm text-gray-900">
                  {item.Busi_Type || "—"}
                </span>
              </div>
              <div className="flex-1 min-w-[150px] px-4 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Rental Details Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Rental Details
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Shop</p>
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.rental?.shop?.SPM_Name || "N/A"}
                  </span>
                </div>
               
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Rental Details</p>
                <div className="text-sm text-gray-900">
                  <div>Rent: {formatCurrency(item.rental?.SPR_BsRnt)}</div>
                  <div className="text-xs text-gray-500">
                    Security Deposit: {item.rental?.SPR_SDMnt || "N/A"} months
                  </div>
                  {item.rental?.SPR_TaxP && (
                    <div className="text-xs text-gray-500">
                      Tax: {item.rental.SPR_TaxP}%
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Rental Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {formatDate(item.rental?.SPR_Date)}
                  </span>
                </div>
                {item.rental?.SPR_DuDt && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Due: {formatDate(item.rental.SPR_DuDt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lease Details Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Lease Details
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Start Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(item.SPR_StDt)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.SPR_Dura} months
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">
                  End Date (Estimated)
                </p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.SPR_StDt
                      ? new Date(
                          new Date(item.SPR_StDt).setMonth(
                            new Date(item.SPR_StDt).getMonth() +
                              parseInt(item.SPR_Dura || 0),
                          ),
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        {(item.SPRA_Reason ||
          item.SPRA_Remark ||
          item.applicant ||
          item.hod) && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Additional Information
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.applicant && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Applicant</p>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {item.applicant.Usr_Name}
                      </span>
                    </div>
                  </div>
                )}
                {item.hod && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Approved By</p>
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {item.hod.Usr_Name}
                      </span>
                    </div>
                    {item.SPRA_HDT && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Date: {formatDate(item.SPRA_HDT)}
                      </div>
                    )}
                  </div>
                )}
                {item.SPRA_Reason && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Reason</p>
                    <div className="text-sm text-gray-900">
                      {item.SPRA_Reason}
                    </div>
                  </div>
                )}
                {item.SPRA_Remark && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Remark</p>
                    <div className="text-sm text-gray-900">
                      {item.SPRA_Remark}
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

export default ViewShopRentApplication;