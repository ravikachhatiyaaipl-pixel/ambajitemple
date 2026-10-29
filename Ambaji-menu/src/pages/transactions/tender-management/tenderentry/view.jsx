// src/pages/Transactions/TenderManagement/TenderEntry/View.jsx
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
  Building,
  Layers,
  Hash,
  Percent,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";
import { TenderEntryApi } from "../../../services/tenderentryapi";

const ViewTenderEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadTenderData();
  }, [id]);

  const loadTenderData = async () => {
    setLoading(true);
    try {
      const response = await TenderEntryApi.getById(id);
      console.log("Loaded tender entry response:", response);

      // Extract tender data from the response structure
      const tenderData = response?.data || response;
      setTender(tenderData);
    } catch (error) {
      console.error("Error loading tender entry:", error);
      toast.error(
        error.response?.data?.message || "Failed to load tender entry data!",
      );
      navigate("/transactions/tender-management/tenderentry");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTender = async () => {
    const result = await Swal.fire({
      title: "Delete Tender Entry?",
      text: `Are you sure you want to delete this tender entry? This action cannot be undone.`,
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
      await TenderEntryApi.delete(id);
      toast.success(`Tender entry deleted successfully!`);
      navigate("/transactions/tender-management/tenderentry");
    } catch (error) {
      console.error("Error deleting tender entry:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete tender entry",
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

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get branch display text from department object
  const getBranchDisplay = () => {
    if (!tender?.department) return "N/A";

    const dept = tender.department;
    let displayText = dept.Dpt_Desc || "";

    if (dept.Dpt_Name && dept.Dpt_Name != dept.Dpt_Desc) {
      displayText += ` (${dept.Dpt_Name})`;
    }

    return displayText;
  };

  // Get budget head display text
  const getBudgetHeadDisplay = () => {
    if (!tender?.budget_head) return "N/A";

    const head = tender.budget_head;
    let displayText = head.Gr_Nm || "";

    return displayText;
  };

  // Get ledger display text from ledger object
  const getLedgerDisplay = () => {
    if (!tender?.ledger) return "N/A";

    const ledger = tender.ledger;
    let displayText = ledger.Lg_Name || "";

    if (ledger.Lg_Eng_Name && ledger.Lg_Eng_Name != ledger.Lg_Name) {
      displayText += ` (${ledger.Lg_Eng_Name})`;
    }

    if (ledger.Lg_Code) {
      displayText += ` - ${ledger.Lg_Code}`;
    }

    return displayText;
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

  // Helper function to get uploaded documents
  const getUploadedDocuments = () => {
    if (!tender) return [];
    return tender.Documents || [];
  };

  // Print Report Content Component
  const PrintReportContent = () => {
    const uploadedDocuments = getUploadedDocuments();

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
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Tender Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Tender Information</div>
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
                  Tender Date
                </td>
                <td style={styles.td}>
                  {formatDate(tender?.TE_Date) || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Start Date</td>
                <td style={styles.td}>{formatDate(tender?.TE_St_Date)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>End Date</td>
                <td style={styles.td}>
                  {formatDate(tender?.TE_Ed_Date) || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Tender Work
                </td>
                <td style={styles.td}>
                  {tender?.tendertype?.TnT_Name || "N/A"}
                  {tender?.tendertype?.TnT_Code && (
                    <span> ({tender.tendertype.TnT_Code})</span>
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Branch</td>
                <td style={styles.td}>{getBranchDisplay()}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Budget Head
                </td>
                <td style={styles.td}>{getBudgetHeadDisplay()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Ledger Account
                </td>
                <td style={styles.td}>{getLedgerDisplay()}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Proposal Amount
                </td>
                <td style={styles.td}>
                  {formatCurrency(tender?.Proposal_Amount)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Approved Amount
                </td>
                <td style={styles.td}>
                  {formatCurrency(tender?.Approved_Amount)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  BG Percentage
                </td>
                <td style={styles.td}>
                  {tender?.BG_Per ? `${tender.BG_Per}%` : "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  EMD Percentage
                </td>
                <td style={styles.td}>
                  {tender?.EMD_Per ? `${tender.EMD_Per}%` : "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Tender Fee</td>
                <td style={styles.td}>{formatCurrency(tender?.TE_Fee)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Created At</td>
                <td style={styles.td}>{formatDateTime(tender?.created_at)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Updated At</td>
                <td style={styles.td}>{formatDateTime(tender?.updated_at)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Description */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Description</div>
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
            {tender?.Description || "No description provided"}
          </div>
        </div>

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
        <p className="mt-4 text-gray-600">Loading tender entry details...</p>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Tender Entry Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The tender entry with ID #{id} does not exist or has been removed.
          </p>
          <Link
            to="/transactions/tender-management/tenderentry"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tender Entries
          </Link>
        </div>
      </div>
    );
  }

  const uploadedDocuments = getUploadedDocuments();

  return (
    <div className="p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Tender Entry Report"
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
                navigate("/transactions/tender-management/tenderentry")
              }
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tender Entry Details
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
            to={`/transactions/tender-management/tenderentry/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Tender Information Card */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Tender Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* NEW FIELD: Tender Date */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tender Date
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {formatDate(tender?.TE_Date) || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Start Date
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {formatDate(tender?.TE_St_Date)}
                    </span>
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    End Date
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {formatDate(tender?.TE_Ed_Date) || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Tender Work */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tender Work
                  </label>
                  <div className="mt-1">
                    <span className="text-gray-900 font-medium">
                      {tender?.tendertype?.TnT_Name || "N/A"}
                    </span>
                    {tender?.tendertype?.TnT_Code && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({tender.tendertype.TnT_Code})
                      </span>
                    )}
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Branch
                  </label>
                  <div className="mt-1 flex items-start">
                    <Building className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">
                      {getBranchDisplay()}
                    </span>
                  </div>
                </div>

                {/* Budget Head */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Budget Head
                  </label>
                  <div className="mt-1 flex items-start">
                    <Layers className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">
                      {getBudgetHeadDisplay()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Ledger Account */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ledger Account
                  </label>
                  <div className="mt-1 flex items-start">
                    <Hash className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">
                      {getLedgerDisplay()}
                    </span>
                  </div>
                </div>

                {/* BG Percentage */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    BG Percentage
                  </label>
                  <div className="mt-1 flex items-center">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {tender?.BG_Per ? `${tender.BG_Per}%` : "N/A"}
                    </span>
                  </div>
                </div>

                {/* EMD Percentage */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    EMD Percentage
                  </label>
                  <div className="mt-1 flex items-center">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {tender?.EMD_Per ? `${tender.EMD_Per}%` : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Tender Fee */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tender Fee
                  </label>
                  <div className="mt-1 flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(tender?.TE_Fee)}
                    </span>
                  </div>
                </div>

                {/* Financial Details */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Financial Details
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="text-xs text-blue-600 font-medium mb-1">
                        Proposal Amount
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {formatCurrency(tender?.Proposal_Amount)}
                      </div>
                    </div>
                    {tender?.Approved_Amount && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <div className="text-xs text-green-600 font-medium mb-1">
                          Approved Amount
                        </div>
                        <div className="text-lg font-bold text-green-700">
                          {formatCurrency(tender?.Approved_Amount)}
                        </div>
                      </div>
                    )}
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
                      {formatDateTime(tender?.created_at)}
                    </span>
                  </div>
                </div>

                {/* Updated At */}
                {tender?.updated_at &&
                  tender?.updated_at != tender?.created_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Updated
                      </label>
                      <div className="mt-1 flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {formatDateTime(tender?.updated_at)}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t">
              <label className="text-sm font-medium text-gray-500">
                Description
              </label>
              <div className="mt-2">
                <p className="text-gray-700 p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap">
                  {tender?.Description || "No description provided"}
                </p>
              </div>
            </div>
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
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
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

export default ViewTenderEntry;
