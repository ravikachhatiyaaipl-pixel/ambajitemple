// src/pages/Finance/BudgetManagement/BudgetApprovalsEntry/View.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building,
  IndianRupee,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Edit,
  TrendingUp,
  FileCheck,
  ChevronRight,
  BarChart,
  Users,
  Eye,
  EyeOff,
  Lock,
  Paperclip,
  ExternalLink,
  Download,
  File,
  Printer,
  Copy,
  Percent,
  ArrowUp,
  ArrowDown,
  PieChart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import budgetEntryApi from "../../../services/budgetentryapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewBudgetApproveEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [budgetEntry, setBudgetEntry] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    if (id) {
      loadBudgetEntryData();
    }
  }, [id]);

  const loadBudgetEntryData = async () => {
    setLoading(true);
    try {
      const response = await budgetEntryApi.getById(id);
      if (response.success) {
        setBudgetEntry(response.data);
      } else {
        toast.error("Failed to load budget entry data!");
        navigate("/transactions/budget-management/budgetapprovalsentry");
      }
    } catch (error) {
      console.error("Error loading budget entry:", error);
      toast.error("Failed to load budget entry data!");
      navigate("/transactions/budget-management/budgetapprovalsentry");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if entry has justification documents
  const hasJustificationDocuments = () => {
    return (
      budgetEntry?.status == "J" &&
      budgetEntry?.Beg_Doc &&
      budgetEntry?.Beg_Doc.length > 0
    );
  };

  // Function to get file icon
  const getFileIcon = (url) => {
    if (!url) return <File className="h-5 w-5" />;

    const extension = url.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <File className="h-5 w-5 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <File className="h-5 w-5 text-blue-500" />;
      case "doc":
      case "docx":
        return <File className="h-5 w-5 text-blue-600" />;
      case "xls":
      case "xlsx":
        return <File className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Function to get file name from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "Document";
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  // Simple download function
  const downloadDocument = (url, filename) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "document";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download started!");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document. Try opening in new tab.");
    }
  };

  const handleCopyDetails = () => {
    const details = `
Budget Entry ID: ${budgetEntry?.budg_id}
Financial Year: ${budgetEntry?.financial_year?.financial_year_name}
Department: ${budgetEntry?.department?.desc}
Budget Head: ${getBudgetHeadName()} (${getBudgetHeadCode()})
Budget Amount: ${budgetEntry?.formatted_amount}
Suggested Amount: ${budgetEntry?.sug_amount ? formatAmount(budgetEntry.sug_amount) : "₹ 0.00"}
Status: ${budgetEntry?.status_text}
Documents: ${budgetEntry?.Beg_Doc?.length || 0} file(s)
Created: ${new Date(budgetEntry?.created_at).toLocaleString()}
Last Updated: ${new Date(budgetEntry?.updated_at).toLocaleString()}
    `.trim();

    navigator.clipboard.writeText(details);
    toast.success("Budget entry details copied to clipboard!");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      D: {
        label: "Draft",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      R: {
        label: "Revised",
        color: "bg-blue-100 text-blue-800",
        icon: TrendingUp,
      },
      J: {
        label: "Justification",
        color: "bg-amber-100 text-amber-800",
        icon: FileCheck,
      },
      P: {
        label: "Approval",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      RJ: {
        label: "Reject",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig["D"];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${config.color}`}
      >
        <Icon className="h-4 w-4 mr-1.5" />
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Updated formatAmount function to handle null/undefined values
  const formatAmount = (amount) => {
    // If amount is null, undefined, empty string, or 0, show ₹ 0.00
    if (!amount && amount != 0) {
      return "₹ 0.00";
    }

    // Convert to number if it's a string
    const numAmount = typeof amount == "string" ? parseFloat(amount) : amount;

    // Format the amount
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  // Helper functions for budget head
  const getBudgetHeadName = () => {
    return budgetEntry?.budget_head?.gr_nm || "N/A";
  };

  const getBudgetHeadCode = () => {
    return budgetEntry?.budget_head?.gr_cd || "N/A";
  };

  // Calculate difference and percentage
  const calculateDifference = () => {
    if (!budgetEntry?.sug_amount || !budgetEntry?.amount) return null;

    const budgetAmount = parseFloat(budgetEntry.amount);
    const suggestedAmount = parseFloat(budgetEntry.sug_amount);
    const difference = suggestedAmount - budgetAmount;
    const percentage = budgetAmount > 0 ? (difference / budgetAmount) * 100 : 0;

    return {
      amount: Math.abs(difference),
      percentage: Math.abs(percentage),
      isIncrease: difference > 0,
      isDecrease: difference < 0,
      isSame: difference == 0,
    };
  };

  // Print Report Content Component
  const PrintReportContent = () => {
    const differenceInfo = calculateDifference();
    const hasDocuments = hasJustificationDocuments();

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
      gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "8px",
        margin: "8px 0",
      },
      gridItem: {
        border: "1px solid #e5e7eb",
        padding: "8px",
        borderRadius: "4px",
        backgroundColor: "#f9fafb",
      },
    };

    const getStatusColor = (status) => {
      switch (status) {
        case "P":
          return "#059669";
        case "D":
          return "#d97706";
        case "RJ":
          return "#dc2626";
        case "R":
          return "#E53935";
        case "J":
          return "#ea580c";
        default:
          return "#6b7280";
      }
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Budget Approval Entry Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Budget Approval Entry Summary</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>Entry ID</td>
                <td style={styles.td}>#{budgetEntry?.budg_id || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...styles.textBold,
                    color: getStatusColor(budgetEntry?.status),
                  }}
                >
                  {budgetEntry?.status_text || budgetEntry?.status || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Financial Year
                </td>
                <td style={styles.td}>
                  {budgetEntry?.financial_year?.financial_year_name || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Department</td>
                <td style={styles.td}>
                  {budgetEntry?.department?.desc || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Budget Head
                </td>
                <td style={styles.td}>{getBudgetHeadName()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Budget Amount
                </td>
                <td
                  style={{ ...styles.td, ...styles.textBold, color: "#059669" }}
                >
                  {budgetEntry?.formatted_amount || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Suggested Amount
                </td>
                <td
                  style={{ ...styles.td, ...styles.textBold, color: "#E53935" }}
                >
                  {budgetEntry?.sug_amount
                    ? formatAmount(budgetEntry.sug_amount)
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>
                  {formatDateTime(budgetEntry?.created_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(budgetEntry?.updated_at)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Workflow Status
                </td>
                <td style={styles.td}>
                  {budgetEntry?.is_workflow_status ? "Enabled" : "Disabled"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Report Generated
                </td>
                <td style={styles.td}>{new Date().toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount Comparison */}
        {budgetEntry?.sug_amount && differenceInfo && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Amount Comparison</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Description</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Amount (₹)
                  </th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Percentage
                  </th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Budget Amount
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textBold,
                      textAlign: "right",
                    }}
                  >
                    {budgetEntry?.formatted_amount || "N/A"}
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>100.00%</td>
                  <td style={styles.td}>Base Amount</td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Suggested Amount
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textBold,
                      textAlign: "right",
                    }}
                  >
                    {formatAmount(budgetEntry?.sug_amount)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    {budgetEntry?.amount
                      ? (
                          (budgetEntry.sug_amount / budgetEntry.amount) *
                          100
                        ).toFixed(2) + "%"
                      : "N/A"}
                  </td>
                  <td style={styles.td}>Suggested</td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Difference
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textBold,
                      textAlign: "right",
                      color: differenceInfo.isIncrease
                        ? "#059669"
                        : differenceInfo.isDecrease
                          ? "#dc2626"
                          : "#6b7280",
                    }}
                  >
                    {differenceInfo.isIncrease
                      ? "+"
                      : differenceInfo.isDecrease
                        ? "-"
                        : ""}
                    {formatAmount(differenceInfo.amount)}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      textAlign: "right",
                      color: differenceInfo.isIncrease
                        ? "#059669"
                        : differenceInfo.isDecrease
                          ? "#dc2626"
                          : "#6b7280",
                    }}
                  >
                    {differenceInfo.percentage.toFixed(2)}%
                  </td>
                  <td style={styles.td}>
                    {differenceInfo.isIncrease
                      ? "Increase"
                      : differenceInfo.isDecrease
                        ? "Decrease"
                        : "No Change"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Department & Budget Head Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            Department & Budget Head Details
          </div>
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
                  Department Name
                </td>
                <td style={styles.td}>
                  {budgetEntry?.department?.desc || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Department English Name
                </td>
                <td style={styles.td}>
                  {budgetEntry?.department?.name || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Budget Head Name
                </td>
                <td style={styles.td}>{getBudgetHeadName()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Financial Year
                </td>
                <td style={styles.td}>
                  {budgetEntry?.financial_year?.financial_year_name || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Year Code</td>
                <td style={styles.td}>
                  {budgetEntry?.financial_year?.financial_year_code || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Start Date</td>
                <td style={styles.td}>
                  {budgetEntry?.financial_year?.start_date
                    ? formatDate(budgetEntry.financial_year.start_date)
                    : "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>End Date</td>
                <td style={styles.td}>
                  {budgetEntry?.financial_year?.end_date
                    ? formatDate(budgetEntry.financial_year.end_date)
                    : "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Documents Section (Only for Justification Status) */}
        {hasDocuments && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              Supporting Documents ({budgetEntry.Beg_Doc.length})
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Document Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {budgetEntry.Beg_Doc.map((doc, index) => (
                  <tr key={index}>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {index + 1}
                    </td>
                    <td style={styles.td}>
                      {doc.name || getFileNameFromUrl(doc.url) || "Document"}
                    </td>
                    <td style={styles.td}>
                      {doc.url?.split(".").pop().toUpperCase() || "N/A"}
                    </td>
                    <td style={styles.td}>Uploaded</td>
                  </tr>
                ))}
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
                <td style={styles.td}>Entry Created</td>
                <td style={styles.td}>
                  {formatDateTime(budgetEntry?.created_at)}
                </td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>
                  {formatDateTime(budgetEntry?.updated_at)}
                </td>
              </tr>
              <tr>
                <td style={styles.td}>Days Since Created</td>
                <td style={styles.td}>
                  {(() => {
                    const createdDate = new Date(budgetEntry?.created_at);
                    const today = new Date();
                    const diffTime = Math.abs(today - createdDate);
                    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  })()}{" "}
                  days
                </td>
                <td style={styles.td}>Report Generated</td>
                <td style={styles.td}>{new Date().toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Check if entry can be edited
  const canEditEntry = (status) => {
    return status != "RJ"; // Reject status cannot be edited
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading budget entry details...</p>
      </div>
    );
  }

  if (!budgetEntry) {
    return (
      <div className="p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Budget Entry Not Found
        </h3>
        <p className="text-gray-600 mb-6">
          The requested budget entry could not be found.
        </p>
        <button
          onClick={() =>
            navigate("/transactions/budget-management/budgetapprovalsentry")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  const differenceInfo = calculateDifference();

  const DetailCard = ({ title, icon: Icon, children, color = "blue" }) => {
    const colorClasses = {
      blue: {
        bg: "bg-blue-500",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-500",
        text: "text-green-600",
        border: "border-green-200",
      },
      purple: {
        bg: "bg-purple-500",
        text: "text-purple-600",
        border: "border-purple-200",
      },
      amber: {
        bg: "bg-amber-500",
        text: "text-amber-600",
        border: "border-amber-200",
      },
      indigo: {
        bg: "bg-indigo-500",
        text: "text-indigo-600",
        border: "border-indigo-200",
      },
    }[color];

    return (
      <div
        className={`bg-white rounded-xl border ${colorClasses.border} p-6 hover:shadow-lg transition-all duration-200`}
      >
        <div className="flex items-center mb-4">
          <div className={`${colorClasses.bg} text-white p-2 rounded-lg mr-3`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    );
  };

  const InfoRow = ({
    label,
    value,
    icon: Icon,
    highlight = false,
    copyable = false,
  }) => (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="h-4 w-4 text-gray-400 mr-2" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-center max-w-[60%]">
        <span
          className={`text-sm text-right break-words ${
            highlight ? "font-bold text-green-700" : "text-gray-900"
          }`}
        >
          {value || "N/A"}
        </span>
        {copyable && value && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast.success("Copied to clipboard!");
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Budget Approval Entry Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/budget-management/budgetapprovalsentry")
            }
            className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 mr-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-gray-900" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Back to List
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyDetails}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center transition-colors"
            title="Copy details"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </button>

          <button
            onClick={() => setShowPrint(true)}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center transition-colors"
            title="Print Report"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </button>

          {/* Conditional Edit button - Show only for non-Reject status */}
          {canEditEntry(budgetEntry.status) ? (
            <Link
              to={`/transactions/budget-management/budgetapprovalsentry/edit/${id}`}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit/Approve Entry
            </Link>
          ) : (
            <button
              className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg flex items-center transition-all cursor-not-allowed"
              title="Cannot edit rejected entry"
              disabled
            >
              <Lock className="h-4 w-4 mr-2" />
              Rejected Entry
            </button>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Budget Approval Details
          </h1>
        </div>
        <p className="text-gray-600 ml-11">
          View detailed information about budget approval
        </p>
      </div>

      {/* ID & Status Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <span className="text-sm text-gray-600">Status</span>
              <div className="mt-1">{getStatusBadge(budgetEntry.status)}</div>
            </div>
            <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
            <div>
              <span className="text-sm text-gray-600">Budget Amount</span>
              <p className="text-2xl font-bold text-green-700">
                {budgetEntry.formatted_amount}
              </p>
            </div>
            {hasJustificationDocuments() && (
              <>
                <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
                <div>
                  <span className="text-sm text-gray-600">Documents</span>
                  <div className="flex items-center mt-1">
                    <Paperclip className="h-4 w-4 text-amber-600 mr-1" />
                    <p className="text-lg font-bold text-amber-700">
                      {budgetEntry.Beg_Doc.length} file(s)
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Workflow:</span>
            <span
              className={`text-sm font-medium ${
                budgetEntry.is_workflow_status
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {budgetEntry.is_workflow_status ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Amount Comparison Card */}
      {budgetEntry.sug_amount && differenceInfo && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-lg bg-amber-600 flex items-center justify-center mr-3">
              <BarChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Suggested Amount Comparison
              </h3>
              <p className="text-sm text-gray-600">
                Review the suggested amount compared to budget amount
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Budget Amount</p>
              <p className="text-2xl font-bold text-green-700">
                {budgetEntry.formatted_amount}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Suggested Amount</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatAmount(budgetEntry.sug_amount)}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Difference</p>
              <div className="flex items-center justify-center">
                {differenceInfo && (
                  <>
                    {differenceInfo.isIncrease && (
                      <ArrowUp className="h-5 w-5 text-green-600 mr-2" />
                    )}
                    {differenceInfo.isDecrease && (
                      <ArrowDown className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <p
                      className={`text-2xl font-bold ${
                        differenceInfo.isIncrease
                          ? "text-green-700"
                          : differenceInfo.isDecrease
                            ? "text-red-700"
                            : "text-gray-700"
                      }`}
                    >
                      {formatAmount(differenceInfo.amount)}
                    </p>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        differenceInfo.isIncrease
                          ? "bg-green-100 text-green-800"
                          : differenceInfo.isDecrease
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {differenceInfo.percentage.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Financial Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Year Details */}
          <DetailCard
            title="Financial Year Details"
            icon={Calendar}
            color="blue"
          >
            <InfoRow
              label="Financial Year"
              value={budgetEntry.financial_year?.financial_year_name}
              icon={Calendar}
            />
            <InfoRow
              label="Year Code"
              value={budgetEntry.financial_year?.financial_year_code}
              icon={Calendar}
              copyable={true}
            />
            <InfoRow
              label="Start Date"
              value={formatDate(budgetEntry.financial_year?.start_date)}
              icon={Calendar}
            />
            <InfoRow
              label="End Date"
              value={formatDate(budgetEntry.financial_year?.end_date)}
              icon={Calendar}
            />
          </DetailCard>

          {/* Department Details */}
          <DetailCard title="Department Details" icon={Building} color="green">
            <InfoRow
              label="Department Name"
              value={budgetEntry.department?.desc}
              icon={Building}
            />
            <InfoRow
              label="Department English Name"
              value={budgetEntry.department?.name}
              icon={Building}
            />
          </DetailCard>

          {/* Budget Head Details - New Card */}
          <DetailCard
            title="Budget Head Details"
            icon={PieChart}
            color="purple"
          >
            <InfoRow
              label="Budget Head Name"
              value={getBudgetHeadName()}
              icon={PieChart}
            />
          </DetailCard>

          {/* Documents Card - Only show if status is Justification and documents exist */}
          {hasJustificationDocuments() && (
            <DetailCard
              title="Justification Documents"
              icon={Paperclip}
              color="amber"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                  Supporting documents for justification (
                  {budgetEntry.Beg_Doc.length} file(s))
                </p>
                {budgetEntry.Beg_Doc.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-amber-50 p-3 rounded-lg border border-amber-200"
                  >
                    <div className="flex items-center">
                      {getFileIcon(doc.url)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {doc.name || getFileNameFromUrl(doc.url)}
                        </p>
                        {doc.url && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {doc.url}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.url && (
                        <>
                          <button
                            onClick={() =>
                              window.open(
                                doc.url,
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Open in new tab"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              downloadDocument(
                                doc.url,
                                doc.name || `document_${index + 1}`,
                              );
                            }}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DetailCard>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Amount Details */}
          <DetailCard title="Amount Details" icon={IndianRupee} color="amber">
            <InfoRow
              label="Budget Amount"
              value={budgetEntry.formatted_amount}
              icon={IndianRupee}
              highlight={true}
            />
            <InfoRow
              label="Suggested Amount"
              value={formatAmount(budgetEntry.sug_amount)}
              icon={IndianRupee}
            />
            {budgetEntry.sug_amount && budgetEntry.amount && differenceInfo && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600 flex items-center">
                    <Percent className="h-4 w-4 text-gray-400 mr-2" />
                    Difference
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      differenceInfo.isIncrease
                        ? "text-green-600"
                        : differenceInfo.isDecrease
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {differenceInfo.isIncrease
                      ? "+"
                      : differenceInfo.isDecrease
                        ? "-"
                        : ""}
                    {formatAmount(differenceInfo.amount)}
                    <span className="ml-2">
                      ({differenceInfo.percentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
              </div>
            )}
          </DetailCard>

          {/* Document Summary Card */}
          {hasJustificationDocuments() && (
            <DetailCard
              title="Document Summary"
              icon={FileCheck}
              color="indigo"
            >
              <div className="text-center py-4">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Paperclip className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  {budgetEntry.Beg_Doc.length} Document(s)
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Attached for justification
                </p>
                <div className="flex flex-col space-y-2">
                  {budgetEntry.Beg_Doc.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-xs text-gray-700 truncate">
                        {doc.name || `Document ${index + 1}`}
                      </span>
                      {doc.url && (
                        <button
                          onClick={() =>
                            window.open(
                              doc.url,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Open"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </DetailCard>
          )}
        </div>
      </div>

      {/* Timeline & Audit Logs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Timeline & Audit Logs
            </h3>
          </div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center transition-colors"
          >
            {showLogs ? (
              <EyeOff className="h-4 w-4 mr-1" />
            ) : (
              <Eye className="h-4 w-4 mr-1" />
            )}
            {showLogs ? "Hide Logs" : "Show Logs"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-sm text-gray-600">Created Date</span>
            <p className="text-sm font-medium text-gray-900">
              {formatDateTime(budgetEntry.created_at)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Last Updated</span>
            <p className="text-sm font-medium text-gray-900">
              {formatDateTime(budgetEntry.updated_at)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Days Since Created</span>
            <p className="text-sm font-medium text-gray-900">
              {(() => {
                const createdDate = new Date(budgetEntry.created_at);
                const today = new Date();
                const diffTime = Math.abs(today - createdDate);
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              })()}{" "}
              days
            </p>
          </div>
        </div>

        {/* Audit Logs */}
        {showLogs && budgetEntry.log_summary && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Audit Logs ({budgetEntry.log_summary.total_logs})
            </h4>
            {budgetEntry.log_summary.latest_log && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    Latest Activity
                  </span>
                  <span className="text-xs text-gray-500">
                    {budgetEntry.log_summary.latest_log.date}
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    Status changed to{" "}
                    {budgetEntry.log_summary.latest_log.status}
                  </span>
                  {budgetEntry.log_summary.latest_log.user && (
                    <span className="text-sm text-gray-500 ml-2">
                      by {budgetEntry.log_summary.latest_log.user}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Last updated: {formatDateTime(budgetEntry.updated_at)}
              </span>
            </div>
            {hasJustificationDocuments() && (
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span>{budgetEntry.Beg_Doc.length} document(s)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBudgetApproveEntry;
