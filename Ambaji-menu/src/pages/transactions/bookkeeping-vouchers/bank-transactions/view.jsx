// view.jsx
/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Hash,
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
  Send,
  ArrowRight,
  Clock,
  Banknote,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BankTransactionApi } from "../../../services/banktransactionapi";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const ViewBankTransaction = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();

  useEffect(() => {
    loadTransactionData();
  }, [id]);

  const loadTransactionData = async () => {
    setLoading(true);
    try {
      const result = await BankTransactionApi.getById(id);

      console.log("API Response:", result);

      if (result.success && result.data) {
        setTransaction(result.data);
      } else {
        toast.error(result.message || "Failed to load bank transaction!");
        navigate("/transactions/bookkeeping-vouchers/bank-transactions");
      }
    } catch (error) {
      console.error("Error loading transaction:", error);
      toast.error(error.message || "Failed to load bank transaction data!");
      navigate("/transactions/bookkeeping-vouchers/bank-transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    const statusText = newStatus ==  "success" ? "Success" : "Failed";
    
    const result = await Swal.fire({
      title: `Mark as ${statusText}?`,
      text: `Are you sure you want to mark this transaction as ${statusText}?`,
      icon: newStatus ==  "success" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus ==  "success" ? "#10b981" : "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, mark as ${statusText}!`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await BankTransactionApi.update(id, { Status: newStatus });
        toast.success(`Transaction marked as ${statusText}!`);
        loadTransactionData();
      } catch (error) {
        toast.error(error.message || "Failed to update transaction status");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          text: "Success",
          className: "bg-green-100 text-green-800",
        };
      case "pending":
        return {
          icon: <Clock className="h-5 w-5" />,
          text: "Pending",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "fail":
        return {
          icon: <XCircle className="h-5 w-5" />,
          text: "Failed",
          className: "bg-red-100 text-red-800",
        };
      case "initial":
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          text: "Ready to Payment",
          className: "bg-blue-100 text-blue-800",
        };
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
    if (!transaction) return null;
    const statusBadge = getStatusBadge(transaction.Status);

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
        {/* Transaction Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Transaction Summary</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={styles.td}>{statusBadge.text}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Transaction ID</td>
                <td style={styles.td}>{transaction.Trans_Id || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Created Date</td>
                <td style={styles.td}>{formatDate(transaction.created_at)}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Last Updated</td>
                <td style={styles.td}>{formatDate(transaction.updated_at)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* From Bank Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>From Bank Details</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Bank Name</td>
                <td style={styles.td}>{transaction.From_Bank_Name || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Branch</td>
                <td style={styles.td}>{transaction.From_Branch_Name || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Account Number</td>
                <td style={styles.td}>{transaction.From_Bank_Acc || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Account Type</td>
                <td style={styles.td}>{transaction.From_Acc_type || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>IFSC Code</td>
                <td style={styles.td}>{transaction.From_IFSC || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}></td>
                <td style={styles.td}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* To Bank Details */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>To Bank Details</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Bank Name</td>
                <td style={styles.td}>{transaction.To_Bank_Name || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Branch</td>
                <td style={styles.td}>{transaction.To_Branch_Name || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Account Number</td>
                <td style={styles.td}>{transaction.To_Bank_Acc || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Account Type</td>
                <td style={styles.td}>{transaction.To_Acc_type || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>IFSC Code</td>
                <td style={styles.td}>{transaction.To_IFSC || "N/A"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}></td>
                <td style={styles.td}></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Voucher Information */}
        {transaction.challan_voucher && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Challan Voucher Information</div>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>CV Number</td>
                  <td style={styles.td} colSpan="3">
                    {transaction.challan_voucher.CV_No || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>Amount</td>
                  <td style={styles.td}>
                    {formatCurrency(transaction.challan_voucher.Amount)}
                  </td>
                  <td style={{ ...styles.td, ...styles.textBold }}>Payment Mode</td>
                  <td style={styles.td}>{transaction.challan_voucher.Py_Mode || "N/A"}</td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>Challan Date</td>
                  <td style={styles.td}>{formatDate(transaction.challan_voucher.Ch_Date)}</td>
                  <td style={{ ...styles.td, ...styles.textBold }}>File No</td>
                  <td style={styles.td}>{transaction.challan_voucher.FileNo || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Audit Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Audit Information</div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.td}>Transaction Created</td>
                <td style={styles.td}>{formatDate(transaction.created_at)}</td>
                <td style={styles.td}>Last Updated</td>
                <td style={styles.td}>{formatDate(transaction.updated_at)}</td>
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
          <p className="mt-4 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Bank Transaction Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The bank transaction you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() =>
              navigate("/transactions/bookkeeping-vouchers/bank-transactions")
            }
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions List
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(transaction.Status);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Bank Transaction Report"
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
                navigate("/transactions/bookkeeping-vouchers/bank-transactions")
              }
              className="mr-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  Bank Transaction Details
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.className}`}
                >
                  {statusBadge.icon}
                  <span className="ml-1">{statusBadge.text}</span>
                </span>
              </div>
              {transaction.Trans_Id && (
                <p className="text-gray-500 text-sm mt-1 flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  Transaction ID: {transaction.Trans_Id}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {(transaction.Status ==  "initial" || transaction.Status ==  "pending") && (
            <>
              <button
                onClick={() => handleUpdateStatus("success")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Payment 
              </button>
              <button
                onClick={() => handleUpdateStatus("fail")}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Failed
              </button>
            </>
          )}
          <button
            onClick={() => setShowPrint(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
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
            Transaction Details
          </button>
          <button
            onClick={() => setActiveTab("voucher")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "voucher"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Receipt className="h-4 w-4 inline mr-2" />
            Voucher Information
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Transaction Details Tab */}
        {activeTab == "details" && (
          <>
            {/* From Bank Details Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Send className="h-5 w-5 mr-2 text-blue-600" />
                  From Bank Details
                </h2>
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
                        {transaction.From_Bank_Name || "N/A"}
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
                        {transaction.From_Branch_Name || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Account Number
                    </label>
                    <div className="mt-1 flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-mono">
                        {transaction.From_Bank_Acc || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Account Type
                    </label>
                    <div className="mt-1 flex items-center">
                      <Banknote className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {transaction.From_Acc_type || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      IFSC Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-mono uppercase">
                        {transaction.From_IFSC || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* To Bank Details Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-green-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Landmark className="h-5 w-5 mr-2 text-green-600" />
                  To Bank Details
                </h2>
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
                        {transaction.To_Bank_Name || "N/A"}
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
                        {transaction.To_Branch_Name || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Account Number
                    </label>
                    <div className="mt-1 flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-mono">
                        {transaction.To_Bank_Acc || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Account Type
                    </label>
                    <div className="mt-1 flex items-center">
                      <Banknote className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {transaction.To_Acc_type || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      IFSC Code
                    </label>
                    <div className="mt-1 flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-mono uppercase">
                        {transaction.To_IFSC || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Voucher Information Tab */}
        {activeTab == "voucher" && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Receipt className="h-5 w-5 mr-2 text-gray-600" />
                Challan Voucher Details
              </h2>
            </div>
            {transaction.challan_voucher ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      CV Number
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900 font-medium block break-words">
                        {transaction.challan_voucher.CV_No || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Amount
                    </label>
                    <div className="mt-1">
                      <span className="text-gray-900 text-lg font-semibold">
                        {formatCurrency(transaction.challan_voucher.Amount)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Payment Mode
                    </label>
                    <div className="mt-1 flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {transaction.challan_voucher.Py_Mode || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Challan Date
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {formatDate(transaction.challan_voucher.Ch_Date)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      File Number
                    </label>
                    <div className="mt-1 flex items-center">
                      <Hash className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {transaction.challan_voucher.FileNo || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Remarks
                    </label>
                    <div className="mt-1 flex items-start">
                      <Info className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-gray-900">
                        {transaction.challan_voucher.Remarks || "No remarks"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Voucher Information Available
                </h3>
                <p className="text-gray-600">
                  This transaction is not associated with any challan voucher.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBankTransaction;