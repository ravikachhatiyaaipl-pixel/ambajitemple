// src/pages/Transactions/BookkeepingVouchers/NewExpenseChallanApproval.jsx

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  ArrowLeft,
  X,
  RefreshCw,
  Clock,
  Calendar,
  Building,
  Shield,
  Hash,
  CheckSquare,
  Square,
  Check,
  AlertCircle,
  Banknote,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Save,
  TrendingUp,
  XCircle,
  Printer,
  Landmark,
  Edit,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import debounce from "lodash/debounce";
import { newChallanFlowService } from "../../../services/newchallanflowservice";
import { ChequesApi } from "../../../services/chequesapi";
import {
  buildChequePrintHtml,
  printChequeHtml,
  CHEQUE_TYPES,
  CHEQUE_SIZE,
  SUPPORTED_BANKS,
  getBankLayout,
  formatChequeDateDigits,
  parseChequeDate,
  splitAmountInWords,
  getChequeCrossingLabel,
} from "../../../../utils/hdfcChequePrint";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const NewExpenseChallanApproval = ({ user }) => {
  const [allVouchers, setAllVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const perPageOptions = [25, 50, 75, 100];
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState(
    "Expense Challan Voucher Approval",
  );
  const [currentStage, setCurrentStage] = useState(null);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [approvableStatusIds, setApprovableStatusIds] = useState([]);
  const [actionsList, setActionsList] = useState([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Bulk approval states
  const [selectedVouchers, setSelectedVouchers] = useState(new Set());
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  // Bank selection modal states
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const ORG_ID = 1;
  const [vouchersForBankSelection, setVouchersForBankSelection] = useState([]);
  const [nextStatusIdForBank, setNextStatusIdForBank] = useState(null);
  const [isFinalApprovalMode, setIsFinalApprovalMode] = useState(false);
  const [lastApprovedStatus, setLastApprovedStatus] = useState(null);

  // Bank selection for each voucher's details
  const [voucherCashBankAccounts, setVoucherCashBankAccounts] = useState({});
  const [voucherDetailBankSelections, setVoucherDetailBankSelections] =
    useState({});
  const [openDropdownForVoucher, setOpenDropdownForVoucher] = useState(null);
  const [openDetailDropdownForVoucher, setOpenDetailDropdownForVoucher] =
    useState({});
  const [bankSearchTerms, setBankSearchTerms] = useState({});
  const [detailSearchTerms, setDetailSearchTerms] = useState({});
  const [narration, setNarration] = useState("");
  const [autoSelectEnabled, setAutoSelectEnabled] = useState(true);

  // Cheque Print States
  const [showChequePrintModal, setShowChequePrintModal] = useState(false);
  const [selectedChequeDetail, setSelectedChequeDetail] = useState(null);
  const [selectedVoucherForCheque, setSelectedVoucherForCheque] =
    useState(null);
  const [chequePrintData, setChequePrintData] = useState({
    payeeName: "",
    amount: "",
    amountInWords: "",
    chequeType: "Self",
    chequeDate: "",
    bankName: "",
    chequeNumber: "",
  });
  const [selectedBank, setSelectedBank] = useState("SBI");
  const [bankLayout, setBankLayout] = useState(() => getBankLayout("SBI"));
  const [chequePrintOffsets, setChequePrintOffsets] = useState({
    top: 0,
    left: 0,
  });
  const [isPrinting, setIsPrinting] = useState(false);
  const chequePreviewRef = useRef(null);

  // Cheque Creation States
  const [showChequeCreationModal, setShowChequeCreationModal] = useState(false);
  const [selectedChequeBook, setSelectedChequeBook] = useState(null);
  const [selectedChequeFormat, setSelectedChequeFormat] = useState(null);
  const [paymentType, setPaymentType] = useState("A/c Payee");
  const [chequeBooks, setChequeBooks] = useState([]);
  const [chequeFormats, setChequeFormats] = useState([]);
  const [isCreatingCheques, setIsCreatingCheques] = useState(false);
  const [vouchersForChequeCreation, setVouchersForChequeCreation] = useState(
    [],
  );

  // NEW: State to track if we're in the combined approval+cheque flow
  const [isCombinedFlow, setIsCombinedFlow] = useState(false);
  const [pendingApprovalData, setPendingApprovalData] = useState(null);

  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchDebounced(value);
      setCurrentPage(1);
    }, 500),
    [],
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // Convert number to words (Indian Rupees format)
  const numberToWords = (num) => {
    if (num == 0) return "Zero";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertToWords = (n) => {
      if (n < 20) return ones[n];
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + convertToWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          convertToWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + convertToWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          convertToWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + convertToWords(n % 100000) : "")
        );
      return (
        convertToWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + convertToWords(n % 10000000) : "")
      );
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let words = convertToWords(rupees);
    if (paise > 0) {
      words += " and " + convertToWords(paise) + " Paise";
    }
    words += " Only";
    return words;
  };

  // Handle bank selection change for cheque print
  const handleBankChange = (bankKey) => {
    setSelectedBank(bankKey);
    setBankLayout(getBankLayout(bankKey));
    toast.success(
      `Layout changed to ${SUPPORTED_BANKS.find((b) => b.key == bankKey)?.name}`,
    );
  };

  // Update cheque print data
  const updateChequePrintData = (field, value) => {
    setChequePrintData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field == "amount") {
        const numAmount = parseFloat(value) || 0;
        updated.amountInWords = numberToWords(numAmount);
      }
      return updated;
    });
  };

  const handleChequePrint = async () => {
    if (!chequePrintData.payeeName?.trim()) {
      toast.error("Payee name is required");
      return;
    }
    if (!chequePrintData.amount || parseFloat(chequePrintData.amount) <= 0) {
      toast.error("Valid amount is required");
      return;
    }
    if (!chequePrintData.chequeDate) {
      toast.error("Cheque date is required");
      return;
    }
    if (!chequePrintData.amountInWords?.trim()) {
      toast.error("Amount in words is missing");
      return;
    }

    setIsPrinting(true);
    try {
      const html = buildChequePrintHtml({
        payeeName: chequePrintData.payeeName,
        amount: chequePrintData.amount,
        amountInWords: chequePrintData.amountInWords,
        chequeType: chequePrintData.chequeType,
        chequeDate: chequePrintData.chequeDate,
        bankLayout,
        offsetTopMm: chequePrintOffsets.top,
        offsetLeftMm: chequePrintOffsets.left,
        bankKey: selectedBank,
      });
      await printChequeHtml(html);

      const bankName =
        SUPPORTED_BANKS.find((b) => b.key == selectedBank)?.name ||
        selectedBank;
      toast.success(
        `Load ${bankName} cheque narrow-edge first (short edge). Set Scale 100%, margins None.`,
      );
      setShowChequePrintModal(false);
    } catch (error) {
      console.error("Error printing cheque:", error);
      toast.error("Failed to open cheque print");
    } finally {
      setIsPrinting(false);
    }
  };

  // Load cheque books and formats
  useEffect(() => {
    const loadChequeData = async () => {
      try {
        const [books, formats] = await Promise.all([
          ChequesApi.getAllChequeBooks(),
          ChequesApi.getAllChequeFormats(),
        ]);
        setChequeBooks(books);
        setChequeFormats(formats);
      } catch (error) {
        console.error("Error loading cheque data:", error);
      }
    };
    loadChequeData();
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const adminCheck =
        user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
      setIsAdmin(adminCheck);

      const deptId =
        user?.departmentData?.Dpt_id ||
        user?.apiUserData?.employee?.department?.Dpt_id;
      const parsedDeptId = deptId ? parseInt(deptId) : null;
      setUserDeptId(parsedDeptId);

      const desigId =
        user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
      const parsedDesigId = desigId ? parseInt(desigId) : null;
      setUserDesignationId(parsedDesigId);

      await loadMenuAndStage(adminCheck, parsedDeptId, parsedDesigId);
      await loadBankAccounts();
      await loadPaymentModes();
    };

    initialize();
  }, [user]);

  const loadMenuAndStage = async (adminCheck, deptId, desigId) => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/bookkeeping-vouchers/new-expense-challan-approval";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem) {
        setPageTitle(
          currentMenuItem.Fnc_Title || "Expense Challan Voucher Approval",
        );

        if (currentMenuItem.action && currentMenuItem.action.stage) {
          const stage = currentMenuItem.action.stage;
          setCurrentStage(stage);
          await loadActionsForStage(stage, adminCheck, deptId, desigId);
        } else {
          setPermissionsLoaded(true);
        }
      } else {
        setPermissionsLoaded(true);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
      setPermissionsLoaded(true);
    }
  };

  const loadActionsForStage = async (stage, adminCheck, deptId, desigId) => {
    if (!stage) {
      setPermissionsLoaded(true);
      return;
    }

    try {
      const response = await newChallanFlowService.getAllByStage(stage);

      if (response.status && response.data) {
        const actions = response.data;
        setActionsList(actions);

        const forwardActions = actions.filter((a) => a.Is_Forward == "Y");
        const usedAsPrevious = new Set(
          forwardActions.map((a) => a.Previous_Status?.toString()),
        );
        const terminalAction = forwardActions.find(
          (a) => !usedAsPrevious.has(a.Act_Id?.toString()),
        );
        setLastApprovedStatus(terminalAction?.Act_Id ?? null);

        const approvableIds = [];

        actions.forEach((action) => {
          if (action.Previous_Status) {
            let hasAuthority = adminCheck;

            if (!adminCheck && desigId) {
              const isAuthority = action.authorities_details?.some(
                (auth) => parseInt(auth.Dsg_id) == desigId,
              );
              hasAuthority = isAuthority;
            }

            if (hasAuthority) {
              approvableIds.push(parseInt(action.Previous_Status));
            }
          }
        });

        console.log("Approvable Status IDs:", approvableIds);
        setApprovableStatusIds(approvableIds);
      }

      setPermissionsLoaded(true);
    } catch (error) {
      console.error("Error loading actions for stage:", error);
      setPermissionsLoaded(true);
    }
  };

  const loadBankAccounts = async () => {
    try {
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
        Lg_Code: ledger.Lg_Code || `L${ledger.Lg_Id}`,
        Gr_Id: ledger.Gr_Id,
        ledger_group: ledger.ledger_group,
      }));

      setBankAccounts(mappedBankAccounts);
    } catch (err) {
      console.error("Error loading bank accounts:", err);
    }
  };

  const loadPaymentModes = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/lst-payment-mode?page=1&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
          },
        },
      );
      const modes = response.data?.data?.data || [];
      setPaymentModes(modes);
    } catch (err) {
      console.error("Error loading payment modes:", err);
    }
  };

  // Load vouchers from API with server-side pagination
  const loadAllVouchers = async () => {
    setLoading(true);
    try {
      let statusParam = "";
      if (
        selectedStatusFilter &&
        String(selectedStatusFilter) != String(lastApprovedStatus)
      ) {
        statusParam = String(selectedStatusFilter);
      } else if (approvableStatusIds.length > 0) {
        statusParam = approvableStatusIds
          .map((id) => parseInt(id))
          .filter((id) => !Number.isNaN(id) && String(id) != String(lastApprovedStatus))
          .join(",");
      }

      const deptSource =  user?.departmentData || user?.apiUserData?.employee?.department;

      const deptId = deptSource?.Dpt_id;

      const department =
        deptSource?.Dpt_Name == "Accounting Department" ||
        deptSource?.Dpt_Desc == "હિસાબી વિભાગ" ||
        deptSource?.Dpt_Name == "Accounting Branch" ||
        deptSource?.Dpt_Desc == "હિસાબી શાખા" ||
        deptSource?.Dpt_Name == "Office Of Municipal Commissioner" ||
        deptSource?.Dpt_Desc == "મ્યુનિ. કમિશ્રી કાર્યાલય";

      const skipDeptFilter = department;

      const result = await newChallanFlowService.getAll(
        currentPage,
        itemsPerPage,
        searchDebounced.trim(),
        skipDeptFilter ? "" : deptId,
        startDate || "",
        endDate || "",
        "N",
        statusParam,
      );

      const vouchers = (result.vouchers || []).filter(
        (v) => String(v.status_master?.Act_Id) != String(lastApprovedStatus),
      );
      const pagination = result.pagination || {};
      setAllVouchers(vouchers);
      setFilteredVouchers(vouchers);
      setTotalItems(Number(pagination.total) || 0);
      setTotalPages(Number(pagination.last_page) || 1);
    } catch (error) {
      console.error("Error loading vouchers:", error);
      toast.error("Failed to load vouchers");
      setAllVouchers([]);
      setFilteredVouchers([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!permissionsLoaded) return;
    loadAllVouchers();
  }, [
    permissionsLoaded,
    currentPage,
    itemsPerPage,
    searchDebounced,
    selectedStatusFilter,
    startDate,
    endDate,
    approvableStatusIds,
    lastApprovedStatus,
  ]);

  useEffect(() => {
    setSelectedVouchers(new Set());
  }, [currentPage, itemsPerPage, searchDebounced, startDate, endDate, selectedStatusFilter]);

  const getDefaultBankForPaymentMode = (paymentMode) => {
    if (!paymentMode) return null;

    const matchedMode = paymentModes.find(
      (pm) =>
        pm.PayMd_Name?.toLowerCase() == paymentMode.toLowerCase() ||
        pm.PayMd_Code?.toLowerCase() == paymentMode.toLowerCase(),
    );

    if (matchedMode?.ledger) {
      const defaultBank = bankAccounts.find(
        (bank) => bank.Lg_Id == matchedMode.ledger.Lg_Id,
      );
      if (defaultBank) return defaultBank;
    }

    return null;
  };

  const getDefaultCashBank = () => {
    const cashMode = paymentModes.find((pm) => pm.Is_Cash == 1);
    if (cashMode?.ledger) {
      const defaultBank = bankAccounts.find(
        (bank) => bank.Lg_Id == cashMode.ledger.Lg_Id,
      );
      if (defaultBank) return defaultBank;
    }
    return null;
  };

  const autoSelectBankAccountsForVoucher = useCallback(
    (voucher) => {
      const details = voucher.details || [];
      let totalCashAmount = 0;
      const newCashBankAccount = {};
      const newDetailSelections = {};

      details.forEach((detail) => {
        const paymentMode =
          detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
        const amount = parseFloat(detail.Amount) || 0;
        if (isCashMode(paymentMode) && amount > 0) {
          totalCashAmount += amount;
        }
      });

      if (totalCashAmount > 0) {
        const defaultCashBank = getDefaultCashBank();
        if (defaultCashBank) {
          newCashBankAccount[voucher.CV_Id] = defaultCashBank;
        }
      }

      details.forEach((detail, idx) => {
        const paymentMode =
          detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
        const amount = parseFloat(detail.Amount) || 0;
        if (amount <= 0) return;

        if (detail.SL_Lg_Id) {
          const existingAccount =
            bankAccounts.find((acc) => acc.Lg_Id == detail.SL_Lg_Id) || {
              Lg_Id: detail.SL_Lg_Id,
              Lg_Name: detail.SL_Lg_Name || `Ledger ${detail.SL_Lg_Id}`,
              Lg_Code: `L${detail.SL_Lg_Id}`,
            };
          if (isCashMode(paymentMode)) {
            newCashBankAccount[voucher.CV_Id] = existingAccount;
          } else {
            newDetailSelections[`${voucher.CV_Id}_${idx}`] = existingAccount;
          }
          return;
        }

        if (!isCashMode(paymentMode)) {
          const defaultBank = getDefaultBankForPaymentMode(paymentMode);
          if (defaultBank) {
            newDetailSelections[`${voucher.CV_Id}_${idx}`] = defaultBank;
          }
        }
      });

      setVoucherCashBankAccounts((prev) => ({
        ...prev,
        ...newCashBankAccount,
      }));
      setVoucherDetailBankSelections((prev) => ({
        ...prev,
        ...newDetailSelections,
      }));

      return {
        cashSelected: Object.keys(newCashBankAccount).length > 0,
        detailSelected: Object.keys(newDetailSelections).length > 0,
      };
    },
    [paymentModes, bankAccounts],
  );

  const autoSelectAllVouchers = () => {
    vouchersForBankSelection.forEach((voucher) => {
      autoSelectBankAccountsForVoucher(voucher);
    });
  };

  useEffect(() => {
    if (
      paymentModes.length > 0 &&
      bankAccounts.length > 0 &&
      vouchersForBankSelection.length > 0 &&
      autoSelectEnabled &&
      !isFinalApprovalMode
    ) {
      autoSelectAllVouchers();
    }
  }, [paymentModes, bankAccounts, vouchersForBankSelection, autoSelectEnabled, isFinalApprovalMode]);

  const getNextActionForVoucher = (voucher) => {
    const currentStatusId = voucher.status_master?.Act_Id?.toString();
    if (!currentStatusId || actionsList.length == 0) return null;

    return actionsList.find(
      (action) =>
        action.Previous_Status == currentStatusId && action.Is_Forward == "Y",
    );
  };

  const hasApprovalPermission = (voucher) => {
    const nextAction = getNextActionForVoucher(voucher);
    if (!nextAction) return false;

    if (isAdmin) return true;

    const hasAuthority = nextAction.authorities_details?.some(
      (auth) => parseInt(auth.Dsg_id) == userDesignationId,
    );

    return hasAuthority;
  };

  const canBeApproved = (voucher) => {
    return hasApprovalPermission(voucher);
  };

  const requiresBankSelection = (voucher) => {
    const nextAction = getNextActionForVoucher(voucher);
    if (!nextAction) return false;
    return nextAction.Is_Bank_Select == "Y";
  };

  const isLastStageAction = (action) => {
    if (!action) return false;
    if (action.St_Name == "DYMC Approval") return true;
    if (lastApprovedStatus && action.Act_Id == lastApprovedStatus) return true;
    return false;
  };

  const resolveBankFromDetail = (detail) => {
    if (!detail?.SL_Lg_Id) return null;
    return (
      bankAccounts.find((acc) => acc.Lg_Id == detail.SL_Lg_Id) || {
        Lg_Id: detail.SL_Lg_Id,
        Lg_Name: detail.SL_Lg_Name || `Ledger ${detail.SL_Lg_Id}`,
        Lg_Code: `L${detail.SL_Lg_Id}`,
      }
    );
  };

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

  const getFilteredBankAccounts = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() == "") {
      return bankAccounts;
    }
    const term = searchTerm.toLowerCase();
    return bankAccounts.filter(
      (account) =>
        account.Lg_Name.toLowerCase().includes(term) ||
        (account.Lg_Eng_Name &&
          account.Lg_Eng_Name.toLowerCase().includes(term)) ||
        (account.Lg_Code && account.Lg_Code.toLowerCase().includes(term)),
    );
  };

  const handleCashBankSelect = (voucherId, account) => {
    setVoucherCashBankAccounts((prev) => ({
      ...prev,
      [voucherId]: account,
    }));
    setOpenDropdownForVoucher(null);
    setBankSearchTerms((prev) => ({ ...prev, [voucherId]: "" }));
    toast.success(`Bank account selected for Cash payments`);
  };

  const handleDetailBankSelect = (voucherId, detailIndex, account) => {
    setVoucherDetailBankSelections((prev) => ({
      ...prev,
      [`${voucherId}_${detailIndex}`]: account,
    }));
    setOpenDetailDropdownForVoucher((prev) => ({ ...prev, [voucherId]: null }));
    setDetailSearchTerms((prev) => ({
      ...prev,
      [`${voucherId}_${detailIndex}`]: "",
    }));
  };

  const toggleCashDropdown = (voucherId) => {
    if (openDropdownForVoucher == voucherId) {
      setOpenDropdownForVoucher(null);
    } else {
      setOpenDropdownForVoucher(voucherId);
      setBankSearchTerms((prev) => ({ ...prev, [voucherId]: "" }));
    }
  };

  const toggleDetailDropdown = (voucherId, detailIndex) => {
    if (openDetailDropdownForVoucher[voucherId] == detailIndex) {
      setOpenDetailDropdownForVoucher((prev) => ({
        ...prev,
        [voucherId]: null,
      }));
    } else {
      setOpenDetailDropdownForVoucher((prev) => ({
        ...prev,
        [voucherId]: detailIndex,
      }));
      setDetailSearchTerms((prev) => ({
        ...prev,
        [`${voucherId}_${detailIndex}`]: "",
      }));
    }
  };

  const getTotalAmountForVoucher = (voucher) => {
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

  const isCashMode = (mode) => {
    return mode == "Cash";
  };

  const getPaymentModeBadge = (mode) => {
    const styles = {
      Cash: "bg-green-100 text-green-800",
      Bank: "bg-blue-100 text-blue-800",
      Cheque: "bg-yellow-100 text-yellow-800",
      DD: "bg-orange-100 text-orange-800",
      Online: "bg-purple-100 text-purple-800",
      Card: "bg-pink-100 text-pink-800",
      Pos: "bg-indigo-100 text-indigo-800",
      MChallan: "bg-teal-100 text-teal-800",
    };
    return styles[mode] || "bg-gray-100 text-gray-800";
  };

  const validateBankSelectionsForVouchers = () => {
    for (const voucher of vouchersForBankSelection) {
      const details = voucher.details || [];
      let totalCash = 0;

      for (let idx = 0; idx < details.length; idx++) {
        const detail = details[idx];
        const amount = parseFloat(detail.Amount) || 0;
        const paymentMode =
          detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;

        if (amount <= 0) continue;

        if (isCashMode(paymentMode)) {
          totalCash += amount;
        } else {
          const selectionKey = `${voucher.CV_Id}_${idx}`;
          const hasBankInState = !!voucherDetailBankSelections[selectionKey];
          const hasBankInDetail = !!detail.SL_Lg_Id;
          if (!hasBankInState && !hasBankInDetail) {
            toast.error(
              `Please select a bank account for ${paymentMode} payment - ${detail.SL_Nm || "Party"} in voucher ${voucher.CV_No}`,
            );
            return false;
          }
        }
      }

      if (totalCash > 0 && !voucherCashBankAccounts[voucher.CV_Id]) {
        const hasCashInDetail = details.some(
          (d) =>
            isCashMode(d.Py_Mode || d.Payment_Mode || d.paymode?.PayMd_Name) &&
            d.SL_Lg_Id,
        );
        if (!hasCashInDetail) {
          toast.error(
            `Please select a bank account for Cash payments (Total: ${formatCurrency(totalCash)}) in voucher ${voucher.CV_No}`,
          );
          return false;
        }
      }
    }
    return true;
  };

  const preFillExistingBankAccounts = (voucherList) => {
    const newCashAccounts = {};
    const newDetailSelections = {};

    (voucherList || []).forEach((voucher) => {
      const details = voucher.details || [];
      details.forEach((detail, idx) => {
        const existingAccount = resolveBankFromDetail(detail);
        if (!existingAccount) return;
        const mode =
          detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
        if (isCashMode(mode)) {
          newCashAccounts[voucher.CV_Id] = existingAccount;
        } else {
          newDetailSelections[`${voucher.CV_Id}_${idx}`] = existingAccount;
        }
      });
    });

    setVoucherCashBankAccounts(newCashAccounts);
    setVoucherDetailBankSelections(newDetailSelections);
  };

  const processBulkBankSelection = async () => {
    if (!validateBankSelectionsForVouchers()) return;

    const nextActionForVoucher = getNextActionForVoucher(
      vouchersForBankSelection[0],
    );
    const requiresAccGen = nextActionForVoucher?.Is_Acc_Vou_No_Gen == "Y";

    setIsBulkApproving(true);
    setShowBankModal(false);

    Swal.fire({
      title: "Saving Bank Selections...",
      text: `Processing ${vouchersForBankSelection.length} voucher(s)...`,
      allowOutsideClick: false,
      showConfirmButton: false,
      backdrop: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const allUpdatePayload = [];

      for (const voucher of vouchersForBankSelection) {
        const details = voucher.details || [];

        for (let idx = 0; idx < details.length; idx++) {
          const detail = details[idx];
          const paymentMode =
            detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
          const amount = parseFloat(detail.Amount) || 0;
          const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
          const totalAmount = amount + penaltyAmount;
          if (totalAmount <= 0) continue;

          let bankAccount = null;
          if (isCashMode(paymentMode)) {
            bankAccount =
              voucherCashBankAccounts[voucher.CV_Id] ||
              resolveBankFromDetail(detail);
          } else {
            bankAccount =
              voucherDetailBankSelections[`${voucher.CV_Id}_${idx}`] ||
              resolveBankFromDetail(detail);
          }

          if (bankAccount) {
            allUpdatePayload.push({
              SL_Lg_Id: bankAccount.Lg_Id,
              Chl_Vou_Id: detail.CV_Id || parseInt(voucher.CV_Id),
            });
          }
        }
      }

      if (allUpdatePayload.length == 0) {
        toast.error("No bank accounts selected to update");
        Swal.close();
        setIsBulkApproving(false);
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/new-chl-voucher/update-sl-lg-id`,
        allUpdatePayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      Swal.close();

      if (response.data.success) {
        await Swal.fire({
          title: "Success!",
          html: `<div style="text-align: left;">
                   <p>Bank accounts selected successfully!</p>
                 </div>`,
          icon: "success",
          confirmButtonColor: "#10B981",
          timer: 2000,
          showConfirmButton: true,
          backdrop: true,
        });

        const userId = (() => {
          if (user?.apiUserData?.Usr_Id) return user.apiUserData.Usr_Id;
          if (user?.Usr_Id) return user.Usr_Id;
          try {
            const u = JSON.parse(localStorage.getItem("user") || "null");
            return u?.Usr_Id || u?.apiUserData?.Usr_Id || null;
          } catch (e) {
            return null;
          }
        })();

        const currentModule = (() => {
          try {
            const menuDetails = JSON.parse(
              localStorage.getItem("menu_details") || "[]",
            );
            const item = menuDetails.find(
              (m) =>
                m.Menu_Links ==
                "/transactions/bookkeeping-vouchers/new-expense-challan-approval",
            );
            return item?.Mod_Code || "";
          } catch (e) {
            return "CHAL";
          }
        })();

        const ids = vouchersForBankSelection.map((v) => v.CV_Id);

        await newChallanFlowService.bulkUpdateStatus(ids, {
          Status: nextStatusIdForBank,
          R_Status: null,
          UserId: userId,
          Mod_Code: currentModule,
          CHl_HOD: user?.apiUserData?.Usr_Id,
          Status_Remark: null,
          ...(requiresAccGen && { Acc_Chl_No: "generate" }),
        });

        toast.success(
          `${vouchersForBankSelection.length} voucher(s) updated successfully!`,
        );

        setVoucherCashBankAccounts({});
        setVoucherDetailBankSelections({});
        setSelectedVouchers(new Set());
        await loadAllVouchers();
      } else {
        await Swal.fire({
          title: "Error!",
          text: response.data.message || "Failed to update bank selections",
          icon: "error",
          confirmButtonColor: "#EF4444",
          backdrop: true,
        });
      }
    } catch (error) {
      console.error("Error updating bank selections:", error);
      Swal.close();
      await Swal.fire({
        title: "Error!",
        html: `<div style="text-align: left;">
                 <p>Failed to update bank selections</p>
                 <br/>
                 <p><strong>Error:</strong> ${error.message || "Unknown error"}</p>
               </div>`,
        icon: "error",
        confirmButtonColor: "#EF4444",
        backdrop: true,
      });
    } finally {
      setIsBulkApproving(false);
    }
  };

  // Get vouchers with cheque payments
  const getVouchersWithChequePayment = useCallback(() => {
    const chequeVouchers = [];
  
    vouchersForBankSelection.forEach((voucher) => {
      const details = voucher.details || [];
      details.forEach((detail, idx) => {
        const paymentMode =
          detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
        const isCheque = paymentMode?.toLowerCase() == "cheque";
        const amount = parseFloat(detail.Amount) || 0;
  
        if (isCheque && amount > 0) {
          // Use Net_Amount from voucher instead of calculating from detail
          const netAmount = parseFloat(voucher.Net_Amount) || 0;
          // Use netAmount if available, otherwise fallback to amount + penalty
          const totalAmount = netAmount > 0 ? netAmount : amount + (parseFloat(detail.Penalty_Amount) || 0);
  
          chequeVouchers.push({
            voucher,
            detail,
            index: idx,
            amount,
            totalAmount: totalAmount,
            payeeName: detail.SL_Nm || "",
            chequeNumber: detail.Chq_No || "",
            chequeDate: detail.Chq_Date || new Date().toISOString().split("T")[0],
            bankName: detail.Bank_Name || "",
            cvId: detail.CV_Id,
          });
        }
      });
    });
  
    return chequeVouchers;
  }, [vouchersForBankSelection]);

  // Check if any voucher has cheque payments
  const hasChequePayments = useCallback(() => {
    return getVouchersWithChequePayment().length > 0;
  }, [getVouchersWithChequePayment]);

  const processChequeCreation = useCallback(async () => {
    const chequeVouchers = getVouchersWithChequePayment();
  
    if (chequeVouchers.length == 0) {
      return true; // No cheques to create, continue with approval
    }
  
    if (!selectedChequeBook) {
      // Store the data and show the modal
      setVouchersForChequeCreation(chequeVouchers);
      setShowChequeCreationModal(true);
      return null; // Signal that we need user action
    }
  
    setIsCreatingCheques(true);
  
    try {
      let successCount = 0;
      let failedCount = 0;
  
      for (let i = 0; i < chequeVouchers.length; i++) {
        const item = chequeVouchers[i];
        // Use the totalAmount which is now Net_Amount
        const amountToUse = item.totalAmount;
        const { payeeName, chequeNumber, chequeDate, cvId } = item;
  
        const amountInWords = numberToWords(amountToUse);
  
        const chequePayload = {
          Org_Id: ORG_ID,
          cheque_book_id: selectedChequeBook.cheque_book_id || selectedChequeBook.id,
          cheque_number: chequeNumber || `CHQ${String(i + 1).padStart(4, "0")}`,
          cheque_date: chequeDate || new Date().toISOString().split("T")[0],
          SL_Name: payeeName || `Party ${i + 1}`,
          amount: amountToUse.toFixed(2),
          status: "1",
          CV_Id: cvId,
          amount_words: amountInWords,
          payment_type: paymentType,
        };
  
        try {
          const response = await axios.post(
            `${API_BASE_URL}/cheques`,
            chequePayload,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                "Content-Type": "application/json",
              },
              timeout: 15000,
            },
          );
  
          if (response.data && response.data.success != false) {
            successCount++;
          } else {
            failedCount++;
          }
        } catch (apiError) {
          failedCount++;
          console.error(`Error creating cheque ${i + 1}:`, apiError);
        }
      }
  
      if (successCount > 0) {
        toast.success(`${successCount} cheque(s) created successfully!`);
        if (failedCount > 0) {
          toast.warning(`${failedCount} cheque(s) failed to create.`);
        }
        await loadAllVouchers();
        return true;
      } else {
        toast.error("Failed to create cheque records.");
        return false;
      }
    } catch (error) {
      console.error("Cheque creation error:", error);
      toast.error(`Failed to process cheque creation: ${error.message}`);
      return false;
    } finally {
      setIsCreatingCheques(false);
      setIsCombinedFlow(false);
    }
  }, [
    getVouchersWithChequePayment,
    selectedChequeBook,
    paymentType,
    loadAllVouchers,
  ]);

  // Final approval: send bills to Manage Payments (no finan-trns here).
  const processFinancialEntries = useCallback(async (vouchersOverride, statusOverride) => {
    const vouchersToProcess = vouchersOverride?.length
      ? vouchersOverride
      : vouchersForBankSelection;
    const statusId = statusOverride ?? nextStatusIdForBank;

    if (!vouchersToProcess?.length) {
      toast.error("No vouchers selected for final approval");
      return false;
    }

    if (!vouchersOverride && !validateBankSelectionsForVouchers()) return false;

    setIsBulkApproving(true);
    setShowBankModal(false);
    setShowChequeCreationModal(false);
    setIsFinalApprovalMode(false);

    Swal.fire({
      title: "Sending to Manage Payments...",
      html: `Processing ${vouchersToProcess.length} voucher(s)...<br/><br/>
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

    try {
      const updateProgress = (percent) => {
        const progressBar = document.getElementById("bulk-progress-bar");
        if (progressBar) {
          progressBar.style.width = `${percent}%`;
        }
      };

      const userId = (() => {
        if (user?.apiUserData?.Usr_Id) return user.apiUserData.Usr_Id;
        if (user?.Usr_Id) return user.Usr_Id;
        try {
          const u = JSON.parse(localStorage.getItem("user") || "null");
          return u?.Usr_Id || u?.apiUserData?.Usr_Id || null;
        } catch (e) {
          return null;
        }
      })();

      const currentModule = (() => {
        try {
          const menuDetails = JSON.parse(
            localStorage.getItem("menu_details") || "[]",
          );
          const item = menuDetails.find(
            (m) =>
              m.Menu_Links ==
              "/transactions/bookkeeping-vouchers/new-expense-challan-approval",
          );
          return item?.Mod_Code || "";
        } catch (e) {
          return "CHAL";
        }
      })();

      let successCount = 0;
      let failedVouchers = [];

      for (let i = 0; i < vouchersToProcess.length; i++) {
        const voucher = vouchersToProcess[i];
        const percent = ((i + 1) / vouchersToProcess.length) * 100;
        updateProgress(percent);

        try {
          const content = document.querySelector(".swal2-html-container");
          if (content) {
            content.innerHTML = `Processing voucher ${i + 1} of ${vouchersToProcess.length}: ${voucher.CV_No}<br/><br/>
              <div class="progress-bar-container" style="width: 100%; background-color: #e5e7eb; border-radius: 8px; margin-top: 10px;">
                <div id="bulk-progress-bar" style="width: ${percent}%; background-color: #10B981; height: 8px; border-radius: 8px; transition: width 0.3s ease;"></div>
              </div>`;
          }

          const getCurrentDateString = () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };

          const nextActionForVoucher = getNextActionForVoucher(voucher);
          const isDymcApproval =
            nextActionForVoucher?.St_Name == "DYMC Approval";
          const lastApprovalDate = isDymcApproval
            ? getCurrentDateString()
            : undefined;

          // Status + park for Manage Payments. finan-trns runs after Kotak success.
          await newChallanFlowService.bulkUpdateStatus([voucher.CV_Id], {
            Status: statusId,
            R_Status: null,
            UserId: userId,
            Mod_Code: currentModule,
            CHl_HOD: user?.apiUserData?.Usr_Id,
            Status_Remark: null,
            Py_Status: "initiate",
            Cms_Message_Id: null,
            Cms_Inst_Ref_No: null,
            Cms_Status: null,
            Cms_Utr: null,
            Cms_Pay_Mode: null,
            ...(isDymcApproval && { Last_Approval_Date: lastApprovalDate }),
          });

          successCount++;
        } catch (err) {
          console.error(`Error processing voucher ${voucher.CV_No}:`, err);
          failedVouchers.push({
            id: voucher.CV_Id,
            no: voucher.CV_No,
            reason: err.message,
          });
        }
      }

      updateProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));
      Swal.close();

      let message = `<div style="text-align: left;">`;
      if (successCount > 0) {
        message += `<p class="text-green-600">✅ ${successCount} voucher(s) sent to Manage Payments!</p>`;
        message += `<p class="text-sm text-gray-600 mt-2">Pay these bills from Manage Payments. Financial entries are created after bank payment success.</p>`;
      }
      if (failedVouchers.length > 0) {
        message += `<p class="text-red-600 mt-2">❌ ${failedVouchers.length} voucher(s) failed:</p>`;
        message += `<ul class="text-sm text-red-600 mt-1">`;
        failedVouchers.forEach((f) => {
          message += `<li>${f.no}: ${f.reason}</li>`;
        });
        message += `</ul>`;
      }
      message += `</div>`;

      await Swal.fire({
        title: successCount > 0 ? "Processing Complete" : "All Vouchers Failed",
        html: message,
        icon: successCount > 0 ? "success" : "error",
        confirmButtonColor: "#10B981",
      });

      if (successCount > 0) {
        setSelectedVouchers(new Set());
        setVoucherCashBankAccounts({});
        setVoucherDetailBankSelections({});
        setNarration("");
        setVouchersForBankSelection([]);
        setSelectedChequeBook(null);
      }
    } catch (error) {
      console.error("Bulk final approval error:", error);
      Swal.close();

      await Swal.fire({
        title: "Error!",
        html: `<p>Failed to process bulk final approval: ${error.message}</p>`,
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
      return false;
    } finally {
      setIsBulkApproving(false);
      setShowBankModal(false);
      setIsFinalApprovalMode(false);
      try {
        await loadAllVouchers();
      } catch (reloadError) {
        console.error("Error reloading vouchers after approval:", reloadError);
      }
    }
  }, [
    vouchersForBankSelection,
    nextStatusIdForBank,
    user,
    loadAllVouchers,
    validateBankSelectionsForVouchers,
  ]);

  // Process single voucher financial entries (helper function)
  const processSingleVoucherFinancialEntries = async (
    voucher,
    cashBankAccount,
    detailBankSelections,
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

    let taxBreakdown = [];
    for (const detail of details) {
      if (detail.pay_details && detail.pay_details.length > 0) {
        const taxItems = detail.pay_details
          .filter((p) => p.PD_Ty == "TAX")
          .map((p) => ({
            ...p,
            calculatedAmount: parseFloat(p.IC_Amt) || 0,
            isAdd: p.Add_Dedu == "1" || p.Add_Dedu == 1,
            Lg_Id: p.Lg_Id,
          }));
        taxBreakdown = [...taxBreakdown, ...taxItems];
      }
    }

    for (let idx = 0; idx < details.length; idx++) {
      const detail = details[idx];
      const paymentMode =
        detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
      const amount = parseFloat(detail.Amount) || 0;
      const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
      const totalAmount = amount + penaltyAmount;
      const subLedgerId = detail.ledger?.SL_Id || detail.sub_ledger?.SL_Id;
      const isCash = isCashMode(paymentMode);
      const selectedFromState = isCash
        ? cashBankAccount
        : detailBankSelections[`${voucher.CV_Id}_${idx}`];
      const bankAccountLgId =
        selectedFromState?.Lg_Id || detail.SL_Lg_Id || null;

      if (totalAmount > 0 && bankAccountLgId && expenseLedgerId) {
        allTransactions.push({
          Org_Id: ORG_ID,
          Lg_Id: bankAccountLgId,
          Ref_Id: expenseLedgerId,
          Vou_Ty: "PAY",
          Vou_Id: paymentVoucherId.toString(),
          Vou_Sr: entryCounter.toString(),
          Vou_Ln: entryCounter.toString(),
          V_Mode: "G",
          Vou_Dt: transactionDate,
          Dr_Amt: null,
          Cr_Amt: totalAmount.toFixed(2),
          rmk1: narrationText || `Expense Payment: ${voucher.CV_No}`,
          Vou_Rf: voucher.CV_No,
        });
        entryCounter++;

        allTransactions.push({
          Org_Id: ORG_ID,
          Lg_Id: expenseLedgerId,
          Ref_Id: bankAccountLgId,
          Vou_Ty: "PAY",
          Vou_Id: paymentVoucherId.toString(),
          Vou_Sr: entryCounter.toString(),
          Vou_Ln: entryCounter.toString(),
          V_Mode: "G",
          Vou_Dt: transactionDate,
          Dr_Amt: totalAmount.toFixed(2),
          Cr_Amt: null,
          rmk1: narrationText || `Expense Payment: ${voucher.CV_No}`,
          Vou_Rf: voucher.CV_No,
        });
        entryCounter++;

        if (subLedgerId) {
          allTransactions.push({
            Org_Id: ORG_ID,
            Lg_Id: expenseLedgerId,
            Ref_Id: bankAccountLgId,
            Vou_Ty: "PAY",
            Vou_Id: paymentVoucherId.toString(),
            Vou_Sr: entryCounter.toString(),
            Vou_Ln: entryCounter.toString(),
            V_Mode: "S",
            Vou_Dt: transactionDate,
            Dr_Amt: totalAmount.toFixed(2),
            Cr_Amt: null,
            rmk1: narrationText || `Expense Payment: ${voucher.CV_No}`,
            Vou_Rf: voucher.CV_No,
            SL_Id: subLedgerId.toString(),
            SL_Amt: totalAmount.toFixed(2),
          });
          entryCounter++;
        }
      }
    }

    if (taxBreakdown && taxBreakdown.length > 0) {
      for (const tax of taxBreakdown) {
        const isAdd = tax.isAdd;
        const amount = tax.calculatedAmount;
        const taxLedgerId = tax.Lg_Id;

        if (amount > 0 && taxLedgerId && expenseLedgerId) {
          allTransactions.push({
            Org_Id: ORG_ID,
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
            rmk1: narrationText || `Expense Payment: ${voucher.CV_No}`,
            Vou_Rf: voucher.CV_No,
          });
          entryCounter++;

          allTransactions.push({
            Org_Id: ORG_ID,
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
            rmk1: narrationText || `Expense Payment: ${voucher.CV_No}`,
            Vou_Rf: voucher.CV_No,
          });
          entryCounter++;
        }
      }
    }

    for (const transaction of allTransactions) {
      Object.keys(transaction).forEach((key) => {
        if (transaction[key] == undefined || transaction[key] == null) {
          delete transaction[key];
        }
      });
    }

    if (allTransactions.length > 0) {
      await axios.post(
        `${API_BASE_URL}/finan-trns/bulk`,
        { transactions: allTransactions },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );
    }

    return allTransactions.length;
  };

  // Combined function: cheque at bank selection; last approval sends to Manage Payments.
  const handleCombinedApproval = useCallback(async () => {
    if (!validateBankSelectionsForVouchers()) return;

    // Last approval: park for Manage Payments. Do not create cheques or finan-trns.
    if (isFinalApprovalMode) {
      await processFinancialEntries();
      return;
    }

    // Bank selection: create cheque records (if cheque payment), then save SL_Lg_Id.
    const hasCheque = hasChequePayments();

    if (hasCheque) {
      if (!selectedChequeBook) {
        const chequeVouchers = getVouchersWithChequePayment();
        setVouchersForChequeCreation(chequeVouchers);
        setShowChequeCreationModal(true);
        setIsCombinedFlow(true);
        return;
      }

      const chequeResult = await processChequeCreation();

      if (chequeResult == false) {
        toast.error("Cheque creation failed. Approval process stopped.");
        return;
      }

      if (chequeResult == true || chequeResult == null) {
        await processBulkBankSelection();
      }
    } else {
      await processBulkBankSelection();
    }
  }, [
    hasChequePayments,
    selectedChequeBook,
    getVouchersWithChequePayment,
    processChequeCreation,
    processFinancialEntries,
    processBulkBankSelection,
    validateBankSelectionsForVouchers,
    isFinalApprovalMode,
  ]);

  // Handle "Create Cheque & Approve" button click in Cheque Creation Modal
  const handleCreateChequeAndApprove = useCallback(async () => {
    if (!selectedChequeBook) {
      toast.error("Please select a cheque book.");
      return;
    }

    if (!paymentType) {
      toast.error("Please select payment type.");
      return;
    }

    // Close cheque modal first so it cannot block later dialogs
    setShowChequeCreationModal(false);
    setVouchersForChequeCreation([]);

    const chequeResult = await processChequeCreation();

    if (chequeResult == false) {
      toast.error("Cheque creation failed. Approval process stopped.");
      setIsCombinedFlow(false);
      return;
    }

    if (chequeResult == true) {
      if (isFinalApprovalMode) {
        await processFinancialEntries();
      } else {
        await processBulkBankSelection();
      }
    }

    setIsCombinedFlow(false);
  }, [
    selectedChequeBook,
    paymentType,
    processChequeCreation,
    processFinancialEntries,
    processBulkBankSelection,
    isFinalApprovalMode,
  ]);

  const toggleSelectVoucher = (voucherId) => {
    const newSelected = new Set(selectedVouchers);
    if (newSelected.has(voucherId)) {
      newSelected.delete(voucherId);
    } else {
      newSelected.add(voucherId);
    }
    setSelectedVouchers(newSelected);
  };

  const toggleSelectAll = () => {
    const selectableVouchers = filteredVouchers.filter((v) => canBeApproved(v));

    if (
      selectedVouchers.size == selectableVouchers.length &&
      selectableVouchers.length > 0
    ) {
      setSelectedVouchers(new Set());
    } else {
      const allIds = selectableVouchers.map((v) => v.CV_Id);
      setSelectedVouchers(new Set(allIds));
    }
  };

  const isAllSelected = () => {
    const selectableVouchers = filteredVouchers.filter((v) => canBeApproved(v));
    return (
      selectableVouchers.length > 0 &&
      selectedVouchers.size == selectableVouchers.length
    );
  };

  const getSelectableCount = () => {
    return filteredVouchers.filter((v) => canBeApproved(v)).length;
  };

  const handleBulkApproval = async () => {
    if (selectedVouchers.size == 0) {
      toast.error("Please select at least one voucher to approve");
      return;
    }

    const selectedVoucherList = filteredVouchers.filter((v) =>
      selectedVouchers.has(v.CV_Id),
    );

    const nextStatusIds = new Set();
    for (const voucher of selectedVoucherList) {
      const action = getNextActionForVoucher(voucher);
      if (action) {
        nextStatusIds.add(action.Act_Id);
      }
    }

    if (nextStatusIds.size > 1) {
      toast.error(
        "Selected vouchers have different next stages. Please select vouchers with same approval stage.",
      );
      return;
    }

    const nextAction = getNextActionForVoucher(selectedVoucherList[0]);
    if (!nextAction) {
      toast.error("Cannot determine next action for selected vouchers");
      return;
    }

    const isFinal = isLastStageAction(nextAction);
    const requiresBank = nextAction.Is_Bank_Select == "Y";

    const anyRequiresBankSelection = selectedVoucherList.some((v) =>
      requiresBankSelection(v),
    );
    const allRequireBankSelection = selectedVoucherList.every((v) =>
      requiresBankSelection(v),
    );

    if (anyRequiresBankSelection && !allRequireBankSelection) {
      toast.error(
        "Cannot mix vouchers that require bank selection with those that don't. Please select vouchers of the same type.",
      );
      return;
    }

    // Last stage: skip Confirm Bank Accounts preview; post using saved banks.
    if (isFinal) {
      const allHaveSL = selectedVoucherList.every((v) =>
        v.details?.every((detail) => {
          const amount = parseFloat(detail.Amount) || 0;
          const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
          if (amount + penaltyAmount <= 0) return true;
          return detail.SL_Lg_Id != null;
        }),
      );

      if (!allHaveSL) {
        toast.error(
          "Bank accounts are not selected for some vouchers. Please ensure bank selections are saved before final approval.",
        );
        return;
      }

      const result = await Swal.fire({
        title: "Bulk Approval",
        html: `
          <div style="text-align: left;">
            <p><strong>Are you sure you want to approve ${selectedVouchers.size} voucher(s)?</strong></p>
            <p class="text-sm text-gray-600 mt-2">This will send approved vouchers to Manage Payments for bank payment.</p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10B981",
        cancelButtonColor: "#6B7280",
        confirmButtonText: `Yes, Approve ${selectedVouchers.size} Voucher(s)`,
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      await processFinancialEntries(selectedVoucherList, nextAction.Act_Id);
      return;
    }

    if (requiresBank || allRequireBankSelection) {
      setVouchersForBankSelection(selectedVoucherList);
      setNextStatusIdForBank(nextAction.Act_Id);
      setIsFinalApprovalMode(false);
      setAutoSelectEnabled(true);
      setShowBankModal(true);
      return;
    }

    // For vouchers that don't require bank selection, process directly
    const result = await Swal.fire({
      title: "Bulk Approval",
      html: `
        <div style="text-align: left;">
          <p><strong>Are you sure you want to approve ${selectedVouchers.size} voucher(s)?</strong></p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, Approve ${selectedVouchers.size} Voucher(s)`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsBulkApproving(true);

    Swal.fire({
      title: "Processing Bulk Approval...",
      html: `Approving ${selectedVouchers.size} voucher(s)...`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      let successCount = 0;
      let failedIds = [];

      const userId = (() => {
        if (user?.apiUserData?.Usr_Id) return user.apiUserData.Usr_Id;
        if (user?.Usr_Id) return user.Usr_Id;
        try {
          const u = JSON.parse(localStorage.getItem("user") || "null");
          return u?.Usr_Id || u?.apiUserData?.Usr_Id || null;
        } catch (e) {
          return null;
        }
      })();
      const currentModule = (() => {
        try {
          const menuDetails = JSON.parse(
            localStorage.getItem("menu_details") || "[]",
          );
          const item = menuDetails.find(
            (m) =>
              m.Menu_Links ==
              "/transactions/bookkeeping-vouchers/new-expense-challan-approval",
          );
          return item?.Mod_Code || "";
        } catch (e) {
          return "CHAL";
        }
      })();
      const gvnNo = (() => {
        try {
          const menuDetails = JSON.parse(
            localStorage.getItem("menu_details") || "[]",
          );
          const item = menuDetails.find(
            (m) =>
              m.Menu_Links ==
              "/transactions/bookkeeping-vouchers/new-expense-challan-approval",
          );
          return item?.gvn_no ?? item?.gen_voucher_no?.gvn_no ?? null;
        } catch (e) {
          return null;
        }
      })();

      const ids = selectedVoucherList.map((v) => v.CV_Id);

      const getCurrentDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      try {
        const isDymcApproval = nextAction.St_Name == "DYMC Approval";
        const lastApprovalDate = isDymcApproval
          ? getCurrentDateString()
          : undefined;

        if (nextAction.Is_Acc_Vou_No_Gen == "Y") {
          if (gvnNo) {
            await newChallanFlowService.bulkSetAccChlNo(ids, {
              Status: nextAction.Act_Id,
              R_Status: null,
              UserId: userId,
              Mod_Code: currentModule,
              CHl_HOD: user?.apiUserData?.Usr_Id,
              Status_Remark: null,
              gvn_no: gvnNo,
              is_income: "N",
              ...(isDymcApproval && { Last_Approval_Date: lastApprovalDate }),
            });
          } else {
            await newChallanFlowService.bulkUpdateStatus(ids, {
              Status: nextAction.Act_Id,
              R_Status: null,
              UserId: userId,
              Mod_Code: currentModule,
              CHl_HOD: user?.apiUserData?.Usr_Id,
              Status_Remark: null,
              Acc_Chl_No: "generate",
              ...(isDymcApproval && { Last_Approval_Date: lastApprovalDate }),
            });
          }
        } else {
          await newChallanFlowService.bulkUpdateStatus(ids, {
            Status: nextAction.Act_Id,
            R_Status: null,
            UserId: userId,
            Mod_Code: currentModule,
            CHl_HOD: user?.apiUserData?.Usr_Id,
            Status_Remark: null,
            ...(isDymcApproval && { Last_Approval_Date: lastApprovalDate }),
          });
        }
        successCount = ids.length;
      } catch (err) {
        console.error("Bulk approval error:", err);
        failedIds = ids;
      }

      Swal.close();

      if (successCount > 0) {
        toast.success(`${successCount} voucher(s) approved successfully!`);
        if (failedIds.length > 0) {
          toast.error(
            `${failedIds.length} voucher(s) failed: ${failedIds.join(", ")}`,
          );
        }
        setSelectedVouchers(new Set());
        await loadAllVouchers();
      } else {
        throw new Error("All vouchers failed to approve");
      }
    } catch (error) {
      console.error("Bulk approval error:", error);
      Swal.close();

      await Swal.fire({
        title: "Error!",
        html: `<p>Failed to process bulk approval: ${error.message}</p>`,
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsBulkApproving(false);
    }
  };

  const handlePerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    debouncedSearch.cancel();
    setSelectedVouchers(new Set());
    const alreadyDefault =
      currentPage == 1 &&
      !searchTerm &&
      !searchDebounced &&
      !selectedStatusFilter &&
      !startDate &&
      !endDate;
    setSearchTerm("");
    setSearchDebounced("");
    setSelectedStatusFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    if (alreadyDefault) {
      loadAllVouchers();
    }
    toast.success("Data refreshed successfully!");
  };

  const getStatusDisplay = (voucher) => {
    if (voucher?.RStatus) {
      return voucher.RStatus.St_Name || "Pending";
    }
    if (voucher.status_master) {
      return voucher.status_master.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = (voucher) => {
    const statusName = getStatusDisplay(voucher);

    let colorClass = "bg-yellow-100 text-yellow-800";
    const statusLower = statusName.toLowerCase();

    if (statusLower.includes("approv") || statusLower.includes("accept")) {
      colorClass = "bg-green-100 text-green-800";
    } else if (
      statusLower.includes("reject") ||
      statusLower.includes("deny") ||
      statusLower.includes("query")
    ) {
      colorClass = "bg-red-100 text-red-800";
    } else if (statusLower.includes("pend") || statusLower.includes("wait")) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (statusLower.includes("verif") || statusLower.includes("check")) {
      colorClass = "bg-blue-100 text-blue-800";
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

  const getBranchDisplay = (voucher) => {
    if (!voucher.department) return "N/A";
    const dept = voucher.department;
    let displayText = dept.Dpt_Desc || "";
    if (dept.Dpt_Name && dept.Dpt_Name != dept.Dpt_Desc) {
      displayText += ` (${dept.Dpt_Name})`;
    }
    return displayText;
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleStatusFilterChange = (statusId) => {
    setSelectedStatusFilter(selectedStatusFilter == statusId ? "" : statusId);
    setCurrentPage(1);
  };

  if (!permissionsLoaded) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading permissions...</p>
      </div>
    );
  }

  const selectableCount = getSelectableCount();
  const allSelected = isAllSelected();

  return (
    <div className="p-6">
      {/* Bank Selection Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {isFinalApprovalMode
                        ? "DYMC Approval - Confirm Bank Accounts"
                        : "Select Bank Accounts"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {isFinalApprovalMode
                        ? "Review selected bank accounts and confirm to send bills to Manage Payments"
                        : `Select bank accounts for ${vouchersForBankSelection.length} voucher(s)`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowBankModal(false);
                    setIsFinalApprovalMode(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {vouchersForBankSelection.map((voucher) => {
                const totalAmount = getTotalAmountForVoucher(voucher);
                const details = voucher.details || [];
                const cashBankAccount = isFinalApprovalMode
                  ? resolveBankFromDetail(
                      details.find(
                        (d) =>
                          isCashMode(
                            d.Py_Mode || d.Payment_Mode || d.paymode?.PayMd_Name,
                          ) && d.SL_Lg_Id,
                      ),
                    ) || voucherCashBankAccounts[voucher.CV_Id]
                  : voucherCashBankAccounts[voucher.CV_Id];
                const isCashDropdownOpen =
                  openDropdownForVoucher == voucher.CV_Id;
                const cashSearchTerm = bankSearchTerms[voucher.CV_Id] || "";

                let totalCashAmount = 0;
                details.forEach((detail) => {
                  const paymentMode =
                    detail.Py_Mode ||
                    detail.Payment_Mode ||
                    detail.paymode?.PayMd_Name;
                  const amount = parseFloat(detail.Amount) || 0;
                  if (isCashMode(paymentMode) && amount > 0) {
                    totalCashAmount += amount;
                  }
                });

                return (
                  <div
                    key={voucher.CV_Id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="font-semibold text-gray-900">
                          {voucher.CV_No}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          Total: {formatCurrency(totalAmount)}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${isFinalApprovalMode ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {isFinalApprovalMode
                          ? "DYMC Approval"
                          : "Bank Selection"}
                      </span>
                    </div>

                    {/* Cash Payments Section */}
                    {totalCashAmount > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center mb-2">
                          <Banknote className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm font-medium">
                            Cash Payments (Total:{" "}
                            {formatCurrency(totalCashAmount)})
                          </span>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              !isFinalApprovalMode &&
                              toggleCashDropdown(voucher.CV_Id)
                            }
                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 flex justify-between items-center ${isFinalApprovalMode ? "bg-gray-100 cursor-default" : "hover:bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200"} outline-none text-sm bg-white`}
                          >
                            <span
                              className={
                                cashBankAccount
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }
                            >
                              {cashBankAccount
                                ? `${cashBankAccount.Lg_Name} (${cashBankAccount.Lg_Code || cashBankAccount.Lg_Id})`
                                : isFinalApprovalMode
                                  ? "No bank account selected"
                                  : "Select Bank Account for Cash"}
                            </span>
                            {!isFinalApprovalMode &&
                              (isCashDropdownOpen ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ))}
                          </button>

                          {!isFinalApprovalMode && isCashDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                              <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <input
                                    type="text"
                                    value={cashSearchTerm}
                                    onChange={(e) =>
                                      setBankSearchTerms((prev) => ({
                                        ...prev,
                                        [voucher.CV_Id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Search by name or code..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="overflow-y-auto max-h-60">
                                {getFilteredBankAccounts(cashSearchTerm)
                                  .length > 0 ? (
                                  getFilteredBankAccounts(cashSearchTerm).map(
                                    (account) => (
                                      <button
                                        key={account.Lg_Id}
                                        type="button"
                                        onClick={() =>
                                          handleCashBankSelect(
                                            voucher.CV_Id,
                                            account,
                                          )
                                        }
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 ${
                                          cashBankAccount?.Lg_Id ==
                                          account.Lg_Id
                                            ? "bg-green-50 text-green-700"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        <div className="font-medium text-sm">
                                          {account.Lg_Name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Code: {account.Lg_Code}
                                        </div>
                                      </button>
                                    ),
                                  )
                                ) : (
                                  <div className="px-4 py-8 text-center text-gray-500">
                                    No bank accounts found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Non-Cash Payments Section */}
                    {details.map((detail, idx) => {
                      const paymentMode =
                        detail.Py_Mode ||
                        detail.Payment_Mode ||
                        detail.paymode?.PayMd_Name;
                      const amount = parseFloat(detail.Amount) || 0;
                      if (amount <= 0 || isCashMode(paymentMode)) return null;

                      const selectionKey = `${voucher.CV_Id}_${idx}`;
                      const selectedAccount = isFinalApprovalMode
                        ? resolveBankFromDetail(detail) ||
                          voucherDetailBankSelections[selectionKey]
                        : voucherDetailBankSelections[selectionKey];
                      const isDetailOpen =
                        openDetailDropdownForVoucher[voucher.CV_Id] == idx;
                      const detailSearchTerm =
                        detailSearchTerms[selectionKey] || "";

                      const isChequeMode =
                        paymentMode?.toLowerCase() == "cheque";

                      return (
                        <div
                          key={idx}
                          className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center flex-wrap gap-2">
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentModeBadge(paymentMode)}`}
                              >
                                {paymentMode}
                              </span>
                              <span className="text-sm font-medium">
                                {detail.SL_Nm || "Party"}
                              </span>
                              <span className="text-sm text-gray-500">
                                Amount: {formatCurrency(amount)}
                              </span>
                              {detail.Chq_No && (
                                <span className="text-xs text-gray-500">
                                  Chq No: {detail.Chq_No}
                                </span>
                              )}
                              {selectedAccount && !isChequeMode && (
                                <span className="ml-2 text-xs text-green-600 flex items-center">
                                  <Check className="h-3 w-3 mr-0.5" />
                                  Auto-selected
                                </span>
                              )}
                              {isChequeMode && (
                                <span className="ml-2 text-xs text-blue-600 flex items-center">
                                  <Printer className="h-3 w-3 mr-0.5" />
                                  Cheque Payment
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                !isFinalApprovalMode &&
                                toggleDetailDropdown(voucher.CV_Id, idx)
                              }
                              className={`w-full border border-gray-300 rounded-lg px-4 py-2 flex justify-between items-center ${isFinalApprovalMode ? "bg-gray-100 cursor-default" : "hover:bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200"} outline-none text-sm bg-white`}
                            >
                              <span
                                className={
                                  selectedAccount
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }
                              >
                                {selectedAccount
                                  ? `${selectedAccount.Lg_Name} (${selectedAccount.Lg_Code || selectedAccount.Lg_Id})`
                                  : isFinalApprovalMode
                                    ? "No bank account selected"
                                    : `Select Bank Account for ${paymentMode}`}
                              </span>
                              {!isFinalApprovalMode &&
                                (isDetailOpen ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                ))}
                            </button>

                            {!isFinalApprovalMode && isDetailOpen && (
                              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                                <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                      type="text"
                                      value={detailSearchTerm}
                                      onChange={(e) =>
                                        setDetailSearchTerms((prev) => ({
                                          ...prev,
                                          [selectionKey]: e.target.value,
                                        }))
                                      }
                                      placeholder="Search by name or code..."
                                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                                      autoFocus
                                    />
                                  </div>
                                </div>
                                <div className="overflow-y-auto max-h-60">
                                  {getFilteredBankAccounts(detailSearchTerm)
                                    .length > 0 ? (
                                    getFilteredBankAccounts(
                                      detailSearchTerm,
                                    ).map((account) => (
                                      <button
                                        key={account.Lg_Id}
                                        type="button"
                                        onClick={() =>
                                          handleDetailBankSelect(
                                            voucher.CV_Id,
                                            idx,
                                            account,
                                          )
                                        }
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 ${
                                          selectedAccount?.Lg_Id ==
                                          account.Lg_Id
                                            ? "bg-green-50 text-green-700"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        <div className="font-medium text-sm">
                                          {account.Lg_Name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Code: {account.Lg_Code}
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-4 py-8 text-center text-gray-500">
                                      No bank accounts found
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {isFinalApprovalMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Narration / Description (Optional)
                </label>
                <textarea
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-sm"
                  placeholder="Enter common description for all payments..."
                  rows="3"
                />
              </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowBankModal(false);
                    setVouchersForBankSelection([]);
                    setIsFinalApprovalMode(false);
                  }}
                  disabled={isBulkApproving || isCreatingCheques}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCombinedApproval}
                  disabled={isBulkApproving || isCreatingCheques}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isBulkApproving || isCreatingCheques ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isFinalApprovalMode
                        ? "Process Financial Entries"
                        : `Save Bank Selections (${vouchersForBankSelection.length})`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cheque Creation Modal - Updated for combined flow */}
      {showChequeCreationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <Printer className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Create Cheque Records
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Create cheques for {vouchersForChequeCreation.length}{" "}
                      payment(s)
                      {isCombinedFlow && " before approval"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isCreatingCheques) {
                      setShowChequeCreationModal(false);
                      setIsCombinedFlow(false);
                      setVouchersForChequeCreation([]);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={isCreatingCheques}
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Cheque Book Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cheque Book <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedChequeBook?.cheque_book_id || ""}
                  onChange={(e) => {
                    const selected = chequeBooks.find(
                      (book) => book.cheque_book_id == parseInt(e.target.value),
                    );
                    setSelectedChequeBook(selected);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm bg-white"
                  disabled={isCreatingCheques}
                >
                  <option value="">Select Cheque Book</option>
                  {chequeBooks.map((book) => (
                    <option
                      key={book.cheque_book_id}
                      value={book.cheque_book_id}
                    >
                      {book.book_reference} -{" "}
                      {book.bank?.bank_name || "Unknown Bank"}
                      (Leaves: {book.available_leaves || book.total_leaves})
                    </option>
                  ))}
                </select>
                {selectedChequeBook && (
                  <p className="text-xs text-gray-500 mt-1">
                    Available leaves:{" "}
                    {selectedChequeBook.available_leaves ||
                      selectedChequeBook.total_leaves}
                  </p>
                )}
              </div>

              {/* Payment Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm bg-white"
                  disabled={isCreatingCheques}
                >
                  <option value="A/c Payee">A/c Payee</option>
                  <option value="Self">Self</option>
                  <option value="Bearer">Bearer</option>
                </select>
              </div>

              {/* Vouchers List Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cheque Records to Create ({vouchersForChequeCreation.length})
                </label>
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Voucher
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Payee
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vouchersForChequeCreation.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.voucher.CV_No}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {item.payeeName || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            {formatCurrency(item.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons - Updated for combined flow */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (!isCreatingCheques) {
                      setShowChequeCreationModal(false);
                      setIsCombinedFlow(false);
                      setVouchersForChequeCreation([]);
                    }
                  }}
                  disabled={isCreatingCheques}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateChequeAndApprove}
                  disabled={
                    isCreatingCheques || !selectedChequeBook || !paymentType
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isCreatingCheques ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isCombinedFlow
                        ? "Create Cheques & Approve"
                        : `Create ${vouchersForChequeCreation.length} Cheque(s)`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cheque Print Modal */}
      {showChequePrintModal && selectedChequeDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                    <Printer className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Print on Pre-printed Cheque
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Voucher: {selectedVoucherForCheque?.CV_No} | Chq No -{" "}
                      {selectedChequeDetail.Chq_No} | Bank:{" "}
                      {selectedChequeDetail.Bank_Name || "Not specified"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChequePrintModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Cheque Settings */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-white">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Landmark className="h-4 w-4 mr-1 text-blue-600" />
                  Cheque Settings
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => handleBankChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm bg-white"
                  >
                    {SUPPORTED_BANKS.map((bank) => (
                      <option key={bank.key} value={bank.key}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Load cheque with <strong>narrow (short) edge</strong> into
                    the printer. Set Scale 100%, margins None, headers off.
                  </p>
                </div>
              </div>

              {/* Print Preview Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  Print Preview
                </h4>
                <div
                  className="mx-auto bg-white border-2 border-blue-200 rounded shadow-inner relative overflow-hidden"
                  style={{
                    width: "100%",
                    maxWidth: "320px",
                    aspectRatio: `${CHEQUE_SIZE.widthMm} / ${CHEQUE_SIZE.heightMm}`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-white pointer-events-none" />

                  {(() => {
                    const words = splitAmountInWords(
                      chequePrintData.amountInWords,
                    );
                    const crossing = getChequeCrossingLabel(
                      chequePrintData.chequeType,
                    );
                    const scale = (v) => `${(v / CHEQUE_SIZE.heightMm) * 100}%`;
                    const scaleW = (v) => `${(v / CHEQUE_SIZE.widthMm) * 100}%`;

                    const previewLayout = bankLayout;

                    const isSelfType =
                      chequePrintData.chequeType?.toLowerCase() == "self";

                    return (
                      <>
                        {isSelfType && (
                          <div
                            className="absolute font-sans text-[10px] font-normal text-black whitespace-nowrap"
                            style={{
                              top: "5%",
                              left: "2%",
                              transform: "rotate(-45deg)",
                              transformOrigin: "0 0",
                            }}
                          >
                            SELF
                          </div>
                        )}

                        {!isSelfType && crossing && (
                          <div
                            className="absolute text-[8px] font-bold text-blue-900 -rotate-[18deg] origin-top-left"
                            style={{
                              top: scale(previewLayout.crossing.top),
                              left: scaleW(previewLayout.crossing.left),
                            }}
                          >
                            {crossing}
                          </div>
                        )}

                        <div
                          className="absolute font-mono text-[9px] font-bold text-red-700 bg-red-50/90 px-0.5"
                          style={{
                            top: scale(previewLayout.date.top),
                            ...(previewLayout.date.left != null
                              ? { left: scaleW(previewLayout.date.left) }
                              : { right: scaleW(previewLayout.date.right) }),
                            letterSpacing:
                              previewLayout.date.letterSpacing || "0.35em",
                          }}
                        >
                          {formatChequeDateDigits(
                            chequePrintData.chequeDate,
                            selectedBank,
                          )}
                        </div>

                        <div
                          className="absolute text-[9px] font-bold uppercase text-red-700 truncate"
                          style={{
                            top: scale(previewLayout.payee.top),
                            left: scaleW(previewLayout.payee.left),
                            maxWidth: "65%",
                          }}
                        >
                          {chequePrintData.payeeName}
                        </div>

                        <div
                          className="absolute text-[9px] font-bold text-red-700"
                          style={{
                            top: scale(previewLayout.amountFigures.top),
                            ...(previewLayout.amountFigures.left != null
                              ? {
                                  left: scaleW(
                                    previewLayout.amountFigures.left,
                                  ),
                                }
                              : {
                                  right: scaleW(
                                    previewLayout.amountFigures.right,
                                  ),
                                }),
                          }}
                        >
                          {parseFloat(
                            chequePrintData.amount || 0,
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>

                        <div
                          className="absolute text-[7px] text-red-700 capitalize leading-tight"
                          style={{
                            top: scale(previewLayout.amountWordsLine1.top),
                            left: scaleW(previewLayout.amountWordsLine1.left),
                            maxWidth: "58%",
                          }}
                        >
                          {words.line1}
                        </div>

                        {words.line2 && (
                          <div
                            className="absolute text-[7px] text-red-700 capitalize leading-tight"
                            style={{
                              top: scale(previewLayout.amountWordsLine2.top),
                              left: scaleW(previewLayout.amountWordsLine2.left),
                              maxWidth: "58%",
                            }}
                          >
                            {words.line2}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Edit Form Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payee Name
                    </label>
                    <input
                      type="text"
                      value={chequePrintData.payeeName}
                      onChange={(e) =>
                        updateChequePrintData("payeeName", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={chequePrintData.amount}
                      onChange={(e) =>
                        updateChequePrintData("amount", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cheque Type
                    </label>
                    <select
                      value={chequePrintData.chequeType}
                      onChange={(e) =>
                        updateChequePrintData("chequeType", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                    >
                      {CHEQUE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cheque Date
                    </label>
                    <input
                      type="date"
                      value={chequePrintData.chequeDate}
                      onChange={(e) =>
                        updateChequePrintData("chequeDate", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount in Words
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={chequePrintData.amountInWords}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Print offset Top (mm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={chequePrintOffsets.top}
                      onChange={(e) =>
                        setChequePrintOffsets((p) => ({
                          ...p,
                          top: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Move content DOWN (positive) or UP (negative)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Print offset Left (mm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={chequePrintOffsets.left}
                      onChange={(e) =>
                        setChequePrintOffsets((p) => ({
                          ...p,
                          left: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Move content RIGHT (positive) or LEFT (negative)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowChequePrintModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChequePrint}
                  disabled={isPrinting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isPrinting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Cheque
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
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              Review and approve expense challan vouchers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {selectedVouchers.size > 0 && (
            <button
              onClick={handleBulkApproval}
              disabled={isBulkApproving}
              className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium flex items-center transition-all shadow-md disabled:opacity-50"
            >
              {isBulkApproving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Approve Selected ({selectedVouchers.size})
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isBulkApproving}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-all disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter by Status */}
      {actionsList.filter(
        (action) =>
          action.Is_Forward == "Y" &&
          approvableStatusIds.includes(parseInt(action.Previous_Status)) &&
          String(action.Act_Id) != String(lastApprovedStatus),
      ).length > 1 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Filter by Status
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedStatusFilter("");
                setCurrentPage(1);
                setSelectedVouchers(new Set());
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                selectedStatusFilter == ""
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              All Stages
            </button>
            {actionsList
              .filter(
                (action) =>
                  approvableStatusIds.includes(parseInt(action.Previous_Status)) &&
                  String(action.Act_Id) != String(lastApprovedStatus),
              )
              .sort(
                (a, b) =>
                  parseInt(a.Previous_Status) - parseInt(b.Previous_Status),
              )
              .map((action) => {
                const statusStr = String(action.Previous_Status);
                const isActive = selectedStatusFilter == statusStr;
                return (
                  <button
                    key={action.Act_Id}
                    onClick={() => {
                      handleStatusFilterChange(statusStr);
                      setSelectedVouchers(new Set());
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {action.St_Name}
                    {isActive && <X className="h-3 w-3 ml-0.5" />}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
                setSelectedVouchers(new Set());
              }}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
                setSelectedVouchers(new Set());
              }}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {(startDate || endDate) && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setCurrentPage(1);
                setSelectedVouchers(new Set());
              }}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
            >
              Clear Dates
            </button>
          </div>
        )}
        <div className={`${startDate || endDate ? "" : "lg:col-start-4"}`}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
            Per Page
          </label>
          <select
            value={itemsPerPage}
            onChange={handlePerPageChange}
            disabled={isBulkApproving || loading}
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {perPageOptions.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex gap-0 rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by voucher number, department, challan type..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="w-full pl-10 pr-10 py-3 outline-none text-sm bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  debouncedSearch.cancel();
                  setSearchTerm("");
                  setSearchDebounced("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selected count indicator */}
      {selectedVouchers.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
          <div className="flex items-center">
            <CheckSquare className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              <strong>{selectedVouchers.size}</strong> voucher(s) selected for
              approval
            </span>
          </div>
          <button
            onClick={() => setSelectedVouchers(new Set())}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-4 text-center w-12">
                  {selectableCount > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      title={
                        allSelected
                          ? "Deselect all"
                          : "Select all approvable vouchers"
                      }
                    >
                      {allSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Voucher Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Challan Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Items
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading vouchers...</p>
                  </td>
                </tr>
              ) : filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => {
                  const hasPermission = canBeApproved(voucher);

                  return (
                    <tr
                      key={voucher.CV_Id}
                      className={`hover:bg-gray-50 transition-colors duration-150 group ${
                        selectedVouchers.has(voucher.CV_Id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() =>
                            hasPermission && toggleSelectVoucher(voucher.CV_Id)
                          }
                          className="text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                          disabled={!hasPermission}
                          title={
                            !hasPermission
                              ? "You don't have permission to approve this voucher"
                              : "Select for bulk approval"
                          }
                        >
                          {selectedVouchers.has(voucher.CV_Id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square
                              className={`h-5 w-5 ${!hasPermission ? "text-gray-300" : ""}`}
                            />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm font-semibold text-gray-900">
                              {voucher.CV_No}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              Date: {formatDate(voucher.Ch_Date)}
                            </span>
                          </div>

                          {voucher.Acc_Chl_No && (
                            <div className="mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                                Payment: {voucher.Acc_Chl_No}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-gray-900">
                            {getBranchDisplay(voucher)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {voucher.challan_type?.Cht_Name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                          <div className="text-xs text-green-600">
                            Total Amount
                          </div>
                          <div className="text-sm font-bold text-green-700">
                            {formatCurrency(getTotalAmountForVoucher(voucher))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {voucher.details?.length || 0} items
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(voucher)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/transactions/bookkeeping-vouchers/new-expense-challan-approval/view/${voucher.CV_Id}`}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150 inline-block"
                            title="View Details & Approve"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No vouchers found
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm || startDate || endDate
                          ? "No vouchers match your search or date filters."
                          : "No vouchers are pending for approval."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
        <div className="text-sm text-gray-700">
          Showing {totalItems == 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}{" "}
          to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
          {totalItems} entries
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={itemsPerPage}
            onChange={handlePerPageChange}
            disabled={isBulkApproving || loading}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {perPageOptions.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1 || isBulkApproving || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={isBulkApproving || loading}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage == pageNum
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={
                currentPage == totalPages || isBulkApproving || loading
              }
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewExpenseChallanApproval;
