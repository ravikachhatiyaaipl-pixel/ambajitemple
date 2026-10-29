// src/pages/Finance/BudgetManagement/BudgetFreeze/View.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building,
  IndianRupee,
  AlertCircle,
  Clock,
  Snowflake,
  TrendingUp,
  FileCheck,
  XCircle,
  CheckCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Lock,
  Printer,
  Copy,
  PieChart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import budgetEntryApi from "../../../services/budgetentryapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewBudgetFreezeEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [budgetEntry, setBudgetEntry] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  // Helper functions for budget head
  const getBudgetHeadName = () => {
    return budgetEntry?.budget_head?.gr_nm || "N/A";
  };

  const getBudgetHeadCode = () => {
    return budgetEntry?.budget_head?.gr_cd || "N/A";
  };

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
        navigate("/transactions/budget-management/budgetfreeze");
      }
    } catch (error) {
      console.error("Error loading budget entry:", error);
      toast.error("Failed to load budget entry data!");
      navigate("/transactions/budget-management/budgetfreeze");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDetails = () => {
    const details = `
Budget Entry ID: ${budgetEntry?.budg_id}
Financial Year: ${budgetEntry?.financial_year?.financial_year_name}
Department: ${budgetEntry?.department?.desc}
Budget Head: ${getBudgetHeadName()} (${getBudgetHeadCode()})
Budget Amount: ${budgetEntry?.formatted_amount}
Suggested Amount: ${budgetEntry?.sug_amount ? formatAmount(budgetEntry.sug_amount) : "N/A"}
Status: ${budgetEntry?.status_text}
Freeze Status: ${budgetEntry?.status == "F" ? "Frozen" : "Not Frozen"}
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
      F: {
        label: "Freeze",
        color: "bg-cyan-100 text-cyan-800",
        icon: Snowflake,
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

  const formatAmount = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  // Print Report Content Component
  const PrintReportContent = () => {
    const isFrozen = budgetEntry?.status == "F";

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
        {/* Budget Freeze Entry Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Budget Freeze Entry Summary</div>
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
                <td style={styles.td}>
                  <span
                    style={{
                      color:
                        budgetEntry?.status == "F"
                          ? "#0891b2"
                          : budgetEntry?.status == "P"
                            ? "#059669"
                            : budgetEntry?.status == "D"
                              ? "#d97706"
                              : budgetEntry?.status == "RJ"
                                ? "#dc2626"
                                : budgetEntry?.status == "R"
                                  ? "#E53935"
                                  : budgetEntry?.status == "J"
                                    ? "#ea580c"
                                    : "#6b7280",
                      fontWeight: "600",
                    }}
                  >
                    {budgetEntry?.status_text || budgetEntry?.status || "N/A"}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Freeze Status
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      color: isFrozen ? "#0891b2" : "#059669",
                      fontWeight: "600",
                    }}
                  >
                    {isFrozen ? "Frozen" : "Not Frozen"}
                  </span>
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Financial Year
                </td>
                <td style={styles.td}>
                  {budgetEntry?.financial_year?.financial_year_name || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Department</td>
                <td style={styles.td}>
                  {budgetEntry?.department?.desc || "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Budget Head
                </td>
                <td style={styles.td}>{getBudgetHeadName()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Budget Amount
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  {budgetEntry?.formatted_amount || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Suggested Amount
                </td>
                <td style={styles.td}>
                  {budgetEntry?.sug_amount
                    ? formatAmount(budgetEntry.sug_amount)
                    : "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>
                  {formatDateTime(budgetEntry?.created_at)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>
                  {formatDateTime(budgetEntry?.updated_at)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Report Generated
                </td>
                <td style={styles.td}>{new Date().toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>

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

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
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
            navigate("/transactions/budget-management/budgetfreeze")
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

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
      cyan: {
        bg: "bg-cyan-500",
        text: "text-cyan-600",
        border: "border-cyan-200",
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

  const InfoRow = ({ label, value, icon: Icon, highlight = false }) => (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="h-4 w-4 text-gray-400 mr-2" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="max-w-[60%]">
        <span
          className={`text-sm text-right break-words ${
            highlight ? "font-bold text-green-700" : "text-gray-900"
          }`}
        >
          {value || "N/A"}
        </span>
      </div>
    </div>
  );

  const isFrozen = budgetEntry.status == "F";

  return (
    <div className="p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Budget Freeze Entry Report"
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
              navigate("/transactions/budget-management/budgetfreeze")
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
            Print
          </button>

          {!isFrozen && (
            <Link
              to={`/transactions/budget-management/budgetfreeze/edit/${id}`}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-lg hover:from-cyan-700 hover:to-blue-800 flex items-center transition-all shadow-sm"
            >
              <Snowflake className="h-4 w-4 mr-2" />
              Freeze Entry
            </Link>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
            <Snowflake className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Budget Freeze Details
          </h1>
        </div>
        <p className="text-gray-600 ml-11">
          View detailed information about budget freeze status
        </p>
      </div>

      {/* ID & Status Banner */}
      <div
        className={`rounded-xl p-6 mb-6 ${
          isFrozen
            ? "bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200"
            : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <span className="text-sm text-gray-600">Status</span>
              <div className="mt-1">{getStatusBadge(budgetEntry.status)}</div>
            </div>
            <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
            <div>
              <span className="text-sm text-gray-600">Approve Amount</span>
              <p className="text-2xl font-bold text-green-700">
  {budgetEntry.sug_amount != null && budgetEntry.sug_amount > 0 
    ? formatAmount(budgetEntry.sug_amount)
    : budgetEntry.formatted_amount}
</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isFrozen && (
              <div className="flex items-center text-cyan-700">
                <Lock className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Frozen</span>
              </div>
            )}
          </div>
        </div>
      </div>

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
            />
            <InfoRow
              label="Start Date"
              value={new Date(
                budgetEntry.financial_year?.start_date,
              ).toLocaleDateString()}
              icon={Calendar}
            />
            <InfoRow
              label="End Date"
              value={new Date(
                budgetEntry.financial_year?.end_date,
              ).toLocaleDateString()}
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
              value={
                budgetEntry.sug_amount
                  ? formatAmount(budgetEntry.sug_amount)
                  : "₹ 0.00"
              }
              icon={IndianRupee}
            />
            {budgetEntry.sug_amount && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Difference
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      parseFloat(budgetEntry.sug_amount) >
                      parseFloat(budgetEntry.amount || 0)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {budgetEntry.amount && budgetEntry.sug_amount
                      ? formatAmount(
                          Math.abs(
                            parseFloat(budgetEntry.sug_amount) -
                              parseFloat(budgetEntry.amount),
                          ),
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>
            )}
          </DetailCard>
        </div>
      </div>

      {/* Status Information Card */}
      <div
        className={`rounded-xl border p-6 mb-6 ${
          isFrozen
            ? "bg-cyan-50 border-cyan-200"
            : "bg-green-50 border-green-200"
        }`}
      >
        <div className="flex items-center mb-4">
          <div
            className={`p-2 rounded-lg mr-3 ${
              isFrozen
                ? "bg-cyan-100 text-cyan-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {isFrozen ? (
              <Lock className="h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Status Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`p-4 rounded-lg ${
              isFrozen ? "bg-cyan-100" : "bg-green-100"
            }`}
          >
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Current Status
            </h4>
            <div className="mb-2">{getStatusBadge(budgetEntry.status)}</div>
            <p className="text-xs text-gray-600">
              {isFrozen
                ? "This entry is frozen and cannot be modified."
                : "This entry is approved and can be frozen to prevent modifications."}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg ${
              isFrozen ? "bg-cyan-100" : "bg-green-100"
            }`}
          >
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Action Required
            </h4>
            <p className="text-sm text-gray-900 mb-2">
              {isFrozen
                ? "No action required - Entry is frozen"
                : "You can freeze this entry to prevent further modifications"}
            </p>
            {!isFrozen && (
              <Link
                to={`/transactions/budget-management/budgetfreeze/edit/${id}`}
                className="inline-flex items-center text-sm text-cyan-600 hover:text-cyan-800"
              >
                <Snowflake className="h-3 w-3 mr-1" />
                Click to freeze
              </Link>
            )}
          </div>

          <div
            className={`p-4 rounded-lg ${
              isFrozen ? "bg-cyan-100" : "bg-green-100"
            }`}
          >
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Next Steps
            </h4>
            <p className="text-xs text-gray-600">
              {isFrozen
                ? "Frozen entries are read-only and cannot be modified"
                : "Freeze this entry to lock the budget amount for the financial year"}
            </p>
          </div>
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
                  {isFrozen ? (
                    <Snowflake className="h-4 w-4 text-cyan-500 mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  )}
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
          </div>
          {!isFrozen && (
            <div>
              <Link
                to={`/transactions/budget-management/budgetfreeze/edit/${id}`}
                className="text-cyan-600 hover:text-cyan-800 font-medium"
              >
                Freeze this entry →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBudgetFreezeEntry;
