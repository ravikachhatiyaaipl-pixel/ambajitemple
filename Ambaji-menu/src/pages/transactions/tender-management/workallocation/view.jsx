import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Briefcase,
  Users,
  PieChart,
  FileCheck,
  AlertCircle,
  UserCheck,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Tag,
  Printer,
  Building,
  Layers,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { WorkAllocationApi } from "../../../services/workallocationapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewWorkAllocation = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allocationData, setAllocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  const [expandedSections, setExpandedSections] = useState({
    branchInfo: true,
    ledgerInfo: true,
    tenderDetails: true,
    vendorDetails: true,
    allocationInfo: true,
    financials: true,
    documents: true,
  });

  useEffect(() => {
    loadAllocationData();
  }, [id]);

  const loadAllocationData = async () => {
    setLoading(true);
    try {
      const data = await WorkAllocationApi.getById(id);
      console.log("Loaded work allocation:", data);

      setAllocationData(data);
    } catch (error) {
      console.error("Error loading work allocation:", error);
      toast.error(
        error.response?.data?.message || "Failed to load work allocation data!",
      );
      navigate("/transactions/tender-management/workallocation");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllocation = async () => {
    const result = await Swal.fire({
      title: "Delete Work Allocation?",
      text: `Are you sure you want to delete work allocation #${id}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await WorkAllocationApi.delete(id);
          return { success: true };
        } catch (error) {
          throw new Error(
            error.response?.data?.message || "Failed to delete work allocation",
          );
        }
      },
    });

    if (result.isConfirmed && result.value?.success) {
      toast.success(`Work allocation #${id} deleted successfully!`);
      navigate("/transactions/tender-management/workallocation");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
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

  // Helper function to get department display name
  const getDepartmentDisplay = (department) => {
    if (!department) return "N/A";

    if (department.Dpt_Desc) {
      return department.Dpt_Desc;
    }
    if (department.Dpt_Name) {
      return department.Dpt_Name;
    }
    return `Department #${department.Dpt_id}`;
  };

  // Helper function to get ledger display name
  const getLedgerDisplay = (ledger) => {
    if (!ledger) return "N/A";

    let display = ledger.Lg_Name || "";

    if (ledger.Lg_Eng_Name && ledger.Lg_Eng_Name != ledger.Lg_Name) {
      display += ` (${ledger.Lg_Eng_Name})`;
    }

    if (ledger.Lg_Code) {
      display += ` - ${ledger.Lg_Code}`;
    }

    return display;
  };

  const calculateFinancialMetrics = () => {
    if (!allocationData) return null;

    const tender = allocationData.tender;
    const allocation = allocationData;

    const proposalAmount = parseFloat(tender?.Proposal_Amount || 0);
    const approvedAmount = tender?.Approved_Amount
      ? parseFloat(tender.Approved_Amount)
      : null;
    const currentAllocation = parseFloat(allocation?.WO_Amount || 0);

    const baseAmount = approvedAmount || proposalAmount;
    const currentAllocationPercentage =
      baseAmount > 0 ? (currentAllocation / baseAmount) * 100 : 0;

    return {
      proposalAmount,
      approvedAmount,
      currentAllocation,
      currentAllocationPercentage: currentAllocationPercentage.toFixed(2),
      allocationMethod: approvedAmount ? "Approved Amount" : "Proposal Amount",
    };
  };

  const PrintReportContent = () => {
    const allocation = allocationData;
    const tender = allocation?.tender;
    const vendor = allocation?.subledger;
    const department = allocation?.department;
    const ledger = allocation?.ledger;
    const documents = allocation?.WA_Documents || [];
    const financials = calculateFinancialMetrics();

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
      textRight: { textAlign: "right" },
      currency: { fontFamily: "'Courier New', monospace" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Allocation Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Work Allocation Summary</div>
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
                  Reference ID
                </td>
                <td style={styles.td}>{allocation?.WA_RefId || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Allocation Date
                </td>
                <td style={styles.td}>{formatDate(allocation?.WO_Date)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Branch Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Branch Information</div>
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
                  Branch Description
                </td>
                <td style={styles.td}>{getDepartmentDisplay(department)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Branch Name
                </td>
                <td style={styles.td} colSpan="3">
                  {department?.Dpt_Name || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Ledger Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Ledger Information</div>
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
                  Ledger Name
                </td>
                <td style={styles.td}>{ledger?.Lg_Name || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  English Name
                </td>
                <td style={styles.td}>{ledger?.Lg_Eng_Name || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Ledger Code
                </td>
                <td style={styles.td}>{ledger?.Lg_Code || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

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
                <td style={{ ...styles.td, ...styles.textBold }}>Tender ID</td>
                <td style={styles.td}>#{tender?.TE_Id || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Tender Date
                </td>
                <td style={styles.td}>{formatDate(tender?.Tnd_Date)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Description
                </td>
                <td style={styles.td} colSpan="3">
                  {tender?.Description || "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Proposal Amount
                </td>
                <td style={{ ...styles.td, ...styles.currency }}>
                  {formatCurrency(tender?.Proposal_Amount)}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Approved Amount
                </td>
                <td style={{ ...styles.td, ...styles.currency }}>
                  {formatCurrency(tender?.Approved_Amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Vendor Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Vendor Information</div>
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
                <td style={styles.td}>{vendor?.SL_Name || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Allocation Amount */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Allocation Details</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Description</th>
                <th style={{ ...styles.th, ...styles.textRight }}>
                  Amount (₹)
                </th>
                <th style={{ ...styles.th, ...styles.textRight }}>
                  % of {financials?.allocationMethod}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  This Allocation Amount
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...styles.currency,
                    ...styles.textRight,
                  }}
                >
                  {formatCurrency(financials?.currentAllocation)}
                </td>
                <td style={{ ...styles.td, ...styles.textRight }}>
                  {financials?.currentAllocationPercentage}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Documents */}
        {documents.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Supporting Documents</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Document Name</th>
                  <th style={styles.th}>Type</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={doc.doc_lib_id || index}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{doc.name || "Unnamed"}</td>
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading work allocation details...
          </p>
        </div>
      </div>
    );
  }

  if (!allocationData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Work Allocation Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The work allocation with ID #{id} does not exist or has been
            removed.
          </p>
          <Link
            to="/transactions/tender-management/workallocation"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Work Allocations
          </Link>
        </div>
      </div>
    );
  }

  const allocation = allocationData;
  const tender = allocation.tender;
  const vendor = allocation.subledger;
  const department = allocation.department;
  const ledger = allocation.ledger;
  const documents = allocation.WA_Documents || [];
  const financials = calculateFinancialMetrics();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Work Allocation Report"
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
                navigate("/transactions/tender-management/workallocation")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  Work Allocation Details
                </h1>
              </div>
              <p className="text-gray-600 mt-1">
                {tender?.Description || "No tender description"}
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
            to={`/transactions/tender-management/workallocation/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Allocation
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Allocation Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Allocation Summary
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Allocation Amount
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(allocation.WO_Amount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Allocation Date
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(allocation.WO_Date)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Branch Information Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <button
              onClick={() => toggleSection("branchInfo")}
              className="w-full px-6 py-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <Building className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Branch Information
                </h2>
              </div>
              {expandedSections.branchInfo ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedSections.branchInfo && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <FileText className="h-4 w-4 mr-2" />
                        Branch Description
                      </div>
                      <div className="text-gray-900">
                        {department ? getDepartmentDisplay(department) : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Tag className="h-4 w-4 mr-2" />
                        Branch Name
                      </div>
                      <div className="text-gray-900">
                        {department?.Dpt_Name || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ledger Information Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <button
              onClick={() => toggleSection("ledgerInfo")}
              className="w-full px-6 py-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center mr-3">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Ledger Information
                </h2>
              </div>
              {expandedSections.ledgerInfo ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedSections.ledgerInfo && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <FileText className="h-4 w-4 mr-2" />
                        Ledger Name
                      </div>
                      <div className="text-gray-900">
                        {ledger?.Lg_Name || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <FileText className="h-4 w-4 mr-2" />
                        English Name
                      </div>
                      <div className="text-gray-900">
                        {ledger?.Lg_Eng_Name || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Hash className="h-4 w-4 mr-2" />
                        Ledger Code
                      </div>
                      <div className="text-gray-900">
                        {ledger?.Lg_Code || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tender Details Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <button
              onClick={() => toggleSection("tenderDetails")}
              className="w-full px-6 py-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                  <FileCheck className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Tender Information
                </h2>
              </div>
              {expandedSections.tenderDetails ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedSections.tenderDetails && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <FileText className="h-4 w-4 mr-2" />
                        Description
                      </div>
                      <div className="text-gray-900">
                        {tender?.Description || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Tender Date
                      </div>
                      <div className="text-gray-900">
                        {formatDate(tender?.Tnd_Date)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Proposal Amount
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {formatCurrency(tender?.Proposal_Amount)}
                      </div>
                    </div>
                    {tender?.Approved_Amount && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Approved Amount
                        </div>
                        <div className="text-gray-900 font-semibold text-green-600">
                          {formatCurrency(tender.Approved_Amount)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vendor Details Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <button
              onClick={() => toggleSection("vendorDetails")}
              className="w-full px-6 py-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                  <Users className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Vendor Information
                </h2>
              </div>
              {expandedSections.vendorDetails ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedSections.vendorDetails && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Tag className="h-4 w-4 mr-2" />
                        Vendor Name
                      </div>
                      <div className="text-gray-900 font-semibold text-lg">
                        {vendor?.SL_Name || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Documents Card */}
          {documents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border">
              <button
                onClick={() => toggleSection("documents")}
                className="w-full px-6 py-4 border-b flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Supporting Documents
                  </h2>
                </div>
                {expandedSections.documents ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.documents && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc, index) => (
                      <div
                        key={doc.doc_lib_id || index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start">
                          <div className="text-3xl mr-3">
                            {doc.type == "pdf"
                              ? "📄"
                              : doc.type == "ppt"
                                ? "📊"
                                : doc.type == "xls"
                                  ? "📈"
                                  : "📎"}
                          </div>
                          <div className="flex-1">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium block mb-1"
                            >
                              {doc.name || `Document ${index + 1}`}
                            </a>
                            <div className="text-xs text-gray-500">
                              Type: {doc.type || "Unknown"} •
                              <span className="ml-1">Click to view</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Financial Overview */}
        <div className="space-y-6">
          {/* Financial Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <PieChart className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Financial Overview
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-800">
                      Proposal Amount
                    </span>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(financials?.proposalAmount)}
                    </p>
                  </div>

                  {financials?.approvedAmount && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-green-800">
                        Approved Amount
                      </span>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(financials?.approvedAmount)}
                      </p>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <span className="text-sm font-medium text-purple-800">
                      This Allocation
                    </span>
                    <p className="text-2xl font-bold text-purple-700">
                      {formatCurrency(financials?.currentAllocation)}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {financials?.currentAllocationPercentage}% of{" "}
                      {financials?.allocationMethod}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-4 border-t">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        This Allocation vs {financials?.allocationMethod}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {financials?.currentAllocationPercentage}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(parseFloat(financials?.currentAllocationPercentage), 100)}%`,
                        }}
                      ></div>
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

export default ViewWorkAllocation;
