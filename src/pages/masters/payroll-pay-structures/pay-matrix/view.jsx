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
  Calculator,
  Hash,
  Edit,
  Calendar,
  Clock,
  Copy,
  DollarSign,
  AlertCircle,
  Printer,
  Layers,
  Grid,
  Building,
  Check,
  Scale,
  Users,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { PayMatrixApi } from "../../../services/paymatrixapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewPayMatrix = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payMatrix, setPayMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadPayMatrixData();
  }, [id]);

  const loadPayMatrixData = async () => {
    setLoading(true);
    try {
      const data = await PayMatrixApi.getById(id);
      console.log("Pay Matrix Data:", data); // Debug log
      setPayMatrix(data);
    } catch (error) {
      toast.error("Failed to load pay matrix data!");
      navigate("/masters/payroll-pay-structures/pay-matrix");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayMatrix = async () => {
    const result = await Swal.fire({
      title: "Delete Pay Matrix Entry?",
      text: `Are you sure you want to delete Pay Matrix entry for Grade "${payMatrix?.emp_grade?.EGM_Name}" - Cell ${payMatrix?.Cell_Index}? This action cannot be undone.`,
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
        await PayMatrixApi.delete(id);
        toast.success(`Pay matrix entry deleted successfully!`);
        navigate("/masters/payroll-pay-structures/pay-matrix");
      } catch (error) {
        toast.error(error.message || "Failed to delete pay matrix entry");
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
    if (value == null || value == undefined || value == "") return "—";
    return `₹${parseFloat(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        {/* Pay Matrix Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Pay Matrix Summary</div>
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
                  Employee Grade
                </td>
                <td style={styles.td}>
                  {payMatrix?.emp_grade?.EGM_Name || "N/A"} (
                  {payMatrix?.emp_grade?.EGM_Code || "N/A"})
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Cell Index</td>
                <td style={styles.td}>{payMatrix?.Cell_Index || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Basic Pay</td>
                <td style={styles.td}>
                  {formatCurrency(payMatrix?.Basic_Pay)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Entry ID</td>
                <td style={styles.td}>{payMatrix?.PMM_Id || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...(payMatrix?.deleted_at
                      ? styles.statusInactive
                      : styles.statusActive),
                  }}
                >
                  {payMatrix?.deleted_at ? "Inactive" : "Active"}
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
                  {formatDateTime(payMatrix?.created_at)}
                </td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>
                  {formatDateTime(payMatrix?.updated_at)}
                </td>
              </tr>
              {payMatrix?.deleted_at && (
                <tr>
                  <td style={styles.td}>Record Deleted</td>
                  <td style={styles.td}>
                    {formatDateTime(payMatrix?.deleted_at)}
                  </td>
                  <td style={styles.td}></td>
                  <td style={styles.td}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Deletion Information */}
        {payMatrix?.deleted_at && (
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
                  {formatDateTime(payMatrix.deleted_at)}
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
          <p className="mt-4 text-gray-600">Loading pay matrix details...</p>
        </div>
      </div>
    );
  }

  if (!payMatrix) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Pay Matrix Entry Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The pay matrix entry you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() =>
              navigate("/masters/payroll-pay-structures/pay-matrix")
            }
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pay Matrix
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
          title="Pay Matrix Report"
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
                navigate("/masters/payroll-pay-structures/pay-matrix")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  Pay Matrix Details
                </h1>
              </div>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span>{payMatrix.emp_grade?.EGM_Name || "Grade"}</span>
                <ChevronRight className="h-3 w-3 mx-2" />
                <span>Cell {payMatrix.Cell_Index}</span>
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
            to={`/masters/payroll-pay-structures/pay-matrix/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pay Matrix Information */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pay Matrix Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed information about the pay matrix entry
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Grade */}
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Employee Grade
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(payMatrix.emp_grade?.EGM_Name)
                      }
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy grade name"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {payMatrix.emp_grade?.EGM_Name || "—"}
                    </div>
                  </div>
                </div>

                {/* Cell Index */}
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Grid className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Cell Index
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(payMatrix.Cell_Index)
                      }
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy cell index"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {payMatrix.Cell_Index || "—"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Cell position in pay matrix
                    </div>
                  </div>
                </div>

                {/* Basic Pay */}
                <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Basic Pay
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(payMatrix.Basic_Pay)}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      title="Copy basic pay amount"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(payMatrix.Basic_Pay)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Current basic pay amount
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPayMatrix;
