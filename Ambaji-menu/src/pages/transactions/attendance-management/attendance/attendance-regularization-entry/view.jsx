// src/pages/Transactions/AttendanceManagement/Attendance/AttendanceRegularizationEntry/View.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  Clock,
  Printer,
  AlertCircle,
  User,
  FileText,
  Briefcase,
  MapPin,
  Info,
  CheckCircle,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PrintLayout from "../../../../../components/printlayout";
import { useOrganization } from "../../../../../hooks/useorganization";
import { AttendanceRegularizationApi } from "../../../../services/attendanceregularizationapi";

const AttendanceRegularizationView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();
  const [currentStage, setCurrentStage] = useState(null);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [nextAction, setNextAction] = useState(null);
  const [backwardAction, setBackwardAction] = useState(null);
  const [actionsForStage, setActionsForStage] = useState([]);
  const [showApproveButton, setShowApproveButton] = useState(false);
  const [showQueryButton, setShowQueryButton] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [queryModal, setQueryModal] = useState(false);
  const [queryRemark, setQueryRemark] = useState("");
  const [queryReturnStatus, setQueryReturnStatus] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [pageTitle, setPageTitle] = useState("Attendance Regularization");

  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);

    const deptId =
      user?.departmentData?.Dpt_id ||
      user?.apiUserData?.employee?.department?.Dpt_id;
    setUserDeptId(deptId ? parseInt(deptId) : null);

    const desigId =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    setUserDesignationId(desigId ? parseInt(desigId) : null);

    loadMenuAndStage();
  }, [id, user]);

  const loadMenuAndStage = async () => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/attendance-management/attendance/attendance-regularization-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem) {
        setPageTitle(currentMenuItem.Fnc_Title || "Attendance Regularization");

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
      const response = await AttendanceRegularizationApi.getAllByStage(stage);
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
    if (permissionsLoaded) {
      loadData();
    }
  }, [permissionsLoaded]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await AttendanceRegularizationApi.getById(id);
      setData(response);

      // Check for approval actions
      if (response.status_rel && actionsForStage.length > 0) {
        const currentStatusId = response.status_rel.Act_Id?.toString();

        // Forward action
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
            setHasPermission(isAuthority);
            setShowApproveButton(isAuthority);
          } else if (isAdmin) {
            setHasPermission(true);
            setShowApproveButton(true);
          }
        } else {
          setNextAction(null);
          setShowApproveButton(false);
        }

        // Backward action (for queries)
        const backwardActionData = actionsForStage.find(
          (action) =>
            action.Previous_Status == currentStatusId &&
            action.Is_Forward == "N",
        );

        if (backwardActionData) {
          setBackwardAction(backwardActionData);
          setShowQueryButton(true);
          setQueryReturnStatus(parseInt(backwardActionData.Previous_Status));
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load attendance regularization data!");
      navigate(
        "/transactions/attendance-management/attendance/attendance-regularization-entry",
      );
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
      title: `${nextAction.St_Name} Request?`,
      text: `Are you sure you want to ${nextAction.St_Name.toLowerCase()} this attendance regularization request?`,
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
      await AttendanceRegularizationApi.updateStatus(id, {
        Status: nextAction.Act_Id,
        R_Status: null,
        ARG_HOD: user?.apiUserData?.Usr_Id,
        Status_Remark: null,
      });

      toast.success(
        `Request ${nextAction.St_Name.toLowerCase()} successfully!`,
      );
      setShowApproveButton(false);
      setNextAction(null);
      await loadData();
    } catch (error) {
      console.error("Error approving:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${nextAction.St_Name.toLowerCase()} request`,
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

    if (!queryReturnStatus) {
      toast.error("Cannot determine return status");
      return;
    }

    setIsUpdating(true);
    try {
      await AttendanceRegularizationApi.updateStatus(id, {
        Status: queryReturnStatus,
        R_Status: backwardAction?.Act_Id,
        Status_Remark: queryRemark,
        ARG_HOD: user?.apiUserData?.Usr_Id,
      });

      toast.success(
        `Query raised successfully! Request returned to previous stage.`,
      );
      closeQueryModal();
      setShowApproveButton(false);
      setNextAction(null);
      setShowQueryButton(false);
      await loadData();
    } catch (error) {
      console.error("Error raising query:", error);
      toast.error(error.response?.data?.message || "Failed to raise query");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Attendance Regularization Request?",
      text: `Are you sure you want to delete this request? This action cannot be undone.`,
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
      await AttendanceRegularizationApi.delete(id);
      toast.success("Attendance regularization request deleted successfully!");
      navigate(
        "/transactions/attendance-management/attendance/attendance-regularization-entry",
      );
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(error.response?.data?.message || "Failed to delete");
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
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusDisplay = () => {
    if (data?.r_status) {
      return data.r_status.St_Name || "Pending";
    }
    if (data?.status_rel) {
      return data.status_rel.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = () => {
    const statusName = getStatusDisplay();
    const statusLower = statusName?.toLowerCase() || "";

    let colorClass = "bg-yellow-100 text-yellow-800";
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
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
      >
        <Clock className="h-4 w-4 mr-2" />
        {statusName}
      </span>
    );
  };

  const getReasonDisplay = (reason) => {
    const reasons = {
      BIOMETRIC_FAILURE: "Biometric Failure",
      FORGOT_PUNCH: "Forgot Punch",
      FIELD_DUTY: "Field Duty",
      OFFICIAL_VISIT: "Official Visit",
      TOUR: "Tour",
      SYSTEM_ERROR: "System Error",
      OTHER: "Other",
    };
    return reasons[reason] || reason || "N/A";
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
                  {data?.employee?.First_Name || ""}{" "}
                  {data?.employee?.Last_Name || ""}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Department</td>
                <td style={styles.td}>
                  {data?.employee?.department?.Dpt_Desc || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Designation
                </td>
                <td style={styles.td}>
                  {data?.employee?.designation?.Dsg_Desc || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Start Date</td>
                <td style={styles.td}>{formatDate(data?.ARG_FDt)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>End Date</td>
                <td style={styles.td}>{formatDate(data?.ARG_TDt)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Total Days</td>
                <td style={styles.td}>{data?.ARG_Days} days</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Holidays</td>
                <td style={styles.td}>{data?.HlDy_Btwn} days</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Reason</td>
                <td style={styles.td}>{getReasonDisplay(data?.ARG_Rsn)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Place of Visit
                </td>
                <td style={styles.td}>{data?.PlaceVisit || "—"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Remarks</td>
                <td style={styles.td}>{data?.Reason || "—"}</td>
              </tr>
              {data?.Status_Remark && (
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
                      {data.Status_Remark}
                    </span>
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Requested On
                </td>
                <td style={styles.td}>{formatDateTime(data?.created_at)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>{formatDateTime(data?.updated_at)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading || !permissionsLoaded) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading attendance regularization details...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Request Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The attendance regularization request with ID #{id} does not exist or
          has been removed.
        </p>
        <Link
          to="/transactions/attendance-management/attendance/attendance-regularization-entry"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {showPrint && (
        <PrintLayout
          title="Attendance Regularization Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/transactions/attendance-management/attendance/attendance-regularization-entry",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pageTitle} Details
            </h1>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                Dept ID: {userDeptId} | Desg ID: {userDesignationId} | Stage:{" "}
                {currentStage}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPrint(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <Link
            to={`/transactions/attendance-management/attendance/attendance-regularization-entry/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Request Information
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Employee</label>
                    <div className="mt-1 flex items-center">
                      <User className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-sm">
                        {data.employee?.First_Name || ""}{" "}
                        {data.employee?.Last_Name || ""}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Department</label>
                    <div className="mt-1 flex items-center">
                      <Briefcase className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-sm">
                        {data.employee?.department?.Dpt_Desc || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge()}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Requested On
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-sm">
                        {formatDateTime(data.created_at)}
                      </span>
                    </div>
                  </div>
                  {data.ARG_HDT && (
                    <div>
                      <label className="text-xs text-gray-500">
                        Processed On
                      </label>
                      <div className="mt-1 flex items-center">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-sm">
                          {formatDateTime(data.ARG_HDT)}
                        </span>
                      </div>
                    </div>
                  )}
                  {data.ARG_HOD && data.hod && (
                    <div>
                      <label className="text-xs text-gray-500">
                        Processed By
                      </label>
                      <div className="mt-1 flex items-center">
                        <User className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-sm">
                          {data.hod.Usr_Name || "System"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {data.Status_Remark && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                        Query
                      </label>
                      <p className="text-sm text-amber-900 mt-1">
                        {data.Status_Remark}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Attendance Details
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-sm">{formatDate(data.ARG_FDt)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">End Date</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-sm">{formatDate(data.ARG_TDt)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Total Days</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm font-medium">
                      {data.ARG_Days} days
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">
                    Holidays in Range
                  </label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-sm font-medium">
                      {data.HlDy_Btwn} days
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Reason</label>
                  <div className="mt-1 flex items-center">
                    <Briefcase className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-sm">
                      {getReasonDisplay(data.ARG_Rsn)}
                    </span>
                  </div>
                </div>
                {(data.ARG_Rsn == "FIELD_DUTY" ||
                  data.ARG_Rsn == "OFFICIAL_VISIT" ||
                  data.ARG_Rsn == "TOUR") && (
                  <div>
                    <label className="text-xs text-gray-500">
                      Place of Visit
                    </label>
                    <div className="mt-1 flex items-center">
                      <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-sm">{data.PlaceVisit || "—"}</span>
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">
                    Remarks / Detailed Reason
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {data.Reason || "No remarks provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                  <Info className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Summary
                  </h2>
                  <p className="text-sm text-gray-600">Request overview</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Employee</span>
                <span className="font-medium text-gray-900 text-right">
                  {data.employee?.First_Name || ""}{" "}
                  {data.employee?.Last_Name || ""}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Date Range</span>
                <span className="font-medium text-gray-900 text-right">
                  {formatDate(data.ARG_FDt)} - {formatDate(data.ARG_TDt)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Working Days</span>
                <span className="font-bold text-blue-600">
                  {data.ARG_Days} days
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Reason</span>
                <span className="font-medium text-gray-900 text-right">
                  {getReasonDisplay(data.ARG_Rsn)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!showApproveButton && !showQueryButton && data.status_rel && (
        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                No Action Required
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                This request has been fully processed.
              </p>
            </div>
          </div>
        </div>
      )}

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
                    Please provide details for returning to previous stage
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
                  value={queryRemark}
                  onChange={(e) => setQueryRemark(e.target.value)}
                  placeholder="Enter your query details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-32"
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

export default AttendanceRegularizationView;
