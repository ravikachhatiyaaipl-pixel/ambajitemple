import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Building,
  Users,
  CreditCard,
  Receipt,
  Printer,
  Banknote,
  AlertCircle,
  Info,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Check,
  X,
  MessageSquare,
  FileSpreadsheet,
  Calculator,
  ShieldAlert,
  BookOpen,
  Briefcase,
  Copy,
  Clock,
  TrendingUp,
  DollarSign,
  Shield,
  Calendar,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { BillChallanEntryApi } from "../../../services/billchallanentryapi";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ViewAccountVerification = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [queryModal, setQueryModal] = useState(false);
  const [queryRemark, setQueryRemark] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [paymentEntries, setPaymentEntries] = useState([]);
  const [narration, setNarration] = useState("");
  const [existingTransactions, setExistingTransactions] = useState([]);
  const [checkingTransactions, setCheckingTransactions] = useState(true);

  // Bank account details to display if transactions exist
  const [bankAccountName, setBankAccountName] = useState("Bank Account");
  const [bankAccountCode, setBankAccountCode] = useState("");
  const [bankAccountEngName, setBankAccountEngName] = useState("");

  useEffect(() => {
    loadVoucherData();
  }, [id]);

  // Regenerate payment entries whenever bank account details or voucher changes
  useEffect(() => {
    if (voucher) {
      generatePaymentEntries(voucher);
    }
  }, [voucher, bankAccountName, bankAccountCode, bankAccountEngName]);

  const loadVoucherData = async () => {
    setLoading(true);
    try {
      const response = await BillChallanEntryApi.getById(id);
      if (response.success && response.data) {
        const voucherData = response.data;
        setVoucher(voucherData);
        setNarration(voucherData.Remarks || "");

        // Show action buttons for HOD approved status only
        setShowActionButtons(voucherData?.Status?.toLowerCase() == "hod_app");

        // Generate journal entries (these don't depend on bank account)
        generateJournalEntries(voucherData);

        // Check for existing transactions
        if (voucherData.PV_No) {
          await checkExistingTransactions(voucherData.PV_No, voucherData);
        } else {
          setCheckingTransactions(false);
          // Generate payment entries with default bank name
          generatePaymentEntries(voucherData);
        }
      } else {
        toast.error("Failed to load payment voucher details");
        navigate("/transactions/vendor-payments/account-verification");
      }
    } catch (error) {
      toast.error("Failed to load payment voucher details");
      console.error(error);
      navigate("/transactions/vendor-payments/account-verification");
    } finally {
      setLoading(false);
    }
  };

  const checkExistingTransactions = async (voucherNo, voucherData) => {
    setCheckingTransactions(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/finan-trns/all?Vou_Rf=${encodeURIComponent(voucherNo)}`,
        {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        const transactions = response.data.data;
        setExistingTransactions(transactions);

        if (transactions.length > 0) {
          // Set narration from first transaction
          const firstTransaction = transactions[0];
          if (firstTransaction && firstTransaction.rmk1) {
            setNarration(firstTransaction.rmk1);
          }

          // ====  ONLY EXTRACT BANK ACCOUNT DETAILS FROM EXISTING TRANSACTIONS =====
          // Find bank transaction (credit side) in payment transactions
          const paymentTransactions = transactions.filter(
            (t) => t.Vou_Ty == "PAY",
          );
          const bankTransaction = paymentTransactions.find(
            (t) => t.Cr_Amt && parseFloat(t.Cr_Amt) > 0 && t.V_Mode == "G",
          );

          if (bankTransaction) {
            // Set bank account details from the transaction
            setBankAccountName(
              bankTransaction.ledger?.Lg_Name || "Bank Account",
            );
            setBankAccountCode(bankTransaction.ledger?.Lg_Code || "");
            setBankAccountEngName(bankTransaction.ledger?.Lg_Eng_Name || "");
            console.log("Bank account loaded:", {
              name: bankTransaction.ledger?.Lg_Name,
              code: bankTransaction.ledger?.Lg_Code,
              engName: bankTransaction.ledger?.Lg_Eng_Name,
            });
          }
        }

        // Generate journal entries from voucher data
        generateJournalEntries(voucherData);
        // Payment entries will be regenerated by the useEffect when bankAccountName changes
      } else {
        setExistingTransactions([]);
        generateJournalEntries(voucherData);
        generatePaymentEntries(voucherData);
      }
    } catch (error) {
      console.error("Error checking existing transactions:", error);
      setExistingTransactions([]);
      generateJournalEntries(voucherData);
      generatePaymentEntries(voucherData);
    } finally {
      setCheckingTransactions(false);
    }
  };

  const generateJournalEntries = (voucherData) => {
    const entries = [];
    const grossAmount = parseFloat(voucherData.Gross_Amt || 0);
    const netAmount = parseFloat(voucherData.Net_Amt || 0);

    // Process pay_details for breakdown
    if (voucherData?.pay_details && Array.isArray(voucherData.pay_details)) {
      // 1. Debit - Vendor Account (Bill Gross Amount) - G Mode
      entries.push({
        account: voucherData.ledger?.Lg_Name || "Vendor Account",
        type: "debit",
        amount: grossAmount,
        ledgerId: voucherData.ledger?.Lg_Id || null,
        mode: "G",
        showInTotal: true,
      });

      // Process tax and penalty items
      voucherData.pay_details.forEach((detail) => {
        const isAdd = parseInt(detail.Add_Dedu) == 1;
        const amount = parseFloat(detail.IC_Amt || 0);

        // Better handling for penalty items
        let accountName = "";
        let percentage = null;

        if (detail.PD_Ty == "PENLTY") {
          accountName = `${detail.ledger?.Lg_Name || "Penalty"} (Penalty)`;
          if (detail.Percent && parseFloat(detail.Percent) > 0 && String(detail.Formula || "").trim() != "*") {
            percentage = parseFloat(detail.Percent);
          }
        } else {
          // Tax item
          accountName = detail.invoice_charge?.IC_Name || "Tax A/c";
          if (String(detail.Formula || "").trim() != "*") {
            percentage =
              detail.invoice_charge?.Percentage ||
              (detail.Percent ? parseFloat(detail.Percent) : null);
          }
        }

        if (amount > 0) {
          entries.push({
            account: accountName,
            percentage: percentage,
            type: isAdd ? "debit" : "credit",
            amount: amount,
            ledgerId: detail.ledger?.Lg_Id || null,
            mode: "G",
            showInTotal: true,
          });
        }
      });

      // 2. Credit - Net Payable A/c (Final amount) - G Mode
      entries.push({
        account: "Net Payable A/c",
        type: "credit",
        amount: netAmount,
        ledgerId: voucherData.sub_ledger?.Lg_Id || null,
        mode: "G",
        showInTotal: true,
      });

      // 3. S mode transaction for display only (vendor name)
      if (voucherData.sub_ledger?.SL_Name) {
        entries.push({
          account: voucherData.sub_ledger.SL_Name,
          type: "credit",
          amount: netAmount,
          ledgerId: voucherData.sub_ledger?.Lg_Id || null,
          mode: "S",
          showInTotal: false,
        });
      }
    }

    setJournalEntries(entries);
  };

  const generatePaymentEntries = (voucherData) => {
    const entries = [];
    const netAmount = parseFloat(voucherData.Net_Amt || 0);

    console.log("Generating payment entries with:", {
      bankAccountName,
      bankAccountCode,
      bankAccountEngName,
    });

    // Create bank account display string
    let bankDisplay = bankAccountName;
    if (bankAccountCode) {
      bankDisplay = `${bankAccountName} (${bankAccountCode})`;
    }

    // Create multi-line description
    let bankDescription = "";
    if (bankAccountEngName) {
      bankDescription = `${bankAccountEngName}\nPayment from bank account`;
    } else {
      bankDescription = "Payment from bank account";
    }

    // G mode transactions (affect totals)
    entries.push({
      account: bankDisplay,
      type: "credit",
      amount: netAmount,
      description: bankDescription,
      ledgerId: null, // We don't have ledger ID, just for display
      mode: "G",
      showInTotal: true,
      isBankEntry: true,
    });

    entries.push({
      account: voucherData.ledger?.Lg_Name || "Vendor Account",
      type: "debit",
      amount: netAmount,
      description: "Payment to vendor",
      ledgerId: voucherData.ledger?.Lg_Id || null,
      mode: "G",
      showInTotal: true,
    });

    // S mode transaction for display only (vendor name)
    if (voucherData.sub_ledger?.SL_Name) {
      entries.push({
        account: voucherData.sub_ledger.SL_Name,
        type: "debit",
        amount: netAmount,
        mode: "S",
        showInTotal: false,
      });
    }

    setPaymentEntries(entries);
  };

  const calculateJournalTotal = (type) => {
    return journalEntries
      .filter((entry) => entry.type == type && entry.showInTotal)
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const calculatePaymentTotal = (type) => {
    return paymentEntries
      .filter((entry) => entry.type == type && entry.showInTotal)
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status, remarks = null) => {
    const statusConfig = {
      draft: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        label: "Draft",
        icon: Clock,
        bgColor: "bg-yellow-50",
      },
      hod_app: {
        color: "bg-green-100 text-green-800 border border-green-200",
        label: "HOD Approved",
        icon: CheckCircle,
        bgColor: "bg-green-50",
      },
      hod_query: {
        color: "bg-amber-100 text-amber-800 border border-amber-200",
        label: "HOD Query",
        icon: AlertCircle,
        bgColor: "bg-amber-50",
      },
      acco_app: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        label: "Accounts Approved",
        icon: Shield,
        bgColor: "bg-blue-50",
      },
      acco_query: {
        color: "bg-orange-100 text-orange-800 border border-orange-200",
        label: "Accounts Query",
        icon: AlertCircle,
        bgColor: "bg-orange-50",
      },
      paid: {
        color: "bg-purple-100 text-purple-800 border border-purple-200",
        label: "Paid",
        icon: DollarSign,
        bgColor: "bg-purple-50",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border border-red-200",
        label: "Cancelled",
        icon: XCircle,
        bgColor: "bg-red-50",
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <div className="flex flex-col gap-2">
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${config.color}`}
        >
          <IconComponent className="h-3 w-3 mr-1.5" />
          {config.label}
        </span>

        {/* Show query remarks for query statuses */}
        {(status?.toLowerCase() == "hod_query" ||
          status?.toLowerCase() == "acco_query") &&
          remarks && (
            <div
              className={`mt-1 p-2 ${config.bgColor} border ${config.color.replace("text-", "border-").split(" ")[0]} rounded-lg`}
            >
              <div className="flex items-start">
                <HelpCircle className="h-3 w-3 text-current mt-0.5 mr-1.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-medium mb-0.5">
                    {status?.toLowerCase() == "hod_query"
                      ? "HOD Query:"
                      : "Accounts Query:"}
                  </div>
                  <div className="whitespace-pre-line">{remarks}</div>
                </div>
              </div>
            </div>
          )}
        {status?.toLowerCase() == "cancelled" && remarks && (
          <div
            className={`mt-1 p-2 ${config.bgColor} border ${config.color.replace("text-", "border-").split(" ")[0]} rounded-lg`}
          >
            <div className="flex items-start">
              <XCircle className="h-3 w-3 text-current mt-0.5 mr-1.5 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-medium mb-0.5">Cancellation Remarks:</div>
                <div className="whitespace-pre-line">{remarks}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const calculateTotals = () => {
    const grossAmount = parseFloat(voucher?.Gross_Amt || 0);
    const addAmount = parseFloat(voucher?.Add_Amt || 0);
    const lessAmount = parseFloat(voucher?.Less_Amt || 0);
    const netAmount = parseFloat(voucher?.Net_Amt || 0);

    const taxBreakdown = [];
    const penaltyBreakdown = [];

    if (voucher?.pay_details && Array.isArray(voucher.pay_details)) {
      voucher.pay_details.forEach((detail) => {
        const isAdd = parseInt(detail.Add_Dedu) == 1;
        const amount = parseFloat(detail.IC_Amt || 0);
        const isTax = detail.PD_Ty == "TAX";

        const item = {
          type: detail.PD_Ty,
          tax_type: detail.PD_Ty == "TAX" ? "Tax" : "Penalty",
          tax_name: detail.PD_Ty == "TAX" ? "Tax" : "Penalty",
          tax_percentage: parseFloat(detail.Percent || 0),
          calculated_amount: amount,
          add_deduct: isAdd ? 1 : 0,
          isAdd: isAdd,
          invoice_charge: detail.invoice_charge,
          formula: detail.Formula,
          ledger: detail.ledger
        };

        if (isTax) {
          taxBreakdown.push(item);
        } else {
          penaltyBreakdown.push(item);
        }
      });
    }

    return {
      grossAmount,
      addAmount,
      lessAmount,
      netAmount,
      taxBreakdown,
      penaltyBreakdown,
      hasTaxes: taxBreakdown.length > 0 || penaltyBreakdown.length > 0,
    };
  };

  const totals = calculateTotals();

  // Final Approval (acco_app)
  const handleApprove = async () => {
    const result = await Swal.fire({
      title: "Final Approval Confirmation",
      text: "Are you sure you want to give final approval to this payment voucher?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/pay-voucher/${id}/status`,
        {
          Status: "acco_app",
          Remarks: null,
        },
        {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
      );

      if (response.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Payment voucher finally approved!",
          icon: "success",
          confirmButtonColor: "#10B981",
          confirmButtonText: "OK",
        });

        loadVoucherData();
        setShowActionButtons(false);
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error approving voucher:", error);
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message || "Failed to approve payment voucher",
        icon: "error",
        confirmButtonColor: "#EF4444",
        confirmButtonText: "OK",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Open query modal
  const openQueryModal = () => {
    setQueryModal(true);
    setQueryRemark("");
  };

  // Close query modal
  const closeQueryModal = () => {
    setQueryModal(false);
    setQueryRemark("");
  };

  // Submit query (acco_query)
  const handleRaiseQuery = async () => {
    if (!queryRemark.trim()) {
      toast.error("Please provide query details");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/pay-voucher/${id}/status`,
        {
          Status: "acco_query",
          Remarks: queryRemark,
        },
        {        
              headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
        }
      );

      if (response.data.success) {
        toast.success("Query raised successfully!");
        closeQueryModal();
        loadVoucherData();
        setShowActionButtons(false);
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error raising query:", error);
      toast.error(error.response?.data?.message || "Failed to raise query");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      const printContent = document.getElementById("printable-voucher");
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();

      setIsPrinting(false);
    }, 100);
  };

  if (loading || checkingTransactions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading
              ? "Loading payment voucher details..."
              : "Checking saved transactions..."}
          </p>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Payment Voucher Not Found
          </h3>
          <button
            onClick={() =>
              navigate("/transactions/vendor-payments/account-verification")
            }
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment Vouchers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/vendor-payments/account-verification")
            }
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Account Payment Voucher Verification
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Voucher No:{" "}
              <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">
                {voucher.PV_No}
              </span>
              <button
                onClick={() => copyToClipboard(voucher.PV_No)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Copy voucher number"
              >
                <Copy className="h-3 w-3" />
              </button>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm disabled:opacity-50 shadow-sm"
          >
            {isPrinting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            {isPrinting ? "Printing..." : "Print Voucher"}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Voucher Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voucher Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-200 mr-3">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-900">
                    Voucher Summary
                  </h2>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(voucher.Status, voucher.Remarks)}
                  {existingTransactions.length > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side - Voucher details */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bill Date
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {formatDate(voucher.PV_Chln_Date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Hash className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voucher Number
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          {voucher.PV_No}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Department & Ledger */}
                <div className="space-y-4">
                  {/* Department Section */}
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {voucher.department?.Dpt_Desc || "N/A"}
                      </div>
                      {voucher.department?.Dpt_Name && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {voucher.department.Dpt_Name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ledger Section */}
                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ledger Details
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {voucher.ledger?.Lg_Name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {voucher.ledger?.Lg_Eng_Name || ""}
                      </div>
                      {voucher.ledger?.Lg_Code && (
                        <div className="text-xs text-gray-500 italic">
                          {voucher.ledger.Lg_Code}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* HOD Approval Info - if available */}
              {voucher.HOD_Approved && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    <div className="text-xs">
                      <div className="font-medium text-green-700">
                        HOD Approved
                      </div>
                      <div className="text-gray-600">
                        By: {voucher.HOD_Officer || "HOD"} | Date:{" "}
                        {formatDate(voucher.HOD_Approved)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vendor & Work Description Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-white">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center shadow-sm shadow-yellow-200 mr-3">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">
                  Vendor / Work Description
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vendor Section */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor Name
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {voucher.sub_ledger?.SL_Name || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Description Section */}
                {voucher.work_allocation?.tender && (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Work Description
                        </div>
                        <div className="text-sm text-gray-900 mt-1">
                          {voucher.work_allocation.tender.Description || "N/A"}
                        </div>
                        {voucher.work_allocation.tender.tendertype && (
                          <div className="text-xs text-gray-500 mt-2">
                            Type:{" "}
                            {voucher.work_allocation.tender.tendertype.TnT_Name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Verification Actions */}
          {showActionButtons && (
            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-2xl">
                <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                      <ShieldAlert className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Account Verification Required
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Final verification and approval required
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Final Approval Button */}
                    <button
                      onClick={handleApprove}
                      disabled={isUpdating}
                      className="w-full px-4 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {isUpdating ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      ) : (
                        <Check className="h-5 w-5 mr-3" />
                      )}
                      <div className="text-left">
                        <div className="font-bold text-base">
                          {isUpdating ? "Processing..." : "Final Approval"}
                        </div>
                        <div className="text-xs font-normal opacity-90 mt-0.5">
                          Approve for payment processing
                        </div>
                      </div>
                    </button>

                    {/* Raise Query Button */}
                    <button
                      onClick={openQueryModal}
                      disabled={isUpdating}
                      className="w-full px-4 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <MessageSquare className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-bold text-base">Raise Query</div>
                        <div className="text-xs font-normal opacity-90 mt-0.5">
                          Need clarification before approval
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bank Details Card */}
          {voucher.sub_ledger &&
            (voucher.sub_ledger.Bank_Name ||
              voucher.sub_ledger.Account_Number) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm shadow-purple-200 mr-3">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="font-semibold text-gray-900">
                      Bank Details
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Bank Name
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {voucher.sub_ledger.Bank_Name || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Account Number
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {voucher.sub_ledger.Account_Number || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        IFSC Code
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {voucher.sub_ledger.IFSC_Code || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Account Type
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {voucher.sub_ledger.Account_Type || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Remarks Card */}
          {voucher.Remarks && voucher.Status?.toLowerCase() != "acco_query" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center shadow-sm shadow-gray-200 mr-3">
                    <Info className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="font-semibold text-gray-900">Remarks</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-line text-sm text-gray-700">
                  {voucher.Remarks}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Amount Details and Vouchers */}
        <div className="space-y-6">
          {/* Journal Voucher Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200 mr-3">
                  <FileSpreadsheet className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">Journal Voucher</h2>
                {existingTransactions.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Saved
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">
                        Particulars
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-gray-700">
                        &nbsp;
                      </th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">
                        Debit
                      </th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {journalEntries.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-2">
                          <div className="font-medium text-gray-900">
                            {entry.account}
                          </div>
                          {entry.description && (
                            <div className="text-gray-500 mt-0.5 text-xs">
                              {entry.description}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {entry.mode == "S" && (
                            <span className="text-gray-600 italic">
                              {formatCurrency(entry.amount)}
                            </span>
                          )}
                        </td>
                        {entry.mode == "G" && entry.showInTotal ? (
                          entry.type == "debit" ? (
                            <>
                              <td className="py-2 px-2 text-right">
                                <span className="font-bold text-red-600">
                                  {formatCurrency(entry.amount)}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-right"></td>
                            </>
                          ) : (
                            <>
                              <td className="py-2 px-2 text-right"></td>
                              <td className="py-2 px-2 text-right">
                                <span className="font-bold text-green-600">
                                  {formatCurrency(entry.amount)}
                                </span>
                              </td>
                            </>
                          )
                        ) : (
                          <>
                            <td className="py-2 px-2 text-right"></td>
                            <td className="py-2 px-2 text-right"></td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td className="py-2 px-2">Total</td>
                      <td className="py-2 px-2 text-center"></td>
                      <td className="py-2 px-2 text-right text-red-700">
                        {formatCurrency(calculateJournalTotal("debit"))}
                      </td>
                      <td className="py-2 px-2 text-right text-green-700">
                        {formatCurrency(calculateJournalTotal("credit"))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Payment Voucher Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm shadow-purple-200 mr-3">
                  <Banknote className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">Payment Voucher</h2>
                {existingTransactions.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Saved
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">
                        Particulars
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-gray-700">
                        &nbsp;
                      </th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">
                        Debit
                      </th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentEntries.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-2">
                          <div className="font-medium text-gray-900">
                            {entry.account}
                          </div>
                          {entry.description && (
                            <div className="text-gray-500 mt-0.5 text-xs">
                              {entry.description}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {entry.mode == "S" && (
                            <span className="text-gray-600 italic">
                              {formatCurrency(entry.amount)}
                            </span>
                          )}
                        </td>
                        {entry.mode == "G" && entry.showInTotal ? (
                          entry.type == "debit" ? (
                            <>
                              <td className="py-2 px-2 text-right">
                                <span className="font-bold text-red-600">
                                  {formatCurrency(entry.amount)}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-right"></td>
                            </>
                          ) : (
                            <>
                              <td className="py-2 px-2 text-right"></td>
                              <td className="py-2 px-2 text-right">
                                <span className="font-bold text-green-600">
                                  {formatCurrency(entry.amount)}
                                </span>
                              </td>
                            </>
                          )
                        ) : (
                          <>
                            <td className="py-2 px-2 text-right"></td>
                            <td className="py-2 px-2 text-right"></td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>
                      <td className="py-2 px-2">Total</td>
                      <td className="py-2 px-2 text-center"></td>
                      <td className="py-2 px-2 text-right text-red-700">
                        {formatCurrency(calculatePaymentTotal("debit"))}
                      </td>
                      <td className="py-2 px-2 text-right text-green-700">
                        {formatCurrency(calculatePaymentTotal("credit"))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Narration */}
              {narration && (
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description / Narration
                  </label>
                  <div className="text-sm text-gray-600">{narration}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Query Modal */}
      {queryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Raise Query for Clarification
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Please provide details of your query
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query Details *
                </label>
                <textarea
                  value={queryRemark}
                  onChange={(e) => setQueryRemark(e.target.value)}
                  placeholder="Enter your query details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeQueryModal}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRaiseQuery}
                  disabled={isUpdating || !queryRemark.trim()}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Raise Query
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Content (Hidden) */}
      <div id="printable-voucher" className="hidden">
        <div className="p-8">
          {/* Government Header */}
          <div className="text-center border-b-4 border-blue-900 pb-4 mb-8">
            <div className="bg-blue-900 text-white py-4 mb-4">
              <h1 className="text-3xl font-bold">
                Ambaji Temple
              </h1>
              <h2 className="text-2xl font-semibold mt-2">PAYMENT VOUCHER</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 text-left">
              <div>
                <p>
                  <strong>Voucher No:</strong> {voucher.PV_No}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(voucher.PV_Chln_Date)}
                </p>
                <p>
                  <strong>PV Type:</strong> {voucher.PV_Ty || "VEND"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {voucher.Status?.toUpperCase() || "DRAFT"}
                </p>
              </div>
              <div>
                <p>
                  <strong>Department:</strong>{" "}
                  {voucher.department?.Dpt_Desc || "N/A"}
                </p>
                <p>
                  <strong>Ledger:</strong>{" "}
                  {voucher.ledger
                    ? `${voucher.ledger.Lg_Code} - ${voucher.ledger.Lg_Name}`
                    : `ID: ${voucher.Lg_Id}`}
                </p>
                <p>
                  <strong>Vendor:</strong>{" "}
                  {voucher.sub_ledger
                    ? `${voucher.sub_ledger.SL_Name} (${voucher.sub_ledger.SL_Code})`
                    : `ID: ${voucher.SL_Id}`}
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Details */}
          {voucher.sub_ledger && (
            <div className="mb-8">
              <h3 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">
                VENDOR DETAILS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Vendor Name:</strong> {voucher.sub_ledger.SL_Name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Work Description */}
          {voucher.work_allocation?.tender && (
            <div className="mb-8">
              <h3 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">
                WORK DESCRIPTION
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Work Allocation ID:</strong>{" "}
                    {voucher.work_allocation.WA_Id}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {voucher.work_allocation.tender.Description}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Tender Type:</strong>{" "}
                    {voucher.work_allocation.tender.tendertype?.TnT_Name ||
                      "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">
              AMOUNT DETAILS
            </h3>
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 p-3 text-left">
                    Sr No.
                  </th>
                  <th className="border border-gray-400 p-3 text-left">
                    Description
                  </th>
                  <th className="border border-gray-400 p-3 text-right">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-3 text-center">-</td>
                  <td className="border border-gray-400 p-3 font-semibold">
                    Bill Amount
                  </td>
                  <td className="border border-gray-400 p-3 text-right font-semibold">
                    {formatCurrency(totals.grossAmount)}
                  </td>
                </tr>

                {/* Tax Breakdown */}
                {totals.taxBreakdown.map((tax, index) => (
                  <tr key={`print-tax-${index}`}>
                    <td className="border border-gray-400 p-3 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-400 p-3">
                      <div className="font-medium">
                        {tax.invoice_charge?.IC_Name || "Tax"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {tax.isAdd ? "Addition" : "Deduction"}
                      </div>
                    </td>
                    <td
                      className={`border border-gray-400 p-3 text-right font-medium ${
                        tax.isAdd ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tax.isAdd ? "+" : "-"}
                      {formatCurrency(tax.calculated_amount)}
                    </td>
                  </tr>
                ))}

                {/* Penalty Breakdown */}
                {totals.penaltyBreakdown.map((penalty, index) => (
                  <tr key={`print-penalty-${index}`}>
                    <td className="border border-gray-400 p-3 text-center">
                      {totals.taxBreakdown.length + index + 1}
                    </td>
                    <td className="border border-gray-400 p-3">
                      <div className="font-medium">
                        {penalty.ledger?.Lg_Name || "Penalty"}
                        {" "}(Penalty)
                        {penalty.tax_percentage > 0 && String(penalty.formula || "").trim() != "*"
                          ? ` (${penalty.tax_percentage}%)`
                          : ""}
                      </div>
                      <div className="text-xs text-gray-600">
                        {penalty.isAdd ? "Addition" : "Deduction"}
                      </div>
                    </td>
                    <td
                      className={`border border-gray-400 p-3 text-right font-medium ${
                        penalty.isAdd ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {penalty.isAdd ? "+" : "-"}
                      {formatCurrency(penalty.calculated_amount)}
                    </td>
                  </tr>
                ))}

                <tr className="bg-gray-50">
                  <td
                    className="border border-gray-400 p-3 text-center"
                    colSpan="2"
                  >
                    <span className="font-semibold">Total Additions</span>
                  </td>
                  <td className="border border-gray-400 p-3 text-right font-semibold text-green-600">
                    +{formatCurrency(totals.addAmount)}
                  </td>
                </tr>

                <tr className="bg-gray-50">
                  <td
                    className="border border-gray-400 p-3 text-center"
                    colSpan="2"
                  >
                    <span className="font-semibold">Total Deductions</span>
                  </td>
                  <td className="border border-gray-400 p-3 text-right font-semibold text-red-600">
                    -{formatCurrency(totals.lessAmount)}
                  </td>
                </tr>

                <tr className="bg-blue-100">
                  <td
                    className="border border-gray-400 p-3 text-center"
                    colSpan="2"
                  >
                    <span className="font-bold text-lg">
                      NET PAYABLE AMOUNT
                    </span>
                  </td>
                  <td className="border border-gray-400 p-3 text-right font-bold text-lg text-blue-700">
                    {formatCurrency(totals.netAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Authorization Section */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-4 mt-16"></div>
              <p className="font-bold mt-2">Prepared By</p>
              <p className="text-sm text-gray-600">Finance Department</p>
            </div>

            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-4 mt-16"></div>
              <p className="font-bold mt-2">Checked By</p>
              <p className="text-sm text-gray-600">Accounts Officer</p>
            </div>

            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-4 mt-16"></div>
              <p className="font-bold mt-2">Authorized Signatory</p>
              <p className="text-sm text-gray-600">Chief Financial Officer</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t-2 border-gray-300 text-center text-sm text-gray-600">
            <p>
              Generated on: {new Date().toLocaleDateString("en-IN")} | System
              Generated Document
            </p>
            <p className="mt-1">
              This is a computer generated voucher and does not require physical
              signature
            </p>
          </div>
        </div>
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ViewAccountVerification;
