// src/pages/Transactions/BookkeepingVouchers/NewExpenseChallanUpdate/ApprovalView.jsx

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  FileText,
  Shield,
  ShieldAlert,
  Check,
  AlertCircle,
  Hash,
  DollarSign,
  CreditCard,
  Landmark,
  Banknote,
  Receipt,
  Info,
  Percent,
  Calculator,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Printer,
  UserCheck,
  MessageSquare,
  HelpCircle,
  Copy,
  Save,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  TrendingUp,
  Eye,
  Edit,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";
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
  splitAmountInWords,
  getChequeCrossingLabel,
} from "../../../../utils/hdfcChequePrint";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const NewExpenseChallanApprovalView = ({ user }) => {
  const { id } = useParams();
  const [activityLogs, setActivityLogs] = useState([]);
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();
  const [showApproveButton, setShowApproveButton] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [nextAction, setNextAction] = useState(null);
  const [backwardAction, setBackwardAction] = useState(null);
  const [actionsForStage, setActionsForStage] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [lastApprovedStatus, setLastApprovedStatus] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [voucherLoaded, setVoucherLoaded] = useState(false);
  const [queryModal, setQueryModal] = useState(false);
  const [queryRemark, setQueryRemark] = useState("");
  const [queryReturnStatus, setQueryReturnStatus] = useState(null);
  const [showQueryButton, setShowQueryButton] = useState(false);

  // Financial Entry States
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const ORG_ID = 1;
  const [existingTransactions, setExistingTransactions] = useState([]);
  const [checkingTransactions, setCheckingTransactions] = useState(false);
  const [narration, setNarration] = useState("");

  // NEW: Combined flow states
  const [isCombinedFlow, setIsCombinedFlow] = useState(false);

  // Cheque Print States
  const [showChequePrintModal, setShowChequePrintModal] = useState(false);
  const [selectedChequeDetail, setSelectedChequeDetail] = useState(null);
  const [chequePrintData, setChequePrintData] = useState({
    payeeName: "",
    amount: "",
    amountInWords: "",
    chequeType: "A/c Payee",
    chequeDate: "",
    bankName: "",
    chequeNumber: "",
  });

  // Bank selection for cheque print
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [bankLayout, setBankLayout] = useState(() => getBankLayout("HDFC"));
  const [chequePrintOffsets, setChequePrintOffsets] = useState({
    top: 0,
    left: 0,
  });
  const [isPrinting, setIsPrinting] = useState(false);
  const chequePreviewRef = useRef(null);

  // Bank selection for each payment detail
  const [cashBankAccount, setCashBankAccount] = useState(null);
  const [cashBankDropdownOpen, setCashBankDropdownOpen] = useState(false);
  const [cashBankSearchTerm, setCashBankSearchTerm] = useState("");
  const [cashHighlightedIndex, setCashHighlightedIndex] = useState(-1);

  const [detailBankSelections, setDetailBankSelections] = useState({});
  const [openDropdownForDetail, setOpenDropdownForDetail] = useState(null);
  const [detailSearchTerms, setDetailSearchTerms] = useState({});
  const [detailHighlightedIndices, setDetailHighlightedIndices] = useState({});

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

  // Gen voucher config and financial year for Acc_Chl_No generation
  const [genVoucherConfig, setGenVoucherConfig] = useState(null);
  const [currentFinancialYear, setCurrentFinancialYear] = useState(null);

  // Refs
  const cashBankButtonRef = useRef(null);
  const cashBankSearchRef = useRef(null);
  const cashBankListRef = useRef(null);
  const cashBankItemRefs = useRef([]);
  const narrationRef = useRef(null);
  const processButtonRef = useRef(null);
  const detailRefs = useRef({});

  const [taxPopup, setTaxPopup] = useState(null);
  const openTaxPopup = (taxes) => {
    setTaxPopup(taxes);
    document.body.style.overflow = "hidden";
  };
  const closeTaxPopup = () => {
    setTaxPopup(null);
    document.body.style.overflow = "";
  };

  const [summary, setSummary] = useState({
    total: 0,
    cash: 0,
    bank: 0,
    cheque: 0,
    dd: 0,
    online: 0,
    card: 0,
  });
  const [totalPenalty, setTotalPenalty] = useState(0);
  const [taxCalculation, setTaxCalculation] = useState({
    grossAmount: 0,
    netAmount: 0,
    taxBreakdown: [],
    totalAdd: 0,
    totalLess: 0,
    totalTax: 0,
  });

  const userId = (() => {
    if (user?.apiUserData?.Usr_Id) return user.apiUserData.Usr_Id;
    if (user?.Usr_Id) return user.Usr_Id;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.Usr_Id || userData.apiUserData?.Usr_Id || null;
      } catch (e) {}
    }

    const sessionUser = sessionStorage.getItem("user");
    if (sessionUser) {
      try {
        const userData = JSON.parse(sessionUser);
        return userData.Usr_Id || userData.apiUserData?.Usr_Id || null;
      } catch (e) {}
    }

    const storedUserId = localStorage.getItem("menu_details");
    if (storedUserId) return parseInt(storedUserId);

    return null;
  })();

  const currentModule = (() => {
    var cModule;

    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details"));
      for (var i = 0; i < menuDetails.length; i++) {
        if (
          menuDetails[i].Menu_Links ==
          "/transactions/bookkeeping-vouchers/new-expense-challan-approval"
        ) {
          cModule = menuDetails[i].Mod_Code;
        }
      }

      if (cModule) {
        return cModule;
      } else {
        return "";
      }
    } catch (error) {
      return "CHAL";
    }
  })();

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

  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);

    const desigId =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    const parsedDesigId = desigId ? parseInt(desigId) : null;
    setUserDesignationId(parsedDesigId);

    loadMenuAndStage();
    loadOrganisationData();
    loadChequeData();
  }, [id, user]);

  // Load cheque books and formats
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

  const loadOrganisationData = async () => {
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
        Org_Id: ORG_ID,
        ledger_group: ledger.ledger_group,
      }));

      setBankAccounts(mappedBankAccounts);
    } catch (err) {
      console.error("Error loading organisation data:", err);
      toast.error("Failed to load bank accounts");
    }
  };

  const loadMenuAndStage = async () => {
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
        const gvnNo =
          currentMenuItem?.gvn_no ?? currentMenuItem?.gen_voucher_no?.gvn_no;
        if (gvnNo) {
          fetch(`${API_BASE_URL}/gen-voucher/${gvnNo}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
              Accept: "application/json",
            },
          })
            .then((res) => res.json())
            .then((json) => {
              if (json.success && json.data) setGenVoucherConfig(json.data);
            })
            .catch((e) =>
              console.error("Failed to fetch gen voucher config:", e),
            );
        }

        if (currentMenuItem?.action?.stage) {
          const stage = currentMenuItem.action.stage;
          setCurrentStage(stage);
          await loadActionsForStage(stage);
        } else {
          setPermissionsLoaded(true);
        }
      } else {
        setPermissionsLoaded(true);
      }

      try {
        const fyData = JSON.parse(
          localStorage.getItem("financial_year") || "null",
        );
        if (fyData) setCurrentFinancialYear(fyData);
      } catch (e) {
        console.error("Failed to parse financial year:", e);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
      setPermissionsLoaded(true);
    }
  };

  const loadActionsForStage = async (stage) => {
    try {
      const response = await newChallanFlowService.getAllByStage(stage);

      if (response.status && response.data) {
        setActionsForStage(response.data);

        const forwardActions = response.data.filter((a) => a.Is_Forward == "Y");
        const usedAsPrevious = new Set(
          forwardActions.map((a) => a.Previous_Status?.toString()),
        );
        const terminalAction = forwardActions.find(
          (a) => !usedAsPrevious.has(a.Act_Id?.toString()),
        );
        setLastApprovedStatus(terminalAction?.Act_Id ?? null);
      }
      setPermissionsLoaded(true);
    } catch (error) {
      console.error("Error loading actions:", error);
      setPermissionsLoaded(true);
    }
  };

  useEffect(() => {
    if (permissionsLoaded && actionsForStage.length > 0 && !voucherLoaded) {
      loadVoucherData();
    } else if (permissionsLoaded && actionsForStage.length == 0) {
      loadVoucherData();
    }
  }, [permissionsLoaded, actionsForStage]);

  const generateAccChlNo = (cvNo, deptDesc = "") => {
    if (!cvNo) return null;

    if (genVoucherConfig && genVoucherConfig.Is_Active == "Y") {
      const c = genVoucherConfig;
      const fyCode = currentFinancialYear?.FY_Code || "2026-27";
      const serial = "????";

      const segs = [];
      if (c.prifix)
        segs.push({ v: c.prifix, sep: c.prifix_dev_type || c.dev_type || "/" });
      if (c.Dept == "Y" && deptDesc)
        segs.push({ v: deptDesc, sep: c.dept_dev_type || c.dev_type || "/" });
      if (c.Text)
        segs.push({ v: c.Text, sep: c.text_dev_type || c.dev_type || "/" });
      segs.push({ v: serial, sep: c.no_dev_type || c.dev_type || "/" });
      if (c.FY == "Y") segs.push({ v: fyCode, sep: null });

      return segs
        .map((s, i) => (i < segs.length - 1 ? s.v + s.sep : s.v))
        .join("");
    }

    const parts = cvNo.split("/");

    if (parts.length >= 3) {
      const firstPart = parts[0];
      const remainingParts = parts.slice(1).join("/");
      return `${firstPart}/ACC/${remainingParts}`;
    } else if (parts.length == 2) {
      return `${parts[0]}/ACC/${parts[1]}`;
    } else {
      const lastSlashIndex = cvNo.lastIndexOf("/");
      if (lastSlashIndex != -1) {
        return (
          cvNo.substring(0, lastSlashIndex) +
          "/ACC" +
          cvNo.substring(lastSlashIndex)
        );
      }
      return `${cvNo}/ACC`;
    }
  };

  const fetchNextAccChlNo = async (cvNo, deptId = null, deptDesc = "") => {
    if (genVoucherConfig && genVoucherConfig.Is_Active == "Y") {
      try {
        const params = new URLSearchParams();

        params.append("is_income", "N");

        if (genVoucherConfig.No == "Dept_Series" && deptId) {
          params.append("dept_id", deptId);
        }

        const res = await axios.get(
          `${API_BASE_URL}/new-chl-voucher/next-acc-chl-no/data/by-acc-chl-no?${params}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
            },
          },
        );

        if (res.data.success && res.data.next_acc_chl_no != null) {
          const c = genVoucherConfig;
          const fyCode = currentFinancialYear?.FY_Code || "2026-27";
          const serial = String(res.data.next_acc_chl_no);

          const segs = [];
          if (c.prifix)
            segs.push({
              v: c.prifix,
              sep: c.prifix_dev_type || c.dev_type || "/",
            });
          if (c.Dept == "Y" && deptDesc)
            segs.push({
              v: deptDesc,
              sep: c.dept_dev_type || c.dev_type || "/",
            });
          if (c.Text)
            segs.push({ v: c.Text, sep: c.text_dev_type || c.dev_type || "/" });
          segs.push({ v: serial, sep: c.no_dev_type || c.dev_type || "/" });
          if (c.FY == "Y") segs.push({ v: fyCode, sep: null });

          return segs
            .map((s, i) => (i < segs.length - 1 ? s.v + s.sep : s.v))
            .join("");
        }
      } catch (err) {
        console.error("Failed to fetch next Acc_Chl_No from API:", err);
      }
    }

    return generateAccChlNo(cvNo, deptDesc);
  };

  const getFinalBackwardStatus = (currentStatusId) => {
    const currentBackwardAction = actionsForStage.find(
      (action) =>
        action.Previous_Status == currentStatusId?.toString() &&
        action.Is_Forward == "N",
    );

    if (!currentBackwardAction) {
      return null;
    }

    const firstStepStatus = parseInt(currentBackwardAction.Previous_Status);

    const firstStepAction = actionsForStage.find(
      (action) => parseInt(action.Act_Id) == firstStepStatus,
    );

    if (firstStepAction && firstStepAction.Previous_Status) {
      const secondStepStatus = parseInt(firstStepAction.Previous_Status);
      return secondStepStatus;
    } else {
      return firstStepStatus;
    }
  };

  const getBackwardActionDisplay = (currentStatusId) => {
    const currentBackwardAction = actionsForStage.find(
      (action) =>
        action.Previous_Status == currentStatusId?.toString() &&
        action.Is_Forward == "N",
    );

    if (!currentBackwardAction) {
      return null;
    }

    const firstStepStatus = parseInt(currentBackwardAction.Previous_Status);

    const firstStepAction = actionsForStage.find(
      (action) => parseInt(action.Act_Id) == firstStepStatus,
    );

    if (firstStepAction && firstStepAction.Previous_Status) {
      return {
        ...currentBackwardAction,
        _isTwoStepJump: true,
        _intermediateStatus: firstStepStatus,
        _intermediateActionName: firstStepAction.St_Name,
      };
    }

    return currentBackwardAction;
  };

  const checkExistingTransactions = async (voucherNo) => {
    setCheckingTransactions(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/finan-trns/all?Vou_Rf=${encodeURIComponent(voucherNo)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        const transactions = response.data.data;
        setExistingTransactions(transactions);

        if (transactions[0]?.rmk1) {
          setNarration(transactions[0].rmk1);
        }

        return transactions.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error checking existing transactions:", error);
      return false;
    } finally {
      setCheckingTransactions(false);
    }
  };

  const loadVoucherData = async () => {
    setLoading(true);
    setVoucherLoaded(false);
    try {
      const response = await newChallanFlowService.getById(id);
      const voucherData =
        response.data && response.data[0] ? response.data[0] : response.data;
      setVoucher(voucherData);

      await loadActivityLogs(voucherData.CV_No);
      let totalPenaltyAmount = 0;
      if (voucherData?.details) {
        voucherData.details.forEach((detail) => {
          totalPenaltyAmount += parseFloat(detail.Penalty_Amount) || 0;
        });

        const calcSummary = newChallanFlowService.calculateSummary(
          voucherData.details,
        );
        setSummary(calcSummary);
        setTotalPenalty(totalPenaltyAmount);

        const allPayDetails = voucherData.details.flatMap(
          (d) => d.pay_details || [],
        );
        const taxItems = allPayDetails.filter((p) => p.PD_Ty == "TAX");
        const taxMap = {};
        taxItems.forEach((t) => {
          const key = t.IC_Id;
          if (!taxMap[key]) {
            taxMap[key] = {
              ...t,
              calculatedAmount: parseFloat(t.IC_Amt) || 0,
              displayText: t.invoice_charge?.IC_Name || t.IC_Name || "",
              isAdd: t.Add_Dedu == 1 || t.Add_Dedu == "1",
              type: "tax",
              percentage: parseFloat(t.Percent),
            };
          } else {
            taxMap[key].calculatedAmount += parseFloat(t.IC_Amt) || 0;
          }
        });
        const taxBreakdown = Object.values(taxMap);
        const grossAmount = calcSummary.total;
        const totalAdd = taxBreakdown
          .filter((t) => t.isAdd)
          .reduce((s, t) => s + t.calculatedAmount, 0);
        const totalLess = taxBreakdown
          .filter((t) => !t.isAdd)
          .reduce((s, t) => s + t.calculatedAmount, 0);
        const netAmount =
          parseFloat(voucherData.Net_Amount) ||
          grossAmount + totalAdd - totalLess;
        setTaxCalculation({
          grossAmount,
          netAmount,
          taxBreakdown,
          totalAdd,
          totalLess,
          totalTax: totalAdd - totalLess,
        });
      }

      if (voucherData.status_master && actionsForStage.length > 0) {
        const currentAction = voucherData.status_master;
        let currentStatusId = currentAction.Act_Id?.toString();
        const forwardActionData = actionsForStage.find(
          (action) =>
            action.Previous_Status == currentStatusId &&
            action.Is_Forward == "Y",
        );
        if (forwardActionData) {
          setNextAction(forwardActionData);

          if (!isAdmin && userDesignationId) {
            const isAuthority = forwardActionData.authorities_details?.some(
              (auth) => parseInt(auth.Dsg_id) == userDesignationId,
            );
            const canApprove = isAuthority;
            setHasPermission(canApprove);
            setShowApproveButton(canApprove);
          } else if (isAdmin) {
            setHasPermission(true);
            setShowApproveButton(true);
          } else {
            setHasPermission(false);
            setShowApproveButton(false);
          }
        } else {
          setNextAction(null);
          setShowApproveButton(false);
          setHasPermission(false);
        }

        const backwardActionData = getBackwardActionDisplay(currentStatusId);

        if (backwardActionData) {
          setBackwardAction(backwardActionData);
          setShowQueryButton(true);

          const finalReturnStatus = getFinalBackwardStatus(currentStatusId);
          setQueryReturnStatus(finalReturnStatus);
        } else {
          setBackwardAction(null);
          setShowQueryButton(false);
          setQueryReturnStatus(null);
        }
      }

      setVoucherLoaded(true);
    } catch (error) {
      console.error("Error loading voucher:", error);
      toast.error("Failed to load voucher data!");
      navigate(
        "/transactions/bookkeeping-vouchers/new-expense-challan-approval",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async (cvNo) => {
    if (!cvNo) {
      console.log("No CV_No provided, skipping activity logs fetch");
      setActivityLogs([]);
      return;
    }

    try {
      console.log("Fetching activity logs for CV_No:", cvNo);
      const response = await newChallanFlowService.getActivityLogs(cvNo);
      console.log("Activity Logs Response:", response);

      if (response.success && response.data) {
        setActivityLogs(response.data);
        console.log("Activity Logs set successfully:", response.data);
      } else {
        console.log("No activity logs found or API returned unsuccessful");
        setActivityLogs([]);
      }
    } catch (error) {
      console.error("Error loading activity logs:", error);
      setActivityLogs([]);
    }
  };

  const openQueryModal = () => {
    setQueryModal(true);
    setQueryRemark("");
  };

  const closeQueryModal = () => {
    setQueryModal(false);
    setQueryRemark("");
  };

  const handleRaiseQuery = async () => {
    if (!queryRemark.trim()) {
      toast.error("Please provide query details");
      return;
    }

    if (!queryReturnStatus) {
      toast.error("Cannot determine return status");
      return;
    }

    if (!backwardAction) {
      toast.error("Cannot determine query action");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        Status: queryReturnStatus,
        R_Status: backwardAction.Act_Id,
        UserId: userId,
        Mod_Code: currentModule,
        Status_Remark: queryRemark,
        CHl_HOD: user?.apiUserData?.Usr_Id,
      };

      if (nextAction.St_Name == "DYMC Approval") {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        updateData.Last_Approval_Date = formattedDate;
      }
      await newChallanFlowService.updateStatus(id, updateData);

      toast.success(
        `Query raised successfully! Voucher returned to previous stage.`,
      );
      closeQueryModal();

      setShowApproveButton(false);
      setNextAction(null);
      setBackwardAction(null);
      setShowQueryButton(false);
      setQueryReturnStatus(null);
      setVoucherLoaded(false);
      await loadVoucherData();
    } catch (error) {
      console.error("Error raising query:", error);
      toast.error(error.response?.data?.message || "Failed to raise query");
    } finally {
      setIsUpdating(false);
    }
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
      const payTransactions = transactions.filter((t) => t.Vou_Ty == "PAY");

      if (payTransactions.length == 0) return 1;

      const voucherIds = payTransactions.map((t) => {
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

  const handleCashBankSelect = (account) => {
    setCashBankAccount(account);
    setCashBankDropdownOpen(false);
    setCashBankSearchTerm("");
    setCashHighlightedIndex(-1);
    toast.success(
      `Bank account selected for Cash payments: ${account.Lg_Name}`,
    );
  };

  const handleCashBankKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setCashBankDropdownOpen(true);
      setCashBankSearchTerm("");
      setCashHighlightedIndex(-1);
      setTimeout(() => cashBankSearchRef.current?.focus(), 0);
    }
  };

  const handleCashBankSearchKeyDown = (e) => {
    const filtered = getFilteredBankAccounts(cashBankSearchTerm);
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filtered.length > 0) {
        setCashHighlightedIndex(0);
        setTimeout(() => {
          if (cashBankItemRefs.current[0]) {
            cashBankItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setCashBankDropdownOpen(false);
      setCashBankSearchTerm("");
      setCashHighlightedIndex(-1);
      cashBankButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filtered.length > 0 && cashHighlightedIndex >= 0) {
        handleCashBankSelect(filtered[cashHighlightedIndex]);
      } else if (filtered.length > 0) {
        handleCashBankSelect(filtered[0]);
      }
    }
  };

  const handleCashBankItemKeyDown = (e, account, idx) => {
    const filtered = getFilteredBankAccounts(cashBankSearchTerm);
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filtered.length) {
        setCashHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (cashBankItemRefs.current[nextIndex]) {
            cashBankItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setCashHighlightedIndex(-1);
        setTimeout(() => cashBankSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setCashHighlightedIndex(-1);
        setTimeout(() => cashBankSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setCashHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (cashBankItemRefs.current[prevIndex]) {
            cashBankItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleCashBankSelect(account);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setCashBankDropdownOpen(false);
      setCashBankSearchTerm("");
      setCashHighlightedIndex(-1);
      cashBankButtonRef.current?.focus();
    }
  };

  const handleDetailBankSelect = (detailIndex, account) => {
    setDetailBankSelections((prev) => ({
      ...prev,
      [detailIndex]: account,
    }));
    setOpenDropdownForDetail(null);
    setDetailSearchTerms((prev) => ({ ...prev, [detailIndex]: "" }));
    setDetailHighlightedIndices((prev) => ({ ...prev, [detailIndex]: -1 }));
    toast.success(
      `Bank account selected for ${getPaymentModeLabel(detailIndex)}`,
    );
  };

  const toggleDetailDropdown = (detailIndex) => {
    if (openDropdownForDetail == detailIndex) {
      setOpenDropdownForDetail(null);
    } else {
      setOpenDropdownForDetail(detailIndex);
      setDetailSearchTerms((prev) => ({ ...prev, [detailIndex]: "" }));
      setDetailHighlightedIndices((prev) => ({ ...prev, [detailIndex]: -1 }));
    }
  };

  const handleDetailSearchKeyDown = (e, detailIndex) => {
    const searchTerm = detailSearchTerms[detailIndex] || "";
    const filtered = getFilteredBankAccounts(searchTerm);

    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filtered.length > 0) {
        setDetailHighlightedIndices((prev) => ({ ...prev, [detailIndex]: 0 }));
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setOpenDropdownForDetail(null);
      setDetailSearchTerms((prev) => ({ ...prev, [detailIndex]: "" }));
      setDetailHighlightedIndices((prev) => ({ ...prev, [detailIndex]: -1 }));
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        const highlightedIdx = detailHighlightedIndices[detailIndex] || 0;
        if (highlightedIdx >= 0 && filtered[highlightedIdx]) {
          handleDetailBankSelect(detailIndex, filtered[highlightedIdx]);
        } else if (filtered[0]) {
          handleDetailBankSelect(detailIndex, filtered[0]);
        }
      }
    }
  };

  const getPaymentModeLabel = (detailIndex) => {
    const detail = voucher?.details?.[detailIndex];
    if (!detail) return "Payment";
    const mode = detail.Py_Mode || detail.Payment_Mode;
    return `${mode} - ${detail.SL_Nm || "Vendor"}`;
  };

  const isCashMode = (mode) => {
    return mode == "Cash";
  };

  const needsBankSelection = (mode) => {
    return mode != "Cash";
  };

  const getNonCashDetails = () => {
    if (!voucher?.details) return [];
    return voucher.details.filter((detail) =>
      needsBankSelection(detail.Py_Mode || detail.Payment_Mode),
    );
  };

  const getTotalCashAmount = () => {
    if (!voucher?.details) return 0;
    return voucher.details
      .filter((detail) => isCashMode(detail.Py_Mode || detail.Payment_Mode))
      .reduce((sum, detail) => sum + (parseFloat(detail.Amount) || 0), 0);
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

  // ==================== CHEQUE CREATION FUNCTIONS ====================

  // Check if voucher has any cheque payments
  const hasChequePayments = () => {
    if (!voucher?.details) return false;

    return voucher.details.some((detail) => {
      const paymentMode =
        detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
      return paymentMode?.toLowerCase() == "cheque";
    });
  };

  const getChequeDetailsFromVoucher = () => {
    if (!voucher?.details) return [];

    const chequeDetails = [];
    voucher.details.forEach((detail, idx) => {
      const paymentMode =
        detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
      const isCheque = paymentMode?.toLowerCase() == "cheque";
      const amount = parseFloat(detail.Amount) || 0;

      if (isCheque && amount > 0) {
        // Use Net_Amount from the main voucher data, not from detail
        const netAmount = parseFloat(voucher.Net_Amount) || 0;

        chequeDetails.push({
          voucher,
          detail,
          index: idx,
          amount,
          totalAmount:
            netAmount > 0
              ? netAmount
              : amount + (parseFloat(detail.Penalty_Amount) || 0),
          payeeName: detail.SL_Nm || "",
          chequeNumber: detail.Chq_No || "",
          chequeDate: detail.Chq_Date || new Date().toISOString().split("T")[0],
          bankName: detail.Bank_Name || "",
          cvId: detail.CV_Id,
        });
      }
    });

    return chequeDetails;
  };

  // Process cheque creation and return success/failure
  const processChequeCreation = async () => {
    const chequeVouchers = getChequeDetailsFromVoucher();

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
        const { totalAmount, payeeName, chequeNumber, chequeDate, cvId } = item;

        const amountInWords = numberToWords(totalAmount);

        const chequePayload = {
          Org_Id: ORG_ID,
          cheque_book_id:
            selectedChequeBook.cheque_book_id || selectedChequeBook.id,
          cheque_number: chequeNumber || `CHQ${String(i + 1).padStart(4, "0")}`,
          cheque_date: chequeDate || new Date().toISOString().split("T")[0],
          SL_Name: payeeName || `Party ${i + 1}`,
          amount: totalAmount.toFixed(2), // This will now be Net_Amount
          amount_words: amountInWords,
          status: "1",
          CV_Id: cvId,
          payment_type: paymentType,
        };

        try {
          const response = await ChequesApi.create(chequePayload);

          if (response && response.success != false) {
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
  };

  // Handle "Create Cheques & Approve" button click in Cheque Creation Modal
  const handleCreateChequeAndApprove = async () => {
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
    setShowFinancialModal(false);
    setVouchersForChequeCreation([]);

    const chequeResult = await processChequeCreation();

    if (chequeResult == false) {
      toast.error("Cheque creation failed. Approval process stopped.");
      setIsCombinedFlow(false);
      return;
    }

    if (chequeResult == true) {
      if (isLastStageAction(nextAction)) {
        await processFinancialEntries();
      } else {
        await handleBankSelection();
      }
    }

    setIsCombinedFlow(false);
  };

  // ==================== END CHEQUE CREATION FUNCTIONS ====================

  // Open cheque print modal
  const openChequePrintModal = (detail, originalIndex) => {
    const amount = parseFloat(detail.Amount) || 0;
    const penalty = parseFloat(detail.Penalty_Amount) || 0;
    const totalAmount = amount + penalty;

    // Try to determine bank from detail or default to HDFC
    let defaultBank = "HDFC";
    if (detail.Bank_Name) {
      const bankNameUpper = detail.Bank_Name.toUpperCase();
      const matchedBank = SUPPORTED_BANKS.find(
        (b) =>
          bankNameUpper.includes(b.key) ||
          b.name.toUpperCase().includes(bankNameUpper),
      );
      if (matchedBank) defaultBank = matchedBank.key;
    }

    setSelectedBank(defaultBank);
    setBankLayout(getBankLayout(defaultBank));
    setSelectedChequeDetail({ ...detail, originalIndex });
    setChequePrintData({
      payeeName: detail.SL_Nm || "",
      amount: totalAmount.toFixed(2),
      amountInWords: numberToWords(totalAmount),
      chequeType: "A/c Payee",
      chequeDate: detail.Chq_Date
        ? new Date(detail.Chq_Date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      bankName: detail.Bank_Name || "",
      chequeNumber: detail.Chq_No || "",
    });
    setChequePrintOffsets({ top: 0, left: 0 });
    setShowChequePrintModal(true);
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

  // Handle cheque print with selected bank layout
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

  // ==================== FINANCIAL ENTRIES PROCESSING ====================

  const handleBankSelection = async () => {
    if (!voucher?.details) {
      toast.error("No challan details found");
      return;
    }

    const requiresAccGen = nextAction?.Is_Acc_Vou_No_Gen == "Y";

    for (let idx = 0; idx < voucher.details.length; idx++) {
      const detail = voucher.details[idx];
      const paymentMode =
        detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
      const amount = parseFloat(detail.Amount) || 0;
      const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
      const totalAmount = amount + penaltyAmount;

      if (totalAmount <= 0) continue;

      if (isCashMode(paymentMode)) {
        if (!cashBankAccount && !detail.SL_Lg_Id) {
          toast.error(
            `Please select a bank account for Cash payment of ${detail.SL_Nm || "Vendor"} (₹${totalAmount})`,
          );
          return;
        }
      } else if (!detailBankSelections[idx] && !detail.SL_Lg_Id) {
        toast.error(
          `Please select a bank account for ${paymentMode} payment - ${detail.SL_Nm || "Vendor"} (₹${totalAmount})`,
        );
        return;
      }
    }

    setShowFinancialModal(false);
    setShowChequeCreationModal(false);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const confirmResult = await Swal.fire({
      title: "Confirm Bank Selection",
      html: `<div style="text-align: center;">
             <p>Are you sure you want to save these bank account selections?</p>
             <br/>
             <p><strong>Voucher No:</strong> ${voucher?.CV_No}</p>
           </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Save",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
    });

    if (!confirmResult.isConfirmed) {
      setCashBankAccount(null);
      setDetailBankSelections({});
      return;
    }

    const updatePayload = [];

    for (let idx = 0; idx < voucher.details.length; idx++) {
      const detail = voucher.details[idx];
      const paymentMode =
        detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
      const amount = parseFloat(detail.Amount) || 0;
      const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
      if (amount + penaltyAmount <= 0) continue;

      const bankAccount = isCashMode(paymentMode)
        ? cashBankAccount || resolveBankFromDetail(detail)
        : detailBankSelections[idx] || resolveBankFromDetail(detail);

      if (bankAccount) {
        updatePayload.push({
          SL_Lg_Id: bankAccount.Lg_Id,
          Chl_Vou_Id: detail.CV_Id || parseInt(id),
        });
      }
    }

    if (updatePayload.length == 0) {
      toast.error("No bank accounts selected to update");
      return;
    }

    setIsProcessingPayment(true);

    try {
      Swal.fire({
        title: "Saving...",
        text: "Updating bank account selections...",
        allowOutsideClick: false,
        showConfirmButton: false,
        backdrop: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.put(
        `${API_BASE_URL}/new-chl-voucher/update-sl-lg-id`,
        updatePayload,
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

        setCashBankAccount(null);
        setDetailBankSelections({});

        if (nextAction) {
          await newChallanFlowService.updateStatus(id, {
            Status: nextAction.Act_Id,
            R_Status: null,
            CHl_HOD: user?.apiUserData?.Usr_Id,
            Status_Remark: null,
            UserId: userId,
            Mod_Code: currentModule,
            ...(requiresAccGen && { Acc_Chl_No: "generate" }),
          });
          toast.success(
            `Voucher ${nextAction.St_Name.toLowerCase()} successfully!`,
          );
        }

        setShowApproveButton(false);
        setNextAction(null);
        setBackwardAction(null);
        setShowQueryButton(false);
        setQueryReturnStatus(null);
        setVoucherLoaded(false);
        await loadVoucherData();
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
      setIsProcessingPayment(false);
    }
  };

  // Final approval: send bill to Manage Payments (no finan-trns here).
  const processFinancialEntries = async () => {
    if (!voucher?.details) {
      toast.error("No challan details found");
      return;
    }

    for (let idx = 0; idx < voucher.details.length; idx++) {
      const detail = voucher.details[idx];
      const paymentMode =
        detail.Py_Mode || detail.Payment_Mode || detail.paymode?.PayMd_Name;
      const amount = parseFloat(detail.Amount) || 0;
      const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
      const totalAmount = amount + penaltyAmount;

      if (totalAmount <= 0) continue;

      if (isCashMode(paymentMode)) {
        if (!cashBankAccount && !detail.SL_Lg_Id) {
          toast.error(
            `Please select a bank account for Cash payment of ${detail.SL_Nm || "Vendor"} (₹${totalAmount})`,
          );
          return;
        }
      } else if (!detailBankSelections[idx] && !detail.SL_Lg_Id) {
        toast.error(
          `Please select a bank account for ${paymentMode} payment - ${detail.SL_Nm || "Vendor"} (₹${totalAmount})`,
        );
        return;
      }
    }

    setShowFinancialModal(false);
    setShowChequeCreationModal(false);
    setIsProcessingPayment(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const confirmResult = await Swal.fire({
      title: `Confirm ${nextAction?.St_Name || "Approval"}`,
      html: `<div style="text-align: center;">
               <p>Send this expense challan to Manage Payments for bank payment?</p>
             </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Send",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
    });

    if (!confirmResult.isConfirmed) {
      setCashBankAccount(null);
      setDetailBankSelections({});
      setIsProcessingPayment(false);
      return;
    }

    Swal.fire({
      title: "Sending to Manage Payments...",
      html: "Updating approval status...",
      allowOutsideClick: false,
      showConfirmButton: false,
      backdrop: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
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

      if (!nextAction) {
        throw new Error("No next approval action found");
      }

      const updateData = {
        Status: nextAction.Act_Id,
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
      };
      if (isLastStageAction(nextAction)) {
        updateData.Last_Approval_Date = new Date().toISOString().split("T")[0];
      }

      if (nextAction.Is_Acc_Vou_No_Gen == "Y") {
        if (!voucher?.Acc_Chl_No) {
          const accChlNo = await fetchNextAccChlNo(
            voucher?.CV_No,
            voucher?.department?.Dpt_id || null,
            voucher?.department?.Dpt_Desc || "",
          );
          if (accChlNo) {
            if (genVoucherConfig && genVoucherConfig.Is_Active == "Y") {
              await newChallanFlowService.setAccChlNo(id, {
                ...updateData,
                Acc_Chl_No: accChlNo,
              });
            } else {
              updateData.Acc_Chl_No = accChlNo;
              await newChallanFlowService.updateStatus(id, updateData);
            }
          } else {
            await newChallanFlowService.updateStatus(id, updateData);
          }
        } else {
          await newChallanFlowService.updateStatus(id, updateData);
        }
      } else {
        await newChallanFlowService.updateStatus(id, updateData);
      }

      Swal.close();

      await Swal.fire({
        title: "Success!",
        html: `<div style="text-align: left;">
                 <p>Voucher sent to Manage Payments.</p>
                 <p class="text-sm text-gray-600 mt-2">Pay from Manage Payments. Financial entries are created after bank payment success.</p>
               </div>`,
        icon: "success",
        confirmButtonColor: "#10B981",
        timer: 3000,
        showConfirmButton: true,
        backdrop: true,
      });

      setCashBankAccount(null);
      setDetailBankSelections({});
      setShowApproveButton(false);
      setNextAction(null);
      setVoucherLoaded(false);
      await loadVoucherData();
    } catch (error) {
      console.error("Error sending voucher to Manage Payments:", error);
      Swal.close();
      await Swal.fire({
        title: "Error!",
        html: `<div style="text-align: left;">
                 <p>Failed to send voucher to Manage Payments</p>
                 <br/>
                 <p><strong>Error:</strong> ${error.message || "Unknown error"}</p>
               </div>`,
        icon: "error",
        confirmButtonColor: "#EF4444",
        backdrop: true,
      });
    } finally {
      setIsProcessingPayment(false);
      setShowFinancialModal(false);
      setShowChequeCreationModal(false);
    }
  };

  // Combined function: Process Cheque Creation + Approval
  const handleCombinedApproval = async () => {
    const isFinal = isLastStageAction(nextAction);

    // Last approval: send to Manage Payments. Do not create cheques or finan-trns.
    if (isFinal) {
      await processFinancialEntries();
      return;
    }

    // Bank selection: create cheque records (if cheque payment), then save SL_Lg_Id.
    const hasCheque = hasChequePayments();

    if (hasCheque) {
      if (!selectedChequeBook) {
        const chequeVouchers = getChequeDetailsFromVoucher();
        setVouchersForChequeCreation(chequeVouchers);
        setShowChequeCreationModal(true);
        setIsCombinedFlow(true);
        return;
      }

      setShowChequeCreationModal(false);
      const chequeResult = await processChequeCreation();

      if (chequeResult == false) {
        toast.error("Cheque creation failed. Approval process stopped.");
        return;
      }

      if (chequeResult == true || chequeResult == null) {
        await handleBankSelection();
      }
    } else {
      await handleBankSelection();
    }
  };

  const openFinancialModal = async () => {
    const isFinalApproval = isLastStageAction(nextAction);

    setShowFinancialModal(true);
    setCashBankSearchTerm("");
    setCashBankDropdownOpen(false);
    setOpenDropdownForDetail(null);
    setDetailSearchTerms({});
    setNarration(`Expense Payment: ${voucher?.CV_No || ""}`);

    if (isFinalApproval) {
      const cashDetail = voucher?.details?.find(
        (d) =>
          isCashMode(d.Py_Mode || d.Payment_Mode || d.paymode?.PayMd_Name) &&
          d.SL_Lg_Id,
      );
      if (cashDetail?.SL_Lg_Id) {
        setCashBankAccount(resolveBankFromDetail(cashDetail));
      }

      if (voucher?.details) {
        const newSelections = {};
        voucher.details.forEach((detail, idx) => {
          if (detail.SL_Lg_Id) {
            newSelections[idx] = resolveBankFromDetail(detail);
          }
        });
        setDetailBankSelections(newSelections);
      }

      checkExistingTransactions(voucher?.CV_No);
      return;
    }

    setCashBankAccount(null);
    setDetailBankSelections({});
    checkExistingTransactions(voucher?.CV_No);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/lst-payment-mode?page=1&per_page=1000`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
          },
        },
      );
      const paymentModes = res.data?.data?.data || [];

      const cashMode = paymentModes.find((pm) => pm.Is_Cash == 1);
      if (cashMode?.ledger) {
        const cashLedger = cashMode.ledger;
        const cashDetail = voucher?.details?.find((d) =>
          isCashMode(d.Py_Mode || d.Payment_Mode || d.paymode?.PayMd_Name),
        );
        setCashBankAccount(
          resolveBankFromDetail(cashDetail) || {
            Lg_Id: cashLedger.Lg_Id,
            Lg_Name: cashLedger.Lg_Name,
            Lg_Eng_Name: cashLedger.Lg_Eng_Name,
            Lg_Code: cashLedger.Lg_Code || `L${cashLedger.Lg_Id}`,
          },
        );
      }

      if (voucher?.details) {
        const newSelections = {};
        voucher.details.forEach((detail, idx) => {
          const mode =
            detail.Py_Mode ||
            detail.Payment_Mode ||
            detail.paymode?.PayMd_Name;

          if (detail.SL_Lg_Id) {
            newSelections[idx] = resolveBankFromDetail(detail);
            return;
          }

          if (isCashMode(mode)) return;
          const matched = paymentModes.find(
            (pm) => pm.PayMd_Name == mode || pm.PayMd_Code == mode,
          );
          if (matched?.ledger) {
            const lg = matched.ledger;
            newSelections[idx] = {
              Lg_Id: lg.Lg_Id,
              Lg_Name: lg.Lg_Name,
              Lg_Eng_Name: lg.Lg_Eng_Name,
              Lg_Code: lg.Lg_Code || `L${lg.Lg_Id}`,
            };
          }
        });
        setDetailBankSelections(newSelections);
      }
    } catch (err) {
      console.error("Failed to fetch payment modes:", err);
    }
  };

  const closeFinancialModal = () => {
    setShowFinancialModal(false);
    setCashBankAccount(null);
    setDetailBankSelections({});
    setCashBankSearchTerm("");
    setCashBankDropdownOpen(false);
    setOpenDropdownForDetail(null);
    setDetailSearchTerms({});
    setNarration("");
  };

  const handleApprove = async () => {
    if (!nextAction) {
      toast.error("Cannot determine next status");
      return;
    }

    const requiresBankSelection = nextAction.Is_Bank_Select == "Y";

    // Last stage: post internally and skip Confirm Bank Accounts preview
    if (isLastStageAction(nextAction)) {
      const allHaveSL = voucher?.details?.every((detail) => {
        const amount = parseFloat(detail.Amount) || 0;
        const penaltyAmount = parseFloat(detail.Penalty_Amount) || 0;
        if (amount + penaltyAmount <= 0) return true;
        return detail.SL_Lg_Id != null;
      });

      if (!allHaveSL) {
        toast.error(
          "Bank accounts are not selected. Please ensure bank selections are saved before final approval.",
        );
        return;
      }

      await processFinancialEntries();
      return;
    }

    if (requiresBankSelection) {
      openFinancialModal();
      return;
    }

    const result = await Swal.fire({
      title: `${nextAction.St_Name} Voucher?`,
      text: `Are you sure you want to ${nextAction.St_Name.toLowerCase()} this expense challan voucher?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${nextAction.St_Name}`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsUpdating(true);
    try {
      const updateData = {
        Status: nextAction.Act_Id,
        R_Status: null,
        CHl_HOD: user?.apiUserData?.Usr_Id,
        Status_Remark: null,
        UserId: userId,
        Mod_Code: currentModule,
      };

      if (nextAction.Is_Acc_Vou_No_Gen == "Y") {
        if (!voucher?.Acc_Chl_No) {
          const accChlNo = await fetchNextAccChlNo(
            voucher?.CV_No,
            voucher?.department?.Dpt_id || null,
            voucher?.department?.Dpt_Desc || "",
          );
          if (accChlNo) {
            if (genVoucherConfig && genVoucherConfig.Is_Active == "Y") {
              await newChallanFlowService.setAccChlNo(id, {
                ...updateData,
                Acc_Chl_No: accChlNo,
              });
              toast.success(
                `Voucher ${nextAction.St_Name.toLowerCase()} successfully!`,
              );
              setShowApproveButton(false);
              setNextAction(null);
              setBackwardAction(null);
              setShowQueryButton(false);
              setQueryReturnStatus(null);
              setVoucherLoaded(false);
              await loadVoucherData();
              return;
            } else {
              updateData.Acc_Chl_No = accChlNo;
            }
          }
        }
      }

      if (nextAction.St_Name == "DYMC Approval") {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        updateData.Last_Approval_Date = formattedDate;
      }

      await newChallanFlowService.updateStatus(id, updateData);

      toast.success(
        `Voucher ${nextAction.St_Name.toLowerCase()} successfully!`,
      );

      setShowApproveButton(false);
      setNextAction(null);
      setBackwardAction(null);
      setShowQueryButton(false);
      setQueryReturnStatus(null);
      setVoucherLoaded(false);
      await loadVoucherData();
    } catch (error) {
      console.error("Error approving:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${nextAction.St_Name.toLowerCase()} voucher`,
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
    if (!amount && amount != 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getBranchDisplay = () => {
    if (!voucher?.department) return "N/A";
    const dept = voucher.department;
    let displayText = dept.Dpt_Desc || "";
    if (dept.Dpt_Name && dept.Dpt_Name != dept.Dpt_Desc) {
      displayText += ` (${dept.Dpt_Name})`;
    }
    return displayText;
  };

  const getLedgerDisplay = (detail) => {
    if (!detail.ledger) return detail.Lg_Name || "N/A";
    const ledger = detail.ledger;
    let displayText = ledger.Lg_Name || "";
    if (ledger.Lg_Eng_Name && ledger.Lg_Eng_Name != ledger.Lg_Name) {
      displayText += ` (${ledger.Lg_Eng_Name})`;
    }
    if (ledger.Lg_Code) {
      displayText += ` - ${ledger.Lg_Code}`;
    }
    return displayText;
  };

  const getPaymentModeBadge = (mode) => {
    const styles = {
      Cash: "bg-green-100 text-green-800",
      Bank: "bg-blue-100 text-blue-800",
      Cheque: "bg-yellow-100 text-yellow-800",
      DD: "bg-orange-100 text-orange-800",
      Online: "bg-purple-100 text-purple-800",
      Card: "bg-pink-100 text-pink-800",
    };
    return styles[mode] || "bg-gray-100 text-gray-800";
  };

  const getStatusDisplay = () => {
    if (voucher?.RStatus) {
      return voucher.RStatus.St_Name || "Pending";
    }
    if (voucher?.status_master) {
      return voucher.status_master.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = () => {
    const statusName = getStatusDisplay();
    let colorClass = "bg-yellow-100 text-yellow-800";
    const statusLower = statusName.toLowerCase();

    if (
      statusLower.includes("approv") ||
      statusLower.includes("accept") ||
      statusLower.includes("process")
    ) {
      colorClass = "bg-green-100 text-green-800";
    } else if (
      statusLower.includes("reject") ||
      statusLower.includes("deny") ||
      statusLower.includes("decline") ||
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

  const isSimpleFormula = (formula) => {
    if (!formula) return true;
    const trimmed = formula.toString().trim().toUpperCase();
    return trimmed == "*" || (trimmed.length == 1 && /^[A-Z]$/.test(trimmed));
  };

  const TaxCalculationDisplay = () => {
    const hasTaxItems =
      taxCalculation?.taxBreakdown?.some((item) => item.type == "tax") || false;
    const hasPenaltyItems =
      taxCalculation?.taxBreakdown?.some((item) => item.type == "penalty") ||
      false;
    const hasAnyItems = hasTaxItems || hasPenaltyItems || totalPenalty > 0;

    if (!hasAnyItems) {
      return null;
    }

    const taxItems =
      taxCalculation.taxBreakdown?.filter((item) => item.type == "tax") || [];
    const penaltyItems =
      taxCalculation.taxBreakdown?.filter((item) => item.type == "penalty") ||
      [];

    let finalNetAmount = taxCalculation.netAmount;
    if (penaltyItems.length == 0 && totalPenalty > 0) {
      finalNetAmount =
        (taxCalculation.netAmount || summary.total) - totalPenalty;
    }
    if (!finalNetAmount && summary.total > 0) {
      finalNetAmount = summary.total - totalPenalty;
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mr-2">
              <Calculator className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Tax & Penalty Calculation
              </h2>
              <p className="text-xs text-gray-500">Applied on total amount</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Total Amount</span>
              <span className="font-medium text-gray-900 text-sm">
                {formatAmount(taxCalculation.grossAmount || summary.total)}
              </span>
            </div>

            {taxItems.map((tax, index) => {
              const isAdd = tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
              const showPercentage = !isSimpleFormula(tax.formula);

              let displayText = tax.displayText;
              if (isSimpleFormula(tax.formula)) {
                displayText = tax.invoice_charge?.IC_Code || tax.IC_Code || "";
              }

              return (
                <div
                  key={index}
                  className="flex items-center justify-between py-1 border-b border-gray-50"
                >
                  <div className="flex items-center gap-1">
                    {isAdd ? (
                      <PlusIcon className="h-3 w-3 text-green-500" />
                    ) : (
                      <MinusIcon className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-gray-600 text-xs">{displayText}</span>
                    {showPercentage && (
                      <span className="text-gray-400 text-xs">
                        ({tax.percentage}%)
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xs font-medium ${isAdd ? "text-green-600" : "text-red-600"}`}
                  >
                    {isAdd ? "+" : "-"}
                    {formatAmount(tax.calculatedAmount)}
                  </div>
                </div>
              );
            })}

            {taxCalculation.totalAdd > 0 && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">Total Additions</span>
                <span className="text-green-600 text-xs font-medium">
                  +{formatAmount(taxCalculation.totalAdd)}
                </span>
              </div>
            )}

            {taxCalculation.totalLess > 0 && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600 text-xs">Total Deductions</span>
                <span className="text-red-600 text-xs font-medium">
                  -{formatAmount(taxCalculation.totalLess)}
                </span>
              </div>
            )}

            {(penaltyItems.length > 0 || totalPenalty > 0) && (
              <div className="border-t border-gray-200 pt-2 mt-1">
                <div className="flex items-center mb-1">
                  <AlertCircle className="h-3 w-3 text-orange-500 mr-1" />
                  <span className="text-xs font-semibold text-gray-700">
                    Penalty
                  </span>
                </div>
                {penaltyItems.map((penalty, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1 pl-3"
                  >
                    <span className="text-gray-600 text-xs">
                      Penalty Amount
                    </span>
                    <div className="text-xs font-medium text-red-600">
                      -{formatAmount(penalty.calculatedAmount)}
                    </div>
                  </div>
                ))}
                {penaltyItems.length == 0 && totalPenalty > 0 && (
                  <div className="flex items-center justify-between py-1 pl-3">
                    <span className="text-gray-600 text-xs">
                      Penalty Amount
                    </span>
                    <div className="text-xs font-medium text-red-600">
                      -{formatAmount(totalPenalty)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between py-2 mt-2 bg-green-50 rounded-lg px-3 border border-green-100">
              <span className="text-sm font-semibold text-gray-800">
                Net Payable
              </span>
              <span className="text-base font-bold text-green-700">
                {formatAmount(finalNetAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PrintReportContent = () => {
    let penaltyTotal = 0;
    if (voucher?.details) {
      voucher.details.forEach((detail) => {
        penaltyTotal += parseFloat(detail.Penalty_Amount) || 0;
      });
    }

    const penaltyItems =
      taxCalculation.taxBreakdown?.filter((item) => item.type == "penalty") ||
      [];
    const displayPenaltyTotal =
      penaltyItems.length > 0
        ? penaltyItems.reduce((sum, p) => sum + p.calculatedAmount, 0)
        : penaltyTotal;

    // Calculate net payable correctly
    const grossAmount = summary.total || 0;
    const totalTaxAmount = taxCalculation.totalTax || 0;
    const netPayable = grossAmount + totalTaxAmount - displayPenaltyTotal;

    // Filter activity logs - EXCLUDE "DYMC Approval" and "Payment HOD Verify"
    const filteredLogs1 = activityLogs.filter(
      (log) => log.Action != null && log.Action?.St_Name != "DYMC Approval",
    );

    const filteredLogs = filteredLogs1.filter(
      (log) =>
        log.Action != null && log.Action?.St_Name != "Payment HOD Verify",
    );

    // Find specific status logs for signatures
    const dymcLog = activityLogs.find(
      (log) => log.Action?.St_Name == "DYMC Approval",
    );

    const hodLog = activityLogs.find(
      (log) => log.Action?.St_Name == "Payment HOD Verify",
    );

    // Check if Acc_Chl_No exists and is not empty
    const hasVoucherNumber =
      voucher?.Acc_Chl_No && voucher.Acc_Chl_No.trim() != "";

    // Helper function to get cheque number from detail
    const getChequeNumber = (detail) => {
      return (
        detail.Chq_No ||
        detail.Cheque_No ||
        detail.ChequeNumber ||
        detail.DD_No ||
        detail.DDNumber ||
        ""
      );
    };

    // Helper function to get cheque date from detail
    const getChequeDate = (detail) => {
      return (
        detail.Chq_Date ||
        detail.Cheque_Date ||
        detail.ChequeDate ||
        detail.DD_Date ||
        detail.DDDate ||
        ""
      );
    };

    // Format signature info
    const formatSignatureInfo = (log) => {
      if (!log) return null;
      const userName = log.User?.Usr_Name || "—";
      const timestamp = log.formatted_time || "—";
      return `${userName} / ${timestamp}`;
    };

    const styles = {
      section: { marginBottom: "12px" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "4px 8px",
        margin: "6px 0",
        fontWeight: "600",
        borderLeft: "3px solid #EF5350",
        fontSize: "11px",
        color: "#1f2937",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "4px 0",
        fontSize: "10px",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "4px 6px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      thRight: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "4px 6px",
        border: "1px solid #cbd5e0",
        textAlign: "right",
      },
      td: {
        padding: "4px 6px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      tdRight: {
        padding: "4px 6px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
        textAlign: "right",
      },
      textBold: { fontWeight: "600" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Challan Information */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Challan Information</div>
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
                <td style={{ ...styles.td, ...styles.textBold }}>Bill No.</td>
                <td style={styles.td}>{voucher?.CV_No}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Date</td>
                <td style={styles.td}>{formatDate(voucher?.Ch_Date)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Branch</td>
                <td style={styles.td}>{getBranchDisplay()}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={styles.td}>{getStatusDisplay()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Voucher No.
                </td>
                <td style={styles.td}>{voucher?.Acc_Chl_No || "—"}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Voucher Date
                </td>
                <td style={styles.td}>{formatDate(voucher?.Acc_Chl_Date)}</td>
              </tr>
              {voucher?.Status_Remark && (
                <tr>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textBold,
                      backgroundColor: "#fffbeb",
                    }}
                  >
                    Query
                  </td>
                  <td
                    style={{ ...styles.td, backgroundColor: "#fffbeb" }}
                    colSpan="3"
                  >
                    <span style={{ color: "#92400e" }}>
                      {voucher.Status_Remark}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bill Details */}
        {voucher?.details && voucher.details.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Bill Details</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>SR.</th>
                  <th style={styles.th}>Ledger Account</th>
                  <th style={styles.th}>Vendor Name / GST No</th>
                  <th style={styles.th}>File No. / Remark</th>
                  <th style={styles.th}>TAX</th>
                  <th style={styles.thRight}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {voucher.details.map((detail, index) => {
                  const rowTaxes = (detail.pay_details || []).filter(
                    (p) => p.PD_Ty == "TAX" && parseFloat(p.IC_Amt) != 0,
                  );
                  const penalty = parseFloat(detail.Penalty_Amount) || 0;

                  return (
                    <tr key={index}>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {detail.CV_Sr}
                      </td>
                      <td style={styles.td}>
                        <div>{getLedgerDisplay(detail)}</div>
                        {detail.budget_head && (
                          <div style={{ fontSize: "8px", color: "#6b7280" }}>
                            Budget: {detail.budget_head.Gr_Nm}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div>
                          <strong>Vendor:</strong> {detail.SL_Nm || "—"}
                        </div>
                        <div style={{ fontSize: "9px", color: "#6b7280" }}>
                          <strong>GST:</strong> {detail.GST_No || "—"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div>
                          <strong>File No.:</strong> {detail.FileNo || "—"}
                        </div>
                        <div
                          style={{
                            fontSize: "9px",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          <strong>Remark:</strong>{" "}
                          {detail.Remarks || detail.remark || "—"}
                        </div>
                        {penalty > 0 && (
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#dc2626",
                              marginTop: "2px",
                            }}
                          >
                            <strong>Penalty:</strong> {formatCurrency(penalty)}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        {rowTaxes.length > 0 ? (
                          <div style={{ fontSize: "9px" }}>
                            {rowTaxes.map((tax, ti) => {
                              const isAdd =
                                tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
                              const taxLabel =
                                tax.invoice_charge?.IC_Name ||
                                tax.IC_Name ||
                                "Tax";
                              const taxAmount = parseFloat(tax.IC_Amt) || 0;
                              return (
                                <div key={ti} style={{ marginBottom: "2px" }}>
                                  {isAdd ? "+" : "-"} {taxLabel}:{" "}
                                  {formatCurrency(taxAmount)}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={styles.tdRight}>
                        {formatCurrency(detail.Amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Section */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Summary</div>
          <table style={{ ...styles.table, width: "50%", marginLeft: "auto" }}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, fontWeight: "600" }}>
                  Total Amount:
                </td>
                <td style={{ ...styles.tdRight, fontWeight: "600" }}>
                  {formatCurrency(grossAmount)}
                </td>
              </tr>
              {totalTaxAmount != 0 && (
                <tr>
                  <td style={{ ...styles.td, fontWeight: "600" }}>
                    Tax Amount: {totalTaxAmount >= 0 ? "(+)" : "(-)"}
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color: totalTaxAmount >= 0 ? "#10b981" : "#ef4444",
                    }}
                  >
                    {formatCurrency(Math.abs(totalTaxAmount))}
                  </td>
                </tr>
              )}
              {displayPenaltyTotal > 0 && (
                <tr>
                  <td
                    style={{
                      ...styles.td,
                      fontWeight: "600",
                      color: "#dc2626",
                    }}
                  >
                    Penalty Amount: (-)
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color: "#dc2626",
                    }}
                  >
                    {formatCurrency(displayPenaltyTotal)}
                  </td>
                </tr>
              )}
              <tr style={{ backgroundColor: "#f0fdf4" }}>
                <td
                  style={{ ...styles.td, fontWeight: "bold", fontSize: "11px" }}
                >
                  Net Payable:
                </td>
                <td
                  style={{
                    ...styles.tdRight,
                    fontWeight: "bold",
                    fontSize: "11px",
                    color: "#10b981",
                  }}
                >
                  {formatCurrency(netPayable)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Mode Details */}
        {voucher?.details && voucher.details.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Payment Mode Details</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sr.</th>
                  <th style={styles.th}>Payment Mode</th>
                  <th style={styles.th}>Bank Details</th>
                  <th style={styles.th}>Cheque/DD Details</th>
                  <th style={styles.thRight}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {voucher.details.map((detail, index) => {
                  const isCheque =
                    detail.Payment_Mode == "Cheque" ||
                    detail.Payment_Mode == "DD";
                  const isBank =
                    detail.Payment_Mode == "Bank" ||
                    detail.Payment_Mode == "Online" ||
                    detail.Payment_Mode == "Card";

                  const hasBankInfo =
                    (detail.Bank_Name &&
                      detail.Bank_Name != "null" &&
                      detail.Bank_Name != "") ||
                    (detail.Acc_No &&
                      detail.Acc_No != "null" &&
                      detail.Acc_No != "") ||
                    (detail.IFSC_Code &&
                      detail.IFSC_Code != "null" &&
                      detail.IFSC_Code != "");

                  const chequeNumber = getChequeNumber(detail);
                  const chequeDate = getChequeDate(detail);
                  const hasChequeInfo =
                    (chequeNumber &&
                      chequeNumber != "null" &&
                      chequeNumber != "") ||
                    (chequeDate && chequeDate != "null" && chequeDate != "");

                  const showBankDetails = hasBankInfo || isBank;

                  const bankDetails = showBankDetails ? (
                    <div style={{ fontSize: "9px" }}>
                      {detail.Bank_Name &&
                      detail.Bank_Name != "null" &&
                      detail.Bank_Name != "" ? (
                        <div>
                          <strong>Bank:</strong> {detail.Bank_Name}
                        </div>
                      ) : null}
                      {detail.Acc_No &&
                      detail.Acc_No != "null" &&
                      detail.Acc_No != "" ? (
                        <div>
                          <strong>A/C No.:</strong> {detail.Acc_No}
                        </div>
                      ) : null}
                      {detail.IFSC_Code &&
                      detail.IFSC_Code != "null" &&
                      detail.IFSC_Code != "" ? (
                        <div>
                          <strong>IFSC:</strong> {detail.IFSC_Code}
                        </div>
                      ) : null}
                      {!hasBankInfo && "—"}
                    </div>
                  ) : (
                    "—"
                  );

                  const chequeDetails = hasChequeInfo ? (
                    <div style={{ fontSize: "9px" }}>
                      {chequeNumber &&
                      chequeNumber != "null" &&
                      chequeNumber != "" ? (
                        <div>
                          <strong>No.:</strong> {chequeNumber}
                        </div>
                      ) : null}
                      {chequeDate &&
                      chequeDate != "null" &&
                      chequeDate != "" ? (
                        <div>
                          <strong>Date:</strong> {formatDate(chequeDate)}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    "—"
                  );

                  // Calculate net amount for this row (amount + tax - penalty for this specific detail)
                  const rowTaxes = (detail.pay_details || []).filter(
                    (p) => p.PD_Ty == "TAX",
                  );
                  const rowTaxTotal = rowTaxes.reduce((sum, tax) => {
                    const isAdd = tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
                    const taxAmt = parseFloat(tax.IC_Amt) || 0;
                    return sum + (isAdd ? taxAmt : -taxAmt);
                  }, 0);
                  const rowPenalty = parseFloat(detail.Penalty_Amount) || 0;
                  const netAmountForRow =
                    (parseFloat(detail.Amount) || 0) + rowTaxTotal - rowPenalty;

                  return (
                    <tr key={index}>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {detail.CV_Sr}
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: "500" }}>
                          {detail.Payment_Mode || "—"}
                        </span>
                      </td>
                      <td style={styles.td}>{bankDetails}</td>
                      <td style={styles.td}>{chequeDetails}</td>
                      <td style={styles.tdRight}>
                        {formatCurrency(netAmountForRow)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Verification Text - Two lines (BEFORE Activity Logs) */}
        <div
          style={{
            marginTop: "8px",
            marginBottom: "8px",
            padding: "6px 8px",
            backgroundColor: "#fafafa",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            fontSize: "9px",
            lineHeight: "1.5",
          }}
        >
          <div style={{ marginBottom: "2px" }}>
            • બિલ ની દરેક પ્રકાર ની ચકાસણી કરતા બિલ બરાબર હોવાનું માલુમ પડેલ છે.
            આ બિલ ની રકમ નું અગાઉ ચુકવણું કરવામાં આવેલ નથી તેની ખાતરી લેવામાં
            આવી છે.
          </div>
          <div>
            • સ.બ.બ. કામગીરી G.M.C. ના હેતુ થી કરવામાં આવેલ છે તેમજ કામગીરી
            સંતોષકારક પૂર્ણ કરેલ છે.
          </div>
        </div>

        {/* Activity Logs Section - EXCLUDING DYMC Approval and Payment HOD Verify */}
        {filteredLogs.length > 0 && (
          <div style={{ ...styles.section, marginBottom: "8px" }}>
            <div style={styles.sectionTitle}>Activity Logs</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: "3px 0",
                    borderBottom:
                      Math.floor(index / 3) ==
                      Math.floor((filteredLogs.length - 1) / 3)
                        ? "none"
                        : "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "8px",
                      marginBottom: "1px",
                      color: "#374151",
                    }}
                  >
                    {log.User?.Usr_Name || "—"} / {log.formatted_time || "—"}
                  </div>
                  <div style={{ fontSize: "8px", color: "#6b7280" }}>
                    {log.Action?.St_Name || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature Section - Dynamic signatures from activity logs */}
        {hasVoucherNumber && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            {/* Account HOD Signature */}
            <div style={{ width: "45%", textAlign: "center" }}>
              <div
                style={{
                  borderBottom: "1px solid #000",
                  padding: "8px 0",
                  marginBottom: "4px",
                  minHeight: "30px",
                }}
              >
                {hodLog ? (
                  <div style={{ fontSize: "10px", color: "#1f2937" }}>
                    {formatSignatureInfo(hodLog)}
                  </div>
                ) : (
                  <span style={{ fontSize: "9px", color: "#9ca3af" }}>—</span>
                )}
              </div>
              <div style={{ fontSize: "10px", fontWeight: "600" }}>
                Account HOD
              </div>
            </div>

            {/* DYMC Signature */}
            <div style={{ width: "45%", textAlign: "center" }}>
              <div
                style={{
                  borderBottom: "1px solid #000",
                  padding: "8px 0",
                  marginBottom: "4px",
                  minHeight: "30px",
                }}
              >
                {dymcLog ? (
                  <div style={{ fontSize: "10px", color: "#1f2937" }}>
                    {formatSignatureInfo(dymcLog)}
                  </div>
                ) : (
                  <span style={{ fontSize: "9px", color: "#9ca3af" }}>—</span>
                )}
              </div>
              <div style={{ fontSize: "10px", fontWeight: "600" }}>DYMC</div>
            </div>
          </div>
        )}
      </div>
    );
  };
  if (loading || !permissionsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-900">Not Found</h2>
        <button
          onClick={() =>
            navigate(
              "/transactions/bookkeeping-vouchers/new-expense-challan-approval",
            )
          }
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Back to List
        </button>
      </div>
    );
  }

  const totalCashAmount = getTotalCashAmount();
  const nonCashDetails = getNonCashDetails();
  const isFinalApproval = isLastStageAction(nextAction);

  return (
    <div className="min-h-screen bg-gray-50">
      {showPrint && (
        <PrintLayout
          title="Expense Challan Voucher Approval Report"
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      {showFinancialModal && (
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
                      {isFinalApproval
                        ? "Final Approval - Confirm Bank Accounts"
                        : "Select Bank Accounts"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {isFinalApproval
                        ? "Review selected bank accounts and confirm to send bill to Manage Payments"
                        : "Select bank accounts for each payment mode"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* REMOVED: "Add Cheque Print List" button - Now integrated into Approve Bill flow */}
                  <button
                    onClick={closeFinancialModal}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <XCircle className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {totalCashAmount > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Banknote className="h-5 w-5 text-yellow-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">
                        Cash Payments (Total: {formatCurrency(totalCashAmount)})
                      </h4>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isFinalApproval
                        ? "Cash Bank Account (Selected)"
                        : "Select Bank Account for Cash"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        ref={cashBankButtonRef}
                        type="button"
                        onClick={() =>
                          !isFinalApproval &&
                          setCashBankDropdownOpen(!cashBankDropdownOpen)
                        }
                        onKeyDown={
                          !isFinalApproval ? handleCashBankKeyDown : undefined
                        }
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 flex justify-between items-center ${isFinalApproval ? "bg-gray-100 cursor-default" : "hover:bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200"} outline-none text-sm bg-white`}
                      >
                        <span
                          className={
                            cashBankAccount ? "text-gray-900" : "text-gray-500"
                          }
                        >
                          {cashBankAccount
                            ? `${cashBankAccount.Lg_Name} (${cashBankAccount.Lg_Code})`
                            : isFinalApproval
                              ? "No bank account selected"
                              : "Select Bank Account for Cash"}
                        </span>
                        {!isFinalApproval &&
                          (cashBankDropdownOpen ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ))}
                      </button>

                      {!isFinalApproval && cashBankDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                          <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                ref={cashBankSearchRef}
                                type="text"
                                value={cashBankSearchTerm}
                                onChange={(e) =>
                                  setCashBankSearchTerm(e.target.value)
                                }
                                onKeyDown={handleCashBankSearchKeyDown}
                                placeholder="Search by name or code..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                              />
                            </div>
                          </div>

                          <div
                            ref={cashBankListRef}
                            className="overflow-y-auto max-h-60"
                          >
                            {getFilteredBankAccounts(cashBankSearchTerm)
                              .length > 0 ? (
                              getFilteredBankAccounts(cashBankSearchTerm).map(
                                (account, idx) => (
                                  <button
                                    key={account.Lg_Id}
                                    ref={(el) =>
                                      (cashBankItemRefs.current[idx] = el)
                                    }
                                    type="button"
                                    onClick={() =>
                                      handleCashBankSelect(account)
                                    }
                                    onKeyDown={(e) =>
                                      handleCashBankItemKeyDown(e, account, idx)
                                    }
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 focus:outline-none focus:bg-green-50 ${
                                      cashBankAccount?.Lg_Id == account.Lg_Id
                                        ? "bg-green-50 text-green-700"
                                        : "text-gray-700"
                                    } ${cashHighlightedIndex == idx ? "bg-green-100" : ""}`}
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
                                  </button>
                                ),
                              )
                            ) : (
                              <div className="px-4 py-8 text-center text-gray-500">
                                <p className="text-sm">
                                  No bank accounts found
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Non-Cash Payments - Separate Bank Account for Each Detail */}
              {nonCashDetails.map((detail, idx) => {
                const originalIndex = voucher.details.findIndex(
                  (d) => d == detail,
                );
                const paymentMode = detail.Py_Mode || detail.Payment_Mode;
                const amount = parseFloat(detail.Amount) || 0;
                const penalty = parseFloat(detail.Penalty_Amount) || 0;
                const totalAmount = amount + penalty;
                const selectedAccount =
                  isFinalApproval
                    ? resolveBankFromDetail(detail) ||
                      detailBankSelections[originalIndex]
                    : detailBankSelections[originalIndex];
                const isOpen = openDropdownForDetail == originalIndex;
                const searchTerm = detailSearchTerms[originalIndex] || "";

                // Check if this is a cheque payment
                const isChequeMode = paymentMode?.toLowerCase() == "cheque";
                const hasChequeNumber =
                  detail.Chq_No && detail.Chq_No.trim() != "";

                return (
                  <div
                    key={originalIndex}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium text-gray-900">
                          {detail.SL_Nm || "Vendor"}
                        </span>
                        <span className="text-sm text-gray-800">
                          Amount: {formatCurrency(amount)}
                        </span>
                        {penalty > 0 && (
                          <span className="text-xs text-red-500">
                            (Penalty: {formatCurrency(penalty)})
                          </span>
                        )}
                        {isChequeMode && hasChequeNumber && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            Chq: {detail.Chq_No}
                          </span>
                        )}
                      </div>

                      {/* Individual Print Cheque Button REMOVED - Now using integrated flow */}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isFinalApproval
                          ? `${paymentMode} Bank Account (Selected)`
                          : `Select Bank Account for ${paymentMode}`}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            !isFinalApproval &&
                            toggleDetailDropdown(originalIndex)
                          }
                          className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 flex justify-between items-center ${isFinalApproval ? "bg-gray-100 cursor-default" : "hover:bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200"} outline-none text-sm bg-white`}
                        >
                          <span
                            className={
                              selectedAccount
                                ? "text-gray-900"
                                : "text-gray-500"
                            }
                          >
                            {selectedAccount
                              ? `${selectedAccount.Lg_Name} (${selectedAccount.Lg_Code})`
                              : isFinalApproval
                                ? "No bank account selected"
                                : `Select Bank Account for ${paymentMode}`}
                          </span>
                          {!isFinalApproval &&
                            (isOpen ? (
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ))}
                        </button>

                        {!isFinalApproval && isOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                            <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setDetailSearchTerms((prev) => ({
                                      ...prev,
                                      [originalIndex]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) =>
                                    handleDetailSearchKeyDown(e, originalIndex)
                                  }
                                  placeholder="Search by name or code..."
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                                  autoFocus
                                />
                              </div>
                            </div>

                            <div className="overflow-y-auto max-h-60">
                              {getFilteredBankAccounts(searchTerm).length >
                              0 ? (
                                getFilteredBankAccounts(searchTerm).map(
                                  (account, accIdx) => (
                                    <button
                                      key={account.Lg_Id}
                                      type="button"
                                      onClick={() =>
                                        handleDetailBankSelect(
                                          originalIndex,
                                          account,
                                        )
                                      }
                                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 focus:outline-none focus:bg-green-50 ${
                                        selectedAccount?.Lg_Id == account.Lg_Id
                                          ? "bg-green-50 text-green-700"
                                          : "text-gray-700"
                                      }`}
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
                                    </button>
                                  ),
                                )
                              ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                  <p className="text-sm">
                                    No bank accounts found
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isFinalApproval && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Narration / Description
                  </label>
                  <textarea
                    ref={narrationRef}
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-sm"
                    placeholder="Enter description for payment entries..."
                    rows="3"
                  />
                </div>
              )}

              {existingTransactions.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-700">
                      Financial entries already exist for this voucher!
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeFinancialModal}
                  disabled={isProcessingPayment}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  ref={processButtonRef}
                  onClick={handleCombinedApproval}
                  disabled={
                    isProcessingPayment ||
                    isCreatingCheques ||
                    (isFinalApproval && existingTransactions.length > 0)
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isProcessingPayment || isCreatingCheques ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isFinalApproval
                        ? "Send to Manage Payments"
                        : "Save Bank Selections"}
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
                            {item.voucher?.CV_No || "N/A"}
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

      {/* Cheque Print Modal with Bank Selection */}
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
                      Chq No - {selectedChequeDetail.Chq_No} | Bank:{" "}
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
              {/* Bank Selection Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-white">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Landmark className="h-4 w-4 mr-1 text-blue-600" />
                  Select Cheque Book Bank
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
                    the printer.
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
                  ref={chequePreviewRef}
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

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() =>
                navigate(
                  "/transactions/bookkeeping-vouchers/new-expense-challan-approval",
                )
              }
              className="mr-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Expense Challan Voucher Approval
              </h1>
              <p className="text-sm text-gray-500">
                Voucher No:{" "}
                <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">
                  {voucher.CV_No}
                </span>
                <button
                  onClick={() => copyToClipboard(voucher.CV_No)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  title="Copy voucher number"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrint(true)}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="p-4 mx-auto max-w-full">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Voucher Information
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-start gap-0 divide-x divide-gray-200">
                <div className="flex-1 px-4 first:pl-0">
                  <p className="text-xs text-gray-500 mb-0.5">Bill No.</p>
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900 break-all">
                      {voucher.CV_No}
                    </span>
                  </div>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-xs text-gray-500 mb-0.5">Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900">
                      {formatDate(voucher.Ch_Date)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-xs text-gray-500 mb-0.5">Branch</p>
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900">
                      {getBranchDisplay()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-xs text-gray-500 mb-0.5">Tender Type</p>
                  <div className="flex items-center gap-1">
                    <Receipt className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900">
                      {voucher.tender_type?.TnT_Name || "—"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-xs text-gray-500 mb-0.5">Status</p>
                  {getStatusBadge()}
                </div>
                {voucher.HOD_User?.Usr_Name && (
                  <div className="flex-1 px-4">
                    <p className="text-xs text-gray-500 mb-0.5">Approved By</p>
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900">
                        {voucher.HOD_User.Usr_Name}
                      </span>
                    </div>
                  </div>
                )}
                {voucher.Acc_Chl_No && (
                  <div className="flex-1 px-4">
                    <p className="text-xs text-gray-500 mb-0.5">Voucher No.</p>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-blue-600">
                        {voucher.Acc_Chl_No}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {voucher?.Status_Remark && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                        Query
                      </label>
                      <p className="text-sm text-amber-900 mt-1">
                        {voucher.Status_Remark}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {voucher.details && voucher.details.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Challan Details ({voucher.details.length} items)
                </h2>
              </div>
              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Sr.
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Ledger Account
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Vendor Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          GST No
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Payment Mode
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Cheque/DD No.
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Cheque/DD Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Bank Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Account No.
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          IFSC Code
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Receipt Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          File No.
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Remarks
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                          Amount (₹)
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                          Penalty (₹)
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Taxation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {voucher.details.map((detail, idx) => {
                        const isCheque =
                          detail.Payment_Mode == "Cheque" ||
                          detail.Payment_Mode == "DD";
                        const isBank =
                          detail.Payment_Mode == "Bank" ||
                          detail.Payment_Mode == "Online" ||
                          detail.Payment_Mode == "Card";
                        const penalty = parseFloat(detail.Penalty_Amount) || 0;
                        const rowTaxes = (detail.pay_details || []).filter(
                          (p) => p.PD_Ty == "TAX" && parseFloat(p.IC_Amt) != 0,
                        );
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs text-center">
                              {detail.CV_Sr}
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-xs font-medium">
                                {getLedgerDisplay(detail)}
                              </div>
                              {detail.budget_head && (
                                <div className="text-[10px] text-gray-500">
                                  Budget: {detail.budget_head.Gr_Nm}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {detail.SL_Nm || "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {detail.GST_No || "—"}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getPaymentModeBadge(detail.Payment_Mode)}`}
                              >
                                {detail.Payment_Mode}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isCheque ? detail.Chq_No || "—" : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isCheque ? formatDate(detail.Chq_Date) : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isBank || isCheque
                                ? detail.Bank_Name || "—"
                                : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isBank ? detail.Acc_No || "—" : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {isBank ? detail.IFSC_Code || "—" : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {formatDate(detail.Rec_Date)}
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {detail.FileNo || "—"}
                            </td>
                            <td className="px-3 py-2 text-xs max-w-[200px] break-words">
                              {detail.Remarks || detail.remark || "—"}
                            </td>
                            <td className="px-3 py-2 text-xs text-right font-medium">
                              {formatCurrency(detail.Amount)}
                            </td>
                            <td className="px-3 py-2 text-xs text-right text-red-600">
                              {penalty > 0 ? formatCurrency(penalty) : "—"}
                            </td>
                            <td className="px-3 py-2 text-xs text-center">
                              {rowTaxes.length > 0 ? (
                                <button
                                  onClick={() => openTaxPopup(rowTaxes)}
                                  className="px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors whitespace-nowrap"
                                >
                                  View Tax ({rowTaxes.length})
                                </button>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-100 border-t-2 border-gray-300">
                        <td
                          colSpan="13"
                          className="px-3 py-3 text-right text-xs font-semibold text-gray-800"
                        >
                          Total Amount:
                        </td>
                        <td className="px-3 py-3 text-right text-xs font-semibold text-gray-800">
                          {formatCurrency(summary.total)}
                        </td>
                        <td className="px-3 py-3 text-right text-xs font-semibold text-red-600">
                          {totalPenalty > 0
                            ? formatCurrency(totalPenalty)
                            : "—"}
                        </td>
                        <td className="px-3 py-3"></td>
                      </tr>
                      {taxCalculation.totalTax != 0 && (
                        <tr className="bg-gray-50">
                          <td
                            colSpan="13"
                            className="px-3 py-2 text-right text-xs text-gray-700"
                          >
                            Tax Amount:{" "}
                            {taxCalculation.totalTax >= 0 ? "(+)" : "(-)"}
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-gray-700">
                            {formatCurrency(Math.abs(taxCalculation.totalTax))}
                          </td>
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-2"></td>
                        </tr>
                      )}
                      <tr className="bg-gray-100">
                        <td
                          colSpan="13"
                          className="px-3 py-3 text-right text-xs font-bold text-gray-900"
                        >
                          Net Payable:
                        </td>
                        <td className="px-3 py-3 text-right text-xs font-bold text-gray-900">
                          {formatCurrency(
                            taxCalculation.netAmount || summary.total,
                          )}
                        </td>
                        <td className="px-3 py-3"></td>
                        <td className="px-3 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {(showApproveButton || showQueryButton) && (
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-3xl">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <ShieldAlert className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Voucher Actions
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Review this expense challan voucher and take appropriate
                    action
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  {showQueryButton && backwardAction && (
                    <div className="flex-1 w-full md:w-auto">
                      <button
                        onClick={openQueryModal}
                        disabled={isUpdating}
                        className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        {isUpdating ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        ) : (
                          <MessageSquare className="h-5 w-5 mr-3" />
                        )}
                        <div className="text-left">
                          <div className="font-bold text-base">
                            {isUpdating
                              ? "Processing..."
                              : backwardAction.St_Name}
                          </div>
                          <div className="text-xs font-normal opacity-90 mt-0.5">
                            Return to previous stage
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {!showQueryButton && <div className="flex-1"></div>}

                  {showApproveButton && nextAction && (
                    <div className="flex-1 w-full md:w-auto">
                      <button
                        onClick={handleApprove}
                        disabled={isUpdating}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 flex items-center justify-center disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        {isUpdating ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        ) : (
                          <Check className="h-5 w-5 mr-3" />
                        )}
                        <div className="text-left">
                          <div className="font-bold text-base">
                            {isUpdating ? "Processing..." : nextAction.St_Name}
                          </div>
                          <div className="text-xs font-normal opacity-90 mt-0.5">
                            {nextAction.Is_Bank_Select == "Y"
                              ? "Select bank accounts"
                              : nextAction.Is_Acc_Vou_No_Gen == "Y"
                                ? "Generate voucher number"
                                : isLastStageAction(nextAction)
                                  ? "Final approval with entries"
                                  : "Forward to next stage"}
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  {!showApproveButton && <div className="flex-1"></div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {!showApproveButton && !showQueryButton && voucher.status_master && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  No Action Required
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  This voucher has been fully processed and does not require any
                  further approval.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {taxPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeTaxPopup}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Tax Details
                </h3>
              </div>
              <button
                onClick={closeTaxPopup}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Tax Name
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-gray-600">
                      Type
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {taxPopup.map((t, i) => {
                    const isAdd = t.Add_Dedu == 1 || t.Add_Dedu == "1";
                    const label =
                      t.invoice_charge?.IC_Name || t.IC_Name || "Tax";
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-800">{label}</td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${isAdd ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {isAdd ? "+ Add" : "- Deduct"}
                          </span>
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-medium ${isAdd ? "text-green-700" : "text-red-600"}`}
                        >
                          {formatCurrency(parseFloat(t.IC_Amt))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td
                      colSpan="2"
                      className="px-3 py-2 font-semibold text-gray-800"
                    >
                      Net Tax Effect
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900">
                      {formatCurrency(
                        taxPopup.reduce((sum, t) => {
                          const isAdd = t.Add_Dedu == 1 || t.Add_Dedu == "1";
                          return (
                            sum +
                            (isAdd
                              ? parseFloat(t.IC_Amt)
                              : -parseFloat(t.IC_Amt))
                          );
                        }, 0),
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {queryModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {backwardAction?.St_Name || "Raise Query"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Please provide details for returning to previous stage
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-32"
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
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {backwardAction?.St_Name || "Raise Query"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewExpenseChallanApprovalView;
