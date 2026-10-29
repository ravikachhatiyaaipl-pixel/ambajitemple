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
  Award,
  Hash,
  Building,
  CheckCircle,
  XCircle,
  Edit,
  Calendar,
  Clock,
  Info,
  Copy,
  DollarSign,
  FileCheck,
  TrendingUp,
  Tag,
  AlertCircle,
  Printer,
  ChevronDown,
  ChevronRight,
  Trash2,
  FolderTree,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { GrantTypeMasterApi } from "../../../services/granttypemasterapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewGrantType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grantType, setGrantType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  const [expandedSections, setExpandedSections] = useState({
    grantInfo: true,
    status: true,
    audit: true,
    authority: true,
    category: true,
  });

  useEffect(() => {
    loadGrantTypeData();
  }, [id]);

  const loadGrantTypeData = async () => {
    setLoading(true);
    try {
      const data = await GrantTypeMasterApi.getById(id);
      setGrantType(data);
    } catch (error) {
      toast.error("Failed to load grant type data!");
      navigate("/masters/grant-management/grant-type-master");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDeleteGrantType = async () => {
    const result = await Swal.fire({
      title: "Delete Grant Type?",
      text: `Are you sure you want to delete "${grantType?.GT_Name}"? This action cannot be undone.`,
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
        await GrantTypeMasterApi.delete(id);
        toast.success(
          `Grant type "${grantType?.GT_Name}" deleted successfully!`,
        );
        navigate("/masters/grant-management/grant-type-master");
      } catch (error) {
        toast.error(error.message || "Failed to delete grant type");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get nature display text
  const getNatureDisplay = (natureCode) => {
    if (natureCode == "R") return "Revenue";
    if (natureCode == "C") return "Capital";
    return natureCode || "—";
  };

  const PrintReportContent = () => {
    if (!grantType) return null;

    const isActive = grantType.Is_Active == true;

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
      textRight: { textAlign: "right" },
      textCenter: { textAlign: "center" },
      gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "8px",
        margin: "8px 0",
      },
      gridItem: {
        border: "1px solid #e5e7eb",
        padding: "8px",
        borderRadius: "4px",
        backgroundColor: "#f9fafb",
      },
      statusActive: { color: "#059669", fontWeight: "600" },
      statusInactive: { color: "#dc2626", fontWeight: "600" },
      statusConditional: { color: "#d97706", fontWeight: "600" },
      statusUnconditional: { color: "#6b7280", fontWeight: "600" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Grant Type Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Grant Type Summary</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Grant Type ID
                </td>
                <td style={styles.td}>{grantType.GT_Id}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Grant Code</td>
                <td style={styles.td}>{grantType.GT_Code || "—"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Grant Name</td>
                <td style={styles.td}>{grantType.GT_Name}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...(isActive ? styles.statusActive : styles.statusInactive),
                  }}
                >
                  {isActive ? "Active" : "Inactive"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Grant Nature
                </td>
                <td style={styles.td}>
                  {getNatureDisplay(grantType.GT_Nature)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Accounting Mode
                </td>
                <td style={styles.td}>{grantType.GT_Act_Mode || "—"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>
                  {formatDateTime(grantType.created_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(grantType.updated_at)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Grant Category Information */}
        {grantType.grant_category && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Grant Category Information</div>
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
                <tr></tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Category Name
                  </td>
                  <td style={styles.td} colSpan="3">
                    {grantType.grant_category.GC_Name}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Grant Type Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Grant Type Details</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Utilization From Date
                </td>
                <td style={styles.td}>
                  {formatDate(grantType.GT_Utl_From_Date)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Utilization To Date
                </td>
                <td style={styles.td}>
                  {formatDate(grantType.GT_Utl_To_Date)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Grant Condition
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...(grantType.GT_Condition == "Y"
                      ? styles.statusConditional
                      : styles.statusUnconditional),
                  }}
                >
                  {grantType.GT_Condition == "Y"
                    ? "Conditional"
                    : "Unconditional"}
                </td>
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

        {/* Grant Fund Source Information */}
        {grantType.grant_authority && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Grant Fund Source Information</div>
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
                    Authority Name
                  </td>
                  <td style={styles.td} colSpan="3">
                    {grantType.grant_authority.GA_Name}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Status Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Status Summary</div>
          <div style={styles.gridContainer}>
            <div style={styles.gridItem}>
              <div style={{ ...styles.textBold, marginBottom: "4px" }}>
                Grant Type Status
              </div>
              <div style={styles.textCenter}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: isActive ? "#059669" : "#dc2626",
                  }}
                >
                  {isActive ? "Active" : "Inactive"}
                </div>
                <div style={{ fontSize: "9px", color: "#6b7280" }}>
                  {isActive ? "Available for use" : "Not available"}
                </div>
              </div>
            </div>
            <div style={styles.gridItem}>
              <div style={{ ...styles.textBold, marginBottom: "4px" }}>
                Grant Condition
              </div>
              <div style={styles.textCenter}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color:
                      grantType.GT_Condition == "Y" ? "#d97706" : "#6b7280",
                  }}
                >
                  {grantType.GT_Condition == "Y"
                    ? "Conditional"
                    : "Unconditional"}
                </div>
                <div style={{ fontSize: "9px", color: "#6b7280" }}>
                  {grantType.GT_Condition == "Y"
                    ? "Terms apply"
                    : "No conditions"}
                </div>
              </div>
            </div>
            <div style={styles.gridItem}>
              <div style={{ ...styles.textBold, marginBottom: "4px" }}>
                Grant Nature
              </div>
              <div style={styles.textCenter}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: grantType.GT_Nature == "R" ? "#059669" : "#EF5350",
                  }}
                >
                  {getNatureDisplay(grantType.GT_Nature)}
                </div>
                <div style={{ fontSize: "9px", color: "#6b7280" }}>
                  Type of grant
                </div>
              </div>
            </div>
            <div style={styles.gridItem}>
              <div style={{ ...styles.textBold, marginBottom: "4px" }}>
                Accounting Mode
              </div>
              <div style={styles.textCenter}>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                  {grantType.GT_Act_Mode || "—"}
                </div>
                <div style={{ fontSize: "9px", color: "#6b7280" }}>
                  Accounting method
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Timeline Information</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Grant Type Created</td>
                <td style={styles.td}>
                  {formatDateTime(grantType.created_at)}
                </td>
                <td style={styles.td}>Grant Type Updated</td>
                <td style={styles.td}>
                  {formatDateTime(grantType.updated_at)}
                </td>
              </tr>
              <tr>
                <td style={styles.td}>Utilization Period</td>
                <td style={styles.td}>
                  {formatDate(grantType.GT_Utl_From_Date)} to{" "}
                  {formatDate(grantType.GT_Utl_To_Date)}
                </td>
                <td style={styles.td}>Report Generated</td>
                <td style={styles.td}>{new Date().toLocaleString("en-US")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Grant Type Configuration Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Configuration Summary</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Configuration</th>
                <th style={styles.th}>Value</th>
                <th style={styles.th}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Grant Code</td>
                <td style={styles.td}>{grantType.GT_Code || "—"}</td>
                <td style={styles.td}>Unique identifier for the grant type</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Grant Name</td>
                <td style={styles.td}>{grantType.GT_Name}</td>
                <td style={styles.td}>Display name of the grant type</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Grant Category
                </td>
                <td style={styles.td}>
                  {grantType.grant_category?.GC_Name || "—"}
                </td>
                <td style={styles.td}>Category classification of the grant</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Grant Nature
                </td>
                <td style={styles.td}>
                  {getNatureDisplay(grantType.GT_Nature)}
                </td>
                <td style={styles.td}>Nature of the grant (Revenue/Capital)</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Condition</td>
                <td style={styles.td}>
                  {grantType.GT_Condition == "Y"
                    ? "Conditional"
                    : "Unconditional"}
                </td>
                <td style={styles.td}>Whether the grant has conditions</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Accounting Mode
                </td>
                <td style={styles.td}>{grantType.GT_Act_Mode || "—"}</td>
                <td style={styles.td}>How the grant is accounted for</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Utilization Period
                </td>
                <td style={styles.td}>
                  {formatDate(grantType.GT_Utl_From_Date)} -{" "}
                  {formatDate(grantType.GT_Utl_To_Date)}
                </td>
                <td style={styles.td}>Period when the grant can be utilized</td>
              </tr>

              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Active Status
                </td>
                <td
                  style={{
                    ...styles.td,
                    color: isActive ? "#059669" : "#dc2626",
                  }}
                >
                  {isActive ? "Active" : "Inactive"}
                </td>
                <td style={styles.td}>
                  Whether the grant type is currently active
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading grant type details...</p>
      </div>
    );
  }

  if (!grantType) {
    return (
      <div className="p-12 text-center">
        <div className="text-red-600 mb-4">
          <Award className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Grant Type Not Found
        </h3>
        <p className="text-gray-600 mb-6">
          The grant type you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() =>
            navigate("/masters/grant-management/grant-type-master")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Grant Types
        </button>
      </div>
    );
  }

  const isActive = grantType.Is_Active == true;

  const DetailCard = ({
    title,
    icon: Icon,
    children,
    color = "blue",
    expandable = false,
    sectionKey,
    description,
  }) => {
    const colorClasses = {
      blue: {
        bg: "bg-blue-500",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-500",
        text: "text-green-600",
        border: "border-green-200",
      },
      purple: {
        bg: "bg-purple-500",
        text: "text-purple-600",
        border: "border-purple-200",
      },
      amber: {
        bg: "bg-amber-500",
        text: "text-amber-600",
        border: "border-amber-200",
      },
      indigo: {
        bg: "bg-indigo-500",
        text: "text-indigo-600",
        border: "border-indigo-200",
      },
    }[color];

    if (expandable) {
      return (
        <div
          className={`bg-white rounded-xl border ${colorClasses.border} hover:shadow-lg transition-all duration-200`}
        >
          <button
            onClick={() => toggleSection(sectionKey)}
            className="w-full px-6 py-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div
                className={`${colorClasses.bg} text-white p-2 rounded-lg mr-3`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
              </div>
            </div>
            {expandedSections[sectionKey] ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections[sectionKey] && (
            <div className="p-6">
              <div className="space-y-4">{children}</div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={`bg-white rounded-xl border ${colorClasses.border} p-6 hover:shadow-lg transition-all duration-200`}
      >
        <div className="flex items-center mb-4">
          <div className={`${colorClasses.bg} text-white p-2 rounded-lg mr-3`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    );
  };

  const InfoRow = ({
    label,
    value,
    icon: Icon,
    copyable = false,
    highlight = false,
    highlightColor = "green",
  }) => (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="h-4 w-4 text-gray-400 mr-2" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-center max-w-[60%]">
        <span
          className={`text-sm text-right break-words ${highlight ? `font-bold text-${highlightColor}-700` : "text-gray-900"}`}
        >
          {value || "N/A"}
        </span>
        {copyable && value && (
          <button
            onClick={() => handleCopyToClipboard(value)}
            className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
            title="Copy to clipboard"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Grant Type Master Report"
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
              navigate("/masters/grant-management/grant-type-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {grantType.GT_Name}
                </h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Hash className="h-3 w-3 mr-1" />
                    {grantType.GT_Code || "No Code"}
                  </span>

                  {grantType.GT_Nature && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        grantType.GT_Nature == "R"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {getNatureDisplay(grantType.GT_Nature)}
                    </span>
                  )}
                  {isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPrint(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </button>

          <Link
            to={`/masters/grant-management/grant-type-master/edit/${id}`}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grant Type Details Card */}
          <DetailCard
            title="Grant Type Information"
            icon={Award}
            color="blue"
            expandable={true}
            sectionKey="grantInfo"
            description="Detailed information about the grant type"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grant Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Grant Code
                    </span>
                  </div>
                  {grantType.GT_Code && (
                    <button
                      onClick={() => handleCopyToClipboard(grantType.GT_Code)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      title="Copy grant code"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  {grantType.GT_Code ? (
                    <div className="font-mono text-lg font-bold text-blue-600">
                      {grantType.GT_Code}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No code assigned</div>
                  )}
                </div>
              </div>

              {/* Grant Name */}
              <div>
                <div className="flex items-center mb-2">
                  <Award className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Grant Name
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {grantType.GT_Name}
                  </div>
                </div>
              </div>

              {/* Grant Category - NEW */}
              <div>
                <div className="flex items-center mb-2">
                  <FolderTree className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Grant Category
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  {grantType.grant_category ? (
                    <div>
                      <div className="text-md font-semibold text-gray-900">
                        {grantType.grant_category.GC_Name}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      No category assigned
                    </div>
                  )}
                </div>
              </div>

              {/* Grant Nature */}
              <div>
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Grant Nature
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  {grantType.GT_Nature ? (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        grantType.GT_Nature == "R"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {getNatureDisplay(grantType.GT_Nature)}
                    </span>
                  ) : (
                    <div className="text-gray-500 italic">Not specified</div>
                  )}
                </div>
              </div>

              {/* Grant Condition */}
              <div>
                <div className="flex items-center mb-2">
                  <FileCheck className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Grant Condition
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  {grantType.GT_Condition == "Y" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Conditional
                    </span>
                  ) : grantType.GT_Condition == "N" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Unconditional
                    </span>
                  ) : (
                    <div className="text-gray-500 italic">Not specified</div>
                  )}
                </div>
              </div>

              {/* Utilization From Date */}
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Utilization From Date
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(grantType.GT_Utl_From_Date)}
                  </div>
                </div>
              </div>

              {/* Utilization To Date */}
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Utilization To Date
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(grantType.GT_Utl_To_Date)}
                  </div>
                </div>
              </div>

              {/* Accounting Mode */}
              <div>
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Accounting Mode
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  {grantType.GT_Act_Mode ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {grantType.GT_Act_Mode}
                    </span>
                  ) : (
                    <div className="text-gray-500 italic">Not specified</div>
                  )}
                </div>
              </div>

              {/* Grant Fund Source */}
              <div>
                <div className="flex items-center mb-2">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Grant Fund Source
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  {grantType.grant_authority ? (
                    <div>
                      <div className="text-md font-semibold text-gray-900">
                        {grantType.grant_authority.GA_Name}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      No Grant Fund Source assigned
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  );
};

export default ViewGrantType;
