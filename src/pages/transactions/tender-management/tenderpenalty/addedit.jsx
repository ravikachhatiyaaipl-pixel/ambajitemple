import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calculator,
  Percent,
  Check,
  AlertCircle,
  Calendar,
  Briefcase,
  User,
  ChevronDown,
  ChevronUp,
  Lock,
  Loader,
  Search,
  XCircle,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { tenderPenaltyApi } from "../../../services/tenderpenaltyapi";

const AddEditTenderPenalty = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [subLedgers, setSubLedgers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [selectedSubLedger, setSelectedSubLedger] = useState(null);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [initialSubLedgerId, setInitialSubLedgerId] = useState(null);
  const [initialLedgerId, setInitialLedgerId] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Sub-ledger dropdown states with keyboard navigation
  const [filteredSubLedgers, setFilteredSubLedgers] = useState([]);
  const [subLedgerSearchTerm, setSubLedgerSearchTerm] = useState("");
  const [showSubLedgerDropdown, setShowSubLedgerDropdown] = useState(false);
  const [subLedgerHighlightedIndex, setSubLedgerHighlightedIndex] =
    useState(-1);
  const subLedgerDropdownRef = useRef(null);
  const subLedgerSearchRef = useRef(null);
  const subLedgerItemRefs = useRef([]);
  const subLedgerListRef = useRef(null);
  const subLedgerButtonRef = useRef(null);

  // Ledger dropdown states with keyboard navigation
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [showLedgerDropdown, setShowLedgerDropdown] = useState(false);
  const [ledgerHighlightedIndex, setLedgerHighlightedIndex] = useState(-1);
  const ledgerDropdownRef = useRef(null);
  const ledgerSearchRef = useRef(null);
  const ledgerItemRefs = useRef([]);
  const ledgerListRef = useRef(null);
  const ledgerButtonRef = useRef(null);

  // Calculation Type dropdown states
  const [isCalcTypeDropdownOpen, setIsCalcTypeDropdownOpen] = useState(false);
  const [calcTypeHighlightedIndex, setCalcTypeHighlightedIndex] = useState(-1);
  const calcTypeDropdownRef = useRef(null);
  const calcTypeButtonRef = useRef(null);
  const calcTypeItemRefs = useRef([]);
  const calcTypeListRef = useRef(null);

  // Adjustment Type dropdown states
  const [isAdjTypeDropdownOpen, setIsAdjTypeDropdownOpen] = useState(false);
  const [adjTypeHighlightedIndex, setAdjTypeHighlightedIndex] = useState(-1);
  const adjTypeDropdownRef = useRef(null);
  const adjTypeButtonRef = useRef(null);
  const adjTypeItemRefs = useRef([]);
  const adjTypeListRef = useRef(null);

  // Allocation dropdown states with keyboard navigation
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [allocationSearchTerm, setAllocationSearchTerm] = useState("");
  const [showAllocationDropdown, setShowAllocationDropdown] = useState(false);
  const [allocationHighlightedIndex, setAllocationHighlightedIndex] =
    useState(-1);
  const allocationDropdownRef = useRef(null);
  const allocationSearchRef = useRef(null);
  const allocationItemRefs = useRef([]);
  const allocationListRef = useRef(null);
  const allocationButtonRef = useRef(null);

  // Refs for focus management
  const dateInputRef = useRef(null);
  const percentageRef = useRef(null);
  const fixedAmountRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    SL_Id: "",
    Lg_Id: "",
    Tend_Alloc: "",
    Date: new Date().toISOString().split("T")[0],
    fix_per: "Fixed",
    Gross_Amount: "",
    percentage: "",
    p_amount: "",
    Add_Deduct: "Add",
    Penalty_Type: "",
  });

  const calculationTypeOptions = [
    { value: "Fixed", label: "Fixed Amount" },
    { value: "Per", label: "Percentage of WO Amount" },
  ];

  const adjustmentTypeOptions = [
    { value: "Add", label: "Add (Increase Amount)" },
    { value: "Deduct", label: "Deduct (Decrease Amount)" },
  ];

  // Load sub-ledgers only (not all allocations)
  useEffect(() => {
    const loadSubLedgers = async () => {
      try {
        setLoading(true);
        const subLedgerResponse = await tenderPenaltyApi.getSubLedgers();
        if (subLedgerResponse?.success) {
          setSubLedgers(subLedgerResponse.data || []);
          setFilteredSubLedgers(subLedgerResponse.data || []);
        }

        // If editing, load penalty data after sub-ledgers are loaded
        if (id && id != "create") {
          setIsEditMode(true);
          await loadPenaltyData();
        }
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error loading sub-ledgers:", error);
        toast.error("Failed to load sub-ledgers");
      } finally {
        setLoading(false);
      }
    };

    loadSubLedgers();

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (
        subLedgerDropdownRef.current &&
        !subLedgerDropdownRef.current.contains(event.target)
      ) {
        setShowSubLedgerDropdown(false);
        setSubLedgerHighlightedIndex(-1);
        setSubLedgerSearchTerm("");
      }
      if (
        ledgerDropdownRef.current &&
        !ledgerDropdownRef.current.contains(event.target)
      ) {
        setShowLedgerDropdown(false);
        setLedgerHighlightedIndex(-1);
        setLedgerSearchTerm("");
      }
      if (
        allocationDropdownRef.current &&
        !allocationDropdownRef.current.contains(event.target)
      ) {
        setShowAllocationDropdown(false);
        setAllocationHighlightedIndex(-1);
        setAllocationSearchTerm("");
      }
      if (
        calcTypeDropdownRef.current &&
        !calcTypeDropdownRef.current.contains(event.target)
      ) {
        setIsCalcTypeDropdownOpen(false);
        setCalcTypeHighlightedIndex(-1);
      }
      if (
        adjTypeDropdownRef.current &&
        !adjTypeDropdownRef.current.contains(event.target)
      ) {
        setIsAdjTypeDropdownOpen(false);
        setAdjTypeHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  // Focus on date field after loading
  useEffect(() => {
    if (!loading && !isEditMode && isDataLoaded) {
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [loading, isEditMode, isDataLoaded]);

  // Focus on ledger button after sub-ledger selection
  useEffect(() => {
    if (!loading && selectedSubLedger && ledgerButtonRef.current) {
      setTimeout(() => {
        if (ledgerButtonRef.current && !ledgerButtonRef.current.disabled) {
          ledgerButtonRef.current.focus();
        }
      }, 100);
    }
  }, [loading, selectedSubLedger]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (showSubLedgerDropdown && subLedgerSearchRef.current) {
      setTimeout(() => subLedgerSearchRef.current.focus(), 0);
    }
  }, [showSubLedgerDropdown]);

  useEffect(() => {
    if (showLedgerDropdown && ledgerSearchRef.current) {
      setTimeout(() => ledgerSearchRef.current.focus(), 0);
    }
  }, [showLedgerDropdown]);

  useEffect(() => {
    if (showAllocationDropdown && allocationSearchRef.current) {
      setTimeout(() => allocationSearchRef.current.focus(), 0);
    }
  }, [showAllocationDropdown]);

  // Focus on first item when calculation type dropdown opens
  useEffect(() => {
    if (isCalcTypeDropdownOpen && calculationTypeOptions.length > 0) {
      setCalcTypeHighlightedIndex(0);
      setTimeout(() => {
        if (calcTypeItemRefs.current[0]) {
          calcTypeItemRefs.current[0].focus();
        }
      }, 50);
    }
  }, [isCalcTypeDropdownOpen]);

  // Focus on first item when adjustment type dropdown opens
  useEffect(() => {
    if (isAdjTypeDropdownOpen && adjustmentTypeOptions.length > 0) {
      setAdjTypeHighlightedIndex(0);
      setTimeout(() => {
        if (adjTypeItemRefs.current[0]) {
          adjTypeItemRefs.current[0].focus();
        }
      }, 50);
    }
  }, [isAdjTypeDropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (
      showSubLedgerDropdown &&
      subLedgerHighlightedIndex >= 0 &&
      subLedgerListRef.current
    ) {
      const container = subLedgerListRef.current;
      const item = subLedgerItemRefs.current[subLedgerHighlightedIndex];
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
  }, [subLedgerHighlightedIndex, showSubLedgerDropdown]);

  useEffect(() => {
    if (
      showLedgerDropdown &&
      ledgerHighlightedIndex >= 0 &&
      ledgerListRef.current
    ) {
      const container = ledgerListRef.current;
      const item = ledgerItemRefs.current[ledgerHighlightedIndex];
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
  }, [ledgerHighlightedIndex, showLedgerDropdown]);

  useEffect(() => {
    if (
      showAllocationDropdown &&
      allocationHighlightedIndex >= 0 &&
      allocationListRef.current
    ) {
      const container = allocationListRef.current;
      const item = allocationItemRefs.current[allocationHighlightedIndex];
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
  }, [allocationHighlightedIndex, showAllocationDropdown]);

  // Scroll calculation type highlighted item into view
  useEffect(() => {
    if (
      isCalcTypeDropdownOpen &&
      calcTypeHighlightedIndex >= 0 &&
      calcTypeListRef.current
    ) {
      const container = calcTypeListRef.current;
      const item = calcTypeItemRefs.current[calcTypeHighlightedIndex];
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
  }, [calcTypeHighlightedIndex, isCalcTypeDropdownOpen]);

  // Scroll adjustment type highlighted item into view
  useEffect(() => {
    if (
      isAdjTypeDropdownOpen &&
      adjTypeHighlightedIndex >= 0 &&
      adjTypeListRef.current
    ) {
      const container = adjTypeListRef.current;
      const item = adjTypeItemRefs.current[adjTypeHighlightedIndex];
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
  }, [adjTypeHighlightedIndex, isAdjTypeDropdownOpen]);

  // Filter sub-ledgers
  useEffect(() => {
    if (!subLedgerSearchTerm.trim()) {
      setFilteredSubLedgers(subLedgers);
    } else {
      const term = subLedgerSearchTerm.toLowerCase();
      const filtered = subLedgers.filter(
        (subLedger) =>
          subLedger.SL_Name?.toLowerCase().includes(term) ||
          subLedger.SL_Code?.toLowerCase().includes(term) ||
          `${subLedger.SL_Name} (${subLedger.SL_Code})`
            .toLowerCase()
            .includes(term),
      );
      setFilteredSubLedgers(filtered);
    }
    setSubLedgerHighlightedIndex(-1);
  }, [subLedgerSearchTerm, subLedgers]);

  // Filter ledgers based on selected sub-ledger
  useEffect(() => {
    if (!selectedSubLedger) {
      setFilteredLedgers([]);
      return;
    }

    // Get ledgers from the subledger object
    const availableLedgers = selectedSubLedger.ledgers || [];

    if (!ledgerSearchTerm.trim()) {
      setFilteredLedgers(availableLedgers);
    } else {
      const term = ledgerSearchTerm.toLowerCase();
      const filtered = availableLedgers.filter(
        (ledger) =>
          ledger.Lg_Name?.toLowerCase().includes(term) ||
          ledger.Lg_Code?.toLowerCase().includes(term) ||
          (ledger.Lg_Eng_Name &&
            ledger.Lg_Eng_Name.toLowerCase().includes(term)),
      );
      setFilteredLedgers(filtered);
    }
    setLedgerHighlightedIndex(-1);
  }, [ledgerSearchTerm, selectedSubLedger]);

  // Load allocations when sub-ledger is selected
  useEffect(() => {
    const loadAllocationsForSubLedger = async () => {
      if (selectedSubLedger) {
        setLoadingAllocations(true);

        try {
          const response = await tenderPenaltyApi.getAllocationsBySubLedger(
            selectedSubLedger.SL_Id,
          );
          console.log("Allocations for sub-ledger:", response);

          if (response?.success && response?.data) {
            setAllocations(response.data);
            setFilteredAllocations(response.data);

            // In edit mode, if this is the initial sub-ledger, preselect the allocation
            if (
              isEditMode &&
              selectedSubLedger.SL_Id?.toString() == initialSubLedgerId
            ) {
              const currentAlloc = response.data.find(
                (a) => a.WA_Id?.toString() == formData.Tend_Alloc?.toString(),
              );
              if (currentAlloc) {
                setSelectedAllocation(currentAlloc);
              }
            } else {
              // If sub-ledger changed, clear selected allocation
              setSelectedAllocation(null);
              setFormData((prev) => ({
                ...prev,
                Tend_Alloc: "",
                Gross_Amount: "",
              }));
            }
          } else {
            setAllocations([]);
            setFilteredAllocations([]);
          }
        } catch (error) {
          console.error("Error loading allocations:", error);
          toast.error("Failed to load allocations for this sub-ledger");
          setAllocations([]);
          setFilteredAllocations([]);
        } finally {
          setLoadingAllocations(false);
        }
      } else {
        setAllocations([]);
        setFilteredAllocations([]);
      }
    };

    loadAllocationsForSubLedger();
  }, [selectedSubLedger]);

  const loadPenaltyData = async () => {
    try {
      const penalty = await tenderPenaltyApi.getById(id);
      console.log("Loaded penalty data:", penalty);

      // Store initial IDs
      setInitialSubLedgerId(penalty.SL_Id?.toString());
      setInitialLedgerId(penalty.Lg_Id?.toString());

      // Map API response to form data
      if(penalty.Penalty_Type!=null && penalty.Penalty_Type!=""){
        setFormData({
          SL_Id: penalty.SL_Id?.toString() || "",
          Lg_Id: penalty.Lg_Id?.toString() || "",
          Tend_Alloc: penalty.WA_Id?.toString() || "",
          Date:
            penalty.TA_Date?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          fix_per: penalty.Fix_Per == "F" ? "Fixed" : "Per",
          Gross_Amount: penalty.WO_Amount || "",
          percentage: penalty.Percentage || "",
          p_amount: penalty.Adj_Amount || "",
          Add_Deduct: penalty.Add_Deduct == "A" ? "Add" : "Deduct",
          Penalty_Type: penalty.Penalty_Type || "",
        });
      }
      else{
        setFormData({
          SL_Id: penalty.SL_Id?.toString() || "",
          Lg_Id: penalty.Lg_Id?.toString() || "",
          Tend_Alloc: penalty.WA_Id?.toString() || "",
          Date:
            penalty.TA_Date?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          fix_per: penalty.Fix_Per == "F" ? "Fixed" : "Per",
          Gross_Amount: penalty.WO_Amount || "",
          percentage: penalty.Percentage || "",
          p_amount: penalty.Adj_Amount || "",
          Add_Deduct: penalty.Add_Deduct == "A" ? "Add" : "Deduct",
        });
      }
      

      // Set selected sub-ledger from penalty data
      if (penalty.subledger) {
        setSelectedSubLedger(penalty.subledger);
      }

      // Set selected ledger from the separate ledger object in response
      if (penalty.ledger) {
        setSelectedLedger(penalty.ledger);
      }

      // Set selected allocation from work_allocation
      if (penalty.work_allocation) {
        setSelectedAllocation(penalty.work_allocation);
      }
    } catch (error) {
      console.error("Error loading penalty data:", error);
      toast.error("Failed to load tender adjustment data!");
      navigate("/transactions/tender-management/tenderpenalty");
    }
  };

  // Calculation Type keyboard handlers
  const handleCalcTypeKeyDown = (e) => {
    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsCalcTypeDropdownOpen(true);
      setCalcTypeHighlightedIndex(-1);
    }
  };

  const handleCalcTypeItemKeyDown = (e, option, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < calculationTypeOptions.length) {
        setCalcTypeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (calcTypeItemRefs.current[nextIndex]) {
            calcTypeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setCalcTypeHighlightedIndex(0);
        setTimeout(() => {
          if (calcTypeItemRefs.current[0]) {
            calcTypeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        const lastIndex = calculationTypeOptions.length - 1;
        setCalcTypeHighlightedIndex(lastIndex);
        setTimeout(() => {
          if (calcTypeItemRefs.current[lastIndex]) {
            calcTypeItemRefs.current[lastIndex].focus();
          }
        }, 0);
      } else {
        const prevIndex = idx - 1;
        setCalcTypeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (calcTypeItemRefs.current[prevIndex]) {
            calcTypeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleCalcTypeSelect(option.value);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsCalcTypeDropdownOpen(false);
      setCalcTypeHighlightedIndex(-1);
      calcTypeButtonRef.current?.focus();
    }
  };

  const handleCalcTypeSelect = (value) => {
    setFormData((prev) => ({ ...prev, fix_per: value }));
    setIsCalcTypeDropdownOpen(false);
    setCalcTypeHighlightedIndex(-1);
    setTimeout(() => adjTypeButtonRef.current?.focus(), 100);
  };

  const getSelectedCalcTypeLabel = () => {
    const selected = calculationTypeOptions.find(
      (opt) => opt.value == formData.fix_per,
    );
    return selected ? selected.label : "Fixed Amount";
  };

  // Adjustment Type keyboard handlers
  const handleAdjTypeKeyDown = (e) => {
    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsAdjTypeDropdownOpen(true);
      setAdjTypeHighlightedIndex(-1);
    }
  };

  const handleAdjTypeItemKeyDown = (e, option, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < adjustmentTypeOptions.length) {
        setAdjTypeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (adjTypeItemRefs.current[nextIndex]) {
            adjTypeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setAdjTypeHighlightedIndex(0);
        setTimeout(() => {
          if (adjTypeItemRefs.current[0]) {
            adjTypeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        const lastIndex = adjustmentTypeOptions.length - 1;
        setAdjTypeHighlightedIndex(lastIndex);
        setTimeout(() => {
          if (adjTypeItemRefs.current[lastIndex]) {
            adjTypeItemRefs.current[lastIndex].focus();
          }
        }, 0);
      } else {
        const prevIndex = idx - 1;
        setAdjTypeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (adjTypeItemRefs.current[prevIndex]) {
            adjTypeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleAdjTypeSelect(option.value);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsAdjTypeDropdownOpen(false);
      setAdjTypeHighlightedIndex(-1);
      adjTypeButtonRef.current?.focus();
    }
  };

  const handleAdjTypeSelect = (value) => {
    setFormData((prev) => ({ ...prev, Add_Deduct: value }));
    setIsAdjTypeDropdownOpen(false);
    setAdjTypeHighlightedIndex(-1);

    setTimeout(() => {
      if (formData.fix_per == "Per") {
        percentageRef.current?.focus();
      } else {
        fixedAmountRef.current?.focus();
      }
    }, 100);
  };

  const getSelectedAdjTypeLabel = () => {
    const selected = adjustmentTypeOptions.find(
      (opt) => opt.value == formData.Add_Deduct,
    );
    return selected ? selected.label : "Add (Increase Amount)";
  };

  // Sub-ledger keyboard handlers
  const handleSubLedgerKeyDown = (e) => {
    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setShowSubLedgerDropdown(true);
      setSubLedgerSearchTerm("");
      setSubLedgerHighlightedIndex(-1);
      setTimeout(() => subLedgerSearchRef.current?.focus(), 0);
    }
  };

  const handleSubLedgerSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredSubLedgers.length > 0) {
        setSubLedgerHighlightedIndex(0);
        setTimeout(() => {
          if (subLedgerItemRefs.current[0]) {
            subLedgerItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setShowSubLedgerDropdown(false);
      setSubLedgerHighlightedIndex(-1);
      setSubLedgerSearchTerm("");
      subLedgerButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredSubLedgers.length > 0 && subLedgerHighlightedIndex >= 0) {
        handleSubLedgerSelect(
          filteredSubLedgers[subLedgerHighlightedIndex].SL_Id,
        );
      } else if (filteredSubLedgers.length > 0) {
        handleSubLedgerSelect(filteredSubLedgers[0].SL_Id);
      }
    }
  };

  const handleSubLedgerItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredSubLedgers.length) {
        setSubLedgerHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (subLedgerItemRefs.current[nextIndex]) {
            subLedgerItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setSubLedgerHighlightedIndex(-1);
        setTimeout(() => subLedgerSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setSubLedgerHighlightedIndex(-1);
        setTimeout(() => subLedgerSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setSubLedgerHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (subLedgerItemRefs.current[prevIndex]) {
            subLedgerItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleSubLedgerSelect(item.SL_Id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setShowSubLedgerDropdown(false);
      setSubLedgerHighlightedIndex(-1);
      setSubLedgerSearchTerm("");
      subLedgerButtonRef.current?.focus();
    }
  };

  const handleSubLedgerSelect = (subLedgerId) => {
    const subLedger = subLedgers.find(
      (sl) => sl.SL_Id?.toString() == subLedgerId?.toString(),
    );
    if (subLedger) {
      setSelectedSubLedger(subLedger);
      // Reset ledger when sub-ledger changes
      setSelectedLedger(null);
      setFormData((prev) => ({
        ...prev,
        SL_Id: subLedgerId?.toString(),
        Lg_Id: "", // Reset ledger ID
        Tend_Alloc: "",
        Gross_Amount: "",
      }));
    }
    setShowSubLedgerDropdown(false);
    setSubLedgerSearchTerm("");
    setSubLedgerHighlightedIndex(-1);

    if (errors.SL_Id) {
      setErrors((prev) => ({ ...prev, SL_Id: "" }));
    }
  };

  // Ledger keyboard handlers
  const handleLedgerKeyDown = (e) => {
    if (!selectedSubLedger) {
      toast.error("Please select a sub-ledger first");
      return;
    }

    const availableLedgers = selectedSubLedger.ledgers || [];
    if (availableLedgers.length == 0) {
      // toast.error("No ledgers available for this sub-ledger");
      return;
    }

    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setShowLedgerDropdown(true);
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
    } else if (e.key == "Escape") {
      e.preventDefault();
      setShowLedgerDropdown(false);
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
      setShowLedgerDropdown(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    }
  };

  const handleLedgerSelect = (ledgerId) => {
    if (!selectedSubLedger || !selectedSubLedger.ledgers) return;

    const ledger = selectedSubLedger.ledgers.find(
      (l) => l.Lg_Id?.toString() == ledgerId?.toString(),
    );
    if (ledger) {
      setSelectedLedger(ledger);
      setFormData((prev) => ({
        ...prev,
        Lg_Id: ledgerId?.toString(),
      }));
    }
    setShowLedgerDropdown(false);
    setLedgerSearchTerm("");
    setLedgerHighlightedIndex(-1);

    if (errors.Lg_Id) {
      setErrors((prev) => ({ ...prev, Lg_Id: "" }));
    }

    // Focus on allocation button after ledger selection
    setTimeout(() => allocationButtonRef.current?.focus(), 100);
  };

  // Allocation keyboard handlers
  const handleAllocationKeyDown = (e) => {
    if (!selectedSubLedger) {
      toast.error("Please select a sub-ledger first");
      return;
    }

    if (!selectedLedger) {
      toast.error("Please select a ledger first");
      return;
    }

    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setShowAllocationDropdown(true);
      setAllocationSearchTerm("");
      setAllocationHighlightedIndex(-1);
      setTimeout(() => allocationSearchRef.current?.focus(), 0);
    }
  };

  const handleAllocationSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredAllocations.length > 0) {
        setAllocationHighlightedIndex(0);
        setTimeout(() => {
          if (allocationItemRefs.current[0]) {
            allocationItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setShowAllocationDropdown(false);
      setAllocationHighlightedIndex(-1);
      setAllocationSearchTerm("");
      allocationButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredAllocations.length > 0 && allocationHighlightedIndex >= 0) {
        handleAllocationSelect(
          filteredAllocations[allocationHighlightedIndex].WA_Id,
        );
      } else if (filteredAllocations.length > 0) {
        handleAllocationSelect(filteredAllocations[0].WA_Id);
      }
    }
  };

  const handleAllocationItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredAllocations.length) {
        setAllocationHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (allocationItemRefs.current[nextIndex]) {
            allocationItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setAllocationHighlightedIndex(-1);
        setTimeout(() => allocationSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setAllocationHighlightedIndex(-1);
        setTimeout(() => allocationSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setAllocationHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (allocationItemRefs.current[prevIndex]) {
            allocationItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleAllocationSelect(item.WA_Id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setShowAllocationDropdown(false);
      setAllocationHighlightedIndex(-1);
      setAllocationSearchTerm("");
      allocationButtonRef.current?.focus();
    }
  };

  const handleAllocationSelect = (allocationId) => {
    const alloc = allocations.find(
      (a) => a.WA_Id?.toString() == allocationId?.toString(),
    );
    if (alloc) {
      setSelectedAllocation(alloc);
      setFormData((prev) => ({
        ...prev,
        Tend_Alloc: allocationId?.toString(),
        Gross_Amount: alloc.WO_Amount || "",
      }));
    }
    setShowAllocationDropdown(false);
    setAllocationSearchTerm("");
    setAllocationHighlightedIndex(-1);

    if (errors.Tend_Alloc) {
      setErrors((prev) => ({ ...prev, Tend_Alloc: "" }));
    }

    setTimeout(() => calcTypeButtonRef.current?.focus(), 100);
  };

  const getSelectedSubLedgerName = () => {
    if (!formData.SL_Id) return "";
    const selected = subLedgers.find(
      (sl) => sl.SL_Id?.toString() == formData.SL_Id?.toString(),
    );
    return selected ? `${selected.SL_Name} ` : "";
  };

  const getSelectedLedgerName = () => {
    if (!formData.Lg_Id || !selectedLedger) return "";
    // Display English name if available, otherwise Gujarati name
    const displayName = selectedLedger.Lg_Eng_Name || selectedLedger.Lg_Name;
    return `${displayName} (${selectedLedger.Lg_Code})`;
  };

  const getSelectedAllocationName = () => {
    if (!formData.Tend_Alloc || !selectedAllocation) return "";
    return (
      selectedAllocation.tender?.Description ||
      `Allocation #${selectedAllocation.WA_Id}`
    );
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
    const { name, value, type } = e.target;

    let newValue = value;
    if (type == "number") {
      newValue = value == "" ? "" : parseFloat(value);
    }

    const updatedData = {
      ...formData,
      [name]: newValue,
    };

    // Calculate p_amount if percentage and Gross_Amount are provided
    if (
      (name == "percentage" || name == "Gross_Amount") &&
      updatedData.fix_per == "Per"
    ) {
      if (updatedData.percentage && updatedData.Gross_Amount) {
        updatedData.p_amount = (
          (parseFloat(updatedData.Gross_Amount) *
            parseFloat(updatedData.percentage)) /
          100
        ).toFixed(2);
      }
    }

    setFormData(updatedData);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.SL_Id) newErrors.SL_Id = "Sub-ledger is required";
    if (!formData.Lg_Id) newErrors.Lg_Id = "Ledger is required";
    if (!formData.Tend_Alloc)
      newErrors.Tend_Alloc = "Tender allocation is required";
    if (!formData.Date) newErrors.Date = "Date is required";
    if (!formData.p_amount)
      newErrors.p_amount = "Adjustment amount is required";
    if (!formData.Add_Deduct)
      newErrors.Add_Deduct = "Add/Deduct selection is required";

    if (formData.fix_per == "Per") {
      if (!formData.percentage) {
        newErrors.percentage = "Percentage is required for percentage type";
      } else if (
        parseFloat(formData.percentage) <= 0 ||
        parseFloat(formData.percentage) > 100
      ) {
        newErrors.percentage = "Percentage must be between 0 and 100";
      }
    }

    if (formData.p_amount && parseFloat(formData.p_amount) <= 0) {
      newErrors.p_amount = "Adjustment amount must be greater than 0";
    }

    if (!formData.Gross_Amount || parseFloat(formData.Gross_Amount) <= 0) {
      newErrors.Tend_Alloc =
        "Please select a tender allocation with a valid work order amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode
        ? "Update Tender Adjustment?"
        : "Create New Tender Adjustment?",
      text: isEditMode
        ? "Are you sure you want to update this tender adjustment information?"
        : "Are you sure you want to create this new tender adjustment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const penaltyData = {
        SL_Id: formData.SL_Id,
        Lg_Id: formData.Lg_Id,
        WA_Id: formData.Tend_Alloc,
        TA_Date: formData.Date,
        Fix_Per: formData.fix_per == "Fixed" ? "F" : "P",
        WO_Amount: formData.Gross_Amount
          ? parseFloat(formData.Gross_Amount)
          : 0,
        Percentage:
          formData.fix_per == "Per" && formData.percentage
            ? parseFloat(formData.percentage)
            : 0,
        Adj_Amount: formData.p_amount ? parseFloat(formData.p_amount) : 0,
        Add_Deduct: formData.Add_Deduct == "Add" ? "A" : "D",
        Penalty_Type: formData.Penalty_Type,
      };

      console.log("Sending penalty data:", penaltyData);

      if (isEditMode) {
        await tenderPenaltyApi.update(id, penaltyData);
        toast.success("Tender adjustment updated successfully!");
      } else {
        await tenderPenaltyApi.create(penaltyData);
        toast.success("Tender adjustment created successfully!");
      }

      setTimeout(() => {
        navigate("/transactions/tender-management/tenderpenalty");
      }, 1500);
    } catch (error) {
      console.error("Error saving tender adjustment:", error);

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const errorMessages = Object.values(backendErrors).flat().join(", ");
        toast.error(errorMessages);

        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          if (key == "WO_Amount") newErrors.Tend_Alloc = backendErrors[key][0];
          if (key == "Adj_Amount") newErrors.p_amount = backendErrors[key][0];
        });
        setErrors(newErrors);
      } else {
        toast.error(
          error.message ||
            (isEditMode
              ? "Failed to update tender adjustment. Please try again."
              : "Failed to create tender adjustment. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/tender-management/tenderpenalty");
  };

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "₹0.00";
    const num = parseFloat(amount);
    if (isNaN(num)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tender adjustment data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/tender-management/tenderpenalty")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Tender Adjustment"
                : "Add New Tender Adjustment"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update tender adjustment information"
                : "Create a new tender adjustment record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Calculator className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tender Adjustment Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Row 1: Date - Full width */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={dateInputRef}
                    type="date"
                    name="Date"
                    value={formData.Date}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, subLedgerButtonRef)}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Date ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                </div>
                {errors.Date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Date}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Sub-Ledger, Ledger - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sub-Ledger Dropdown with Search */}
              <div ref={subLedgerDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Ledger <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  {loading ? (
                    <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                      <Loader className="animate-spin h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-gray-500">
                        Loading sub-ledgers...
                      </span>
                    </div>
                  ) : (
                    <>
                      <button
                        ref={subLedgerButtonRef}
                        type="button"
                        onClick={() =>
                          setShowSubLedgerDropdown(!showSubLedgerDropdown)
                        }
                        onKeyDown={handleSubLedgerKeyDown}
                        className={`w-full pl-10 pr-10 py-2.5 border ${
                          errors.SL_Id ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                      >
                        {formData.SL_Id ? (
                          <span className="text-gray-900">
                            {getSelectedSubLedgerName()}
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            {isEditMode && formData.SL_Id && !selectedSubLedger
                              ? "Loading..."
                              : "Select Sub-Ledger"}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setShowSubLedgerDropdown(!showSubLedgerDropdown)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showSubLedgerDropdown ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  )}
                  {errors.SL_Id && (
                    <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}

                  {/* Sub-Ledger Dropdown Menu */}
                  {showSubLedgerDropdown && !loading && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            ref={subLedgerSearchRef}
                            type="text"
                            value={subLedgerSearchTerm}
                            onChange={(e) =>
                              setSubLedgerSearchTerm(e.target.value)
                            }
                            onKeyDown={handleSubLedgerSearchKeyDown}
                            placeholder="Search by name or code..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          {subLedgerSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setSubLedgerSearchTerm("")}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sub-Ledger List */}
                      <div
                        ref={subLedgerListRef}
                        className="overflow-y-auto max-h-64"
                      >
                        {filteredSubLedgers.length > 0 ? (
                          filteredSubLedgers.map((subLedger, idx) => (
                            <button
                              key={subLedger.SL_Id}
                              ref={(el) => {
                                subLedgerItemRefs.current[idx] = el;
                              }}
                              type="button"
                              onClick={() =>
                                handleSubLedgerSelect(subLedger.SL_Id)
                              }
                              onKeyDown={(e) =>
                                handleSubLedgerItemKeyDown(e, subLedger, idx)
                              }
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                subLedgerHighlightedIndex == idx
                                  ? "bg-blue-100"
                                  : formData.SL_Id ==
                                      subLedger.SL_Id?.toString()
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-700"
                              }`}
                              tabIndex={0}
                            >
                              <div className="font-medium">
                                {subLedger.SL_Name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Code: {subLedger.SL_Code || "N/A"}
                              </div>
                              {subLedger.ledgers && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {subLedger.ledgers.length} ledger(s) available
                                </div>
                              )}
                              {formData.SL_Id ==
                                subLedger.SL_Id?.toString() && (
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
                            <p>No sub-ledgers found</p>
                            <p className="text-xs mt-1">
                              Try a different search term
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{filteredSubLedgers.length} found</span>
                          <span>Total: {subLedgers.length}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {errors.SL_Id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.SL_Id}
                  </p>
                )}
              </div>

              {/* Ledger Dropdown with Search */}
              <div ref={ledgerDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ledger <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <>
                    <button
                      ref={ledgerButtonRef}
                      type="button"
                      onClick={() => {
                        if (selectedSubLedger) {
                          const availableLedgers =
                            selectedSubLedger.ledgers || [];
                          if (availableLedgers.length > 0) {
                            setShowLedgerDropdown(!showLedgerDropdown);
                          } else {
                            // toast.error("No ledgers available for this sub-ledger");
                          }
                        } else {
                          toast.error("Please select a sub-ledger first");
                        }
                      }}
                      onKeyDown={handleLedgerKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 border ${
                        errors.Lg_Id ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                      disabled={!selectedSubLedger}
                    >
                      {formData.Lg_Id && selectedLedger ? (
                        <span className="text-gray-900">
                          {getSelectedLedgerName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {!selectedSubLedger
                            ? "Select a sub-ledger first"
                            : !selectedSubLedger.ledgers ||
                                selectedSubLedger.ledgers.length == 0
                              ? "No ledgers available"
                              : "Select Ledger"}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSubLedger) {
                          const availableLedgers =
                            selectedSubLedger.ledgers || [];
                          if (availableLedgers.length > 0) {
                            setShowLedgerDropdown(!showLedgerDropdown);
                          }
                        }
                      }}
                      disabled={
                        !selectedSubLedger ||
                        !selectedSubLedger.ledgers ||
                        selectedSubLedger.ledgers.length == 0
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 disabled:opacity-50"
                    >
                      {showLedgerDropdown ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                  {errors.Lg_Id && (
                    <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}

                  {/* Ledger Dropdown Menu */}
                  {showLedgerDropdown && selectedSubLedger && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            ref={ledgerSearchRef}
                            type="text"
                            value={ledgerSearchTerm}
                            onChange={(e) =>
                              setLedgerSearchTerm(e.target.value)
                            }
                            onKeyDown={handleLedgerSearchKeyDown}
                            placeholder="Search by name or code..."
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

                      {/* Ledger List */}
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
                              onClick={() => handleLedgerSelect(ledger.Lg_Id)}
                              onKeyDown={(e) =>
                                handleLedgerItemKeyDown(e, ledger, idx)
                              }
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                ledgerHighlightedIndex == idx
                                  ? "bg-blue-100"
                                  : formData.Lg_Id == ledger.Lg_Id?.toString()
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-700"
                              }`}
                              tabIndex={0}
                            >
                              <div className="font-medium">
                                {ledger.Lg_Eng_Name || ledger.Lg_Name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Code: {ledger.Lg_Code || "N/A"}
                              </div>
                              {formData.Lg_Id == ledger.Lg_Id?.toString() && (
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
                            <p className="text-xs mt-1">
                              Try a different search term
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{filteredLedgers.length} found</span>
                          <span>
                            Total: {selectedSubLedger.ledgers?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {errors.Lg_Id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Lg_Id}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Select a ledger associated with the sub-ledger
                </p>
              </div>
            </div>

            {/* Row 3: Tender Allocation, Work Order Amount - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tender Allocation Dropdown with Search */}
              <div ref={allocationDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tender Allocation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  {loadingAllocations ? (
                    <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                      <Loader className="animate-spin h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-gray-500">
                        Loading allocations...
                      </span>
                    </div>
                  ) : (
                    <>
                      <button
                        ref={allocationButtonRef}
                        type="button"
                        onClick={() => {
                          if (selectedSubLedger && selectedLedger) {
                            setShowAllocationDropdown(!showAllocationDropdown);
                          } else if (!selectedSubLedger) {
                            toast.error("Please select a sub-ledger first");
                          } else if (!selectedLedger) {
                            toast.error("Please select a ledger first");
                          }
                        }}
                        onKeyDown={handleAllocationKeyDown}
                        className={`w-full pl-10 pr-10 py-2.5 border ${
                          errors.Tend_Alloc
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                        disabled={!selectedSubLedger || !selectedLedger}
                      >
                        {formData.Tend_Alloc && selectedAllocation ? (
                          <div className="flex justify-between items-center">
                            <span className="font-medium truncate">
                              {selectedAllocation.tender?.Description ||
                                `Allocation #${selectedAllocation.WA_Id}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            {!selectedSubLedger
                              ? "Select a sub-ledger first"
                              : !selectedLedger
                                ? "Select a ledger first"
                                : "Select Tender Allocation"}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedSubLedger && selectedLedger) {
                            setShowAllocationDropdown(!showAllocationDropdown);
                          }
                        }}
                        disabled={!selectedSubLedger || !selectedLedger}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 disabled:opacity-50"
                      >
                        {showAllocationDropdown ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  )}
                  {errors.Tend_Alloc && (
                    <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}

                  {/* Allocation Dropdown Menu */}
                  {showAllocationDropdown && !loadingAllocations && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            ref={allocationSearchRef}
                            type="text"
                            value={allocationSearchTerm}
                            onChange={(e) =>
                              setAllocationSearchTerm(e.target.value)
                            }
                            onKeyDown={handleAllocationSearchKeyDown}
                            placeholder="Search by description or amount..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          {allocationSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setAllocationSearchTerm("")}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Allocation List */}
                      <div
                        ref={allocationListRef}
                        className="overflow-y-auto max-h-64"
                      >
                        {filteredAllocations.length > 0 ? (
                          filteredAllocations.map((alloc, idx) => (
                            <button
                              key={alloc.WA_Id}
                              ref={(el) => {
                                allocationItemRefs.current[idx] = el;
                              }}
                              type="button"
                              onClick={() =>
                                handleAllocationSelect(alloc.WA_Id)
                              }
                              onKeyDown={(e) =>
                                handleAllocationItemKeyDown(e, alloc, idx)
                              }
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                allocationHighlightedIndex == idx
                                  ? "bg-blue-100"
                                  : formData.Tend_Alloc ==
                                      alloc.WA_Id?.toString()
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-700"
                              }`}
                              tabIndex={0}
                            >
                              <div className="font-medium">
                                {alloc.tender?.Description ||
                                  `Allocation #${alloc.WA_Id}`}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                                <span>
                                  Amount: {formatCurrency(alloc.WO_Amount)}
                                </span>
                              </div>
                              {formData.Tend_Alloc ==
                                alloc.WA_Id?.toString() && (
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
                            <p>No allocations found</p>
                            <p className="text-xs mt-1">
                              Try a different search term
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{filteredAllocations.length} found</span>
                          <span>Total: {allocations.length}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {errors.Tend_Alloc && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Tend_Alloc}
                  </p>
                )}
              </div>

              {/* Gross Amount - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Order Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      formData.Gross_Amount
                        ? formatCurrency(formData.Gross_Amount)
                        : ""
                    }
                    readOnly
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Tend_Alloc ? "border-red-300" : "border-gray-300"
                    } rounded-lg bg-gray-50 text-gray-900`}
                    placeholder="Select tender allocation first"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.Tend_Alloc && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Tend_Alloc}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Auto-filled from selected allocation
                </p>
              </div>
            </div>

            {/* Row 3.5: Penalty Type - Full width */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penalty Type
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="Penalty_Type"
                    value={formData.Penalty_Type}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, calcTypeButtonRef)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Employee Withheld Penalty"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Specify the type of penalty being applied
                </p>
              </div>
            </div>

            {/* Row 4: Calculation Type and Add/Deduct - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calculation Type - Custom Dropdown */}
              <div ref={calcTypeDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calculation Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    ref={calcTypeButtonRef}
                    type="button"
                    onClick={() =>
                      setIsCalcTypeDropdownOpen(!isCalcTypeDropdownOpen)
                    }
                    onKeyDown={handleCalcTypeKeyDown}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex items-center justify-between"
                  >
                    <span className="text-gray-900">
                      {getSelectedCalcTypeLabel()}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform ${isCalcTypeDropdownOpen ? "transform rotate-180" : ""}`}
                    />
                  </button>

                  {/* Calculation Type Dropdown Menu */}
                  {isCalcTypeDropdownOpen && (
                    <div
                      className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
                      onKeyDown={(e) => {
                        if (e.key == "ArrowDown" || e.key == "ArrowUp") {
                          e.preventDefault();
                        }
                      }}
                    >
                      <div
                        ref={calcTypeListRef}
                        className="max-h-60 overflow-y-auto"
                      >
                        {calculationTypeOptions.map((option, idx) => (
                          <div
                            key={option.value}
                            ref={(el) => {
                              calcTypeItemRefs.current[idx] = el;
                            }}
                            onClick={() => handleCalcTypeSelect(option.value)}
                            onKeyDown={(e) =>
                              handleCalcTypeItemKeyDown(e, option, idx)
                            }
                            className={`w-full px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              calcTypeHighlightedIndex == idx
                                ? "bg-blue-100"
                                : formData.fix_per == option.value
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                            }`}
                            tabIndex={0}
                            role="button"
                          >
                            <div className="font-medium">{option.label}</div>
                            {formData.fix_per == option.value && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Choose how adjustment is calculated
                </p>
              </div>

              {/* Adjustment Type - Custom Dropdown */}
              <div ref={adjTypeDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    ref={adjTypeButtonRef}
                    type="button"
                    onClick={() =>
                      setIsAdjTypeDropdownOpen(!isAdjTypeDropdownOpen)
                    }
                    onKeyDown={handleAdjTypeKeyDown}
                    className={`w-full px-4 py-2.5 border ${
                      errors.Add_Deduct ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex items-center justify-between`}
                  >
                    <span className="text-gray-900">
                      {getSelectedAdjTypeLabel()}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform ${isAdjTypeDropdownOpen ? "transform rotate-180" : ""}`}
                    />
                  </button>

                  {/* Adjustment Type Dropdown Menu */}
                  {isAdjTypeDropdownOpen && (
                    <div
                      className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
                      onKeyDown={(e) => {
                        if (e.key == "ArrowDown" || e.key == "ArrowUp") {
                          e.preventDefault();
                        }
                      }}
                    >
                      <div
                        ref={adjTypeListRef}
                        className="max-h-60 overflow-y-auto"
                      >
                        {adjustmentTypeOptions.map((option, idx) => (
                          <div
                            key={option.value}
                            ref={(el) => {
                              adjTypeItemRefs.current[idx] = el;
                            }}
                            onClick={() => handleAdjTypeSelect(option.value)}
                            onKeyDown={(e) =>
                              handleAdjTypeItemKeyDown(e, option, idx)
                            }
                            className={`w-full px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              adjTypeHighlightedIndex == idx
                                ? "bg-blue-100"
                                : formData.Add_Deduct == option.value
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                            }`}
                            tabIndex={0}
                            role="button"
                          >
                            <div className="font-medium">{option.label}</div>
                            {formData.Add_Deduct == option.value && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {errors.Add_Deduct && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Add_Deduct}
                  </p>
                )}
              </div>
            </div>

            {/* Row 5: Percentage or Fixed Amount fields based on selection */}
            {formData.fix_per == "Per" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Percentage Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percentage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={percentageRef}
                      type="number"
                      name="percentage"
                      value={formData.percentage}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        errors.percentage ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter percentage"
                      step="0.01"
                      min="0.01"
                      max="100"
                      disabled={!formData.Gross_Amount}
                    />
                  </div>
                  {errors.percentage && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.percentage}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter percentage value (0-100)
                  </p>
                </div>

                {/* Adjustment Amount - Auto-calculated for percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      name="p_amount"
                      value={formData.p_amount}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        errors.p_amount ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50`}
                      placeholder="Auto-calculated"
                      step="0.01"
                      min="0.01"
                      required
                      disabled={formData.percentage && formData.Gross_Amount}
                      readOnly={formData.percentage && formData.Gross_Amount}
                    />
                  </div>
                  {errors.p_amount && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.p_amount}
                    </p>
                  )}
                  {formData.percentage && formData.Gross_Amount && (
                    <p className="mt-1 text-xs text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      {formData.percentage}% of{" "}
                      {formatCurrency(formData.Gross_Amount)} ={" "}
                      {formatCurrency(formData.p_amount)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Adjustment Amount - Manual entry for fixed */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={fixedAmountRef}
                      type="number"
                      name="p_amount"
                      value={formData.p_amount}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        errors.p_amount ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter fixed amount"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>
                  {errors.p_amount && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.p_amount}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the exact adjustment amount
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Work Order Amount is auto-filled from selected allocation
            </p>
          </div>
          <div className="flex items-center space-x-3">
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
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    ? "Update Tender Adjustment"
                    : "Create Tender Adjustment"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditTenderPenalty;
