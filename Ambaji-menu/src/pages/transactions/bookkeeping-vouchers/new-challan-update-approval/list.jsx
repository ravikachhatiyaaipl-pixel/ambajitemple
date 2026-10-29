// src/pages/Transactions/BookkeepingVouchers/NewChallanUpdate/ApprovalList.jsx

import { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Hash,
  CheckSquare,
  Square,
  Check,
  AlertCircle,
  Banknote,
  ChevronDown,
  ChevronUp,
  Save,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { newChallanFlowService as newChallanVoucherApi } from "../../../services/newchallanflowservice";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const NewChallanApprovalList = ({ user }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const perPageOptions = [25, 50, 75, 100];
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Challan Voucher Approval");
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

  const [lastApprovedStatus, setLastApprovedStatus] = useState(null);

  // Bulk approval states
  const [selectedVouchers, setSelectedVouchers] = useState(new Set());
  const [isBulkApproving, setIsBulkApproving] = useState(false);

  // Bank selection modal states
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const ORG_ID = 1;
  const [vouchersForBankSelection, setVouchersForBankSelection] = useState([]);
  const [nextStatusIdForBank, setNextStatusIdForBank] = useState(null);
  const [isFinalApprovalMode, setIsFinalApprovalMode] = useState(false);

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

  const navigate = useNavigate();

  useEffect(() => {
    loadBankAccounts();
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
    };

    initialize();
  }, [user]);

  const loadMenuAndStage = async (adminCheck, deptId, desigId) => {
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
        setPageTitle(currentMenuItem.Fnc_Title || "Challan Voucher Approval");

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
      const response = await newChallanVoucherApi.getAllByStage(stage);

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
        console.log("Last Approved Status:", lastApprovedStatus);
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

  // ============ ADDED: Auto-select payment modes ============
  const fetchPaymentModesAndAutoSelect = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/payment-mode/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      });
      const paymentModes = res.data?.data || [];

      // Auto-select cash mode
      const cashMode = paymentModes.find(
        (pm) => pm.Is_Cash == true || pm.Is_Cash == 1,
      );
      if (cashMode?.ledger) {
        const cashLedger = cashMode.ledger;
        const newCashAccounts = {};
        vouchersForBankSelection.forEach((v) => {
          newCashAccounts[v.CV_Id] = {
            Lg_Id: cashLedger.Lg_Id,
            Lg_Name: cashLedger.Lg_Name,
            Lg_Eng_Name: cashLedger.Lg_Eng_Name,
            Lg_Code: cashLedger.Lg_Code || `L${cashLedger.Lg_Id}`,
          };
        });
        setVoucherCashBankAccounts(newCashAccounts);
      }

      // Auto-select bank accounts for each non-cash payment mode
      const newDetailSelections = {};
      vouchersForBankSelection.forEach((voucher) => {
        const details = voucher.details || [];
        details.forEach((detail, idx) => {
          const mode = detail.Py_Mode || detail.Payment_Mode;

          // Skip if already has SL_Lg_Id
          if (detail.SL_Lg_Id) {
            const existingAccount = bankAccounts.find(
              (acc) => acc.Lg_Id == detail.SL_Lg_Id,
            );
            if (existingAccount) {
              newDetailSelections[`${voucher.CV_Id}_${idx}`] = existingAccount;
              return;
            }
          }

          if (isCashMode(mode)) return;
          const matched = paymentModes.find(
            (pm) => pm.PayMd_Name == mode || pm.PayMd_Code == mode,
          );
          if (matched?.ledger) {
            const lg = matched.ledger;
            newDetailSelections[`${voucher.CV_Id}_${idx}`] = {
              Lg_Id: lg.Lg_Id,
              Lg_Name: lg.Lg_Name,
              Lg_Eng_Name: lg.Lg_Eng_Name,
              Lg_Code: lg.Lg_Code || `L${lg.Lg_Id}`,
            };
          }
        });
      });
      setVoucherDetailBankSelections(newDetailSelections);
    } catch (err) {
      console.error("Failed to fetch payment modes for auto-selection:", err);
    }
  };

  // ============ ADDED: Pre-fill from existing SL_Lg_Id for final approval ============
  const preFillExistingBankAccounts = () => {
    const newCashAccounts = {};
    const newDetailSelections = {};

    vouchersForBankSelection.forEach((voucher) => {
      const details = voucher.details || [];
      details.forEach((detail, idx) => {
        if (detail.SL_Lg_Id) {
          const existingAccount = bankAccounts.find(
            (acc) => acc.Lg_Id == detail.SL_Lg_Id,
          );
          if (existingAccount) {
            const mode = detail.Py_Mode || detail.Payment_Mode;
            if (isCashMode(mode)) {
              newCashAccounts[voucher.CV_Id] = existingAccount;
            } else {
              newDetailSelections[`${voucher.CV_Id}_${idx}`] = existingAccount;
            }
          }
        }
      });
    });

    setVoucherCashBankAccounts(newCashAccounts);
    setVoucherDetailBankSelections(newDetailSelections);
  };

  useEffect(() => {
    if (permissionsLoaded) {
      loadVouchers();
    }
  }, [currentPage, itemsPerPage, searchTerm, selectedStatusFilter, startDate, endDate, permissionsLoaded]);

  useEffect(() => {
    setSelectedVouchers(new Set());
  }, [currentPage, itemsPerPage, searchTerm, startDate, endDate]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      let statusParam = "";
      if (selectedStatusFilter) {
        statusParam = selectedStatusFilter;
      } else if (approvableStatusIds.length > 0) {
        statusParam = approvableStatusIds.join(",");
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
      const result = await newChallanVoucherApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        skipDeptFilter ? "" : deptId,
        startDate || "",
        endDate || "",
        "Y",
        statusParam,
      );

      setVouchers(result.vouchers || []);
      setTotalItems(result.pagination?.total || 0);
      setTotalPages(result.pagination?.last_page || 1);
    } catch (error) {
      console.error("Error loading vouchers:", error);
      toast.error("Failed to load vouchers");
      setVouchers([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadVouchers();
    setSelectedVouchers(new Set());
    toast.success("Data refreshed successfully!");
  };

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

  const needsAccountVerification = (voucher) => {
    const nextAction = getNextActionForVoucher(voucher);
    if (!nextAction) return false;
    return nextAction.St_Name == "Account Verification";
  };

  const isFinalStage = (voucher) => {
    const nextAction = getNextActionForVoucher(voucher);
    if (!nextAction) return false;

    return nextAction.Act_Id == lastApprovedStatus;
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
    toast.success(`Bank account selected for payment mode`);
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
        const paymentMode = detail.Py_Mode || detail.Payment_Mode;

        if (amount <= 0) continue;

        if (isCashMode(paymentMode)) {
          totalCash += amount;
        } else {
          const selectionKey = `${voucher.CV_Id}_${idx}`;
          if (!voucherDetailBankSelections[selectionKey]) {
            toast.error(
              `Please select a bank account for ${paymentMode} payment - ${detail.SL_Nm || "Party"} in voucher ${voucher.CV_No}`,
            );
            return false;
          }
        }
      }

      if (totalCash > 0 && !voucherCashBankAccounts[voucher.CV_Id]) {
        toast.error(
          `Please select a bank account for Cash payments (Total: ${formatCurrency(totalCash)}) in voucher ${voucher.CV_No}`,
        );
        return false;
      }
    }
    return true;
  };

  // ============ PROCESS BULK BANK SELECTION (Is_Bank_Select == "Y") ============
  const processBulkBankSelection = async () => {
    if (!validateBankSelectionsForVouchers()) return;

    // ===== FIX: Define requiresAccGen here =====
    const nextActionForVoucher = getNextActionForVoucher(vouchersForBankSelection[0]);
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
      // Build payload for all vouchers
      const allUpdatePayload = [];

      for (const voucher of vouchersForBankSelection) {
        const details = voucher.details || [];

        for (let idx = 0; idx < details.length; idx++) {
          const detail = details[idx];
          const paymentMode = detail.Py_Mode || detail.Payment_Mode;
          const amount = parseFloat(detail.Amount) || 0;

          if (amount <= 0) continue;

          let bankAccount = null;
          if (isCashMode(paymentMode)) {
            bankAccount = voucherCashBankAccounts[voucher.CV_Id];
          } else {
            const selectionKey = `${voucher.CV_Id}_${idx}`;
            bankAccount = voucherDetailBankSelections[selectionKey];
          }

          if (bankAccount) {
            const cvId = detail.CV_Id || parseInt(voucher.CV_Id);
            allUpdatePayload.push({
              SL_Lg_Id: bankAccount.Lg_Id,
              Chl_Vou_Id: cvId,
            });
          }
        }
      }

      if (allUpdatePayload.length == 0) {
        toast.error("No bank accounts selected to update");
        setIsBulkApproving(false);
        return;
      }

      // Call the API to update SL_Lg_Id for all selected vouchers
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

        // Update status for all vouchers to next action
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
                "/transactions/bookkeeping-vouchers/new-challan-approval",
            );
            return item?.Mod_Code || "";
          } catch (e) {
            return "CHAL";
          }
        })();

        const ids = vouchersForBankSelection.map((v) => v.CV_Id);

        await newChallanVoucherApi.bulkUpdateStatus(ids, {
          Status: nextStatusIdForBank,
          R_Status: null,
          UserId: userId,
          Mod_Code: currentModule,
          CHl_HOD: user?.apiUserData?.Usr_Id,
          Status_Remark: null,
          ...(requiresAccGen && { Acc_Chl_No: "generate" })
        });

        toast.success(
          `${vouchersForBankSelection.length} voucher(s) updated successfully!`,
        );

        setVoucherCashBankAccounts({});
        setVoucherDetailBankSelections({});
        setSelectedVouchers(new Set());
        await loadVouchers();
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

  // ============ PROCESS SINGLE VOUCHER FINANCIAL ENTRIES (WITH TAX) ============
  const processSingleVoucherFinancialEntries = async (
    voucher,
    receiptVoucherId,
    narrationText,
  ) => {
    const transactionDate =
      voucher?.Ch_Date || new Date().toISOString().split("T")[0];
    const details = voucher.details || [];
    const allTransactions = [];
    let entryCounter = 1;

    // Get main ledger ID from first detail
    const mainLedgerId =
      details[0]?.Lg_Id || details[0]?.ledger?.Lg_Id || voucher.Lg_Id;

    // ============ TAX BREAKDOWN: Extract from pay_details ============
    let taxBreakdown = [];

    try {
      // First try to get payment data via API
      const paymentResponse =
        await newChallanVoucherApi.getPaymentVoucherByPVNo(voucher.CV_No);
      if (paymentResponse.success && paymentResponse.data) {
        const paymentData = paymentResponse.data;
        if (paymentData.pay_details && paymentData.pay_details.length > 0) {
          taxBreakdown = paymentData.pay_details
            .filter((detail) => detail.PD_Ty == "TAX")
            .map((detail) => ({
              ...detail,
              calculatedAmount: parseFloat(detail.IC_Amt) || 0,
              isAdd: detail.Add_Dedu == "1" || detail.Add_Dedu == 1,
              Lg_Id: detail.Lg_Id,
            }));
        }
      }
    } catch (error) {
      console.error("Error loading payment data for tax calculation:", error);
    }

    // Fallback: If API fails, try to extract from voucher details directly
    if (taxBreakdown.length == 0) {
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
    }

    // ============ PROCESS MAIN DETAIL ENTRIES ============
    for (let idx = 0; idx < details.length; idx++) {
      const detail = details[idx];
      const paymentMode = detail.Py_Mode || detail.Payment_Mode;
      const amount = parseFloat(detail.Amount) || 0;
      const subLedgerId =
        detail.SL_Id || detail.ledger?.SL_Id || detail.sub_ledger?.SL_Id;
      const bankAccountLgId = detail.SL_Lg_Id; // Use the saved SL_Lg_Id
      const ledgerId = detail.Lg_Id || detail.ledger?.Lg_Id || mainLedgerId;

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
          rmk1: narrationText || `Challan Receipt: ${voucher.CV_No}`,
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
          rmk1: narrationText || `Challan Receipt: ${voucher.CV_No}`,
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
            rmk1: narrationText || `Challan Receipt: ${voucher.CV_No}`,
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
        const isAdd = tax.isAdd;
        const amount = tax.calculatedAmount;
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
            rmk1: narrationText || `Challan Receipt: ${voucher.CV_No}`,
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
            rmk1: narrationText || `Challan Receipt: ${voucher.CV_No}`,
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

    // Clean and save all transactions in one bulk call
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

  // ============ PROCESS BULK FINAL APPROVAL (Financial Entries) ============
  const processBulkFinalApproval = async (vouchersOverride, statusOverride) => {
    const vouchersToProcess = vouchersOverride?.length
      ? vouchersOverride
      : vouchersForBankSelection;
    const statusId = statusOverride ?? nextStatusIdForBank;

    if (!vouchersToProcess?.length) {
      toast.error("No vouchers selected for final approval");
      return;
    }

    const nextActionForVoucher = getNextActionForVoucher(vouchersToProcess[0]);
    const requiresAccGen = nextActionForVoucher?.Is_Acc_Vou_No_Gen == "Y";

    setIsBulkApproving(true);
    setShowBankModal(false);
    setIsFinalApprovalMode(false);

    Swal.fire({
      title: "Processing Bulk Financial Entries...",
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
              "/transactions/bookkeeping-vouchers/new-challan-approval",
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

          // Check if financial entries already exist
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
              `Skipping financial entries for ${voucher.CV_No} — already exist, proceeding with status update only`,
            );
          } else {
            const receiptVoucherId = await generateNextReceiptId();
            const narrationText =
              narration || `Bulk approval: ${voucher.CV_No}`;

            await processSingleVoucherFinancialEntries(
              voucher,
              receiptVoucherId,
              narrationText,
            );
          }

          // Update status to next action
          await newChallanVoucherApi.bulkUpdateStatus([voucher.CV_Id], {
            Status: statusId,
            R_Status: null,
            UserId: userId,
            Mod_Code: currentModule,
            CHl_HOD: user?.apiUserData?.Usr_Id,
            Status_Remark: null,
            ...(requiresAccGen && { Acc_Chl_No: "generate" })
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

      Swal.close();

      let message = `<div style="text-align: left;">`;
      if (successCount > 0) {
        message += `<p class="text-green-600">✅ ${successCount} voucher(s) processed successfully!</p>`;
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
        title:
          successCount > 0 ? "Bulk Processing Complete" : "All Vouchers Failed",
        html: message,
        icon: successCount > 0 ? "success" : "error",
        confirmButtonColor: "#10B981",
      });

      if (successCount > 0) {
        setSelectedVouchers(new Set());
        setVoucherCashBankAccounts({});
        setVoucherDetailBankSelections({});
        setNarration("");
        await loadVouchers();
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
    } finally {
      setIsBulkApproving(false);
    }
  };

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
    const selectableVouchers = vouchers.filter((v) => canBeApproved(v));

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
    const selectableVouchers = vouchers.filter((v) => canBeApproved(v));
    return (
      selectableVouchers.length > 0 &&
      selectedVouchers.size == selectableVouchers.length
    );
  };

  const getSelectableCount = () => {
    return vouchers.filter((v) => canBeApproved(v)).length;
  };

  // ============ UPDATED: handleBulkApproval with auto-selection ============
  const handleBulkApproval = async () => {
    if (selectedVouchers.size == 0) {
      toast.error("Please select at least one voucher to approve");
      return;
    }

    const selectedVoucherList = vouchers.filter((v) =>
      selectedVouchers.has(v.CV_Id),
    );

    // Check if all selected vouchers have the same next action
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

    // Log the next action to debug
    console.log("Next Action:", nextAction);
    console.log("Is_Bank_Select:", nextAction?.Is_Bank_Select);
    console.log("Is_Acc_Vou_No_Gen:", nextAction?.Is_Acc_Vou_No_Gen);
    console.log("Last Approved Status:", lastApprovedStatus);
    console.log("Next Action Act_Id:", nextAction?.Act_Id);

    const isFinal = nextAction?.Act_Id == lastApprovedStatus;
    const requiresBankSelection = nextAction?.Is_Bank_Select == "Y";
    const requiresAccGen = nextAction?.Is_Acc_Vou_No_Gen == "Y";

    console.log("isFinal:", isFinal);
    console.log("requiresBankSelection:", requiresBankSelection);
    console.log("requiresAccGen:", requiresAccGen);

    // ============ CASE 1: Bank Selection Required (Is_Bank_Select == "Y") ============
    // Skip bank modal on last stage; posting uses already-selected banks.
    if (requiresBankSelection && !isFinal) {
      const allSameStage = selectedVoucherList.every((v) => {
        const action = getNextActionForVoucher(v);
        return action?.Act_Id == nextAction.Act_Id;
      });

      if (!allSameStage) {
        toast.error(
          "All selected vouchers must have the same next stage for bank selection.",
        );
        return;
      }

      // ============ FIX: Ensure bank accounts are loaded with proper async/await ============
      // First, make sure bankAccounts is loaded
      let currentBankAccounts = bankAccounts;
      if (currentBankAccounts.length == 0) {
        console.log("Bank accounts not loaded, loading now...");
        await loadBankAccounts();

        // Wait for state to update - use a small delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Since we can't guarantee the state updated, get fresh data directly
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

          // Update state
          setBankAccounts(mappedBankAccounts);
          currentBankAccounts = mappedBankAccounts;
        } catch (err) {
          console.error("Error loading bank accounts:", err);
        }
      }

      // Now set the modal state
      setVouchersForBankSelection(selectedVoucherList);
      setNextStatusIdForBank(nextAction.Act_Id);
      setIsFinalApprovalMode(false);
      setShowBankModal(true);

      // Call auto-select with the current bank accounts
      setTimeout(() => {
        // Use the currentBankAccounts variable that has the data
        autoSelectBankAccounts(selectedVoucherList, currentBankAccounts);
      }, 300);

      return;
    }

    // ============ CASE 2: Account Number Generation (Is_Acc_Vou_No_Gen == "Y") ============
    if (requiresAccGen && !isFinal) {
      const result = await Swal.fire({
        title: "Generate Receipt Numbers",
        html: `
          <div style="text-align: left;">
            <p><strong>Are you sure you want to generate receipt numbers for ${selectedVouchers.size} voucher(s)?</strong></p>
            <p class="text-sm text-gray-600 mt-2">This will generate Acc_Chl_No for all selected vouchers.</p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10B981",
        cancelButtonColor: "#6B7280",
        confirmButtonText: `Yes, Generate ${selectedVouchers.size} Receipt(s)`,
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      setIsBulkApproving(true);

      Swal.fire({
        title: "Generating Receipt Numbers...",
        html: `Processing ${selectedVouchers.size} voucher(s)...`,
        allowOutsideClick: false,
        showConfirmButton: false,
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
                "/transactions/bookkeeping-vouchers/new-challan-approval",
            );
            return item?.Mod_Code || "";
          } catch (e) {
            return "CHAL";
          }
        })();

        const ids = selectedVoucherList.map((v) => v.CV_Id);

        // Call the bulk update with Acc_Chl_No generation
        await newChallanVoucherApi.bulkUpdateStatus(ids, {
          Status: nextAction.Act_Id,
          R_Status: null,
          UserId: userId,
          Mod_Code: currentModule,
          CHl_HOD: user?.apiUserData?.Usr_Id,
          Status_Remark: null,
          Acc_Chl_No: "generate", // This flag tells the API to generate Acc_Chl_No
        });

        Swal.close();
        
        await Swal.fire({
          title: "Success!",
          html: `<div style="text-align: left;">
                  <p>✅ ${ids.length} receipt number(s) generated successfully!</p>
                  <p class="text-sm text-gray-600 mt-2">All selected vouchers have been updated with receipt numbers.</p>
                </div>`,
          icon: "success",
          confirmButtonColor: "#10B981",
          timer: 3000,
          showConfirmButton: true,
        });
        
        toast.success(`${ids.length} receipt(s) generated successfully!`);
        setSelectedVouchers(new Set());
        await loadVouchers();
        
      } catch (error) {
        console.error("Bulk receipt generation error:", error);
        Swal.close();
        
        // Check if it's a validation error from the API
        let errorMessage = error.message || "Unknown error";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        await Swal.fire({
          title: "Error!",
          html: `<div style="text-align: left;">
                  <p>Failed to generate receipt numbers</p>
                  <p class="text-sm text-red-600 mt-2"><strong>Error:</strong> ${errorMessage}</p>
                </div>`,
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      } finally {
        setIsBulkApproving(false);
      }
      return;
    }

    // ============ CASE 3: Final Approval (Financial Entries) ============
    // Skip Confirm Bank Accounts preview; post using already-selected banks.
    if (isFinal) {
      const allHaveSL = selectedVoucherList.every((v) =>
        v.details?.every((detail) => detail.SL_Lg_Id != null),
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
            <p class="text-sm text-gray-600 mt-2">This will post financial entries for all selected vouchers.</p>
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

      await processBulkFinalApproval(selectedVoucherList, nextAction.Act_Id);
      return;
    }

    // ============ CASE 4: Regular approval ============
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
              "/transactions/bookkeeping-vouchers/new-challan-approval",
          );
          return item?.Mod_Code || "";
        } catch (e) {
          return "CHAL";
        }
      })();

      const ids = selectedVoucherList.map((v) => v.CV_Id);

      try {
        await newChallanVoucherApi.bulkUpdateStatus(ids, {
          Status: nextAction.Act_Id,
          R_Status: null,
          UserId: userId,
          Mod_Code: currentModule,
          CHl_HOD: user?.apiUserData?.Usr_Id,
          Status_Remark: null,
          ...(requiresAccGen && { Acc_Chl_No: "generate" })
        });
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
        await loadVouchers();
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
  // Add these new functions after the existing functions

  // New function for auto-selecting bank accounts with provided data
  const autoSelectBankAccounts = async (vouchers, bankAccountsData) => {
    try {
      // First, get payment modes
      const res = await axios.get(`${API_BASE_URL}/payment-mode/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      });
      const paymentModes = res.data?.data || [];

      // Auto-select cash mode
      const cashMode = paymentModes.find(
        (pm) => pm.Is_Cash == true || pm.Is_Cash == 1,
      );
      const newCashAccounts = {};

      if (cashMode?.ledger) {
        const cashLedger = cashMode.ledger;
        vouchers.forEach((v) => {
          // Find if this voucher has cash payments
          const hasCash = v.details?.some((d) =>
            isCashMode(d.Py_Mode || d.Payment_Mode),
          );
          if (hasCash) {
            newCashAccounts[v.CV_Id] = {
              Lg_Id: cashLedger.Lg_Id,
              Lg_Name: cashLedger.Lg_Name,
              Lg_Eng_Name: cashLedger.Lg_Eng_Name,
              Lg_Code: cashLedger.Lg_Code || `L${cashLedger.Lg_Id}`,
            };
          }
        });
        setVoucherCashBankAccounts(newCashAccounts);
      }

      // Auto-select bank accounts for each non-cash payment mode
      const newDetailSelections = {};
      vouchers.forEach((voucher) => {
        const details = voucher.details || [];
        details.forEach((detail, idx) => {
          const mode = detail.Py_Mode || detail.Payment_Mode;

          // Skip if already has SL_Lg_Id
          if (detail.SL_Lg_Id) {
            const existingAccount = bankAccountsData.find(
              (acc) => acc.Lg_Id == detail.SL_Lg_Id,
            );
            if (existingAccount) {
              newDetailSelections[`${voucher.CV_Id}_${idx}`] = existingAccount;
              return;
            }
          }

          if (isCashMode(mode)) return;
          const matched = paymentModes.find(
            (pm) => pm.PayMd_Name == mode || pm.PayMd_Code == mode,
          );
          if (matched?.ledger) {
            const lg = matched.ledger;
            newDetailSelections[`${voucher.CV_Id}_${idx}`] = {
              Lg_Id: lg.Lg_Id,
              Lg_Name: lg.Lg_Name,
              Lg_Eng_Name: lg.Lg_Eng_Name,
              Lg_Code: lg.Lg_Code || `L${lg.Lg_Id}`,
            };
          }
        });
      });
      setVoucherDetailBankSelections(newDetailSelections);

      console.log("Auto-selection completed successfully");
    } catch (err) {
      console.error("Failed to auto-select bank accounts:", err);
    }
  };

  // New function for pre-filling with provided data
  const preFillExistingBankAccountsWithData = (vouchers, bankAccountsData) => {
    const newCashAccounts = {};
    const newDetailSelections = {};

    vouchers.forEach((voucher) => {
      const details = voucher.details || [];
      details.forEach((detail, idx) => {
        if (detail.SL_Lg_Id) {
          const existingAccount = bankAccountsData.find(
            (acc) => acc.Lg_Id == detail.SL_Lg_Id,
          );
          if (existingAccount) {
            const mode = detail.Py_Mode || detail.Payment_Mode;
            if (isCashMode(mode)) {
              newCashAccounts[voucher.CV_Id] = existingAccount;
            } else {
              newDetailSelections[`${voucher.CV_Id}_${idx}`] = existingAccount;
            }
          }
        }
      });
    });

    setVoucherCashBankAccounts(newCashAccounts);
    setVoucherDetailBankSelections(newDetailSelections);
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
                        ? "Final Approval - Confirm Bank Accounts"
                        : "Select Bank Accounts"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {isFinalApprovalMode
                        ? "Review selected bank accounts and confirm to post financial entries"
                        : `Select bank accounts for ${vouchersForBankSelection.length} voucher(s)`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBankModal(false)}
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
                  ? voucher.details?.find(
                      (d) =>
                        isCashMode(d.Py_Mode || d.Payment_Mode) && d.SL_Lg_Id,
                    )
                    ? bankAccounts.find(
                        (acc) =>
                          acc.Lg_Id ==
                          voucher.details.find(
                            (d) =>
                              isCashMode(d.Py_Mode || d.Payment_Mode) &&
                              d.SL_Lg_Id,
                          )?.SL_Lg_Id,
                      )
                    : null
                  : voucherCashBankAccounts[voucher.CV_Id];
                const isCashDropdownOpen =
                  openDropdownForVoucher == voucher.CV_Id;
                const cashSearchTerm = bankSearchTerms[voucher.CV_Id] || "";
                const isFinalForVoucher =
                  getNextActionForVoucher(voucher)?.Act_Id ==
                  lastApprovedStatus;

                let totalCashAmount = 0;
                details.forEach((detail) => {
                  const paymentMode = detail.Py_Mode || detail.Payment_Mode;
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
                        {voucher.Acc_Chl_No && (
                          <span className="ml-3 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            Receipt: {voucher.Acc_Chl_No}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${isFinalForVoucher ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {isFinalForVoucher
                          ? "Final Approval"
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
                                ? `${cashBankAccount.Lg_Name} (${cashBankAccount.Lg_Code})`
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
                      const paymentMode = detail.Py_Mode || detail.Payment_Mode;
                      const amount = parseFloat(detail.Amount) || 0;
                      if (amount <= 0 || isCashMode(paymentMode)) return null;

                      const selectionKey = `${voucher.CV_Id}_${idx}`;
                      const selectedAccount = isFinalApprovalMode
                        ? detail.SL_Lg_Id
                          ? bankAccounts.find(
                              (acc) => acc.Lg_Id == detail.SL_Lg_Id,
                            )
                          : null
                        : voucherDetailBankSelections[selectionKey];
                      const isDetailOpen =
                        openDetailDropdownForVoucher[voucher.CV_Id] == idx;
                      const detailSearchTerm =
                        detailSearchTerms[selectionKey] || "";

                      return (
                        <div
                          key={idx}
                          className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentModeBadge(paymentMode)} mr-2`}
                              >
                                {paymentMode}
                              </span>
                              <span className="text-sm font-medium">
                                {detail.SL_Nm || "Party"}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">
                                Amount: {formatCurrency(amount)}
                              </span>
                              {isFinalApprovalMode && detail.SL_Lg_Id && (
                                <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                  ✓ Selected
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
                                  ? `${selectedAccount.Lg_Name} (${selectedAccount.Lg_Code})`
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

              {/* Narration - only for final approval */}
              {isFinalApprovalMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Narration / Description
                  </label>
                  <textarea
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-sm"
                    placeholder="Enter common description for all receipts..."
                    rows="3"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowBankModal(false)}
                  disabled={isBulkApproving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (isFinalApprovalMode) {
                      processBulkFinalApproval();
                    } else {
                      processBulkBankSelection();
                    }
                  }}
                  disabled={isBulkApproving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isBulkApproving ? (
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
              Review and approve challan vouchers
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
          approvableStatusIds.includes(parseInt(action.Previous_Status)),
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
              .filter((action) =>
                approvableStatusIds.includes(parseInt(action.Previous_Status)),
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
                      setSelectedStatusFilter(isActive ? "" : statusStr);
                      setCurrentPage(1);
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
            disabled={isBulkApproving}
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

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="flex gap-0 rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by voucher number, department..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-10 py-3 outline-none text-sm bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearFilters}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </form>

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
              ) : vouchers.length > 0 ? (
                vouchers.map((voucher) => {
                  const hasPermission = canBeApproved(voucher);
                  const nextAction = getNextActionForVoucher(voucher);

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
                          {nextAction?.Act_Id == lastApprovedStatus &&
                            hasPermission && (
                              <div className="mt-1">
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full inline-flex items-center">
                                  <AlertCircle className="h-2 w-2 mr-1" />
                                  Final Approval
                                </span>
                              </div>
                            )}
                          {nextAction?.Is_Bank_Select == "Y" &&
                            hasPermission && (
                              <div className="mt-1">
                                <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full inline-flex items-center">
                                  <Banknote className="h-2 w-2 mr-1" />
                                  Bank Selection Required
                                </span>
                              </div>
                            )}
                          {voucher.Acc_Chl_No && (
                            <div className="mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                                Receipt: {voucher.Acc_Chl_No}
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
                      <td className="px-6 py-4">
                        {getStatusBadge(voucher)}
                       
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/transactions/bookkeeping-vouchers/new-challan-approval/view/${voucher.CV_Id}`}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150 inline-block"
                          title="View Details & Approve"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
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

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
        <div className="text-sm text-gray-700">
          Showing {totalItems == 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
          entries
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={itemsPerPage}
            onChange={handlePerPageChange}
            disabled={isBulkApproving}
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
              disabled={currentPage == 1 || isBulkApproving}
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
                  disabled={isBulkApproving}
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
              disabled={currentPage == totalPages || isBulkApproving}
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

export default NewChallanApprovalList;