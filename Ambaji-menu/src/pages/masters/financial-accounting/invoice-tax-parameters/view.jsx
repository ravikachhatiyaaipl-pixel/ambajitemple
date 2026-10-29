import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Percent,
  XCircle,
  Edit,
  Calendar,
  Clock,
  Copy,
  Briefcase,
  Plus,
  Minus,
  Building,
  Code,
  Printer,
  AlertCircle,
  Trash2,
  CheckCircle,
  XCircle as XCircleIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { InvoiceTaxParameterApi } from "../../../services/invoicetaxparameterapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewInvoiceTaxParameter = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parameter, setParameter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadParameterData();
  }, [id]);

  const loadParameterData = async () => {
    setLoading(true);
    try {
      const data = await InvoiceTaxParameterApi.getById(id);
      
      // Handle the response structure - data might be an array
      const parameterData = Array.isArray(data) && data.length > 0 ? data[0] : data;
      setParameter(parameterData);
    } catch (error) {
      toast.error(error.message || "Failed to load tax parameter data!");
      navigate("/masters/financial-accounting/invoice-tax-parameter");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParameter = async () => {
    const result = await Swal.fire({
      title: "Delete Tax Parameters?",
      text: `Are you sure you want to delete these tax parameters? This action cannot be undone.`,
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
        await InvoiceTaxParameterApi.delete(id);
        toast.success(`Tax parameters deleted successfully!`);
        navigate("/masters/financial-accounting/invoice-tax-parameter");
      } catch (error) {
        toast.error(error.message || "Failed to delete tax parameters");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Helper function to get Exempt Allow display
  const getExemptAllowDisplay = (entry) => {
    if (entry.Exmp_Alw == "Yes" || entry.Exmp_Alw == 1 || entry.Exmp_Alw == "1") {
      return { text: "Yes", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle };
    }
    return { text: "No", color: "text-gray-600", bg: "bg-gray-100", icon: XCircleIcon };
  };

  // Print Report Content Component
  const PrintReportContent = () => {
    const taxParameters = parameter?.parameters || [];

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
        fontSize: "9px",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "5px 6px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      td: {
        padding: "4px 6px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textBold: { fontWeight: "600" },
    };

    return (
      <div style={{ fontSize: "10px", lineHeight: "1.4" }}>
        {/* Tax Parameters Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Tax Parameters Summary</div>
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
                  Tender Work ID
                </td>
                <td style={styles.td}>{parameter?.tnt_id || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Tender Work
                </td>
                <td style={styles.td}>
                  {parameter?.tender?.TnT_Name || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Work Code</td>
                <td style={styles.td}>
                  {parameter?.tender?.TnT_Code || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Effective Date
                </td>
                <td style={styles.td}>
                  {parameter?.formatted_eff_date || 
                   (parameter?.eff_date ? new Date(parameter.eff_date).toLocaleDateString() : "N/A")}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>
                  {formatDateTime(parameter?.created_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(parameter?.updated_at)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Total Parameters
                </td>
                <td style={styles.td}>{taxParameters.length}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Report Generated
                </td>
                <td style={styles.td}>{new Date().toLocaleString("en-US")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Parameter Details Table */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            Tax Parameter Details ({taxParameters.length} entries)
          </div>
          {taxParameters.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr</th>
                  <th style={styles.th}>Tax Type</th>
                  <th style={styles.th}>Add/Deduct</th>
                  <th style={styles.th}>Percentage</th>
                  <th style={styles.th}>Ledger Account</th>
                  <th style={styles.th}>Ledger Code</th>
                  <th style={styles.th}>Exempt Allow</th>
                  <th style={styles.th}>Formula</th>
                </tr>
              </thead>
              <tbody>
                {taxParameters.map((entry, index) => {
                  const exemptDisplay = getExemptAllowDisplay(entry);
                  return (
                    <tr key={index}>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {entry.VIP_Sr || index + 1}
                      </td>
                      <td style={styles.td}>
                        {entry.invoice_charge?.IC_Name || `Tax ID ${entry.IC_Id}`}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            color: entry.Add_Dedu == 1 || entry.Add_Dedu == "1" ? "#059669" : "#dc2626",
                            fontWeight: "600",
                          }}
                        >
                          {entry.Add_Dedu == 1 || entry.Add_Dedu == "1" ? "Add" : "Deduct"}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600" }}>
                        {entry.Percent}%
                      </td>
                      <td style={styles.td}>
                        {entry.ledger?.Lg_Name || "N/A"}
                      </td>
                      <td style={styles.td}>
                        {entry.ledger?.Lg_Code || "N/A"}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            color: exemptDisplay.text == "Yes" ? "#059669" : "#6b7280",
                            fontWeight: "600",
                          }}
                        >
                          {exemptDisplay.text}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontFamily: "monospace" }}>
                        {entry.Formula || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div
              style={{
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                backgroundColor: "#f9fafb",
                textAlign: "center",
                fontSize: "9px",
                color: "#6b7280",
              }}
            >
              No tax parameters configured
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        {taxParameters.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Summary Statistics</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: "#f0f9ff",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "10px", color: "#0c4a6e" }}>
                  Total Parameters
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#0369a1",
                  }}
                >
                  {taxParameters.length}
                </div>
              </div>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: "#f0fdf4",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "10px", color: "#064e3b" }}>
                  Add Operations
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#059669",
                  }}
                >
                  {taxParameters.filter((t) => t.Add_Dedu == 1 || t.Add_Dedu == "1").length}
                </div>
              </div>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: "#fef2f2",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "10px", color: "#7f1d1d" }}>
                  Deduct Operations
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#dc2626",
                  }}
                >
                  {taxParameters.filter((t) => t.Add_Dedu == 0 || t.Add_Dedu == "0").length}
                </div>
              </div>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor: "#f3e8ff",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "10px", color: "#6b21a8" }}>
                  Exempt Allow
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#7e22ce",
                  }}
                >
                  Yes: {taxParameters.filter((t) => t.Exmp_Alw == "Yes" || t.Exmp_Alw == 1 || t.Exmp_Alw == "1").length}
                </div>
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
          <p className="mt-4 text-gray-600">Loading tax parameter details...</p>
        </div>
      </div>
    );
  }

  if (!parameter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Tax Parameters Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The tax parameters you're looking for don't exist or have been
            removed.
          </p>
          <button
            onClick={() =>
              navigate("/masters/financial-accounting/invoice-tax-parameter")
            }
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tax Parameters
          </button>
        </div>
      </div>
    );
  }

  const taxParameters = parameter.parameters || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Invoice Tax Parameters Report"
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
                navigate("/masters/financial-accounting/invoice-tax-parameter")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  Tax Parameters for {parameter.tender?.TnT_Name || `Tender ID ${parameter.tnt_id}`}
                </h1>
              </div>
              <p className="text-gray-600 mt-1">
                {taxParameters.length} tax parameters • Effective:{" "}
                {parameter.formatted_eff_date || 
                 (parameter.eff_date ? new Date(parameter.eff_date).toLocaleDateString() : "N/A")}
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
            to={`/masters/financial-accounting/invoice-tax-parameter/edit/${id}`}
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
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-sm">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tender work and effective date
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
                        Tender Work
                      </span>
                    </div>
                    {parameter.tender?.TnT_Name && (
                      <button
                        onClick={() =>
                          handleCopyToClipboard(parameter.tender.TnT_Name)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {parameter.tender?.TnT_Name || "Unknown Tender"}
                    </div>
                    {parameter.tender?.TnT_Code && (
                      <div className="text-sm text-gray-500 mt-1">
                        Code: {parameter.tender.TnT_Code}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Effective Date
                      </span>
                    </div>
                    {parameter.eff_date && (
                      <button
                        onClick={() =>
                          handleCopyToClipboard(parameter.eff_date)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-lg font-semibold text-gray-900">
                      {parameter.formatted_eff_date || 
                       (parameter.eff_date ? new Date(parameter.eff_date).toLocaleDateString() : "N/A")}
                    </div>
                    {parameter.eff_date && (
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(parameter.eff_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-4 shadow-sm">
                  <Percent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tax Parameter Details
                  </h2>
                  <p className="text-sm text-gray-600">
                    Detailed tax entries and configurations (
                    {taxParameters.length} entries)
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sr
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Add/Deduct
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ledger Account
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ledger Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exempt Allow
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Formula
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {taxParameters.map((entry, index) => {
                      const exemptDisplay = getExemptAllowDisplay(entry);
                      const ExemptIcon = exemptDisplay.icon;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.VIP_Sr || index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.invoice_charge?.IC_Name || `Tax ID ${entry.IC_Id}`}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {entry.Add_Dedu == 1 || entry.Add_Dedu == "1" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <Minus className="h-3 w-3 mr-1" />
                                Deduct
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-bold text-blue-600">
                              {entry.Percent}%
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center">
                                <Building className="h-3 w-3 mr-1 text-gray-400" />
                                {entry.ledger?.Lg_Name || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-mono text-gray-700">
                              {entry.ledger?.Lg_Code || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${exemptDisplay.bg} ${exemptDisplay.color}`}>
                              <ExemptIcon className="h-3 w-3 mr-1" />
                              {exemptDisplay.text}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-start">
                              <Code className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                              <div>
                                <div className="text-sm font-mono bg-gray-100 p-2 rounded text-gray-800">
                                  {entry.Formula || "N/A"}
                                </div>
                                {entry.Formula && (
                                  <button
                                    onClick={() =>
                                      handleCopyToClipboard(entry.Formula)
                                    }
                                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy Formula
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {parameter.deleted_at && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      Deleted on {formatDate(parameter.deleted_at)}
                    </span>
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

export default ViewInvoiceTaxParameter;