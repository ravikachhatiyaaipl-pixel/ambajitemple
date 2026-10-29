import { useState, useEffect, useRef } from "react";
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
  BookOpen,
  Briefcase,
  Copy,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
  Hash,
  Save,
  ChevronDown,
  Search,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { BillChallanEntryApi } from "../../../services/billchallanentryapi";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ViewPaymentExecution = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [paymentEntries, setPaymentEntries] = useState([]);
  const [narration, setNarration] = useState("");
  const [existingTransactions, setExistingTransactions] = useState([]);
  const [checkingTransactions, setCheckingTransactions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [genVoucherConfig, setGenVoucherConfig] = useState(null);
  const [accVouNo, setAccVouNo] = useState("");

  // Bank and Ledger accounts
  const [bankAccounts, setBankAccounts] = useState([]);
  const [filteredBankAccounts, setFilteredBankAccounts] = useState([]);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [bankSearchTerm, setBankSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Refs for keyboard navigation
  const bankButtonRef = useRef(null);
  const bankSearchRef = useRef(null);
  const bankListRef = useRef(null);
  const bankItemRefs = useRef([]);
  const narrationRef = useRef(null);
  const processButtonRef = useRef(null);
  const printButtonRef = useRef(null);
  const backButtonRef = useRef(null);

  const [organisationData, setOrganisationData] = useState([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState(() =>
    JSON.parse(localStorage.getItem("selectedOrganisation")),
  );

  useEffect(() => {
    loadVoucherData();
    loadOrganisationData();
    loadGenVoucherConfig();
  }, [id]);

  // Filter bank accounts based on search
  useEffect(() => {
    if (bankSearchTerm.trim() == "") {
      setFilteredBankAccounts(bankAccounts);
    } else {
      const searchTerm = bankSearchTerm.toLowerCase();
      const filtered = bankAccounts.filter(
        (account) =>
          account.Lg_Name.toLowerCase().includes(searchTerm) ||
          (account.Lg_Eng_Name &&
            account.Lg_Eng_Name.toLowerCase().includes(searchTerm)) ||
          (account.Lg_Code &&
            account.Lg_Code.toLowerCase().includes(searchTerm)),
      );
      setFilteredBankAccounts(filtered);
    }
  }, [bankSearchTerm, bankAccounts]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBankDropdown) {
        const dropdown = document.querySelector(".bank-dropdown-container");
        if (dropdown && !dropdown.contains(event.target)) {
          setShowBankDropdown(false);
          setBankSearchTerm("");
          setHighlightedIndex(-1);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBankDropdown]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showBankDropdown && bankSearchRef.current) {
      setTimeout(() => {
        bankSearchRef.current.focus();
      }, 0);
    }
  }, [showBankDropdown]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (showBankDropdown && highlightedIndex >= 0 && bankListRef.current) {
      const container = bankListRef.current;
      const item = bankItemRefs.current[highlightedIndex];
      if (item) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [highlightedIndex, showBankDropdown]);

  // Focus on appropriate field after loading
  useEffect(() => {
    if (
      !loading &&
      !checkingTransactions &&
      showActionButtons &&
      existingTransactions.length == 0
    ) {
      setTimeout(() => {
        if (selectedBankAccount) {
          narrationRef.current?.focus();
        } else {
          bankButtonRef.current?.focus();
        }
      }, 100);
    }
  }, [
    loading,
    checkingTransactions,
    showActionButtons,
    existingTransactions.length,
    selectedBankAccount,
  ]);

  // Add this useEffect to regenerate payment entries when selectedBankAccount changes
  useEffect(() => {
    if (voucher) {
      generatePaymentEntries(voucher);
    }
  }, [selectedBankAccount, voucher]);

  const loadGenVoucherConfig = async () => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const menuItem = menuDetails.find(
        (m) => m.Menu_Links == "/transactions/vendor-payments/payment-execution"
      );
      console.log("menuItem",menuItem);
      
      const gvnNo = menuItem?.gvn_no ?? menuItem?.gen_voucher_no?.gvn_no;
      if (!gvnNo) return;

      const res = await axios.get(`${API_BASE_URL}/gen-voucher/${gvnNo}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}` },
      });
      if (res.data.success && res.data.data) {
        const config = res.data.data;
        setGenVoucherConfig(config);

        if (config && config.Is_Active == "Y") {
          const counterRes = await axios.get(
            `${API_BASE_URL}/pay-voucher/acc-vou/no`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}` } }
          );
          if (counterRes.data.success && counterRes.data.acc_vou_no != null) {
            const serial = String(counterRes.data.acc_vou_no);
            const segs   = [];
            if (config.prifix) segs.push({ v: config.prifix, sep: config.prifix_dev_type || config.dev_type || "/" });
            if (config.Text)   segs.push({ v: config.Text,   sep: config.text_dev_type   || config.dev_type || "/" });
            segs.push(          { v: serial,                  sep: config.no_dev_type     || config.dev_type || "/" });
            if (config.FY == "Y") {
              try {
                const fyRes = await axios.get(`${API_BASE_URL}/fy-master`, { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}` } });
                const currentFY = fyRes.data?.data?.find((f) => f.is_current_year) || fyRes.data?.data?.[0];
                if (currentFY?.FY_Code) segs.push({ v: currentFY.FY_Code, sep: null });
              } catch { segs.push({ v: "2025-26", sep: null }); }
            }
            setAccVouNo(segs.map((s, i) => (i < segs.length - 1 ? s.v + s.sep : s.v)).join(""));
          }
        }
      }
    } catch (e) {
      console.error("Failed to load gen voucher config:", e);
    }
  };

  const loadOrganisationData = async () => {
    try {
      const [organisationResponse, ledgersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/lst-org-master`,{headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`
    }}),
        axios.get(`${API_BASE_URL}/ledgers/all/data`,{headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`
    }})
      ]);

      // Set organisation data
      if (organisationResponse.data.success) {
        setOrganisationData(organisationResponse.data.data);
        if (
          !selectedOrganisation &&
          organisationResponse.data.data.length > 0
        ) {
          const org = organisationResponse.data.data[0];
          const newOrg = {
            id: org.Org_Id,
            name: org.Org_Name,
            code: org.Org_Code,
          };
          setSelectedOrganisation(newOrg);
          localStorage.setItem("selectedOrganisation", JSON.stringify(newOrg));
        }
      }

      // Get current organisation ID
      const currentOrgId =
        selectedOrganisation?.id ||
        (organisationResponse.data.success &&
          organisationResponse.data.data[0]?.Org_Id);

      // Filter bank accounts (Gr_Buk ==  "Y")
      const allLedgers = ledgersResponse.data.success
        ? ledgersResponse.data.data
        : [];

      const bankAccounts = allLedgers.filter((ledger) => {
        return ledger.ledger_group?.Gr_Buk == "Y";
      });

      // Map ledger data with all required fields
      const mappedBankAccounts = bankAccounts.map((ledger) => ({
        Lg_Id: ledger.Lg_Id,
        Lg_Name: ledger.Lg_Name,
        Lg_Eng_Name: ledger.Lg_Eng_Name,
        Lg_Code: ledger.Lg_Code || `L${ledger.Lg_Id}`,
        Gr_Id: ledger.Gr_Id,
        Org_Id: currentOrgId,
        ledger_group: ledger.ledger_group,
      }));

      setBankAccounts(mappedBankAccounts);
      setFilteredBankAccounts(mappedBankAccounts);
    } catch (err) {
      console.error("Error loading organisation data:", err);
      toast.error("Failed to load bank accounts");
    }
  };

  const loadVoucherData = async () => {
    setLoading(true);
    try {
      const response = await BillChallanEntryApi.getById(id);
      if (response.success && response.data) {
        const voucherData = response.data;
        setVoucher(voucherData);
        setNarration(voucherData.Remarks || "");

        // Show action buttons for accounts approved status only
        setShowActionButtons(voucherData?.Status?.toLowerCase() == "acco_app");

        // Check for existing transactions
        if (voucherData.PV_No) {
          await checkExistingTransactions(voucherData.PV_No, voucherData);
        } else {
          setCheckingTransactions(false);
          // Generate default journal and payment entries
          generateJournalEntries(voucherData);
          generatePaymentEntries(voucherData);
        }
      } else {
        toast.error("Failed to load payment voucher details");
        navigate("/transactions/vendor-payments/payment-execution");
      }
    } catch (error) {
      toast.error("Failed to load payment voucher details");
      console.error(error);
      navigate("/transactions/vendor-payments/payment-execution");
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

          // Process transactions to create journal and payment entries
          processTransactions(transactions, voucherData);
        } else {
          // No existing transactions, generate default entries
          generateJournalEntries(voucherData);
          generatePaymentEntries(voucherData);
        }
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

  const processTransactions = (transactions, voucherData) => {
    // Separate by voucher type
    const paymentTransactions = transactions.filter((t) => t.Vou_Ty == "PAY");

    // ====  ONLY EXTRACT BANK ACCOUNT FROM EXISTING TRANSACTIONS =====
    // Find bank transaction (credit side) in payment transactions
    const bankTransaction = paymentTransactions.find(
      (t) => t.Cr_Amt && parseFloat(t.Cr_Amt) > 0 && t.V_Mode == "G",
    );

    // Set selected bank account if found in existing transactions
    if (bankTransaction) {
      // Create bank account object directly from the transaction data
      const bankAccount = {
        Lg_Id: bankTransaction.Lg_Id,
        Lg_Name: bankTransaction.ledger?.Lg_Name || "Bank Account",
        Lg_Code: bankTransaction.ledger?.Lg_Code || "",
        Lg_Eng_Name: bankTransaction.ledger?.Lg_Eng_Name || "",
      };

      setSelectedBankAccount(bankAccount);
      console.log(
        "Bank account loaded from existing transactions:",
        bankAccount,
      );
    } else {
      // No bank transaction found, clear selected bank account
      setSelectedBankAccount(null);
    }

    // ====  ALL OTHER DATA COMES FROM VOUCHER, NOT FROM TRANSACTIONS =====
    // Generate journal entries from voucher data
    generateJournalEntries(voucherData);

    // Generate payment entries from voucher data (will use selectedBankAccount if set)
    generatePaymentEntries(voucherData);

    // Set existing transactions count (for UI)
    setExistingTransactions(transactions);
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
        account: voucherData.sub_ledger?.SL_Name
          ? "Net Payable A/c"
          : "Net Payable A/c",
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

    // G mode transactions (affect totals)
    entries.push({
      account: selectedBankAccount
        ? `${selectedBankAccount.Lg_Name} (${selectedBankAccount.Lg_Code})`
        : "Select Bank Account",
      type: "credit",
      amount: netAmount,
      description: "Payment from bank account",
      ledgerId: selectedBankAccount?.Lg_Id || null,
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

  const formatAmount = (amount) => {
    const num = parseFloat(amount) || 0;
    return num.toFixed(2);
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
        icon: CheckCircle,
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

  // Bank dropdown keyboard handlers
  const handleBankButtonKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setShowBankDropdown(true);
      setBankSearchTerm("");
      setHighlightedIndex(-1);
      setTimeout(() => bankSearchRef.current?.focus(), 0);
    }
  };

  const handleBankSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredBankAccounts.length > 0) {
        setHighlightedIndex(0);
        setTimeout(() => {
          if (bankItemRefs.current[0]) {
            bankItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      // Stay in search
    } else if (e.key == "Escape") {
      e.preventDefault();
      setShowBankDropdown(false);
      setBankSearchTerm("");
      setHighlightedIndex(-1);
      bankButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredBankAccounts.length > 0 && highlightedIndex >= 0) {
        handleBankAccountSelect(filteredBankAccounts[highlightedIndex]);
      } else if (filteredBankAccounts.length > 0) {
        handleBankAccountSelect(filteredBankAccounts[0]);
      }
    } else if (e.key == "Tab") {
      // Close dropdown on Tab
      setShowBankDropdown(false);
      setBankSearchTerm("");
      setHighlightedIndex(-1);
    }
  };

  const handleBankItemKeyDown = (e, account, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredBankAccounts.length) {
        setHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (bankItemRefs.current[nextIndex]) {
            bankItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        // Wrap to search
        setHighlightedIndex(-1);
        setTimeout(() => bankSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedIndex(-1);
        setTimeout(() => bankSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (bankItemRefs.current[prevIndex]) {
            bankItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleBankAccountSelect(account);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setShowBankDropdown(false);
      setBankSearchTerm("");
      setHighlightedIndex(-1);
      bankButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      // Close dropdown on Tab
      setShowBankDropdown(false);
      setBankSearchTerm("");
      setHighlightedIndex(-1);
    }
  };

  const handleBankAccountSelect = (account) => {
    setSelectedBankAccount(account);
    setShowBankDropdown(false);
    setBankSearchTerm("");
    setHighlightedIndex(-1);

    // Update payment entries with selected bank account
    const updatedEntries = [...paymentEntries];
    const bankEntryIndex = updatedEntries.findIndex(
      (entry) => entry.isBankEntry,
    );

    if (bankEntryIndex != -1) {
      updatedEntries[bankEntryIndex] = {
        ...updatedEntries[bankEntryIndex],
        account: `${account.Lg_Name} (${account.Lg_Code})`,
        ledgerId: account.Lg_Id,
      };
      setPaymentEntries(updatedEntries);
    }

    toast.success(`Bank account selected: ${account.Lg_Name}`);

    // Focus on narration after selection
    setTimeout(() => narrationRef.current?.focus(), 100);
  };

  // General keyboard navigation for Enter key
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Generate next voucher ID for PAY type
  const generateNextVoucherId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finan-trns/all`,{
        headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`
    }
      });

      const transactions = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      // Filter PAY transactions
      const payTransactions = transactions.filter((t) => t.Vou_Ty == "PAY");

      if (payTransactions.length == 0) {
        return 1;
      }

      const voucherIds = payTransactions.map((t) => {
        const id = parseInt(t.Vou_Id);
        return isNaN(id) ? 0 : id;
      });

      const uniqueVoucherIds = [...new Set(voucherIds)];
      const maxVoucherId = Math.max(...uniqueVoucherIds);
      const nextVoucherId = maxVoucherId + 1;

      return nextVoucherId;
    } catch (err) {
      console.error(
        "Error fetching transactions for voucher ID generation:",
        err,
      );
      return Math.floor(Math.random() * 9000) + 1000;
    }
  };

  // Generate next voucher ID for JOU type
  const generateNextJournalId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finan-trns/all`,{
         headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`
    }
      });

      const transactions = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      // Filter JOU transactions
      const jouTransactions = transactions.filter((t) => t.Vou_Ty == "JOU");

      if (jouTransactions.length == 0) {
        return 1;
      }

      const voucherIds = jouTransactions.map((t) => {
        const id = parseInt(t.Vou_Id);
        return isNaN(id) ? 0 : id;
      });

      const uniqueVoucherIds = [...new Set(voucherIds)];
      const maxVoucherId = Math.max(...uniqueVoucherIds);
      const nextVoucherId = maxVoucherId + 1;

      return nextVoucherId;
    } catch (err) {
      console.error(
        "Error fetching transactions for journal ID generation:",
        err,
      );
      return Math.floor(Math.random() * 9000) + 1000;
    }
  };

  const handleSave = async () => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Confirm Payment Execution",
      text: "Are you sure you want to process this payment? This will create journal and payment entries and mark the voucher as paid.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Process Payment",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    // Validate bank account selection
    if (!selectedBankAccount) {
      toast.error("Please select a bank account first");
      return;
    }

    if (!selectedOrganisation?.id) {
      toast.error("Please select an organisation first");
      return;
    }

    if (!voucher?.ledger?.Lg_Id) {
      toast.error("Vendor ledger ID not found");
      return;
    }

    if (!voucher?.sub_ledger?.Lg_Id) {
      toast.error("Sub-ledger ID not found");
      return;
    }

    setIsSaving(true);
    try {
      // First, fetch sub-ledgers if needed
      let subLedgersData = [];
      try {
        const subLedgersResponse = await axios.get(
          `${API_BASE_URL}/sub-ledgers/all`,
          {
             headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`
    }
          }
        );
        if (subLedgersResponse.data.success) {
          subLedgersData = subLedgersResponse.data.data;
          console.log("Sub-ledgers loaded:", subLedgersData.length);
        }
      } catch (error) {
        console.error("Error fetching sub-ledgers:", error);
        // Continue even if sub-ledgers fetch fails
      }

      // Generate voucher IDs
      const paymentVoucherId = await generateNextVoucherId();
      const journalVoucherId = await generateNextJournalId();

      const netAmount = totals.netAmount;
      const grossAmount = totals.grossAmount;
      const vendorLedgerId = voucher.ledger.Lg_Id; // 11
      const netPayableLedgerId = voucher.sub_ledger.Lg_Id; // 11 (same as vendor in this case)
      const subLedgerId = voucher.sub_ledger?.SL_Id; // 5
      const bankLedgerId = selectedBankAccount.Lg_Id; // 14

      // ===========  JOURNAL VOUCHER ENTRIES ============
      const journalTransactions = [];
      let journalCounter = 1;

      // Process tax and penalty items from pay_details
      if (voucher?.pay_details && Array.isArray(voucher.pay_details)) {
        voucher.pay_details.forEach((detail) => {
          const isAdd = parseInt(detail.Add_Dedu) == 1;
          const amount = parseFloat(detail.IC_Amt || 0);
          const isTax = detail.PD_Ty == "TAX";

          // Determine which ledger ID to use
          let ledgerId = null;
          let ledgerDetails = null;

          if (!isTax) {
            // For penalties (PENLTY), use the penalty's own ledger ID
            ledgerId = detail.ledger?.Lg_Id || vendorLedgerId;
            ledgerDetails = detail.ledger || voucher.ledger;

            // Directly create G-mode entry for penalty
            if (amount > 0 && ledgerId) {
              journalTransactions.push({
                Org_Id: selectedOrganisation.id,
                Lg_Id: ledgerId,
                Ref_Id: vendorLedgerId,
                Vou_Ty: "JOU",
                Vou_Id: journalVoucherId.toString(),
                Vou_Sr: journalCounter.toString(),
                Vou_Ln: journalCounter.toString(),
                V_Mode: "G",
                Vou_Dt: voucher.PV_Chln_Date,
                Dr_Amt: isAdd ? formatAmount(amount) : null,
                Cr_Amt: !isAdd ? formatAmount(amount) : null,
                rmk1: narration || voucher.Remarks || "",
                Vou_Rf: voucher.PV_No,
              });
              journalCounter++;
            }
          } else {
            // For taxes, use the ledger from invoice_charge if available
            ledgerId =
              detail.ledger?.Lg_Id ||
              detail.invoice_charge?.Lg_Id ||
              vendorLedgerId;
            ledgerDetails = detail.ledger || detail.invoice_charge;

            if (amount > 0 && ledgerId) {
              // Check if this tax ledger has sub-ledgers
              const hasSubLedgers = ledgerDetails?.Lg_Sub == "yes";

              if (hasSubLedgers && subLedgersData.length > 0) {
                // Find sub-ledgers for this ledger
                const relevantSubLedgers = subLedgersData.filter((sl) => {
                  const lgIds = Array.isArray(sl.Lg_Id) ? sl.Lg_Id : [sl.Lg_Id];
                  return lgIds.some((id) => parseInt(id) == parseInt(ledgerId));
                });

                if (relevantSubLedgers.length > 0) {
                  // Create S-mode entries for each sub-ledger
                  relevantSubLedgers.forEach((subLedger, idx) => {
                    // Distribute amount among sub-ledgers (for now, equally)
                    const subAmount = amount / relevantSubLedgers.length;

                    journalTransactions.push({
                      Org_Id: selectedOrganisation.id,
                      Lg_Id: ledgerId,
                      Ref_Id: vendorLedgerId,
                      Vou_Ty: "JOU",
                      Vou_Id: journalVoucherId.toString(),
                      Vou_Sr: journalCounter.toString(),
                      Vou_Ln: journalCounter.toString(),
                      V_Mode: "S",
                      Vou_Dt: voucher.PV_Chln_Date,
                      Dr_Amt: isAdd ? formatAmount(subAmount) : null,
                      Cr_Amt: !isAdd ? formatAmount(subAmount) : null,
                      rmk1: narration || voucher.Remarks || "",
                      Vou_Rf: voucher.PV_No,
                      SL_Id: String(subLedger.SL_Id),
                      SL_Amt: formatAmount(subAmount),
                    });
                    journalCounter++;
                  });

                  // Also create a G-mode entry for the parent
                  journalTransactions.push({
                    Org_Id: selectedOrganisation.id,
                    Lg_Id: ledgerId,
                    Ref_Id: vendorLedgerId,
                    Vou_Ty: "JOU",
                    Vou_Id: journalVoucherId.toString(),
                    Vou_Sr: journalCounter.toString(),
                    Vou_Ln: journalCounter.toString(),
                    V_Mode: "G",
                    Vou_Dt: voucher.PV_Chln_Date,
                    Dr_Amt: isAdd ? formatAmount(amount) : null,
                    Cr_Amt: !isAdd ? formatAmount(amount) : null,
                    rmk1: narration || voucher.Remarks || "",
                    Vou_Rf: voucher.PV_No,
                  });
                  journalCounter++;
                } else {
                  // No sub-ledgers found, just create G-mode entry
                  journalTransactions.push({
                    Org_Id: selectedOrganisation.id,
                    Lg_Id: ledgerId,
                    Ref_Id: vendorLedgerId,
                    Vou_Ty: "JOU",
                    Vou_Id: journalVoucherId.toString(),
                    Vou_Sr: journalCounter.toString(),
                    Vou_Ln: journalCounter.toString(),
                    V_Mode: "G",
                    Vou_Dt: voucher.PV_Chln_Date,
                    Dr_Amt: isAdd ? formatAmount(amount) : null,
                    Cr_Amt: !isAdd ? formatAmount(amount) : null,
                    rmk1: narration || voucher.Remarks || "",
                    Vou_Rf: voucher.PV_No,
                  });
                  journalCounter++;
                }
              } else {
                // No sub-ledgers, just create G-mode entry
                journalTransactions.push({
                  Org_Id: selectedOrganisation.id,
                  Lg_Id: ledgerId,
                  Ref_Id: vendorLedgerId,
                  Vou_Ty: "JOU",
                  Vou_Id: journalVoucherId.toString(),
                  Vou_Sr: journalCounter.toString(),
                  Vou_Ln: journalCounter.toString(),
                  V_Mode: "G",
                  Vou_Dt: voucher.PV_Chln_Date,
                  Dr_Amt: isAdd ? formatAmount(amount) : null,
                  Cr_Amt: !isAdd ? formatAmount(amount) : null,
                  rmk1: narration || voucher.Remarks || "",
                  Vou_Rf: voucher.PV_No,
                });
                journalCounter++;
              }
            }
          }
        });
      }

      // Add vendor debit entry
      journalTransactions.push({
        Org_Id: selectedOrganisation.id,
        Lg_Id: vendorLedgerId,
        Ref_Id: vendorLedgerId,
        Vou_Ty: "JOU",
        Vou_Id: journalVoucherId.toString(),
        Vou_Sr: journalCounter.toString(),
        Vou_Ln: journalCounter.toString(),
        V_Mode: "G",
        Vou_Dt: voucher.PV_Chln_Date,
        Dr_Amt: formatAmount(grossAmount),
        Cr_Amt: null,
        rmk1: narration || voucher.Remarks || "",
        Vou_Rf: voucher.PV_No,
      });
      journalCounter++;

      // Add net payable credit entry
      journalTransactions.push({
        Org_Id: selectedOrganisation.id,
        Lg_Id: netPayableLedgerId,
        Ref_Id: vendorLedgerId,
        Vou_Ty: "JOU",
        Vou_Id: journalVoucherId.toString(),
        Vou_Sr: journalCounter.toString(),
        Vou_Ln: journalCounter.toString(),
        V_Mode: "G",
        Vou_Dt: voucher.PV_Chln_Date,
        Dr_Amt: null,
        Cr_Amt: formatAmount(netAmount),
        rmk1: narration || voucher.Remarks || "",
        Vou_Rf: voucher.PV_No,
      });
      journalCounter++;

      // Add S mode transaction for vendor name (if exists)
      if (subLedgerId) {
        journalTransactions.push({
          Org_Id: selectedOrganisation.id,
          Lg_Id: netPayableLedgerId,
          Ref_Id: vendorLedgerId,
          Vou_Ty: "JOU",
          Vou_Id: journalVoucherId.toString(),
          Vou_Sr: journalCounter.toString(),
          Vou_Ln: journalCounter.toString(),
          V_Mode: "S",
          Vou_Dt: voucher.PV_Chln_Date,
          Dr_Amt: null,
          Cr_Amt: formatAmount(netAmount),
          rmk1: narration || voucher.Remarks || "",
          Vou_Rf: voucher.PV_No,
          SL_Id: String(subLedgerId),
          SL_Amt: formatAmount(netAmount),
        });
        journalCounter++;
      }

      // Save all journal transactions
      for (const transaction of journalTransactions) {
        const cleanTransaction = {
          ...transaction,
          Lg_Id: Array.isArray(transaction.Lg_Id)
            ? transaction.Lg_Id[0]
            : transaction.Lg_Id,
          Ref_Id: Array.isArray(transaction.Ref_Id)
            ? transaction.Ref_Id[0]
            : transaction.Ref_Id,
        };

        Object.keys(cleanTransaction).forEach((key) => {
          if (
            cleanTransaction[key] == undefined ||
            cleanTransaction[key] == null
          ) {
            delete cleanTransaction[key];
          }
        });

        await axios.post(`${API_BASE_URL}/finan-trns`, cleanTransaction,{
             headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`
    }
        });
      }

      // ===========  PAYMENT VOUCHER ENTRIES ============
      const paymentTransactions = [];
      let paymentCounter = 1;

      // Add bank credit entry
      paymentTransactions.push({
        Org_Id: selectedOrganisation.id,
        Lg_Id: bankLedgerId,
        Ref_Id: netPayableLedgerId,
        Vou_Ty: "PAY",
        Vou_Id: paymentVoucherId.toString(),
        Vou_Sr: paymentCounter.toString(),
        Vou_Ln: paymentCounter.toString(),
        V_Mode: "G",
        Vou_Dt: voucher.PV_Chln_Date,
        Dr_Amt: null,
        Cr_Amt: formatAmount(netAmount),
        rmk1: narration || voucher.Remarks || "",
        Vou_Rf: voucher.PV_No,
      });
      paymentCounter++;

      // Add net payable debit entry
      paymentTransactions.push({
        Org_Id: selectedOrganisation.id,
        Lg_Id: netPayableLedgerId,
        Ref_Id: bankLedgerId,
        Vou_Ty: "PAY",
        Vou_Id: paymentVoucherId.toString(),
        Vou_Sr: paymentCounter.toString(),
        Vou_Ln: paymentCounter.toString(),
        V_Mode: "G",
        Vou_Dt: voucher.PV_Chln_Date,
        Dr_Amt: formatAmount(netAmount),
        Cr_Amt: null,
        rmk1: narration || voucher.Remarks || "",
        Vou_Rf: voucher.PV_No,
      });
      paymentCounter++;

      // Add S mode transaction for vendor name
      if (subLedgerId) {
        paymentTransactions.push({
          Org_Id: selectedOrganisation.id,
          Lg_Id: netPayableLedgerId,
          Ref_Id: bankLedgerId,
          Vou_Ty: "PAY",
          Vou_Id: paymentVoucherId.toString(),
          Vou_Sr: paymentCounter.toString(),
          Vou_Ln: paymentCounter.toString(),
          V_Mode: "S",
          Vou_Dt: voucher.PV_Chln_Date,
          Dr_Amt: formatAmount(netAmount),
          Cr_Amt: null,
          rmk1: narration || voucher.Remarks || "",
          Vou_Rf: voucher.PV_No,
          SL_Id: String(subLedgerId),
          SL_Amt: formatAmount(netAmount),
        });
        paymentCounter++;
      }

      // Save all payment transactions
      for (const transaction of paymentTransactions) {
        const cleanTransaction = {
          ...transaction,
          Lg_Id: Array.isArray(transaction.Lg_Id)
            ? transaction.Lg_Id[0]
            : transaction.Lg_Id,
          Ref_Id: Array.isArray(transaction.Ref_Id)
            ? transaction.Ref_Id[0]
            : transaction.Ref_Id,
        };

        Object.keys(cleanTransaction).forEach((key) => {
          if (
            cleanTransaction[key] == undefined ||
            cleanTransaction[key] == null
          ) {
            delete cleanTransaction[key];
          }
        });

        await axios.post(`${API_BASE_URL}/finan-trns`, cleanTransaction,{
              headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`
      }
        });
      }

      // Update voucher status to paid with Acc_Vou_No
      await axios.put(`${API_BASE_URL}/pay-voucher/${id}/status`, {
        Status: "paid",
        ...(accVouNo ? { Acc_Vou_No: accVouNo } : {}),
      },     {  headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`
      }}
    
    );

      toast.success("Payment processed successfully!");

      // Refresh data
      await loadVoucherData();
      setShowActionButtons(false);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setIsSaving(false);
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
              navigate("/transactions/vendor-payments/payment-execution")
            }
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment Execution
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
            ref={backButtonRef}
            onClick={() =>
              navigate("/transactions/vendor-payments/payment-execution")
            }
            onKeyDown={(e) => handleEnterKey(e, printButtonRef)}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment Execution
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Voucher No:{" "}
              <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">
                {voucher.PV_No}
              </span>
              <button
                onClick={() => copyToClipboard(voucher.PV_No)}
                className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                title="Copy voucher number"
              >
                <Copy className="h-3 w-3" />
              </button>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            ref={printButtonRef}
            onClick={handlePrint}
            onKeyDown={(e) => handleEnterKey(e, backButtonRef)}
            disabled={isPrinting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm disabled:opacity-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                      {voucher.Acc_Vou_No && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500 mr-2">Account Voucher No:</span>
                          <span className="text-sm font-mono font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                            {voucher.Acc_Vou_No}
                          </span>
                        </div>
                      )}
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

              {/* Accounts Approval Info - if available */}
              {voucher.Acct_Approved && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-blue-500 mr-2" />
                    <div className="text-xs">
                      <div className="font-medium text-blue-700">
                        Accounts Approved
                      </div>
                      <div className="text-gray-600">
                        By: {voucher.Acct_Officer || "Accounts"} | Date:{" "}
                        {formatDate(voucher.Acct_Approved)}
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
          {voucher.Remarks && voucher.Status?.toLowerCase() != "cancelled" && (
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
              {/* Bank Account Selection - Only show if no transactions exist */}
              {existingTransactions.length == 0 && showActionButtons && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Select Bank Account *
                  </label>
                  <div className="relative bank-dropdown-container">
                    <button
                      ref={bankButtonRef}
                      type="button"
                      onClick={() => setShowBankDropdown(!showBankDropdown)}
                      onKeyDown={handleBankButtonKeyDown}
                      className="w-full border border-gray-300 rounded px-3 py-2.5 flex justify-between items-center hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                    >
                      <span
                        className={
                          selectedBankAccount
                            ? "text-gray-900"
                            : "text-gray-500"
                        }
                      >
                        {selectedBankAccount
                          ? `${selectedBankAccount.Lg_Name} (${selectedBankAccount.Lg_Code})`
                          : "Select Bank Account"}
                      </span>
                      {showBankDropdown ? (
                        <ChevronUp className="h-3 w-3 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                      )}
                    </button>

                    {showBankDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                        {/* Search Input */}
                        <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              ref={bankSearchRef}
                              type="text"
                              value={bankSearchTerm}
                              onChange={(e) =>
                                setBankSearchTerm(e.target.value)
                              }
                              onKeyDown={handleBankSearchKeyDown}
                              placeholder="Search by name or code..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            />
                            {bankSearchTerm && (
                              <button
                                type="button"
                                onClick={() => setBankSearchTerm("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Bank List */}
                        <div
                          ref={bankListRef}
                          className="overflow-y-auto max-h-60"
                        >
                          {filteredBankAccounts.length > 0 ? (
                            filteredBankAccounts.map((account, idx) => (
                              <button
                                key={account.Lg_Id}
                                ref={(el) => (bankItemRefs.current[idx] = el)}
                                type="button"
                                onClick={() => handleBankAccountSelect(account)}
                                onKeyDown={(e) =>
                                  handleBankItemKeyDown(e, account, idx)
                                }
                                className={`w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                  selectedBankAccount?.Lg_Id == account.Lg_Id
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700"
                                } ${highlightedIndex == idx ? "bg-blue-100" : ""}`}
                                tabIndex={0}
                              >
                                <div className="font-medium text-sm">
                                  {account.Lg_Name}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-gray-500">
                                    Code: {account.Lg_Code}
                                  </span>
                                  {account.Lg_Eng_Name && (
                                    <span className="text-xs text-gray-400 italic">
                                      {account.Lg_Eng_Name}
                                    </span>
                                  )}
                                </div>
                                {selectedBankAccount?.Lg_Id ==
                                  account.Lg_Id && (
                                  <div className="text-xs text-blue-600 mt-1 flex items-center">
                                    <Check className="h-3 w-3 mr-1" />
                                    Selected
                                  </div>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                              <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                              <p className="text-sm">No bank accounts found</p>
                              <p className="text-xs mt-1">
                                Try a different search term
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-3 bg-gray-50">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>
                              {filteredBankAccounts.length} bank accounts found
                            </span>
                            <span>Total: {bankAccounts.length} accounts</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedBankAccount && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                      <p className="text-xs text-blue-700 font-medium">
                        Selected: {selectedBankAccount.Lg_Name} (
                        {selectedBankAccount.Lg_Code})
                      </p>
                      {selectedBankAccount.Lg_Eng_Name && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          {selectedBankAccount.Lg_Eng_Name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

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

              {/* Description Input - Only show if no transactions exist */}
              {existingTransactions.length == 0 && showActionButtons && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description / Narration
                  </label>
                  <textarea
                    ref={narrationRef}
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    onKeyDown={(e) => handleEnterKey(e, processButtonRef)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                    placeholder="Enter description for both Journal and Payment vouchers..."
                    rows="2"
                  />
                </div>
              )}

              {/* Show description from saved transactions if exists */}
              {existingTransactions.length > 0 && narration && (
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description / Narration
                  </label>
                  <div className="text-sm text-gray-600">{narration}</div>
                </div>
              )}

              {/* Process Payment Button - Only show for accounts approved vouchers */}
              {showActionButtons && existingTransactions.length == 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    ref={processButtonRef}
                    onClick={handleSave}
                    disabled={
                      isSaving ||
                      !selectedBankAccount ||
                      !selectedOrganisation?.id
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    title={
                      !selectedBankAccount ? "Select bank account first" : ""
                    }
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-3 w-3 mr-2" />
                    )}
                    {isSaving ? "Processing..." : "Process Payment"}
                  </button>
                </div>
              )}

              {/* Show message if already paid */}
              {existingTransactions.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-700">
                      Payment already processed
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                {voucher.Acc_Vou_No && (
                  <p>
                    <strong>Acc. Voucher No:</strong> {voucher.Acc_Vou_No}
                  </p>
                )}
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
                <div>
                  <p>
                    <strong>Bank Name:</strong>{" "}
                    {voucher.sub_ledger.Bank_Name || "N/A"}
                  </p>
                  <p>
                    <strong>Account No:</strong>{" "}
                    {voucher.sub_ledger.Account_Number || "N/A"}
                  </p>
                  <p>
                    <strong>IFSC Code:</strong>{" "}
                    {voucher.sub_ledger.IFSC_Code || "N/A"}
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
                    Bill Gross Amount
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

export default ViewPaymentExecution;
