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
  Layers,
  User,
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
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { newChallanFlowService } from "../../../services/newchallanflowservice";
import PrintLayout from "../../../../components/printlayout";
import { useOrganization } from "../../../../hooks/useorganization";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const NewChallanApprovalView = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApproveButton, setShowApproveButton] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");
  const { organization } = useOrganization();
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [userDesignationName, setUserDesignationName] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [nextAction, setNextAction] = useState(null);
  const [backwardAction, setBackwardAction] = useState(null);
  const [actionsForStage, setActionsForStage] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [voucherLoaded, setVoucherLoaded] = useState(false);
  const [queryModal, setQueryModal] = useState(false);
  const [queryRemark, setQueryRemark] = useState("");
  const [queryReturnStatus, setQueryReturnStatus] = useState(null);
  const [showQueryButton, setShowQueryButton] = useState(false);

  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const ORG_ID = 1;
  const [existingTransactions, setExistingTransactions] = useState([]);
  const [checkingTransactions, setCheckingTransactions] = useState(false);
  const [narration, setNarration] = useState("");

  const [cashBankAccount, setCashBankAccount] = useState(null);
  const [cashBankDropdownOpen, setCashBankDropdownOpen] = useState(false);
  const [cashBankSearchTerm, setCashBankSearchTerm] = useState("");
  const [cashHighlightedIndex, setCashHighlightedIndex] = useState(-1);

  const [detailBankSelections, setDetailBankSelections] = useState({});
  const [openDropdownForDetail, setOpenDropdownForDetail] = useState(null);
  const [detailSearchTerms, setDetailSearchTerms] = useState({});
  const [detailHighlightedIndices, setDetailHighlightedIndices] = useState({});

  const [genVoucherConfig, setGenVoucherConfig] = useState(null);
  const [currentFinancialYear, setCurrentFinancialYear] = useState(null);

  // State for last approved status
  const [lastApprovedStatus, setLastApprovedStatus] = useState(null);

  const cashBankButtonRef = useRef(null);
  const cashBankSearchRef = useRef(null);
  const cashBankListRef = useRef(null);
  const cashBankItemRefs = useRef([]);
  const narrationRef = useRef(null);
  const processButtonRef = useRef(null);
  const detailRefs = useRef({});

  const [summary, setSummary] = useState({
    total: 0,
    cash: 0,
    bank: 0,
    cheque: 0,
    dd: 0,
    online: 0,
    card: 0,
    pos: 0,
    mchallan: 0,
  });
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
    return null;
  })();

  const currentModule = (() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      for (let i = 0; i < menuDetails.length; i++) {
        if (
          menuDetails[i].Menu_Links ==
          "/transactions/bookkeeping-vouchers/new-challan-approval"
        ) {
          return menuDetails[i].Mod_Code || "";
        }
      }
      return "";
    } catch (error) {
      return "CHAL";
    }
  })();

  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
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

    const desigName =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_Desc;
    setUserDesignationName(desigName || "N/A");

    loadMenuAndStage();
    loadOrganisationData();
  }, [id, user]);

  useEffect(() => {
    if (!cashBankDropdownOpen) return;
    const searchTerm = cashBankSearchTerm.toLowerCase();
    if (!searchTerm) {
    }
  }, [cashBankSearchTerm, cashBankDropdownOpen]);

  const loadMenuAndStage = async () => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/bookkeeping-vouchers/new-challan-approval";
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

        // Calculate last approved status (terminal forward action)
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

  // Load voucher data after actions are loaded
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

        params.append("is_income", "Y");

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

      if (voucherData?.details) {
        const calcSummary = newChallanFlowService.calculateSummary(
          voucherData.details,
        );
        setSummary(calcSummary);

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
              isAdd: t.Add_Dedu == 1 || t.Add_Dedu == "1",
              type: "tax",
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

        let netAmount;

        netAmount =
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
        const currentStatusId = currentAction.Act_Id?.toString();

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
      navigate("/transactions/bookkeeping-vouchers/new-challan-approval");
    } finally {
      setLoading(false);
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

  const generateNextReceiptId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finan-trns/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      const transactions = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      const rcpTransactions = transactions.filter((t) => t.Vou_Ty == "RCP");

      if (rcpTransactions.length == 0) return 1;

      const voucherIds = rcpTransactions.map((t) => {
        const id = parseInt(t.Vou_Id);
        return isNaN(id) ? 0 : id;
      });

      const uniqueVoucherIds = [...new Set(voucherIds)];
      const maxVoucherId = Math.max(...uniqueVoucherIds);
      return maxVoucherId + 1;
    } catch (err) {
      console.error(
        "Error fetching transactions for receipt ID generation:",
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
    return `${mode} - ${detail.SL_Nm || "Party"}`;
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

  // ============ BANK SELECTION ONLY (Is_Bank_Select == "Y") ============
  // ============ BANK SELECTION ONLY (Is_Bank_Select == "Y") ============
  const handleBankSelection = async () => {
    console.log("handleBankSelection called - Bank Selection Only");

    if (!voucher?.details) {
      toast.error("No challan details found");
      return;
    }

    // ===== FIX: Define requiresAccGen here =====
    const requiresAccGen = nextAction?.Is_Acc_Vou_No_Gen == "Y";

    for (let idx = 0; idx < voucher.details.length; idx++) {
      const detail = voucher.details[idx];
      const paymentMode = detail.Py_Mode || detail.Payment_Mode;
      const amount = parseFloat(detail.Amount) || 0;

      if (amount <= 0) continue;

      if (paymentMode == "Cash") {
        if (!cashBankAccount) {
          toast.error(
            `Please select a bank account for Cash payment of ${detail.SL_Nm || "Party"} (₹${amount})`,
          );
          return;
        }
      } else {
        if (!detailBankSelections[idx]) {
          toast.error(
            `Please select a bank account for ${paymentMode} payment - ${detail.SL_Nm || "Party"} (₹${amount})`,
          );
          return;
        }
      }
    }

    setShowFinancialModal(false);
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
      const paymentMode = detail.Py_Mode || detail.Payment_Mode;
      const amount = parseFloat(detail.Amount) || 0;

      if (amount <= 0) continue;

      let bankAccount = null;
      if (paymentMode == "Cash") {
        bankAccount = cashBankAccount;
      } else {
        bankAccount = detailBankSelections[idx];
      }

      if (bankAccount) {
        const cvId = detail.CV_Id || parseInt(id);
        updatePayload.push({
          SL_Lg_Id: bankAccount.Lg_Id,
          Chl_Vou_Id: cvId,
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

  // ============ ACCOUNT NUMBER GENERATION (Is_Acc_Vou_No_Gen == "Y") ============
  // ============ ACCOUNT NUMBER GENERATION (Is_Acc_Vou_No_Gen == "Y") ============
  const handleAccChlNoGeneration = async () => {
    if (voucher?.Acc_Chl_No) {
      toast.info("Receipt number already generated for this voucher");
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        Status: nextAction.Act_Id,
        R_Status: null,
        UserId: userId,
        Mod_Code: currentModule,
        CHl_HOD: user?.apiUserData?.Usr_Id,
        Status_Remark: null,
      };

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
          toast.success(`Receipt number generated: ${accChlNo}`);
        } else {
          updateData.Acc_Chl_No = accChlNo;
          await newChallanFlowService.updateStatus(id, updateData);
          toast.success(
            `Voucher ${nextAction.St_Name.toLowerCase()} successfully!`,
          );
        }
      } else {
        await newChallanFlowService.updateStatus(id, updateData);
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
    } catch (error) {
      console.error("Error generating Acc_Chl_No:", error);
      toast.error(
        error.response?.data?.message || "Failed to generate receipt number",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // ============ PROCESS FINANCIAL ENTRIES (Final Approval - NO CONFIRMATION MODAL) ============
  // ============ PROCESS FINANCIAL ENTRIES (Final Approval - Complete) ============
  const handleFinalApproval = async () => {
    console.log(
      "handleFinalApproval called - Final Approval with Financial Entries",
    );

    if (!voucher?.details) {
      toast.error("No challan details found");
      return;
    }

    // ===== FIX: Define requiresAccGen here =====
    const requiresAccGen = nextAction?.Is_Acc_Vou_No_Gen == "Y";

    // Check if all details have SL_Lg_Id selected
    const missingSL = voucher.details.some((detail) => detail.SL_Lg_Id == null);
    if (missingSL) {
      toast.error(
        "Bank accounts are not selected. Please ensure bank selections are saved before final approval.",
      );
      return;
    }

    // Check if financial entries already exist
    const hasExisting = await checkExistingTransactions(voucher.CV_No);
    if (hasExisting) {
      await Swal.fire({
        title: "Error!",
        text: "Financial entries already exist for this voucher!",
        icon: "error",
        confirmButtonColor: "#EF4444",
        backdrop: true,
      });
      return;
    }

    // Close the modal
    setShowFinancialModal(false);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Show processing spinner
    Swal.fire({
      title: "Processing...",
      html: `Preparing financial entries...<br/><br/>
           <div class="progress-bar-container" style="width: 100%; background-color: #e5e7eb; border-radius: 8px; margin-top: 10px;">
             <div id="swal-progress-bar" style="width: 0%; background-color: #10B981; height: 8px; border-radius: 8px; transition: width 0.3s ease;"></div>
           </div>`,
      allowOutsideClick: false,
      showConfirmButton: false,
      backdrop: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Generate receipt voucher ID
      const receiptVoucherId = await generateNextReceiptId();
      const transactionDate =
        voucher?.Ch_Date || new Date().toISOString().split("T")[0];

      const allTransactions = [];
      let entryCounter = 1;

      // Get main ledger ID from first detail
      const mainLedgerId = voucher?.details?.[0]?.Lg_Id;

      // ============ TAX BREAKDOWN: Extract from voucher details ============
      let taxBreakdown = [];

      // Extract tax items from all details' pay_details
      for (const detail of voucher.details) {
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

      // Also check taxCalculation.taxBreakdown as fallback
      if (
        taxBreakdown.length == 0 &&
        taxCalculation.taxBreakdown &&
        taxCalculation.taxBreakdown.length > 0
      ) {
        taxBreakdown = taxCalculation.taxBreakdown.map((tax) => ({
          ...tax,
          isAdd: tax.Add_Dedu == "1" || tax.Add_Dedu == 1,
          Lg_Id: tax.Lg_Id,
        }));
      }

      console.log("Tax Breakdown:", taxBreakdown);

      // ============ PROCESS MAIN DETAIL ENTRIES ============
      for (let idx = 0; idx < voucher.details.length; idx++) {
        const detail = voucher.details[idx];
        const amount = parseFloat(detail.Amount) || 0;
        const subLedgerId = detail.SL_Id || detail.sub_ledger?.SL_Id;
        const bankAccountLgId = detail.SL_Lg_Id;
        const ledgerId = detail.Lg_Id;

        if (amount > 0 && bankAccountLgId && ledgerId) {
          // 1. Debit entry (Bank Account) - V_Mode "G"
          const debitTransaction = {
            Org_Id: ORG_ID,
            Lg_Id: bankAccountLgId,
            Ref_Id: ledgerId,
            Vou_Ty: "RCP",
            Vou_Id: receiptVoucherId.toString(),
            Vou_Sr: entryCounter.toString(),
            Vou_Ln: entryCounter.toString(),
            V_Mode: "G",
            Vou_Dt: transactionDate,
            Dr_Amt: amount.toFixed(2),
            Cr_Amt: null,
            rmk1: narration || `Challan Receipt: ${voucher.CV_No}`,
            Vou_Rf: voucher.CV_No,
          };
          Object.keys(debitTransaction).forEach((key) => {
            if (
              debitTransaction[key] == undefined ||
              debitTransaction[key] == null
            ) {
              delete debitTransaction[key];
            }
          });
          allTransactions.push(debitTransaction);
          entryCounter++;

          // 2. Credit entry (Ledger Account - Income) - V_Mode "G"
          const creditTransaction = {
            Org_Id: ORG_ID,
            Lg_Id: ledgerId,
            Ref_Id: bankAccountLgId,
            Vou_Ty: "RCP",
            Vou_Id: receiptVoucherId.toString(),
            Vou_Sr: entryCounter.toString(),
            Vou_Ln: entryCounter.toString(),
            V_Mode: "G",
            Vou_Dt: transactionDate,
            Dr_Amt: null,
            Cr_Amt: amount.toFixed(2),
            rmk1: narration || `Challan Receipt: ${voucher.CV_No}`,
            Vou_Rf: voucher.CV_No,
          };
          Object.keys(creditTransaction).forEach((key) => {
            if (
              creditTransaction[key] == undefined ||
              creditTransaction[key] == null
            ) {
              delete creditTransaction[key];
            }
          });
          allTransactions.push(creditTransaction);
          entryCounter++;

          // 3. Sub-ledger entry (if sub-ledger exists) - V_Mode "S"
          if (subLedgerId) {
            const sModeTransaction = {
              Org_Id: ORG_ID,
              Lg_Id: ledgerId,
              Ref_Id: bankAccountLgId,
              Vou_Ty: "RCP",
              Vou_Id: receiptVoucherId.toString(),
              Vou_Sr: entryCounter.toString(),
              Vou_Ln: entryCounter.toString(),
              V_Mode: "S",
              Vou_Dt: transactionDate,
              Dr_Amt: null,
              Cr_Amt: amount.toFixed(2),
              rmk1: narration || `Challan Receipt: ${voucher.CV_No}`,
              Vou_Rf: voucher.CV_No,
              SL_Id: subLedgerId.toString(),
              SL_Amt: amount.toFixed(2),
            };
            Object.keys(sModeTransaction).forEach((key) => {
              if (
                sModeTransaction[key] == undefined ||
                sModeTransaction[key] == null
              ) {
                delete sModeTransaction[key];
              }
            });
            allTransactions.push(sModeTransaction);
            entryCounter++;
          }
        }
      }

      // ============ PROCESS TAX ENTRIES ============
      if (taxBreakdown && taxBreakdown.length > 0) {
        for (const tax of taxBreakdown) {
          const isAdd = tax.isAdd || tax.Add_Dedu == "1" || tax.Add_Dedu == 1;
          const amount = tax.calculatedAmount || parseFloat(tax.IC_Amt) || 0;
          const taxLedgerId = tax.Lg_Id;

          if (amount > 0 && taxLedgerId && mainLedgerId) {
            // 4. First leg: Tax ledger entry - V_Mode "G"
            const taxTransaction = {
              Org_Id: ORG_ID,
              Lg_Id: taxLedgerId,
              Ref_Id: mainLedgerId,
              Vou_Ty: "RCP",
              Vou_Id: receiptVoucherId.toString(),
              Vou_Sr: entryCounter.toString(),
              Vou_Ln: entryCounter.toString(),
              V_Mode: "G",
              Vou_Dt: transactionDate,
              Dr_Amt: isAdd ? amount.toFixed(2) : null,
              Cr_Amt: !isAdd ? amount.toFixed(2) : null,
              rmk1: narration || `Challan Receipt: ${voucher.CV_No}`,
              Vou_Rf: voucher.CV_No,
            };
            Object.keys(taxTransaction).forEach((key) => {
              if (
                taxTransaction[key] == undefined ||
                taxTransaction[key] == null
              ) {
                delete taxTransaction[key];
              }
            });
            allTransactions.push(taxTransaction);
            entryCounter++;

            // 5. Second leg: Counter entry against main ledger - V_Mode "G"
            const taxCounterTransaction = {
              Org_Id: ORG_ID,
              Lg_Id: mainLedgerId,
              Ref_Id: taxLedgerId,
              Vou_Ty: "RCP",
              Vou_Id: receiptVoucherId.toString(),
              Vou_Sr: entryCounter.toString(),
              Vou_Ln: entryCounter.toString(),
              V_Mode: "G",
              Vou_Dt: transactionDate,
              Dr_Amt: !isAdd ? amount.toFixed(2) : null,
              Cr_Amt: isAdd ? amount.toFixed(2) : null,
              rmk1: narration || `Challan Receipt: ${voucher.CV_No}`,
              Vou_Rf: voucher.CV_No,
            };
            Object.keys(taxCounterTransaction).forEach((key) => {
              if (
                taxCounterTransaction[key] == undefined ||
                taxCounterTransaction[key] == null
              ) {
                delete taxCounterTransaction[key];
              }
            });
            allTransactions.push(taxCounterTransaction);
            entryCounter++;
          }
        }
      }

      // Check if any transactions were created
      if (allTransactions.length == 0) {
        Swal.close();
        await Swal.fire({
          title: "Error!",
          text: "No transactions to save! Please check your configuration.",
          icon: "error",
          confirmButtonColor: "#EF4444",
          backdrop: true,
        });
        return;
      }

      // ============ SAVE ALL TRANSACTIONS WITH PROGRESS ============
      const updateProgress = (current, total) => {
        const percent = (current / total) * 100;
        const progressBar = document.getElementById("swal-progress-bar");
        if (progressBar) {
          progressBar.style.width = `${percent}%`;
        }

        const content = document.querySelector(".swal2-html-container");
        if (content) {
          content.innerHTML = `Saving ${current} of ${total} transactions...<br/><br/>
          <div class="progress-bar-container" style="width: 100%; background-color: #e5e7eb; border-radius: 8px; margin-top: 10px;">
            <div id="swal-progress-bar" style="width: ${percent}%; background-color: #10B981; height: 8px; border-radius: 8px; transition: width 0.3s ease;"></div>
          </div>`;
        }
      };

      let savedCount = 0;
      try {
        updateProgress(0, allTransactions.length);
        await axios.post(
          `${API_BASE_URL}/finan-trns/bulk`,
          { transactions: allTransactions },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          },
        );
        savedCount = allTransactions.length;
        updateProgress(savedCount, allTransactions.length);
      } catch (err) {
        console.error(
          "Error saving financial transactions:",
          err.response?.data || err.message,
        );
        Swal.close();
        await Swal.fire({
          title: "Error!",
          html: `<div style="text-align: left;">
                   <p>Failed to save ${allTransactions.length} transaction(s)</p>
                   <br/>
                   <p><strong>Error:</strong> ${err.response?.data?.message || err.message}</p>
                 </div>`,
          icon: "error",
          confirmButtonColor: "#EF4444",
          backdrop: true,
        });
        return;
      }

      // ============ UPDATE STATUS ============
      if (nextAction) {
        const updateData = {
          Status: nextAction.Act_Id,
          R_Status: null,
          CHl_HOD: user?.apiUserData?.Usr_Id,
          Status_Remark: null,
          UserId: userId,
          Mod_Code: currentModule,
          ...(requiresAccGen && { Acc_Chl_No: "generate" }),
        };

        // If Acc_Chl_No already exists, don't override
        if (voucher?.Acc_Chl_No) {
          delete updateData.Acc_Chl_No;
        }

        // If Acc_Chl_No needs to be generated and doesn't exist
        if (requiresAccGen && !voucher?.Acc_Chl_No) {
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
      }

      // Close Swal and show success
      Swal.close();

      await Swal.fire({
        title: "Success!",
        html: `<div style="text-align: left;">
               <p>✅ Financial entries created and voucher approved successfully!</p>
               <br/>
               <p><strong>Total Transactions:</strong> ${savedCount}</p>
               <p><strong>Voucher No:</strong> ${voucher?.CV_No}</p>
               ${voucher?.Acc_Chl_No ? `<p><strong>Receipt No:</strong> ${voucher.Acc_Chl_No}</p>` : ""}
             </div>`,
        icon: "success",
        confirmButtonColor: "#10B981",
        timer: 3000,
        showConfirmButton: true,
        backdrop: true,
      });

      // Reset states and reload
      setShowApproveButton(false);
      setNextAction(null);
      setVoucherLoaded(false);
      await loadVoucherData();
    } catch (error) {
      console.error("Error processing financial entries:", error);
      Swal.close();
      await Swal.fire({
        title: "Error!",
        html: `<div style="text-align: left;">
               <p>Failed to process financial entries</p>
               <br/>
               <p><strong>Error:</strong> ${error.message || "Unknown error"}</p>
             </div>`,
        icon: "error",
        confirmButtonColor: "#EF4444",
        backdrop: true,
      });
    }
  };

  // ============ OPEN FINANCIAL MODAL ============
  // ============ OPEN FINANCIAL MODAL ============
  const openFinancialModal = async () => {
    // Use lastApprovedStatus to determine final approval
    const isFinalApproval = nextAction?.Act_Id == lastApprovedStatus;

    setShowFinancialModal(true);
    setCashBankSearchTerm("");
    setCashBankDropdownOpen(false);
    setOpenDropdownForDetail(null);
    setDetailSearchTerms({});
    setNarration(`Challan Receipt: ${voucher?.CV_No || ""}`);

    if (isFinalApproval) {
      // Final Approval Mode - Read-only, pre-fill from existing SL_Lg_Id
      const cashDetail = voucher?.details?.find(
        (d) => (d.Payment_Mode == "Cash" || d.Py_Mode == "Cash") && d.SL_Lg_Id,
      );
      if (cashDetail?.SL_Lg_Id) {
        const existingAccount = bankAccounts.find(
          (acc) => acc.Lg_Id == cashDetail.SL_Lg_Id,
        );
        if (existingAccount) {
          setCashBankAccount(existingAccount);
        }
      }

      if (voucher?.details) {
        const newSelections = {};
        voucher.details.forEach((detail, idx) => {
          if (detail.SL_Lg_Id) {
            const existingAccount = bankAccounts.find(
              (acc) => acc.Lg_Id == detail.SL_Lg_Id,
            );
            if (existingAccount) {
              newSelections[idx] = existingAccount;
            }
          }
        });
        setDetailBankSelections(newSelections);
      }

      checkExistingTransactions(voucher?.CV_No);
      return;
    }

    // Bank Selection Mode - Editable
    setCashBankAccount(null);
    setDetailBankSelections({});

    try {
      // Updated API endpoint
      const res = await axios.get(`${API_BASE_URL}/payment-mode/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      });
      const paymentModes = res.data?.data || [];

      const cashMode = paymentModes.find(
        (pm) => pm.Is_Cash == true || pm.Is_Cash == 1,
      );
      if (cashMode?.ledger) {
        const cashLedger = cashMode.ledger;
        setCashBankAccount({
          Lg_Id: cashLedger.Lg_Id,
          Lg_Name: cashLedger.Lg_Name,
          Lg_Eng_Name: cashLedger.Lg_Eng_Name,
          Lg_Code: cashLedger.Lg_Code || `L${cashLedger.Lg_Id}`,
        });
      }

      if (voucher?.details) {
        const newSelections = {};
        voucher.details.forEach((detail, idx) => {
          const mode = detail.Py_Mode || detail.Payment_Mode;

          if (detail.SL_Lg_Id) {
            const existingAccount = bankAccounts.find(
              (acc) => acc.Lg_Id == detail.SL_Lg_Id,
            );
            if (existingAccount) {
              newSelections[idx] = existingAccount;
              return;
            }
          }

          if (mode == "Cash") return;
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

  // ============ MAIN APPROVE HANDLER ============
  // ============ MAIN APPROVE HANDLER ============
  const handleApprove = async () => {
    if (!nextAction) {
      toast.error("Cannot determine next status");
      return;
    }

    const requiresBankSelection = nextAction.Is_Bank_Select == "Y";
    const requiresAccGen = nextAction.Is_Acc_Vou_No_Gen == "Y";
    // Use lastApprovedStatus to determine final approval
    const isFinalApproval = nextAction?.Act_Id == lastApprovedStatus;

    // Last stage: post internally and skip Confirm Bank Accounts preview
    if (isFinalApproval) {
      const allHaveSL = voucher?.details?.every(
        (detail) => detail.SL_Lg_Id != null,
      );

      if (!allHaveSL) {
        toast.error(
          "Bank accounts are not selected. Please ensure bank selections are saved before final approval.",
        );
        return;
      }

      const result = await Swal.fire({
        title: `${nextAction.St_Name} Voucher?`,
        text: `Are you sure you want to ${nextAction.St_Name.toLowerCase()} this challan voucher? This will post financial entries.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10B981",
        cancelButtonColor: "#6B7280",
        confirmButtonText: `Yes, ${nextAction.St_Name}`,
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      await handleFinalApproval();
      return;
    }

    // Case 1: Bank Selection Required (Is_Bank_Select == "Y")
    if (requiresBankSelection) {
      openFinancialModal();
      return;
    }

    // Case 2: Account Number Generation (Is_Acc_Vou_No_Gen == "Y")
    if (requiresAccGen) {
      await handleAccChlNoGeneration();
      return;
    }

    // Case 4: Regular approval without bank selection, acc gen, or financial entry
    const result = await Swal.fire({
      title: `${nextAction.St_Name} Voucher?`,
      text: `Are you sure you want to ${nextAction.St_Name.toLowerCase()} this challan voucher?`,
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
        UserId: userId,
        Mod_Code: currentModule,
        CHl_HOD: user?.apiUserData?.Usr_Id,
        Status_Remark: null,
        ...(requiresAccGen && { Acc_Chl_No: "generate" }),
      };

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
      Pos: "bg-indigo-100 text-indigo-800",
      MChallan: "bg-teal-100 text-teal-800",
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
      thRight: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #cbd5e0",
        textAlign: "right",
      },
      td: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      tdRight: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
        textAlign: "right",
      },
      textBold: { fontWeight: "600" },
    };

    // Format date to show as "14 July 2026" format
    const formatDisplayDate = (dateString) => {
      if (!dateString) return "—";
      try {
        if (
          typeof dateString == "string" &&
          dateString.match(/^\d{2}-\d{2}-\d{4}$/)
        ) {
          const parts = dateString.split("-");
          const date = new Date(parts[2], parts[1] - 1, parts[0]);
          return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch (error) {
        return "—";
      }
    };

    // Calculate print summary
    const printSummary = {
      totalAmount: 0,
      totalTaxAmount: 0,
      netPayable: 0,
    };

    if (voucher?.details) {
      voucher.details.forEach((detail) => {
        const amount = parseFloat(detail.Amount) || 0;
        printSummary.totalAmount += amount;

        const rowTaxes = (detail.pay_details || []).filter(
          (p) => p.PD_Ty == "TAX" && parseFloat(p.IC_Amt) != 0,
        );

        rowTaxes.forEach((tax) => {
          const taxAmount = parseFloat(tax.IC_Amt) || 0;
          const isAdd = tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
          if (isAdd) {
            printSummary.totalTaxAmount += taxAmount;
          } else {
            printSummary.totalTaxAmount -= taxAmount;
          }
        });
      });

      printSummary.netPayable =
        printSummary.totalAmount + printSummary.totalTaxAmount;
    }

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Challan Information Section */}
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
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Challan No.
                </td>
                <td style={styles.td}>{voucher?.CV_No}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Date</td>
                <td style={styles.td}>{formatDisplayDate(voucher?.Ch_Date)}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>Branch</td>
                <td style={styles.td}>{getBranchDisplay()}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>Status</td>
                <td style={styles.td}>{getStatusDisplay()}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Approved By
                </td>
                <td style={styles.td}>{voucher?.HOD_User?.Usr_Name || "—"}</td>
                {voucher?.Acc_Chl_No ? (
                  <>
                    <td style={{ ...styles.td, ...styles.textBold }}>
                      Receipt No.
                    </td>
                    <td style={styles.td}>{voucher.Acc_Chl_No}</td>
                  </>
                ) : (
                  <>
                    <td style={{ ...styles.td, ...styles.textBold }}></td>
                    <td style={styles.td}></td>
                  </>
                )}
              </tr>
              {voucher?.Acc_Chl_No && (
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Receipt Date
                  </td>
                  <td style={styles.td}>
                    {formatDisplayDate(voucher.formatted_Acc_Chl_Date) ||
                      formatDisplayDate(voucher.Acc_Chl_Date)}
                  </td>
                  <td style={{ ...styles.td, ...styles.textBold }}></td>
                  <td style={styles.td}></td>
                </tr>
              )}
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

        {/* Bill Details Section */}
        {voucher?.details && voucher.details.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Challan Details</div>
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
                  {formatCurrency(printSummary.totalAmount)}
                </td>
              </tr>
              {printSummary.totalTaxAmount != 0 && (
                <tr>
                  <td style={{ ...styles.td, fontWeight: "600" }}>
                    Tax Amount:{" "}
                    {printSummary.totalTaxAmount >= 0 ? "(+)" : "(-)"}
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color:
                        printSummary.totalTaxAmount >= 0
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
                    {formatCurrency(Math.abs(printSummary.totalTaxAmount))}
                  </td>
                </tr>
              )}
              <tr style={{ backgroundColor: "#f0fdf4" }}>
                <td
                  style={{ ...styles.td, fontWeight: "bold", fontSize: "11px" }}
                >
                  Net Receivable:
                </td>
                <td
                  style={{
                    ...styles.tdRight,
                    fontWeight: "bold",
                    fontSize: "11px",
                    color: "#10b981",
                  }}
                >
                  {formatCurrency(printSummary.netPayable)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Mode Details with Tax and Net Amount columns */}
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
                  <th style={styles.thRight}>Tax Amount (₹)</th>
                  <th style={styles.thRight}>Net Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {voucher.details.map((detail, index) => {
                  const paymentMode = (detail.Payment_Mode || "").toLowerCase();

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

                  const chequeNumber =
                    detail.Chq_No ||
                    detail.Cheque_No ||
                    detail.ChequeNumber ||
                    detail.DD_No ||
                    detail.DDNumber ||
                    "";
                  const chequeDate =
                    detail.Chq_Date ||
                    detail.Cheque_Date ||
                    detail.ChequeDate ||
                    detail.DD_Date ||
                    detail.DDDate ||
                    "";
                  const hasChequeInfo =
                    (chequeNumber &&
                      chequeNumber != "null" &&
                      chequeNumber != "") ||
                    (chequeDate && chequeDate != "null" && chequeDate != "");

                  const showBankDetails =
                    hasBankInfo ||
                    paymentMode == "bank" ||
                    paymentMode == "online" ||
                    paymentMode == "card" ||
                    paymentMode == "pos - collection" ||
                    paymentMode == "pos - online";

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
                          <strong>Date:</strong> {formatDisplayDate(chequeDate)}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    "—"
                  );

                  // Calculate tax for this specific detail
                  const detailTaxes = (detail.pay_details || []).filter(
                    (p) => p.PD_Ty == "TAX" && parseFloat(p.IC_Amt) != 0,
                  );

                  let detailTaxAmount = 0;
                  detailTaxes.forEach((tax) => {
                    const taxAmt = parseFloat(tax.IC_Amt) || 0;
                    const isAdd = tax.Add_Dedu == 1 || tax.Add_Dedu == "1";
                    if (isAdd) {
                      detailTaxAmount += taxAmt;
                    } else {
                      detailTaxAmount -= taxAmt;
                    }
                  });

                  const detailAmount = parseFloat(detail.Amount) || 0;
                  const detailNetAmount = detailAmount + detailTaxAmount;

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
                        {formatCurrency(detailAmount)}
                      </td>
                      <td
                        style={{
                          ...styles.tdRight,
                          color: detailTaxAmount >= 0 ? "#10b981" : "#ef4444",
                        }}
                      >
                        {detailTaxAmount != 0
                          ? formatCurrency(Math.abs(detailTaxAmount))
                          : "—"}
                      </td>
                      <td
                        style={{
                          ...styles.tdRight,
                          fontWeight: "500",
                          color: "#10b981",
                        }}
                      >
                        {formatCurrency(detailNetAmount)}
                      </td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr style={{ backgroundColor: "#f9fafb", fontWeight: "600" }}>
                  <td colSpan="4" style={{ ...styles.td, textAlign: "right" }}>
                    Total:
                  </td>
                  <td style={{ ...styles.tdRight, fontWeight: "600" }}>
                    {formatCurrency(printSummary.totalAmount)}
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color:
                        printSummary.totalTaxAmount >= 0
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
                    {printSummary.totalTaxAmount != 0
                      ? formatCurrency(Math.abs(printSummary.totalTaxAmount))
                      : "—"}
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color: "#10b981",
                    }}
                  >
                    {formatCurrency(printSummary.netPayable)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
  const TaxCalculationDisplay = () => {
    if (
      !taxCalculation.taxBreakdown ||
      taxCalculation.taxBreakdown.length == 0
    ) {
      return null;
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
                Tax Calculation
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
                {formatAmount(taxCalculation.grossAmount)}
              </span>
            </div>

            {taxCalculation.taxBreakdown.map((tax, index) => {
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

            <div className="flex items-center justify-between py-2 mt-2 bg-green-50 rounded-lg px-3 border border-green-100">
              <span className="text-sm font-semibold text-gray-800">
                Net Receivable
              </span>
              <span className="text-base font-bold text-green-700">
                {formatAmount(taxCalculation.netAmount)}
              </span>
            </div>
          </div>
        </div>
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
            navigate("/transactions/bookkeeping-vouchers/new-challan-approval")
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
  // Use lastApprovedStatus to determine final approval
  const isFinalApproval = nextAction?.Act_Id == lastApprovedStatus;

  // Check if payment mode is Cheque for display
  const isChequePayment =
    voucher?.details &&
    voucher.details.some(
      (d) => d.Payment_Mode && d.Payment_Mode.toLowerCase() == "cheque",
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {showPrint && (
        <PrintLayout
          title="Challan Voucher Approval Report"
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
                        ? "Review selected bank accounts and confirm to post financial entries"
                        : "Select bank accounts for each payment mode"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeFinancialModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
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

              {nonCashDetails.map((detail, idx) => {
                const originalIndex = voucher.details.findIndex(
                  (d) => d == detail,
                );
                const paymentMode = detail.Py_Mode || detail.Payment_Mode;
                const amount = parseFloat(detail.Amount) || 0;
                const selectedAccount = detailBankSelections[originalIndex];
                const isOpen = openDropdownForDetail == originalIndex;
                const searchTerm = detailSearchTerms[originalIndex] || "";

                return (
                  <div
                    key={originalIndex}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentModeBadge(paymentMode)} mr-2`}
                        >
                          {paymentMode}
                        </span>
                        <span className="font-medium text-gray-900">
                          {detail.SL_Nm || "Party"}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          Amount: {formatCurrency(amount)}
                        </span>
                      </div>
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
                    placeholder="Enter description for receipt entries..."
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
                  onClick={() => {
                    if (isFinalApproval) {
                      handleFinalApproval();
                    } else {
                      handleBankSelection();
                    }
                  }}
                  disabled={
                    isProcessingPayment || existingTransactions.length > 0
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isFinalApproval
                        ? "Process Financial Entries"
                        : "Save Bank Selections"}
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
                  "/transactions/bookkeeping-vouchers/new-challan-approval",
                )
              }
              className="mr-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Challan Voucher Approval
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
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-base font-semibold text-gray-900">
                  Voucher Information
                </h2>
              </div>
              <div className="px-4 py-3">
                <div
                  className={`grid grid-cols-2 sm:grid-cols-4 ${voucher.Acc_Chl_No ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4`}
                >
                  <div>
                    <div className="text-xs text-gray-500">Challan No.</div>
                    <div className="text-sm font-medium text-gray-900 mt-0.5">
                      {voucher.CV_No}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="text-sm font-medium text-gray-900 mt-0.5">
                      {formatDate(voucher.Ch_Date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Branch</div>
                    <div className="text-sm font-medium text-gray-900 mt-0.5">
                      {getBranchDisplay()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="mt-0.5">{getStatusBadge()}</div>
                  </div>
                  {voucher.Acc_Chl_No && (
                    <div>
                      <div className="text-xs text-gray-500">Receipt No.</div>
                      <div className="text-sm font-medium text-blue-600 mt-0.5">
                        {voucher.Acc_Chl_No}
                      </div>
                    </div>
                  )}
                </div>
                {voucher?.Status_Remark && (
                  <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                        Query:{" "}
                      </span>
                      <span className="text-xs text-amber-900">
                        {voucher.Status_Remark}
                      </span>
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
                            Remarks
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Taxation
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                            Amount (₹)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {voucher.details.map((detail, idx) => {
                          const isCheque =
                            detail.Payment_Mode == "Cheque" ||
                            detail.Payment_Mode == "DD" ||
                            detail.Chq_No;
                          const isBank =
                            detail.Payment_Mode == "Bank" ||
                            detail.Payment_Mode == "Online" ||
                            detail.Payment_Mode == "Card" ||
                            (!detail.Chq_No &&
                              (detail.Acc_No || detail.IFSC_Code));
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
                              <td className="px-3 py-2 text-xs max-w-[200px] break-words">
                                {detail.Remarks || detail.remark || "—"}
                              </td>
                              <td className="px-3 py-2 text-xs">
                                {(() => {
                                  const rowTaxes = (
                                    detail.pay_details || []
                                  ).filter(
                                    (p) =>
                                      p.PD_Ty == "TAX" &&
                                      parseFloat(p.IC_Amt) != 0,
                                  );
                                  if (rowTaxes.length == 0) return "—";
                                  return (
                                    <div className="space-y-0.5">
                                      {rowTaxes.map((t, ti) => {
                                        const label =
                                          t.invoice_charge?.IC_Name ||
                                          t.IC_Name ||
                                          "Tax";
                                        return (
                                          <div
                                            key={ti}
                                            className="text-gray-700"
                                          >
                                            <span className="font-medium">
                                              {label}:
                                            </span>{" "}
                                            {formatCurrency(
                                              parseFloat(t.IC_Amt),
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="px-3 py-2 text-xs text-right font-medium">
                                {formatCurrency(detail.Amount)}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-gray-50 border-t border-gray-200">
                          <td
                            colSpan="13"
                            className="px-3 py-2 text-right text-xs font-semibold text-gray-700"
                          >
                            Total Amount:
                          </td>
                          <td className="px-3 py-2 text-right text-xs font-bold text-gray-900">
                            {formatCurrency(summary.total)}
                          </td>
                        </tr>
                        {taxCalculation.totalTax != 0 && (
                          <tr className="bg-gray-50">
                            <td
                              colSpan="13"
                              className="px-3 py-2 text-right text-xs font-semibold text-gray-700"
                            >
                              Tax Amount:{" "}
                              {isChequePayment
                                ? "(Not Applied for Cheque)"
                                : "(+)"}
                            </td>
                            <td className="px-3 py-2 text-right text-xs font-bold text-gray-900">
                              {isChequePayment
                                ? "—"
                                : formatCurrency(taxCalculation.totalTax)}
                            </td>
                          </tr>
                        )}
                        <tr className="bg-gray-50 border-t border-gray-300">
                          <td
                            colSpan="13"
                            className="px-3 py-2 text-right text-xs font-bold text-gray-900"
                          >
                            Net Receivable:
                          </td>
                          <td className="px-3 py-2 text-right text-xs font-bold text-gray-900">
                            {formatCurrency(taxCalculation.netAmount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                    Review this challan voucher and take appropriate action
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
                                ? "Generate receipt number"
                                : nextAction?.Act_Id == lastApprovedStatus
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

export default NewChallanApprovalView;