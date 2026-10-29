import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Hash,
  Edit,
  Calendar,
  Clock,
  Copy,
  Folder,
  AlertCircle,
  Printer,
  Building2
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { PayrollBillApi } from "../../../services/payrollbillapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewPayrollBill = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payrollBill, setPayrollBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadPayrollBillData();
  }, [id]);

  const loadPayrollBillData = async () => {
    setLoading(true);
    try {
      const data = await PayrollBillApi.getById(id);
      setPayrollBill(data);
    } catch (error) {
      toast.error("Failed to load payroll bill data!");
      navigate("/masters/administrative-masters/paybill-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayrollBill = async () => {
    const result = await Swal.fire({
      title: "Delete Payroll Bill?",
      text: `Are you sure you want to delete "${payrollBill?.PayBill_Code}"? This action cannot be undone.`,
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
        await PayrollBillApi.delete(id);
        toast.success(
          `Payroll Bill "${payrollBill?.PayBill_Code}" deleted successfully!`,
        );
        navigate("/masters/administrative-masters/paybill-master");
      } catch (error) {
        toast.error(error.message || "Failed to delete payroll bill");
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
      statusActive: { color: "#059669", fontWeight: "600" },
      statusInactive: { color: "#dc2626", fontWeight: "600" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Payroll Bill Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Payroll Bill Summary</div>
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
                  PayBill Code
                </td>
                <td style={styles.td}>{payrollBill?.PayBill_Code || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  PayBill ID
                </td>
                <td style={styles.td}>{payrollBill?.PRB_id || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Description
                </td>
                <td style={styles.td}>{payrollBill?.Description || "—"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Ledger
                </td>
                <td style={styles.td}>
                  {payrollBill?.ledger ? (
                    <>
                      {payrollBill.ledger.Lg_Name} ({payrollBill.ledger.Lg_Code})
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>
                  {formatDateTime(payrollBill?.created_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(payrollBill?.updated_at)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...(payrollBill?.deleted_at
                      ? styles.statusInactive
                      : styles.statusActive),
                  }}
                >
                  {payrollBill?.deleted_at ? "Inactive" : "Active"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Report Generated
                </td>
                <td style={styles.td}>{new Date().toLocaleString("en-US")}</td>
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
                  {formatDateTime(payrollBill?.created_at)}
                </td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>
                  {formatDateTime(payrollBill?.updated_at)}
                </td>
              </tr>
              {payrollBill?.deleted_at && (
                <tr>
                  <td style={styles.td}>Record Deleted</td>
                  <td style={styles.td}>
                    {formatDateTime(payrollBill?.deleted_at)}
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
        {payrollBill?.deleted_at && (
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
                  {formatDateTime(payrollBill.deleted_at)}
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payroll bill details...</p>
        </div>
      </div>
    );
  }

  if (!payrollBill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Payroll Bill Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The payroll bill you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/masters/administrative-masters/paybill-master")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payroll Bills
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
          title="Payroll Bill Report"
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
              onClick={() => navigate("/masters/administrative-masters/paybill-master")}
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {payrollBill.PayBill_Code}
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
            to={`/masters/administrative-masters/paybill-master/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm font-medium"
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
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payroll Bill Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed information about the payroll bill
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
                        PayBill Code
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(payrollBill.PayBill_Code)
                      }
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      title="Copy code"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {payrollBill.PayBill_Code}
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-0">
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Description
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-base text-gray-900">
                      {payrollBill.Description || (
                        <span className="text-gray-400 italic">No description provided</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Folder className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Ledger
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    {payrollBill.ledger ? (
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {payrollBill.ledger.Lg_Name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          {payrollBill.ledger.Lg_Eng_Name && (
                            <span className="text-xs text-gray-500">
                              {payrollBill.ledger.Lg_Eng_Name}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">No ledger assigned</div>
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
                      {formatDateTime(payrollBill.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Status</span>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xl font-bold text-blue-800">
                    Active
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">Ledger Status</span>
                  </div>
                  <div className="text-xl font-bold text-purple-800">
                    {payrollBill.ledger ? "Assigned" : "Not Assigned"}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Last Updated</span>
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-sm font-bold text-gray-800">
                    {formatDateTime(payrollBill.updated_at)}
                  </div>
                </div>
              </div>

              {payrollBill.deleted_at && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Deleted Date
                    </span>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-900">
                      {formatDateTime(payrollBill.deleted_at)}
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

export default ViewPayrollBill;