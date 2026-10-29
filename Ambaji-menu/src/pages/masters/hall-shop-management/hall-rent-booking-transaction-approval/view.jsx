import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Copy,
  UserCheck,
  ShieldAlert,
  MessageSquare,
  HelpCircle,
  Check,
  X,
  DollarSign,
  CreditCard,
  Receipt,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentBookingTransactionApi from "../../../services/hall-rent-booking-transaction-api";
import { getDesignationId, isAdminUser, canApproveAction } from "../../../../utils/approvalPermission";

const HallRentBookingTransactionApprovalView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState(
    "Hall Rent Booking Transaction Approval",
  );
  const [showApproveButton, setShowApproveButton] = useState(false);
  const [showQueryButton, setShowQueryButton] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [queryModal, setQueryModal] = useState(false);
  const [queryRemark, setQueryRemark] = useState("");
  const [queryReturnStatus, setQueryReturnStatus] = useState(null);
  const [backwardAction, setBackwardAction] = useState(null);
  const [nextAction, setNextAction] = useState(null);
  const [actionsList, setActionsList] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

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
    const adminCheck = isAdminUser(user);
    setIsAdmin(adminCheck);

    const desigId =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    setUserDesignationId(desigId ? parseInt(desigId) : null);

    loadMenuAndStage();
  }, [user]);

  useEffect(() => {
    if (permissionsLoaded && actionsList.length > 0) {
      checkPermissions();
    }
  }, [permissionsLoaded, actionsList, item]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadMenuAndStage = async () => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/masters/hall-shop-management/hall-rent-booking-transaction-approval";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem?.action?.stage) {
        const stage = currentMenuItem.action.stage;
        setCurrentStage(stage);
        await loadActionsForStage(stage);
      }
      setPermissionsLoaded(true);
    } catch (error) {
      console.error("Error loading menu:", error);
      setPermissionsLoaded(true);
    }
  };

  const loadActionsForStage = async (stage) => {
    try {
      const response =
        await HallRentBookingTransactionApi.getActionsByStage(stage);
      if (response.status && response.data) {
        setActionsList(response.data);
      }
    } catch (error) {
      console.error("Error loading actions:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await HallRentBookingTransactionApi.getById(id);
      const data = res?.data;
      setItem(data);
      checkPermissions(data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate(
        "/masters/hall-shop-management/hall-rent-booking-transaction-approval",
      );
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = (data = item) => {
    if (!data || actionsList.length == 0) return;

    const currentStatusId = data.HLRBTRN_Status?.toString();

    const forwardAction = actionsList.find(
      (action) =>
        action.Previous_Status == currentStatusId && action.Is_Forward == "Y",
    );

    if (forwardAction) {
      setNextAction(forwardAction);

      const allowed = canApproveAction(user, forwardAction);
      setHasPermission(allowed);
      setShowApproveButton(allowed);
    } else {
      setNextAction(null);
      setShowApproveButton(false);
      setHasPermission(false);
    }

    const backwardActionData = actionsList.find(
      (action) =>
        action.Previous_Status == currentStatusId && action.Is_Forward == "N",
    );

    if (backwardActionData) {
      setBackwardAction(backwardActionData);
      setShowQueryButton(true);

      const firstStepStatus = parseInt(backwardActionData.Previous_Status);
      const firstStepAction = actionsList.find(
        (action) => parseInt(action.Act_Id) == firstStepStatus,
      );
      if (firstStepAction && firstStepAction.Previous_Status) {
        setQueryReturnStatus(parseInt(firstStepAction.Previous_Status));
      } else {
        setQueryReturnStatus(firstStepStatus);
      }
    } else {
      setBackwardAction(null);
      setShowQueryButton(false);
      setQueryReturnStatus(null);
    }
  };

  const handleApprove = async () => {
    if (!nextAction) {
      toast.error("Cannot determine next status");
      return;
    }

    const result = await Swal.fire({
      title: `${nextAction.St_Name} Transaction?`,
      text: `Are you sure you want to ${nextAction.St_Name.toLowerCase()} this transaction?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${nextAction.St_Name}`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsUpdating(true);
    try {
      const updateData = {
        HLRBTRN_Status: nextAction.Act_Id,
        HLRBTRN_R_Status: null,
        HLRBTRN_Status_Remark: null,
        HLRBTRN_HOD: userId,
        HLRBTRN_HDT: new Date().toISOString().split("T")[0],
      };

      await HallRentBookingTransactionApi.updateStatus(id, updateData);

      toast.success(
        `Transaction ${nextAction.St_Name.toLowerCase()} successfully!`,
      );

      setShowApproveButton(false);
      setNextAction(null);
      setBackwardAction(null);
      setShowQueryButton(false);
      setQueryReturnStatus(null);
      await loadData();
    } catch (error) {
      console.error("Error approving:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${nextAction.St_Name.toLowerCase()} transaction`,
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const openQueryModal = () => {
    setQueryModal(true);
    setQueryRemark("");
  };

  const closeQueryModal = () => {
    setQueryModal(false);
    setQueryRemark("");
  };

  const handleRaiseQuery = async () => {
    if (!queryRemark.trim()) {
      toast.error("Please provide query details");
      return;
    }

    if (!queryReturnStatus || !backwardAction) {
      toast.error("Cannot determine return status");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        HLRBTRN_Status: queryReturnStatus,
        HLRBTRN_R_Status: backwardAction.Act_Id,
        HLRBTRN_Status_Remark: queryRemark.trim(),
        HLRBTRN_HOD: userId,
        HLRBTRN_HDT: new Date().toISOString().split("T")[0],
      };

      await HallRentBookingTransactionApi.updateStatus(id, updateData);

      toast.success(
        "Query raised successfully! Transaction returned to previous stage.",
      );

      closeQueryModal();
      setShowApproveButton(false);
      setNextAction(null);
      setBackwardAction(null);
      setShowQueryButton(false);
      setQueryReturnStatus(null);
      await loadData();
    } catch (error) {
      console.error("Error raising query:", error);
      toast.error(error.response?.data?.message || "Failed to raise query");
    } finally {
      setIsUpdating(false);
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
            to="/masters/hall-shop-management/hall-rent-booking-transaction-approval"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Approvals
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
                "/masters/hall-shop-management/hall-rent-booking-transaction-approval",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Transaction Approval
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
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
                      <UserCheck className="h-3 w-3 text-gray-400" />
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

        {/* Approval Actions */}
        {(showApproveButton || showQueryButton) && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                <ShieldAlert className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Approval Actions
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Review this transaction and take appropriate action
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
              {showQueryButton && backwardAction && (
                <div className="flex-1 w-full md:w-auto max-w-xs">
                  <button
                    onClick={openQueryModal}
                    disabled={isUpdating}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        {isUpdating ? "Processing..." : backwardAction.St_Name}
                      </div>
                      <div className="text-[10px] font-normal opacity-80">
                        Return to previous stage
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {!showQueryButton && <div className="flex-1"></div>}

              {showApproveButton && nextAction && (
                <div className="flex-1 w-full md:w-auto max-w-xs">
                  <button
                    onClick={handleApprove}
                    disabled={isUpdating}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        {isUpdating ? "Processing..." : nextAction.St_Name}
                      </div>
                      <div className="text-[10px] font-normal opacity-80">
                        Forward to next stage
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {!showApproveButton && <div className="flex-1"></div>}
            </div>
          </div>
        )}

        {/* No Action Required Message */}
        {!showApproveButton && !showQueryButton && item.status && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              No Action Required
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              This transaction has been fully processed and does not require any
              further approval.
            </p>
          </div>
        )}
      </div>

      {/* Query Modal */}
      {queryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {backwardAction?.St_Name || "Raise Query"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Please provide details for returning to previous stage
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={queryRemark}
                  onChange={(e) => setQueryRemark(e.target.value)}
                  placeholder="Enter your query details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-32"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  This will be saved as Status_Remark in the activity log
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeQueryModal}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRaiseQuery}
                  disabled={isUpdating || !queryRemark.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {backwardAction?.St_Name || "Raise Query"}
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

export default HallRentBookingTransactionApprovalView;
