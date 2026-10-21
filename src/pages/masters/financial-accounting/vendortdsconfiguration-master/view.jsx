// src/pages/Masters/FinancialAccounting/VendorTDSConfiguration/view.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  Clock,
  Download,
  Eye,
  FileType,
  Printer,
  AlertCircle,
  User,
  Building,
  Percent,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";
import { VendorTDSConfigurationApi } from "../../../services/vendortdsconfigurationapi";

const ViewVendorTDSConfiguration = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tdsConfig, setTdsConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadTDSData();
  }, [id]);

  const loadTDSData = async () => {
    setLoading(true);
    try {
      const response = await VendorTDSConfigurationApi.getById(id);
      const tdsData = response?.data || response;
      setTdsConfig(tdsData);
    } catch (error) {
      console.error("Error loading TDS configuration:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to load TDS configuration data!",
      );
      navigate("/masters/financial-accounting/vendortdsconfiguration-master");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete TDS Configuration?",
      text: `Are you sure you want to delete this TDS configuration? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await VendorTDSConfigurationApi.delete(id);
      toast.success(`TDS configuration deleted successfully!`);
      navigate("/masters/financial-accounting/vendortdsconfiguration-master");
    } catch (error) {
      console.error("Error deleting TDS configuration:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete TDS configuration",
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
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
      return new Date(dateString).toLocaleString("en-IN", {
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

  const handleDownloadDocument = (doc) => {
    if (doc.url) {
      const link = document.createElement("a");
      link.href = doc.url;
      link.download = doc.name || "document";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("Document URL not available");
    }
  };

  const getUploadedDocuments = () => {
    if (!tdsConfig) return [];
    return tdsConfig.Document || [];
  };

  // Get status display
  const getStatusDisplay = () => {
    const isActive =
      tdsConfig?.Is_Active == "Y" ||
      tdsConfig?.Is_Active == 1 ||
      tdsConfig?.Is_Active == true;

    if (isActive) {
      return {
        text: "Active",
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: CheckCircle,
      };
    } else {
      return {
        text: "Inactive",
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: XCircle,
      };
    }
  };

  // Print Report Content Component
  const PrintReportContent = () => {
    const uploadedDocuments = getUploadedDocuments();
    const status = getStatusDisplay();

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
      statusActive: {
        color: "#15803d",
        backgroundColor: "#dcfce7",
        padding: "2px 8px",
        borderRadius: "12px",
        display: "inline-block",
        fontSize: "9px",
        fontWeight: "600",
      },
      statusInactive: {
        color: "#b91c1c",
        backgroundColor: "#fee2e2",
        padding: "2px 8px",
        borderRadius: "12px",
        display: "inline-block",
        fontSize: "9px",
        fontWeight: "600",
      },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* TDS Configuration Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>TDS Configuration Information</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>TDS Date</td>
                <td style={styles.td}>
                  {formatDate(tdsConfig?.VTC_Date) || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Financial Year
                </td>
                <td style={styles.td}>
                  {tdsConfig?.financial_year?.FY_Name || "N/A"}
                  {tdsConfig?.financial_year?.FY_Code && (
                    <span> ({tdsConfig.financial_year.FY_Code})</span>
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Vendor</td>
                <td style={styles.td}>
                  {tdsConfig?.sub_ledger?.SL_Name || "N/A"}
                  {tdsConfig?.sub_ledger?.SL_Code && (
                    <span> ({tdsConfig.sub_ledger.SL_Code})</span>
                  )}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>TDS Rate</td>
                <td style={styles.td}>
                  {tdsConfig?.TDS_rate ? `${tdsConfig.TDS_rate}%` : "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={styles.td}>
                  <span
                    style={
                      tdsConfig?.Is_Active == "Y"
                        ? styles.statusActive
                        : styles.statusInactive
                    }
                  >
                    {tdsConfig?.Is_Active == "Y" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Created At</td>
                <td style={styles.td}>
                  {formatDateTime(tdsConfig?.created_at)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Updated At</td>
                <td style={styles.td} colSpan="3">
                  {formatDateTime(tdsConfig?.updated_at)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Remark */}
        {tdsConfig?.Remark && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Remark</div>
            <div
              style={{
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                backgroundColor: "#f9fafb",
                fontSize: "10px",
                whiteSpace: "pre-wrap",
              }}
            >
              {tdsConfig.Remark}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {uploadedDocuments.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              Reference Documents ({uploadedDocuments.length})
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Document Name</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Type</th>
                </tr>
              </thead>
              <tbody>
                {uploadedDocuments.map((doc, index) => (
                  <tr key={doc.doc_lib_id || index}>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {index + 1}
                    </td>
                    <td style={styles.td}>
                      {doc.name || `Document ${index + 1}`}
                    </td>
                    <td style={styles.td}>
                      {doc.description || "No description"}
                    </td>
                    <td style={styles.td}>{doc.type || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading TDS configuration details...
        </p>
      </div>
    );
  }

  if (!tdsConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            TDS Configuration Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The TDS configuration with ID #{id} does not exist or has been
            removed.
          </p>
          <Link
            to="/masters/financial-accounting/vendortdsconfiguration-master"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to TDS Configurations
          </Link>
        </div>
      </div>
    );
  }

  const uploadedDocuments = getUploadedDocuments();
  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  return (
    <div className="p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Vendor TDS Configuration Report"
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
        <div>
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate(
                  "/masters/financial-accounting/vendortdsconfiguration-master",
                )
              }
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                TDS Configuration Details
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPrint(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </button>
          <Link
            to={`/masters/financial-accounting/vendortdsconfiguration-master/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* TDS Configuration Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              TDS Configuration Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* TDS Date */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    TDS Date
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {formatDate(tdsConfig?.VTC_Date) || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Financial Year */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Financial Year
                  </label>
                  <div className="mt-1 flex items-start">
                    <Building className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-900 font-medium">
                        {tdsConfig?.financial_year?.FY_Name || "N/A"}
                      </span>
                      {tdsConfig?.financial_year?.FY_Code && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({tdsConfig.financial_year.FY_Code})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vendor */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Vendor
                  </label>
                  <div className="mt-1 flex items-start">
                    <User className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-900 font-medium">
                        {tdsConfig?.sub_ledger?.SL_Name || "N/A"}
                      </span>
                      {tdsConfig?.sub_ledger?.SL_Code && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({tdsConfig.sub_ledger.SL_Code})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1 flex items-center">
                    <StatusIcon className={`h-4 w-4 mr-2 ${status.color}`} />
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* TDS Rate */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    TDS Rate
                  </label>
                  <div className="mt-1 flex items-center">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {tdsConfig?.TDS_rate ? `${tdsConfig.TDS_rate}%` : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Created At */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created At
                  </label>
                  <div className="mt-1 flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {formatDateTime(tdsConfig?.created_at)}
                    </span>
                  </div>
                </div>

                {/* Updated At */}
                {tdsConfig?.updated_at &&
                  tdsConfig?.updated_at != tdsConfig?.created_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Updated
                      </label>
                      <div className="mt-1 flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {formatDateTime(tdsConfig?.updated_at)}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Remark */}
            {tdsConfig?.Remark && (
              <div className="mt-6 pt-6 border-t">
                <label className="text-sm font-medium text-gray-500">
                  Remark
                </label>
                <div className="mt-2">
                  <p className="text-gray-700 p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap">
                    {tdsConfig.Remark}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documents Card */}
        {uploadedDocuments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Reference Documents ({uploadedDocuments.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {uploadedDocuments.map((doc, index) => (
                  <div
                    key={doc.doc_lib_id || index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                          <FileType className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium text-gray-900">
                              {doc.name || `Document ${index + 1}`}
                            </h4>
                            <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                              {doc.type || "Unknown"}
                            </span>
                          </div>

                          {/* Document Description */}
                          {doc.description && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                              <span className="font-medium text-gray-700">
                                Description:
                              </span>{" "}
                              {doc.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {doc.url && (
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewVendorTDSConfiguration;
