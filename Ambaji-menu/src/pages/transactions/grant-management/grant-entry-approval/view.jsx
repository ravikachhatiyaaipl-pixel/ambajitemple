import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  FileText,
  Shield,
  ShieldAlert,
  Check,
  AlertCircle,
  Hash,
  DollarSign,
  Receipt,
  Layers,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { GrantEntryApi } from "../../../services/grantentryapi";

const GrantEntryApprovalView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApproveButton, setShowApproveButton] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [userDesignationName, setUserDesignationName] = useState(null);
  const [userId, setUserId] = useState(null);
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

    // Get user ID from user object
    const currentUserId = user?.apiUserData?.Usr_Id || user?.id;
    setUserId(currentUserId);

    const desigId =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    const parsedDesigId = desigId ? parseInt(desigId) : null;
    setUserDesignationId(parsedDesigId);

    const desigName =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_Desc;
    setUserDesignationName(desigName || "N/A");

    console.log("==  View Page User Info ===");
    console.log("User ID:", currentUserId);
    console.log("User Designation ID:", parsedDesigId);
    console.log("User Designation Name:", desigName);
    console.log("Is Admin:", adminCheck);
    console.log("============================");

    loadMenuAndStage();
  }, [id, user]);

  const loadMenuAndStage = async () => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/grant-management/grant-entry-approval";
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
      const response = await GrantEntryApi.getAllByStage(stage);
      console.log(`Actions for stage ${stage}:`, response);

      if (response.status && response.data) {
        setActionsForStage(response.data);
        console.log("Actions loaded:", response.data.length);
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
      loadEntryData();
    }
  }, [permissionsLoaded, actionsForStage]);

  const loadEntryData = async () => {
    setLoading(true);
    try {
      const response = await GrantEntryApi.getById(id);
      const entryData = response?.data || response;
      setEntry(entryData);
      setEntryLoaded(true);

      console.log("==  Entry Details ===");
      console.log("Entry ID:", entryData.GrTrn_Id);
      console.log("Current Status Action:", entryData.action);
      console.log("Current Status Name:", entryData.action?.St_Name);
      console.log("Current Status ID:", entryData.action?.Act_Id);
      console.log(
        "Current Status Previous:",
        entryData.action?.Previous_Status,
      );
      console.log("=====================");

      // Handle approval permissions - SINGLE next action (not multiple)
      if (entryData.action && actionsForStage.length > 0) {
        const currentAction = entryData.action;

        // Find the next action (where Previous_Status matches current action ID)
        const foundNextAction = actionsForStage.find(
          (action) =>
            action.Previous_Status == currentAction.Act_Id?.toString(),
        );

        if (foundNextAction) {
          setNextAction(foundNextAction);
          console.log("Next Action Found:", foundNextAction.St_Name);

          // Check if user has permission to approve
          if (!isAdmin && userDesignationId) {
            const isAuthority = foundNextAction.authorities_details?.some(
              (auth) => parseInt(auth.Dsg_id) == userDesignationId,
            );
            const canApprove = isAuthority;
            setHasPermission(canApprove);
            setShowApproveButton(canApprove);
            console.log("Can Approve:", canApprove);
          } else if (isAdmin) {
            setHasPermission(true);
            setShowApproveButton(true);
            console.log("Admin - Full Access");
          } else {
            setHasPermission(false);
            setShowApproveButton(false);
          }
        } else {
          console.log("No next action found");
          setShowApproveButton(false);
          setHasPermission(false);
        }
      }
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error("Failed to load entry data!");
      navigate("/transactions/grant-management/grant-entry-approval");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!nextAction) {
      toast.error("Cannot determine next status");
      return;
    }

    console.log("==  Approval Action ===");
    console.log("Approving to:", nextAction.St_Name);
    console.log("Sending Status ID:", nextAction.Act_Id);
    console.log("User ID:", userId);
    console.log("======================");

    const result = await Swal.fire({
      title: `${nextAction.St_Name} Entry?`,
      text: `Are you sure you want to ${nextAction.St_Name.toLowerCase()} this grant entry?`,
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
      await GrantEntryApi.update(id, {
        Status: nextAction.Act_Id,
        Remarks: null,
        GE_HOD: userId,
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

  const getStatusDisplay = () => {
    if (entry?.action) {
      return entry.action.St_Name || "Pending";
    }
    return "Pending";
  };

  // Dynamic status badge - using green for approval page
  const getStatusBadge = () => {
    const statusName = getStatusDisplay();

    // Always use green for approval page as per requirement
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Clock className="h-3 w-3 mr-1" />
        {statusName}
      </span>
    );
  };

  const getBranchDisplay = () => {
    if (!entry?.department) return "N/A";
    const dept = entry.department;
    let displayText = dept.Dpt_Desc || "";
    if (dept.Dpt_Name && dept.Dpt_Name != dept.Dpt_Desc) {
      displayText += ` (${dept.Dpt_Name})`;
    }
    return displayText;
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
            navigate("/transactions/grant-management/grant-entry-approval")
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
                navigate("/transactions/grant-management/grant-entry-approval")
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
                Review and approve grant entry
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 mx-auto max-w-full">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Grant Entry Details
              </h2>
              <div className="flex items-center gap-2">{getStatusBadge()}</div>
            </div>
          </div>

          <div className="p-6">
            {/* Entry Information Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center border-b pb-2">
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                Entry Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Entry Date
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(entry.Date)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Hash className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Financial Year
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {entry.financial_year?.FY_Name || "N/A"}
                  </div>
                  {entry.financial_year?.FY_Code && (
                    <div className="text-xs text-gray-500 mt-1">
                      Code: {entry.financial_year.FY_Code}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Grant Amount
                    </span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(entry.Amount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Grant Details Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center border-b pb-2">
                <Receipt className="h-4 w-4 mr-2 text-purple-600" />
                Grant Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {entry.grant_type && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Grant Type</div>
                    <div className="text-sm font-medium text-gray-900">
                      {entry.grant_type.GT_Name}
                    </div>
                    {entry.grant_type.GT_Code && (
                      <div className="text-xs text-gray-500 mt-1">
                        Code: {entry.grant_type.GT_Code}
                      </div>
                    )}
                  </div>
                )}
                {entry.department && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Branch</div>
                    <div className="text-sm font-medium text-gray-900">
                      {getBranchDisplay()}
                    </div>
                  </div>
                )}
                {entry.budget_head && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">
                      Budget Head
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {entry.budget_head.Gr_Nm}
                    </div>
                    {entry.budget_head.Gr_Cd && (
                      <div className="text-xs text-gray-500 mt-1">
                        Code: {entry.budget_head.Gr_Cd}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Information */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center border-b pb-2">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Created At</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDateTime(entry.created_at)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500">Last Updated</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDateTime(entry.updated_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* HOD Details */}
            {entry.hod && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2 text-green-600" />
                  HOD Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-900">
                    {entry.hod.full_name || entry.hod.Usr_Name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {entry.hod.Usr_Email} | {entry.hod.Usr_Mobile}
                  </div>
                </div>
              </div>
            )}

            {/* Approval Information */}
            {entry.GE_HOD && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Approval Information
                </h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-green-600 font-medium">
                        Approved By
                      </div>
                      <div className="text-sm font-medium text-green-800">
                        {entry?.hod?.Usr_Name}
                      </div>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Approval Button */}
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
                    Review this grant entry and{" "}
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
                      {nextAction.St_Name} this grant entry
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Action Needed Message */}
        {!showApproveButton && entry.action && !nextAction && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  No Action Required
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  This entry has been fully processed and does not require any
                  further approval.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrantEntryApprovalView;
