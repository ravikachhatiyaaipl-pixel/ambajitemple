/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GitMerge,
  Hash,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Copy,
  AlertCircle,
  Printer,
  Users,
  UserCheck,
  FileText,
  Briefcase,
  Layers,
  Building,
  ChevronRight,
  CheckCircle,
  XCircle,
  UserCog,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ActionMasterApi } from "../../../services/actionmasterapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewActionMaster = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadActionData();
  }, [id]);

  const loadActionData = async () => {
    setLoading(true);
    try {
      const data = await ActionMasterApi.getById(id);

      // Parse Authorities if it's a string
      if (data.Authorities && typeof data.Authorities == "string") {
        try {
          const cleanStr = data.Authorities.replace(/\\"/g, '"');
          data.Authorities = JSON.parse(cleanStr);
        } catch (e) {
          console.error("Error parsing Authorities:", e);
          data.Authorities = [];
        }
      }

      // Parse Viewers if it's a string
      if (data.Viewers && typeof data.Viewers == "string") {
        try {
          const cleanStr = data.Viewers.replace(/\\"/g, '"');
          data.Viewers = JSON.parse(cleanStr);
        } catch (e) {
          console.error("Error parsing Viewers:", e);
          data.Viewers = [];
        }
      }

      setAction(data);
    } catch (error) {
      toast.error("Failed to load action data!");
      navigate("/settings/profile-management/action-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAction = async () => {
    const result = await Swal.fire({
      title: "Delete Action?",
      text: `Are you sure you want to delete "${action?.St_Name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await ActionMasterApi.delete(id);
        toast.success(`Action "${action?.St_Name}" deleted successfully!`);
        navigate("/settings/profile-management/action-master");
      } catch (error) {
        toast.error(error.message || "Failed to delete action");
      }
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
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Helper to get department name from the department object
  const getDepartmentName = () => {
    // Direct department object is available from API
    if (action?.department) {
      return action.department.Dpt_Name || `ID: ${action.Dpt_id}`;
    }

    // Fallback: try to get from authorities_details
    if (
      !action?.authorities_details ||
      action.authorities_details.length == 0
    ) {
      return `ID: ${action?.Dpt_id || "N/A"}`;
    }

    const firstAuth = action.authorities_details[0];
    if (firstAuth.departments && firstAuth.departments.length > 0) {
      return (
        firstAuth.departments[0].Dpt_Name ||
        firstAuth.departments[0].Dpt_Desc ||
        `ID: ${action?.Dpt_id}`
      );
    }
    return `ID: ${action?.Dpt_id || "N/A"}`;
  };

  // Helper to get department description
  const getDepartmentDescription = () => {
    // Direct department object is available from API
    if (action?.department) {
      return action.department.Dpt_Desc || "";
    }

    // Fallback: try to get from authorities_details
    if (
      !action?.authorities_details ||
      action.authorities_details.length == 0
    ) {
      return "";
    }

    const firstAuth = action.authorities_details[0];
    if (firstAuth.departments && firstAuth.departments.length > 0) {
      return (
        firstAuth.departments[0].Dpt_Desc ||
        firstAuth.departments[0].Dpt_Name ||
        ""
      );
    }
    return "";
  };

  // Helper to get authority names from authorities_details
  const getAuthorityNames = () => {
    if (!action?.authorities_details || action.authorities_details.length == 0)
      return "None";
    return action.authorities_details
      .map((a) => a.Dsg_Desc || a.Dsg_EName || `Designation ${a.Dsg_id}`)
      .join(", ");
  };

  // Helper to get viewer names from viewers_details (array of designation objects)
  const getViewerNames = () => {
    if (!action?.viewers_details || action.viewers_details.length == 0) {
      return "None";
    }
    return action.viewers_details
      .map((v) => v.Dsg_Desc || v.Dsg_EName || `Designation ${v.Dsg_id}`)
      .join(", ");
  };

  // Helper to get previous status display - Now shows full details from previous_status object
  const getPreviousStatusDisplay = () => {
    if (!action?.Previous_Status) {
      return { name: "None (First Action)", id: null, details: null };
    }

    if (action.previous_status) {
      return {
        name: action.previous_status.St_Name || `ID: ${action.Previous_Status}`,
        id: action.Previous_Status,
        details: action.previous_status,
      };
    }

    return {
      name: `ID: ${action.Previous_Status}`,
      id: action.Previous_Status,
      details: null,
    };
  };

  // Helper to check if viewers_details exists
  const hasViewersDetails = () => {
    return action?.viewers_details && action.viewers_details.length > 0;
  };

  const PrintReportContent = () => {
    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "6px 8px",
        margin: "8px 0",
        fontWeight: "600",
        borderLeft: "3px solid #8b5cf6",
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

    const prevStatus = getPreviousStatusDisplay();

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Action Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Action Summary</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Details</th>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Department</td>
                <td style={styles.td}>{getDepartmentName()}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Stage</td>
                <td style={styles.td}>{action?.stage || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Previous Status
                </td>
                <td style={styles.td}>
                  {prevStatus.name}
                  {prevStatus.id && (
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#666",
                        marginLeft: "5px",
                      }}
                    >
                      (ID: {prevStatus.id})
                    </span>
                  )}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Status Name
                </td>
                <td style={styles.td}>{action?.St_Name || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Is Forward</td>
                <td style={styles.td}>
                  {action?.Is_Forward == "Y" ? "Yes" : "No"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Authorities
                </td>
                <td style={styles.td}>{getAuthorityNames()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Viewers</td>
                <td style={styles.td}>{getViewerNames()}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Remarks</td>
                <td style={styles.td}>{action?.Act_Remarks || "No remarks"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>{formatDateTime(action?.created_at)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>{formatDateTime(action?.updated_at)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Report Generated
                </td>
                <td style={styles.td} colSpan="3">
                  {new Date().toLocaleString("en-US")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Authorities Details */}
        {action?.authorities_details &&
          action.authorities_details.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Authorities Details</div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Designation Name</th>
                    <th style={styles.th}>English Name</th>
                    <th style={styles.th}>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {action.authorities_details.map((auth, index) => (
                    <tr key={index}>
                      <td style={styles.td}>
                        {auth.Dsg_Desc || `Designation ${auth.Dsg_id}`}
                      </td>
                      <td style={styles.td}>{auth.Dsg_EName || "—"}</td>
                      <td style={styles.td}>
                        {auth.departments
                          ?.map((dept) => dept.Dpt_Name || dept.Dpt_Desc)
                          .join(", ") || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {/* Viewers Details - Like Authorities Details */}
        {action?.viewers_details && action.viewers_details.length > 0 && (
          <div style={styles.section}>
            <div style={{ ...styles.sectionTitle, borderLeftColor: "#10b981" }}>
              Viewers Details
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Designation Name</th>
                  <th style={styles.th}>English Name</th>
                  <th style={styles.th}>Department</th>
                </tr>
              </thead>
              <tbody>
                {action.viewers_details.map((viewer, index) => (
                  <tr key={index}>
                    <td style={styles.td}>
                      {viewer.Dsg_Desc || `Designation ${viewer.Dsg_id}`}
                    </td>
                    <td style={styles.td}>{viewer.Dsg_EName || "—"}</td>
                    <td style={styles.td}>
                      {viewer.departments
                        ?.map((dept) => dept.Dpt_Name || dept.Dpt_Desc)
                        .join(", ") || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Previous Status Details - New section */}
        {action?.previous_status && (
          <div style={styles.section}>
            <div style={{ ...styles.sectionTitle, borderLeftColor: "#f59e0b" }}>
              Previous Status Details
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Field</th>
                  <th style={styles.th}>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Action ID
                  </td>
                  <td style={styles.td}>{action.previous_status.Act_Id}</td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Status Name
                  </td>
                  <td style={styles.td}>
                    {action.previous_status.St_Name || "—"}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>Stage</td>
                  <td style={styles.td}>
                    {action.previous_status.stage || "—"}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Department ID
                  </td>
                  <td style={styles.td}>
                    {action.previous_status.Dpt_id || "—"}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Created Date
                  </td>
                  <td style={styles.td}>
                    {formatDateTime(action.previous_status.created_at)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Deletion Information */}
        {action?.deleted_at && (
          <div style={styles.section}>
            <div style={{ ...styles.sectionTitle, borderLeftColor: "#dc2626" }}>
              Deletion Information
            </div>
            <div
              style={{
                padding: "10px",
                border: "1px solid #fecaca",
                borderRadius: "4px",
                backgroundColor: "#fef2f2",
                fontSize: "10px",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontWeight: "600" }}>Status:</span>
                <span style={{ color: "#dc2626", marginLeft: "8px" }}>
                  Deleted
                </span>
              </div>
              <div>
                <span style={{ fontWeight: "600" }}>Deleted Date:</span>
                <span style={{ marginLeft: "8px" }}>
                  {formatDateTime(action.deleted_at)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading action details...</p>
        </div>
      </div>
    );
  }

  if (!action) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Action Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The action you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() =>
              navigate("/settings/profile-management/action-master")
            }
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Actions
          </button>
        </div>
      </div>
    );
  }

  const prevStatus = getPreviousStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Action Master Report"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <button
              onClick={() =>
                navigate("/settings/profile-management/action-master")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {action.St_Name || "Action Details"}
                </h1>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  ACT-{action.Act_Id}
                </span>
              </div>
              <p className="text-gray-600 mt-1">Action Details</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrint(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </button>
          {!action.deleted_at && (
            <>
              <Link
                to={`/settings/profile-management/action-master/edit/${id}`}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm font-medium"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Information */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                  <GitMerge className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Action Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed information about the action
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Department
                      </span>
                    </div>
                    {action.Dpt_id && (
                      <button
                        onClick={() => handleCopyToClipboard(action.Dpt_id)}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy department ID"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy ID
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {getDepartmentName()}
                    </div>
                    {getDepartmentDescription() && (
                      <div className="text-sm text-gray-600 mt-1">
                        {getDepartmentDescription()}
                      </div>
                    )}
                    {action.department && action.department.GrCod && (
                      <div className="text-xs text-gray-400 mt-1">
                        Code: {action.department.GrCod}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Layers className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Stage
                      </span>
                    </div>
                    {action.stage && (
                      <button
                        onClick={() => handleCopyToClipboard(action.stage)}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy stage"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {action.stage || "—"}
                    </div>
                  </div>
                </div>

                {/* Previous Status - Now shows name and ID */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Previous Status
                      </span>
                    </div>
                    {action.Previous_Status && (
                      <button
                        onClick={() =>
                          handleCopyToClipboard(action.Previous_Status)
                        }
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy previous status ID"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy ID
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {prevStatus.name}
                    </div>
                    {prevStatus.id && (
                      <div className="text-sm text-amber-600 mt-1">
                        ID: {prevStatus.id}
                      </div>
                    )}
                    {prevStatus.details && prevStatus.details.stage && (
                      <div className="text-xs text-gray-500 mt-1">
                        Stage: {prevStatus.details.stage}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Name */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <GitMerge className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Status Name
                      </span>
                    </div>
                    {action.St_Name && (
                      <button
                        onClick={() => handleCopyToClipboard(action.St_Name)}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy status name"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {action.St_Name || "—"}
                    </div>
                  </div>
                </div>

                {/* Is Forward */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Send className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Is Forward
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {action.Is_Forward == "Y" ? (
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            Yes
                          </div>
                          <div className="text-xs text-gray-500">
                            Forward allowed to next stage
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <XCircle className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            No
                          </div>
                          <div className="text-xs text-gray-500">
                            Forward not allowed
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Authorities */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Authorities
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {action.authorities_details &&
                    action.authorities_details.length > 0 ? (
                      <div className="space-y-2">
                        {action.authorities_details.map((auth, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {auth.Dsg_Desc || `Designation ${auth.Dsg_id}`}
                              </div>
                              {auth.Dsg_EName && (
                                <div className="text-xs text-gray-600">
                                  {auth.Dsg_EName}
                                </div>
                              )}
                              {auth.departments &&
                                auth.departments.length > 0 && (
                                  <div className="text-xs text-purple-600 mt-1">
                                    Dept:{" "}
                                    {auth.departments
                                      .map((d) => d.Dpt_Desc || d.Dpt_Name)
                                      .join(", ")}
                                  </div>
                                )}
                              <div className="text-xs text-gray-400 mt-1">
                                ID: {auth.Dsg_id}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No authorities assigned
                      </div>
                    )}
                  </div>
                </div>

                {/* Viewers - Like Authorities */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Viewers
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {hasViewersDetails() ? (
                      <div className="space-y-2">
                        {action.viewers_details.map((viewer, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div>
                              <div className="font-medium text-gray-900">
                                {viewer.Dsg_Desc ||
                                  `Designation ${viewer.Dsg_id}`}
                              </div>
                              {viewer.Dsg_EName && (
                                <div className="text-xs text-gray-600">
                                  {viewer.Dsg_EName}
                                </div>
                              )}
                              {viewer.departments &&
                                viewer.departments.length > 0 && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Dept:{" "}
                                    {viewer.departments
                                      .map((d) => d.Dpt_Desc || d.Dpt_Name)
                                      .join(", ")}
                                  </div>
                                )}
                              <div className="text-xs text-gray-400 mt-1">
                                ID: {viewer.Dsg_id}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-700">
                        {action.Viewers ? (
                          Array.isArray(action.Viewers) ? (
                            action.Viewers.join(", ")
                          ) : (
                            action.Viewers
                          )
                        ) : (
                          <span className="text-gray-500 italic">
                            No viewers assigned
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Remarks
                      </span>
                    </div>
                    {action.Act_Remarks && (
                      <button
                        onClick={() =>
                          handleCopyToClipboard(action.Act_Remarks)
                        }
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy remarks"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border whitespace-pre-wrap">
                    {action.Act_Remarks || (
                      <span className="text-gray-500 italic">No remarks</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Status Details Section - If available */}
          {action.previous_status && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-amber-100">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center mr-4 shadow-sm">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Previous Status Details
                    </h2>
                    <p className="text-sm text-gray-600">
                      Information about the referenced previous action
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Action ID
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(action.previous_status.Act_Id)
                        }
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-lg font-semibold text-gray-900">
                        ACT-{action.previous_status.Act_Id}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Status Name
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(action.previous_status.St_Name)
                        }
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-lg font-semibold text-gray-900">
                        {action.previous_status.St_Name || "—"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Stage
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(action.previous_status.stage)
                        }
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-lg font-semibold text-gray-900">
                        {action.previous_status.stage || "—"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Department
                      </span>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(action.previous_status.Dpt_id)
                        }
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy ID
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-lg font-semibold text-gray-900">
                        {action.previous_status.department?.Dpt_Name ||
                          `ID: ${action.previous_status.Dpt_id}`}
                      </div>
                      {action.previous_status.department?.Dpt_Desc && (
                        <div className="text-sm text-gray-600 mt-1">
                          {action.previous_status.department.Dpt_Desc}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Created Date
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="text-gray-900">
                        {formatDateTime(action.previous_status.created_at)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        View Link
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <Link
                        to={`/settings/profile-management/action-master/view/${action.previous_status.Act_Id}`}
                        className="text-purple-600 hover:text-purple-800 flex items-center"
                      >
                        View Previous Action
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewActionMaster;
