import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Shield,
  ShieldAlert,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { TenderEmdBgApi } from "../../../services/tenderemdbgapi";

const ViewTenderEmdBgHodApproval = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApproveButton, setShowApproveButton] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [userDesignationName, setUserDesignationName] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [nextAction, setNextAction] = useState(null);
  const [actionsForStage, setActionsForStage] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [entryLoaded, setEntryLoaded] = useState(false);

  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);

    const deptId =
      user?.departmentData?.Dpt_id ||
      user?.apiUserData?.employee?.department?.Dpt_id;
    const parsedDeptId = deptId ? parseInt(deptId) : null;
    setUserDeptId(parsedDeptId);

    const desigId =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    const parsedDesigId = desigId ? parseInt(desigId) : null;
    setUserDesignationId(parsedDesigId);

    const desigName =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_Desc;
    setUserDesignationName(desigName || "N/A");

    loadMenuAndStage();
  }, [id, user]);

  const loadMenuAndStage = async () => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/tender-management/tender-emd-bg-hod-approval";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem?.action?.stage) {
        const stage = currentMenuItem.action.stage;
        setCurrentStage(stage);
        console.log("Current Stage from menu action:", stage);
        await loadActionsForStage(stage);
      } else {
        console.log("No stage found in menu action");
        setPermissionsLoaded(true);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
      setPermissionsLoaded(true);
    }
  };

  const loadActionsForStage = async (stage) => {
    try {
      const response = await TenderEmdBgApi.getAllByStage(stage);
      console.log(`Actions for stage ${stage}:`, response);

      if (response.status && response.data) {
        setActionsForStage(response.data);
      }
      setPermissionsLoaded(true);
    } catch (error) {
      console.error("Error loading actions:", error);
      setPermissionsLoaded(true);
    }
  };

  // Load entry data after actions are loaded
  useEffect(() => {
    if (permissionsLoaded && actionsForStage.length > 0 && !entryLoaded) {
      loadEntryData();
    } else if (permissionsLoaded && actionsForStage.length == 0) {
      // If no actions found, still try to load entry
      loadEntryData();
    }
  }, [permissionsLoaded, actionsForStage]);

  const loadEntryData = async () => {
    setLoading(true);
    try {
      const response = await TenderEmdBgApi.getById(id);
      const entryData = response?.data || response;
      setEntry(entryData);
      setEntryLoaded(true);

      if (entryData.status_action && actionsForStage.length > 0) {
        const currentAction = entryData.status_action;

        // Find the next action (where Previous_Status matches current action ID)
        const foundNextAction = actionsForStage.find(
          (action) => action.Previous_Status == currentAction.Act_Id.toString(),
        );

        if (foundNextAction) {
          setNextAction(foundNextAction);

          // Check if user has permission to perform the NEXT action
          if (!isAdmin && userDesignationId && userDeptId) {
            const deptMatch = parseInt(foundNextAction.Dpt_id) == userDeptId;

            const isAuthority = foundNextAction.authorities_details?.some(
              (auth) => parseInt(auth.Dsg_id) == userDesignationId,
            );

            const canApprove = deptMatch && isAuthority;
            setHasPermission(canApprove);
            setShowApproveButton(canApprove);
          } else if (isAdmin) {
            setHasPermission(true);
            setShowApproveButton(true);
          } else {
            setHasPermission(false);
            setShowApproveButton(false);
          }
        } else {
          setShowApproveButton(false);
          setHasPermission(false);
        }
      } else {
        if (actionsForStage.length == 0) {
          console.log("Waiting for actions to load...");
        }
      }
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error("Failed to load entry data!");
      navigate("/transactions/tender-management/tender-emd-bg-hod-approval");
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
      title: `${nextAction.St_Name} Entry?`,
      text: `Are you sure you want to ${nextAction.St_Name.toLowerCase()} this EMD/BG receipt entry?`,
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
      await TenderEmdBgApi.update(id, {
        Status: nextAction.Act_Id,
        Remarks: null,
      });

      console.log(
        "Approval successful - Status updated to:",
        nextAction.Act_Id,
      );
      toast.success(`Entry ${nextAction.St_Name.toLowerCase()} successfully!`);

      // Reset states and reload
      setShowApproveButton(false);
      setEntryLoaded(false);
      await loadEntryData();
    } catch (error) {
      console.error("Error approving:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${nextAction.St_Name.toLowerCase()} entry`,
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
        month: "long",
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
    if (!amount && amount != 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getAddDeductBadge = (tetCd) => {
    if (tetCd == "Credit") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Credit
        </span>
      );
    } else if (tetCd == "Debit") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Debit
        </span>
      );
    }
    return null;
  };

  // Get status display text from status_action
  const getStatusDisplay = () => {
    if (entry?.status_action) {
      return entry.status_action.St_Name || "Unknown";
    }
    return "Unknown";
  };

  // Get status badge based on action
  const getStatusBadge = () => {
    const statusName = getStatusDisplay();

    const statusColors = {
      "EMD Receipt": { color: "blue", icon: Clock },
      Verification: { color: "yellow", icon: Clock },
      Approval: { color: "green", icon: CheckCircle },
      Rejected: { color: "red", icon: XCircle },
    };

    const config = statusColors[statusName] || { color: "gray", icon: Clock };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {statusName}
      </span>
    );
  };

  if (loading || !permissionsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
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
        <button
          onClick={() =>
            navigate(
              "/transactions/tender-management/tender-emd-bg-hod-approval",
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
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate(
                  "/transactions/tender-management/tender-emd-bg-hod-approval",
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
                Review and approve EMD/BG receipt entry
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Header for Tracking */}
      <div className="bg-gray-100 border-b px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="font-medium">👤 User:</span>
            <span>Dept ID: {userDeptId || "N/A"}</span>
            <span>Desg ID: {userDesignationId || "N/A"}</span>
            <span>Desg: {userDesignationName}</span>
            <span>Stage: {currentStage || "N/A"}</span>
            {nextAction && (
              <span className="text-green-600">
                Next Action: {nextAction.St_Name}
              </span>
            )}
            {hasPermission && (
              <span className="text-blue-600 font-medium">
                ✅ Has Permission
              </span>
            )}
            {!hasPermission && nextAction && (
              <span className="text-red-600 font-medium">❌ No Permission</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 w-full">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b w-full flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              EMD/BG Receipt Information
            </h2>
            <div className="flex items-center gap-2">
              {getAddDeductBadge(entry.TET_CD)}
              {getStatusBadge()}
            </div>
          </div>

          <div className="p-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(entry.TES_Date)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {formatDate(entry.TEE_Date)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMD Amount
                </div>
                <div className="text-base font-bold text-green-600">
                  {formatCurrency(entry.EMD_Amt)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200 w-full">
              {entry?.subledger && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <User className="h-4 w-4 mr-2 text-purple-600" />
                    Subledger Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.subledger.SL_Name}
                    </div>
                  </div>
                </div>
              )}

              {entry?.tender && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Tender Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-900">
                      {entry.tender.Description}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <div className="text-xs text-gray-500">
                          Proposal Amount
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(entry.tender.Proposal_Amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Approved Amount
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(entry.tender.Approved_Amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {entry.TET_HDT && (
              <div className="mt-6 pt-6 border-t border-gray-200 w-full">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-600" />
                  Approval Information
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">
                    Approved Date
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {formatDateTime(entry.TET_HDT)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showApproveButton && nextAction && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <ShieldAlert className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {nextAction.St_Name} Required
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Review this EMD/BG receipt entry and{" "}
                    {nextAction.St_Name.toLowerCase()}
                  </p>
                </div>

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
                      {isUpdating ? "Processing..." : nextAction.St_Name}
                    </div>
                    <div className="text-xs font-normal opacity-90 mt-0.5">
                      {nextAction.St_Name} this EMD/BG entry
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {!showApproveButton &&
          entry.status_action &&
          entry.status_action.Previous_Status && (
            <div className="mt-6 flex justify-center">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center max-w-md">
                <div className="inline-flex p-3 bg-gray-200 rounded-full mb-3">
                  {entry.status_action.St_Name.toLowerCase().includes(
                    "approv",
                  ) ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {entry.status_action.St_Name}
                </h3>
                <p className="text-sm text-gray-500">
                  This entry has already been{" "}
                  {entry.status_action.St_Name.toLowerCase()}.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ViewTenderEmdBgHodApproval;
