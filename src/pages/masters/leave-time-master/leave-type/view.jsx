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
  Hash,
  Info,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  RotateCcw,
  Briefcase,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LeaveTypeApi } from "../../../services/leavetypeapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewLeaveType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaveType, setLeaveType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadLeaveTypeData();
  }, [id]);

  const loadLeaveTypeData = async () => {
    setLoading(true);
    try {
      const data = await LeaveTypeApi.getById(id);
      setLeaveType(data);
    } catch (error) {
      console.error("Error loading leave type:", error);
      toast.error("Failed to load leave type data!");
      navigate("/masters/leave-time-master/leave-type");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Leave Type?",
      text: `Are you sure you want to delete "${leaveType?.LT_name}"?`,
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
        await LeaveTypeApi.delete(id);
        toast.success(`Leave type deleted successfully!`);
        navigate("/masters/leave-time-master/leave-type");
      } catch (error) {
        toast.error(error.message || "Failed to delete leave type");
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

  const getStatusBadge = (status) => {
    return status ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" /> Inactive
      </span>
    );
  };

  const getPaidBadge = (isPaid) => {
    return isPaid ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <DollarSign className="h-3 w-3 mr-1" /> Paid Leave
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" /> Unpaid Leave
      </span>
    );
  };

  const getGenderBadge = (gender) => {
    switch (gender) {
      case "M":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Users className="h-3 w-3 mr-1" /> Male
          </span>
        );
      case "F":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
            <Users className="h-3 w-3 mr-1" /> Female
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Users className="h-3 w-3 mr-1" /> All
          </span>
        );
    }
  };

  const getAccrualPolicyBadge = (policy) => {
    const policies = {
      YEARLY: "Yearly",
      HALF_YEARLY: "Half Yearly",
      QUARTERLY: "Quarterly",
      MONTHLY: "Monthly",
    };
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <TrendingUp className="h-3 w-3 mr-1" />
        {policies[policy] || policy}
      </span>
    );
  };

  const getBooleanBadge = (value, trueText = "Yes", falseText = "No") => {
    return value ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle2 className="h-3 w-3 mr-1" /> {trueText}
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3 mr-1" /> {falseText}
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
          <div style={styles.sectionTitle}>Basic Information</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Code</td>
                <td style={styles.td}>{leaveType?.LT_code || "—"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Name</td>
                <td style={styles.td}>{leaveType?.LT_name}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Max Days</td>
                <td style={styles.td}>{leaveType?.Max_days || 0}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Allowed Gender
                </td>
                <td style={styles.td}>
                  {leaveType?.Alw_Gen == "M"
                    ? "Male"
                    : leaveType?.Alw_Gen == "F"
                      ? "Female"
                      : "All"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Application Rules</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Min Days Before Application
                </td>
                <td style={styles.td}>{leaveType?.Min_ApBf || 0}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Min Days Per Application
                </td>
                <td style={styles.td}>{leaveType?.Min_ApDy || 0}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Max Days Per Application
                </td>
                <td style={styles.td}>{leaveType?.Max_ApDy || 0}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Half Day Allowed
                </td>
                <td style={styles.td}>{leaveType?.Is_HfDy ? "Yes" : "No"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Accrual Policy</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Accrual Policy
                </td>
                <td style={styles.td}>{leaveType?.Acr_Plcy}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Accrual Days
                </td>
                <td style={styles.td}>{leaveType?.Acr_Days || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Carry Forward & Encashment</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Carry Forward Allowed
                </td>
                <td style={styles.td}>{leaveType?.Is_CryFw ? "Yes" : "No"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Max Carry Forward Days
                </td>
                <td style={styles.td}>{leaveType?.Max_CfAl || 0}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Encashment Allowed
                </td>
                <td style={styles.td}>{leaveType?.Is_Encash ? "Yes" : "No"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Paid Status
                </td>
                <td style={styles.td}>
                  {leaveType?.Is_Paid ? "Paid" : "Unpaid"}
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
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={styles.td}>
                  {leaveType?.Is_Active ? "Active" : "Inactive"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Created</td>
                <td style={styles.td}>
                  {formatDateTime(leaveType?.created_at)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td colSpan="3" style={styles.td}>
                  {formatDateTime(leaveType?.updated_at)}
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
        <p className="mt-4 text-gray-600">Loading leave type details...</p>
      </div>
    );
  }

  if (!leaveType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Leave Type Not Found
        </h2>
        <button
          onClick={() => navigate("/masters/leave-time-master/leave-type")}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Leave Types
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {showPrint && (
        <PrintLayout
          title="Leave Type Details Report"
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
            onClick={() => navigate("/masters/leave-time-master/leave-type")}
            className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Leave Type Details
            </h1>
            <p className="text-sm text-gray-600">{leaveType.LT_name}</p>
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
            to={`/masters/leave-time-master/leave-type/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 shadow-sm font-medium"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Hash className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Code
                  </span>
                </div>
                <p className="text-lg font-semibold text-purple-600">
                  {leaveType.LT_code || "—"}
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Name
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {leaveType.LT_name}
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Max Days
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {leaveType.Max_days || 0} days
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Allowed Gender
                  </span>
                </div>
                {getGenderBadge(leaveType.Alw_Gen)}
              </div>
            </div>
          </div>
        </div>

        {/* Application Rules */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Application Rules
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Min Days Before Application
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {leaveType.Min_ApBf || 0} days
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Min Days Per Application
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {leaveType.Min_ApDy || 0} days
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Max Days Per Application
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {leaveType.Max_ApDy || 0} days
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <RotateCcw className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Half Day Allowed
                  </span>
                </div>
                {getBooleanBadge(leaveType.Is_HfDy)}
              </div>
            </div>
          </div>
        </div>

        {/* Accrual Policy */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Accrual Policy
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Accrual Policy
                  </span>
                </div>
                {getAccrualPolicyBadge(leaveType.Acr_Plcy)}
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Accrual Days
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {leaveType.Acr_Days || 0} days per period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Carry Forward & Encashment */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Carry Forward & Encashment
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <RotateCcw className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Carry Forward
                  </span>
                </div>
                {getBooleanBadge(leaveType.Is_CryFw)}
                {leaveType.Is_CryFw && leaveType.Max_CfAl && (
                  <p className="mt-2 text-sm text-gray-600">
                    Max: {leaveType.Max_CfAl} days
                  </p>
                )}
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Encashment
                  </span>
                </div>
                {getBooleanBadge(leaveType.Is_Encash)}
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Paid Status
                  </span>
                </div>
                {getPaidBadge(leaveType.Is_Paid)}
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              System Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <CheckCircle2 className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Status
                  </span>
                </div>
                {getStatusBadge(leaveType.Is_Active)}
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Created
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {formatDateTime(leaveType.created_at)}
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50 col-span-2">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Last Updated
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {formatDateTime(leaveType.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveType;
