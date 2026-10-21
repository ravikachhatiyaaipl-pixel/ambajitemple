import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Hash,
  Clock,
  Printer,
  AlertCircle,
  Receipt,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Briefcase,
  Users,
  Building,
  Layers,
  Tag,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";
import { WorkBgApi } from "../../../services/workbgapi";

const ViewWorkBg = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const [pageTitle, setPageTitle] = useState("BG Receipt Entry");
  const { organization } = useOrganization();

  useEffect(() => {
    // Get page title from menu details
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/tender-management/work-bg-receipt-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }

    loadEntryData();
  }, [id]);

  const loadEntryData = async () => {
    setLoading(true);
    try {
      const response = await WorkBgApi.getById(id);
      console.log("Loaded BG entry response:", response);

      const entryData = response?.data || response;
      setEntry(entryData);
    } catch (error) {
      console.error("Error loading BG entry:", error);
      toast.error(
        error.response?.data?.message || "Failed to load entry data!",
      );
      navigate("/transactions/tender-management/work-bg-receipt-entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async () => {
    const result = await Swal.fire({
      title: "Delete BG Entry?",
      text: `Are you sure you want to delete this BG entry? This action cannot be undone.`,
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
      await WorkBgApi.delete(id);
      toast.success(`Entry deleted successfully!`);
      navigate("/transactions/tender-management/work-bg-receipt-entry");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error(error.response?.data?.message || "Failed to delete entry");
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      hod_app: {
        color: "bg-green-100 text-green-800",
        label: "HOD Approved",
        icon: CheckCircle,
      },
      draft: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Draft",
        icon: Clock,
      },
      hod_rej: {
        color: "bg-red-100 text-red-800",
        label: "HOD Rejected",
        icon: XCircle,
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getBgTypeBadge = (type) => {
    const typeConfig = {
      Receipt: { color: "bg-blue-100 text-blue-800", icon: CreditCard },
      Release: { color: "bg-green-100 text-green-800", icon: Clock },
      Adjust: { color: "bg-yellow-100 text-yellow-800", icon: FileText },
      Forefeight: { color: "bg-red-100 text-red-800", icon: AlertCircle },
    };

    const config = typeConfig[type] || {
      color: "bg-gray-100 text-gray-800",
      icon: Receipt,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-2" />
        {type}
      </span>
    );
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
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Entry Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>BG Receipt Information</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>Date</td>
                <td style={styles.td}>{formatDate(entry?.WBT_Date)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>BG Type</td>
                <td style={styles.td}>{entry?.WBT_Type || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Bill Number
                </td>
                <td style={styles.td}>{entry?.WBT_BillNo || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>BG Amount</td>
                <td style={styles.td}>{formatCurrency(entry?.BG_Amt)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={styles.td}>{entry?.Status || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>WBT_CD</td>
                <td style={styles.td}>{entry?.WBT_CD || "N/A"}</td>
              </tr>
              {entry?.Remarks && (
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>Remarks</td>
                  <td style={styles.td} colSpan="3">
                    {entry.Remarks}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Created At</td>
                <td style={styles.td}>{formatDateTime(entry?.created_at)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Updated At</td>
                <td style={styles.td}>{formatDateTime(entry?.updated_at)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Work Allocation Information */}
        {entry?.work_allocation && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Work Allocation Details</div>
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
                  <td style={{ ...styles.td, ...styles.textBold }}>WA ID</td>
                  <td style={styles.td}>#{entry.work_allocation.WA_Id}</td>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Reference ID
                  </td>
                  <td style={styles.td}>
                    {entry.work_allocation.WA_RefId || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Work Order Amount
                  </td>
                  <td style={styles.td}>
                    {formatCurrency(entry.work_allocation.WO_Amount)}
                  </td>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Work Order Date
                  </td>
                  <td style={styles.td}>
                    {formatDate(entry.work_allocation.WO_Date)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* NOC Information */}
        {entry?.noc && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>NOC Details</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Field</th>
                  <th style={styles.th}>Details</th>
                  <th style={styles.th}>Field</th>
                  <th style={styles.th}>Details</th>
                </tr>
              </thead>
            </table>
          </div>
        )}

        {/* Tender Information */}
        {entry?.work_allocation?.tender && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Tender Details</div>
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
                    Tender ID
                  </td>
                  <td style={styles.td}>
                    {entry.work_allocation.tender.TE_Id}
                  </td>
                  <td style={{ ...styles.td, ...styles.textBold }}>Date</td>
                  <td style={styles.td}>
                    {formatDate(entry.work_allocation.tender.Tnd_Date)}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Proposal Amount
                  </td>
                  <td style={styles.td}>
                    {formatCurrency(
                      entry.work_allocation.tender.Proposal_Amount,
                    )}
                  </td>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Approved Amount
                  </td>
                  <td style={styles.td}>
                    {formatCurrency(
                      entry.work_allocation.tender.Approved_Amount,
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan="4" style={styles.td}>
                    <span style={styles.textBold}>Description: </span>
                    {entry.work_allocation.tender.Description}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Subledger Information */}
        {entry?.subledger && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Vendor Details</div>
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
                    Vendor Name
                  </td>
                  <td style={styles.td}>{entry.subledger.SL_Name}</td>
                </tr>
                {entry.subledger.SL_Cont_Pers && (
                  <tr>
                    <td style={{ ...styles.td, ...styles.textBold }}>
                      Contact Person
                    </td>
                    <td style={styles.td} colSpan="3">
                      {entry.subledger.SL_Cont_Pers}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* HOD Information */}
        {entry?.hod && entry.WBT_HDT && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>HOD Details</div>
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
                  <td style={{ ...styles.td, ...styles.textBold }}>HOD Name</td>
                  <td style={styles.td}>{entry.hod.full_name}</td>
                  <td style={{ ...styles.td, ...styles.textBold }}>Email</td>
                  <td style={styles.td}>{entry.hod.Usr_Email}</td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Action Date
                  </td>
                  <td style={styles.td} colSpan="3">
                    {formatDateTime(entry.WBT_HDT)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-900">Not Found</h2>
        <button
          onClick={() =>
            navigate("/transactions/tender-management/work-bg-receipt-entry")
          }
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Back to List
        </button>
      </div>
    );
  }

  const workAllocation = entry.work_allocation;
  const noc = entry.noc;
  const tender = workAllocation?.tender;
  const vendor = entry.subledger;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="BG Receipt Report"
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
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate(
                  "/transactions/tender-management/work-bg-receipt-entry",
                )
              }
              className="mr-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {pageTitle} Details
              </h1>
              <p className="text-sm text-gray-500">
                View complete BG receipt information
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPrint(true)}
              className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <Link
              to={`/transactions/tender-management/work-bg-receipt-entry/edit/${id}`}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 mx-auto">
        {/* Entry Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 w-full">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b w-full flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-blue-600" />
              BG Receipt Information
            </h2>
            <div className="flex items-center gap-2">
              {getStatusBadge(entry?.Status)}
            </div>
          </div>

          <div className="p-6 w-full">
            {/* First Row - Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {/* Date */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-base font-semibold text-gray-900">
                    {formatDate(entry.WBT_Date)}
                  </span>
                </div>
              </div>

              {/* BG Type */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BG Type
                </div>
                <div>{getBgTypeBadge(entry.WBT_Type)}</div>
              </div>

              {/* Bill Number */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Number
                </div>
                <div className="flex items-center">
                  <Hash className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-base font-semibold text-gray-900">
                    {entry.WBT_BillNo || "—"}
                  </span>
                  {entry.WBT_BillNo && (
                    <button
                      onClick={() => handleCopyToClipboard(entry.WBT_BillNo)}
                      className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Copy bill number"
                    >
                      <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* BG Amount */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BG Amount
                </div>
                <div className="text-base font-bold text-blue-600">
                  {formatCurrency(entry.BG_Amt)}
                </div>
              </div>
            </div>

            {/* WBT_CD (if exists) */}
            {entry.WBT_CD && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Type
                </div>
                <div className="text-sm text-gray-900">{entry.WBT_CD}</div>
              </div>
            )}

            {/* Rejection Reason Display */}
            {entry.Status?.toLowerCase() == "hod_rej" && entry.Remarks && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-red-800 mb-1">
                        Rejection Reason
                      </h3>
                      <p className="text-sm text-red-700">{entry.Remarks}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Work Allocation, NOC and Vendor Details - Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Work Allocation Details Card */}
          {workAllocation && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-white border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                  Work Allocation
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Reference ID
                    </div>
                    <div className="text-base font-medium text-gray-900">
                      {workAllocation.WA_RefId || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Work Order Amount
                    </div>
                    <div className="text-base font-bold text-purple-600">
                      {formatCurrency(workAllocation.WO_Amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Work Order Date
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDate(workAllocation.WO_Date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vendor Details Card */}
          {vendor && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Vendor Details
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Vendor Name
                    </div>
                    <div className="text-base font-medium text-gray-900">
                      {vendor.SL_Name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tender Details Card (if exists) */}
        {tender && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-white border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Tender Details
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Description
                  </div>
                  <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {tender.Description}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Tender Date
                    </div>
                    <div className="text-base font-medium text-gray-900">
                      {formatDate(tender.Tnd_Date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Proposal Amount
                    </div>
                    <div className="text-base font-medium text-blue-600">
                      {formatCurrency(tender.Proposal_Amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Approved Amount
                    </div>
                    <div className="text-base font-medium text-green-600">
                      {formatCurrency(tender.Approved_Amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOD Information Card (if exists) */}
        {entry?.hod && entry.WBT_HDT && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-white border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-amber-600" />
                HOD Approval Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    HOD Name
                  </div>
                  <div className="text-base font-medium text-gray-900">
                    {entry.hod.full_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {entry.hod.Usr_Email}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {entry.Status == "hod_app"
                      ? "Approved Date"
                      : "Rejected Date"}
                  </div>
                  <div
                    className={`text-base font-medium ${entry.Status == "hod_app" ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatDateTime(entry.WBT_HDT)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              Timestamps
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Created At
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {formatDateTime(entry?.created_at)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Updated At
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {formatDateTime(entry?.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewWorkBg;
