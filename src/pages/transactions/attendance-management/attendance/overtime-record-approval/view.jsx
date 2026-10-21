// overtime-record-approval/view.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
  Printer,
  UserCheck,
  MessageSquare,
  HelpCircle,
  Watch,
  Briefcase,
  Info,
  Sunrise,
  Sunset,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { OverTimeRecordApi } from "../../../../services/overtimerecordapi";
import PrintLayout from "../../../../../components/printlayout";
import { useOrganization } from "../../../../../hooks/useorganization";

const OverTimeRecordApprovalView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [userDesignationName, setUserDesignationName] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
  const [pageTitle, setPageTitle] = useState("Overtime Record Approval");

  const queryRemarkRef = useRef(null);

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
        "/transactions/attendance-management/attendance/overtime-record-approval";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem) {
        setPageTitle(currentMenuItem.Fnc_Title || "Overtime Record Approval");

        if (currentMenuItem?.action?.stage) {
          const stage = currentMenuItem.action.stage;
          setCurrentStage(stage);
          await loadActionsForStage(stage);
        } else {
          setPermissionsLoaded(true);
        }
      } else {
        setPermissionsLoaded(true);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
      setPermissionsLoaded(true);
    }
  };

  const loadActionsForStage = async (stage) => {
    try {
      const response = await OverTimeRecordApi.getAllByStage(stage);

      if (response.status && response.data) {
        setActionsForStage(response.data);
      }
      setPermissionsLoaded(true);
    } catch (error) {
      console.error("Error loading actions:", error);
      setPermissionsLoaded(true);
    }
  };

  useEffect(() => {
    if (permissionsLoaded && actionsForStage.length > 0 && !entryLoaded) {
      loadEntryData();
    } else if (permissionsLoaded && actionsForStage.length == 0) {
      loadEntryData();
    }
  }, [permissionsLoaded, actionsForStage]);

  const getFinalBackwardStatus = (currentStatusId) => {
    const currentBackwardAction = actionsForStage.find(
      (action) =>
        action.Previous_Status == currentStatusId?.toString() &&
        action.Is_Forward == "N",
    );

    if (!currentBackwardAction) {
      return null;
    }

    const firstStepStatus = parseInt(currentBackwardAction.Previous_Status);
    const firstStepAction = actionsForStage.find(
      (action) => parseInt(action.Act_Id) == firstStepStatus,
    );

    if (firstStepAction && firstStepAction.Previous_Status) {
      const secondStepStatus = parseInt(firstStepAction.Previous_Status);
      return secondStepStatus;
    } else {
      return firstStepStatus;
    }
  };

  const getBackwardActionDisplay = (currentStatusId) => {
    const currentBackwardAction = actionsForStage.find(
      (action) =>
        action.Previous_Status == currentStatusId?.toString() &&
        action.Is_Forward == "N",
    );

    if (!currentBackwardAction) {
      return null;
    }

    const firstStepStatus = parseInt(currentBackwardAction.Previous_Status);
    const firstStepAction = actionsForStage.find(
      (action) => parseInt(action.Act_Id) == firstStepStatus,
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

  const loadEntryData = async () => {
    setLoading(true);
    setEntryLoaded(false);
    try {
      const response = await OverTimeRecordApi.getById(id);
      setEntry(response);

      if (response.status_rel && actionsForStage.length > 0) {
        const currentStatusId = response.status_rel.Act_Id?.toString();

        const forwardActionData = actionsForStage.find(
          (action) =>
            action.Previous_Status == currentStatusId &&
            action.Is_Forward == "Y",
        );

        if (forwardActionData) {
          setNextAction(forwardActionData);

          if (!isAdmin && userDesignationId) {
            const isAuthority = forwardActionData.authorities_details?.some(
              (auth) => parseInt(auth.Dsg_id) == userDesignationId,
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

        const backwardActionData = getBackwardActionDisplay(currentStatusId);

        if (backwardActionData) {
          setBackwardAction(backwardActionData);
          setShowQueryButton(true);
          const finalReturnStatus = getFinalBackwardStatus(currentStatusId);
          setQueryReturnStatus(finalReturnStatus);
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
      navigate(
        "/transactions/attendance-management/attendance/overtime-record-approval",
      );
    } finally {
      setLoading(false);
    }
  };

  const openQueryModal = () => {
    setQueryModal(true);
    setQueryRemark("");
    setTimeout(() => {
      if (queryRemarkRef.current) {
        queryRemarkRef.current.focus();
      }
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
      const updateData = {
        Status: queryReturnStatus,
        R_Status: backwardAction?.Act_Id,
        Status_Remark: queryRemark,
        OTR_HOD: user?.apiUserData?.Usr_Id,
      };

      await OverTimeRecordApi.updateStatus(id, updateData);

      if (backwardAction?._isTwoStepJump) {
        toast.success(
          `Query raised successfully! Record returned to ${backwardAction._intermediateActionName} stage.`,
        );
      } else {
        toast.success(
          `Query raised successfully! Record returned to previous stage.`,
        );
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

  const handleApprove = async () => {
    if (!nextAction) {
      toast.error("Cannot determine next status");
      return;
    }

    const result = await Swal.fire({
      title: `${nextAction.St_Name} Record?`,
      text: `Are you sure you want to ${nextAction.St_Name.toLowerCase()} this overtime record?`,
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
        OTR_HOD: user?.apiUserData?.Usr_Id,
        Status_Remark: null,
      };

      await OverTimeRecordApi.updateStatus(id, updateData);

      toast.success(`Record ${nextAction.St_Name.toLowerCase()} successfully!`);

      setShowApproveButton(false);
      setNextAction(null);
      setBackwardAction(null);
      setShowQueryButton(false);
      setQueryReturnStatus(null);
      setEntryLoaded(false);
      await loadEntryData();
    } catch (error) {
      console.error("Error approving:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${nextAction.St_Name.toLowerCase()} record`,
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
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      if (
        typeof timeString == "string" &&
        timeString.match(/^\d{2}:\d{2}:\d{2}$/)
      ) {
        const [hours, minutes] = timeString.split(":");
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0);
        return date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
      return timeString;
    } catch {
      return timeString || "N/A";
    }
  };

  const formatOvertimeHours = (hours) => {
    if (!hours && hours != 0) return "0:00";
    if (typeof hours == "string" && hours.includes(":")) {
      return hours;
    }
    const decimal = parseFloat(hours);
    const hrs = Math.floor(decimal);
    const mins = Math.round((decimal - hrs) * 60);
    return `${hrs}:${mins.toString().padStart(2, "0")}`;
  };

  const getStatusDisplay = () => {
    if (entry?.r_status_rel) {
      return entry?.r_status_rel.St_Name || "Pending";
    }
    if (entry?.status_rel) {
      return entry.status_rel.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = () => {
    const statusName = getStatusDisplay();
    let colorClass = "bg-yellow-100 text-yellow-800";
    const statusLower = statusName.toLowerCase();

    if (
      statusLower.includes("approv") ||
      statusLower.includes("accept") ||
      statusLower.includes("process")
    ) {
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
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        <Clock className="h-3 w-3 mr-1" />
        {statusName}
      </span>
    );
  };

  const getShiftBadges = () => {
    const badges = [];
    if (entry?.Early_Coming == "Y") {
      badges.push(
        <span
          key="early"
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
        >
          <Sunrise className="h-3 w-3 mr-1" />
          Early Coming
        </span>,
      );
    }
    if (entry?.Late_Going == "Y") {
      badges.push(
        <span
          key="late"
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
        >
          <Sunset className="h-3 w-3 mr-1" />
          Late Going
        </span>,
      );
    }
    return badges;
  };

  const getHolidayBadge = (prxHlDy, sfxHlDy) => {
    const badges = [];
    if (prxHlDy == "1" || prxHlDy == 1 || prxHlDy == true) {
      badges.push(
        <span
          key="prev"
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
        >
          Previous Holiday
        </span>,
      );
    }
    if (sfxHlDy == "1" || sfxHlDy == 1 || sfxHlDy == true) {
      badges.push(
        <span
          key="next"
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
        >
          Subsequent Holiday
        </span>,
      );
    }
    return badges.length > 0 ? (
      <div className="flex gap-1">{badges}</div>
    ) : null;
  };

  const PrintReportContent = () => {
    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "6px 8px",
        margin: "8px 0",
        fontWeight: "600",
        borderLeft: "3px solid #EF5350",
        fontSize: "12px",
        color: "#1f2937",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "6px 0",
        fontSize: "10px",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      td: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textBold: { fontWeight: "600" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Request Information</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold, width: "25%" }}>
                  Status
                </td>
                <td style={styles.td}>{getStatusDisplay()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Employee</td>
                <td style={styles.td}>
                  {entry?.employee?.First_Name || ""}{" "}
                  {entry?.employee?.Last_Name || ""}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Department</td>
                <td style={styles.td}>
                  {entry?.employee?.department?.Dpt_Desc || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Designation
                </td>
                <td style={styles.td}>{userDesignationName || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Overtime Date
                </td>
                <td style={styles.td}>{formatDate(entry?.OTR_Date)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>In Time</td>
                <td style={styles.td}>
                  {entry?.In_Time ? formatTime(entry.In_Time) : "—"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Out Time</td>
                <td style={styles.td}>
                  {entry?.Out_Time ? formatTime(entry.Out_Time) : "—"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Total Overtime Hours
                </td>
                <td style={styles.td}>{entry?.OTR_Hrs} hours</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Early Coming
                </td>
                <td style={styles.td}>
                  {entry?.Early_Coming == "Y" ? "Yes" : "No"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Late Going</td>
                <td style={styles.td}>
                  {entry?.Late_Going == "Y" ? "Yes" : "No"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Remarks</td>
                <td style={styles.td}>{entry?.Reason || "—"}</td>
              </tr>
              {entry?.Status_Remark && (
                <tr>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textBold,
                      backgroundColor: "#fffbeb",
                    }}
                  >
                    Query
                  </td>
                  <td
                    style={{ ...styles.td, backgroundColor: "#fffbeb" }}
                    colSpan="3"
                  >
                    <span style={{ color: "#92400e" }}>
                      {entry.Status_Remark}
                    </span>
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Requested On
                </td>
                <td style={styles.td}>
                  {new Date(entry?.created_at).toLocaleString()}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {new Date(entry?.updated_at).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
              "/transactions/attendance-management/attendance/overtime-record-approval",
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
      {showPrint && (
        <PrintLayout
          title="Overtime Record Approval Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate(
                  "/transactions/attendance-management/attendance/overtime-record-approval",
                )
              }
              className="mr-4 p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {pageTitle}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrint(true)}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="p-6 mx-auto max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                <h2 className="text-base font-semibold text-gray-900">
                  Request Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        Employee
                      </label>
                      <div className="mt-1 flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {entry.employee?.First_Name || ""}{" "}
                          {entry.employee?.Last_Name || ""}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        Department
                      </label>
                      <div className="mt-1 flex items-center">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {entry.employee?.department?.Dpt_Desc || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        Status
                      </label>
                      <div className="mt-1">{getStatusBadge()}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        Requested On
                      </label>
                      <div className="mt-1 flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {entry.OTR_HDT && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide">
                          Processed On
                        </label>
                        <div className="mt-1 flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {new Date(entry.OTR_HDT).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                    {entry.OTR_HOD && entry.hod && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide">
                          Processed By
                        </label>
                        <div className="mt-1 flex items-center">
                          <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {entry.hod.Usr_Name || "System"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {entry?.Status_Remark && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <HelpCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                          Query / Remark
                        </label>
                        <p className="text-sm text-amber-900 mt-1">
                          {entry.Status_Remark}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                <h2 className="text-base font-semibold text-gray-900">
                  Overtime Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        Overtime Date
                      </label>
                      <div className="mt-1 flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(entry.OTR_Date)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        In Time
                      </label>
                      <div className="mt-1 flex items-center">
                        <Watch className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {entry.In_Time ? formatTime(entry.In_Time) : "—"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        Total Overtime Hours
                      </label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-sm font-semibold">
                          {formatOvertimeHours(entry.OTR_Hrs)} hours
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        Out Time
                      </label>
                      <div className="mt-1 flex items-center">
                        <Watch className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {entry.Out_Time ? formatTime(entry.Out_Time) : "—"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        Shift Status
                      </label>
                      <div className="mt-1 flex gap-2">
                        {getShiftBadges().length > 0 ? (
                          getShiftBadges()
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">
                        Holidays
                      </label>
                      <div className="mt-1">
                        {getHolidayBadge(entry.Prx_HlDy, entry.Sfx_HlDy) || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <label className="text-xs text-gray-500 uppercase tracking-wide">
                    Remarks / Reason
                  </label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      {entry.Reason || "No remarks provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                    <Info className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Request Summary
                    </h2>
                    <p className="text-sm text-gray-600">
                      Overview of the request
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Employee</span>
                  <span className="font-medium text-gray-900 text-sm text-right">
                    {entry.employee?.First_Name || ""}{" "}
                    {entry.employee?.Last_Name || ""}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Overtime Date</span>
                  <span className="font-medium text-gray-900 text-sm text-right">
                    {formatDate(entry.OTR_Date)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Time Details</span>
                  <span className="font-medium text-gray-900 text-sm text-right">
                    {entry.In_Time ? formatTime(entry.In_Time) : "—"} -{" "}
                    {entry.Out_Time ? formatTime(entry.Out_Time) : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">
                    Total Overtime Hours
                  </span>
                  <span className="font-bold text-blue-600 text-sm">
                    {formatOvertimeHours(entry.OTR_Hrs)} hours
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 text-sm">Early Coming</span>
                  <span className="font-medium text-gray-900 text-sm text-right">
                    {entry.Early_Coming == "Y" ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 text-sm">Late Going</span>
                  <span className="font-medium text-gray-900 text-sm text-right">
                    {entry.Late_Going == "Y" ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(showApproveButton || showQueryButton) && (
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-3xl">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <ShieldAlert className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Request Actions
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Review this overtime record and take appropriate action
                  </p>
                  {!isAdmin && (
                    <p className="text-xs text-gray-400 mt-2">
                      Your Designation: {userDesignationName} | Dept ID:{" "}
                      {userDeptId} | Stage: {currentStage}
                    </p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  {showQueryButton && backwardAction && (
                    <div className="flex-1 w-full md:w-auto">
                      <button
                        onClick={openQueryModal}
                        disabled={isUpdating}
                        className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        {isUpdating ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        ) : (
                          <MessageSquare className="h-5 w-5 mr-3" />
                        )}
                        <div className="text-left">
                          <div className="font-bold text-base">
                            {isUpdating
                              ? "Processing..."
                              : backwardAction.St_Name}
                          </div>
                          <div className="text-xs font-normal opacity-90 mt-0.5">
                            {backwardAction._isTwoStepJump
                              ? `Return to ${backwardAction._intermediateActionName} stage`
                              : "Return to previous stage"}
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {!showQueryButton && <div className="flex-1"></div>}

                  {showApproveButton && nextAction && (
                    <div className="flex-1 w-full md:w-auto">
                      <button
                        onClick={handleApprove}
                        disabled={isUpdating}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
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
                            Forward to next stage
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {!showApproveButton && <div className="flex-1"></div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {!showApproveButton && !showQueryButton && entry.status_rel && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  No Action Required
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  This record has been fully processed and does not require any
                  further approval.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Query Modal */}
      {queryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                  <MessageSquare className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {backwardAction?.St_Name || "Raise Query"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {backwardAction?._isTwoStepJump
                      ? `This will return the record to ${backwardAction._intermediateActionName} stage`
                      : "Please provide details for returning to previous stage"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={queryRemarkRef}
                  value={queryRemark}
                  onChange={(e) => setQueryRemark(e.target.value)}
                  placeholder="Enter your query details here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  rows="4"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This remark will be visible to the requester.
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

export default OverTimeRecordApprovalView;
