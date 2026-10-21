// src/pages/Finance/BudgetManagement/BudgetInitialEntry/View.jsx
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
  Trash2,
  TrendingUp,
  Copy,
  Printer,
  Eye,
  EyeOff,
  ChevronRight,
  BarChart,
  Shield,
  RotateCcw,
  Ban,
  FileCheck,
  Lock,
  Info,
  Percent,
  ArrowUp,
  ArrowDown,
  Paperclip,
  ExternalLink,
  File,
  Download as DownloadIcon,
  PieChart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import budgetEntryApi from "../../../services/budgetentryapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewBudgetEntry = ({ user }) => {
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
        navigate("/transactions/budget-management/budgetinitialentry");
      }
    } catch (error) {
      console.error("Error loading budget entry:", error);
      toast.error("Failed to load budget entry data!");
      navigate("/transactions/budget-management/budgetinitialentry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Budget Entry?",
      text: `Are you sure you want to delete this budget entry?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await budgetEntryApi.delete(id);
        toast.success("Budget entry deleted successfully!");
        navigate("/transactions/budget-management/budgetinitialentry");
      } catch (error) {
        toast.error("Failed to delete budget entry");
      }
    }
  };

  const handleCopyDetails = () => {
    const details = `
Budget Entry ID: ${budgetEntry?.budg_id}
Financial Year: ${budgetEntry?.financial_year?.financial_year_name || budgetEntry?.financial_year?.FY_Name || "N/A"}
Department: ${budgetEntry?.department?.desc || "N/A"} (${budgetEntry?.department?.name || "N/A"})
Budget Head: ${budgetEntry?.budget_head?.gr_nm || "N/A"} (${budgetEntry?.budget_head?.gr_cd || "N/A"})
Budget Amount: ${budgetEntry?.formatted_amount || "₹ 0.00"}
Suggested Amount: ${budgetEntry?.sug_amount ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(budgetEntry.sug_amount) : "₹ 0.00"}
Status: ${budgetEntry?.status_text || budgetEntry?.status || "N/A"}
Documents: ${budgetEntry?.Beg_Doc?.length || 0} file(s)
Created: ${new Date(budgetEntry?.created_at).toLocaleString()}
Last Updated: ${new Date(budgetEntry?.updated_at).toLocaleString()}
    `.trim();

    navigator.clipboard.writeText(details);
    toast.success("Budget entry details copied to clipboard!");
  };

  const downloadDocument = (url, filename) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "document";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document. Try opening in new tab.");
    }
  };

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

  const getFileNameFromUrl = (url) => {
    if (!url) return "Document";
    const parts = url.split("/");
    return parts[parts.length - 1];
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
      P: {
        label: "Approved",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      F: {
        label: "Frozen",
        color: "bg-purple-100 text-purple-800",
        icon: Shield,
      },
      RR: {
        label: "Re-Revised",
        color: "bg-cyan-100 text-cyan-800",
        icon: RotateCcw,
      },
      RJ: {
        label: "Rejected",
        color: "bg-red-100 text-red-800",
        icon: Ban,
      },
      J: {
        label: "Justification",
        color: "bg-amber-100 text-amber-800",
        icon: FileCheck,
      },
      A: {
        label: "Active",
        color: "bg-teal-100 text-teal-800",
        icon: CheckCircle,
      },
      I: {
        label: "Inactive",
        color: "bg-gray-100 text-gray-800",
        icon: Clock,
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

  const canEditEntry = (status) => {
    return status == "D" || status == "R" || status == "RR" || status == "J" || status == "F";;
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const calculateDifference = () => {
    if (!budgetEntry?.sug_amount || !budgetEntry?.amount) return null;

    const budgetAmount = parseFloat(budgetEntry.amount);
    const suggestedAmount = parseFloat(budgetEntry.sug_amount);
    const difference = suggestedAmount - budgetAmount;
    const percentage = (difference / budgetAmount) * 100;

    return {
      amount: Math.abs(difference),
      percentage: Math.abs(percentage),
      isIncrease: difference > 0,
      isDecrease: difference < 0,
      isSame: difference == 0,
    };
  };

  // Helper functions to safely access nested properties
  const getFinancialYearName = () => {
    return (
      budgetEntry?.financial_year?.financial_year_name ||
      budgetEntry?.financial_year?.FY_Name ||
      "N/A"
    );
  };

  const getFinancialYearCode = () => {
    return (
      budgetEntry?.financial_year?.financial_year_code ||
      budgetEntry?.financial_year?.FY_Code ||
      "N/A"
    );
  };

  const getFinancialYearStartDate = () => {
    return (
      budgetEntry?.financial_year?.start_date ||
      budgetEntry?.financial_year?.St_Date ||
      null
    );
  };

  const getFinancialYearEndDate = () => {
    return (
      budgetEntry?.financial_year?.end_date ||
      budgetEntry?.financial_year?.Ed_Date ||
      null
    );
  };

  const getDepartmentName = () => {
    return budgetEntry?.department?.desc || "N/A";
  };

  const getDepartmentEngName = () => {
    return budgetEntry?.department?.name || "N/A";
  };

  // Helper functions for budget head - only gr_nm
  const getBudgetHeadName = () => {
    return budgetEntry?.budget_head?.gr_nm || "N/A";
  };

  const getBudgetHeadCode = () => {
    return budgetEntry?.budget_head?.gr_cd || "N/A";
  };

  // Check if entry has documents for justification
  const hasJustificationDocuments = () => {
    return (
      (budgetEntry?.status == "J" || budgetEntry?.status == "Justification") &&
      budgetEntry?.Beg_Doc &&
      budgetEntry?.Beg_Doc.length > 0
    );
  };

  // Print Report Content Component
  const PrintReportContent = () => {
    if (!budgetEntry) return null;

    const differenceInfo = calculateDifference();

    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "6px 8px",
        margin: "8px 0",
        fontWeight: "600",
        borderLeft: "3px solid #E53935",
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
      textRight: { textAlign: "right" },
      textCenter: { textAlign: "center" },
      currency: { fontFamily: "'Courier New', monospace" },
    };

    const getStatusText = (status) => {
      const statusMap = {
        D: "Draft",
        R: "Revised",
        P: "Approved",
        F: "Frozen",
        RR: "Re-Revised",
        RJ: "Rejected",
        J: "Justification Required",
        A: "Active",
        I: "Inactive",
      };
      return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
      switch (status) {
        case "P":
          return "#059669";
        case "F":
          return "#C62828";
        case "RJ":
          return "#dc2626";
        case "R":
          return "#E53935";
        case "RR":
          return "#0891b2";
        case "J":
          return "#d97706";
        case "A":
          return "#14b8a6";
        case "I":
          return "#6b7280";
        default:
          return "#d97706";
      }
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Budget Entry Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Budget Entry Summary</div>
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
                <td style={styles.td}>#{budgetEntry.budg_id}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    color: getStatusColor(budgetEntry.status),
                    fontWeight: "600",
                  }}
                >
                  {getStatusText(budgetEntry.status)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Budget Amount
                </td>
                <td style={{ ...styles.td, ...styles.currency }}>
                  {formatAmount(budgetEntry.amount)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Suggested Amount
                </td>
                <td style={{ ...styles.td, ...styles.currency }}>
                  {budgetEntry.sug_amount
                    ? formatAmount(budgetEntry.sug_amount)
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>
                  {formatDateTime(budgetEntry.created_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(budgetEntry.updated_at)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Year Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Financial Year Details</div>
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
                  Financial Year
                </td>
                <td style={styles.td}>{getFinancialYearName()}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Year Code</td>
                <td style={styles.td}>{getFinancialYearCode()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Start Date</td>
                <td style={styles.td}>
                  {formatDate(getFinancialYearStartDate())}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>End Date</td>
                <td style={styles.td}>
                  {formatDate(getFinancialYearEndDate())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Department Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Department Details</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold, width: "30%" }}>
                  Department Name
                </td>
                <td style={styles.td}>{getDepartmentName()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Department English Name
                </td>
                <td style={styles.td}>{getDepartmentEngName()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Budget Head Details - Updated */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Budget Head Details</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold, width: "30%" }}>
                  Budget Head Name
                </td>
                <td style={styles.td}>{getBudgetHeadName()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Comparison */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Financial Comparison</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Description</th>
                <th style={{ ...styles.th, ...styles.textRight }}>
                  Amount (₹)
                </th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Variance</th>
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
                    ...styles.currency,
                    ...styles.textRight,
                  }}
                >
                  {formatAmount(budgetEntry.amount)}
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...styles.textCenter,
                    color: getStatusColor(budgetEntry.status),
                  }}
                >
                  {getStatusText(budgetEntry.status)}
                </td>
                <td style={styles.td}>Final Amount</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Suggested Amount
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...styles.currency,
                    ...styles.textRight,
                  }}
                >
                  {budgetEntry.sug_amount
                    ? formatAmount(budgetEntry.sug_amount)
                    : "N/A"}
                </td>
                <td style={styles.td}>Proposal</td>
                <td style={styles.td}>Initial Suggestion</td>
              </tr>
              {differenceInfo && (
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Difference
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.currency,
                      ...styles.textRight,
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
                  <td style={styles.td}>
                    {differenceInfo.isIncrease
                      ? "Increase"
                      : differenceInfo.isDecrease
                        ? "Decrease"
                        : "No Change"}
                  </td>
                  <td style={styles.td}>
                    {differenceInfo.percentage.toFixed(2)}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Documents Summary - Only for Justification status with documents */}
        {hasJustificationDocuments() && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Supporting Documents</div>
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
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      {doc.name || getFileNameFromUrl(doc.url)}
                    </td>
                    <td style={styles.td}>
                      {doc.url
                        ? doc.url.split(".").pop().toUpperCase()
                        : "Unknown"}
                    </td>
                    <td style={styles.td}>Attached</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{ fontSize: "9px", color: "#6b7280", marginTop: "4px" }}
            >
              Total: {budgetEntry.Beg_Doc.length} document(s) for justification
            </div>
          </div>
        )}

        {/* Timeline Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Timeline Information</div>
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
                  {formatDateTime(budgetEntry.created_at)}
                </td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>
                  {formatDateTime(budgetEntry.updated_at)}
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
            navigate("/transactions/budget-management/budgetinitialentry")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  const isDraftStatus = canEditEntry(budgetEntry.status);
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
      teal: {
        bg: "bg-teal-500",
        text: "text-teal-600",
        border: "border-teal-200",
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
    copyable = false,
    highlight = false,
    highlightColor = "green",
  }) => (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="h-4 w-4 text-gray-400 mr-2" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-center max-w-[60%]">
        <span
          className={`text-sm text-right break-words ${highlight ? `font-bold text-${highlightColor}-700` : "text-gray-900"}`}
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
          title="Budget Entry Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="p-6">
        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate("/transactions/budget-management/budgetinitialentry")
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
              onClick={() => setShowPrint(true)}
              className="inline-flex items-center px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </button>

            <button
              onClick={handleCopyDetails}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Details
            </button>

            {canEditEntry(budgetEntry.status) ? (
              <Link
                to={`/transactions/budget-management/budgetinitialentry/edit/${id}`}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Entry
              </Link>
            ) : (
              <button
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg flex items-center transition-all cursor-not-allowed"
                title={`Cannot edit ${budgetEntry.status_text || budgetEntry.status} entry`}
                disabled
              >
                {
                budgetEntry.status == "P" ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : budgetEntry.status == "RJ" ? (
                  <Ban className="h-4 w-4 mr-2" />
                ) : budgetEntry.status == "J" ? (
                  <FileCheck className="h-4 w-4 mr-2" />
                ) : budgetEntry.status == "R" ? (
                  <TrendingUp className="h-4 w-4 mr-2" />
                ) : budgetEntry.status == "RR" ? (
                  <RotateCcw className="h-4 w-4 mr-2" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                {budgetEntry.status == "F" && "Frozen Entry"}
                {budgetEntry.status == "P" && "Approved Entry"}
                {budgetEntry.status == "RJ" && "Rejected Entry"}
                {budgetEntry.status == "J" && "Justification Required"}
                {budgetEntry.status == "R" && "Revised Entry"}
                {budgetEntry.status == "RR" && "Re-Revised Entry"}
                {budgetEntry.status == "A" && "Active Entry"}
                {budgetEntry.status == "I" && "Inactive Entry"}
              </button>
            )}
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <IndianRupee className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Budget Entry Details
            </h1>
          </div>
          <p className="text-gray-600 ml-11">
            View detailed information about budget allocation
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
            </div>
          </div>
        </div>

        {/* Suggested Amount Comparison Card */}
        {budgetEntry.sug_amount && (
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
                value={getFinancialYearName()}
                icon={Calendar}
              />
              <InfoRow
                label="Year Code"
                value={getFinancialYearCode()}
                icon={Calendar}
              />
              <InfoRow
                label="Start Date"
                value={formatDate(getFinancialYearStartDate())}
                icon={Calendar}
              />
              <InfoRow
                label="End Date"
                value={formatDate(getFinancialYearEndDate())}
                icon={Calendar}
              />
            </DetailCard>

            {/* Department Details */}
            <DetailCard
              title="Department Details"
              icon={Building}
              color="green"
            >
              <InfoRow
                label="Department Name"
                value={getDepartmentName()}
                icon={Building}
              />
              <InfoRow
                label="Department English Name"
                value={getDepartmentEngName()}
                icon={Building}
              />
            </DetailCard>

            {/* Budget Head Details - Updated */}
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

            {/* Documents Card - Only for Justification status with documents */}
            {hasJustificationDocuments() && (
              <DetailCard
                title="Supporting Documents"
                icon={Paperclip}
                color="amber"
              >
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">
                    Uploaded documents for justification (
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
                              onClick={() => window.open(doc.url, "_blank")}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Preview"
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
                              <DownloadIcon className="h-4 w-4" />
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
                highlightColor="green"
              />
              <InfoRow
                label="Suggested Amount"
                value={
                  budgetEntry.sug_amount
                    ? formatAmount(budgetEntry.sug_amount)
                    : "₹ 0.00"
                }
                icon={IndianRupee}
                highlight={!!budgetEntry.sug_amount}
                highlightColor="blue"
              />
              {budgetEntry.sug_amount && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <Percent className="h-4 w-4 text-gray-400 mr-2" />
                      Difference
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        differenceInfo?.isIncrease
                          ? "text-green-600"
                          : differenceInfo?.isDecrease
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      {differenceInfo && (
                        <>
                          {differenceInfo.isIncrease
                            ? "+"
                            : differenceInfo.isDecrease
                              ? "-"
                              : ""}
                          {formatAmount(differenceInfo.amount)}
                          <span className="ml-2">
                            ({differenceInfo.percentage.toFixed(1)}%)
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </DetailCard>

            {/* Document Summary Card - Only for Justification status with documents */}
            {hasJustificationDocuments() && (
              <DetailCard
                title="Document Summary"
                icon={FileCheck}
                color="teal"
              >
                <div className="text-center py-4">
                  <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Paperclip className="h-6 w-6 text-teal-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    {budgetEntry.Beg_Doc?.length || 0} Document(s)
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Attached for justification
                  </p>
                  <div className="flex flex-col space-y-2">
                    {budgetEntry.Beg_Doc?.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-xs text-gray-700 truncate">
                          {doc.name || `Document ${index + 1}`}
                        </span>
                        {doc.url && (
                          <button
                            onClick={() => window.open(doc.url, "_blank")}
                            className="text-teal-600 hover:text-teal-800"
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

          {/* Version History */}
          {showLogs &&
            budgetEntry.version_history &&
            budgetEntry.version_history.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Version History ({budgetEntry.version_history.length})
                </h4>
                <div className="space-y-3">
                  {budgetEntry.version_history
                    .slice(0, 5)
                    .map((version, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Version {budgetEntry.version_history.length - index}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(version.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {getStatusBadge(version.status)}
                          <span className="text-sm text-gray-700 ml-2">
                            Amount: {version.formatted_amount}
                          </span>
                          {version.is_latest && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
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
            <div className="flex items-center gap-2">
              {canEditEntry(budgetEntry.status) ? (
                <Link
                  to={`/transactions/budget-management/budgetinitialentry/edit/${id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit this entry →
                </Link>
              ) : (
                <span className="text-gray-500 font-medium">
                  {budgetEntry.status == "P" && "✓ Approved - View Only"}
                  {budgetEntry.status == "F" && "❄ Frozen "}
                  {budgetEntry.status == "RJ" &&
                    "✗ Rejected - Create New Entry"}
                  {budgetEntry.status == "R" && "↻ Revised - Approval Required"}
                  {budgetEntry.status == "RR" &&
                    "↻ Re-Revised - Approval Required"}
                  {budgetEntry.status == "J" && "📝 Justification Required"}
                  {budgetEntry.status == "A" && "✓ Active - View Only"}
                  {budgetEntry.status == "I" && "○ Inactive - View Only"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBudgetEntry;
