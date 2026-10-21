import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  Hash,
  Edit,
  Calendar,
  Clock,
  Copy,
  Building,
  AlertCircle,
  Printer,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { PayLevelApi } from "../../../services/paylevelmasterapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewPayLevel = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payLevel, setPayLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadPayLevelData();
  }, [id]);

  const loadPayLevelData = async () => {
    setLoading(true);
    try {
      const data = await PayLevelApi.getById(id);
      setPayLevel(data);
    } catch (error) {
      toast.error("Failed to load pay level data!");
      navigate("/masters/payroll-pay-structures/pay-level");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayLevel = async () => {
    const result = await Swal.fire({
      title: "Delete Pay Level?",
      text: `Are you sure you want to delete pay level "${payLevel?.PL_Code}"? This action cannot be undone.`,
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
        await PayLevelApi.delete(id);
        toast.success(`Pay level "${payLevel?.PL_Code}" deleted successfully!`);
        navigate("/masters/payroll-pay-structures/pay-level");
      } catch (error) {
        toast.error(error.message || "Failed to delete pay level");
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

  const formatCurrency = (value) => {
    if (value == null || value == undefined) return "—";
    return `₹ ${parseFloat(value).toFixed(2)}`;
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
        {/* Pay Level Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Pay Level Summary</div>
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
                  Pay Level Code
                </td>
                <td style={styles.td}>{payLevel?.PL_Code || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Pay Level ID
                </td>
                <td style={styles.td}>{payLevel?.PL_Id || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Pay Commission
                </td>
                <td style={styles.td}>
                  {payLevel?.commission?.PC_Name || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Pay Grade</td>
                <td style={styles.td}>
                  {payLevel?.emp_grade
                    ? `${payLevel.emp_grade.EGM_Name} (${payLevel.emp_grade.EGM_Code})`
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Starting Basic
                </td>
                <td style={styles.td}>{formatCurrency(payLevel?.St_Basic)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>
                  {formatDateTime(payLevel?.created_at)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(payLevel?.updated_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...(payLevel?.deleted_at
                      ? styles.statusInactive
                      : styles.statusActive),
                  }}
                >
                  {payLevel?.deleted_at ? "Inactive" : "Active"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commission Details */}
        {payLevel?.commission && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Pay Commission Details</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Commission Name</th>
                  <th style={styles.th}>Structure Type</th>
                  <th style={styles.th}>Effective From</th>
                  <th style={styles.th}>Effective To</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>{payLevel.commission.PC_Name}</td>
                  <td style={styles.td}>
                    {payLevel.commission.structure_type?.PST_Type || "—"}
                  </td>
                  <td style={styles.td}>
                    {formatDate(payLevel.commission.Eff_From)}
                  </td>
                  <td style={styles.td}>
                    {formatDate(payLevel.commission.Eff_To)}
                  </td>
                  <td style={styles.td}>
                    {payLevel.commission.Is_Active ? (
                      <span style={styles.statusActive}>Active</span>
                    ) : (
                      <span style={styles.statusInactive}>Inactive</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Grade Details */}
        {payLevel?.emp_grade && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Pay Grade Details</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Grade Name</th>
                  <th style={styles.th}>Grade Code</th>
                  <th style={styles.th}>Pay Band</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>{payLevel.emp_grade.EGM_Name}</td>
                  <td style={styles.td}>{payLevel.emp_grade.EGM_Code}</td>
                  <td style={styles.td}>
                    {payLevel.emp_grade.pay_band?.PB_Code || "—"}
                  </td>
                  <td style={styles.td}>
                    {payLevel.emp_grade.Is_Active == "1" ? (
                      <span style={styles.statusActive}>Active</span>
                    ) : (
                      <span style={styles.statusInactive}>Inactive</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
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
                <td style={styles.td}>
                  {formatDateTime(payLevel?.created_at)}
                </td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>
                  {formatDateTime(payLevel?.updated_at)}
                </td>
              </tr>
              {payLevel?.deleted_at && (
                <tr>
                  <td style={styles.td}>Record Deleted</td>
                  <td style={styles.td}>
                    {formatDateTime(payLevel?.deleted_at)}
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pay level details...</p>
        </div>
      </div>
    );
  }

  if (!payLevel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Pay Level Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The pay level you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/pay-level")
            }
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pay Levels
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
          title="Pay Level Report"
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
                navigate("/masters/payroll-pay-structures/pay-level")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {payLevel.PL_Code}
                </h1>
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
            to={`/masters/payroll-pay-structures/pay-level/edit/${id}`}
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
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pay Level Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed information about the pay level
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Pay Level Code
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(payLevel.PL_Code)}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy pay level code"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="font-mono text-lg font-bold text-purple-600">
                      {payLevel.PL_Code}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Pay Commission
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {payLevel.commission?.PC_Name || "—"}
                    </div>
                    {payLevel.commission?.structure_type && (
                      <div className="text-xs text-gray-500 mt-1">
                        {payLevel.commission.structure_type.PST_Type}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Pay Grade
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {payLevel.emp_grade ? (
                      <>
                        <div className="text-lg font-semibold text-gray-900">
                          {payLevel.emp_grade.EGM_Name}
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 italic">
                        No grade assigned
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Starting Basic
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(payLevel.St_Basic)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Created Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(payLevel.created_at)}
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
                      {formatDateTime(payLevel.updated_at)}
                    </div>
                  </div>
                </div>
              </div>

              {payLevel.deleted_at && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Deleted Date
                    </span>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-900">
                      {formatDateTime(payLevel.deleted_at)}
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

export default ViewPayLevel;
