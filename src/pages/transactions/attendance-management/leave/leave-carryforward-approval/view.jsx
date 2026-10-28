// leave-carryforward-approval/view.jsx - COMPLETE WITH ACTION MASTER
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, CheckCircle, XCircle, User, FileText,
  Shield, ShieldAlert, Check, AlertCircle, Tag, Briefcase, Building,
  Printer, UserCheck, HelpCircle, DollarSign, MessageSquare, TrendingUp,
  TrendingDown, Wallet,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LeaveCarryForwardApi } from "../../../../services/leavecarryforwardapi";
import PrintLayout from "../../../../../components/printlayout";
import { useOrganization } from "../../../../../hooks/useorganization";

const APPROVAL_PATH = "/transactions/attendance-management/leave/leave-carryforward-approval";

const LeaveCarryForwardApprovalView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [userDesignationName, setUserDesignationName] = useState(null);
  const [nextAction, setNextAction] = useState(null);
  const [backwardAction, setBackwardAction] = useState(null);
  const [actionsForStage, setActionsForStage] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [entryLoaded, setEntryLoaded] = useState(false);
  const [queryModal, setQueryModal] = useState(false);
  const [queryRemark, setQueryRemark] = useState("");
  const [queryReturnStatus, setQueryReturnStatus] = useState(null);
  const [showApproveButton, setShowApproveButton] = useState(false);
  const [showQueryButton, setShowQueryButton] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pageTitle, setPageTitle] = useState("Leave Carry Forward Approval");
  const queryRemarkRef = useRef(null);

  // Initialize user data
  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);

    const deptId = user?.departmentData?.Dpt_id || 
                   user?.apiUserData?.employee?.department?.Dpt_id;
    setUserDeptId(deptId ? parseInt(deptId) : null);

    const desigId = user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    setUserDesignationId(desigId ? parseInt(desigId) : null);
    setUserDesignationName(
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_Desc || "N/A"
    );

    loadMenuAndStage();
  }, [id, user]);

  const loadMenuAndStage = async () => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const menuItem = menuDetails.find((i) => i.Menu_Links == APPROVAL_PATH);
      
      if (menuItem) {
        setPageTitle(menuItem.Fnc_Title || "Leave Carry Forward Approval");
        
        if (menuItem.action?.stage) {
          const stage = menuItem.action.stage;
          setCurrentStage(stage);
          await loadActionsForStage(stage);
          return;
        }
      }
      setPermissionsLoaded(true);
    } catch (error) {
      console.error("Error loading menu:", error);
      setPermissionsLoaded(true);
    }
  };

  const loadActionsForStage = async (stage) => {
    try {
      const response = await LeaveCarryForwardApi.getAllByStage(stage);
      if (response.status && response.data) {
        setActionsForStage(response.data);
      }
    } catch (error) {
      console.error("Error loading actions:", error);
    } finally {
      setPermissionsLoaded(true);
    }
  };

  // =================== BACKWARD FLOW HELPERS ====================

  const getFinalBackwardStatus = (currentStatusId) => {
    const currentBackwardAction = actionsForStage.find(
      (action) => action.Previous_Status == currentStatusId?.toString() && 
                  action.Is_Forward == "N"
    );

    if (!currentBackwardAction) return null;

    const firstStepStatus = parseInt(currentBackwardAction.Previous_Status);
    const firstStepAction = actionsForStage.find(
      (action) => parseInt(action.Act_Id) == firstStepStatus
    );

    if (firstStepAction && firstStepAction.Previous_Status) {
      return parseInt(firstStepAction.Previous_Status);
    }
    return firstStepStatus;
  };

  const getBackwardActionDisplay = (currentStatusId) => {
    const currentBackwardAction = actionsForStage.find(
      (action) => action.Previous_Status == currentStatusId?.toString() && 
                  action.Is_Forward == "N"
    );

    if (!currentBackwardAction) return null;

    const firstStepStatus = parseInt(currentBackwardAction.Previous_Status);
    const firstStepAction = actionsForStage.find(
      (action) => parseInt(action.Act_Id) == firstStepStatus
    );

    if (firstStepAction && firstStepAction.Previous_Status) {
      return {
        ...currentBackwardAction,
        _isTwoStepJump: true,
        _intermediateStatus: firstStepStatus,
        _intermediateActionName: firstStepAction.St_Name,
      };
    }
    return currentBackwardAction;
  };

  const checkIfFinalApproval = (currentAction, allActions) => {
    const hasNextAction = allActions.some(
      (action) => action.Previous_Status == currentAction.Act_Id?.toString()
    );
    return !hasNextAction;
  };

  // Load entry data after actions are loaded
  useEffect(() => {
    if (permissionsLoaded && actionsForStage.length > 0 && !entryLoaded) {
      loadEntryData();
    } else if (permissionsLoaded && actionsForStage.length == 0) {
      loadEntryData();
    }
  }, [permissionsLoaded, actionsForStage]);

  const loadEntryData = async () => {
    setLoading(true);
    setEntryLoaded(false);
    try {
      const response = await LeaveCarryForwardApi.getById(id);
      const entryData = response?.data || response;
      setEntry(entryData);

      if (entryData.status_data && actionsForStage.length > 0) {
        const currentStatusId = entryData.status_data.Act_Id?.toString();

        // =================== FORWARD ACTION (APPROVE) ===================
        const forwardActionData = actionsForStage.find(
          (action) => action.Previous_Status == currentStatusId && 
                      action.Is_Forward == "Y"
        );

        if (forwardActionData) {
          setNextAction(forwardActionData);

          if (!isAdmin && userDesignationId) {
            const isAuthority = forwardActionData.authorities_details?.some(
              (auth) => parseInt(auth.Dsg_id) == userDesignationId
            );
            setShowApproveButton(isAuthority);
          } else if (isAdmin) {
            setShowApproveButton(true);
          } else {
            setShowApproveButton(false);
          }
        } else {
          setNextAction(null);
          setShowApproveButton(false);
        }

        // =================== BACKWARD ACTION (QUERY) ===================
        const backwardActionData = getBackwardActionDisplay(currentStatusId);

        if (backwardActionData) {
          setBackwardAction(backwardActionData);
          setShowQueryButton(true);
          setQueryReturnStatus(getFinalBackwardStatus(currentStatusId));
        } else {
          setBackwardAction(null);
          setShowQueryButton(false);
          setQueryReturnStatus(null);
        }
      }

      setEntryLoaded(true);
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error("Failed to load entry data!");
      navigate(APPROVAL_PATH);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!nextAction) {
      toast.error("Cannot determine next status");
      return;
    }

    const result = await Swal.fire({
      title: `${nextAction.St_Name} Carry Forward Request?`,
      html: `
        <div class="text-left">
          <p>Are you sure you want to <strong>${nextAction.St_Name.toLowerCase()}</strong> this carry forward request?</p>
          <div class="bg-gray-50 p-3 rounded-lg mt-3">
            <p class="text-sm"><strong>Employee:</strong> ${entry.employee?.First_Name || ""} ${entry.employee?.Last_Name || ""}</p>
            <p class="text-sm"><strong>Leave Type:</strong> ${entry.leave_type?.LT_name || "N/A"}</p>
            <p class="text-sm"><strong>Days:</strong> ${entry.Tr_Days} days</p>
          </div>
        </div>
      `,
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
        Status: nextAction.Act_Id,
        R_Status: null,
        Tr_HOD: user?.apiUserData?.Usr_Id,
        Status_Remark: null,
      };

      await LeaveCarryForwardApi.updateStatus(id, updateData);

      const isFinal = checkIfFinalApproval(nextAction, actionsForStage);

      if (isFinal) {
        toast.success(`Carry forward request ${nextAction.St_Name.toLowerCase()} successfully! Transaction is now complete.`);
      } else {
        toast.success(`Carry forward request ${nextAction.St_Name.toLowerCase()} successfully!`);
      }

      setShowApproveButton(false);
      setNextAction(null);
      setBackwardAction(null);
      setShowQueryButton(false);
      setQueryReturnStatus(null);
      setEntryLoaded(false);
      await loadEntryData();
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
    setTimeout(() => {
      if (queryRemarkRef.current) queryRemarkRef.current.focus();
    }, 100);
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
    if (!queryReturnStatus) {
      toast.error("Cannot determine return status");
      return;
    }

    setIsUpdating(true);
    try {
      await LeaveCarryForwardApi.updateStatus(id, {
        Status: queryReturnStatus,
        R_Status: backwardAction?.Act_Id,
        Status_Remark: queryRemark,
        Tr_HOD: user?.apiUserData?.Usr_Id,
      });

      if (backwardAction?._isTwoStepJump) {
        toast.success(`Query raised successfully! Request returned to ${backwardAction._intermediateActionName} stage.`);
      } else {
        toast.success(`Query raised successfully! Request returned to previous stage.`);
      }

      closeQueryModal();
      setShowApproveButton(false);
      setNextAction(null);
      setBackwardAction(null);
      setShowQueryButton(false);
      setQueryReturnStatus(null);
      setEntryLoaded(false);
      await loadEntryData();
    } catch (error) {
      console.error("Error raising query:", error);
      toast.error(error.response?.data?.message || "Failed to raise query");
    } finally {
      setIsUpdating(false);
    }
  };

  // Utility functions
  const formatDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateTime = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusDisplay = () => {
    if (entry?.r_status) return entry.r_status.St_Name || "Pending";
    if (entry?.status_data) return entry.status_data.St_Name || "Pending";
    return "Pending";
  };

  const getStatusBadge = () => {
    const statusName = getStatusDisplay();
    const statusLower = statusName.toLowerCase();

    let colorClass = "bg-yellow-100 text-yellow-800";
    let icon = <Clock className="h-3 w-3 mr-1" />;

    if (statusLower.includes("approv") || statusLower.includes("accept")) {
      colorClass = "bg-green-100 text-green-800";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
    } else if (statusLower.includes("reject") || statusLower.includes("query")) {
      colorClass = "bg-red-100 text-red-800";
      icon = <XCircle className="h-3 w-3 mr-1" />;
    } else if (statusLower.includes("pend") || statusLower.includes("wait")) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (statusLower.includes("verif") || statusLower.includes("check")) {
      colorClass = "bg-blue-100 text-blue-800";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {icon}
        {statusName}
      </span>
    );
  };

  if (loading || !permissionsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-900">Not Found</h2>
        <button onClick={() => navigate(APPROVAL_PATH)} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Query Modal */}
      {queryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                  <MessageSquare className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{backwardAction?.St_Name || "Raise Query"}</h3>
                  {backwardAction?._isTwoStepJump && (
                    <p className="text-xs text-gray-500 mt-0.5">This will return to {backwardAction._intermediateActionName} stage</p>
                  )}
                </div>
              </div>
              <button onClick={closeQueryModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Please provide details for returning this request to the previous stage.</p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query / Remark <span className="text-red-500">*</span>
              </label>
              <textarea
                ref={queryRemarkRef}
                rows={4}
                value={queryRemark}
                onChange={(e) => setQueryRemark(e.target.value)}
                placeholder="Enter your query details here..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">This remark will be visible to the requester.</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={closeQueryModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
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
      )}

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(APPROVAL_PATH)} className="mr-4 p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
              {currentStage && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Stage: {currentStage} | Dept: {userDeptId || "N/A"} | Desg: {userDesignationId || "N/A"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowPrint(true)} className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                <h2 className="text-base font-semibold text-gray-900">Request Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Employee</label>
                      <div className="mt-1 flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {entry.employee?.First_Name || ""} {entry.employee?.Last_Name || ""}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Department</label>
                      <div className="mt-1 flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{entry.employee?.department?.Dpt_Desc || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
                      <div className="mt-1">{getStatusBadge()}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Submitted On</label>
                      <div className="mt-1 flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatDateTime(entry.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {entry.Status_Remark && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <HelpCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Query / Remark</label>
                        <p className="text-sm text-amber-900 mt-1">{entry.Status_Remark}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Carry Forward Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                <h2 className="text-base font-semibold text-gray-900">Carry Forward Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Leave Type</label>
                    <div className="mt-1 flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{entry.leave_type?.LT_name || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Financial Year</label>
                    <div className="mt-1 flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{entry.financial_year?.FY_Code || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Transaction Date</label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{formatDate(entry.Tr_Date)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Carry Forward Days</label>
                    <p className="mt-1 text-2xl font-bold text-teal-600">{entry.Tr_Days} days</p>
                  </div>
                </div>
                {entry.Remarks && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Remarks</label>
                    <p className="mt-1 text-sm text-gray-900">{entry.Remarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Actions */}
          <div className="space-y-6">
            {(showApproveButton || showQueryButton) && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-teal-50 to-white">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center mr-3">
                      <ShieldAlert className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Request Actions</h2>
                      <p className="text-xs text-gray-500">Review and take appropriate action</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {showApproveButton && nextAction && (
                    <button
                      onClick={handleApprove}
                      disabled={isUpdating}
                      className="w-full px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center font-medium"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <div className="font-bold text-base">{nextAction.St_Name}</div>
                        <div className="text-xs font-normal opacity-90">Forward to next stage</div>
                      </div>
                    </button>
                  )}
                  {showQueryButton && backwardAction && (
                    <button
                      onClick={openQueryModal}
                      disabled={isUpdating}
                      className="w-full px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 flex items-center justify-center font-medium"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <div className="font-bold text-base">{backwardAction.St_Name}</div>
                        <div className="text-xs font-normal opacity-90">
                          {backwardAction._isTwoStepJump ? `Return to ${backwardAction._intermediateActionName} stage` : "Return to previous stage"}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Approver Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-teal-600 mr-2" />
                  <h2 className="text-base font-semibold text-gray-900">Approver Information</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Your Designation</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{userDesignationName}</p>
                </div>
                {currentStage && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Current Stage</label>
                    <p className="text-sm text-gray-900 mt-1">{currentStage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCarryForwardApprovalView;