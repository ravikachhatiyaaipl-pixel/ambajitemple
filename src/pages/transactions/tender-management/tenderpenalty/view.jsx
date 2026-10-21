import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  Percent,
  DollarSign,
  Edit,
  Trash2,
  Calendar,
  Copy,
  AlertCircle,
  Printer,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  Tag,
  User,
  BookOpen,
  Hash,
  Building,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { tenderPenaltyApi } from "../../../services/tenderpenaltyapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewTenderPenalty = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [penalty, setPenalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadPenaltyData();
  }, [id]);

  const loadPenaltyData = async () => {
    setLoading(true);
    try {
      const data = await tenderPenaltyApi.getById(id);

      // Map API response for display
      if (data) {
        // Convert Fix_Per to display format
        if (data.Fix_Per == "F") data.fix_per_display = "Fixed";
        if (data.Fix_Per == "P") data.fix_per_display = "Percentage";

        // Convert Add_Deduct to display format
        if (data.Add_Deduct == "A") data.add_deduct_display = "Add";
        if (data.Add_Deduct == "D") data.add_deduct_display = "Deduct";
      }

      setPenalty(data);
    } catch (error) {
      toast.error("Failed to load tender adjustment data!");
      navigate("/transactions/tender-management/tenderpenalty");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePenalty = async () => {
    const result = await Swal.fire({
      title: "Delete Tender Adjustment?",
      text: `Are you sure you want to delete adjustment "${penalty?.Bill_No || "ID: " + penalty?.TA_Id}"? This action cannot be undone.`,
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
        await tenderPenaltyApi.delete(id);
        toast.success(`Tender adjustment deleted successfully!`);
        navigate("/transactions/tender-management/tenderpenalty");
      } catch (error) {
        toast.error(error.message || "Failed to delete tender adjustment");
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
        hour12: true,
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    const num = parseFloat(amount);
    if (isNaN(num)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getStatusBadge = (status, remarks) => {
    const statusConfig = {
      draft: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Draft",
      },
      hod_app: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "HOD Approved",
      },
      hod_rej: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "HOD Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <div className="space-y-2">
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}
        >
          <Icon className="h-4 w-4 mr-1.5" />
          {config.label}
        </span>
        {status == "hod_rej" && remarks && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <span className="font-medium">Rejection Reason:</span> {remarks}
            </p>
          </div>
        )}
      </div>
    );
  };

  const getLedgerDisplay = (ledger) => {
    if (!ledger) return null;
    return {
      name: ledger.Lg_Eng_Name || ledger.Lg_Name,
      code: ledger.Lg_Code || "N/A",
    };
  };

  // Print Report Content Component
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
      highlightBox: {
        padding: "8px",
        borderRadius: "4px",
        margin: "8px 0",
      },
      highlightAdd: { backgroundColor: "#d1fae5", border: "1px solid #a7f3d0" },
      highlightDeduct: {
        backgroundColor: "#fee2e2",
        border: "1px solid #fecaca",
      },
    };

    if (!penalty) return null;

    const ledgerDisplay = penalty.ledger
      ? getLedgerDisplay(penalty.ledger)
      : null;

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Penalty Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Tender Adjustment Summary</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>Bill No</td>
                <td style={styles.td}>{penalty?.Bill_No || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Date</td>
                <td style={styles.td}>{formatDate(penalty?.TA_Date)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={styles.td}>
                  <span
                    style={{
                      textTransform: "capitalize",
                      color:
                        penalty?.Status == "hod_rej"
                          ? "#dc2626"
                          : penalty?.Status == "hod_app"
                            ? "#059669"
                            : "#b45309",
                    }}
                  >
                    {penalty?.Status?.replace("_", " ") || "Draft"}
                  </span>
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Type</td>
                <td style={styles.td}>
                  <span
                    style={{
                      color: penalty?.Add_Deduct == "A" ? "#059669" : "#dc2626",
                      fontWeight: "600",
                    }}
                  >
                    {penalty?.Add_Deduct == "A" ? "Addition" : "Deduction"}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Calculation Type
                </td>
                <td style={styles.td}>
                  {penalty?.Fix_Per == "P" ? "Percentage" : "Fixed Amount"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Adjustment Amount
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      color: penalty?.Add_Deduct == "A" ? "#059669" : "#dc2626",
                      fontWeight: "600",
                    }}
                  >
                    {penalty?.Add_Deduct == "A" ? "+" : "-"}{" "}
                    {formatCurrency(penalty?.Adj_Amount)}
                  </span>
                </td>
              </tr>
              {penalty?.Fix_Per == "P" && (
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Percentage
                  </td>
                  <td style={styles.td}>{penalty?.Percentage}%</td>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    WO Amount
                  </td>
                  <td style={styles.td}>
                    {formatCurrency(penalty?.WO_Amount)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sub-Ledger & Ledger Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Sub-Ledger & Ledger Details</div>
          <table style={styles.table}>
            <tbody>
              {/* Sub-Ledger Information */}
              {penalty?.subledger && (
                <>
                  <tr>
                    <td
                      style={{ ...styles.td, ...styles.textBold, width: "25%" }}
                    >
                      Sub-Ledger Name
                    </td>
                    <td style={styles.td} width="25%">
                      {penalty.subledger.SL_Name}
                    </td>
                  </tr>
                </>
              )}

              {/* Ledger Information */}
              {penalty?.ledger && ledgerDisplay && (
                <>
                  <tr>
                    <td style={{ ...styles.td, ...styles.textBold }}>
                      Ledger Name
                    </td>
                    <td style={styles.td} colSpan="3">
                      {ledgerDisplay.name}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...styles.td, ...styles.textBold }}>
                      Ledger Code
                    </td>
                    <td style={styles.td} colSpan="3">
                      {ledgerDisplay.code}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Tender Information */}
        {penalty?.work_allocation?.tender && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Tender Information</div>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td
                    style={{ ...styles.td, ...styles.textBold, width: "25%" }}
                  >
                    Description
                  </td>
                  <td style={styles.td} colSpan="3">
                    {penalty.work_allocation.tender.Description}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Proposal Amount
                  </td>
                  <td style={styles.td}>
                    {formatCurrency(
                      penalty.work_allocation.tender.Proposal_Amount,
                    )}
                  </td>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Approved Amount
                  </td>
                  <td style={styles.td}>
                    {formatCurrency(
                      penalty.work_allocation.tender.Approved_Amount,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Calculation Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Calculation Summary</div>
          <div
            style={{
              ...styles.highlightBox,
              ...(penalty?.Add_Deduct == "A"
                ? styles.highlightAdd
                : styles.highlightDeduct),
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "600", fontSize: "12px" }}>
                  {penalty?.Add_Deduct == "A"
                    ? "Additional Amount"
                    : "Penalty Deduction"}
                </div>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>
                  {penalty?.Fix_Per == "P"
                    ? `${penalty?.Percentage}% of ${formatCurrency(penalty?.WO_Amount)}`
                    : "Fixed Amount"}
                </div>
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: penalty?.Add_Deduct == "A" ? "#059669" : "#dc2626",
                }}
              >
                {penalty?.Add_Deduct == "A" ? "+" : "-"}{" "}
                {formatCurrency(penalty?.Adj_Amount)}
              </div>
            </div>
          </div>
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
                <td style={styles.td}>{formatDateTime(penalty?.created_at)}</td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>{formatDateTime(penalty?.updated_at)}</td>
              </tr>
              <tr>
                <td style={styles.td}>Report Generated</td>
                <td style={styles.td} colSpan="3">
                  {new Date().toLocaleString("en-IN")}
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading tender adjustment details...
          </p>
        </div>
      </div>
    );
  }

  if (!penalty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Tender Adjustment Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The tender adjustment you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() =>
              navigate("/transactions/tender-management/tenderpenalty")
            }
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tender Adjustments
          </button>
        </div>
      </div>
    );
  }

  const ledgerDisplay = penalty.ledger
    ? getLedgerDisplay(penalty.ledger)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Tender Adjustment Report"
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
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate("/transactions/tender-management/tenderpenalty")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tender Adjustment Details
              </h1>
              <p className="text-gray-600 mt-1">
                View complete information about this adjustment
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrint(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </button>
          <Link
            to={`/transactions/tender-management/tenderpenalty/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bill No */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Tag className="h-4 w-4 mr-1.5 text-gray-400" />
                      Bill Number
                    </span>
                    {penalty.Bill_No && (
                      <button
                        onClick={() => handleCopyToClipboard(penalty.Bill_No)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="text-base font-semibold text-gray-900">
                      {penalty.Bill_No || (
                        <span className="text-gray-400 italic">
                          Not assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Adjustment Date
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="text-base font-medium text-gray-900">
                      {formatDate(penalty.TA_Date)}
                    </div>
                  </div>
                </div>

                {/* Status - Full Width */}
                <div className="md:col-span-2">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Current Status
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {getStatusBadge(penalty.Status, penalty.Remarks)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Ledger & Ledger Details Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2 text-indigo-600" />
                Sub-Ledger & Ledger Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sub-Ledger Section */}
                {penalty.subledger && (
                  <>
                    <div>
                      <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                        <User className="h-4 w-4 mr-1.5 text-gray-400" />
                        Sub-Ledger Name
                      </span>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium text-gray-900">
                            {penalty.subledger.SL_Name}
                          </span>
                          <button
                            onClick={() =>
                              handleCopyToClipboard(penalty.subledger.SL_Name)
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Ledger Section */}
                {penalty.ledger && ledgerDisplay && (
                  <>
                    <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                      <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-indigo-500" />
                        Associated Ledger
                      </h3>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                        <BookOpen className="h-4 w-4 mr-1.5 text-gray-400" />
                        Ledger Name
                      </span>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium text-indigo-900">
                            {ledgerDisplay.name}
                          </span>
                          <button
                            onClick={() =>
                              handleCopyToClipboard(ledgerDisplay.name)
                            }
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                        <Hash className="h-4 w-4 mr-1.5 text-gray-400" />
                        Ledger Code
                      </span>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <span className="text-base font-medium text-indigo-900">
                          {ledgerDisplay.code}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tender Details Card */}
          {penalty.work_allocation?.tender && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                  Tender Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tender Description - Full Width */}
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-1.5 text-gray-400" />
                      Description
                    </span>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-gray-900 font-medium">
                        {penalty.work_allocation.tender.Description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                      <DollarSign className="h-4 w-4 mr-1.5 text-gray-400" />
                      Proposal Amount
                    </span>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(
                          penalty.work_allocation.tender.Proposal_Amount,
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                      <DollarSign className="h-4 w-4 mr-1.5 text-gray-400" />
                      Approved Amount
                    </span>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(
                          penalty.work_allocation.tender.Approved_Amount,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calculation Details Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-white border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-purple-600" />
                Calculation Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calculation Type */}
                <div>
                  <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <Percent className="h-4 w-4 mr-1.5 text-gray-400" />
                    Calculation Type
                  </span>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="text-base font-medium text-gray-900">
                      {penalty.Fix_Per == "P"
                        ? "Percentage Based"
                        : "Fixed Amount"}
                    </span>
                  </div>
                </div>

                {/* Adjustment Type */}
                <div>
                  <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    {penalty.Add_Deduct == "A" ? (
                      <TrendingUp className="h-4 w-4 mr-1.5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1.5 text-red-500" />
                    )}
                    Adjustment Type
                  </span>
                  <div
                    className={`p-3 rounded-lg border ${
                      penalty.Add_Deduct == "A"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <span
                      className={`text-base font-medium ${
                        penalty.Add_Deduct == "A"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {penalty.Add_Deduct == "A" ? "Addition" : "Deduction"}
                    </span>
                  </div>
                </div>

                {/* WO Amount */}
                <div>
                  <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <DollarSign className="h-4 w-4 mr-1.5 text-gray-400" />
                    Work Order Amount
                  </span>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(penalty.WO_Amount)}
                    </span>
                  </div>
                </div>

                {/* Adjustment Amount */}
                <div>
                  <span className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <Calculator className="h-4 w-4 mr-1.5 text-gray-400" />
                    Adjustment Amount
                  </span>
                  <div
                    className={`p-3 rounded-lg border ${
                      penalty.Add_Deduct == "A"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <span
                      className={`text-lg font-bold ${
                        penalty.Add_Deduct == "A"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {penalty.Add_Deduct == "A" ? "+" : "-"}{" "}
                      {formatCurrency(penalty.Adj_Amount)}
                    </span>
                    {penalty.Fix_Per == "P" && penalty.Percentage && (
                      <div className="text-sm text-gray-600 mt-1">
                        ({penalty.Percentage}% of WO Amount)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Actions (1/3 width) */}
        <div className="space-y-6">
          {/* Quick Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-white border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Summary
              </h2>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Adjustment Type</dt>
                  <dd
                    className={`text-sm font-semibold ${
                      penalty.Add_Deduct == "A"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {penalty.Add_Deduct == "A" ? "Addition" : "Deduction"}
                  </dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Calculation Method</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {penalty.Fix_Per == "P" ? "Percentage" : "Fixed Amount"}
                  </dd>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <dt className="text-sm text-gray-600">Work Order Amount</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {formatCurrency(penalty.WO_Amount)}
                  </dd>
                </div>
                <div className="flex justify-between items-center py-2">
                  <dt className="text-sm font-medium text-gray-700">
                    Final Adjustment
                  </dt>
                  <dd
                    className={`text-lg font-bold ${
                      penalty.Add_Deduct == "A"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {penalty.Add_Deduct == "A" ? "+" : "-"}{" "}
                    {formatCurrency(penalty.Adj_Amount)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Audit Trail Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Audit Trail
              </h2>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Created At</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDateTime(penalty.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">Last Updated</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDateTime(penalty.updated_at)}
                  </dd>
                </div>
                {penalty.Status == "hod_rej" && penalty.Remarks && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">
                      Rejection Reason
                    </dt>
                    <dd className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {penalty.Remarks}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTenderPenalty;
