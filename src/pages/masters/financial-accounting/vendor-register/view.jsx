/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Hash,
  FolderTree,
  CheckCircle,
  XCircle,
  Edit,
  Printer,
  Home,
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  Landmark,
  Receipt,
  Briefcase,
  ClipboardCheck,
  AlertCircle,
  Users,
  CreditCard,
  Shield,
  FileText,
  Calendar,
  FileSignature,
  Globe,
  Building as BuildingIcon,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SubLedgerAccountApi } from "../../../services/subledgeraccountapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewVerdorRegister = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subledger, setSubledger] = useState(null);
  const [ledgerDetails, setLedgerDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadSubledgerData();
  }, [id]);

  const loadSubledgerData = async () => {
    setLoading(true);
    try {
      const result = await SubLedgerAccountApi.getById(id);

      // Log the entire result to see its structure
      console.log("API Response:", result);

      // Check if result has data property (common API pattern)
      if (result.success && result.data) {
        setSubledger(result.data);

        // Check if ledger_details exists at the root level
        if (result.ledger_details) {
          console.log("ledger_details found at root:", result.ledger_details);
          setLedgerDetails(result.ledger_details);
        }
        // Check if ledger_details is inside data
        else if (result.data.ledger_details) {
          console.log(
            "ledger_details found in data:",
            result.data.ledger_details,
          );
          setLedgerDetails(result.data.ledger_details);
        }
        // Check if ledgers array exists (alternative field name)
        else if (result.data.ledgers) {
          console.log("ledgers found in data:", result.data.ledgers);
          setLedgerDetails(result.data.ledgers);
        } else {
          console.log("No ledger details found in response");
          setLedgerDetails([]);
        }
      } else if (result.data) {
        // Handle case where result itself is the data
        setSubledger(result.data);

        if (result.ledger_details) {
          setLedgerDetails(result.ledger_details);
        } else if (result.data.ledger_details) {
          setLedgerDetails(result.data.ledger_details);
        } else {
          setLedgerDetails([]);
        }
      } else {
        toast.error(result.message || "Failed to load subledger data!");
        navigate("/masters/financial-accounting/vendor-register");
      }
    } catch (error) {
      console.error("Error loading subledger:", error);
      toast.error(error.message || "Failed to load subledger data!");
      navigate("/masters/financial-accounting/vendor-register");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubledger = async () => {
    const result = await Swal.fire({
      title: "Delete Subledger?",
      text: `Are you sure you want to delete "${subledger?.SL_Name}"? This action cannot be undone.`,
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
        await SubLedgerAccountApi.delete(id);
        toast.success(
          `Subledger "${subledger?.SL_Name}" deleted successfully!`,
        );
        navigate("/masters/financial-accounting/vendor-register");
      } catch (error) {
        toast.error(error.message || "Failed to delete subledger");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
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
    if (!amount) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const PrintReportContent = () => {
    if (!subledger) return null;

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

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Subledger Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Subledger Summary</div>
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
                  Subledger Name
                </td>
                <td style={styles.td}>{subledger?.SL_Name || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Subledger Code
                </td>
                <td style={styles.td}>{subledger?.SL_Code || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td
                  style={{
                    ...styles.td,
                    ...(subledger?.SL_Status
                      ? styles.statusActive
                      : styles.statusInactive),
                  }}
                >
                  {subledger?.SL_Status ? "Active" : "Inactive"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Contact Person
                </td>
                <td style={styles.td}>
                  {subledger?.SL_Cont_Pers || "Not Provided"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Created Date
                </td>
                <td style={styles.td}>{formatDate(subledger?.created_at)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Last Updated
                </td>
                <td style={styles.td}>{formatDate(subledger?.updated_at)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Parent Ledgers Information */}
        {ledgerDetails && ledgerDetails.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Parent Ledgers Information</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ledger Name</th>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {ledgerDetails.map((ledger) => (
                  <tr key={ledger.Lg_Id}>
                    <td style={styles.td}>{ledger.Lg_Name}</td>
                    <td style={styles.td}>{ledger.Lg_Code}</td>
                    <td style={styles.td}>
                      {ledger.Lg_Status ? "Active" : "Inactive"}
                    </td>
                    <td style={styles.td}>
                      {new Date(ledger.created_at).toLocaleDateString("en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Contact Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Contact Information</div>
          <table style={styles.table}>
            <tbody>
              {subledger?.SL_Address && (
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>Address</td>
                  <td style={styles.td} colSpan="3">
                    {subledger.SL_Address}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>City</td>
                <td style={styles.td}>
                  {subledger?.SL_City || "Not Provided"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>PIN Code</td>
                <td style={styles.td}>{subledger?.SL_Pin || "Not Provided"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Phone</td>
                <td style={styles.td}>
                  {subledger?.SL_Phone || "Not Provided"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Email</td>
                <td style={styles.td}>
                  {subledger?.SL_Email || "Not Provided"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bank Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Bank Account Details</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Bank Name</td>
                <td style={styles.td}>
                  {subledger?.Bank_Name || "Not Provided"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>Branch</td>
                <td style={styles.td}>
                  {subledger?.Branch_Name || "Not Provided"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Account Holder
                </td>
                <td style={styles.td}>
                  {subledger?.Account_Holder_Name || "Not Provided"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Account Type
                </td>
                <td style={styles.td}>
                  {subledger?.Account_Type || "Not Provided"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Account Number
                </td>
                <td style={styles.td}>
                  {subledger?.Account_Number
                    ? `••••${subledger.Account_Number.slice(-4)}`
                    : "Not Provided"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>IFSC Code</td>
                <td style={styles.td}>
                  {subledger?.IFSC_Code || "Not Provided"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Statutory Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Statutory & Compliance Details</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold, width: "30%" }}>
                  PAN Number
                </td>
                <td style={styles.td} colSpan="3">
                  {subledger?.PAN_Number || "Not Provided"}
                  {subledger?.PAN_Verified && (
                    <span style={{ marginLeft: "8px", color: "#059669" }}>
                      ✓ Verified
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>GSTIN</td>
                <td style={styles.td} colSpan="3">
                  {subledger?.GSTIN || "Not Provided"}
                  {subledger?.GSTIN_Verified && (
                    <span style={{ marginLeft: "8px", color: "#059669" }}>
                      ✓ Verified
                    </span>
                  )}
                </td>
              </tr>
              {subledger?.GST_Exempt_Declaration && (
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    GST Exempt Declaration
                  </td>
                  <td style={styles.td} colSpan="3">
                    {subledger.GST_Exempt_Declaration}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  MSME/Udyam Registration
                </td>
                <td style={styles.td} colSpan="3">
                  {subledger?.MSME_Udyam_Registration_No || "Not Provided"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>CIN/LLPIN</td>
                <td style={styles.td} colSpan="3">
                  {subledger?.CIN_LLPIN || "Not Provided"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Shop Act/Trade License
                </td>
                <td style={styles.td} colSpan="3">
                  {subledger?.Shop_Act_Trade_License_No || "Not Provided"}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>TAN</td>
                <td style={styles.td} colSpan="3">
                  {subledger?.TAN || "Not Provided"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Audit Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Audit Information</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.td}>Subledger Created</td>
                <td style={styles.td}>{formatDate(subledger?.created_at)}</td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>{formatDate(subledger?.updated_at)}</td>
              </tr>
              <tr>
                <td style={styles.td}>Report Generated</td>
                <td style={styles.td}>{new Date().toLocaleString("en-US")}</td>
                <td style={styles.td}>Generated By</td>
                <td style={styles.td}>System User</td>
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
          <p className="mt-4 text-gray-600">Loading subledger details...</p>
        </div>
      </div>
    );
  }

  if (!subledger) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Subledger Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The subledger you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() =>
              navigate("/masters/financial-accounting/vendor-register")
            }
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subledger List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Subledger Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      {/* Header - No pageTitle from menu details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <button
              onClick={() =>
                navigate("/masters/financial-accounting/vendor-register")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {subledger?.SL_Name || "Loading..."}
                </h1>
                {subledger?.SL_Code && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Code: {subledger.SL_Code}
                  </span>
                )}
              </div>

              {(subledger?.SL_Address || subledger?.SL_City) && (
                <p className="text-gray-500 text-sm mt-1 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {[subledger.SL_Address, subledger.SL_City, subledger.SL_Pin]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
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
            to={`/masters/financial-accounting/vendor-register/edit/${id}`}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Layers className="h-4 w-4 inline mr-2" />
            Basic Details
          </button>
          <button
            onClick={() => setActiveTab("bank")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "bank"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Landmark className="h-4 w-4 inline mr-2" />
            Bank Details
          </button>
          <button
            onClick={() => setActiveTab("statutory")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "statutory"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Statutory Details
          </button>
          <button
            onClick={() => setActiveTab("ledgers")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "ledgers"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Parent Ledgers
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Basic Details Tab */}
        {activeTab == "details" && (
          <>
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Subledger Code
                      </label>
                      <div className="mt-1 flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-mono font-medium">
                          {subledger?.SL_Code || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Subledger Name
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900 text-lg font-medium">
                          {subledger?.SL_Name || "Loading..."}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <div className="mt-1">
                        {subledger?.SL_Status ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <XCircle className="h-4 w-4 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Contact Person
                      </label>
                      <div className="mt-1 flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {subledger?.SL_Cont_Pers || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <div className="mt-1 flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {subledger?.SL_Phone || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <div className="mt-1 flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {subledger?.SL_Email || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Address Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Address
                    </label>
                    <div className="mt-1 flex items-start">
                      <Home className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                      <span className="text-gray-900 whitespace-pre-line">
                        {subledger?.SL_Address || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      City
                    </label>
                    <div className="mt-1 flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {subledger?.SL_City || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      PIN Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {subledger?.SL_Pin || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bank Details Tab */}
        {activeTab == "bank" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Bank Account Details
                </h2>
                {subledger?.Bank_Details_Verified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Bank Name
                  </label>
                  <div className="mt-1 flex items-center">
                    <BuildingIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {subledger?.Bank_Name || "Not Provided"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Branch Name
                  </label>
                  <div className="mt-1 flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {subledger?.Branch_Name || "Not Provided"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Account Holder Name
                  </label>
                  <div className="mt-1 flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {subledger?.Account_Holder_Name || "Not Provided"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Account Type
                  </label>
                  <div className="mt-1 flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {subledger?.Account_Type || "Not Provided"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Account Number
                  </label>
                  <div className="mt-1 flex items-center">
                    <Hash className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-mono">
                      {subledger?.Account_Number
                        ? `••••${subledger.Account_Number.slice(-4)}`
                        : "Not Provided"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    IFSC Code
                  </label>
                  <div className="mt-1 flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900 font-mono">
                      {subledger?.IFSC_Code || "Not Provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statutory Details Tab */}
        {activeTab == "statutory" && (
          <div className="space-y-6">
            {/* PAN Details Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    PAN Details
                  </h2>
                  {subledger?.PAN_Verified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      PAN Number
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900 font-mono font-medium">
                        {subledger?.PAN_Number || "Not Provided"}
                      </span>
                    </div>
                  </div>
                  {subledger?.PAN_Verified_Date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Verified Date
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900">
                          {formatDate(subledger.PAN_Verified_Date)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GST Details Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-green-600" />
                    GST Details
                  </h2>
                  {subledger?.GSTIN_Verified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      GSTIN
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900 font-mono font-medium">
                        {subledger?.GSTIN || "Not Provided"}
                      </span>
                    </div>
                  </div>
                  {subledger?.GST_Exempt_Declaration && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">
                        GST Exemption Declaration
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">
                          {subledger.GST_Exempt_Declaration}
                        </span>
                      </div>
                    </div>
                  )}
                  {subledger?.GSTIN_Verified_Date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Verified Date
                      </label>
                      <div className="mt-1">
                        <span className="text-gray-900">
                          {formatDate(subledger.GSTIN_Verified_Date)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Other Registrations Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardCheck className="h-5 w-5 mr-2 text-purple-600" />
                  Other Registrations & Licenses
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subledger?.MSME_Udyam_Registration_No && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        MSME/Udyam Registration
                      </label>
                      <div className="mt-1 flex items-center">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-mono">
                          {subledger.MSME_Udyam_Registration_No}
                        </span>
                      </div>
                    </div>
                  )}
                  {subledger?.CIN_LLPIN && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        CIN/LLPIN
                      </label>
                      <div className="mt-1 flex items-center">
                        <FileSignature className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-mono">
                          {subledger.CIN_LLPIN}
                        </span>
                      </div>
                    </div>
                  )}
                  {subledger?.Shop_Act_Trade_License_No && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Shop Act/Trade License
                      </label>
                      <div className="mt-1 flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {subledger.Shop_Act_Trade_License_No}
                        </span>
                      </div>
                    </div>
                  )}
                  {subledger?.TAN && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        TAN (Tax Deduction Account Number)
                      </label>
                      <div className="mt-1 flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 font-mono">
                          {subledger.TAN}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ledgers Tab - FIXED: Using ledgerDetails state */}
        {/* Ledgers Tab - FIXED: Using ledgerDetails state directly */}
        {activeTab == "ledgers" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Parent Ledgers
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {ledgerDetails?.length || 0} ledger(s) associated with this
                subledger
              </p>
            </div>
            <div className="p-6">
              {ledgerDetails && ledgerDetails.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ledgerDetails.map((ledger) => (
                    <div
                      key={ledger.Lg_Id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start">
                        <FolderTree className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              {ledger.Lg_Name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                ledger.Lg_Status
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ledger.Lg_Status ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Hash className="h-3 w-3 mr-1" />
                              Code: {ledger.Lg_Code}
                            </div>

                            {ledger.Lg_Eng_Name && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Globe className="h-3 w-3 mr-1" />
                                English Name: {ledger.Lg_Eng_Name}
                              </div>
                            )}
                            {ledger.ledger_group && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FolderTree className="h-3 w-3 mr-1" />
                                Group: {ledger.ledger_group.Gr_Nm}
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              Created:{" "}
                              {new Date(ledger.created_at).toLocaleDateString(
                                "en-US",
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderTree className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No ledgers associated yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Edit this subledger to add parent ledgers
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewVerdorRegister;
