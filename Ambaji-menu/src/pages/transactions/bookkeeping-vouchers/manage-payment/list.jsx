import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  RefreshCw,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Landmark,
  ShieldCheck,
  CheckCircle,
  XCircle,
  CheckSquare,
  Square,
  Eye,
  Loader2,
  Building2,
  Banknote,
  Info,
  Calendar,
  Hash,
  Clock,
  Check,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { newChallanFlowService as newChallanVoucherApi } from "../../../services/newchallanflowservice";
import {
  generateToken as generateKotakToken,
  initiatePayment,
  getPaymentStatus,
  buildPaymentPayloadFromVoucher,
  isInitiateAccepted,
  getCmsStatusLabel,
  aggregateInstrumentPyStatus,
  pickPrimaryUtr,
  getDetailPayableAmount,
} from "../../../services/kotakcmspaymentapi";
import debounce from "lodash/debounce";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ManagePayments = ({ user }) => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("initiate");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [searchDebounced, setSearchDebounced] = useState("");
  const [pageTitle, setPageTitle] = useState("Manage Payments");
  const [processingVoucherId, setProcessingVoucherId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedVoucherForPayment, setSelectedVoucherForPayment] =
    useState(null);
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [returnStatuses, setReturnStatuses] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedVoucherForReturn, setSelectedVoucherForReturn] =
    useState(null);
  const [selectedReturnStatus, setSelectedReturnStatus] = useState("");
  const [isReturnProcessing, setIsReturnProcessing] = useState(false);
  const [refreshingStatusId, setRefreshingStatusId] = useState(null);

  // Status filter options
  const statusOptions = [
    {
      value: "initiate",
      label: "Pending Verification",
      icon: "🔄",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "pending",
      label: "Pending Bank",
      icon: "⏳",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "success",
      label: "Paid",
      icon: "✅",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "failed",
      label: "Failed",
      icon: "❌",
      color: "bg-red-100 text-red-800",
    },
  ];

  // Get page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/bookkeeping-vouchers/manage-payments";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // Load return statuses from action-master API using stage from menu
  // Load return statuses from action-master API using stage from menu
  const loadReturnStatuses = useCallback(async () => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/bookkeeping-vouchers/new-expense-challan-approval";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      console.log("Current Menu Item for Return:", currentMenuItem);

      if (
        currentMenuItem &&
        currentMenuItem.action &&
        currentMenuItem.action.stage
      ) {
        const stage = currentMenuItem.action.stage;
        console.log("Stage from menu:", stage);

        // Call the API to get actions for this stage
        const response = await axios.get(
          `${API_BASE_URL}/action-master/all?stage=${stage}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          },
        );

        console.log("Action API Response:", response.data);

        if (response.data && response.data.data) {
          const actions = response.data.data;

          // Get only forward actions (Is_Forward == "Y")
          const forwardActions = actions.filter((a) => a.Is_Forward == "Y");

          if (forwardActions.length > 0) {
            const statuses = forwardActions.map((action) => ({
              Act_Id: action.Act_Id,
              St_Name: action.St_Name,
              Previous_Status: action.Previous_Status,
            }));

            // ✅ FIX: Sort statuses in ascending order by Act_Id
            statuses.sort((a, b) => {
              const idA = parseInt(a.Act_Id);
              const idB = parseInt(b.Act_Id);
              return idA - idB;
            });

            console.log("Return Statuses loaded and sorted:", statuses);
            setReturnStatuses(statuses);
            return;
          }
        }
      }

      // Fallback: If no stage found or no actions, try to fetch from API directly
      console.warn("No stage found in menu, trying to fetch all actions...");
      try {
        const response = await axios.get(`${API_BASE_URL}/action-master/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        if (response.data?.success && response.data?.data) {
          const actions = response.data.data;
          const forwardActions = actions.filter((a) => a.Is_Forward == "Y");

          if (forwardActions.length > 0) {
            const statuses = forwardActions.map((action) => ({
              Act_Id: action.Act_Id,
              St_Name: action.St_Name,
              Previous_Status: action.Previous_Status,
            }));

            // ✅ FIX: Sort statuses in ascending order by Act_Id
            statuses.sort((a, b) => {
              const idA = parseInt(a.Act_Id);
              const idB = parseInt(b.Act_Id);
              return idA - idB;
            });

            console.log("Fallback Statuses loaded and sorted:", statuses);
            setReturnStatuses(statuses);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching all actions:", err);
      }

      // Ultimate fallback - hardcoded statuses
      console.warn("Using hardcoded fallback statuses");
      const fallbackStatuses = [
        { Act_Id: "1", St_Name: "Pending Verification", Previous_Status: null },
        { Act_Id: "2", St_Name: "Pending", Previous_Status: null },
        { Act_Id: "3", St_Name: "Initiate", Previous_Status: null },
      ];
      // Already in ascending order by Act_Id
      setReturnStatuses(fallbackStatuses);
    } catch (error) {
      console.error("Error loading return statuses:", error);
      const fallbackStatuses = [
        { Act_Id: "1", St_Name: "Pending Verification", Previous_Status: null },
        { Act_Id: "2", St_Name: "Pending", Previous_Status: null },
        { Act_Id: "3", St_Name: "Initiate", Previous_Status: null },
      ];
      setReturnStatuses(fallbackStatuses);
    }
  }, []);

  // Load return statuses on mount
  useEffect(() => {
    loadReturnStatuses();
  }, []);

  // Load default organisation and bank accounts
  useEffect(() => {
    const loadOrganisationAndBanks = async () => {
      try {
        // Load organisation
        const token = localStorage.getItem("auth_token") || "";
        const orgResponse = await axios.get(`${API_BASE_URL}/lst-org-master`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (orgResponse.data?.success && orgResponse.data?.data?.data) {
          const orgs = orgResponse.data.data.data;
          if (orgs.length > 0) {
            const defaultOrg = orgs[0];
            setSelectedOrganisation({
              id: defaultOrg.Org_Id,
              name: defaultOrg.Org_Name,
              code: defaultOrg.Org_Code,
            });
          }
        }

        // Load bank accounts
        const ledgersResponse = await axios.get(
          `${API_BASE_URL}/ledgers/all/data`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          },
        );

        const allLedgers = ledgersResponse.data.success
          ? ledgersResponse.data.data
          : [];
        const bankAccountsList = allLedgers.filter((ledger) => {
          return ledger.ledger_group?.Gr_Buk == "Y";
        });

        const mappedBankAccounts = bankAccountsList.map((ledger) => ({
          Lg_Id: ledger.Lg_Id,
          Lg_Name: ledger.Lg_Name,
          Lg_Eng_Name: ledger.Lg_Eng_Name,
          // Keep real Lg_Code only; do not invent "L{id}" — that is not a bank A/c no.
          Lg_Code: ledger.Lg_Code || "",
          Acc_No: ledger.Acc_No || ledger.Account_No || ledger.Account_Number || "",
          Gr_Id: ledger.Gr_Id,
          ledger_group: ledger.ledger_group,
        }));

        setBankAccounts(mappedBankAccounts);
      } catch (err) {
        console.error("Error loading organisation/bank accounts:", err);
      }
    };

    loadOrganisationAndBanks();
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchDebounced(value);
      setCurrentPage(1);
    }, 500),
    [],
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    handleClearSearch();
  };

  // Handle filter change
  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
    setSelectedVouchers([]);
  };

  // Load vouchers when dependencies change
  useEffect(() => {
    loadVouchers();
  }, [currentPage, searchDebounced, filterStatus]);

  // Load vouchers based on filter
  const loadVouchers = async () => {
    setLoading(true);
    try {
      const result = await newChallanVoucherApi.getAllWithoutPagenation(
        currentPage,
        itemsPerPage,
        searchDebounced,
        "",
        "",
        "",
        "N",
        "",
        filterStatus,
      );

      if (result.vouchers) {
        setVouchers(result.vouchers);
        setPagination({
          current_page: result.pagination?.current_page || 1,
          last_page: result.pagination?.last_page || 1,
          per_page: result.pagination?.per_page || itemsPerPage,
          total: result.pagination?.total || 0,
          from: result.pagination?.from || 0,
          to: result.pagination?.to || 0,
        });
        setSelectedVouchers([]);
      } else {
        setVouchers([]);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: itemsPerPage,
          total: 0,
          from: 0,
          to: 0,
        });
      }
    } catch (error) {
      console.error("Error loading vouchers:", error);
      toast.error("Failed to load vouchers");
      setVouchers([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: itemsPerPage,
        total: 0,
        from: 0,
        to: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = (voucher) => {
    if (!voucher.Net_Amount) return 0;
    return parseFloat(voucher.Net_Amount) || 0;
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Get status from status_master or RStatus
  const getStatusDisplay = (voucher) => {
    if (voucher?.RStatus) {
      return voucher.RStatus.St_Name || "Pending";
    }
    if (voucher?.status_master) {
      return voucher.status_master.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = (voucher) => {
    const statusName = getStatusDisplay(voucher);

    let colorClass = "bg-yellow-100 text-yellow-800";
    const statusLower = statusName.toLowerCase();

    if (
      statusLower.includes("approv") ||
      statusLower.includes("accept") ||
      statusLower.includes("verify")
    ) {
      colorClass = "bg-green-100 text-green-800";
    } else if (
      statusLower.includes("reject") ||
      statusLower.includes("deny") ||
      statusLower.includes("decline") ||
      statusLower.includes("query") ||
      statusLower.includes("failed")
    ) {
      colorClass = "bg-red-100 text-red-800";
    } else if (
      statusLower.includes("pend") ||
      statusLower.includes("wait") ||
      statusLower.includes("initiate")
    ) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (
      statusLower.includes("verif") ||
      statusLower.includes("check") ||
      statusLower.includes("pending")
    ) {
      colorClass = "bg-blue-100 text-blue-800";
    } else if (
      statusLower.includes("success") ||
      statusLower.includes("complete")
    ) {
      colorClass = "bg-green-100 text-green-800";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        <Clock className="h-3 w-3 mr-1" />
        {statusName}
      </span>
    );
  };

  const getBranchDisplay = (voucher) => {
    if (!voucher.department) return "N/A";
    const dept = voucher.department;
    let displayText = dept.Dpt_Desc || "";
    if (dept.Dpt_Name && dept.Dpt_Name != dept.Dpt_Desc) {
      displayText += ` (${dept.Dpt_Name})`;
    }
    return displayText;
  };

  const isCashMode = (mode) => {
    return mode == "Cash";
  };

  // ============ GENERATE NEXT PAYMENT ID ============
  const generateNextPaymentId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finan-trns/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      const transactions = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      const pymtTransactions = transactions.filter((t) => t.Vou_Ty == "PAY");

      if (pymtTransactions.length == 0) return 1;

      const voucherIds = pymtTransactions.map((t) => {
        const id = parseInt(t.Vou_Id);
        return isNaN(id) ? 0 : id;
      });

      const uniqueVoucherIds = [...new Set(voucherIds)];
      const maxVoucherId = Math.max(...uniqueVoucherIds);
      return maxVoucherId + 1;
    } catch (err) {
      console.error(
        "Error fetching transactions for payment ID generation:",
        err,
      );
      return Math.floor(Math.random() * 9000) + 1000;
    }
  };

  // ============ PROCESS SINGLE VOUCHER FINANCIAL ENTRIES ============
  const processSingleVoucherFinancialEntries = async (
    voucher,
    paymentVoucherId,
    narrationText,
  ) => {
    const transactionDate =
      voucher?.Ch_Date || new Date().toISOString().split("T")[0];
    const details = voucher.details || [];
    const allTransactions = [];
    let entryCounter = 1;

    const expenseLedgerId =
      voucher.Lg_Id || details[0]?.Lg_Id || details[0]?.ledger?.Lg_Id;

    // Extract tax items
    let taxItems = [];
    for (const detail of details) {
      if (detail.pay_details && detail.pay_details.length > 0) {
        const taxes = detail.pay_details
          .filter((p) => p.PD_Ty == "TAX")
          .map((p) => ({
            ...p,
            calculatedAmount: parseFloat(p.IC_Amt) || 0,
            isAdd: p.Add_Dedu == "1" || p.Add_Dedu == 1,
            Lg_Id: p.Lg_Id,
          }));
        taxItems = [...taxItems, ...taxes];
      }
    }

    // Extract penalty items
    let penaltyItems = [];
    for (const detail of details) {
      if (detail.pay_details && detail.pay_details.length > 0) {
        const penalties = detail.pay_details
          .filter((p) => p.PD_Ty == "PENLTY")
          .map((p) => ({
            ...p,
            calculatedAmount: parseFloat(p.IC_Amt) || 0,
            isAdd: p.Add_Dedu == "1" || p.Add_Dedu == 1,
            Lg_Id: p.Lg_Id,
          }));
        penaltyItems = [...penaltyItems, ...penalties];
      }
    }

    // Also check for Penalty_Amount directly on details
    for (const detail of details) {
      const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
      if (penaltyAmount > 0) {
        const exists = penaltyItems.some(
          (p) =>
            p.Lg_Id == detail.Lg_Id &&
            Math.abs(p.calculatedAmount - penaltyAmount) < 0.01,
        );
        if (!exists) {
          penaltyItems.push({
            calculatedAmount: penaltyAmount,
            isAdd: false,
            Lg_Id: detail.Lg_Id || expenseLedgerId,
            IC_Name: "Penalty",
            PD_Ty: "PENLTY",
          });
        }
      }
    }

    // Process main entries
    for (let idx = 0; idx < details.length; idx++) {
      const detail = details[idx];
      const paymentMode =
        detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
      const amount = parseFloat(detail.Amount) || 0;
      const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
      const totalAmount = amount + penaltyAmount;
      const subLedgerId = detail.ledger?.SL_Id || detail.sub_ledger?.SL_Id;

      // Get bank account from SL_Lg_Id
      let bankAccount = null;
      if (detail.SL_Lg_Id) {
        bankAccount = bankAccounts.find((acc) => acc.Lg_Id == detail.SL_Lg_Id);
      }

      if (
        totalAmount > 0 &&
        bankAccount &&
        expenseLedgerId &&
        selectedOrganisation
      ) {
        // Credit entry (Bank Account)
        allTransactions.push({
          Org_Id: selectedOrganisation.id,
          Lg_Id: bankAccount.Lg_Id,
          Ref_Id: expenseLedgerId,
          Vou_Ty: "PAY",
          Vou_Id: paymentVoucherId.toString(),
          Vou_Sr: entryCounter.toString(),
          Vou_Ln: entryCounter.toString(),
          V_Mode: "G",
          Vou_Dt: transactionDate,
          Dr_Amt: null,
          Cr_Amt: totalAmount.toFixed(2),
          rmk1: narrationText || `Payment: ${voucher.CV_No}`,
          Vou_Rf: voucher.CV_No,
        });
        entryCounter++;

        // Debit entry (Expense Ledger)
        allTransactions.push({
          Org_Id: selectedOrganisation.id,
          Lg_Id: expenseLedgerId,
          Ref_Id: bankAccount.Lg_Id,
          Vou_Ty: "PAY",
          Vou_Id: paymentVoucherId.toString(),
          Vou_Sr: entryCounter.toString(),
          Vou_Ln: entryCounter.toString(),
          V_Mode: "G",
          Vou_Dt: transactionDate,
          Dr_Amt: totalAmount.toFixed(2),
          Cr_Amt: null,
          rmk1: narrationText || `Payment: ${voucher.CV_No}`,
          Vou_Rf: voucher.CV_No,
        });
        entryCounter++;

        // Sub-ledger entry
        if (subLedgerId) {
          allTransactions.push({
            Org_Id: selectedOrganisation.id,
            Lg_Id: expenseLedgerId,
            Ref_Id: bankAccount.Lg_Id,
            Vou_Ty: "PAY",
            Vou_Id: paymentVoucherId.toString(),
            Vou_Sr: entryCounter.toString(),
            Vou_Ln: entryCounter.toString(),
            V_Mode: "S",
            Vou_Dt: transactionDate,
            Dr_Amt: totalAmount.toFixed(2),
            Cr_Amt: null,
            rmk1: narrationText || `Payment: ${voucher.CV_No}`,
            Vou_Rf: voucher.CV_No,
            SL_Id: subLedgerId.toString(),
            SL_Amt: totalAmount.toFixed(2),
          });
          entryCounter++;
        }
      }
    }

    // Process tax entries
    if (taxItems && taxItems.length > 0) {
      for (const tax of taxItems) {
        const isAdd = tax.isAdd || tax.Add_Dedu == "1" || tax.Add_Dedu == 1;
        const amount = tax.calculatedAmount || parseFloat(tax.IC_Amt) || 0;
        const taxLedgerId = tax.Lg_Id;

        if (
          amount > 0 &&
          taxLedgerId &&
          expenseLedgerId &&
          selectedOrganisation
        ) {
          allTransactions.push({
            Org_Id: selectedOrganisation.id,
            Lg_Id: taxLedgerId,
            Ref_Id: expenseLedgerId,
            Vou_Ty: "PAY",
            Vou_Id: paymentVoucherId.toString(),
            Vou_Sr: entryCounter.toString(),
            Vou_Ln: entryCounter.toString(),
            V_Mode: "G",
            Vou_Dt: transactionDate,
            Dr_Amt: isAdd ? amount.toFixed(2) : null,
            Cr_Amt: !isAdd ? amount.toFixed(2) : null,
            rmk1: narrationText || `Payment: ${voucher.CV_No}`,
            Vou_Rf: voucher.CV_No,
          });
          entryCounter++;

          allTransactions.push({
            Org_Id: selectedOrganisation.id,
            Lg_Id: expenseLedgerId,
            Ref_Id: taxLedgerId,
            Vou_Ty: "PAY",
            Vou_Id: paymentVoucherId.toString(),
            Vou_Sr: entryCounter.toString(),
            Vou_Ln: entryCounter.toString(),
            V_Mode: "G",
            Vou_Dt: transactionDate,
            Dr_Amt: !isAdd ? amount.toFixed(2) : null,
            Cr_Amt: isAdd ? amount.toFixed(2) : null,
            rmk1: narrationText || `Payment: ${voucher.CV_No}`,
            Vou_Rf: voucher.CV_No,
          });
          entryCounter++;
        }
      }
    }

    // Process penalty entries
    if (penaltyItems && penaltyItems.length > 0) {
      for (const penalty of penaltyItems) {
        const isAdd =
          penalty.isAdd || penalty.Add_Dedu == "1" || penalty.Add_Dedu == 1;
        const amount =
          penalty.calculatedAmount || parseFloat(penalty.IC_Amt) || 0;
        const penaltyLedgerId = penalty.Lg_Id;

        if (
          amount > 0 &&
          penaltyLedgerId &&
          expenseLedgerId &&
          selectedOrganisation
        ) {
          allTransactions.push({
            Org_Id: selectedOrganisation.id,
            Lg_Id: penaltyLedgerId,
            Ref_Id: expenseLedgerId,
            Vou_Ty: "PAY",
            Vou_Id: paymentVoucherId.toString(),
            Vou_Sr: entryCounter.toString(),
            Vou_Ln: entryCounter.toString(),
            V_Mode: "G",
            Vou_Dt: transactionDate,
            Dr_Amt: isAdd ? amount.toFixed(2) : null,
            Cr_Amt: !isAdd ? amount.toFixed(2) : null,
            rmk1: narrationText || `Payment Penalty: ${voucher.CV_No}`,
            Vou_Rf: voucher.CV_No,
          });
          entryCounter++;

          allTransactions.push({
            Org_Id: selectedOrganisation.id,
            Lg_Id: expenseLedgerId,
            Ref_Id: penaltyLedgerId,
            Vou_Ty: "PAY",
            Vou_Id: paymentVoucherId.toString(),
            Vou_Sr: entryCounter.toString(),
            Vou_Ln: entryCounter.toString(),
            V_Mode: "G",
            Vou_Dt: transactionDate,
            Dr_Amt: !isAdd ? amount.toFixed(2) : null,
            Cr_Amt: isAdd ? amount.toFixed(2) : null,
            rmk1: narrationText || `Payment Penalty: ${voucher.CV_No}`,
            Vou_Rf: voucher.CV_No,
          });
          entryCounter++;
        }
      }
    }

    // Save all transactions
    for (const transaction of allTransactions) {
      Object.keys(transaction).forEach((key) => {
        if (transaction[key] == undefined || transaction[key] == null) {
          delete transaction[key];
        }
      });
      await axios.post(`${API_BASE_URL}/finan-trns`, transaction, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
    }

    return allTransactions.length;
  };

  const persistCmsPaymentFields = async (voucher, fields) => {
    await newChallanVoucherApi.bulkUpdateStatus([voucher.CV_Id], {
      ...fields,
    });
  };

  const finalizeSuccessfulPayment = async (voucher) => {
    const existingCheck = await axios.get(
      `${API_BASE_URL}/finan-trns/all?Vou_Rf=${encodeURIComponent(voucher.CV_No)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      },
    );

    if (
      existingCheck.data.success &&
      Array.isArray(existingCheck.data.data) &&
      existingCheck.data.data.length > 0
    ) {
      console.warn(
        `Financial entries already exist for ${voucher.CV_No}, skipping creation`,
      );
    } else {
      const paymentVoucherId = await generateNextPaymentId();
      const narrationText = `CMS payment: ${voucher.CV_No}`;
      await processSingleVoucherFinancialEntries(
        voucher,
        paymentVoucherId,
        narrationText,
      );
    }
  };

  // ============ MAIN PROCESS: CMS initiate → status → finan-trns ============
  const processPaymentWithBankVerification = async (voucher) => {
    if (!selectedOrganisation?.id) {
      toast.error("Please select an organisation first");
      return { ok: false, reason: "organisation" };
    }

    if (voucher.Py_Status === "success") {
      toast.error(`Voucher ${voucher.CV_No} is already paid.`);
      return { ok: false, reason: "already_paid" };
    }

    // Do not re-initiate while a MessageId is still awaiting bank confirmation.
    if (voucher.Py_Status === "pending" && voucher.Cms_Message_Id) {
      toast(
        `${voucher.CV_No} is already pending at bank (Msg: ${voucher.Cms_Message_Id}). Use Refresh Status.`,
        { icon: "ℹ️", duration: 10000 },
      );
      return { ok: false, reason: "already_pending" };
    }

    const details = voucher.details || [];
    let hasMissingBank = false;
    for (const detail of details) {
      const totalAmount = getDetailPayableAmount(detail);
      if (totalAmount > 0 && !detail.SL_Lg_Id) {
        hasMissingBank = true;
        break;
      }
    }

    if (hasMissingBank) {
      toast.error(`Bank account not selected for voucher ${voucher.CV_No}`);
      return { ok: false, reason: "missing_debit_bank" };
    }

    try {
      let paymentPayload;
      try {
        paymentPayload = buildPaymentPayloadFromVoucher(voucher, bankAccounts);
      } catch (buildErr) {
        toast.error(
          buildErr.message || `Invalid payment data for ${voucher.CV_No}`,
        );
        return { ok: false, reason: "validation", error: buildErr.message };
      }

      const tokenResult = await generateKotakToken();

      if (!tokenResult.success) {
        toast.error(
          `Token generation failed for ${voucher.CV_No}: ${tokenResult.error}`,
          { duration: 12000, style: { maxWidth: "620px" } },
        );
        return { ok: false, reason: "token", error: tokenResult.error };
      }

      // CMS pay + status only (same APIs as Kotak demo). No Name Enquiry.
      const primaryInstRef = paymentPayload.instruments[0]?.InstRefNo || "";
      const primaryPayMode = paymentPayload.instruments[0]?.PayMode || "";
      await persistCmsPaymentFields(voucher, {
        Py_Status: "pending",
        Cms_Message_Id: paymentPayload.messageId,
        Cms_Inst_Ref_No: primaryInstRef,
        Cms_Status: "SUBMITTING",
        Cms_Pay_Mode: primaryPayMode,
      });

      console.log(
        `Initiating CMS payment for ${voucher.CV_No}...`,
        paymentPayload.messageId,
      );
      const initiateResult = await initiatePayment(
        paymentPayload,
        tokenResult.access_token,
      );

      if (
        initiateResult.statusCd &&
        !isInitiateAccepted(initiateResult.statusCd)
      ) {
        await persistCmsPaymentFields(voucher, {
          Py_Status: "failed",
          Cms_Message_Id: paymentPayload.messageId,
          Cms_Inst_Ref_No: primaryInstRef,
          Cms_Status: initiateResult.statusCd,
          Cms_Pay_Mode: primaryPayMode,
        });
        toast.error(
          initiateResult.error ||
            initiateResult.statusRem ||
            `CMS payment rejected for ${voucher.CV_No}`,
          { duration: 12000, style: { maxWidth: "620px" } },
        );
        return {
          ok: false,
          reason: "cms_initiate",
          error: initiateResult.error,
        };
      }

      if (!initiateResult.success) {
        toast(
          `${initiateResult.error || "Bank response was not received"}. Payment remains pending; refresh its status before retrying.`,
          { icon: "⚠️", duration: 12000, style: { maxWidth: "620px" } },
        );
        return {
          ok: true,
          status: "pending",
          messageId: paymentPayload.messageId,
        };
      }

      const messageId = initiateResult.messageId || paymentPayload.messageId;

      await persistCmsPaymentFields(voucher, {
        Py_Status: "pending",
        Cms_Message_Id: messageId,
        Cms_Inst_Ref_No: primaryInstRef,
        Cms_Status: initiateResult.statusCd || "C",
        Cms_Pay_Mode: primaryPayMode,
      });

      const statusResult = await getPaymentStatus(
        {
          messageId,
          instRefNo: primaryInstRef,
          clientCode: paymentPayload.clientCode,
          msgSource: paymentPayload.msgSource,
        },
        tokenResult.access_token,
      );

      const detailsStatus = statusResult.details || [];
      const pyStatus = statusResult.success
        ? aggregateInstrumentPyStatus(detailsStatus)
        : "pending";
      const utr = pickPrimaryUtr(detailsStatus);
      const cmsStatus =
        detailsStatus[0]?.statusCode ||
        detailsStatus[0]?.Status_Code ||
        statusResult.statusCode ||
        "C";

      if (pyStatus == "success") {
        await finalizeSuccessfulPayment(voucher);
        await persistCmsPaymentFields(voucher, {
          Py_Status: "success",
          Cms_Message_Id: messageId,
          Cms_Inst_Ref_No: primaryInstRef,
          Cms_Status: cmsStatus,
          Cms_Utr: utr,
          Cms_Pay_Mode: primaryPayMode,
        });
        console.log(`Voucher ${voucher.CV_No} paid successfully, UTR: ${utr}`);
        return { ok: true, status: "success", utr, messageId };
      }

      if (pyStatus == "failed") {
        await persistCmsPaymentFields(voucher, {
          Py_Status: "failed",
          Cms_Message_Id: messageId,
          Cms_Inst_Ref_No: primaryInstRef,
          Cms_Status: cmsStatus,
          Cms_Utr: utr,
          Cms_Pay_Mode: primaryPayMode,
        });
        return {
          ok: false,
          reason: "cms_status_failed",
          status: cmsStatus,
          messageId,
        };
      }

      await persistCmsPaymentFields(voucher, {
        Py_Status: "pending",
        Cms_Message_Id: messageId,
        Cms_Inst_Ref_No: primaryInstRef,
        Cms_Status: cmsStatus,
        Cms_Utr: utr,
        Cms_Pay_Mode: primaryPayMode,
      });
      return { ok: true, status: "pending", messageId, utr };
    } catch (error) {
      console.error(`Error processing payment for ${voucher.CV_No}:`, error);
      toast.error(error.message || `Failed to process ${voucher.CV_No}`);
      return { ok: false, reason: "exception", error: error.message };
    }
  };

  // Refresh CMS status for pending vouchers
  const refreshCmsPaymentStatus = async (voucher) => {
    const messageId = voucher.Cms_Message_Id;
    if (!messageId) {
      toast.error(
        `No CMS MessageId on ${voucher.CV_No}. Initiate payment first.`,
      );
      return false;
    }

    setRefreshingStatusId(voucher.CV_Id);
    try {
      const tokenResult = await generateKotakToken();
      if (!tokenResult.success) {
        toast.error(tokenResult.error || "Token generation failed", {
          duration: 12000,
          style: { maxWidth: "620px" },
        });
        return false;
      }

      const statusResult = await getPaymentStatus(
        {
          messageId,
          instRefNo: voucher.Cms_Inst_Ref_No || undefined,
        },
        tokenResult.access_token,
      );

      if (!statusResult.success) {
        toast.error(statusResult.error || "Status enquiry failed", {
          duration: 12000,
          style: { maxWidth: "620px" },
        });
        return false;
      }

      const detailsStatus = statusResult.details || [];
      const pyStatus = aggregateInstrumentPyStatus(detailsStatus);
      const utr = pickPrimaryUtr(detailsStatus);
      const cmsStatus =
        detailsStatus[0]?.statusCode ||
        detailsStatus[0]?.Status_Code ||
        statusResult.statusCode ||
        voucher.Cms_Status;

      if (pyStatus == "success") {
        await finalizeSuccessfulPayment(voucher);
      }

      await persistCmsPaymentFields(voucher, {
        Py_Status: pyStatus,
        Cms_Message_Id: messageId,
        Cms_Inst_Ref_No:
          voucher.Cms_Inst_Ref_No || statusResult.instRefNo || "",
        Cms_Status: cmsStatus,
        Cms_Utr: utr,
        Cms_Pay_Mode: voucher.Cms_Pay_Mode || "",
      });

      toast.success(
        pyStatus == "success"
          ? `Payment confirmed for ${voucher.CV_No}${utr ? ` (UTR: ${utr})` : ""}`
          : pyStatus == "failed"
            ? `Payment failed for ${voucher.CV_No}: ${getCmsStatusLabel(cmsStatus)}`
            : `Still pending for ${voucher.CV_No}: ${getCmsStatusLabel(cmsStatus)}`,
      );
      await loadVouchers();
      return true;
    } catch (error) {
      console.error("Refresh CMS status error:", error);
      toast.error(error.message || "Failed to refresh payment status");
      return false;
    } finally {
      setRefreshingStatusId(null);
    }
  };

  // ============ BULK PAYMENT PROCESSING ============
  const handleBulkPayment = async () => {
    if (selectedVouchers.length == 0) {
      toast.error("Please select at least one voucher");
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Bulk Payment Processing",
      html: `
        <div class="text-left">
          <p class="mb-3">Process payment for <strong>${selectedVouchers.length}</strong> voucher(s)?</p>
          <div class="bg-gray-50 p-3 rounded-lg mb-3 max-h-60 overflow-y-auto">
            ${vouchers
              .filter((v) => selectedVouchers.includes(v.CV_Id))
              .map(
                (v) => `
              <div class="mb-2 pb-2 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                <p class="font-semibold text-gray-900">${v.CV_No}</p>
                <p class="text-sm text-gray-600">Amount: ${formatCurrency(getTotalAmount(v))}</p>
                <p class="text-xs text-gray-500">Branch: ${getBranchDisplay(v)}</p>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Process Payment",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    setBulkProcessing(true);

    try {
      Swal.fire({
        title: "Processing Payments...",
        html: `Processing ${selectedVouchers.length} voucher(s)...<br/><br/>
               <div class="progress-bar-container" style="width: 100%; background-color: #e5e7eb; border-radius: 8px; margin-top: 10px;">
                 <div id="bulk-progress-bar" style="width: 0%; background-color: #10B981; height: 8px; border-radius: 8px; transition: width 0.3s ease;"></div>
               </div>`,
        allowOutsideClick: false,
        showConfirmButton: false,
        backdrop: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const updateProgress = (percent) => {
        const progressBar = document.getElementById("bulk-progress-bar");
        if (progressBar) {
          progressBar.style.width = `${percent}%`;
        }
      };

      const selectedList = vouchers.filter((v) =>
        selectedVouchers.includes(v.CV_Id),
      );
      let successCount = 0;
      let pendingCount = 0;
      let failedVouchers = [];
      let skippedVouchers = [];

      for (let i = 0; i < selectedList.length; i++) {
        const voucher = selectedList[i];
        const percent = ((i + 1) / selectedList.length) * 100;
        updateProgress(percent);

        const content = document.querySelector(".swal2-html-container");
        if (content) {
          content.innerHTML = `Processing voucher ${i + 1} of ${selectedList.length}: ${voucher.CV_No}<br/><br/>
            <div class="progress-bar-container" style="width: 100%; background-color: #e5e7eb; border-radius: 8px; margin-top: 10px;">
              <div id="bulk-progress-bar" style="width: ${percent}%; background-color: #10B981; height: 8px; border-radius: 8px; transition: width 0.3s ease;"></div>
            </div>`;
        }

        try {
          const result = await processPaymentWithBankVerification(voucher);

          if (result?.ok && result.status == "success") {
            successCount++;
          } else if (result?.ok && result.status == "pending") {
            pendingCount++;
          } else {
            failedVouchers.push({
              id: voucher.CV_Id,
              no: voucher.CV_No,
              reason: result?.error || result?.reason || "CMS payment failed",
            });
          }
        } catch (err) {
          console.error(`Error processing voucher ${voucher.CV_No}:`, err);
          failedVouchers.push({
            id: voucher.CV_Id,
            no: voucher.CV_No,
            reason: err.message || "Unknown error",
          });
        }
      }

      Swal.close();

      let message = `<div style="text-align: left;">`;

      if (successCount > 0) {
        message += `<p class="text-green-600">✅ ${successCount} payment(s) processed (UTR confirmed)!</p>`;
      }

      if (pendingCount > 0) {
        message += `<p class="text-blue-600 mt-2">⏳ ${pendingCount} payment(s) initiated and pending at bank. Use Refresh Status later.</p>`;
      }

      if (failedVouchers.length > 0) {
        message += `<p class="text-red-600 mt-2">❌ ${failedVouchers.length} voucher(s) failed:</p>`;
        message += `<ul class="text-sm text-red-600 mt-1">`;
        failedVouchers.forEach((f) => {
          message += `<li>${f.no}: ${f.reason}</li>`;
        });
        message += `</ul>`;
      }

      if (skippedVouchers.length > 0) {
        message += `<p class="text-yellow-600 mt-2">⚠️ ${skippedVouchers.length} voucher(s) skipped:</p>`;
        message += `<ul class="text-sm text-yellow-600 mt-1">`;
        skippedVouchers.forEach((f) => {
          message += `<li>${f.no}: ${f.reason}</li>`;
        });
        message += `</ul>`;
      }

      if (
        successCount == 0 &&
        pendingCount == 0 &&
        failedVouchers.length == 0 &&
        skippedVouchers.length == 0
      ) {
        message += `<p class="text-gray-600">No vouchers were processed.</p>`;
      }

      message += `</div>`;

      const iconType =
        successCount > 0 || pendingCount > 0
          ? "success"
          : failedVouchers.length > 0
            ? "error"
            : "info";

      await Swal.fire({
        title:
          successCount > 0 || pendingCount > 0
            ? "Processing Complete"
            : "Processing Failed",
        html: message,
        icon: iconType,
        confirmButtonColor: "#10B981",
      });

      if (successCount > 0 || pendingCount > 0) {
        setSelectedVouchers([]);
        await loadVouchers();
      }
    } catch (error) {
      console.error("Bulk payment processing error:", error);
      Swal.close();
      toast.error(
        error.response?.data?.message || "Failed to process payments",
      );
    } finally {
      setBulkProcessing(false);
    }
  };

  // ============ SINGLE PAYMENT PROCESSING ============
  const handleConfirmPayment = async () => {
    if (!selectedVoucherForPayment) return;

    setProcessingVoucherId(selectedVoucherForPayment.CV_Id);
    setShowPaymentModal(false);

    try {
      const result = await processPaymentWithBankVerification(
        selectedVoucherForPayment,
      );
      if (result?.ok && result.status == "success") {
        toast.success(
          `Payment confirmed for ${selectedVoucherForPayment.CV_No}${result.utr ? ` (UTR: ${result.utr})` : ""}`,
        );
      } else if (result?.ok && result.status == "pending") {
        toast.success(
          `Payment initiated for ${selectedVoucherForPayment.CV_No}. Status pending at bank.`,
        );
      } else {
        toast.error(
          result?.error ||
            `Payment failed for ${selectedVoucherForPayment.CV_No}`,
        );
      }
      await loadVouchers();
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("Failed to process payment");
    } finally {
      setProcessingVoucherId(null);
      setSelectedVoucherForPayment(null);
    }
  };

  const handleProcessPayment = async (voucher) => {
    const details = voucher.details || [];
    let hasMissingBank = false;
    for (const detail of details) {
      const amount = parseFloat(detail.Amount) || 0;
      const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
      const totalAmount = amount + penaltyAmount;
      if (totalAmount > 0 && !detail.SL_Lg_Id) {
        hasMissingBank = true;
        break;
      }
    }

    if (hasMissingBank) {
      toast.error(
        `Bank account not selected for voucher ${voucher.CV_No}. Please select bank accounts first.`,
      );
      return;
    }

    setSelectedVoucherForPayment(voucher);
    setShowPaymentModal(true);
  };

  // ============ RETURN FLOW FOR FAILED VOUCHERS ============
  const handleReturnAction = (voucher) => {
    if (returnStatuses.length == 0) {
      toast.error("No forward options available. Please configure statuses.");
      return;
    }
    setSelectedVoucherForReturn(voucher);
    setSelectedReturnStatus("");
    setShowReturnModal(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedVoucherForReturn) return;
    if (!selectedReturnStatus) {
      toast.error("Please select a status to forward");
      return;
    }

    setIsReturnProcessing(true);

    try {
      const payload = {
        ids: [selectedVoucherForReturn.CV_Id],
        Status: selectedReturnStatus,
        Py_Status: null,
        Is_Rejected: "Y",
      };

      console.log("Return payload:", payload);

      const response = await axios.put(
        `${API_BASE_URL}/new-chl-voucher/bulk/status/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        toast.success(
          `Voucher ${selectedVoucherForReturn.CV_No} forwarded successfully!`,
        );
        setShowReturnModal(false);
        setSelectedVoucherForReturn(null);
        setSelectedReturnStatus("");
        await loadVouchers();
      } else {
        toast.error(response.data.message || "Failed to forward voucher");
      }
    } catch (error) {
      console.error("Return error:", error);
      toast.error(error.response?.data?.message || "Failed to forward voucher");
    } finally {
      setIsReturnProcessing(false);
    }
  };

  // ============ BULK RETURN FOR FAILED VOUCHERS ============
  const handleBulkReturn = async () => {
    if (selectedVouchers.length == 0) {
      toast.error("Please select at least one voucher");
      return;
    }

    // If returnStatuses is empty, try to reload them
    if (returnStatuses.length == 0) {
      toast.loading("Loading available statuses...");
      await loadReturnStatuses();
      if (returnStatuses.length == 0) {
        toast.error("No forward options available. Please configure statuses.");
        return;
      }
      toast.dismiss();
    }

    const { value: selectedStatus } = await Swal.fire({
      title: "Bulk Return / Forward",
      html: `
        <div class="text-left">
          <p class="mb-3">Select the status to forward <strong>${selectedVouchers.length}</strong> voucher(s) to:</p>
          <select id="return-status-select" class="swal2-input" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px;">
            <option value="">Select Status...</option>
            ${returnStatuses
              .map(
                (status) => `
              <option value="${status.Act_Id}">${status.St_Name}</option>
            `,
              )
              .join("")}
          </select>
          <div class="bg-gray-50 p-3 rounded-lg mt-3 max-h-40 overflow-y-auto">
            ${vouchers
              .filter((v) => selectedVouchers.includes(v.CV_Id))
              .map(
                (v) => `
              <div class="mb-1 text-sm">
                <span class="font-medium">${v.CV_No}</span>
                <span class="text-gray-500"> - ${formatCurrency(getTotalAmount(v))}</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#EF5350",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Forward Selected",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const select = document.getElementById("return-status-select");
        const value = select?.value;
        if (!value) {
          Swal.showValidationMessage("Please select a status");
          return false;
        }
        return value;
      },
    });

    if (!selectedStatus) return;

    setIsReturnProcessing(true);

    try {
      const payload = {
        ids: selectedVouchers,
        Status: selectedStatus,
        Py_Status: null,
        Is_Rejected: "Y",
      };

      console.log("Bulk return payload:", payload);

      const response = await axios.put(
        `${API_BASE_URL}/new-chl-voucher/bulk/status/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        toast.success(
          `${selectedVouchers.length} voucher(s) forwarded successfully!`,
        );
        setSelectedVouchers([]);
        await loadVouchers();
      } else {
        toast.error(response.data.message || "Failed to forward vouchers");
      }
    } catch (error) {
      console.error("Bulk return error:", error);
      toast.error(
        error.response?.data?.message || "Failed to forward vouchers",
      );
    } finally {
      setIsReturnProcessing(false);
    }
  };

  // Select/Deselect all records
  const handleSelectAll = () => {
    if (selectedVouchers.length == vouchers.length) {
      setSelectedVouchers([]);
    } else {
      setSelectedVouchers(vouchers.map((v) => v.CV_Id));
    }
  };

  // Select/Deselect single record
  const handleSelectVoucher = (cvId) => {
    if (selectedVouchers.includes(cvId)) {
      setSelectedVouchers(selectedVouchers.filter((id) => id != cvId));
    } else {
      setSelectedVouchers([...selectedVouchers, cvId]);
    }
  };

  const hasActiveFilters = searchTerm;

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.last_page,
      startPage + maxVisiblePages - 1,
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="p-6">
      {/* Return Modal for Failed Vouchers */}
      {showReturnModal && selectedVoucherForReturn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <ArrowUpRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Forward Voucher
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Select status to forward {selectedVoucherForReturn.CV_No}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setSelectedVoucherForReturn(null);
                    setSelectedReturnStatus("");
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={isReturnProcessing}
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Voucher No.</span>
                  <span className="font-semibold text-gray-900">
                    {selectedVoucherForReturn.CV_No}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Branch</span>
                  <span className="text-sm text-gray-900">
                    {getBranchDisplay(selectedVoucherForReturn)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(getTotalAmount(selectedVoucherForReturn))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forward to Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedReturnStatus}
                  onChange={(e) => setSelectedReturnStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
                  disabled={isReturnProcessing}
                >
                  <option value="">Select Status...</option>
                  {returnStatuses.map((status) => (
                    <option key={status.Act_Id} value={status.Act_Id}>
                      {status.St_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setSelectedVoucherForReturn(null);
                    setSelectedReturnStatus("");
                  }}
                  disabled={isReturnProcessing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReturn}
                  disabled={isReturnProcessing || !selectedReturnStatus}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isReturnProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Forwarding...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Forward
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedVoucherForPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <Banknote className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Process Payment
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Confirm payment for voucher
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={
                    processingVoucherId == selectedVoucherForPayment?.CV_Id
                  }
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Voucher No.</span>
                  <span className="font-semibold text-gray-900">
                    {selectedVoucherForPayment.CV_No}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Branch</span>
                  <span className="text-sm text-gray-900">
                    {getBranchDisplay(selectedVoucherForPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(getTotalAmount(selectedVoucherForPayment))}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={
                    processingVoucherId == selectedVoucherForPayment?.CV_Id
                  }
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={
                    processingVoucherId == selectedVoucherForPayment?.CV_Id
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {processingVoucherId == selectedVoucherForPayment?.CV_Id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Initiate Kotak CMS bank payments and track UTR status
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav
            className="flex space-x-4 px-4 overflow-x-auto"
            aria-label="Tabs"
          >
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => handleFilterChange(status.value)}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filterStatus == status.value
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center">
                  <span className="mr-1">{status.icon}</span>
                  {status.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by voucher number, vendor name, department..."
                className="w-full pl-10 pr-24 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}

            <button
              onClick={loadVouchers}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Action for Pending Verification */}
        {filterStatus == "initiate" && selectedVouchers.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedVouchers.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-amber-800">
                  {selectedVouchers.length} voucher(s) selected
                </span>
                <p className="text-xs text-amber-600">
                  Initiate CMS bank payment for selected vouchers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <button
                onClick={() => setSelectedVouchers([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkPayment}
                disabled={bulkProcessing}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Process Payment ({selectedVouchers.length})
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Bulk Refresh for Pending Bank */}
        {filterStatus == "pending" && selectedVouchers.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedVouchers.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedVouchers.length} pending voucher(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Refresh CMS payment status / UTR
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <button
                onClick={() => setSelectedVouchers([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
              <button
                onClick={async () => {
                  const list = vouchers.filter((v) =>
                    selectedVouchers.includes(v.CV_Id),
                  );
                  setBulkProcessing(true);
                  try {
                    for (const v of list) {
                      await refreshCmsPaymentStatus(v);
                    }
                    setSelectedVouchers([]);
                  } finally {
                    setBulkProcessing(false);
                  }
                }}
                disabled={bulkProcessing || refreshingStatusId != null}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center disabled:opacity-50"
              >
                {bulkProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status ({selectedVouchers.length})
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Bulk Action for Failed - Return/Forward + optional status refresh */}
        {filterStatus == "failed" && selectedVouchers.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedVouchers.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-red-800">
                  {selectedVouchers.length} failed voucher(s) selected
                </span>
                <p className="text-xs text-red-600">
                  Re-check bank status (if MessageId exists) or forward
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <button
                onClick={() => setSelectedVouchers([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={async () => {
                  const list = vouchers.filter(
                    (v) =>
                      selectedVouchers.includes(v.CV_Id) && v.Cms_Message_Id,
                  );
                  if (list.length === 0) {
                    toast.error(
                      "Selected failed vouchers have no CMS MessageId to refresh.",
                    );
                    return;
                  }
                  setBulkProcessing(true);
                  try {
                    for (const v of list) {
                      await refreshCmsPaymentStatus(v);
                    }
                    setSelectedVouchers([]);
                  } finally {
                    setBulkProcessing(false);
                  }
                }}
                disabled={bulkProcessing || refreshingStatusId != null}
                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 flex items-center disabled:opacity-50"
              >
                {bulkProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </>
                )}
              </button>
              <button
                onClick={handleBulkReturn}
                disabled={isReturnProcessing}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReturnProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Forwarding...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Forward ({selectedVouchers.length})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {(filterStatus == "initiate" ||
                  filterStatus == "failed" ||
                  filterStatus == "pending") && (
                  <th className="w-12 px-4 py-4">
                    <div className="flex items-center">
                      <button
                        onClick={handleSelectAll}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        disabled={bulkProcessing || isReturnProcessing}
                      >
                        {selectedVouchers.length == vouchers.length &&
                        vouchers.length > 0 ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sr No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-1" />
                    Voucher Details
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Bank / UTR
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    Branch
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tender Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={
                      filterStatus == "initiate" ||
                      filterStatus == "failed" ||
                      filterStatus == "pending"
                        ? 9
                        : 8
                    }
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading vouchers...</p>
                    </div>
                  </td>
                </tr>
              ) : vouchers.length > 0 ? (
                vouchers.map((voucher, index) => {
                  const isSelectable =
                    filterStatus == "initiate" ||
                    filterStatus == "failed" ||
                    filterStatus == "pending";
                  const vendorCount = voucher.details?.length || 0;

                  return (
                    <tr
                      key={voucher.CV_Id}
                      className={`hover:bg-gray-50 transition-colors duration-150 group ${
                        selectedVouchers.includes(voucher.CV_Id)
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      {isSelectable && (
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              checked={selectedVouchers.includes(voucher.CV_Id)}
                              onChange={() =>
                                handleSelectVoucher(voucher.CV_Id)
                              }
                              disabled={bulkProcessing || isReturnProcessing}
                            />
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                              <Hash className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-gray-900">
                                {voucher.CV_No}
                              </div>
                              <div className="flex items-center mt-0.5">
                                <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">
                                  {formatDate(voucher.Ch_Date)}
                                </span>
                              </div>
                              <div className="mt-0.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  {vendorCount} Vendor
                                  {vendorCount != 1 ? "s" : ""}
                                </span>
                              </div>
                              {voucher.Acc_Chl_No && (
                                <div className="mt-0.5">
                                  <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                                    Payment: {voucher.Acc_Chl_No}
                                  </span>
                                </div>
                              )}
                              {voucher.SL_Lg_Id && (
                                <div className="mt-0.5">
                                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                    Bank Selected
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs">
                          {voucher.Cms_Pay_Mode && (
                            <div>
                              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                                {voucher.Cms_Pay_Mode}
                              </span>
                            </div>
                          )}
                          {voucher.Cms_Message_Id && (
                            <div className="text-gray-600">
                              <span className="text-gray-400">Msg:</span>{" "}
                              <span className="font-mono">
                                {voucher.Cms_Message_Id}
                              </span>
                            </div>
                          )}
                          {voucher.Cms_Status && (
                            <div className="text-gray-600">
                              <span className="text-gray-400">Bank:</span>{" "}
                              {getCmsStatusLabel(voucher.Cms_Status)}
                              <span className="text-gray-400">
                                {" "}
                                ({voucher.Cms_Status})
                              </span>
                            </div>
                          )}
                          {voucher.Cms_Utr && (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-800 font-medium">
                              UTR:{" "}
                              <span className="font-mono">
                                {voucher.Cms_Utr}
                              </span>
                            </div>
                          )}
                          {!voucher.Cms_Message_Id && !voucher.Cms_Utr && (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getBranchDisplay(voucher)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {voucher.tender_type?.Tnt_Name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                          <div className="text-xs text-green-600">
                            Total Amount
                          </div>
                          <div className="text-sm font-bold text-green-700">
                            {formatCurrency(getTotalAmount(voucher))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(voucher)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => {
                              navigate(
                                `/transactions/bookkeeping-vouchers/manage-payments/view/${voucher.CV_Id}`,
                              );
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>

                          {filterStatus == "initiate" && (
                            <button
                              onClick={() => handleProcessPayment(voucher)}
                              disabled={
                                processingVoucherId == voucher.CV_Id ||
                                bulkProcessing
                              }
                              className={`text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1 transition-colors ${
                                processingVoucherId == voucher.CV_Id ||
                                bulkProcessing
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {processingVoucherId == voucher.CV_Id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Paying...
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Pay
                                </>
                              )}
                            </button>
                          )}

                          {filterStatus == "pending" && (
                            <button
                              onClick={() => refreshCmsPaymentStatus(voucher)}
                              disabled={
                                refreshingStatusId == voucher.CV_Id ||
                                bulkProcessing ||
                                !voucher.Cms_Message_Id
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              {refreshingStatusId == voucher.CV_Id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Checking...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  Refresh Status
                                </>
                              )}
                            </button>
                          )}

                          {filterStatus == "failed" && (
                            <>
                              {voucher.Cms_Message_Id && (
                                <button
                                  onClick={() =>
                                    refreshCmsPaymentStatus(voucher)
                                  }
                                  disabled={
                                    refreshingStatusId == voucher.CV_Id ||
                                    bulkProcessing
                                  }
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                  {refreshingStatusId == voucher.CV_Id ? (
                                    <>
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      Checking...
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="h-3.5 w-3.5" />
                                      Refresh Status
                                    </>
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleReturnAction(voucher)}
                                disabled={isReturnProcessing}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                Forward
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={
                      filterStatus == "initiate" ||
                      filterStatus == "failed" ||
                      filterStatus == "pending"
                        ? 9
                        : 8
                    }
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Layers className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching vouchers found"
                          : filterStatus == "initiate"
                            ? "No pending verification vouchers available"
                            : filterStatus == "pending"
                              ? "No pending vouchers available"
                              : filterStatus == "success"
                                ? "No verified vouchers available"
                                : filterStatus == "failed"
                                  ? "No failed vouchers available"
                                  : "No vouchers available"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : filterStatus == "initiate"
                            ? "All vouchers are either processed or failed"
                            : filterStatus == "pending"
                              ? "No vouchers in pending state"
                              : filterStatus == "success"
                                ? "No vouchers have been verified yet"
                                : filterStatus == "failed"
                                  ? "No vouchers have failed"
                                  : "No vouchers available"}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="inline-flex items-center px-5 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-200"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {vouchers.length} of {pagination.total} entries
              {hasActiveFilters && " (filtered)"}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage == page
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination.last_page, prev + 1),
                )
              }
              disabled={currentPage == pagination.last_page}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePayments;
