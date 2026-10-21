import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  Building,
  Users,
  Receipt,
  Hash,
  AlertCircle,
  CreditCard,
  Percent,
  Calculator,
  Info,
  Plus,
  Minus,
  Shield,
  ShieldAlert,
  ArrowRight,
  Eye,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  BookOpen,
  Loader2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BillChallanEntryApi } from "../../../services/billchallanentryapi";

const AddEditBillChallanEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [branchLedgerMapping, setBranchLedgerMapping] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [branchLedgerTenders, setBranchLedgerTenders] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [filteredTenderAllocations, setFilteredTenderAllocations] = useState(
    [],
  );
  const [selectedVendorTenders, setSelectedVendorTenders] = useState([]);
  const [selectedTenderDetails, setSelectedTenderDetails] = useState(null);
  const [taxParameters, setTaxParameters] = useState([]);
  const [calculatedTaxes, setCalculatedTaxes] = useState({
    grossAmount: 0,
    netAmount: 0,
    taxBreakdown: [],
    totalTax: 0,
    calculationSteps: [],
    penalties: [],
  });

  const [penalties, setPenalties] = useState([]);
  const [loadingPenalties, setLoadingPenalties] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [manualTaxAmounts, setManualTaxAmounts] = useState({});

  const [organisationSettings, setOrganisationSettings] = useState(null);
  const [financialYears, setFinancialYears] = useState([]);
  const [currentFinancialYear, setCurrentFinancialYear] = useState(null);
  const [genVoucherConfig, setGenVoucherConfig] = useState(null);

  const [bankVerificationCheck, setBankVerificationCheck] = useState({
    showWarning: false,
    vendorId: null,
    vendorName: "",
    isBankVerified: false,
  });

  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [filteredLedgersByBranch, setFilteredLedgersByBranch] = useState([]);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
  const [ledgerHighlightedIndex, setLedgerHighlightedIndex] = useState(-1);
  const [loadingBranchLedgers, setLoadingBranchLedgers] = useState(false);
  const [loadingTenderEntries, setLoadingTenderEntries] = useState(false);
  const ledgerDropdownRef = useRef(null);
  const ledgerSearchRef = useRef(null);
  const ledgerItemRefs = useRef([]);
  const ledgerListRef = useRef(null);
  const ledgerButtonRef = useRef(null);

  // Store original branch ID for edit mode
  const [originalBranchId, setOriginalBranchId] = useState(null);

  // Branch search states
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchHighlightedIndex, setBranchHighlightedIndex] = useState(-1);
  const branchDropdownRef = useRef(null);
  const branchSearchRef = useRef(null);
  const branchItemRefs = useRef([]);
  const branchListRef = useRef(null);
  const branchButtonRef = useRef(null);

  // Vendor search states
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorHighlightedIndex, setVendorHighlightedIndex] = useState(-1);
  const vendorDropdownRef = useRef(null);
  const vendorSearchRef = useRef(null);
  const vendorItemRefs = useRef([]);
  const vendorListRef = useRef(null);
  const vendorButtonRef = useRef(null);

  // Tender search states
  const [tenderSearchTerm, setTenderSearchTerm] = useState("");
  const [isTenderDropdownOpen, setIsTenderDropdownOpen] = useState(false);
  const [tenderHighlightedIndex, setTenderHighlightedIndex] = useState(-1);
  const tenderDropdownRef = useRef(null);
  const tenderSearchRef = useRef(null);
  const tenderItemRefs = useRef([]);
  const tenderListRef = useRef(null);
  const tenderButtonRef = useRef(null);

  // Refs for focus management
  const dateInputRef = useRef(null);
  const grossAmountRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  // Form state - Updated to match new API
  const [formData, setFormData] = useState({
    PV_No: "",
    PV_Chln_Date: new Date().toISOString().split("T")[0],
    Dpt_Id: "",
    Lg_Id: "",
    SL_Id: "",
    WA_Id: "",
    Gross_Amt: "",
    Add_Amt: "",
    Less_Amt: "",
    Net_Amt: "",
    Remarks: "",
    Status: "draft",
    PV_Ty: "VEND",
    pay_details: [],
  });

  // Fixed custom rounding function - rounds up if decimal >= 0.5
  const customRound = (value) => {
    if (value == undefined || value == null || isNaN(value)) return 0;

    // Check if decimal part is >= 0.5
    const decimal = value - Math.floor(value);
    if (decimal >= 0.5) {
      return Math.ceil(value);
    }
    // Use Math.round for normal rounding
    return Math.round(value * 100) / 100;
  };

  const formatCustomAmount = (amount) => {
    if (amount == undefined || amount == null || isNaN(amount)) return "0.00";
    const roundedAmount = customRound(amount);
    return roundedAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format amount for API payload (without commas)
  const formatAmountForAPI = (amount) => {
    if (amount == undefined || amount == null || isNaN(amount)) return 0;
    const roundedAmount = customRound(amount);
    return parseFloat(roundedAmount.toFixed(2));
  };

  // Load data for dropdowns
  useEffect(() => {
    // Read gvn_no from menu_details, then fetch live config from API
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const menuItem = menuDetails.find(
        (m) => m.Menu_Links == "/transactions/vendor-payments/bill-challan-entry"
      );
      const gvnNo = menuItem?.gvn_no ?? menuItem?.gen_voucher_no?.gvn_no;

      if (gvnNo) {
        fetch(`${import.meta.env.VITE_API_URL}/gen-voucher/${gvnNo}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
            Accept: "application/json",
          },
        })
          .then((res) => res.json())
          .then((json) => {
            if (json.success && json.data) {
              setGenVoucherConfig(json.data);
            }
          })
          .catch((e) => console.error("Failed to fetch gen voucher config:", e));
      }
    } catch (e) {
      console.error("Error reading gvn_no from menu_details:", e);
    }

    loadDropdownData();

    if (id && id != "create") {
      setIsEditMode(true);
      loadPaymentVoucherData();
    }
  }, [id]);

  // Focus on date field after loading (only for add mode)
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isBranchDropdownOpen && branchSearchRef.current) {
      setTimeout(() => branchSearchRef.current.focus(), 0);
    }
  }, [isBranchDropdownOpen]);

  useEffect(() => {
    if (isLedgerDropdownOpen && ledgerSearchRef.current) {
      setTimeout(() => ledgerSearchRef.current.focus(), 0);
    }
  }, [isLedgerDropdownOpen]);

  useEffect(() => {
    if (isVendorDropdownOpen && vendorSearchRef.current) {
      setTimeout(() => vendorSearchRef.current.focus(), 0);
    }
  }, [isVendorDropdownOpen]);

  useEffect(() => {
    if (isTenderDropdownOpen && tenderSearchRef.current) {
      setTimeout(() => tenderSearchRef.current.focus(), 0);
    }
  }, [isTenderDropdownOpen]);

  // Scroll highlighted item into view
  const scrollIntoView = (listRef, itemRefs, highlightedIndex) => {
    if (highlightedIndex >= 0 && listRef.current) {
      const container = listRef.current;
      const item = itemRefs.current[highlightedIndex];
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
  };

  useEffect(() => {
    scrollIntoView(branchListRef, branchItemRefs, branchHighlightedIndex);
  }, [branchHighlightedIndex, isBranchDropdownOpen]);

  useEffect(() => {
    scrollIntoView(ledgerListRef, ledgerItemRefs, ledgerHighlightedIndex);
  }, [ledgerHighlightedIndex, isLedgerDropdownOpen]);

  useEffect(() => {
    scrollIntoView(vendorListRef, vendorItemRefs, vendorHighlightedIndex);
  }, [vendorHighlightedIndex, isVendorDropdownOpen]);

  useEffect(() => {
    scrollIntoView(tenderListRef, tenderItemRefs, tenderHighlightedIndex);
  }, [tenderHighlightedIndex, isTenderDropdownOpen]);

  // Add click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        branchDropdownRef.current &&
        !branchDropdownRef.current.contains(event.target)
      ) {
        setIsBranchDropdownOpen(false);
        setBranchHighlightedIndex(-1);
        setBranchSearchTerm("");
      }
      if (
        ledgerDropdownRef.current &&
        !ledgerDropdownRef.current.contains(event.target)
      ) {
        setIsLedgerDropdownOpen(false);
        setLedgerHighlightedIndex(-1);
        setLedgerSearchTerm("");
      }
      if (
        vendorDropdownRef.current &&
        !vendorDropdownRef.current.contains(event.target)
      ) {
        setIsVendorDropdownOpen(false);
        setVendorHighlightedIndex(-1);
        setVendorSearchTerm("");
      }
      if (
        tenderDropdownRef.current &&
        !tenderDropdownRef.current.contains(event.target)
      ) {
        setIsTenderDropdownOpen(false);
        setTenderHighlightedIndex(-1);
        setTenderSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchBranchLedgerTenders = async () => {
      if (formData.Dpt_Id && formData.Lg_Id) {
        setLoadingTenderEntries(true);
        try {
          const response =
            await BillChallanEntryApi.getTenderEntriesByBranchLedger(
              formData.Dpt_Id,
              formData.Lg_Id,
            );

          console.log("Tender entries response:", response);

          if (response.success && response.data?.tender_entries) {
            const tenderEntries = response.data.tender_entries;
            setBranchLedgerTenders(tenderEntries);

            // Extract unique vendors from tender entries
            const vendorMap = new Map();
            const allocations = [];

            tenderEntries.forEach((tenderEntry) => {
              if (
                tenderEntry.vendor_allocations &&
                tenderEntry.vendor_allocations.length > 0
              ) {
                tenderEntry.vendor_allocations.forEach((allocation) => {
                  const vendorId = allocation.SL_Id
                    ? parseInt(allocation.SL_Id)
                    : null;
                  const vendorCode = allocation.vendor_details?.SL_Code || "";
                  const vendorName = allocation.vendor_details?.SL_Name || "";

                  if (vendorId) {
                    vendorMap.set(vendorId, {
                      SL_Id: vendorId,
                      SL_Name: vendorName,
                      SL_Code: vendorCode,
                    });

                    allocations.push({
                      tender_entry_id: tenderEntry.TE_Id,
                      tender_allocation_id: allocation.WA_Id,
                      vendor_id: vendorId,
                      vendor_name: vendorName,
                      vendor_code: vendorCode,
                      gross_amount: allocation.WO_Amount,
                      tender_work_details: {
                        tend_work_id: tenderEntry.TnT_ID,
                        work_name: tenderEntry.tendertype?.TnT_Name || "",
                        TnT_ID: tenderEntry.TnT_ID,
                      },
                      vendor_invoice_parameters:
                        tenderEntry.vendor_invoice_parameters || [],
                      description: tenderEntry.Description,
                      proposal_amount: tenderEntry.Proposal_Amount,
                    });
                  }
                });
              }
            });

            console.log("Extracted vendors:", Array.from(vendorMap.values()));
            console.log("Extracted allocations count:", allocations.length);

            setFilteredVendors(Array.from(vendorMap.values()));
            setFilteredTenderAllocations(allocations);

            if (formData.SL_Id) {
              const vendorAllocations = allocations.filter(
                (allocation) =>
                  allocation.vendor_id == parseInt(formData.SL_Id),
              );
              setSelectedVendorTenders(vendorAllocations);
            }
          } else {
            setBranchLedgerTenders([]);
            setFilteredVendors([]);
            setFilteredTenderAllocations([]);
            setSelectedVendorTenders([]);
          }
        } catch (error) {
          console.error("Error fetching branch-ledger tenders:", error);
          toast.error("Failed to load tender entries");
          setBranchLedgerTenders([]);
          setFilteredVendors([]);
          setFilteredTenderAllocations([]);
          setSelectedVendorTenders([]);
        } finally {
          setLoadingTenderEntries(false);
        }
      } else {
        setBranchLedgerTenders([]);
        setFilteredVendors([]);
        setFilteredTenderAllocations([]);
        setSelectedVendorTenders([]);
      }
    };

    fetchBranchLedgerTenders();
  }, [formData.Dpt_Id, formData.Lg_Id]);

  // Focus on vendor button after vendors are loaded (only for add mode)
  useEffect(() => {
    if (
      !loadingTenderEntries &&
      filteredVendors.length > 0 &&
      formData.Dpt_Id &&
      formData.Lg_Id &&
      vendorButtonRef.current &&
      !vendorButtonRef.current.disabled &&
      !isEditMode
    ) {
      // Only in add mode

      setTimeout(() => {
        if (vendorButtonRef.current && !vendorButtonRef.current.disabled) {
          vendorButtonRef.current.focus();
        }
      }, 100);
    }
  }, [
    loadingTenderEntries,
    filteredVendors,
    formData.Dpt_Id,
    formData.Lg_Id,
    isEditMode,
  ]);

  // Consolidated focus management for edit mode
  useEffect(() => {
    if (isEditMode && !loading && !loadingTenderEntries && !loadingPenalties) {
      // Small delay to ensure all data is loaded and rendered
      const focusTimeout = setTimeout(() => {
        // If tender is preselected, focus on gross amount
        if (formData.WA_Id && selectedTenderDetails && grossAmountRef.current) {
          grossAmountRef.current.focus();
        }
        // If vendor is preselected but no tender, focus on tender button
        else if (
          formData.SL_Id &&
          selectedVendorTenders.length > 0 &&
          tenderButtonRef.current &&
          !tenderButtonRef.current.disabled
        ) {
          tenderButtonRef.current.focus();
        }
        // If ledger is preselected but no vendor, focus on vendor button
        else if (
          formData.Lg_Id &&
          filteredVendors.length > 0 &&
          vendorButtonRef.current &&
          !vendorButtonRef.current.disabled
        ) {
          vendorButtonRef.current.focus();
        }
        // If branch is preselected but no ledger, focus on ledger button
        else if (
          formData.Dpt_Id &&
          filteredLedgersByBranch.length > 0 &&
          ledgerButtonRef.current &&
          !ledgerButtonRef.current.disabled
        ) {
          ledgerButtonRef.current.focus();
        }
        // Otherwise focus on date field (first field)
        else if (dateInputRef.current) {
          dateInputRef.current.focus();
        }
      }, 300);

      return () => clearTimeout(focusTimeout);
    }
  }, [
    isEditMode,
    loading,
    loadingTenderEntries,
    loadingPenalties,
    formData.WA_Id,
    formData.SL_Id,
    formData.Lg_Id,
    formData.Dpt_Id,
    selectedTenderDetails,
    selectedVendorTenders,
    filteredVendors,
    filteredLedgersByBranch,
  ]);

  // Load vendor-specific tender allocations when vendor is selected
  useEffect(() => {
    const loadVendorAllocations = () => {
      if (formData.SL_Id && filteredTenderAllocations.length > 0) {
        const vendorId = parseInt(formData.SL_Id);
        const vendorAllocations = filteredTenderAllocations.filter(
          (allocation) => allocation.vendor_id == vendorId,
        );

        setSelectedVendorTenders(vendorAllocations);

        // If in edit mode and we have a WA_Id, find and set it
        if (isEditMode && formData.WA_Id) {
          const selectedAllocation = vendorAllocations.find(
            (allocation) =>
              allocation.tender_allocation_id == parseInt(formData.WA_Id),
          );

          if (selectedAllocation) {
            setSelectedTenderDetails(selectedAllocation);
            // Load tax parameters
            if (selectedAllocation.vendor_invoice_parameters?.length > 0) {
              const params = selectedAllocation.vendor_invoice_parameters;
              setTaxParameters(params);
              // IMPORTANT: Calculate taxes immediately
              if (formData.Gross_Amt && parseFloat(formData.Gross_Amt) > 0) {
                if (isDataLoaded) {
                  calculateTaxes(
                    parseFloat(formData.Gross_Amt),
                    params,
                    manualTaxAmounts,
                  );
                } else {
                  calculateTaxes(parseFloat(formData.Gross_Amt), params);
                }
              }
            }
          }
        }
      } else {
        setSelectedVendorTenders([]);
      }
    };

    loadVendorAllocations();
  }, [formData.SL_Id, filteredTenderAllocations, isEditMode, formData.WA_Id, isDataLoaded]);

  // Load penalties when vendor and tender allocation are selected
  useEffect(() => {
    const loadPenaltiesForSelection = async () => {
      if (formData.SL_Id && formData.WA_Id) {
        // In edit mode with data already loaded, skip fetching penalties from API
        // as they were already loaded from pay_details
        if (isEditMode && isDataLoaded && penalties.length > 0) {
          console.log("Using existing penalties from pay_details:", penalties);
          // Recalculate taxes with existing penalties and manual overrides
          if (formData.Gross_Amt && parseFloat(formData.Gross_Amt) > 0) {
            calculateTaxes(
              parseFloat(formData.Gross_Amt),
              taxParameters,
              manualTaxAmounts,
            );
          }
          return;
        }

        // In edit mode but no penalties loaded yet (or add mode), fetch from API
        const billNo = isEditMode ? formData.PV_No : "empty";
        await fetchPenalties(
          parseInt(formData.WA_Id),
          parseInt(formData.SL_Id),
          billNo,
        );
      } else {
        if (!isDataLoaded) {
          setPenalties([]);
        }
      }
    };

    loadPenaltiesForSelection();
  }, [formData.SL_Id, formData.WA_Id, isEditMode, formData.PV_No, isDataLoaded]);

  // Add this useEffect after your other useEffects
  useEffect(() => {
    // Only run when we have calculated taxes
    if (
      calculatedTaxes.taxBreakdown &&
      calculatedTaxes.taxBreakdown.length > 0
    ) {
      const payDetails = [];

      // Add tax entries (filter out zero amounts)
      calculatedTaxes.taxBreakdown
        .filter((item) => item.type == "tax" && item.calculatedAmount > 0)
        .forEach((tax, index) => {
          payDetails.push({
            PD_Ty: "TAX",
            TnT_ID:
              tax.TnT_ID || selectedTenderDetails?.tender_work_details?.TnT_ID,
            PVD_Sr: index + 1,
            VIP_Id: tax.VIP_Id,
            IC_Id: tax.IC_Id || tax.invoice_charge_id,
            Lg_Id: tax.Lg_Id || tax.ledger_id,
            Percent: tax.percentage,
            Formula: tax.formula || "",
            IC_Amt: formatAmountForAPI(tax.calculatedAmount || 0),
            Add_Dedu: tax.isAdd ? 1 : 0,
          });
        });

      // Add penalty entries (filter out zero amounts)
          const taxCount = calculatedTaxes.taxBreakdown.filter(
            (t) => t.type == "tax" && t.calculatedAmount > 0,
          ).length;
      calculatedTaxes.taxBreakdown
        .filter((item) => item.type == "penalty" && item.calculatedAmount > 0)
        .forEach((penalty, index) => {
          payDetails.push({
            PD_Ty: "PENLTY",
            TnT_ID: selectedTenderDetails?.tender_work_details?.TnT_ID,
            PVD_Sr: taxCount + index + 1,
            VIP_Id: null,
            IC_Id: null,
            Lg_Id: penalty?.ledger?.Lg_Id || null,
            Percent: penalty.percentage?.toString() || "0",
            Formula:
              penalty.fix_per == "Fixed"
                ? "Fixed Amount"
                : `${penalty.percentage}%`,
            IC_Amt: formatAmountForAPI(penalty.calculatedAmount || 0),
            Add_Dedu: penalty.isAdd ? 1 : 0,
          });
        });

      // Only update if pay_details actually changed to avoid infinite loops
      if (JSON.stringify(formData.pay_details) != JSON.stringify(payDetails)) {
        setFormData((prev) => ({
          ...prev,
          Gross_Amt: formatAmountForAPI(
            calculatedTaxes.grossAmount || 0,
          ).toString(),
          Add_Amt: formatAmountForAPI(calculatedTaxes.totalAdd || 0).toString(),
          Less_Amt: formatAmountForAPI(
            calculatedTaxes.totalLess || 0,
          ).toString(),
          Net_Amt: formatAmountForAPI(
            calculatedTaxes.netAmount || 0,
          ).toString(),
          pay_details: payDetails,
        }));
      }
    }
  }, [calculatedTaxes, selectedTenderDetails]);

  const loadDropdownData = async () => {
    try {
      const [branchLedgerRes, orgSettingsRes, financialYearsRes] =
        await Promise.all([
          BillChallanEntryApi.getTenderUniqueBranchWithLedger(),
          BillChallanEntryApi.getOrganisationSettings(),
          BillChallanEntryApi.getFinancialYears(),
        ]);

      if (branchLedgerRes.success && branchLedgerRes.data) {
        const branchesData = branchLedgerRes.data.map((item) => ({
          id: item.department.Dpt_id,
          desc: item.department.Dpt_Desc,
          name: item.department.Dpt_Name,
        }));
        setBranches(branchesData);
        setBranchLedgerMapping(branchLedgerRes.data);
      }

      const orgSettingsData = orgSettingsRes.data?.data || orgSettingsRes.data;
      if (Array.isArray(orgSettingsData) && orgSettingsData.length > 0) {
        setOrganisationSettings(orgSettingsData[0]);
      } else if (orgSettingsData && typeof orgSettingsData == "object") {
        setOrganisationSettings(orgSettingsData);
      }

      const financialYearsData =
        financialYearsRes.data?.data || financialYearsRes.data;
      if (Array.isArray(financialYearsData)) {
        setFinancialYears(financialYearsData);
        const currentYear = financialYearsData.find(
          (year) => year.is_current_year == true,
        );
        setCurrentFinancialYear(currentYear || financialYearsData[0]);
      } else {
        console.error(
          "Financial years data is not an array:",
          financialYearsData,
        );
        setFinancialYears([]);
        setCurrentFinancialYear(null);
      }
    } catch (error) {
      toast.error("Failed to load form data");
      console.error("Error loading dropdown data:", error);
    }
  };

  const loadLedgersByBranch = (branchId) => {
    setLoadingBranchLedgers(true);
    try {
      const branchData = branchLedgerMapping.find(
        (item) => item.department.Dpt_id == parseInt(branchId),
      );

      if (branchData && branchData.ledgers) {
        const branchLedgers = branchData.ledgers.filter(
          (ledger) => ledger.Lg_Status == true || ledger.Lg_Status == undefined,
        );

        setFilteredLedgersByBranch(branchLedgers);
        setFilteredLedgers(branchLedgers); // Also set filteredLedgers

        if (formData.Lg_Id) {
          const selectedLedger = branchLedgers.find(
            (l) => l.Lg_Id == parseInt(formData.Lg_Id),
          );
          if (!selectedLedger) {
            // Don't clear the ledger ID if it exists but isn't in the current list
            // This handles cases where the ledger might be inactive
            console.log("Selected ledger not found in current branch ledgers");
          }
        }
      } else {
        setFilteredLedgersByBranch([]);
        setFilteredLedgers([]);
      }
    } catch (error) {
      console.error("Error loading branch ledgers:", error);
      setFilteredLedgersByBranch([]);
      setFilteredLedgers([]);
    } finally {
      setLoadingBranchLedgers(false);
    }
  };

  const fetchPenalties = async (WA_Id, SL_Id, billNo = "empty") => {
    setLoadingPenalties(true);
    try {
      const response = await BillChallanEntryApi.getPenalties(
        WA_Id,
        SL_Id,
        billNo,
      );

      if (response.success && response.data) {
        const penaltiesData = response.data.map((penalty) => ({
          tp_id: penalty.TA_Id,
          SL_Id: penalty.SL_Id,
          WA_Id: penalty.WA_Id,
          p_amount: penalty.Adj_Amount?.toString() || "0",
          fix_per: penalty.Fix_Per == "F" ? "Fixed" : "Percentage",
          percentage: penalty.Percentage?.toString() || "0",
          Add_Deduct: penalty.Add_Deduct == "A" ? "add" : "deduct",
          Date: penalty.TA_Date || new Date().toISOString().split("T")[0],
          Bill_No: penalty.Bill_No,
          ledger: penalty.ledger || null,
        }));

        console.log("Loaded penalties from API:", penaltiesData);
        setPenalties(penaltiesData);

        // IMPORTANT: Recalculate taxes with the new penalties
        if (formData.Gross_Amt && parseFloat(formData.Gross_Amt) > 0) {
          calculateTaxes(parseFloat(formData.Gross_Amt), taxParameters, manualTaxAmounts);
        }
      } else {
        setPenalties([]);
      }
    } catch (error) {
      console.error("Error loading penalties:", error);
      toast.error("Failed to load penalties");
      setPenalties([]);
    } finally {
      setLoadingPenalties(false);
    }
  };

  const loadPaymentVoucherData = async () => {
    setLoading(true);
    try {
      const response = await BillChallanEntryApi.getById(id);
      const data = response.data;

      // Store the original branch ID for edit mode
      setOriginalBranchId(data.Dpt_Id?.toString());

      // FIRST: Load branch-specific ledgers BEFORE setting form data
      if (data.Dpt_Id) {
        await loadLedgersByBranch(data.Dpt_Id);
      }

      // THEN set form data
      const formDataUpdate = {
        PV_No: data.PV_No || "",
        PV_Chln_Date: data.PV_Chln_Date
          ? data.PV_Chln_Date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        Dpt_Id: data.Dpt_Id?.toString() || "",
        Lg_Id: data.Lg_Id?.toString() || "",
        SL_Id: data.SL_Id?.toString() || "",
        WA_Id: data.WA_Id?.toString() || "",
        Gross_Amt: data.Gross_Amt?.toString() || "",
        Add_Amt: data.Add_Amt?.toString() || "",
        Less_Amt: data.Less_Amt?.toString() || "",
        Net_Amt: data.Net_Amt?.toString() || "",
        Status: data.Status || "draft",
        Remarks: data.Remarks || "",
        PV_Ty: data.PV_Ty || "VEND",
        pay_details: data.pay_details || [],
      };

      setFormData(formDataUpdate);

      // Load tender entries for the branch-ledger combination
      if (data.Dpt_Id && data.Lg_Id) {
        const tenderResponse =
          await BillChallanEntryApi.getTenderEntriesByBranchLedger(
            data.Dpt_Id,
            data.Lg_Id,
          );

        if (tenderResponse.success && tenderResponse.data?.tender_entries) {
          const tenderEntries = tenderResponse.data.tender_entries;
          setBranchLedgerTenders(tenderEntries);

          const vendorMap = new Map();
          const allocations = [];

          tenderEntries.forEach((tenderEntry) => {
            if (
              tenderEntry.vendor_allocations &&
              tenderEntry.vendor_allocations.length > 0
            ) {
              tenderEntry.vendor_allocations.forEach((allocation) => {
                const vendorId = allocation.SL_Id
                  ? parseInt(allocation.SL_Id)
                  : null;
                const vendorCode = allocation.vendor_details?.SL_Code || "";
                const vendorName = allocation.vendor_details?.SL_Name || "";

                if (vendorId) {
                  vendorMap.set(vendorId, {
                    SL_Id: vendorId,
                    SL_Name: vendorName,
                    SL_Code: vendorCode,
                  });

                  allocations.push({
                    tender_entry_id: tenderEntry.TE_Id,
                    tender_allocation_id: allocation.WA_Id,
                    vendor_id: vendorId,
                    vendor_name: vendorName,
                    vendor_code: vendorCode,
                    gross_amount: allocation.WO_Amount,
                    tender_work_details: {
                      tend_work_id: tenderEntry.TnT_ID,
                      work_name: tenderEntry.tendertype?.TnT_Name || "",
                      TnT_ID: tenderEntry.TnT_ID,
                    },
                    vendor_invoice_parameters:
                      tenderEntry.vendor_invoice_parameters || [],
                    description: tenderEntry.Description,
                    proposal_amount: tenderEntry.Proposal_Amount,
                  });
                }
              });
            }
          });

          setFilteredVendors(Array.from(vendorMap.values()));
          setFilteredTenderAllocations(allocations);

          // Load selected vendor's tender allocations
          if (data.SL_Id) {
            const vendorId = parseInt(data.SL_Id);
            const vendorAllocations = allocations.filter(
              (allocation) => allocation.vendor_id == vendorId,
            );
            setSelectedVendorTenders(vendorAllocations);

            // Find selected tender allocation
            if (data.WA_Id) {
              const selectedAllocation = vendorAllocations.find(
                (allocation) =>
                  allocation.tender_allocation_id == parseInt(data.WA_Id),
              );

              if (selectedAllocation) {
                setSelectedTenderDetails(selectedAllocation);
                if (selectedAllocation.vendor_invoice_parameters?.length > 0) {
                  const params = selectedAllocation.vendor_invoice_parameters;
                  setTaxParameters(params);
                }
              }
            }
          }
        }
      }

      // Process penalties and manual tax amounts from pay_details
      let loadedPenalties = [];
      const loadedManualTaxAmounts = {};

      if (data.pay_details && data.pay_details.length > 0) {
        // Extract penalties
        loadedPenalties = data.pay_details
          .filter((detail) => detail.PD_Ty == "PENLTY")
          .map((detail) => ({
            tp_id: detail.VIP_Id || detail.tp_id,
            SL_Id: data.SL_Id,
            WA_Id: data.WA_Id,
            p_amount: detail.IC_Amt?.toString() || "0",
            fix_per: detail.Formula?.includes("%") ? "Percentage" : "Fixed",
            percentage: detail.Percent || "0",
            Add_Deduct: detail.Add_Dedu == 1 ? "add" : "deduct",
            Date: data.PV_Chln_Date || new Date().toISOString().split("T")[0],
            Bill_No: data.PV_No,
            ledger: detail.ledger || null,
          }));

        // Extract manual tax amounts (formula == "*")
        data.pay_details
          .filter(
            (detail) =>
              detail.PD_Ty == "TAX" &&
              String(detail.Formula || "").trim() == "*",
          )
          .forEach((detail) => {
            if (detail.VIP_Id != null) {
              loadedManualTaxAmounts[detail.VIP_Id] =
                parseFloat(detail.IC_Amt) || 0;
            }
          });

        console.log("Loaded penalties from pay_details:", loadedPenalties);
        console.log(
          "Loaded manual tax amounts from pay_details:",
          loadedManualTaxAmounts,
        );

        setPenalties(loadedPenalties);
        setManualTaxAmounts(loadedManualTaxAmounts);
      }

      // Mark data as loaded and trigger tax calculation with loaded overrides
      setIsDataLoaded(true);

      // Trigger calculation with loaded manual overrides if we have all the data
      if (
        data.Gross_Amt &&
        parseFloat(data.Gross_Amt) > 0 &&
        data.WA_Id
      ) {
        // We'll recalculate after taxParameters are set via the useEffect chain,
        // but we store the overrides so they're available when calculateTaxes is called.
        // The loadVendorAllocations useEffect will call calculateTaxes with these overrides.
        console.log(
          "Edit mode: manual overrides and penalties ready for recalculation",
        );
      }
    } catch (error) {
      toast.error("Failed to load payment voucher data");
      console.error("Error loading payment voucher:", error);
      navigate("/transactions/vendor-payments/bill-challan-entry");
    } finally {
      setLoading(false);
    }
  };

  const generateVoucherNumber = (branchId, ledgerId) => {
    if (!branchId || !currentFinancialYear) return "";

    const selectedBranch = branches.find((b) => b.id == parseInt(branchId));
    const branchData = branchLedgerMapping.find(
      (item) => item.department.Dpt_id == parseInt(branchId),
    );
    const selectedLedger = branchData?.ledgers.find(
      (l) => l.Lg_Id == parseInt(ledgerId),
    );

    // ── Dynamic format from gen_voucher_no config ──────────────────────────
    if (genVoucherConfig && genVoucherConfig.Is_Active == "Y") {
      // Serial is fetched from API in fetchNextVoucherNumber — this path
      // is only reached if the API call failed, so show a placeholder.
      const c = genVoucherConfig;
      const fyCode   = currentFinancialYear.FY_Code || "2025-26";
      const deptCode = selectedBranch?.desc || selectedBranch?.name || "";
      const serial   = "????";

      const segs = [];
      if (c.prifix)                  segs.push({ v: c.prifix,   sep: c.prifix_dev_type || c.dev_type || "/" });
      if (c.Dept == "Y" && deptCode) segs.push({ v: deptCode,   sep: c.dept_dev_type   || c.dev_type || "/" });
      if (c.Text)                    segs.push({ v: c.Text,      sep: c.text_dev_type   || c.dev_type || "/" });
      segs.push(                                 { v: serial,    sep: c.no_dev_type     || c.dev_type || "/" });
      if (c.FY == "Y")               segs.push({ v: fyCode,     sep: null });

      return segs.map((s, i) => (i < segs.length - 1 ? s.v + s.sep : s.v)).join("");
    }

    // ── Fallback: original logic ───────────────────────────────────────────
    if (!organisationSettings || !selectedBranch || !selectedLedger) return "";

    const orgCode = organisationSettings.Org_Code || "ORG";
    const branchDesc = selectedBranch.desc || "";
    const ledgerCode = selectedLedger.Lg_Code || "";
    const financialYearCode = currentFinancialYear.FY_Code || "";

    const cleanBranchDesc = branchDesc
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\u0A80-\u0AFFa-zA-Z0-9\s]/g, "");

    return cleanBranchDesc
      ? `${orgCode}/${cleanBranchDesc}/${ledgerCode}/${financialYearCode}`
      : `${orgCode}/${ledgerCode}/${financialYearCode}`;
  };

  /**
   * Fetch the next voucher number from the backend counter API.
   * Falls back to the local generateVoucherNumber if the config is inactive
   * or the API call fails.
   */
  const fetchNextVoucherNumber = async (branchId, ledgerId) => {
    // Only call the API when the gen voucher config is active
    if (genVoucherConfig && genVoucherConfig.Is_Active == "Y" && currentFinancialYear) {
      try {
        const selectedBranch = branches.find((b) => b.id == parseInt(branchId));
        const params = new URLSearchParams();

        // Pass dept_id only when series is Dept_Series
        if (genVoucherConfig.No == "Dept_Series" && selectedBranch) {
          params.append("dept_id", selectedBranch.id);
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/pay-voucher/counters/data?${params}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
              Accept: "application/json",
            },
          }
        );
        const json = await res.json();

        if (json.success && json.next_number != null) {
          // Build the full voucher number using the config + next serial from API
          const c       = genVoucherConfig;
          const fyCode  = currentFinancialYear.FY_Code || "2025-26";
          const deptCode = selectedBranch?.desc || selectedBranch?.name || "";
          const serial  = String(json.next_number);

          const segs = [];
          if (c.prifix)                  segs.push({ v: c.prifix,   sep: c.prifix_dev_type || c.dev_type || "/" });
          if (c.Dept == "Y" && deptCode) segs.push({ v: deptCode,   sep: c.dept_dev_type   || c.dev_type || "/" });
          if (c.Text)                    segs.push({ v: c.Text,      sep: c.text_dev_type   || c.dev_type || "/" });
          segs.push(                                 { v: serial,    sep: c.no_dev_type     || c.dev_type || "/" });
          if (c.FY == "Y")               segs.push({ v: fyCode,     sep: null });

          return segs.map((s, i) => (i < segs.length - 1 ? s.v + s.sep : s.v)).join("");
        }
      } catch (err) {
        console.error("Failed to fetch next voucher number from API:", err);
      }
    }

    // Fallback: build locally
    return generateVoucherNumber(branchId, ledgerId);
  };

  // Branch keyboard handlers
  const handleBranchKeyDown = (e) => {
    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsBranchDropdownOpen(true);
      setBranchSearchTerm("");
      setBranchHighlightedIndex(-1);
      setTimeout(() => branchSearchRef.current?.focus(), 0);
    }
  };

  const handleBranchSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const filtered = getFilteredBranchesForDisplay();
      if (filtered.length > 0) {
        setBranchHighlightedIndex(0);
        setTimeout(() => {
          if (branchItemRefs.current[0]) {
            branchItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      // Stay in search
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBranchDropdownOpen(false);
      setBranchHighlightedIndex(-1);
      setBranchSearchTerm("");
      branchButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      const filtered = getFilteredBranchesForDisplay();
      if (filtered.length > 0 && branchHighlightedIndex >= 0) {
        handleBranchSelect(filtered[branchHighlightedIndex].id);
      } else if (filtered.length > 0) {
        handleBranchSelect(filtered[0].id);
      }
    }
  };

  const handleBranchItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const filtered = getFilteredBranchesForDisplay();
      const nextIndex = idx + 1;
      if (nextIndex < filtered.length) {
        setBranchHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (branchItemRefs.current[nextIndex]) {
            branchItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setBranchHighlightedIndex(-1);
        setTimeout(() => branchSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setBranchHighlightedIndex(-1);
        setTimeout(() => branchSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setBranchHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (branchItemRefs.current[prevIndex]) {
            branchItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleBranchSelect(item.id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBranchDropdownOpen(false);
      setBranchHighlightedIndex(-1);
      setBranchSearchTerm("");
      branchButtonRef.current?.focus();
    }
  };

  const handleBranchSearchChange = (e) => {
    const value = e.target.value;
    setBranchSearchTerm(value);
    setBranchHighlightedIndex(-1);
  };

  const getFilteredBranchesForDisplay = () => {
    if (!branches.length) return [];
    if (!branchSearchTerm.trim()) return branches;

    return branches.filter(
      (branch) =>
        branch.desc.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
        branch.name.toLowerCase().includes(branchSearchTerm.toLowerCase()),
    );
  };

  const getSelectedBranchDisplay = () => {
    if (!formData.Dpt_Id) return "Select Branch";
    const branch = branches.find((b) => b.id == parseInt(formData.Dpt_Id));
    return branch ? `${branch.desc} (${branch.name})` : "Select Branch";
  };

  const handleBranchSelect = (branchId) => {
    setFormData((prev) => ({
      ...prev,
      Dpt_Id: branchId.toString(),
      Lg_Id: "", // Reset ledger when branch changes
      SL_Id: "",
      WA_Id: "",
      Gross_Amt: "",
    }));
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm("");
    setBranchHighlightedIndex(-1);

    if (branchId && (!isEditMode || !formData.PV_No)) {
      fetchNextVoucherNumber(branchId, formData.Lg_Id).then((voucherNumber) => {
        if (voucherNumber) {
          setFormData((prev) => ({ ...prev, PV_No: voucherNumber }));
        }
      });
    }

    if (branchId) {
      loadLedgersByBranch(branchId);
    } else {
      setFilteredLedgers([]);
      setFilteredLedgersByBranch([]);
    }

    if (errors.Dpt_Id) {
      setErrors((prev) => ({ ...prev, Dpt_Id: "" }));
    }

    // Focus on ledger button after branch selection
    setTimeout(() => ledgerButtonRef.current?.focus(), 100);
  };

  // Ledger keyboard handlers - UPDATED to allow selection in edit mode
  const handleLedgerKeyDown = (e) => {
    // Rule 1: Branch must be selected first
    if (!formData.Dpt_Id) {
      toast.error("Please select a branch first");
      return;
    }

    // REMOVED THE RESTRICTION - Allow ledger selection in edit mode
    // Just show a warning but still allow
    if (isEditMode && formData.Lg_Id && formData.Dpt_Id == originalBranchId) {
      toast.info(
        "Changing ledger will reset vendor and tender selections. Please verify the new ledger is correct.",
      );
      // Continue to open dropdown instead of returning
    }

    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsLedgerDropdownOpen(true);
      setLedgerSearchTerm("");
      setLedgerHighlightedIndex(-1);
      setTimeout(() => ledgerSearchRef.current?.focus(), 0);
    }
  };

  const handleLedgerSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredLedgers.length > 0) {
        setLedgerHighlightedIndex(0);
        setTimeout(() => {
          if (ledgerItemRefs.current[0]) {
            ledgerItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      // Stay in search
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredLedgers.length > 0 && ledgerHighlightedIndex >= 0) {
        handleLedgerSelect(filteredLedgers[ledgerHighlightedIndex].Lg_Id);
      } else if (filteredLedgers.length > 0) {
        handleLedgerSelect(filteredLedgers[0].Lg_Id);
      }
    }
  };

  const handleLedgerItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredLedgers.length) {
        setLedgerHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (ledgerItemRefs.current[nextIndex]) {
            ledgerItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setLedgerHighlightedIndex(-1);
        setTimeout(() => ledgerSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setLedgerHighlightedIndex(-1);
        setTimeout(() => ledgerSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setLedgerHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (ledgerItemRefs.current[prevIndex]) {
            ledgerItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleLedgerSelect(item.Lg_Id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    }
  };

  const handleLedgerSearchChange = (e) => {
    const value = e.target.value;
    setLedgerSearchTerm(value);

    const sourceLedgers =
      formData.Dpt_Id && filteredLedgersByBranch.length > 0
        ? filteredLedgersByBranch
        : [];

    if (value.trim() == "") {
      setFilteredLedgers(sourceLedgers);
    } else {
      const filtered = sourceLedgers.filter(
        (ledger) =>
          (ledger.Lg_Code &&
            ledger.Lg_Code.toLowerCase().includes(value.toLowerCase())) ||
          (ledger.Lg_Name &&
            ledger.Lg_Name.toLowerCase().includes(value.toLowerCase())) ||
          (ledger.Lg_Eng_Name &&
            ledger.Lg_Eng_Name.toLowerCase().includes(value.toLowerCase())),
      );
      setFilteredLedgers(filtered);
    }
    setLedgerHighlightedIndex(-1);
  };

  // UPDATED handleLedgerSelect - removed the restriction
  const handleLedgerSelect = async (ledgerId) => {
    // Check if this is a change in edit mode and show confirmation
    if (isEditMode && formData.Lg_Id && ledgerId.toString() != formData.Lg_Id) {
      const result = await Swal.fire({
        title: "Change Ledger?",
        text: "Changing the ledger will reset the selected vendor and tender. Continue?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#EF5350",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, change",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        setIsLedgerDropdownOpen(false);
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      Lg_Id: ledgerId.toString(),
      SL_Id: "", // Reset vendor when ledger changes
      WA_Id: "",
      Gross_Amt: "",
    }));

    setIsLedgerDropdownOpen(false);
    setLedgerSearchTerm("");
    setLedgerHighlightedIndex(-1);

    const branchData = branchLedgerMapping.find(
      (item) => item.department.Dpt_id == parseInt(formData.Dpt_Id),
    );
    const sourceLedgers = branchData?.ledgers || [];
    setFilteredLedgers(sourceLedgers);

    if (ledgerId && formData.Dpt_Id && !isEditMode) {
      fetchNextVoucherNumber(formData.Dpt_Id, ledgerId).then((voucherNumber) => {
        if (voucherNumber) {
          setFormData((prev) => ({ ...prev, PV_No: voucherNumber }));
        }
      });
    }

    if (errors.Lg_Id) {
      setErrors((prev) => ({ ...prev, Lg_Id: "" }));
    }

    // Focus on vendor button after ledger selection
    setTimeout(() => {
      if (vendorButtonRef.current && !vendorButtonRef.current.disabled) {
        vendorButtonRef.current.focus();
      } else {
        setTimeout(() => {
          if (vendorButtonRef.current && !vendorButtonRef.current.disabled) {
            vendorButtonRef.current.focus();
          }
        }, 300);
      }
    }, 200);
  };

  const getSelectedLedgerDisplay = () => {
    // If we have a ledger selected, show it
    if (formData.Lg_Id) {
      // Try to find the ledger in filteredLedgersByBranch first
      let selectedLedger = null;

      if (filteredLedgersByBranch.length > 0) {
        selectedLedger = filteredLedgersByBranch.find(
          (ledger) => ledger.Lg_Id == parseInt(formData.Lg_Id),
        );
      }

      // If not found in filteredLedgersByBranch, try filteredLedgers
      if (!selectedLedger && filteredLedgers.length > 0) {
        selectedLedger = filteredLedgers.find(
          (ledger) => ledger.Lg_Id == parseInt(formData.Lg_Id),
        );
      }

      if (selectedLedger) {
        return `${selectedLedger.Lg_Code} - ${selectedLedger.Lg_Name} (${selectedLedger.Lg_Eng_Name || ""})`;
      }

      // If still not found, try to get from branchLedgerMapping directly
      if (formData.Dpt_Id) {
        const branchData = branchLedgerMapping.find(
          (item) => item.department.Dpt_id == parseInt(formData.Dpt_Id),
        );
        if (branchData && branchData.ledgers) {
          const ledgerFromMapping = branchData.ledgers.find(
            (l) => l.Lg_Id == parseInt(formData.Lg_Id),
          );
          if (ledgerFromMapping) {
            return `${ledgerFromMapping.Lg_Code} - ${ledgerFromMapping.Lg_Name} (${ledgerFromMapping.Lg_Eng_Name || ""})`;
          }
        }
      }

      // Last resort - return just the ID
      return `Ledger ID: ${formData.Lg_Id}`;
    }

    // No ledger selected - show appropriate message
    if (!formData.Dpt_Id) {
      return "Select a Branch first";
    }
    if (loadingBranchLedgers) {
      return "Loading branch ledgers...";
    }
    if (filteredLedgersByBranch.length == 0) {
      return "No ledgers available for this branch";
    }
    return "Select a Ledger";
  };

  // Vendor keyboard handlers
  const handleVendorKeyDown = (e) => {
    if (!formData.Dpt_Id || !formData.Lg_Id) {
      toast.error("Please select Branch and Ledger first");
      return;
    }
    if (filteredVendors.length == 0) {
      toast.error("No vendors available");
      return;
    }

    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsVendorDropdownOpen(true);
      setVendorSearchTerm("");
      setVendorHighlightedIndex(-1);
      setTimeout(() => vendorSearchRef.current?.focus(), 0);
    }
  };

  const handleVendorSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const filtered = getFilteredVendorsForDisplay();
      if (filtered.length > 0) {
        setVendorHighlightedIndex(0);
        setTimeout(() => {
          if (vendorItemRefs.current[0]) {
            vendorItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      // Stay in search
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsVendorDropdownOpen(false);
      setVendorHighlightedIndex(-1);
      setVendorSearchTerm("");
      vendorButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      const filtered = getFilteredVendorsForDisplay();
      if (filtered.length > 0 && vendorHighlightedIndex >= 0) {
        handleVendorSelect(filtered[vendorHighlightedIndex].SL_Id.toString());
      } else if (filtered.length > 0) {
        handleVendorSelect(filtered[0].SL_Id.toString());
      }
    }
  };

  const handleVendorItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const filtered = getFilteredVendorsForDisplay();
      const nextIndex = idx + 1;
      if (nextIndex < filtered.length) {
        setVendorHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (vendorItemRefs.current[nextIndex]) {
            vendorItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setVendorHighlightedIndex(-1);
        setTimeout(() => vendorSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setVendorHighlightedIndex(-1);
        setTimeout(() => vendorSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setVendorHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (vendorItemRefs.current[prevIndex]) {
            vendorItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleVendorSelect(item.SL_Id.toString());
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsVendorDropdownOpen(false);
      setVendorHighlightedIndex(-1);
      setVendorSearchTerm("");
      vendorButtonRef.current?.focus();
    }
  };

  const handleVendorSearchChange = (e) => {
    const value = e.target.value;
    setVendorSearchTerm(value);
    setVendorHighlightedIndex(-1);
  };

  const getFilteredVendorsForDisplay = () => {
    if (!filteredVendors.length) return [];
    if (!vendorSearchTerm.trim()) return filteredVendors;

    return filteredVendors.filter(
      (vendor) =>
        vendor.SL_Name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        vendor.SL_Code.toLowerCase().includes(vendorSearchTerm.toLowerCase()),
    );
  };

  const handleVendorSelect = (vendorId) => {
    setFormData((prev) => ({
      ...prev,
      SL_Id: vendorId,
      WA_Id: "",
      Gross_Amt: "",
    }));
    setIsVendorDropdownOpen(false);
    setVendorSearchTerm("");
    setVendorHighlightedIndex(-1);

    const vendorIdNum = parseInt(vendorId);
    const vendorAllocations = filteredTenderAllocations.filter(
      (allocation) => allocation.vendor_id == vendorIdNum,
    );
    setSelectedVendorTenders(vendorAllocations);
    setSelectedTenderDetails(null);
    setTaxParameters([]);
    setPenalties([]);
    resetTaxCalculation();

    if (errors.SL_Id) {
      setErrors((prev) => ({ ...prev, SL_Id: "" }));
    }

    // Focus on tender button after vendor selection
    setTimeout(() => tenderButtonRef.current?.focus(), 100);
  };

  const getSelectedVendorDisplay = () => {
    if (!formData.SL_Id) {
      if (!formData.Dpt_Id || !formData.Lg_Id) {
        return "Select Branch and Ledger first";
      }
      if (loadingTenderEntries) {
        return "Loading vendors...";
      }
      if (filteredVendors.length == 0) {
        return "No vendors available";
      }
      return "Select a Vendor";
    }

    const selectedVendor = filteredVendors.find(
      (v) => v.SL_Id == parseInt(formData.SL_Id),
    );
    return selectedVendor ? `${selectedVendor.SL_Name}` : "Select a Vendor";
  };

  // Tender keyboard handlers
  const handleTenderKeyDown = (e) => {
    if (!formData.SL_Id) {
      toast.error("Please select a vendor first");
      return;
    }
    if (selectedVendorTenders.length == 0) {
      toast.error("No tender allocations available");
      return;
    }

    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsTenderDropdownOpen(true);
      setTenderSearchTerm("");
      setTenderHighlightedIndex(-1);
      setTimeout(() => tenderSearchRef.current?.focus(), 0);
    }
  };

  const handleTenderSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const filtered = getFilteredTendersForDisplay();
      if (filtered.length > 0) {
        setTenderHighlightedIndex(0);
        setTimeout(() => {
          if (tenderItemRefs.current[0]) {
            tenderItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      // Stay in search
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderDropdownOpen(false);
      setTenderHighlightedIndex(-1);
      setTenderSearchTerm("");
      tenderButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      const filtered = getFilteredTendersForDisplay();
      if (filtered.length > 0 && tenderHighlightedIndex >= 0) {
        handleTenderSelect(
          filtered[tenderHighlightedIndex].tender_allocation_id,
        );
      } else if (filtered.length > 0) {
        handleTenderSelect(filtered[0].tender_allocation_id);
      }
    }
  };

  const handleTenderItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const filtered = getFilteredTendersForDisplay();
      const nextIndex = idx + 1;
      if (nextIndex < filtered.length) {
        setTenderHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (tenderItemRefs.current[nextIndex]) {
            tenderItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setTenderHighlightedIndex(-1);
        setTimeout(() => tenderSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setTenderHighlightedIndex(-1);
        setTimeout(() => tenderSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setTenderHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (tenderItemRefs.current[prevIndex]) {
            tenderItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleTenderSelect(item.tender_allocation_id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderDropdownOpen(false);
      setTenderHighlightedIndex(-1);
      setTenderSearchTerm("");
      tenderButtonRef.current?.focus();
    }
  };

  const handleTenderSearchChange = (e) => {
    const value = e.target.value;
    setTenderSearchTerm(value);
    setTenderHighlightedIndex(-1);
  };

  const getFilteredTendersForDisplay = () => {
    if (!selectedVendorTenders.length) return [];
    if (!tenderSearchTerm.trim()) return selectedVendorTenders;

    return selectedVendorTenders.filter(
      (tender) =>
        (tender.description &&
          tender.description
            .toLowerCase()
            .includes(tenderSearchTerm.toLowerCase())) ||
        tender.gross_amount.toString().includes(tenderSearchTerm),
    );
  };

  const handleTenderSelect = (tenderAllocationId) => {
    setFormData((prev) => ({
      ...prev,
      WA_Id: tenderAllocationId.toString(),
    }));
    setIsTenderDropdownOpen(false);
    setTenderSearchTerm("");
    setTenderHighlightedIndex(-1);

    const tender = selectedVendorTenders.find(
      (t) => t.tender_allocation_id == parseInt(tenderAllocationId),
    );
    setSelectedTenderDetails(tender || null);

    if (tender) {
      if (tender.vendor_invoice_parameters?.length > 0) {
        const params = tender.vendor_invoice_parameters;
        setTaxParameters(params);
        // IMPORTANT: Calculate taxes immediately when tender is selected
        if (formData.Gross_Amt && parseFloat(formData.Gross_Amt) > 0) {
          calculateTaxes(parseFloat(formData.Gross_Amt), params, manualTaxAmounts);
        }
      }
      if (formData.SL_Id && tenderAllocationId) {
        // Pass the current PV_No for edit mode, 'empty' for add mode
        const billNo = isEditMode ? formData.PV_No : "empty";
        fetchPenalties(
          parseInt(tenderAllocationId),
          parseInt(formData.SL_Id),
          billNo,
        );
      }
    } else {
      setTaxParameters([]);
      setPenalties([]);
      resetTaxCalculation();
    }

    if (errors.WA_Id) {
      setErrors((prev) => ({ ...prev, WA_Id: "" }));
    }

    // Focus on gross amount after tender selection
    setTimeout(() => grossAmountRef.current?.focus(), 100);
  };

  const getSelectedTenderDisplay = () => {
    if (!formData.SL_Id) {
      return "Select Vendor first";
    }
    if (!formData.WA_Id || !selectedTenderDetails) {
      if (loadingPenalties) {
        return "Loading...";
      }
      if (selectedVendorTenders.length == 0) {
        return "No tender allocations available";
      }
      return "Select Tender Allocation";
    }

    return selectedTenderDetails.description || "Tender Work";
  };

  const checkBankVerificationStatus = (vendorId) => {
    return {
      isVerified: true,
      vendorName: "",
      vendorId: vendorId,
    };
  };

  // General Enter key navigation
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData };

    if (name == "Dpt_Id") {
      // This is now handled by handleBranchSelect
      return;
    } else if (name == "Gross_Amt") {
      updatedFormData[name] = value;

      const billAmount = parseFloat(value) || 0;

      if (selectedTenderDetails) {
        const tenderAmount = parseFloat(selectedTenderDetails.gross_amount);
        if (billAmount > tenderAmount) {
          setErrors((prev) => ({
            ...prev,
            Gross_Amt: `Bill amount exceeds tender allocation amount (₹${tenderAmount.toLocaleString("en-IN")})`,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            Gross_Amt: "",
          }));
        }
      }

      if (taxParameters.length > 0 || penalties.length > 0) {
        calculateTaxes(billAmount, taxParameters, manualTaxAmounts);
      } else {
        resetTaxCalculation();
      }
    } else if (name == "Remarks") {
      updatedFormData[name] = value;
    } else if (name == "PV_Chln_Date") {
      updatedFormData[name] = value;
    } else {
      updatedFormData[name] = value;
    }

    setFormData(updatedFormData);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const loadTaxParameters = (tender) => {
    if (tender?.vendor_invoice_parameters?.length > 0) {
      const params = tender.vendor_invoice_parameters;
      setTaxParameters(params);
      if (formData.Gross_Amt && parseFloat(formData.Gross_Amt) > 0) {
        calculateTaxes(parseFloat(formData.Gross_Amt), params, manualTaxAmounts);
      }
    } else {
      setTaxParameters([]);
      resetTaxCalculation();
    }
  };

  const resetTaxCalculation = () => {
    setCalculatedTaxes({
      grossAmount: 0,
      netAmount: 0,
      taxBreakdown: [],
      totalTax: 0,
      calculationSteps: [],
      penalties: [],
    });
  };

  const handleManualTaxAmountChange = (vipId, value) => {
    const updatedManualAmounts = {
      ...manualTaxAmounts,
      [vipId]: parseFloat(value) || 0,
    };
    setManualTaxAmounts(updatedManualAmounts);

    // Recalculate taxes with the updated manual amount
    if (formData.Gross_Amt && parseFloat(formData.Gross_Amt) > 0) {
      calculateTaxes(
        parseFloat(formData.Gross_Amt),
        taxParameters,
        updatedManualAmounts,
      );
    }
  };

  const evalExpression = (expression) => {
    const cleanExpr = expression.replace(/[^0-9+\-*/().%\s]/g, "");

    try {
      if (window.math && window.math.evaluate) {
        return window.math.evaluate(cleanExpr);
      }
      return eval(cleanExpr);
    } catch (error) {
      throw new Error(`Failed to evaluate expression: ${error.message}`);
    }
  };

  const isManualFormula = (formula) => {
    // return String(formula || "").trim() == "*";
    return true;
  };

  const calculateTaxes = (billAmount, taxParams, manualOverrides = {}) => {
    const taxBreakdown = [];
    const penaltyBreakdown = [];
    const calculationSteps = [];
    let totalAdd = 0;
    let totalLess = 0;
    let runningAmount = billAmount;
    let netAmount = billAmount;
    const calculatedTaxAmounts = { GROS: billAmount };

    const formatAmount = (amount) => parseFloat(amount).toFixed(2);
    const roundHalfUp = (num) => Math.round(num * 100) / 100;

    calculationSteps.push(
      `Starting Bill Amount (Gross_Amt): ₹${formatAmount(billAmount)}`,
    );
    calculationSteps.push(
      `Initial Variables: GROS = ₹${formatAmount(billAmount)}`,
    );

    if (taxParams && taxParams.length > 0) {
      taxParams.forEach((param, index) => {
        const stepNum = index + 1;
        let taxAmount = 0;
        const taxPercentage = parseFloat(param.percentage) || 0;
        const taxType = param.invoice_charge_code || "";

        const isAdd = param.type == "1" || param.type_text == "Add";
        const formula = String(param.formula || "").toUpperCase();

        calculationSteps.push(
          `\nStep ${stepNum}: ${taxType} (${taxPercentage}%)`,
        );
        calculationSteps.push(` Action: ${isAdd ? "ADD" : "DEDUCT"}`);

        // Check if this is a manual formula
        if (isManualFormula(formula)) {
          const vipId = param.VIP_Id;
          if (manualOverrides[vipId] != undefined) {
            taxAmount = parseFloat(manualOverrides[vipId]) || 0;
            calculationSteps.push(` Manual Entry: ₹${formatAmount(taxAmount)}`);
          } else {
            taxAmount = 0;
            calculationSteps.push(` Manual Entry (not set): ₹0.00`);
          }
        } else {
          // Existing formula calculation logic
          const variables = {
            GROS: billAmount,
            ...calculatedTaxAmounts,
          };

          if (formula) {
            try {
              let expression = formula;

              expression = expression.replace(
                /\b([A-Z]{2,})\b/g,
                (match, varName) => {
                  if (varName == "GROS") {
                    return billAmount.toString();
                  }
                  const value = variables[varName];
                  if (value != undefined && value != null) {
                    return value.toString();
                  }
                  return match;
                },
              );

              const originalVars = formula.match(/\b([A-Z]{2,})\b/g) || [];
              const unresolvedVars = originalVars.filter(
                (v) => !(v in variables) && v != "GROS",
              );
              if (unresolvedVars.length > 0 && taxPercentage > 0) {
                unresolvedVars.forEach((varName) => {
                  const regex = new RegExp(`\\b${varName}\\b`, "g");
                  expression = expression.replace(
                    regex,
                    taxPercentage.toString(),
                  );
                });
                calculationSteps.push(
                  ` Self-referenced vars (${unresolvedVars.join(", ")}) → ${taxPercentage}`,
                );
              }

              // Clean up expression
              expression = expression
                .replace(/undefined/g, "0")
                .replace(/null/g, "0")
                .replace(/[^0-9+\-*/().% ]/g, "");

              calculationSteps.push(` Formula: ${formula}`);
              calculationSteps.push(
                ` Expression after substitution: ${expression}`,
              );

              // Evaluate the expression
              let evaluatedResult;
              try {
                evaluatedResult = new Function(
                  '"use strict"; return (' + expression + ")",
                )();
              } catch {
                evaluatedResult = eval(expression);
              }

              taxAmount = parseFloat(evaluatedResult) || 0;
              calculationSteps.push(
                ` Calculated (raw): ₹${formatAmount(taxAmount)}`,
              );
            } catch (error) {
              console.error(`Error calculating tax for ${taxType}:`, error);
              taxAmount = (billAmount * taxPercentage) / 100;
              calculationSteps.push(
                ` ERROR in formula → fallback: ₹${formatAmount(taxAmount)}`,
              );
            }
          } else {
            taxAmount = (billAmount * taxPercentage) / 100;
            calculationSteps.push(
              ` Simple calculation: ${formatAmount(billAmount)} × ${taxPercentage}% / 100 = ₹${formatAmount(taxAmount)}`,
            );
          }
        }

        taxAmount = roundHalfUp(taxAmount);
        calculatedTaxAmounts[taxType] = taxAmount;

        calculationSteps.push(` After rounding: ₹${formatAmount(taxAmount)}`);

        if (isAdd) {
          runningAmount += taxAmount;
          totalAdd += taxAmount;
          calculationSteps.push(` ADD (+₹${formatAmount(taxAmount)})`);
        } else {
          runningAmount -= taxAmount;
          totalLess += taxAmount;
          calculationSteps.push(` DEDUCT (-₹${formatAmount(taxAmount)})`);
        }

        runningAmount = roundHalfUp(runningAmount);
        calculationSteps.push(
          ` Running Amount: ₹${formatAmount(runningAmount)}`,
        );

        taxBreakdown.push({
          ...param,
          calculatedAmount: taxAmount,
          displayText: isManualFormula(formula) ? taxType : `${taxType} (${taxPercentage}%)`,
          isAdd: isAdd,
          isTax: true,
          type: "tax",
          VIP_Id: param.VIP_Id,
          IC_Id: param.invoice_charge_id || param.IC_Id,
          Lg_Id: param.ledger_id || param.Lg_Id,
          TnT_ID: selectedTenderDetails?.tender_work_details?.TnT_ID,
          percentage: taxPercentage,
          formula: formula,
        });
      });
    }

    if (penalties.length > 0) {
      calculationSteps.push(`\n==  Penalties Calculation ===`);
      penalties.forEach((penalty, index) => {
        let penaltyAmount = parseFloat(penalty.p_amount) || 0;
        const isDeduct = penalty.Add_Deduct?.toLowerCase() == "deduct";

        penaltyAmount = roundHalfUp(penaltyAmount);

        calculationSteps.push(
          `Penalty ${index + 1}: ${penalty.fix_per == "Fixed" ? "Fixed Amount" : `${penalty.percentage}%`} → ₹${formatAmount(penaltyAmount)}`,
        );
        calculationSteps.push(` Action: ${isDeduct ? "DEDUCT" : "ADD"}`);

        if (isDeduct) {
          runningAmount -= penaltyAmount;
          totalLess += penaltyAmount;
          calculationSteps.push(` DEDUCT (-₹${formatAmount(penaltyAmount)})`);
        } else {
          runningAmount += penaltyAmount;
          totalAdd += penaltyAmount;
          calculationSteps.push(` ADD (+₹${formatAmount(penaltyAmount)})`);
        }

        runningAmount = roundHalfUp(runningAmount);
        calculationSteps.push(
          ` Running Amount: ₹${formatAmount(runningAmount)}`,
        );

        penaltyBreakdown.push({
          ...penalty,
          calculatedAmount: penaltyAmount,
          displayText: `Penalty: ${penalty.fix_per == "Fixed" ? "Fixed Amount" : `${penalty.percentage}%`}`,
          isAdd: !isDeduct,
          isPenalty: true,
          type: "penalty",
          tp_id: penalty.tp_id,
          PD_Ty: "PENLTY",
          VIP_Id: penalty.tp_id,
          percentage: penalty.percentage || 0,
        });
      });
    }

    totalAdd = roundHalfUp(totalAdd);
    totalLess = roundHalfUp(totalLess);
    netAmount = roundHalfUp(runningAmount);

    calculationSteps.push(`\n**Final Results:**`);
    calculationSteps.push(`Basic Amount: ₹${formatAmount(billAmount)}`);
    calculationSteps.push(`Total Additions: +₹${formatAmount(totalAdd)}`);
    calculationSteps.push(`Total Deductions: -₹${formatAmount(totalLess)}`);
    calculationSteps.push(`Net Payable Amount: ₹${formatAmount(netAmount)}`);

    const combinedBreakdown = [...taxBreakdown, ...penaltyBreakdown];

    // Log for debugging
    console.log("calculationSteps", calculationSteps);

    setCalculatedTaxes({
      grossAmount: parseFloat(billAmount.toFixed(2)),
      netAmount,
      taxBreakdown: combinedBreakdown,
      totalAdd,
      totalLess,
      totalTax: parseFloat((totalAdd - totalLess).toFixed(2)),
      calculationSteps,
      penalties: penaltyBreakdown,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.PV_Chln_Date)
      newErrors.PV_Chln_Date = "Bill/Challan date is required";
    if (!formData.Dpt_Id) newErrors.Dpt_Id = "Branch is required";
    if (!formData.Lg_Id) newErrors.Lg_Id = "Ledger account is required";
    if (!formData.SL_Id) newErrors.SL_Id = "Vendor is required";
    if (!formData.Gross_Amt || parseFloat(formData.Gross_Amt) <= 0) {
      newErrors.Gross_Amt = "Valid basic amount is required";
    }

    if (selectedTenderDetails && formData.Gross_Amt) {
      const billAmount = parseFloat(formData.Gross_Amt);
      const tenderAmount = parseFloat(selectedTenderDetails.gross_amount);

      if (billAmount > tenderAmount) {
        newErrors.Gross_Amt = `Basic amount exceeds tender allocation amount (₹${tenderAmount.toLocaleString("en-IN")})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const prepareCreateData = () => {
    return {
      PV_Ty: "VEND",
      PV_No: formData.PV_No || null,
      PV_Chln_Date: formData.PV_Chln_Date,
      Dpt_Id: parseInt(formData.Dpt_Id),
      Lg_Id: parseInt(formData.Lg_Id),
      SL_Id: parseInt(formData.SL_Id),
      WA_Id: formData.WA_Id ? parseInt(formData.WA_Id) : null,
      Gross_Amt: formatAmountForAPI(parseFloat(formData.Gross_Amt || 0)),
      Add_Amt: formatAmountForAPI(parseFloat(formData.Add_Amt || 0)),
      Less_Amt: formatAmountForAPI(parseFloat(formData.Less_Amt || 0)),
      Net_Amt: formatAmountForAPI(parseFloat(formData.Net_Amt || 0)),
      Status: formData.Status || "draft",
      Remarks: formData.Remarks || null,
      pay_details: formData.pay_details || [],
    };
  };

  const prepareUpdateData = () => {
    const data = {};

    if (formData.PV_Ty != undefined) data.PV_Ty = formData.PV_Ty;
    if (formData.PV_No != undefined) data.PV_No = formData.PV_No || null;
    if (formData.PV_Chln_Date != undefined)
      data.PV_Chln_Date = formData.PV_Chln_Date;
    if (formData.Dpt_Id != undefined) data.Dpt_Id = parseInt(formData.Dpt_Id);
    if (formData.Lg_Id != undefined) data.Lg_Id = parseInt(formData.Lg_Id);
    if (formData.SL_Id != undefined) data.SL_Id = parseInt(formData.SL_Id);
    if (formData.WA_Id != undefined)
      data.WA_Id = formData.WA_Id ? parseInt(formData.WA_Id) : null;
    if (formData.Gross_Amt != undefined)
      data.Gross_Amt = formatAmountForAPI(parseFloat(formData.Gross_Amt || 0));
    if (formData.Add_Amt != undefined)
      data.Add_Amt = formatAmountForAPI(parseFloat(formData.Add_Amt || 0));
    if (formData.Less_Amt != undefined)
      data.Less_Amt = formatAmountForAPI(parseFloat(formData.Less_Amt || 0));
    if (formData.Net_Amt != undefined)
      data.Net_Amt = formatAmountForAPI(parseFloat(formData.Net_Amt || 0));
    if (formData.Status != undefined) data.Status = formData.Status;
    if (formData.Remarks != undefined) data.Remarks = formData.Remarks;
    if (formData.pay_details != undefined)
      data.pay_details = formData.pay_details;

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure latest calculations are in formData
    if (
      (taxParameters.length > 0 || penalties.length > 0) &&
      formData.Gross_Amt &&
      parseFloat(formData.Gross_Amt) > 0
    ) {
      calculateTaxes(parseFloat(formData.Gross_Amt), taxParameters, manualTaxAmounts);
      // Small delay to ensure state updates
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Payment Voucher?" : "Create Payment Voucher?",
      text: isEditMode
        ? "Are you sure you want to update this payment voucher?"
        : "Are you sure you want to create this payment voucher?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#EF5350",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      // Get the latest form data
      const currentFormData = { ...formData };

      // Log the data being sent
      console.log("📤 Sending to backend:", {
        PV_No: currentFormData.PV_No,
        Gross_Amt: currentFormData.Gross_Amt,
        Add_Amt: currentFormData.Add_Amt,
        Less_Amt: currentFormData.Less_Amt,
        Net_Amt: currentFormData.Net_Amt,
        pay_details_count: currentFormData.pay_details?.length,
        pay_details: currentFormData.pay_details,
      });

      const voucherData = isEditMode
        ? prepareUpdateData()
        : prepareCreateData();

      let response;
      if (isEditMode) {
        response = await BillChallanEntryApi.update(id, voucherData);
        toast.success("Payment voucher updated successfully!");
      } else {
        response = await BillChallanEntryApi.create(voucherData);
        toast.success("Payment voucher created successfully!");
      }

      // Handle penalty updates - only for unassigned penalties in create mode
      if (!isEditMode) {
        const unassignedPenalties = penalties.filter((p) => !p.Bill_No);
        if (unassignedPenalties.length > 0 && response.data?.PV_No) {
          try {
            const updatePromises = unassignedPenalties.map((penalty) =>
              BillChallanEntryApi.updatePenalty(penalty.tp_id, {
                Bill_No: response.data.PV_No,
              }),
            );
            await Promise.all(updatePromises);
            toast.success(
              `${unassignedPenalties.length} penalty(ies) assigned to voucher`,
            );
          } catch (penaltyError) {
            console.error("Error updating penalties:", penaltyError);
            toast.error("Failed to update penalties, but voucher was saved");
          }
        }
      }

      setTimeout(() => {
        navigate("/transactions/vendor-payments/bill-challan-entry");
      }, 1500);
    } catch (error) {
      console.error("Error saving payment voucher:", error);
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const errorMessages = Object.values(backendErrors).flat();
        errorMessages.forEach((msg) => toast.error(msg));
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Failed to save payment voucher");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/vendor-payments/bill-challan-entry");
  };

  const handleCloseBankVerificationWarning = () => {
    setBankVerificationCheck((prev) => ({ ...prev, showWarning: false }));
  };

  const handleGoToBankVerification = () => {
    // Navigate to bank verification page
    setBankVerificationCheck((prev) => ({ ...prev, showWarning: false }));
    // navigate(`/masters/financial-accounting/vendor-bank-verification/${bankVerificationCheck.vendorId}`);
  };

  const handleContinueWithoutVerification = () => {
    setBankVerificationCheck((prev) => ({ ...prev, showWarning: false }));
  };

  const getBranchName = () => {
    const branch = branches.find((b) => b.id == parseInt(formData.Dpt_Id));
    return branch ? `${branch.desc}` : "";
  };

  const getLedgerName = () => {
    const sourceLedgers =
      filteredLedgersByBranch.length > 0 ? filteredLedgersByBranch : [];

    const ledger = sourceLedgers.find(
      (l) => l.Lg_Id == parseInt(formData.Lg_Id),
    );
    return ledger ? `${ledger.Lg_Name} (${ledger.Lg_Code})` : "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment voucher data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Bank Verification Warning Modal */}
      {bankVerificationCheck.showWarning && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Bank Verification Required
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Vendor bank details are not verified
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseBankVerificationWarning}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        <span className="font-bold">
                          {bankVerificationCheck.vendorName}
                        </span>
                        's bank details are not verified.
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        Unverified bank details may lead to payment processing
                        issues.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Info className="h-4 w-4 text-yellow-600 mr-3 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      It is recommended to verify bank details before proceeding
                      with payment voucher.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleGoToBankVerification}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium flex items-center justify-center transition-all shadow-sm hover:shadow"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Bank Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>

                <button
                  onClick={handleContinueWithoutVerification}
                  className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center transition-all"
                >
                  Continue Anyway
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Note: You can verify bank details anytime from Vendor
                Verification section
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <button
            onClick={() =>
              navigate("/transactions/vendor-payments/bill-challan-entry")
            }
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit Payment Voucher" : "Create Payment Voucher"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update payment voucher details"
                : "Convert bill/challan to payment voucher with dynamic tax calculation"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form Inputs */}
          <div className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Payment Details
                    </h2>
                    <p className="text-sm text-gray-600">
                      Enter bill/challan information
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      <Calendar className="inline h-4 w-4 mr-1 text-gray-500" />
                      Bill Date: *
                    </label>
                    <input
                      ref={dateInputRef}
                      type="date"
                      name="PV_Chln_Date"
                      value={formData.PV_Chln_Date}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, branchButtonRef)}
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        errors.PV_Chln_Date
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                  </div>
                </div>
                {errors.PV_Chln_Date && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.PV_Chln_Date}
                  </p>
                )}
              </div>

              <div className="p-6 space-y-4">
                {/* Voucher Number Display */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Hash className="inline h-4 w-4 mr-1 text-gray-500" />
                    Voucher Number {!isEditMode && "(Auto-generated)"}
                  </label>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-gray-900">
                        {formData.PV_No ||
                          (() => {
                            if (genVoucherConfig && genVoucherConfig.Is_Active == "Y") {
                              const c = genVoucherConfig;
                              const segs = [];
                              if (c.prifix)           segs.push({ v: c.prifix,  sep: c.prifix_dev_type || c.dev_type || "/" });
                              if (c.Dept == "Y")      segs.push({ v: "DEPT",    sep: c.dept_dev_type   || c.dev_type || "/" });
                              if (c.Text)             segs.push({ v: c.Text,    sep: c.text_dev_type   || c.dev_type || "/" });
                              segs.push(               { v: "---",              sep: c.no_dev_type     || c.dev_type || "/" });
                              if (c.FY == "Y")        segs.push({ v: currentFinancialYear?.FY_Code || "2025-26", sep: null });
                              return segs.map((s, i) => (i < segs.length - 1 ? s.v + s.sep : s.v)).join("");
                            }
                            return `${organisationSettings?.Org_Code || "ORG"}/---/---/${currentFinancialYear?.FY_Code || "2025-26"}`;
                          })()}
                      </span>
                      {formData.PV_No && !isEditMode && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Auto-generated
                        </span>
                      )}
                    </div>
                  </div>
                  {!isEditMode && !formData.PV_No && (
                    <p className="mt-2 text-sm text-gray-500">
                      {genVoucherConfig && genVoucherConfig.Is_Active == "Y"
                        ? (() => {
                            const c = genVoucherConfig;
                            const segs = [];
                            if (c.prifix)      segs.push({ v: c.prifix,                                          sep: c.prifix_dev_type || c.dev_type || "/" });
                            if (c.Dept == "Y") segs.push({ v: "Branch",                                          sep: c.dept_dev_type   || c.dev_type || "/" });
                            if (c.Text)        segs.push({ v: c.Text,                                            sep: c.text_dev_type   || c.dev_type || "/" });
                            segs.push(          { v: c.No == "Dept_Series" ? "Serial(Dept)" : "Serial(AMT)",     sep: c.no_dev_type     || c.dev_type || "/" });
                            if (c.FY == "Y")   segs.push({ v: currentFinancialYear?.FY_Code || "2025-26",        sep: null });
                            return `Format: ${segs.map((s, i) => (i < segs.length - 1 ? s.v + s.sep : s.v)).join("")}`;
                          })()
                        : `Format: ${organisationSettings?.Org_Code}/Branch/LedgerCode/${currentFinancialYear?.FY_Code}`}
                    </p>
                  )}
                </div>

                {/* Branch and Ledger */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Branch Dropdown with Search */}
                  <div ref={branchDropdownRef}>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      <Building className="inline h-4 w-4 mr-1 text-gray-500" />
                      Branch *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                      <button
                        ref={branchButtonRef}
                        type="button"
                        onClick={() =>
                          setIsBranchDropdownOpen(!isBranchDropdownOpen)
                        }
                        onKeyDown={handleBranchKeyDown}
                        className={`w-full pl-10 pr-10 py-3 border ${
                          errors.Dpt_Id
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left bg-white flex justify-between items-center`}
                      >
                        <span
                          className={
                            formData.Dpt_Id ? "text-gray-900" : "text-gray-500"
                          }
                        >
                          {getSelectedBranchDisplay()}
                        </span>
                        <span className="text-gray-400">
                          {isBranchDropdownOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      </button>
                      {errors.Dpt_Id && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}

                      {/* Branch Dropdown Menu */}
                      {isBranchDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                          <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                ref={branchSearchRef}
                                type="text"
                                value={branchSearchTerm}
                                onChange={handleBranchSearchChange}
                                onKeyDown={handleBranchSearchKeyDown}
                                placeholder="Search by branch name or code..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              />
                              {branchSearchTerm && (
                                <button
                                  type="button"
                                  onClick={() => setBranchSearchTerm("")}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div
                            ref={branchListRef}
                            className="overflow-y-auto max-h-64"
                          >
                            {getFilteredBranchesForDisplay().length > 0 ? (
                              getFilteredBranchesForDisplay().map(
                                (branch, idx) => (
                                  <button
                                    key={branch.id}
                                    ref={(el) => {
                                      branchItemRefs.current[idx] = el;
                                    }}
                                    type="button"
                                    onClick={() =>
                                      handleBranchSelect(branch.id)
                                    }
                                    onKeyDown={(e) =>
                                      handleBranchItemKeyDown(e, branch, idx)
                                    }
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                      branchHighlightedIndex == idx
                                        ? "bg-blue-100"
                                        : formData.Dpt_Id ==
                                            branch.id.toString()
                                          ? "bg-blue-50 text-blue-600"
                                          : "text-gray-700"
                                    }`}
                                    tabIndex={0}
                                  >
                                    <div className="font-medium">
                                      {branch.desc}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {branch.name}
                                    </div>
                                    {formData.Dpt_Id ==
                                      branch.id.toString() && (
                                      <div className="text-xs text-blue-600 mt-1 flex items-center">
                                        <Check className="h-3 w-3 mr-1" />
                                        Selected
                                      </div>
                                    )}
                                  </button>
                                ),
                              )
                            ) : (
                              <div className="px-4 py-8 text-center text-gray-500">
                                <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                <p>No branches found</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.Dpt_Id && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Dpt_Id}
                      </p>
                    )}
                  </div>

                  {/* LEDGER DROPDOWN WITH SEARCH - UPDATED */}
                  <div ref={ledgerDropdownRef}>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      <CreditCard className="inline h-4 w-4 mr-1 text-gray-500" />
                      Ledger Account *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                      {loadingBranchLedgers ? (
                        <div className="flex items-center pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                          <Loader2 className="animate-spin h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-gray-500">
                            Loading branch ledgers...
                          </span>
                        </div>
                      ) : (
                        <>
                          <button
                            ref={ledgerButtonRef}
                            type="button"
                            onClick={() => {
                              // Rule 1: Branch must be selected first
                              if (!formData.Dpt_Id) {
                                toast.error("Please select a branch first");
                                return;
                              }
                              // REMOVED THE RESTRICTION - Allow ledger selection in edit mode
                              // Just show a warning but still allow
                              if (
                                isEditMode &&
                                formData.Lg_Id &&
                                formData.Dpt_Id == originalBranchId
                              ) {
                                toast.info(
                                  "Changing ledger will reset vendor and tender selections",
                                );
                              }
                              // Open the dropdown
                              setIsLedgerDropdownOpen(!isLedgerDropdownOpen);
                            }}
                            onKeyDown={handleLedgerKeyDown}
                            disabled={!formData.Dpt_Id} // Only disable if no branch selected
                            className={`w-full pl-10 pr-10 py-3 border ${
                              errors.Lg_Id
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left ${
                              !formData.Dpt_Id
                                ? "bg-gray-100 cursor-not-allowed"
                                : "bg-white"
                            } flex justify-between items-center`}
                          >
                            <span
                              className={
                                formData.Lg_Id
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }
                            >
                              {getSelectedLedgerDisplay()}
                            </span>
                            <span className="text-gray-400">
                              {isLedgerDropdownOpen ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          </button>
                          {errors.Lg_Id && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </>
                      )}

                      {/* Dropdown Menu */}
                      {isLedgerDropdownOpen &&
                        !loadingBranchLedgers &&
                        formData.Dpt_Id && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                            <div className="p-3 border-b border-gray-200">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  ref={ledgerSearchRef}
                                  type="text"
                                  value={ledgerSearchTerm}
                                  onChange={handleLedgerSearchChange}
                                  onKeyDown={handleLedgerSearchKeyDown}
                                  placeholder="Search by ledger code or name..."
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                {ledgerSearchTerm && (
                                  <button
                                    type="button"
                                    onClick={() => setLedgerSearchTerm("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div
                              ref={ledgerListRef}
                              className="overflow-y-auto max-h-64"
                            >
                              {filteredLedgers.length > 0 ? (
                                filteredLedgers.map((ledger, idx) => (
                                  <button
                                    key={ledger.Lg_Id}
                                    ref={(el) => {
                                      ledgerItemRefs.current[idx] = el;
                                    }}
                                    type="button"
                                    onClick={() =>
                                      handleLedgerSelect(ledger.Lg_Id)
                                    }
                                    onKeyDown={(e) =>
                                      handleLedgerItemKeyDown(e, ledger, idx)
                                    }
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                      ledgerHighlightedIndex == idx
                                        ? "bg-blue-100"
                                        : formData.Lg_Id ==
                                            ledger.Lg_Id.toString()
                                          ? "bg-blue-50 text-blue-600"
                                          : "text-gray-700"
                                    }`}
                                    tabIndex={0}
                                  >
                                    <div className="font-medium">
                                      {ledger.Lg_Code} - {ledger.Lg_Name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {ledger.Lg_Eng_Name || ""}
                                    </div>
                                    {formData.Lg_Id ==
                                      ledger.Lg_Id.toString() && (
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
                                  <p>No ledgers found</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                    {errors.Lg_Id && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.Lg_Id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vendor and Tender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* VENDOR DROPDOWN WITH SEARCH */}
                  <div ref={vendorDropdownRef}>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      <Users className="inline h-4 w-4 mr-1 text-gray-500" />
                      Vendor *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                      {loadingTenderEntries ? (
                        <div className="flex items-center pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                          <Loader2 className="animate-spin h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-gray-500">
                            Loading vendors...
                          </span>
                        </div>
                      ) : (
                        <>
                          <button
                            ref={vendorButtonRef}
                            type="button"
                            onClick={() => {
                              if (!formData.Dpt_Id || !formData.Lg_Id) {
                                toast.error(
                                  "Please select Branch and Ledger first",
                                );
                                return;
                              }
                              if (filteredVendors.length == 0) {
                                toast.error("No vendors available");
                                return;
                              }
                              setIsVendorDropdownOpen(!isVendorDropdownOpen);
                            }}
                            onKeyDown={handleVendorKeyDown}
                            disabled={
                              !formData.Dpt_Id ||
                              !formData.Lg_Id ||
                              loadingTenderEntries
                            }
                            className={`w-full pl-10 pr-10 py-3 border ${
                              errors.SL_Id
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left ${
                              !formData.Dpt_Id || !formData.Lg_Id
                                ? "bg-gray-100 cursor-not-allowed"
                                : "bg-white"
                            } flex justify-between items-center`}
                          >
                            <span
                              className={
                                formData.SL_Id
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }
                            >
                              {getSelectedVendorDisplay()}
                            </span>
                            <span className="text-gray-400">
                              {isVendorDropdownOpen ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          </button>
                          {errors.SL_Id && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </>
                      )}

                      {/* Vendor Dropdown Menu */}
                      {isVendorDropdownOpen &&
                        !loadingTenderEntries &&
                        formData.Dpt_Id &&
                        formData.Lg_Id && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                            <div className="p-3 border-b border-gray-200">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  ref={vendorSearchRef}
                                  type="text"
                                  value={vendorSearchTerm}
                                  onChange={handleVendorSearchChange}
                                  onKeyDown={handleVendorSearchKeyDown}
                                  placeholder="Search by vendor name or code..."
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                {vendorSearchTerm && (
                                  <button
                                    type="button"
                                    onClick={() => setVendorSearchTerm("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div
                              ref={vendorListRef}
                              className="overflow-y-auto max-h-64"
                            >
                              {getFilteredVendorsForDisplay().length > 0 ? (
                                getFilteredVendorsForDisplay().map(
                                  (vendor, idx) => (
                                    <button
                                      key={vendor.SL_Id}
                                      ref={(el) => {
                                        vendorItemRefs.current[idx] = el;
                                      }}
                                      type="button"
                                      onClick={() =>
                                        handleVendorSelect(
                                          vendor.SL_Id.toString(),
                                        )
                                      }
                                      onKeyDown={(e) =>
                                        handleVendorItemKeyDown(e, vendor, idx)
                                      }
                                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                        vendorHighlightedIndex == idx
                                          ? "bg-blue-100"
                                          : formData.SL_Id ==
                                              vendor.SL_Id.toString()
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-700"
                                      }`}
                                      tabIndex={0}
                                    >
                                      <div className="font-medium">
                                        {vendor.SL_Name}
                                      </div>
                                      {formData.SL_Id ==
                                        vendor.SL_Id.toString() && (
                                        <div className="text-xs text-blue-600 mt-1 flex items-center">
                                          <Check className="h-3 w-3 mr-1" />
                                          Selected
                                        </div>
                                      )}
                                    </button>
                                  ),
                                )
                              ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                  <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                  <p>No vendors found</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                    {errors.SL_Id && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.SL_Id}
                      </p>
                    )}
                    {formData.Dpt_Id &&
                      formData.Lg_Id &&
                      filteredVendors.length > 0 && (
                        <p className="mt-1 text-xs text-green-600">
                          {filteredVendors.length} vendor(s) available
                        </p>
                      )}
                  </div>

                  {/* TENDER DROPDOWN WITH SEARCH */}
                  <div ref={tenderDropdownRef}>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      <Receipt className="inline h-4 w-4 mr-1 text-gray-500" />
                      Tender Allocation
                    </label>
                    <div className="relative">
                      <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                      {loadingPenalties ? (
                        <div className="flex items-center pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                          <Loader2 className="animate-spin h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-gray-500">Loading...</span>
                        </div>
                      ) : (
                        <>
                          <button
                            ref={tenderButtonRef}
                            type="button"
                            onClick={() => {
                              if (!formData.SL_Id) {
                                toast.error("Please select a vendor first");
                                return;
                              }
                              if (selectedVendorTenders.length == 0) {
                                toast.error("No tender allocations available");
                                return;
                              }
                              setIsTenderDropdownOpen(!isTenderDropdownOpen);
                            }}
                            onKeyDown={handleTenderKeyDown}
                            disabled={!formData.SL_Id || loadingPenalties}
                            className={`w-full pl-10 pr-10 py-3 border ${
                              errors.WA_Id
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left ${
                              !formData.SL_Id
                                ? "bg-gray-100 cursor-not-allowed"
                                : "bg-white"
                            } flex justify-between items-center`}
                          >
                            <span
                              className={
                                formData.WA_Id
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }
                            >
                              {getSelectedTenderDisplay()}
                            </span>
                            <span className="text-gray-400">
                              {isTenderDropdownOpen ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          </button>
                          {errors.WA_Id && (
                            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </>
                      )}

                      {/* Tender Dropdown Menu */}
                      {isTenderDropdownOpen &&
                        !loadingPenalties &&
                        formData.SL_Id && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                            <div className="p-3 border-b border-gray-200">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  ref={tenderSearchRef}
                                  type="text"
                                  value={tenderSearchTerm}
                                  onChange={handleTenderSearchChange}
                                  onKeyDown={handleTenderSearchKeyDown}
                                  placeholder="Search tender allocations..."
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                {tenderSearchTerm && (
                                  <button
                                    type="button"
                                    onClick={() => setTenderSearchTerm("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div
                              ref={tenderListRef}
                              className="overflow-y-auto max-h-64"
                            >
                              {getFilteredTendersForDisplay().length > 0 ? (
                                getFilteredTendersForDisplay().map(
                                  (tender, idx) => (
                                    <button
                                      key={tender.tender_allocation_id}
                                      ref={(el) => {
                                        tenderItemRefs.current[idx] = el;
                                      }}
                                      type="button"
                                      onClick={() =>
                                        handleTenderSelect(
                                          tender.tender_allocation_id,
                                        )
                                      }
                                      onKeyDown={(e) =>
                                        handleTenderItemKeyDown(e, tender, idx)
                                      }
                                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                        tenderHighlightedIndex == idx
                                          ? "bg-blue-100"
                                          : formData.WA_Id ==
                                              tender.tender_allocation_id.toString()
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-700"
                                      }`}
                                      tabIndex={0}
                                    >
                                      <div className="font-medium">
                                        {tender.description || "Tender Work"}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        Amount: ₹
                                        {formatCustomAmount(
                                          tender.gross_amount,
                                        )}
                                      </div>
                                      {formData.WA_Id ==
                                        tender.tender_allocation_id.toString() && (
                                        <div className="text-xs text-blue-600 mt-1 flex items-center">
                                          <Check className="h-3 w-3 mr-1" />
                                          Selected
                                        </div>
                                      )}
                                    </button>
                                  ),
                                )
                              ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                  <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                  <p>No tender allocations found</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                    {formData.WA_Id && selectedTenderDetails && (
                      <div className="mt-2">
                        <p className="text-sm text-blue-600">
                          Amount: ₹
                          {formatCustomAmount(
                            selectedTenderDetails.gross_amount,
                          )}
                        </p>
                        {penalties.length > 0 && (
                          <p className="text-sm text-orange-600 mt-1 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {penalties.length} penalty(ies) found
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Amount (Bill Amount) */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Basic Amount (Bill Amount) *
                  </label>
                  <div className="relative">
                    <input
                      ref={grossAmountRef}
                      type="number"
                      name="Gross_Amt"
                      value={formData.Gross_Amt}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        errors.Gross_Amt
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max={
                        selectedTenderDetails
                          ? parseFloat(selectedTenderDetails.gross_amount || 0)
                          : 9999999999999.99
                      }
                    />
                    {formData.Gross_Amt && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          ₹{formatCustomAmount(parseFloat(formData.Gross_Amt))}
                        </span>
                      </div>
                    )}
                  </div>
                  {errors.Gross_Amt && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.Gross_Amt}
                    </p>
                  )}
                  {selectedTenderDetails && (
                    <p
                      className={`mt-2 text-sm ${
                        formData.Gross_Amt &&
                        parseFloat(formData.Gross_Amt) >
                          parseFloat(selectedTenderDetails.gross_amount || 0)
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      Limit: ₹
                      {formatCustomAmount(selectedTenderDetails.gross_amount)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tax Calculation & Preview */}
          <div className="space-y-6">
            {/* Tax Calculation Card */}
            {(taxParameters.length > 0 || penalties.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                        <Calculator className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Tax Calculation
                        </h2>
                        <p className="text-sm text-gray-600">
                          Using formula-based calculation{" "}
                          {penalties.length > 0 &&
                            `with ${penalties.length} penalty(ies)`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {/* Bill Amount */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700 font-medium">
                        Basic Amount
                      </span>
                      <div className="text-right font-medium text-gray-900">
                        ₹
                        {formatCustomAmount(
                          parseFloat(formData.Gross_Amt || 0),
                        )}
                      </div>
                    </div>

                    {/* Tax Parameters */}
                    {calculatedTaxes.taxBreakdown
                      .filter((tax) => tax.type == "tax")
                      .map((tax, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-start mb-2">
                              <div className="mr-3 mt-1">
                                {tax.isAdd ? (
                                  <Plus className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Minus className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <Percent className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-gray-600 font-medium">
                                    {tax.displayText}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                                      tax.isAdd
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {tax.isAdd ? "Add" : "Deduct"}
                                  </span>
                                  {isManualFormula(tax.formula) && (
                                    <span className="text-xs px-2 py-0.5 rounded-full ml-2 bg-yellow-100 text-yellow-800">
                                      Manual
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            {isManualFormula(tax.formula) ? (
                              <input
                                type="number"
                                value={manualTaxAmounts[tax.VIP_Id] ?? ""}
                                onChange={(e) =>
                                  handleManualTaxAmountChange(
                                    tax.VIP_Id,
                                    e.target.value,
                                  )
                                }
                                className="w-32 px-2 py-1 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-right text-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                              />
                            ) : (
                              <div
                                className={`text-lg font-semibold ${
                                  tax.isAdd ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {tax.isAdd ? "+" : "-"}₹
                                {formatCustomAmount(tax.calculatedAmount)}
                              </div>
                            )}
                            {!isManualFormula(tax.formula) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {tax.percentage}%
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                    {/* Penalties Section */}
                    {penalties.length > 0 && (
                      <>
                        <div className="border-t border-gray-300 my-4 pt-4">
                          <div className="flex items-center mb-3">
                            <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                              <AlertTriangle className="h-3 w-3 text-orange-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Penalties & Other Expenses
                            </h3>
                          </div>

                          <div className="space-y-2">
                            {calculatedTaxes.taxBreakdown
                              .filter((item) => item.type == "penalty")
                              .map((penalty, index) => {
                                const isDeduct =
                                  penalty.Add_Deduct?.toLowerCase() == "deduct";

                                return (
                                  <div
                                    key={penalty.tp_id || index}
                                    className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-3"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-start">
                                        <div className="mr-3 mt-1">
                                          {isDeduct ? (
                                            <Minus className="h-4 w-4 text-red-500" />
                                          ) : (
                                            <Plus className="h-4 w-4 text-green-500" />
                                          )}
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-gray-700">
                                            {penalty?.ledger?.Lg_Name ||
                                              "Penalty"}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            Date: {penalty.Date}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div
                                        className={`text-lg font-semibold ${
                                          isDeduct
                                            ? "text-red-600"
                                            : "text-green-600"
                                        }`}
                                      >
                                        {isDeduct ? "-" : "+"}₹
                                        {formatCustomAmount(
                                          penalty.calculatedAmount,
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {isDeduct ? "Deduct" : "Add"}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Tax Totals */}
                    {calculatedTaxes.taxBreakdown.length > 0 && (
                      <>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-700 font-medium">
                            Total Additions
                          </span>
                          <div className="text-right font-semibold text-green-600">
                            +₹{formatCustomAmount(calculatedTaxes.totalAdd)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-700 font-medium">
                            Total Deductions
                          </span>
                          <div className="text-right font-semibold text-red-600">
                            -₹{formatCustomAmount(calculatedTaxes.totalLess)}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Net Payable */}
                    <div className="flex items-center justify-between py-4 mt-4 bg-gradient-to-r from-green-50 to-white rounded-lg px-4 border border-green-100">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          Net Payable
                        </span>
                        <div className="text-xs text-gray-600 mt-1">
                          Basic amount with tax & penalty adjustments
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-700">
                          ₹{formatCustomAmount(calculatedTaxes.netAmount)}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Final payment amount
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  ref={saveButtonRef}
                  type="submit"
                  disabled={saving}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode
                        ? "Update Payment Voucher"
                        : "Create Payment Voucher"}
                    </>
                  )}
                </button>

                <button
                  ref={cancelButtonRef}
                  type="button"
                  onClick={handleCancel}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      handleCancel();
                    }
                  }}
                  className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center transition-all"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditBillChallanEntry;
