import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Hash,
  Edit,
  Trash2,
  CalendarDays,
  Clock,
  Copy,
  AlertCircle,
  Printer,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { HolidayApi } from "../../../services/holidaymasterapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewHoliday = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [holiday, setHoliday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadHolidayData();
  }, [id]);

  const loadHolidayData = async () => {
    setLoading(true);
    try {
      const data = await HolidayApi.getById(id);
      setHoliday(data);
    } catch (error) {
      toast.error("Failed to load holiday data!");
      navigate("/masters/leave-time-master/holidaymaster");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async () => {
    const result = await Swal.fire({
      title: "Delete Holiday?",
      text: `Are you sure you want to delete "${holiday?.HL_Name}"? This action cannot be undone.`,
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
        await HolidayApi.delete(id);
        toast.success(`Holiday "${holiday?.HL_Name}" deleted successfully!`);
        navigate("/masters/leave-time-master/holidaymaster");
      } catch (error) {
        toast.error(error.message || "Failed to delete holiday");
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

  const getStatusBadge = (status) => {
    return status ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getYesNoBadge = (value) => {
    if (value == "Yes") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Yes
        </span>
      );
    } else if (value == "No") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          No
        </span>
      );
    }
    return <span className="text-gray-400">—</span>;
  };

  // Print Report Content Component
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
        {/* Holiday Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Holiday Summary</div>
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
                  Holiday Name
                </td>
                <td style={styles.td}>{holiday?.HL_Name || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Holiday Code
                </td>
                <td style={styles.td}>{holiday?.HL_Code || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Holiday ID</td>
                <td style={styles.td}>{holiday?.HL_Id || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Year</td>
                <td style={styles.td}>{holiday?.CI_Year || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Holiday Date
                </td>
                <td style={styles.td}>{formatDate(holiday?.HL_Date)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Type</td>
                <td style={styles.td}>{holiday?.HL_Type || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Category</td>
                <td style={styles.td}>{holiday?.HL_Cate || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Paid Holiday
                </td>
                <td style={styles.td}>{holiday?.HL_ISPaid || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Optional Holiday
                </td>
                <td style={styles.td}>{holiday?.HL_ISOptional || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Compensatory
                </td>
                <td style={styles.td}>{holiday?.HL_ISCmpnst || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Attendance Impact
                </td>
                <td style={styles.td}>{holiday?.HL_AttnImpact || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Pay Impact</td>
                <td style={styles.td}>{holiday?.HL_PayImpact || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>OT Allowed</td>
                <td style={styles.td}>{holiday?.HL_OTAllowed || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...(holiday?.HL_Status
                      ? styles.statusActive
                      : styles.statusInactive),
                  }}
                >
                  {holiday?.HL_Status ? "Active" : "Inactive"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Remarks */}
        {holiday?.Remarks && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Remarks</div>
            <div
              style={{
                padding: "8px",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                backgroundColor: "#f9fafb",
                fontSize: "10px",
              }}
            >
              {holiday.Remarks}
            </div>
          </div>
        )}

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
                <td style={styles.td}>{formatDateTime(holiday?.created_at)}</td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>{formatDateTime(holiday?.updated_at)}</td>
              </tr>
              {holiday?.deleted_at && (
                <tr>
                  <td style={styles.td}>Record Deleted</td>
                  <td style={styles.td}>
                    {formatDateTime(holiday?.deleted_at)}
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

        {/* Deletion Information */}
        {holiday?.deleted_at && (
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
                  {formatDateTime(holiday.deleted_at)}
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
          <p className="mt-4 text-gray-600">Loading holiday details...</p>
        </div>
      </div>
    );
  }

  if (!holiday) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Holiday Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The holiday you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/masters/leave-time-master/holidaymaster")}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Holidays
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
          title="Holiday Report"
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
                navigate("/masters/leave-time-master/holidaymaster")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {holiday.HL_Name}
                </h1>
                {holiday.HL_Code && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Hash className="h-3 w-3 mr-1" />
                    Code: {holiday.HL_Code}
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(holiday.HL_Date)}
                </span>
              </div>
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
            to={`/masters/leave-time-master/holidaymaster/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Holiday Information */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Holiday Information
                </h2>
                <p className="text-sm text-gray-600">
                  Detailed information about the holiday
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Holiday Name */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Holiday Name
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyToClipboard(holiday.HL_Name)}
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                    title="Copy holiday name"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {holiday.HL_Name}
                  </div>
                </div>
              </div>

              {/* Holiday Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Holiday Code
                    </span>
                  </div>
                  {holiday.HL_Code && (
                    <button
                      onClick={() => handleCopyToClipboard(holiday.HL_Code)}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy holiday code"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  {holiday.HL_Code ? (
                    <div className="font-mono text-lg font-bold text-purple-600">
                      {holiday.HL_Code}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No code assigned</div>
                  )}
                </div>
              </div>

              {/* Holiday ID */}
              <div>
                <div className="flex items-center mb-2">
                  <Hash className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Holiday ID
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {holiday.HL_Id}
                  </div>
                </div>
              </div>

              {/* Year */}
              <div>
                <div className="flex items-center mb-2">
                  <CalendarDays className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Year
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {holiday.CI_Year || "—"}
                  </div>
                </div>
              </div>

              {/* Holiday Date */}
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Holiday Date
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(holiday.HL_Date)}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Status
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  {getStatusBadge(holiday.HL_Status)}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">
                Holiday Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Type */}
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Holiday Type
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {holiday.HL_Type || "—"}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Category
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {holiday.HL_Cate || "—"}
                    </span>
                  </div>
                </div>

                {/* Paid Holiday */}
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Paid Holiday
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {getYesNoBadge(holiday.HL_ISPaid)}
                  </div>
                </div>

                {/* Optional Holiday */}
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Optional Holiday
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {getYesNoBadge(holiday.HL_ISOptional)}
                  </div>
                </div>

                {/* Compensatory */}
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Compensatory
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {getYesNoBadge(holiday.HL_ISCmpnst)}
                  </div>
                </div>

                {/* Attendance Impact */}
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Attendance Impact
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {holiday.HL_AttnImpact || "—"}
                    </span>
                  </div>
                </div>

                {/* Pay Impact */}
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Pay Impact
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {holiday.HL_PayImpact || "—"}
                    </span>
                  </div>
                </div>

                {/* OT Allowed */}
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      OT Allowed
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {getYesNoBadge(holiday.HL_OTAllowed)}
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            {holiday.Remarks && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-2">
                  Remarks
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-gray-700">{holiday.Remarks}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-6 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Created Date
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDateTime(holiday.created_at)}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Last Updated
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDateTime(holiday.updated_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Deleted Date */}
            {holiday.deleted_at && (
              <div className="mt-6">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Deleted Date
                  </span>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="text-sm font-medium text-red-900">
                    {formatDateTime(holiday.deleted_at)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHoliday;
