// components/attendance/attendance-record-entry/view.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Printer,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Briefcase,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { AttendanceEntryApi } from "../../../../services/attendanceentryapi";
import PrintLayout from "../../../../../components/printlayout";
import { useOrganization } from "../../../../../hooks/useorganization";

const ViewAttendanceRecord = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadAttendanceRecordData();
  }, [id]);

  const loadAttendanceRecordData = async () => {
    setLoading(true);
    try {
      const data = await AttendanceEntryApi.getById(id);
      setAttendanceRecord(data);
    } catch (error) {
      console.error("Error loading attendance record:", error);
      toast.error("Failed to load attendance record data!");
      navigate(
        "/transactions/attendance-management/attendance/attendance-record-entry",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Attendance Record?",
      text: `Are you sure you want to delete attendance record for "${attendanceRecord?.employee?.First_Name} ${attendanceRecord?.employee?.Last_Name}"?`,
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
        await AttendanceEntryApi.delete(id);
        toast.success(`Attendance record deleted successfully!`);
        navigate(
          "/transactions/attendance-management/attendance/attendance-record-entry",
        );
      } catch (error) {
        toast.error(error.message || "Failed to delete attendance record");
      }
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
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatMonth = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[parseInt(month) - 1] || month;
  };

  const getAttendancePercentage = () => {
    if (!attendanceRecord) return 0;
    const total =
      (parseInt(attendanceRecord.Total_Presence) || 0) +
      (parseInt(attendanceRecord.Total_Absent) || 0);
    if (total == 0) return 0;
    return ((parseInt(attendanceRecord.Total_Presence) || 0) / total) * 100;
  };

  const getAttendanceStatus = () => {
    const percentage = getAttendancePercentage();
    if (percentage >= 80)
      return { text: "Excellent", color: "text-green-600", bg: "bg-green-100" };
    if (percentage >= 60)
      return { text: "Good", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (percentage >= 40)
      return { text: "Average", color: "text-orange-600", bg: "bg-orange-100" };
    return { text: "Poor", color: "text-red-600", bg: "bg-red-100" };
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
      <div style={{ fontSize: "11px" }}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Employee Information</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Employee Name
                </td>
                <td style={styles.td}>
                  {attendanceRecord?.employee?.First_Name}{" "}
                  {attendanceRecord?.employee?.Last_Name}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Employee Code
                </td>
                <td style={styles.td}>
                  {attendanceRecord?.employee?.Emp_Code}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Payroll Bill
                </td>
                <td style={styles.td}>
                  {attendanceRecord?.payroll_bill?.PayBill_Code} -{" "}
                  {attendanceRecord?.payroll_bill?.Description}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Financial Year
                </td>
                <td style={styles.td}>
                  {attendanceRecord?.financial_year?.FY_Name}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Attendance Details</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Month</td>
                <td style={styles.td}>
                  {formatMonth(attendanceRecord?.Month)}{" "}
                  {attendanceRecord?.Year}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Total Presence
                </td>
                <td style={styles.td}>
                  {attendanceRecord?.Total_Presence} days
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Total Absent
                </td>
                <td style={styles.td}>{attendanceRecord?.Total_Absent} days</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Total Holiday
                </td>
                <td style={styles.td}>
                  {attendanceRecord?.Total_Holiday} days
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Working Days Present
                </td>
                <td style={styles.td}>
                  {attendanceRecord?.Total_WKOF_Pre} days
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Total Duration
                </td>
                <td style={styles.td}>{attendanceRecord?.Total_Duration}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Overtime</td>
                <td style={styles.td}>{attendanceRecord?.Total_Over_Time}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Late By</td>
                <td style={styles.td}>{attendanceRecord?.Total_LateBy}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Early By</td>
                <td style={styles.td} colSpan="3">
                  {attendanceRecord?.Total_EarlyBy}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>System Information</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Created At</td>
                <td style={styles.td}>
                  {formatDateTime(attendanceRecord?.created_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(attendanceRecord?.updated_at)}
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading attendance record details...
        </p>
      </div>
    );
  }

  if (!attendanceRecord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Attendance Record Not Found
        </h2>
        <button
          onClick={() =>
            navigate(
              "/transactions/attendance-management/attendance/attendance-record-entry",
            )
          }
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Records
        </button>
      </div>
    );
  }

  const status = getAttendanceStatus();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {showPrint && (
        <PrintLayout
          title="Attendance Record Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/transactions/attendance-management/attendance/attendance-record-entry",
              )
            }
            className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance Record Details
            </h1>
            <p className="text-sm text-gray-600">
              {attendanceRecord.employee?.First_Name}{" "}
              {attendanceRecord.employee?.Last_Name} -{" "}
              {formatMonth(attendanceRecord.Month)} {attendanceRecord.Year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrint(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-sm font-medium"
          >
            <Printer className="h-4 w-4 mr-2" /> Print
          </button>
          <Link
            to={`/transactions/attendance-management/attendance/attendance-record-entry/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getAttendancePercentage().toFixed(1)}%
                </p>
              </div>
              <div
                className={`h-12 w-12 rounded-full ${status.bg} flex items-center justify-center`}
              >
                <span className={`text-lg font-bold ${status.color}`}>
                  {Math.round(getAttendancePercentage())}%
                </span>
              </div>
            </div>
            <p className={`text-sm font-medium ${status.color} mt-2`}>
              Status: {status.text}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Present Days</p>
                <p className="text-2xl font-bold text-green-600">
                  {attendanceRecord.Total_Presence || 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Absent Days</p>
                <p className="text-2xl font-bold text-red-600">
                  {attendanceRecord.Total_Absent || 0}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Working Days</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(parseInt(attendanceRecord.Total_Presence) || 0) +
                    (parseInt(attendanceRecord.Total_Absent) || 0)}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Details Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Employee Information
                  </h3>
                </div>
                <div className="space-y-2 pl-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Name:</span>{" "}
                    {attendanceRecord.employee?.First_Name}{" "}
                    {attendanceRecord.employee?.Last_Name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">
                      Employee Code:
                    </span>{" "}
                    {attendanceRecord.employee?.Emp_Code || "—"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Email:</span>{" "}
                    {attendanceRecord.employee?.Email_Id || "—"}
                  </p>
                </div>
              </div>

              {/* Payroll Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Payroll Information
                  </h3>
                </div>
                <div className="space-y-2 pl-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">
                      Payroll Bill:
                    </span>{" "}
                    {attendanceRecord.payroll_bill?.PayBill_Code} -{" "}
                    {attendanceRecord.payroll_bill?.Description}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">
                      Financial Year:
                    </span>{" "}
                    {attendanceRecord.financial_year?.FY_Name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">
                      Month/Year:
                    </span>{" "}
                    {formatMonth(attendanceRecord.Month)}{" "}
                    {attendanceRecord.Year}
                  </p>
                </div>
              </div>

              {/* Attendance Details */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    Attendance Details
                  </h3>
                </div>
                <div className="space-y-2 pl-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">
                      Total Presence:
                    </span>{" "}
                    {attendanceRecord.Total_Presence || 0} days
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">
                      Total Absent:
                    </span>{" "}
                    {attendanceRecord.Total_Absent || 0} days
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">
                      Total Holiday:
                    </span>{" "}
                    {attendanceRecord.Total_Holiday || 0} days
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">
                      Working Days Present:
                    </span>{" "}
                    {attendanceRecord.Total_WKOF_Pre || 0} days
                  </p>
                </div>
              </div>

              {/* Time Details */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Time Details</h3>
                </div>
                <div className="space-y-2 pl-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">
                      Total Duration:
                    </span>{" "}
                    {attendanceRecord.Total_Duration}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Overtime:</span>{" "}
                    {attendanceRecord.Total_Over_Time}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Late By:</span>{" "}
                    {attendanceRecord.Total_LateBy}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600">Early By:</span>{" "}
                    {attendanceRecord.Total_EarlyBy}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="text-sm">
                  <span className="font-medium text-gray-600">Created:</span>{" "}
                  {formatDateTime(attendanceRecord.created_at)}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-600">
                    Last Updated:
                  </span>{" "}
                  {formatDateTime(attendanceRecord.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAttendanceRecord;
