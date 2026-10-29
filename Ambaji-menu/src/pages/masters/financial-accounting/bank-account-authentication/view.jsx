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
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SubLedgerAccountApi } from "../../../services/subledgeraccountapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewBankAuth = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subledger, setSubledger] = useState(null);
  const [ledgerDetails, setLedgerDetails] = useState([]);
  const [loading, setLoading] = useState(true);
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
        navigate("/masters/financial-accounting/bank-account-authentication");
      }
    } catch (error) {
      console.error("Error loading subledger:", error);
      toast.error(error.message || "Failed to load subledger data!");
      navigate("/masters/financial-accounting/bank-account-authentication");
    } finally {
      setLoading(false);
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
              navigate("/masters/financial-accounting/bank-account-authentication")
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

  // Get verification status badge
  const getVerificationBadge = () => {
    const status = subledger?.Is_Bank_Verified;
    if (status == "Y") {
      return {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        label: "Verified"
      };
    } else if (status == "N") {
      return {
        color: "bg-yellow-100 text-yellow-800",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        label: "Pending Verification"
      };
    } else if (status == "R") {
      return {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-3 w-3 mr-1" />,
        label: "Rejected"
      };
    } else if (status == "I") {
      return {
        color: "bg-blue-100 text-blue-800",
        icon: <Info className="h-3 w-3 mr-1" />,
        label: "Complete Info"
      };
    } else {
      return {
        color: "bg-gray-100 text-gray-800",
        icon: null,
        label: "Not Available"
      };
    }
  };

  const verificationBadge = getVerificationBadge();

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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <button
              onClick={() =>
                navigate("/masters/financial-accounting/bank-account-authentication")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  Bank Account Details
                </h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${verificationBadge.color}`}>
                  {verificationBadge.icon}
                  {verificationBadge.label}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1 flex items-center">
                <User className="h-3 w-3 mr-1" />
                {subledger?.SL_Name || "Loading..."}
                <span className="mx-2">•</span>
                <Hash className="h-3 w-3 mr-1" />
                <span className="font-mono">{subledger?.SL_Code || "N/A"}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrint(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Bank Details Card */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-gray-50">
          <div className="flex items-center">
            <Landmark className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Bank Account Details
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Name */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bank Name
              </label>
              <div className="mt-1 flex items-center">
                <BuildingIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-medium">
                  {subledger?.Bank_Name || "Not Provided"}
                </span>
              </div>
            </div>

            {/* Branch Name */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch Name
              </label>
              <div className="mt-1 flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900">
                  {subledger?.Branch_Name || "Not Provided"}
                </span>
              </div>
            </div>

            {/* Account Holder Name */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Holder Name
              </label>
              <div className="mt-1 flex items-center">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-medium">
                  {subledger?.Account_Holder_Name || "Not Provided"}
                </span>
              </div>
            </div>

            {/* Account Type */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Type
              </label>
              <div className="mt-1 flex items-center">
                <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900">
                  {subledger?.Account_Type || "Not Provided"}
                </span>
              </div>
            </div>

            {/* Account Number */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Number
              </label>
              <div className="mt-1 flex items-center">
                <Hash className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-mono text-lg tracking-wider">
                  {subledger?.Account_Number
                    ? subledger.Account_Number
                    : "Not Provided"}
                </span>
              </div>
            </div>

            {/* IFSC Code */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                IFSC Code
              </label>
              <div className="mt-1 flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-mono uppercase">
                  {subledger?.IFSC_Code || "Not Provided"}
                </span>
              </div>
            </div>
          </div>

       

      

      
        </div>
      </div>
    </div>
  );
};

export default ViewBankAuth;