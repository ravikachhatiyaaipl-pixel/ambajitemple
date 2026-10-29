import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Building, User, Clock, Hash,
  CheckCircle, XCircle, Info, AlertCircle, Printer, Copy,
  UserCheck, ShieldAlert, MessageSquare, HelpCircle, Check,
  X, Users
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import HallRentApplicationApi from "../../../services/hall-rent-application-api";
import { getDesignationId, isAdminUser, canApproveAction } from "../../../../utils/approvalPermission";

const HallRentApplicationApprovalView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Hall Rent Application Approval");
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

    setUserDesignationId(getDesignationId(user));

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
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/masters/hall-shop-management/hall-rent-application-approval";
      const currentMenuItem = menuDetails.find(item => item.Menu_Links == currentPath);

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
      const response = await HallRentApplicationApi.getActionsByStage(stage);
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
      const res = await HallRentApplicationApi.getById(id);
      const data = res?.data;
      setItem(data);
      checkPermissions(data);
    } catch (error) {
      toast.error("Failed to load data");
      navigate("/masters/hall-shop-management/hall-rent-application-approval");
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = (data = item) => {
    if (!data || actionsList.length == 0) return;

    const currentStatusId = data.HLRA_Status?.toString();

    const forwardAction = actionsList.find(
      action => action.Previous_Status == currentStatusId && action.Is_Forward == "Y"
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
      action => action.Previous_Status == currentStatusId && action.Is_Forward == "N"
    );

    if (backwardActionData) {
      setBackwardAction(backwardActionData);
      setShowQueryButton(true);

      const firstStepStatus = parseInt(backwardActionData.Previous_Status);
      const firstStepAction = actionsList.find(
        action => parseInt(action.Act_Id) == firstStepStatus
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
      title: `${nextAction.St_Name} Application?`,
      text: `Are you sure you want to ${nextAction.St_Name.toLowerCase()} this hall rent application?`,
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
        HLRA_Status: nextAction.Act_Id,
        HLRA_R_Status: null,
        Status_Remark: null,
      };

      await HallRentApplicationApi.updateStatus(id, updateData);

      toast.success(`Application ${nextAction.St_Name.toLowerCase()} successfully!`);

      setShowApproveButton(false);
      setNextAction(null);
      setBackwardAction(null);
      setShowQueryButton(false);
      setQueryReturnStatus(null);
      await loadData();
    } catch (error) {
      console.error("Error approving:", error);
      toast.error(error.response?.data?.message || `Failed to ${nextAction.St_Name.toLowerCase()} application`);
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
        HLRA_Status: queryReturnStatus,
        HLRA_R_Status: backwardAction.Act_Id,
        Status_Remark: queryRemark.trim(),
      };

      await HallRentApplicationApi.updateStatus(id, updateData);

      toast.success("Query raised successfully! Application returned to previous stage.");

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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-6">The application with ID #{id} does not exist.</p>
          <Link
            to="/masters/hall-shop-management/hall-rent-application-approval"
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
            onClick={() => navigate("/masters/hall-shop-management/hall-rent-application-approval")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Approval</h1>
            <p className="text-gray-600 mt-1">
              Application for <span className="font-semibold">{item.rental?.hall?.HLM_Name || "N/A"}</span>
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
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Application Information Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Application Information</h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-0 divide-x divide-gray-200 flex-wrap">
              <div className="flex-1 min-w-[150px] px-4 first:pl-0 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Application Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900">{formatDate(item.HLRA_Date)}</span>
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
                  <span className="text-sm text-gray-900">{item.applicant?.Usr_Name || "N/A"}</span>
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
            <h2 className="text-base font-semibold text-gray-900">Event Details</h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Event Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{formatDate(item.HLRA_StDt)}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Event Type</p>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{item.HLRA_Type || "N/A"}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Event Mode</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{item.HLRA_Mode || "N/A"}</span>
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
              <h2 className="text-base font-semibold text-gray-900">Rental Details</h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Rental Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-900">{formatDate(item.rental.HLR_Date)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Full Day Rent</p>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.rental.HLR_FDR)}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Half Day Rent</p>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.rental.HLR_HDR)}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Hourly Rent</p>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.rental.HLR_HHR)}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Tax %</p>
                  <span className="text-sm font-medium text-gray-900">{item.rental.HLR_TXP || "0"}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information Card */}
        {(item.HLRA_Reason || item.HLRA_Remark) && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Additional Information</h2>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.HLRA_Reason && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Reason</p>
                    <div className="text-sm text-gray-900">{item.HLRA_Reason}</div>
                  </div>
                )}
                {item.HLRA_Remark && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Remark</p>
                    <div className="text-sm text-gray-900">{item.HLRA_Remark}</div>
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
              <h2 className="text-lg font-semibold text-gray-900">Approval Actions</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Review this hall rent application and take appropriate action
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
            <h3 className="text-lg font-semibold text-gray-900">No Action Required</h3>
            <p className="text-gray-600 text-sm mt-1">
              This application has been fully processed and does not require any further approval.
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

export default HallRentApplicationApprovalView;