import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  Hash,
  Check,
  AlertCircle,
  Copy,
  Building2,
  ChevronDown,
  Search,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader,
  FolderTree,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { PayrollBillApi } from "../../../services/payrollbillapi";

const AddEditPayrollBill = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // =============  LEDGER DROPDOWN STATES ==============
  const [ledgers, setLedgers] = useState([]);
  const [hierarchicalLedgers, setHierarchicalLedgers] = useState([]);
  const [loadingLedgers, setLoadingLedgers] = useState(false);
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [ledgerHighlightedIndex, setLedgerHighlightedIndex] = useState(-1);

  // =============  REFS FOR FOCUS MANAGEMENT ==============
  const ledgerDropdownRef = useRef(null);
  const ledgerSearchRef = useRef(null);
  const ledgerButtonRef = useRef(null);
  const ledgerItemRefs = useRef([]);
  const codeInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  // =============  FORM DATA ==============
  const [formData, setFormData] = useState({
    PayBill_Code: "",
    Description: "",
    Lg_Id: "",
  });

  // =============  HELPER FUNCTION FOR LEDGER HIERARCHY ==============
  // Build hierarchical structure from flat ledger list
  const buildLedgerHierarchy = (ledgerList) => {
    const ledgerMap = new Map();
    const rootLedgers = [];

    // First pass: create map of all ledgers
    ledgerList.forEach((ledger) => {
      ledgerMap.set(ledger.Lg_Id, {
        ...ledger,
        children: [],
        level: 0,
      });
    });

    // Second pass: build hierarchy
    ledgerList.forEach((ledger) => {
      const ledgerWithChildren = ledgerMap.get(ledger.Lg_Id);
      if (ledger.ParentId && ledgerMap.has(ledger.ParentId)) {
        // This ledger has a parent
        const parent = ledgerMap.get(ledger.ParentId);
        ledgerWithChildren.level = (parent.level || 0) + 1;
        parent.children.push(ledgerWithChildren);
      } else {
        // This is a root ledger
        rootLedgers.push(ledgerWithChildren);
      }
    });

    return rootLedgers;
  };

  // Flatten hierarchical ledgers for display with proper indentation
  const flattenHierarchy = (hierarchy, level = 0, result = []) => {
    hierarchy.forEach((item) => {
      result.push({
        ...item,
        displayLevel: level,
      });
      if (item.children && item.children.length > 0) {
        flattenHierarchy(item.children, level + 1, result);
      }
    });
    return result;
  };

  // =============  HELPER FUNCTION FOR INDENTED LEDGER NAME ==============
  // Like the department indentation in reference code
  const getLedgerIndentedName = (ledger) => {
    const indentLevels = {
      0: "",
      1: "    ", // 4 spaces for level 1
      2: "        ", // 8 spaces for level 2
      3: "            ", // 12 spaces for level 3
      4: "                ", // 16 spaces for level 4
    };

    const level = ledger.displayLevel || ledger.level || 0;
    const indent = indentLevels[level.toString()] || "    ".repeat(level);

    // Display format: Name (Code)
    const displayName = ledger.Lg_Name || "";
    const code = ledger.Lg_Code ? ` (${ledger.Lg_Code})` : "";

    return `${indent}${displayName}${code}`;
  };

  // =============  FUNCTION TO GET SELECTED LEDGER DISPLAY WITH TREE VIEW ==============
  const getSelectedLedgerDisplay = () => {
    if (!formData.Lg_Id) return "";

    // First try to find in filteredLedgers which has displayLevel
    let selected = filteredLedgers.find(
      (ledger) => ledger.Lg_Id?.toString() == formData.Lg_Id,
    );

    // If not found in filteredLedgers, try in ledgers
    if (!selected) {
      selected = ledgers.find(
        (ledger) => ledger.Lg_Id?.toString() == formData.Lg_Id,
      );
    }

    if (!selected) return "Selected ledger not found";

    const level = selected.displayLevel || selected.level || 0;

    const indentLevels = {
      0: "",
      1: "    ",
      2: "        ",
      3: "            ",
      4: "                ",
    };
    const indent = indentLevels[level.toString()] || "    ".repeat(level);

    return `${indent}${selected.Lg_Name} (${selected.Lg_Code})`;
  };

  // =============  CLICK OUTSIDE HANDLER ==============
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ledgerDropdownRef.current &&
        !ledgerDropdownRef.current.contains(event.target)
      ) {
        setIsLedgerDropdownOpen(false);
        setLedgerHighlightedIndex(-1);
        setLedgerSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =============  FOCUS SEARCH WHEN DROPDOWN OPENS ==============
  useEffect(() => {
    if (isLedgerDropdownOpen && ledgerSearchRef.current) {
      setTimeout(() => ledgerSearchRef.current.focus(), 0);
    }
  }, [isLedgerDropdownOpen]);

  // =============  SCROLL HIGHLIGHTED ITEM INTO VIEW ==============
  useEffect(() => {
    if (
      isLedgerDropdownOpen &&
      ledgerHighlightedIndex >= 0 &&
      ledgerItemRefs.current[ledgerHighlightedIndex]
    ) {
      ledgerItemRefs.current[ledgerHighlightedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [ledgerHighlightedIndex, isLedgerDropdownOpen]);

  // =============  FILTER LEDGERS (preserving hierarchy) ==============
  useEffect(() => {
    if (!ledgerSearchTerm.trim()) {
      // Show full hierarchy when no search term
      const flattened = flattenHierarchy(hierarchicalLedgers);
      setFilteredLedgers(flattened);
    } else {
      const term = ledgerSearchTerm.toLowerCase();

      // First find matching ledgers
      const matchingLedgers = ledgers.filter(
        (ledger) =>
          (ledger.Lg_Name?.toLowerCase() || "").includes(term) ||
          (ledger.Lg_Code?.toLowerCase() || "").includes(term) ||
          (ledger.Lg_Eng_Name?.toLowerCase() || "").includes(term),
      );

      // Get IDs of matching ledgers
      const matchingIds = new Set(matchingLedgers.map((l) => l.Lg_Id));

      // Need to include parents of matching ledgers to show context
      const ledgersToShow = new Set();

      const addParents = (ledgerId) => {
        const ledger = ledgers.find((l) => l.Lg_Id == ledgerId);
        if (ledger) {
          ledgersToShow.add(ledgerId);
          if (ledger.ParentId) {
            addParents(ledger.ParentId);
          }
        }
      };

      matchingIds.forEach((id) => addParents(id));

      // Filter to show matching ledgers and their parents
      const filteredWithContext = ledgers.filter((l) =>
        ledgersToShow.has(l.Lg_Id),
      );

      // Build hierarchy from filtered list
      const filteredHierarchy = buildLedgerHierarchy(filteredWithContext);
      const flattened = flattenHierarchy(filteredHierarchy);

      setFilteredLedgers(flattened);
    }
    setLedgerHighlightedIndex(-1);
  }, [ledgerSearchTerm, ledgers, hierarchicalLedgers]);

  // =============  INITIAL FOCUS ==============
  useEffect(() => {
    const timer = setTimeout(() => {
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // =============  FETCH LEDGERS ==============
  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadPayrollBillData();
    }
    loadLedgers();
  }, [id]);

  const loadLedgers = async () => {
    setLoadingLedgers(true);
    try {
      const data = await PayrollBillApi.getAllLedgers();

      // Sort by Lg_Code or Lg_Name for consistent order
      const sortedData = [...data].sort((a, b) =>
        (a.Lg_Code || "").localeCompare(b.Lg_Code || ""),
      );

      setLedgers(sortedData);

      // Build hierarchical structure
      const hierarchy = buildLedgerHierarchy(sortedData);
      setHierarchicalLedgers(hierarchy);

      // Flatten for initial display
      const flattened = flattenHierarchy(hierarchy);
      setFilteredLedgers(flattened);
    } catch (error) {
      console.error("Error loading ledgers:", error);
      toast.error("Failed to load ledgers!");
      setLedgers([]);
      setHierarchicalLedgers([]);
      setFilteredLedgers([]);
    } finally {
      setLoadingLedgers(false);
    }
  };

  const loadPayrollBillData = async () => {
    setLoading(true);
    try {
      const payrollBill = await PayrollBillApi.getById(id);
      setFormData({
        PayBill_Code: payrollBill.PayBill_Code || "",
        Description: payrollBill.Description || "",
        Lg_Id: payrollBill.Lg_Id?.toString() || "",
      });
    } catch (error) {
      console.error("Error loading payroll bill:", error);
      toast.error("Failed to load payroll bill data!");
      navigate("/masters/administrative-masters/paybill-master");
    } finally {
      setLoading(false);
    }
  };

  // =============  INPUT CHANGE HANDLER ==============
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Handle PayBill_Code - alphanumeric, no special chars
    if (name == "PayBill_Code") {
      processedValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (processedValue.length > 20) {
        processedValue = processedValue.substring(0, 20);
      }
    }

    // Handle Description - max 255 chars
    if (name == "Description") {
      if (processedValue.length > 255) {
        processedValue = processedValue.substring(0, 255);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // =============  LEDGER SELECT HANDLER WITH AUTO FOCUS ==============
  const handleLedgerSelect = (ledgerId) => {
    setFormData((prev) => ({
      ...prev,
      Lg_Id: ledgerId ? ledgerId.toString() : "",
    }));
    setIsLedgerDropdownOpen(false);
    setLedgerSearchTerm("");
    setLedgerHighlightedIndex(-1);
    if (errors.Lg_Id) {
      setErrors((prev) => ({ ...prev, Lg_Id: "" }));
    }
    setTimeout(() => saveButtonRef.current?.focus(), 100);
  };

  // =============  PERFECT KEYBOARD NAVIGATION ==============

  // Ledger dropdown keyboard handlers
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
      if (ledgerHighlightedIndex == -1) {
        // Already in search, do nothing
      } else {
        setLedgerHighlightedIndex(-1);
        setTimeout(() => ledgerSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    }
  };

  const handleLedgerKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isLedgerDropdownOpen) {
        setIsLedgerDropdownOpen(true);
        setLedgerSearchTerm("");
        setLedgerHighlightedIndex(-1);
        setTimeout(() => ledgerSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isLedgerDropdownOpen) {
        setIsLedgerDropdownOpen(false);
        setLedgerHighlightedIndex(-1);
        setLedgerSearchTerm("");
      }
    }
  };

  useEffect(() => {
    if (isLedgerDropdownOpen && ledgerHighlightedIndex >= 0) {
      setTimeout(() => {
        if (ledgerItemRefs.current[ledgerHighlightedIndex]) {
          ledgerItemRefs.current[ledgerHighlightedIndex].focus();
        }
      }, 50);
    }
  }, [ledgerHighlightedIndex, isLedgerDropdownOpen]);

  // =============  INPUT FIELD KEYBOARD NAVIGATION ==============
  const handleInputKeyDown = (e, nextField) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextField?.current) {
        if (nextField.current.focus) {
          nextField.current.focus();
        } else if (nextField.current.open) {
          nextField.current.focus();
        }
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      cancelButtonRef.current?.focus();
    }
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      ledgerButtonRef.current?.focus();
    } else if (e.key == "Escape") {
      e.preventDefault();
      cancelButtonRef.current?.focus();
    }
  };

  // =============  VALIDATE FORM ==============
  const validateForm = () => {
    const newErrors = {};

    if (!formData.PayBill_Code.trim()) {
      newErrors.PayBill_Code = "PayBill Code is required";
    } else if (formData.PayBill_Code.length > 20) {
      newErrors.PayBill_Code = "PayBill Code must not exceed 20 characters";
    }

    if (formData.Description && formData.Description.length > 255) {
      newErrors.Description = "Description must not exceed 255 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  // =============  SUBMIT FORM ==============
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
      title: isEditMode ? "Update Payroll Bill?" : "Create New Payroll Bill?",
      text: isEditMode
        ? "Are you sure you want to update this payroll bill information?"
        : "Are you sure you want to create this new payroll bill?",
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
      const payrollBillData = {
        PayBill_Code: formData.PayBill_Code.trim(),
        Description: formData.Description.trim() || null,
        Lg_Id: formData.Lg_Id ? parseInt(formData.Lg_Id) : null,
      };

      if (isEditMode) {
        await PayrollBillApi.update(id, payrollBillData);
        toast.success("Payroll bill updated successfully!");
      } else {
        await PayrollBillApi.create(payrollBillData);
        toast.success("Payroll bill created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/administrative-masters/paybill-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving payroll bill:", error);

      if (error.errors) {
        const newErrors = {};
        Object.keys(error.errors).forEach((key) => {
          newErrors[key] = Array.isArray(error.errors[key])
            ? error.errors[key][0]
            : error.errors[key];
        });
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else if (error.message) {
        if (
          error.message.includes("unique") ||
          error.message.includes("already exists")
        ) {
          setErrors({ PayBill_Code: "This PayBill Code already exists" });
          toast.error("This PayBill Code already exists");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(
          isEditMode
            ? "Failed to update payroll bill. Please try again."
            : "Failed to create payroll bill. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/administrative-masters/paybill-master");
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  // =============  LOADING STATE ==============
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading payroll bill data...</p>
      </div>
    );
  }

  // =============  MAIN RENDER ==============
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/administrative-masters/paybill-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Payroll Bill" : "Add New Payroll Bill"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update payroll bill master information"
                : "Create a new payroll bill master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
              <FolderTree className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Payroll Bill Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* PayBill Code - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PayBill Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={codeInputRef}
                  type="text"
                  name="PayBill_Code"
                  value={formData.PayBill_Code}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleInputKeyDown(e, descriptionInputRef)}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.PayBill_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., PB001, SALARY001"
                  maxLength={20}
                />
                {formData.PayBill_Code && !errors.PayBill_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.PayBill_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {formData.PayBill_Code && (
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(formData.PayBill_Code)}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Copy code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.PayBill_Code ? (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.PayBill_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the payroll bill (required, alphanumeric, max
                  20 chars)
                </p>
              )}
            </div>

            {/* Description - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Description.length > 200
                      ? formData.Description.length >= 255
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Description.length}/255 characters
                </span>
              </div>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={descriptionInputRef}
                  type="text"
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                  onKeyDown={handleDescriptionKeyDown}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Description ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Monthly Salary, Bonus Payment"
                  maxLength={255}
                />
                {formData.Description && !errors.Description && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.Description && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Description ? (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Description}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Brief description of the payroll bill (optional, max 255
                  characters)
                </p>
              )}
            </div>

            {/* Ledger Selection - Hierarchical Dropdown like Department in reference */}
            <div ref={ledgerDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ledger <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <button
                  ref={ledgerButtonRef}
                  type="button"
                  onClick={() => setIsLedgerDropdownOpen(!isLedgerDropdownOpen)}
                  onKeyDown={handleLedgerKeyDown}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Lg_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                >
                  {formData.Lg_Id ? (
                    <span className="text-gray-900 font-mono whitespace-pre">
                      {getSelectedLedgerDisplay()}
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      {loadingLedgers
                        ? "Loading ledgers..."
                        : "Select a Ledger (Optional)"}
                    </span>
                  )}
                </button>
                {loadingLedgers ? (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setIsLedgerDropdownOpen(!isLedgerDropdownOpen)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}
                {errors.Lg_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Dropdown Menu - Hierarchical display with indentation */}
              {isLedgerDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={ledgerSearchRef}
                        type="text"
                        value={ledgerSearchTerm}
                        onChange={(e) => setLedgerSearchTerm(e.target.value)}
                        onKeyDown={handleLedgerSearchKeyDown}
                        placeholder="Search by name or code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        autoFocus
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

                  {/* Ledgers List - Hierarchical with indentation */}
                  <div className="overflow-y-auto max-h-64">
                    {filteredLedgers.length > 0 ? (
                      <>
                        {/* Option to clear selection */}
                        {formData.Lg_Id && (
                          <button
                            type="button"
                            onClick={() => handleLedgerSelect("")}
                            className="w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50 text-gray-600 focus:outline-none focus:bg-blue-50"
                          >
                            <div className="flex items-center">
                              <X className="h-4 w-4 mr-2" />
                              <span>Clear Selection</span>
                            </div>
                          </button>
                        )}
                        {filteredLedgers.map((ledger, idx) => {
                          const isSelected =
                            formData.Lg_Id &&
                            formData.Lg_Id == ledger.Lg_Id.toString();
                          const level = ledger.displayLevel || 0;

                          return (
                            <button
                              key={ledger.Lg_Id}
                              ref={(el) => {
                                if (el) ledgerItemRefs.current[idx] = el;
                              }}
                              type="button"
                              onClick={() => handleLedgerSelect(ledger.Lg_Id)}
                              onKeyDown={(e) => {
                                if (e.key == "ArrowDown") {
                                  e.preventDefault();
                                  const nextIndex = idx + 1;
                                  if (nextIndex < filteredLedgers.length) {
                                    setLedgerHighlightedIndex(nextIndex);
                                  }
                                } else if (e.key == "ArrowUp") {
                                  e.preventDefault();
                                  if (idx == 0) {
                                    setLedgerHighlightedIndex(-1);
                                    setTimeout(
                                      () => ledgerSearchRef.current?.focus(),
                                      0,
                                    );
                                  } else {
                                    setLedgerHighlightedIndex(idx - 1);
                                  }
                                } else if (e.key == "Enter") {
                                  e.preventDefault();
                                  handleLedgerSelect(ledger.Lg_Id);
                                }
                              }}
                              onMouseEnter={() =>
                                setLedgerHighlightedIndex(idx)
                              }
                              className={`w-full px-4 py-3 text-left border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                ledgerHighlightedIndex == idx
                                  ? "bg-blue-100"
                                  : isSelected
                                    ? "bg-blue-50 text-blue-600"
                                    : "hover:bg-gray-50"
                              }`}
                              tabIndex={ledgerHighlightedIndex == idx ? 0 : -1}
                            >
                              <div className="flex items-start">
                                <div className="flex-1">
                                  <div
                                    className={`font-mono whitespace-pre ${isSelected ? "text-blue-600" : "text-gray-900"}`}
                                  >
                                    {getLedgerIndentedName(ledger)}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap ml-4">
                                    {ledger.Lg_Eng_Name && (
                                      <span className="text-gray-400">
                                        {ledger.Lg_Eng_Name}
                                      </span>
                                    )}
                                    {level > 0 && (
                                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                                        Level {level}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-blue-600 ml-2" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </>
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
                      <span>{filteredLedgers.length} ledgers found</span>
                      {!ledgerSearchTerm && (
                        <span className="text-gray-400">
                          Showing hierarchical view
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {errors.Lg_Id && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Lg_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a ledger for this payroll bill (optional) - Hierarchical
                view with indentation
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0"></div>
          <div className="flex items-center space-x-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Payroll Bill" : "Create Payroll Bill"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditPayrollBill;
