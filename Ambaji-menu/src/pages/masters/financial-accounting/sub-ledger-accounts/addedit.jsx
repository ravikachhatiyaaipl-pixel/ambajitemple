/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  ArrowRight,
  FileText,
  Hash,
  FolderTree,
  CheckCircle,
  XCircle,
  Building2,
  FileCheck,
  Landmark,
  Receipt,
  Briefcase,
  Home,
  MapPin,
  Phone,
  Mail,
  User,
  Layers,
  Search,
  AlertCircle,
  Check,
  Filter,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SubLedgerAccountApi } from "../../../services/subledgeraccountapi";

const AddEditSubledgerAccount = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [ledgers, setLedgers] = useState([]);
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [loadingLedgers, setLoadingLedgers] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [initialLoad, setInitialLoad] = useState(true);
  const [highlightedRowIndex, setHighlightedRowIndex] = useState(-1);
  const lastClickTimeRef = useRef(0);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const accountTypeOptions = [
    { value: "Savings", label: "Savings Account" },
    { value: "Current", label: "Current Account" },
    { value: "OD", label: "Overdraft (OD)" },
    { value: "CC", label: "Cash Credit (CC)" },
    { value: "NRI", label: "NRI Account" },
    { value: "Other", label: "Other" },
  ];

  // GST Allow options
  const gstAllowOptions = [
    { value: 1, label: "Yes - GST Applicable" },
    { value: 0, label: "No - GST Exempted" },
  ];

  const [isAccountTypeDropdownOpen, setIsAccountTypeDropdownOpen] =
    useState(false);
  const [accountTypeSearchTerm, setAccountTypeSearchTerm] = useState("");
  const [accountTypeHighlightedIndex, setAccountTypeHighlightedIndex] =
    useState(-1);
  const [filteredAccountTypes, setFilteredAccountTypes] =
    useState(accountTypeOptions);

  // GST Allow dropdown state
  const [isGstAllowDropdownOpen, setIsGstAllowDropdownOpen] = useState(false);
  const [gstAllowHighlightedIndex, setGstAllowHighlightedIndex] = useState(-1);

  // Refs for keyboard navigation
  const searchInputRef = useRef(null);
  const tableBodyRef = useRef(null);
  const rowRefs = useRef([]);
  const selectAllCheckboxRef = useRef(null);
  const slNameInputRef = useRef(null);
  const slCodeInputRef = useRef(null);
  const addressTextareaRef = useRef(null);
  const cityInputRef = useRef(null);
  const pinInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const contactPersonInputRef = useRef(null);
  const statusCheckboxRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  const prevButtonRef = useRef(null);

  const accountTypeDropdownRef = useRef(null);
  const accountTypeButtonRef = useRef(null);
  const accountTypeSearchRef = useRef(null);
  const accountTypeItemRefs = useRef([]);
  const accountTypeListRef = useRef(null);

  // GST Allow dropdown refs
  const gstAllowDropdownRef = useRef(null);
  const gstAllowButtonRef = useRef(null);
  const gstAllowItemRefs = useRef([]);

  // Statutory tab refs
  const panInputRef = useRef(null);
  const gstinInputRef = useRef(null);
  const gstExemptRef = useRef(null);
  const msmeInputRef = useRef(null);
  const cinInputRef = useRef(null);
  const shopActInputRef = useRef(null);
  const tanInputRef = useRef(null);

  // Banking tab refs
  const bankNameRef = useRef(null);
  const branchNameRef = useRef(null);
  const accountHolderRef = useRef(null);
  const accountNumberRef = useRef(null);
  const ifscCodeRef = useRef(null);
  const accountTypeRef = useRef(null);

  const tabs = ["basic", "statutory", "banking"];
  const isLastTab = activeTab == tabs[tabs.length - 1];

  const [formData, setFormData] = useState({
    Lg_Id: [],
    SL_Code: "",
    SL_Name: "",
    SL_Address: "",
    SL_City: "",
    SL_Pin: "",
    SL_Phone: "",
    SL_Email: "",
    SL_Cont_Pers: "",
    SL_Status: true,
    GST_Incd: 1, // Default to 1 (Yes - GST Applicable)
    PAN_Number: "",
    GSTIN: "",
    GST_Exempt_Declaration: "",
    MSME_Udyam_Registration_No: "",
    CIN_LLPIN: "",
    Shop_Act_Trade_License_No: "",
    TAN: "",
    Bank_Name: "",
    Branch_Name: "",
    Account_Holder_Name: "",
    Account_Number: "",
    IFSC_Code: "",
    Account_Type: "",
    SL_Type: "",
  });

  useEffect(() => {
    loadLedgers();
    if (id && id != "create") {
      setIsEditMode(true);
      loadSubledgerData();
    }

    // Focus on search input after loading
    const focusTimeout = setTimeout(() => {
      if (
        !loading &&
        !isEditMode &&
        !loadingLedgers &&
        searchInputRef.current
      ) {
        searchInputRef.current.focus();
      }
    }, 300);

    return () => clearTimeout(focusTimeout);
  }, [id]);

  // Focus on first field of current tab when tab changes
  useEffect(() => {
    if (!loading && !loadingLedgers) {
      setTimeout(() => {
        if (activeTab == "basic") {
          searchInputRef.current?.focus();
        } else if (activeTab == "statutory") {
          panInputRef.current?.focus();
        } else if (activeTab == "banking") {
          bankNameRef.current?.focus();
        }
      }, 100);
    }
  }, [activeTab, loading, loadingLedgers]);

  useEffect(() => {
    if (!accountTypeSearchTerm.trim()) {
      setFilteredAccountTypes(accountTypeOptions);
    } else {
      const term = accountTypeSearchTerm.toLowerCase();
      const filtered = accountTypeOptions.filter(
        (option) =>
          option.label.toLowerCase().includes(term) ||
          option.value.toLowerCase().includes(term),
      );
      setFilteredAccountTypes(filtered);
    }
    setAccountTypeHighlightedIndex(-1);
  }, [accountTypeSearchTerm]);

  useEffect(() => {
    if (
      isAccountTypeDropdownOpen &&
      accountTypeHighlightedIndex >= 0 &&
      accountTypeListRef.current
    ) {
      const container = accountTypeListRef.current;
      const item = accountTypeItemRefs.current[accountTypeHighlightedIndex];
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
  }, [accountTypeHighlightedIndex, isAccountTypeDropdownOpen]);

  useEffect(() => {
    if (isAccountTypeDropdownOpen && accountTypeSearchRef.current) {
      setTimeout(() => accountTypeSearchRef.current.focus(), 0);
    }
  }, [isAccountTypeDropdownOpen]);

  // GST_Incd dropdown effects
  useEffect(() => {
    if (
      isGstAllowDropdownOpen &&
      gstAllowHighlightedIndex >= 0 &&
      gstAllowDropdownRef.current
    ) {
      const container =
        gstAllowDropdownRef.current.querySelector(".overflow-y-auto");
      const item = gstAllowItemRefs.current[gstAllowHighlightedIndex];
      if (container && item) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [gstAllowHighlightedIndex, isGstAllowDropdownOpen]);

  // Scroll highlighted row into view
  useEffect(() => {
    if (highlightedRowIndex >= 0 && tableBodyRef.current) {
      const container = tableBodyRef.current;
      const row = rowRefs.current[highlightedRowIndex];
      if (row) {
        const containerRect = container.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();

        if (rowRect.bottom > containerRect.bottom) {
          row.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (rowRect.top < containerRect.top) {
          row.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [highlightedRowIndex]);

  useEffect(() => {
    if (initialLoad) return;

    let filtered = ledgers;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ledger) =>
          ledger.Lg_Name?.toLowerCase().includes(term) ||
          ledger.Lg_Eng_Name?.toLowerCase().includes(term) ||
          ledger.Lg_Code?.toLowerCase().includes(term) ||
          ledger.ledger_group?.Gr_Nm?.toLowerCase().includes(term),
      );
    }

    if (filterType == "selected") {
      filtered = filtered.filter((ledger) =>
        formData.Lg_Id.includes(ledger.Lg_Id),
      );
    } else if (filterType == "unselected") {
      filtered = filtered.filter(
        (ledger) => !formData.Lg_Id.includes(ledger.Lg_Id),
      );
    }

    setFilteredLedgers(filtered);
    setHighlightedRowIndex(-1);
  }, [searchTerm, filterType, ledgers, formData.Lg_Id, initialLoad]);

  const loadLedgers = async () => {
    setLoadingLedgers(true);
    try {
      const result = await SubLedgerAccountApi.getLedgers();

      // Filter ledgers where Lg_Sub is "yes" (case insensitive)
      const filteredLedgers = (result.data || []).filter(
        (ledger) => ledger.Lg_Sub && ledger.Lg_Sub.toLowerCase() == "yes",
      );

      // Sort filtered ledgers by code for better UX
      const sortedLedgers = filteredLedgers.sort((a, b) => {
        return a.Lg_Code?.localeCompare(b.Lg_Code) || 0;
      });

      setLedgers(sortedLedgers || []);
      setFilteredLedgers(sortedLedgers || []);
      setInitialLoad(false);

      if (sortedLedgers.length == 0) {
        toast.error(
          "No ledgers with sub-ledger enabled available for subledger creation.",
        );
      }
    } catch (error) {
      console.error("Error loading ledgers:", error);
      toast.error("Failed to load ledgers!");
    } finally {
      setLoadingLedgers(false);
    }
  };

  const loadSubledgerData = async () => {
    setLoading(true);
    try {
      const result = await SubLedgerAccountApi.getById(id);

      if (!result.success) {
        throw new Error(result.message || "Failed to load subledger data");
      }

      const subledger = result.data;

      const lgIdArray = subledger.Lg_Id || [];

      setFormData({
        Lg_Id: lgIdArray,
        SL_Code: subledger.SL_Code || "",
        SL_Name: subledger.SL_Name || "",
        SL_Address: subledger.SL_Address || "",
        SL_City: subledger.SL_City || "",
        SL_Pin: subledger.SL_Pin || "",
        SL_Phone: subledger.SL_Phone || "",
        SL_Email: subledger.SL_Email || "",
        SL_Cont_Pers: subledger.SL_Cont_Pers || "",
        SL_Status:
          subledger.SL_Status != undefined ? subledger.SL_Status : true,

        // GST_Incd field
        GST_Incd: subledger.GST_Incd != undefined ? subledger.GST_Incd : 1,

        // Statutory & Legal Details
        PAN_Number: subledger.PAN_Number || "",
        GSTIN: subledger.GSTIN || "",
        GST_Exempt_Declaration: subledger.GST_Exempt_Declaration || "",
        MSME_Udyam_Registration_No: subledger.MSME_Udyam_Registration_No || "",
        CIN_LLPIN: subledger.CIN_LLPIN || "",
        Shop_Act_Trade_License_No: subledger.Shop_Act_Trade_License_No || "",
        TAN: subledger.TAN || "",
        Bank_Name: subledger.Bank_Name || "",
        Branch_Name: subledger.Branch_Name || "",
        Account_Holder_Name: subledger.Account_Holder_Name || "",
        Account_Number: subledger.Account_Number || "",
        IFSC_Code: subledger.IFSC_Code || "",
        Account_Type: subledger.Account_Type || "",
        SL_Type: subledger.SL_Type || "",
      });

      if (lgIdArray.length > 0) {
        setFilterType("selected");
      }
    } catch (error) {
      console.error("Error loading subledger:", error);
      toast.error(error.message || "Failed to load subledger data!");
      navigate("/masters/financial-accounting/sub-ledger-accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // For PAN, GSTIN, IFSC - auto uppercase
    if (name == "PAN_Number" || name == "GSTIN" || name == "IFSC_Code") {
      const upperValue = value.toUpperCase();
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }
  };

  const handleGstAllowSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      GST_Incd: value,
    }));
    setIsGstAllowDropdownOpen(false);
    setGstAllowHighlightedIndex(-1);

    // Focus on next field (GST Exempt Declaration)
    setTimeout(() => {
      gstExemptRef.current?.focus();
    }, 100);
  };

  const handleGstAllowKeyDown = (e) => {
    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsGstAllowDropdownOpen(true);
      setGstAllowHighlightedIndex(-1);
    } else if (e.key == "Tab") {
      // Allow normal tab behavior
      if (!e.shiftKey) {
        // Tab forward - move to next field
        setIsGstAllowDropdownOpen(false);
      }
    }
  };

  const handleGstAllowItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < gstAllowOptions.length) {
        setGstAllowHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (gstAllowItemRefs.current[nextIndex]) {
            gstAllowItemRefs.current[nextIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setGstAllowHighlightedIndex(-1);
        setTimeout(() => gstAllowButtonRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setGstAllowHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (gstAllowItemRefs.current[prevIndex]) {
            gstAllowItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleGstAllowSelect(item.value);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsGstAllowDropdownOpen(false);
      setGstAllowHighlightedIndex(-1);
      gstAllowButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      e.preventDefault();
      if (!e.shiftKey) {
        // Tab forward - select current highlighted or default and move to next field
        if (gstAllowHighlightedIndex >= 0) {
          handleGstAllowSelect(gstAllowOptions[gstAllowHighlightedIndex].value);
        } else {
          handleGstAllowSelect(formData.GST_Incd);
        }
      }
    }
  };

  const getGstAllowLabel = () => {
    const selected = gstAllowOptions.find(
      (option) => option.value == formData.GST_Incd,
    );
    return selected ? selected.label : "Yes - GST Applicable";
  };

  const handleLedgerSelection = (ledgerId) => {
    setFormData((prev) => {
      const currentIds = [...prev.Lg_Id];

      if (currentIds.includes(ledgerId)) {
        return {
          ...prev,
          Lg_Id: currentIds.filter((id) => id != ledgerId),
        };
      } else {
        return {
          ...prev,
          Lg_Id: [...currentIds, ledgerId],
        };
      }
    });
  };

  const handleRowClick = (ledgerId, e) => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 300) {
      lastClickTimeRef.current = now;
      return;
    }
    lastClickTimeRef.current = now;

    if (
      e.target.type == "checkbox" ||
      e.target.tagName == "INPUT" ||
      e.target.tagName == "BUTTON" ||
      e.target.closest("button") ||
      e.target.closest("a")
    ) {
      return;
    }

    const ignoreElements = ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"];
    if (ignoreElements.includes(e.target.tagName)) {
      return;
    }

    handleLedgerSelection(ledgerId);
  };

  const handleAccountTypeKeyDown = (e) => {
    if (
      e.key == "Enter" ||
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsAccountTypeDropdownOpen(true);
      setAccountTypeSearchTerm("");
      setAccountTypeHighlightedIndex(-1);
      setTimeout(() => accountTypeSearchRef.current?.focus(), 0);
    }
  };

  const handleAccountTypeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredAccountTypes.length > 0) {
        setAccountTypeHighlightedIndex(0);
        setTimeout(() => {
          if (accountTypeItemRefs.current[0]) {
            accountTypeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      // Stay in search
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsAccountTypeDropdownOpen(false);
      setAccountTypeHighlightedIndex(-1);
      setAccountTypeSearchTerm("");
      accountTypeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredAccountTypes.length > 0 && accountTypeHighlightedIndex >= 0) {
        handleAccountTypeSelect(
          filteredAccountTypes[accountTypeHighlightedIndex].value,
        );
      } else if (filteredAccountTypes.length > 0) {
        handleAccountTypeSelect(filteredAccountTypes[0].value);
      }
    }
  };

  const handleAccountTypeItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredAccountTypes.length) {
        setAccountTypeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (accountTypeItemRefs.current[nextIndex]) {
            accountTypeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setAccountTypeHighlightedIndex(-1);
        setTimeout(() => accountTypeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setAccountTypeHighlightedIndex(-1);
        setTimeout(() => accountTypeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setAccountTypeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (accountTypeItemRefs.current[prevIndex]) {
            accountTypeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleAccountTypeSelect(item.value);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsAccountTypeDropdownOpen(false);
      setAccountTypeHighlightedIndex(-1);
      setAccountTypeSearchTerm("");
      accountTypeButtonRef.current?.focus();
    }
  };

  const handleAccountTypeSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      Account_Type: value,
    }));
    setIsAccountTypeDropdownOpen(false);
    setAccountTypeSearchTerm("");
    setAccountTypeHighlightedIndex(-1);

    // Focus on save button after selection
    setTimeout(() => {
      if (!isLastTab) {
        handleSaveAndNext();
      } else {
        saveButtonRef.current?.focus();
      }
    }, 100);
  };

  const getSelectedAccountTypeLabel = () => {
    if (!formData.Account_Type) return "";
    const selected = accountTypeOptions.find(
      (option) => option.value == formData.Account_Type,
    );
    return selected ? selected.label : "";
  };

  const handleCheckboxClick = (ledgerId, e) => {
    if (e) {
      e.stopPropagation();
    }
    handleLedgerSelection(ledgerId);
  };

  const selectAllVisibleLedgers = () => {
    const allIds = filteredLedgers.map((ledger) => ledger.Lg_Id);
    setFormData((prev) => ({
      ...prev,
      Lg_Id: [...new Set([...prev.Lg_Id, ...allIds])],
    }));
  };

  const deselectAllVisibleLedgers = () => {
    const visibleIds = filteredLedgers.map((ledger) => ledger.Lg_Id);
    setFormData((prev) => ({
      ...prev,
      Lg_Id: prev.Lg_Id.filter((id) => !visibleIds.includes(id)),
    }));
  };

  const selectAllLedgers = () => {
    const allIds = ledgers.map((ledger) => ledger.Lg_Id);
    setFormData((prev) => ({
      ...prev,
      Lg_Id: allIds,
    }));
  };

  const deselectAllLedgers = () => {
    setFormData((prev) => ({
      ...prev,
      Lg_Id: [],
    }));
  };

  // Keyboard navigation for search input
  const handleSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredLedgers.length > 0) {
        setHighlightedRowIndex(0);
        setTimeout(() => {
          const firstRowCheckbox = rowRefs.current[0]?.querySelector(
            'input[type="checkbox"]',
          );
          if (firstRowCheckbox) {
            firstRowCheckbox.focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      // Move to next field (SL_Name)
      slNameInputRef.current?.focus();
    }
  };

  // Keyboard navigation for table rows
  const handleRowKeyDown = (e, ledger, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredLedgers.length) {
        setHighlightedRowIndex(nextIndex);
        setTimeout(() => {
          const nextRowCheckbox = rowRefs.current[nextIndex]?.querySelector(
            'input[type="checkbox"]',
          );
          if (nextRowCheckbox) {
            nextRowCheckbox.focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setHighlightedRowIndex(-1);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setHighlightedRowIndex(prevIndex);
        setTimeout(() => {
          const prevRowCheckbox = rowRefs.current[prevIndex]?.querySelector(
            'input[type="checkbox"]',
          );
          if (prevRowCheckbox) {
            prevRowCheckbox.focus();
          }
        }, 0);
      }
    } else if (e.key == " ") {
      e.preventDefault();
      handleLedgerSelection(ledger.Lg_Id);
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleLedgerSelection(ledger.Lg_Id);
      // Move to next field after selection
      setTimeout(() => slNameInputRef.current?.focus(), 100);
    }
  };

  // Handle select all checkbox keyboard navigation
  const handleSelectAllKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredLedgers.length > 0) {
        setHighlightedRowIndex(0);
        setTimeout(() => {
          const firstRowCheckbox = rowRefs.current[0]?.querySelector(
            'input[type="checkbox"]',
          );
          if (firstRowCheckbox) {
            firstRowCheckbox.focus();
          }
        }, 0);
      }
    } else if (e.key == " ") {
      e.preventDefault();
      const checkbox = selectAllCheckboxRef.current;
      if (checkbox) {
        checkbox.click();
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      // Move to next field
      slNameInputRef.current?.focus();
    }
  };

  // General Enter key navigation
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        if (
          nextRef.current.tagName == "TEXTAREA" ||
          nextRef.current.tagName == "INPUT" ||
          nextRef.current.tagName == "SELECT"
        ) {
          nextRef.current.focus();
        } else {
          nextRef.current.focus();
        }
      }
    }
  };

  const validateCurrentTab = () => {
    const errors = [];

    if (activeTab == "basic") {
      if (!formData.SL_Name.trim()) errors.push("Subledger name is required");
      if (!formData.Lg_Id || formData.Lg_Id.length == 0)
        errors.push("At least one ledger must be selected");

      // Email validation if provided
      if (
        formData.SL_Email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.SL_Email)
      ) {
        errors.push("Please enter a valid email address");
      }
    }

    if (activeTab == "statutory") {
      // GST Allow is NOT required, so no validation needed

      if (
        formData.PAN_Number &&
        !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.PAN_Number)
      ) {
        errors.push("PAN Number must be in format: ABCDE1234F");
      }

      if (
        formData.GSTIN &&
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
          formData.GSTIN,
        )
      ) {
        errors.push("GSTIN must be 15 characters with valid format");
      }

      if (
        formData.MSME_Udyam_Registration_No &&
        !/^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/.test(
          formData.MSME_Udyam_Registration_No,
        )
      ) {
        errors.push(
          "MSME Udyam Registration must be in format: UDYAM-XX-00-0000000",
        );
      }

      if (
        formData.CIN_LLPIN &&
        !/^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(
          formData.CIN_LLPIN,
        )
      ) {
        errors.push("CIN/LLPIN must be 21 characters in valid format");
      }

      if (formData.TAN && !/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/.test(formData.TAN)) {
        errors.push("TAN must be in format: ABCD12345E");
      }
    }

    if (activeTab == "banking") {
      if (
        formData.IFSC_Code &&
        !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.IFSC_Code)
      ) {
        errors.push("IFSC Code must be 11 characters (e.g., SBIN0001234)");
      }

      if (
        formData.Account_Number &&
        (formData.Account_Number.length < 9 ||
          formData.Account_Number.length > 18)
      ) {
        errors.push("Account number must be between 9 to 18 digits");
      }
    }

    return errors;
  };

  const handleSaveAndNext = async () => {
    const errors = validateCurrentTab();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    if (isLastTab) {
      const result = await Swal.fire({
        title: isEditMode ? "Update Subledger?" : "Create New Subledger?",
        text: isEditMode
          ? "Are you sure you want to update this subledger information?"
          : "Are you sure you want to create this new subledger?",
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
        const data = {
          ...formData,
          SL_Status: Boolean(formData.SL_Status),
          GST_Incd: Number(formData.GST_Incd), // Ensure it's sent as number
          Lg_Id: formData.Lg_Id,
          SL_Type: formData.SL_Type ? Number(formData.SL_Type) : null,
        };

        let response;

        if (isEditMode) {
          // Edit mode: Send as JSON
          response = await SubLedgerAccountApi.update(id, data);
        } else {
          // Create mode: Send as JSON (not FormData)
          response = await SubLedgerAccountApi.create(data);
        }

        if (!response.success) {
          throw new Error(
            response.message ||
              `Failed to ${isEditMode ? "update" : "create"} subledger`,
          );
        }

        toast.success(
          `Subledger ${isEditMode ? "updated" : "created"} successfully!`,
        );

        setTimeout(() => {
          navigate("/masters/financial-accounting/sub-ledger-accounts");
        }, 1500);
      } catch (error) {
        console.error("Error saving subledger:", error);
        toast.error(error.message || "Failed to save subledger");
      } finally {
        setSaving(false);
      }
    } else {
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  };

  const handleCancel = () => {
    navigate("/masters/financial-accounting/sub-ledger-accounts");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading subledger data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/financial-accounting/sub-ledger-accounts")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Subledger" : "Add New Subledger"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update subledger master information"
                : "Create a new subledger master record"}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-2">
          {tabs.map((tab, index) => (
            <div key={tab} className="flex items-center">
              <div
                className={`h-2 w-2 rounded-full ${
                  activeTab == tab
                    ? "bg-blue-600"
                    : tabs.indexOf(activeTab) > index
                      ? "bg-green-500"
                      : "bg-gray-300"
                }`}
              />
              {index < tabs.length - 1 && (
                <div
                  className={`h-0.5 w-4 ${
                    tabs.indexOf(activeTab) > index
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
          <span className="text-sm text-gray-500 ml-2">
            {tabs.indexOf(activeTab) + 1} of {tabs.length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("basic")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "basic"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Layers className="h-4 w-4 inline mr-2" />
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab("statutory")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "statutory"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileCheck className="h-4 w-4 inline mr-2" />
            Statutory & Legal
          </button>
          <button
            onClick={() => setActiveTab("banking")}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab == "banking"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Landmark className="h-4 w-4 inline mr-2" />
            Banking Details
          </button>
        </nav>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Basic Information Tab */}
        {activeTab == "basic" && (
          <div className="space-y-8">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
              </div>
              <div className="space-y-6">
                {/* Parent Ledgers - MULTIPLE SELECTION */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Ledgers <span className="text-red-500">*</span>
                    </label>
                    <div className="text-xs text-gray-500">
                      Total: {ledgers.length} | Selected:{" "}
                      {formData.Lg_Id.length} | Showing:{" "}
                      {filteredLedgers.length}
                    </div>
                  </div>

                  {/* Search Bar for Ledgers */}
                  <div className="mb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search ledgers by name, English name, code, or group..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loadingLedgers}
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={loadingLedgers}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs and Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterType("all")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                          filterType == "all"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        disabled={loadingLedgers}
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        All ({ledgers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterType("selected")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                          filterType == "selected"
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        disabled={loadingLedgers}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Selected ({formData.Lg_Id.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterType("unselected")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                          filterType == "unselected"
                            ? "bg-gray-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        disabled={loadingLedgers}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Unselected ({ledgers.length - formData.Lg_Id.length})
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={deselectAllLedgers}
                        className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                        disabled={loadingLedgers}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={selectAllVisibleLedgers}
                        className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                        disabled={loadingLedgers}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Select Visible
                      </button>
                    </div>
                  </div>

                  {/* Ledgers List */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div
                      ref={tableBodyRef}
                      className="max-h-96 overflow-y-auto"
                    >
                      {loadingLedgers ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">
                            Loading ledgers...
                          </p>
                        </div>
                      ) : filteredLedgers.length == 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No ledgers found matching your criteria</p>
                          {(searchTerm || filterType != "all") && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchTerm("");
                                setFilterType("all");
                              }}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="w-12 px-4 py-3 text-left">
                                <input
                                  ref={selectAllCheckboxRef}
                                  type="checkbox"
                                  checked={
                                    filteredLedgers.length > 0 &&
                                    filteredLedgers.every((ledger) =>
                                      formData.Lg_Id.includes(ledger.Lg_Id),
                                    )
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      selectAllVisibleLedgers();
                                    } else {
                                      deselectAllVisibleLedgers();
                                    }
                                  }}
                                  onKeyDown={handleSelectAllKeyDown}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                  disabled={loadingLedgers}
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Ledger Details
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Code & Group
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredLedgers.map((ledger, idx) => {
                              const isSelected = formData.Lg_Id.includes(
                                ledger.Lg_Id,
                              );

                              return (
                                <tr
                                  key={ledger.Lg_Id}
                                  ref={(el) => {
                                    rowRefs.current[idx] = el;
                                  }}
                                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                                    isSelected ? "bg-blue-50" : ""
                                  } ${highlightedRowIndex == idx ? "bg-blue-100" : ""}`}
                                  onClick={(e) =>
                                    handleRowClick(ledger.Lg_Id, e)
                                  }
                                  onDoubleClick={(e) => e.preventDefault()}
                                  onKeyDown={(e) =>
                                    handleRowKeyDown(e, ledger, idx)
                                  }
                                  tabIndex={0}
                                >
                                  <td
                                    className="px-4 py-3"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center h-5">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) =>
                                          handleCheckboxClick(ledger.Lg_Id, e)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key == " ") {
                                            e.preventDefault();
                                            handleLedgerSelection(ledger.Lg_Id);
                                          }
                                        }}
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                        id={`ledger-checkbox-${ledger.Lg_Id}`}
                                        disabled={loadingLedgers}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center">
                                      <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {ledger.Lg_Name}
                                          {isSelected && (
                                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                                          )}
                                        </div>
                                        {ledger.Lg_Eng_Name && (
                                          <div className="text-xs text-gray-500 mt-0.5">
                                            {ledger.Lg_Eng_Name}
                                          </div>
                                        )}
                                        {ledger.Lg_Code && (
                                          <div className="text-xs text-gray-500 mt-0.5">
                                            {ledger.Lg_Code}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center">
                                        <Hash className="h-3 w-3 text-gray-400 mr-1" />
                                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                                          {ledger.Lg_Code}
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <FolderTree className="h-3 w-3 text-gray-400 mr-1" />
                                        <span className="text-xs text-gray-600">
                                          {ledger.ledger_group?.Gr_Nm ||
                                            "No Group"}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        ledger.Lg_Status
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {ledger.Lg_Status ? "Active" : "Inactive"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Click anywhere on a row to select/unselect. Search by name,
                    English name, code, or group.
                  </p>
                </div>

                {/* Subledger Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subledger Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={slNameInputRef}
                    type="text"
                    name="SL_Name"
                    value={formData.SL_Name}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, slCodeInputRef)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subledger name"
                    required
                    maxLength={150}
                  />
                </div>

                {/* Subledger Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subledger Code
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={slCodeInputRef}
                      type="text"
                      name="SL_Code"
                      value={formData.SL_Code}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, addressTextareaRef)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter subledger code"
                      maxLength={50}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Unique code for the subledger (max 50 characters)
                  </p>
                </div>

                {/* SL Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SL Type
                  </label>
                  <div className="flex items-center gap-6 py-2.5">
                    {[{ value: "1", label: "Vendor" }, { value: "2", label: "Bank Fd" }].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="SL_Type"
                          value={opt.value}
                          checked={formData.SL_Type == opt.value}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                  <Building2 className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Contact Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      ref={addressTextareaRef}
                      name="SL_Address"
                      value={formData.SL_Address}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, cityInputRef)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter address"
                      rows="2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={cityInputRef}
                      type="text"
                      name="SL_City"
                      value={formData.SL_City}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, pinInputRef)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                      maxLength={50}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN Code
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={pinInputRef}
                      type="text"
                      name="SL_Pin"
                      value={formData.SL_Pin}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, phoneInputRef)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter PIN code"
                      maxLength={20}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={phoneInputRef}
                      type="text"
                      name="SL_Phone"
                      value={formData.SL_Phone}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, emailInputRef)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                      maxLength={15}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      name="SL_Email"
                      value={formData.SL_Email}
                      onChange={handleInputChange}
                      onKeyDown={(e) =>
                        handleEnterKey(e, contactPersonInputRef)
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                      maxLength={50}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={contactPersonInputRef}
                      type="text"
                      name="SL_Cont_Pers"
                      value={formData.SL_Cont_Pers}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, statusCheckboxRef)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter contact person name"
                      maxLength={50}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Subledger Status
                  </h3>
                  <p className="text-sm text-gray-600">
                    Activate or deactivate this subledger
                  </p>
                </div>
                <div className="flex">
                  <label className="flex cursor-pointer">
                    <div className="relative">
                      <input
                        ref={statusCheckboxRef}
                        type="checkbox"
                        name="SL_Status"
                        checked={formData.SL_Status}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key == "Enter") {
                            e.preventDefault();
                            if (!isLastTab) {
                              handleSaveAndNext();
                            } else {
                              saveButtonRef.current?.focus();
                            }
                          }
                        }}
                        className="sr-only"
                      />
                      <div
                        className={`block w-14 h-8 rounded-full ${
                          formData.SL_Status ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          formData.SL_Status ? "transform translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                      {formData.SL_Status ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statutory & Legal Tab */}
        {activeTab == "statutory" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                <FileCheck className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Statutory & Legal Details
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PAN Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={panInputRef}
                    type="text"
                    name="PAN_Number"
                    value={formData.PAN_Number}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, gstinInputRef)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Format: ABCDE1234F</p>
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GSTIN
                </label>
                <div className="relative">
                  <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={gstinInputRef}
                    type="text"
                    name="GSTIN"
                    value={formData.GSTIN}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, gstAllowButtonRef)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    placeholder="22ABCDE1234F1Z5"
                    maxLength={15}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">15 characters</p>
              </div>

              {/* GST Allow - Now in the same row as PAN and GSTIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Include
                </label>
                <div ref={gstAllowDropdownRef} className="relative">
                  <button
                    ref={gstAllowButtonRef}
                    type="button"
                    onClick={() =>
                      setIsGstAllowDropdownOpen(!isGstAllowDropdownOpen)
                    }
                    onKeyDown={handleGstAllowKeyDown}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex items-center justify-between"
                  >
                    <span className="text-gray-900">{getGstAllowLabel()}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform ${isGstAllowDropdownOpen ? "transform rotate-180" : ""}`}
                    />
                  </button>

                  {/* GST Allow Dropdown Menu */}
                  {isGstAllowDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                      <div className="overflow-y-auto max-h-64">
                        {gstAllowOptions.map((option, idx) => (
                          <button
                            key={option.value}
                            ref={(el) => {
                              gstAllowItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleGstAllowSelect(option.value)}
                            onKeyDown={(e) =>
                              handleGstAllowItemKeyDown(e, option, idx)
                            }
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              gstAllowHighlightedIndex == idx
                                ? "bg-blue-100"
                                : formData.GST_Incd == option.value
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                            }`}
                            tabIndex={0}
                          >
                            <div className="font-medium text-gray-900">
                              {option.label}
                            </div>
                            {formData.GST_Incd == option.value && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{gstAllowOptions.length} options</span>
                          <span>Default: Yes</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Default: Yes (1)</p>
              </div>

              {/* GST Exempt Declaration - Full width below the three fields */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Exempt Declaration
                </label>
                <textarea
                  ref={gstExemptRef}
                  name="GST_Exempt_Declaration"
                  value={formData.GST_Exempt_Declaration}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, msmeInputRef)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter GST exemption details if applicable"
                  rows="2"
                  maxLength={255}
                />
              </div>

              {/* MSME Udyam Registration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MSME Udyam Registration No.
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={msmeInputRef}
                    type="text"
                    name="MSME_Udyam_Registration_No"
                    value={formData.MSME_Udyam_Registration_No}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, cinInputRef)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    placeholder="UDYAM-GJ-01-0001234"
                    maxLength={19}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Format: UDYAM-XX-00-0000000
                </p>
              </div>

              {/* CIN/LLPIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CIN/LLPIN
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={cinInputRef}
                    type="text"
                    name="CIN_LLPIN"
                    value={formData.CIN_LLPIN}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, shopActInputRef)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    placeholder="U12345MH2006PTC123456"
                    maxLength={21}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">21 characters</p>
              </div>

              {/* Shop Act/Trade License */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Act/Trade License No.
                </label>
                <input
                  ref={shopActInputRef}
                  type="text"
                  name="Shop_Act_Trade_License_No"
                  value={formData.Shop_Act_Trade_License_No}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, tanInputRef)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter license number"
                  maxLength={50}
                />
              </div>

              {/* TAN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TAN
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={tanInputRef}
                    type="text"
                    name="TAN"
                    value={formData.TAN}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") {
                        e.preventDefault();
                        if (!isLastTab) {
                          handleSaveAndNext();
                        } else {
                          saveButtonRef.current?.focus();
                        }
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    placeholder="ABCD12345E"
                    maxLength={10}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Tax Deduction Account Number
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Banking Details Tab */}
        {activeTab == "banking" && (
          <div className="space-y-8">
            {/* Banking Details Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <Landmark className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Banking & Payment Details
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    ref={bankNameRef}
                    type="text"
                    name="Bank_Name"
                    value={formData.Bank_Name}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, branchNameRef)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter bank name"
                    maxLength={50}
                  />
                </div>

                {/* Branch Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name
                  </label>
                  <input
                    ref={branchNameRef}
                    type="text"
                    name="Branch_Name"
                    value={formData.Branch_Name}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, accountHolderRef)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter branch name"
                    maxLength={50}
                  />
                </div>

                {/* Account Holder Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    ref={accountHolderRef}
                    type="text"
                    name="Account_Holder_Name"
                    value={formData.Account_Holder_Name}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, accountNumberRef)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter account holder name as per bank records"
                    maxLength={50}
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    ref={accountNumberRef}
                    type="text"
                    name="Account_Number"
                    value={formData.Account_Number}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, ifscCodeRef)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter account number"
                    maxLength={18}
                  />
                  <p className="mt-1 text-xs text-gray-500">9-18 digits</p>
                </div>

                {/* IFSC Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={ifscCodeRef}
                      type="text"
                      name="IFSC_Code"
                      value={formData.IFSC_Code}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, accountTypeButtonRef)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                      placeholder="SBIN0001234"
                      maxLength={20}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    11 characters (e.g., SBIN0001234)
                  </p>
                </div>

                {/* Account Type */}
                <div ref={accountTypeDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <div className="relative">
                    {loadingDropdowns ? (
                      <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-gray-500">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <button
                          ref={accountTypeButtonRef}
                          type="button"
                          onClick={() =>
                            setIsAccountTypeDropdownOpen(
                              !isAccountTypeDropdownOpen,
                            )
                          }
                          onKeyDown={handleAccountTypeKeyDown}
                          className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex items-center justify-between`}
                        >
                          <span
                            className={
                              formData.Account_Type
                                ? "text-gray-900"
                                : "text-gray-500"
                            }
                          >
                            {formData.Account_Type
                              ? getSelectedAccountTypeLabel()
                              : "Select Account Type"}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform ${isAccountTypeDropdownOpen ? "transform rotate-180" : ""}`}
                          />
                        </button>
                      </>
                    )}

                    {/* Account Type Dropdown Menu */}
                    {isAccountTypeDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              ref={accountTypeSearchRef}
                              type="text"
                              value={accountTypeSearchTerm}
                              onChange={(e) =>
                                setAccountTypeSearchTerm(e.target.value)
                              }
                              onKeyDown={handleAccountTypeSearchKeyDown}
                              placeholder="Search account type..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            {accountTypeSearchTerm && (
                              <button
                                type="button"
                                onClick={() => setAccountTypeSearchTerm("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Account Type List */}
                        <div
                          ref={accountTypeListRef}
                          className="overflow-y-auto max-h-64"
                        >
                          {filteredAccountTypes.length > 0 ? (
                            filteredAccountTypes.map((option, idx) => (
                              <button
                                key={option.value}
                                ref={(el) => {
                                  accountTypeItemRefs.current[idx] = el;
                                }}
                                type="button"
                                onClick={() =>
                                  handleAccountTypeSelect(option.value)
                                }
                                onKeyDown={(e) =>
                                  handleAccountTypeItemKeyDown(e, option, idx)
                                }
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                  accountTypeHighlightedIndex == idx
                                    ? "bg-blue-100"
                                    : formData.Account_Type == option.value
                                      ? "bg-blue-50 text-blue-600"
                                      : "text-gray-700"
                                }`}
                                tabIndex={0}
                              >
                                <div className="font-medium text-gray-900">
                                  {option.label}
                                </div>
                                {formData.Account_Type == option.value && (
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
                              <p>No account types found</p>
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
                              {filteredAccountTypes.length} types found
                            </span>
                            <span>
                              Total: {accountTypeOptions.length} types
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select account type from the dropdown
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          {/* Left side: Previous button */}
          <div>
            {activeTab != "basic" && (
              <button
                ref={prevButtonRef}
                type="button"
                onClick={() => {
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex - 1]);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    e.preventDefault();
                    const currentIndex = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIndex - 1]);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }
                }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
            )}
          </div>

          {/* Right side: Cancel and Save & Next button */}
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
              type="button"
              onClick={handleSaveAndNext}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleSaveAndNext();
                }
              }}
              disabled={
                saving || ledgers.length == 0 || formData.Lg_Id.length == 0
              }
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isLastTab
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isLastTab
                    ? isEditMode
                      ? "Update Subledger"
                      : "Create Subledger"
                    : "Next"}
                  {!isLastTab && <ArrowRight className="h-4 w-4 ml-2" />}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditSubledgerAccount;
