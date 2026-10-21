/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved
 *
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Hash,
  Edit,
  Calendar,
  Clock,
  Copy,
  IndianRupee,
  FileText,
  DollarSign,
  AlertCircle,
  Printer,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SpecialDutyApi } from "../../../services/specialdutymasterapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewSpecialDuty = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specialDuty, setSpecialDuty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadSpecialDutyData();
  }, [id]);

  const loadSpecialDutyData = async () => {
    setLoading(true);
    try {
      const data = await SpecialDutyApi.getById(id);
      setSpecialDuty(data);
    } catch (error) {
      toast.error("Failed to load special duty data!");
      navigate("/masters/performance-discipline-masters/special-duty");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Special Duty?",
      text: `Are you sure you want to delete "${specialDuty?.SDt_Name}"? This action cannot be undone.`,
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
        await SpecialDutyApi.delete(id);
        toast.success(
          `Special Duty "${specialDuty?.SDt_Name}" deleted successfully!`,
        );
        navigate("/masters/performance-discipline-masters/special-duty");
      } catch (error) {
        toast.error(error.message || "Failed to delete special duty");
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

  const getStatusBadge = (isActive) => {
    return isActive == 1 || isActive == "1" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getReimburseBadge = (isReimburse) => {
    return isReimburse == 1 || isReimburse == "1" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <DollarSign className="h-3 w-3 mr-1" />
        Reimbursable
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Non-Reimbursable
      </span>
    );
  };

  const getFeesBadge = (fees) => {
    return fees == 1 || fees == "1" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        <IndianRupee className="h-3 w-3 mr-1" />
        Has Fees
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        No Fees
      </span>
    );
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
      statusActive: { color: "#059669", fontWeight: "600" },
      statusInactive: { color: "#dc2626", fontWeight: "600" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Special Duty Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Special Duty Summary</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>Duty Name</td>
                <td style={styles.td}>{specialDuty?.SDt_Name || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Duty Code</td>
                <td style={styles.td}>{specialDuty?.SDt_Code || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Duty ID</td>
                <td style={styles.td}>{specialDuty?.SDt_Id || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Fees</td>
                <td style={styles.td}>
                  {specialDuty?.SDt_Fees == 1 ? "Yes" : "No"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Start Date</td>
                <td style={styles.td}>{formatDate(specialDuty?.SDt__SDate)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>End Date</td>
                <td style={styles.td}>{formatDate(specialDuty?.SDt__EDate)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Reimbursable
                </td>
                <td style={styles.td}>
                  {specialDuty?.Is_Reimburse == 1 ? "Yes" : "No"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...(specialDuty?.Is_Active == 1
                      ? styles.statusActive
                      : styles.statusInactive),
                  }}
                >
                  {specialDuty?.Is_Active == 1 ? "Active" : "Inactive"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Description
                </td>
                <td style={styles.td} colSpan="3">
                  {specialDuty?.SDt__Desc || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Audit Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Audit Information</div>
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
                <td style={styles.td}>Record Created</td>
                <td style={styles.td}>
                  {formatDateTime(specialDuty?.created_at)}
                </td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>
                  {formatDateTime(specialDuty?.updated_at)}
                </td>
              </tr>
              {specialDuty?.deleted_at && (
                <tr>
                  <td style={styles.td}>Record Deleted</td>
                  <td style={styles.td}>
                    {formatDateTime(specialDuty?.deleted_at)}
                  </td>
                  <td style={styles.td}>Report Generated</td>
                  <td style={styles.td}>
                    {new Date().toLocaleString("en-US")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Additional Information */}
        {specialDuty?.deleted_at && (
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
                  {formatDateTime(specialDuty.deleted_at)}
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
          <p className="mt-4 text-gray-600">Loading special duty details...</p>
        </div>
      </div>
    );
  }

  if (!specialDuty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Special Duty Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The special duty you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() =>
              navigate("/masters/performance-discipline-masters/special-duty")
            }
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Special Duties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Special Duty Report"
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
                navigate("/masters/performance-discipline-masters/special-duty")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {specialDuty.SDt_Name}
                </h1>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {specialDuty.SDt__Desc || "No description provided"}
              </p>
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
          <Link
            to={`/masters/performance-discipline-masters/special-duty/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Special Duty Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed information about the special duty
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Duty Name
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(specialDuty.SDt_Name)
                      }
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy duty name"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {specialDuty.SDt_Name}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Duty Code
                      </span>
                    </div>
                    {specialDuty.SDt_Code && (
                      <button
                        onClick={() =>
                          handleCopyToClipboard(specialDuty.SDt_Code)
                        }
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                        title="Copy duty code"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {specialDuty.SDt_Code ? (
                      <div className="font-mono text-lg font-bold text-purple-600">
                        {specialDuty.SDt_Code}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No code assigned
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Created Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(specialDuty.created_at)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Description
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm text-gray-900">
                      {specialDuty.SDt__Desc || "No description provided"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Cards */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">
                      Fees
                    </span>
                    <IndianRupee className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-xl font-bold text-purple-800">
                    {getFeesBadge(specialDuty.SDt_Fees)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">
                      Reimbursable
                    </span>
                    <DollarSign className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-blue-800">
                    {getReimburseBadge(specialDuty.Is_Reimburse)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">
                      Status
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-xl font-bold text-green-800">
                    {getStatusBadge(specialDuty.Is_Active)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-700">
                      Last Updated
                    </span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-sm font-bold text-amber-800">
                    {formatDateTime(specialDuty.updated_at)}
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Start Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(specialDuty.SDt__SDate)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      End Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(specialDuty.SDt__EDate)}
                    </div>
                  </div>
                </div>
              </div>

              {specialDuty.deleted_at && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Deleted Date
                    </span>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-900">
                      {formatDateTime(specialDuty.deleted_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSpecialDuty;
