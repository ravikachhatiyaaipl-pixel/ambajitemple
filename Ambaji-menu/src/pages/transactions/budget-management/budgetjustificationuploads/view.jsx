// src/pages/Finance/BudgetManagement/BudgetJustificationUploads/View.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Building,
  IndianRupee,
  AlertCircle,
  Clock,
  Edit,
  FileCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Paperclip,
  ExternalLink,
  Download,
  File,
  Copy,
  PieChart,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import budgetEntryApi from "../../../services/budgetentryapi";

const ViewBudgetJustificationUploads = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [budgetEntry, setBudgetEntry] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

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
        navigate("/transactions/budget-management/budgetjustificationuploads");
      }
    } catch (error) {
      console.error("Error loading budget entry:", error);
      toast.error("Failed to load budget entry data!");
      navigate("/transactions/budget-management/budgetjustificationuploads");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if entry has justification documents
  const hasJustificationDocuments = () => {
    return budgetEntry?.Beg_Doc && budgetEntry?.Beg_Doc.length > 0;
  };

  // Function to get file icon
  const getFileIcon = (url) => {
    if (!url) return <File className="h-5 w-5" />;

    const extension = url.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "xls":
      case "xlsx":
        return <FileText className="h-5 w-5 text-green-500" />;
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      J: {
        label: "Justification",
        color: "bg-amber-100 text-amber-800",
        icon: FileCheck,
      },
    };

    const config = statusConfig[status] || statusConfig["J"];
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

  const formatAmount = (amount) => {
    if (!amount && amount != 0) return "₹ 0.00";
    const numAmount = typeof amount == "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto"></div>
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
            navigate(
              "/transactions/budget-management/budgetjustificationuploads",
            )
          }
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </button>
      </div>
    );
  }

  const DetailCard = ({ title, icon: Icon, children, color = "amber" }) => {
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

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/transactions/budget-management/budgetjustificationuploads",
              )
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
          <Link
            to={`/transactions/budget-management/budgetjustificationuploads/edit/${id}`}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-lg hover:from-amber-700 hover:to-orange-800 flex items-center transition-all shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Documents
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
            <FileCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Justification Documents Details
          </h1>
        </div>
        <p className="text-gray-600 ml-11">
          View detailed information and supporting documents for budget
          justification
        </p>
      </div>

      {/* ID & Status Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
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
            <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
            <div>
              <span className="text-sm text-gray-600">Documents</span>
              <div className="flex items-center mt-1">
                <Paperclip className="h-4 w-4 text-amber-600 mr-1" />
                <p className="text-lg font-bold text-amber-700">
                  {budgetEntry.Beg_Doc?.length || 0} file(s)
                </p>
              </div>
            </div>
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
            <InfoRow
              label="Budget Head Code"
              value={getBudgetHeadCode()}
              icon={PieChart}
            />
          </DetailCard>

          {/* Documents Card - Main section for this module */}
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
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(doc.url);
                              toast.success("URL copied to clipboard!");
                            }}
                            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                            title="Copy URL"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DetailCard>
          )}

          {/* No Documents Message */}
          {!hasJustificationDocuments() && (
            <DetailCard
              title="Justification Documents"
              icon={Paperclip}
              color="amber"
            >
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <File className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No Documents Uploaded
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  This justification entry doesn't have any documents attached
                  yet.
                </p>
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
              value={
                budgetEntry.sug_amount
                  ? formatAmount(budgetEntry.sug_amount)
                  : "₹ 0.00"
              }
              icon={IndianRupee}
            />
            {budgetEntry.sug_amount && budgetEntry.amount && (
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
                  <FileCheck className="h-4 w-4 text-amber-500 mr-2" />
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
          <div>
            <Link
              to={`/transactions/budget-management/budgetjustificationuploads/edit/${id}`}
              className="text-amber-600 hover:text-amber-800 font-medium"
            >
              Edit documents →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBudgetJustificationUploads;
