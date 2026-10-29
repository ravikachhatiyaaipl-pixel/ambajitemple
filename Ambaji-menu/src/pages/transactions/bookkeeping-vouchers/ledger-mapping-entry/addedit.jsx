import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Loader,
  AlertCircle,
  ChevronDown,
  Search,
  XCircle,
  Check,
  Calendar,
  Building,
  FileText,
  Globe,
  Hash,
  Folder,
  PieChart,
  Gift,
  Tag,
  IndianRupee,
  Upload,
  File,
  Eye,
  X,
  CheckCircle,
  Plus 
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
});

/* ─────────────────────────────────────────────
   SearchableDropdown Component
───────────────────────────────────────────── */
const SearchableDropdown = ({
  label,
  required = false,
  value,
  options = [],
  getKey,
  getLabel,
  onSelect,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  loading: isLoading = false,
  error,
  disabled = false,
  icon: Icon,
  showHierarchy = false,
  getLevel = null,
  getIndent = null,
  renderItem = null,
  triggerRef = null,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);
  const internalTriggerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const filtered = options.filter((o) =>
    getLabel(o).toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find(
    (o) => String(getKey(o)) ==  String(value)
  );

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (open && highlightedIndex >= 0 && listRef.current) {
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
  }, [highlightedIndex, open]);

  const handleKeyDown = (e) => {
    if (e.key ==  "ArrowDown" || e.key ==  "ArrowUp" || e.key ==  "Enter") {
      e.preventDefault();
      if (!open && !disabled) {
        setOpen(true);
        setSearch("");
        setHighlightedIndex(-1);
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    } else if (e.key ==  "Escape") {
      e.preventDefault();
      if (open) {
        setOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key ==  "ArrowDown") {
      e.preventDefault();
      if (filtered.length > 0) {
        setHighlightedIndex(0);
        setTimeout(() => {
          if (itemRefs.current[0]) itemRefs.current[0].focus();
        }, 0);
      }
    } else if (e.key ==  "ArrowUp") {
      e.preventDefault();
    } else if (e.key ==  "Escape") {
      e.preventDefault();
      setOpen(false);
      setSearch("");
      setHighlightedIndex(-1);
    } else if (e.key ==  "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        const idx = highlightedIndex >= 0 ? highlightedIndex : 0;
        onSelect(filtered[idx]);
        setOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    }
  };

  const handleItemKeyDown = (e, item, idx) => {
    if (e.key ==  "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filtered.length) {
        setHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (itemRefs.current[nextIndex]) itemRefs.current[nextIndex].focus();
        }, 0);
      } else {
        setHighlightedIndex(-1);
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    } else if (e.key ==  "ArrowUp") {
      e.preventDefault();
      if (idx ==  0) {
        setHighlightedIndex(-1);
        setTimeout(() => searchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (itemRefs.current[prevIndex]) itemRefs.current[prevIndex].focus();
        }, 0);
      }
    } else if (e.key ==  "Enter") {
      e.preventDefault();
      onSelect(item);
      setOpen(false);
      setSearch("");
      setHighlightedIndex(-1);
    } else if (e.key ==  "Escape") {
      e.preventDefault();
      setOpen(false);
      setSearch("");
      setHighlightedIndex(-1);
    }
  };

  // Default render item — matches AddEditLedger level-wise hierarchy exactly
  const defaultRenderItem = (o, idx) => {
    const key = getKey(o);
    const isSel = String(key) == String(value);
    const level = showHierarchy && getLevel ? getLevel(o) : 1;
    const indent = showHierarchy && getIndent ? getIndent(o) : "";

    return (
      <button
        key={key}
        ref={(el) => (itemRefs.current[idx] = el)}
        type="button"
        onClick={() => {
          onSelect(o);
          setOpen(false);
          setSearch("");
          setHighlightedIndex(-1);
        }}
        onKeyDown={(e) => handleItemKeyDown(e, o, idx)}
        className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors focus:outline-none focus:bg-blue-50 ${
          highlightedIndex == idx
            ? "bg-blue-100"
            : isSel
            ? "bg-blue-50"
            : "hover:bg-gray-50"
        }`}
        tabIndex={0}
      >
        <div className="flex items-start">
          {showHierarchy && (
            <span className="inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium bg-gray-100 text-gray-700 mr-2 mt-0.5 flex-shrink-0">
              L{level}
            </span>
          )}
          <div className="flex-1">
            <div className={`font-medium ${isSel ? "text-blue-600" : "text-gray-900"}`}>
              {showHierarchy && (
                <span className="whitespace-pre">{indent}</span>
              )}
              {getLabel(o)}
            </div>
          </div>
          {isSel && <Check className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />}
        </div>
      </button>
    );
  };

  return (
    <div ref={wrapRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        ref={(el) => {
          internalTriggerRef.current = el;
          if (triggerRef) triggerRef.current = el;
        }}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className={`w-full px-3 py-2.5 border rounded-lg text-left flex items-center justify-between transition-colors text-sm
          ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "hover:border-blue-400"}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          <span className={selected ? "text-gray-900" : "text-gray-400"}>
            {isLoading
              ? "Loading..."
              : selected
              ? getLabel(selected)
              : placeholder}
          </span>
        </span>
        {isLoading ? (
          <Loader className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown
            className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full min-w-[260px] bg-white border border-gray-300 rounded-xl shadow-xl max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-2.5 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div ref={listRef} className="overflow-y-auto max-h-56">
            {filtered.length > 0 ? (
              filtered.map((o, idx) => renderItem ? renderItem(o, idx, { highlightedIndex, value, itemRefs, handleItemKeyDown }) : defaultRenderItem(o, idx))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                <Search className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                No items found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 rounded-b-xl text-xs text-gray-400">
            {filtered.length} item{filtered.length !=  1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const LedgerMappingAddEdit = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  /* ── masters ── */
  const [financialYears, setFinancialYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [budgetHeads, setBudgetHeads] = useState([]);
  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [grantTypes, setGrantTypes] = useState([]);
  const [mastersLoading, setMastersLoading] = useState(true);

  /* ── Form Data ── */
  const [formData, setFormData] = useState({
    Fin_Year: "",
    Dept_Id: "",
    Lg_Name: "",
    Lg_Eng_Name: "",
    Lg_Code: "",
    Gr_Id: "",
    Bh_Id: "",
    GT_Id: "",
    Lg_Sub: "no",
    Amount: "",
    Lg_Status: true,
  });

  /* ── Errors ── */
  const [errors, setErrors] = useState({});

  /* ── Documents ── */
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);
  const fileRef = useRef(null);

  /* ── Refs for Focus Management ── */
  const deptButtonRef = useRef(null);
  const ledgerNameRef = useRef(null);
  const ledgerEngNameRef = useRef(null);
  const ledgerCodeRef = useRef(null);
  const subLedgerRef = useRef(null);
  const groupButtonRef = useRef(null);
  const budgetHeadButtonRef = useRef(null);
  const grantTypeButtonRef = useRef(null);
  const amountRef = useRef(null);
  const statusToggleRef = useRef(null);
  const fileUploadAreaRef = useRef(null);
  const saveButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  /* ── Focus first field after load ── */
  useEffect(() => {
    if (!pageLoading && !isEdit && !mastersLoading) {
      setTimeout(() => ledgerNameRef.current?.focus(), 200);
    }
  }, [pageLoading, isEdit, mastersLoading]);

  /* ── Load masters ── */
  useEffect(() => {
    loadMasters();
  }, []);

  /* ── Load record when editing ── */
  useEffect(() => {
    if (isEdit) loadRecord();
  }, [id]);

  /* ── Load budget heads when department changes ── */
  useEffect(() => {
    if (formData.Dept_Id) {
      loadBudgetHeadsByDepartment(formData.Dept_Id);
    }
  }, [formData.Dept_Id]);

  const loadMasters = async () => {
    setMastersLoading(true);
    try {
      const results = await Promise.allSettled([
        axios.get(`${API_BASE}/fy-master`, authHeader()),
        axios.get(`${API_BASE}/dpt-master/all/lst-dpt-master`, authHeader()),
        axios.get(`${API_BASE}/lst-budget-head`, authHeader()),
        axios.get(`${API_BASE}/lst-ledg-grps`, authHeader()),
        axios.get(`${API_BASE}/grant-types/all`, authHeader()),
      ]);

      const pickData = (res) => {
        if (res.status !=  "fulfilled") return [];
        const d = res.value?.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.data?.data)) return d.data.data;
        return [];
      };

      // Financial Years - filter active/budget open
      const fYears = pickData(results[0]);
      const activeYears = fYears.filter(
        (fy) => fy.Status ==  "ACTIVE" && fy.is_budget_open ==  true
      );
      setFinancialYears(activeYears);

      // Set default financial year
      if (activeYears.length > 0 && !isEdit) {
        const currentFY = activeYears.find((fy) => fy.is_current_year ==  true);
        setFormData((prev) => ({
          ...prev,
          Fin_Year: currentFY?.FY_Id?.toString() || activeYears[0]?.FY_Id?.toString() || "",
        }));
      }

      setDepartments(pickData(results[1]));
      setBudgetHeads(pickData(results[2]));
      
      const groups = pickData(results[3]);
      const filteredGroups = Array.isArray(groups)
        ? groups.filter((g) => g.Gr_Buk ==  "N")
        : [];
      setLedgerGroups(filteredGroups);

      const grants = pickData(results[4]);
      const activeGrants = Array.isArray(grants)
        ? grants.filter((g) => g.Is_Active ==  true)
        : [];
      setGrantTypes(activeGrants);

    } catch (err) {
      console.error("Masters load error:", err);
      toast.error("Some dropdown data failed to load");
    } finally {
      setMastersLoading(false);
    }
  };

  const loadBudgetHeadsByDepartment = async (departmentId) => {
    if (!departmentId) return;
    try {
      const response = await axios.get(
        `${API_BASE}/grant-dept-map/by-department/${departmentId}`,
        authHeader()
      );
      if (response.data?.success && response.data?.data) {
        let deptBudgetHeads = [];
        if (Array.isArray(response.data.data)) {
          response.data.data.forEach((mapping) => {
            if (mapping.all_budget_heads && Array.isArray(mapping.all_budget_heads)) {
              deptBudgetHeads = [...deptBudgetHeads, ...mapping.all_budget_heads];
            }
          });
        }
        // Remove duplicates
        const unique = Array.from(
          new Map(deptBudgetHeads.map((h) => [h.Bh_Id, h])).values()
        );
        setBudgetHeads(unique);
      }
    } catch (error) {
      console.error("Error loading budget heads by department:", error);
    }
  };

  const loadRecord = async () => {
    setPageLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/combined-lgr-grt-bgt/${id}`, authHeader());
      if (!res.data?.success) throw new Error(res.data?.message || "Not found");
      const d = res.data.data;

      // New response shape: { ledger, budget_entries, grant_mappings, ... }
      const lg = d.ledger || d; // graceful fallback if old flat shape
      const entries = Array.isArray(d.budget_entries) ? d.budget_entries : [];
      const lgBhId = lg.Bh_Id;
      const mappingDeptId = d.grant_mappings?.[0]?.Dept_Id;

      // Find the entry matching ledger's budget head + grant_mapping's department
      const latestEntry = (() => {
        // Priority 1: is_latest + Bh_Id match + Dept_id match
        const s1 = entries.find(
          (e) => e.is_latest && e.Bh_Id == lgBhId && e.Dpt_id == mappingDeptId
        );
        if (s1) return s1;
        // Priority 2: is_latest + Bh_Id match only
        const s2 = entries.find((e) => e.is_latest && e.Bh_Id == lgBhId);
        if (s2) return s2;
        // Priority 3: Bh_Id + Dept_id match (not latest)
        const s3 = entries.find(
          (e) => e.Bh_Id == lgBhId && e.Dpt_id == mappingDeptId
        );
        if (s3) return s3;
        // Fallback
        return entries.find((e) => e.is_latest) || entries[0] || null;
      })();

      // Department: prefer the grant_mappings department, fallback to entry's dept
      const deptId =
        mappingDeptId ||
        latestEntry?.Dpt_id ||
        latestEntry?.department?.id ||
        lg.Dept_Id ||
        lg.Dpt_id ||
        "";

      setFormData({
        Fin_Year: latestEntry?.FY_Id?.toString() || lg.FY_Id?.toString() || "",
        Dept_Id:  String(deptId),
        Lg_Name:     lg.Lg_Name     || "",
        Lg_Eng_Name: lg.Lg_Eng_Name || "",
        Lg_Code:     lg.Lg_Code     || "",
        Gr_Id:  lg.Gr_Id?.toString() || "",
        Bh_Id:  lg.Bh_Id?.toString() || "",
        GT_Id:  lg.GT_Id?.toString() || "",
        Lg_Sub: lg.Lg_Sub?.toLowerCase() ==  "yes" ? "yes" : "no",
        Amount: latestEntry?.amount?.toString() || lg.amount?.toString() || "",
        Lg_Status: lg.Lg_Status !=  undefined ? lg.Lg_Status : true,
      });

      // Documents from latest budget entry
      const docs = latestEntry?.Beg_Doc || lg.Beg_Doc || [];
      if (Array.isArray(docs) && docs.length > 0) {
        setExistingDocs(docs);
      }

    } catch (err) {
      toast.error("Failed to load record");
      navigate("/transactions/bookkeeping-vouchers/ledger-mapping-entry");
    } finally {
      setPageLoading(false);
    }
  };

  /* ── Validation ── */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.Fin_Year) {
      newErrors.Fin_Year = "Financial year is required";
    }

    if (!formData.Dept_Id) {
      newErrors.Dept_Id = "Department is required";
    }

    if (!formData.Lg_Name?.trim()) {
      newErrors.Lg_Name = "Ledger name is required";
    } else if (formData.Lg_Name.length > 500) {
      newErrors.Lg_Name = "Ledger name must not exceed 500 characters";
    }

    if (formData.Lg_Eng_Name && formData.Lg_Eng_Name.length > 500) {
      newErrors.Lg_Eng_Name = "English name must not exceed 500 characters";
    }

    if (formData.Lg_Code && formData.Lg_Code.length > 50) {
      newErrors.Lg_Code = "Ledger code must not exceed 50 characters";
    }

    if (!formData.Gr_Id) {
      newErrors.Gr_Id = "Group is required";
    }

    if (!formData.Bh_Id) {
      newErrors.Bh_Id = "Budget head is required";
    }

    if (!formData.Amount) {
      newErrors.Amount = "Amount is required";
    } else if (parseFloat(formData.Amount) <= 0) {
      newErrors.Amount = "Amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length ==  0;
  };

  /* ── Generate Code Suggestions ── */
  const generateCodeSuggestions = () => {
    const name = formData.Lg_Name?.trim();
    if (!name) return [];

    const suggestions = [];
    const words = name.split(" ").filter((w) => w.length > 0);

    if (words.length ==  1) {
      const word = words[0];
      if (word.length >= 2) suggestions.push(word.substring(0, 2).toUpperCase());
      if (word.length >= 3) suggestions.push(word.substring(0, 3).toUpperCase());
      suggestions.push(word.substring(0, 2).toUpperCase() + "001");
      suggestions.push(word.substring(0, 3).toUpperCase() + "001");
    } else if (words.length >= 2) {
      const firstLetters = words.map((w) => w.charAt(0)).join("").toUpperCase();
      suggestions.push(firstLetters);
      if (words[0].length >= 2) {
        suggestions.push((words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase());
      }
      suggestions.push(firstLetters + "001");
    }

    return Array.from(new Set(suggestions));
  };

  const suggestions = generateCodeSuggestions();

  /* ── File Helpers ── */
  const fileToBase64 = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
    });

  const validateFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const maxSize = 10 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      toast.error(`File type not supported: ${file.type}`);
      return false;
    }
    if (file.size > maxSize) {
      toast.error(`File size too large. Max 10MB allowed.`);
      return false;
    }
    return true;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((f) => validateFile(f));
    if (validFiles.length ==  0) return;

    const processed = await Promise.all(
      validFiles.map(async (f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
        base64: await fileToBase64(f),
      }))
    );
    setUploadedFiles((prev) => [...prev, ...processed]);
    if (fileRef.current) fileRef.current.value = "";
    toast.success(`Added ${processed.length} file(s)`);
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !=  index));
  };

  const removeExistingDocument = (index) => {
    setExistingDocs((prev) => prev.filter((_, i) => i !=  index));
  };

  const previewDocument = (url) => {
    window.open(url, "_blank");
  };

  /* ── Form Handlers ── */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type ==  "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key ==  "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  /* ── Dropdown Display Helpers ── */
  // Department display - shows both Dpt_Desc and Dpt_Name like Budget Entry
  const getDepartmentDisplay = (dept) => {
    if (!dept) return "";
    const level = parseInt(dept.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = dept.Dpt_Desc || dept.Dpt_Name || "No Description";
    const name = dept.Dpt_Name;
    
    if (name && name !=  desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  const getDepartmentLevel = (dept) => parseInt(dept.GrStt, 10) || 1;
  const getDepartmentIndent = (dept) => "    ".repeat((parseInt(dept.GrStt, 10) || 1) - 1);

  // Custom render for Department with both Dpt_Desc and Dpt_Name
  const renderDepartmentItem = (dept, idx, { highlightedIndex, value, itemRefs, handleItemKeyDown }) => {
    const key = dept.Dpt_id;
    const isSel = String(key) ==  String(value);
    const level = parseInt(dept.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = dept.Dpt_Desc || dept.Dpt_Name || "No Description";
    const name = dept.Dpt_Name;

    const levelColors = {
      1: "bg-blue-100 text-blue-600",
      2: "bg-green-100 text-green-600",
      3: "bg-amber-100 text-amber-600",
      4: "bg-purple-100 text-purple-600",
    };
    const colorClass = levelColors[level] || "bg-gray-100 text-gray-600";

    return (
      <button
        key={key}
        ref={(el) => (itemRefs.current[idx] = el)}
        type="button"
        onClick={() => {
          onSelect(dept);
          setOpen(false);
          setSearch("");
          setHighlightedIndex(-1);
        }}
        onKeyDown={(e) => handleItemKeyDown(e, dept, idx)}
        className={`w-full px-4 py-2.5 text-left border-b border-gray-50 last:border-0 transition-colors
          ${highlightedIndex ==  idx ? "bg-blue-100" : ""}
          ${isSel ? "bg-blue-50" : "hover:bg-gray-50"}`}
        tabIndex={0}
      >
        <div className="flex items-start">
          <span
            className={`inline-flex items-center justify-center w-6 h-5 rounded text-xs font-medium ${colorClass} flex-shrink-0 mr-2 mt-0.5`}
          >
            L{level}
          </span>
          <div className="flex-1">
            <div
              className={`text-sm font-medium ${isSel ? "text-blue-700" : "text-gray-900"}`}
              style={{ marginLeft: `${(level - 1) * 20}px` }}
            >
              <span className="whitespace-pre">{indent}</span>
              {desc}
            </div>
            {name && name !=  desc && (
              <div
                className="text-xs text-gray-500 mt-0.5"
                style={{ marginLeft: `${(level - 1) * 20}px` }}
              >
                <span className="whitespace-pre">{indent}</span>
                {name}
              </div>
            )}
          </div>
          {isSel && <Check className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0 mt-1" />}
        </div>
      </button>
    );
  };

  // Budget Head display — plain name only (indent handled by dropdown renderer)
  const getBudgetHeadDisplay = (head) => {
    if (!head) return "";
    return head.Gr_Nm || head.Bh_Name || "No Name";
  };

  const getBudgetHeadLevel = (head) => parseInt(head.Gr_St, 10) || 1;
  const getBudgetHeadIndent = (head) => "    ".repeat((parseInt(head.Gr_St, 10) || 1) - 1);

  // Group display with hierarchy — plain name only (indent handled by dropdown renderer)
  const getGroupDisplay = (group) => {
    if (!group) return "";
    return group.Gr_Nm || group.Gr_Name || "No Name";
  };

  const getGroupLevel = (group) => parseInt(group.Gr_St, 10) || 1;
  const getGroupIndent = (group) => "    ".repeat((parseInt(group.Gr_St, 10) || 1) - 1);

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
        // Focus the field with error
        if (firstErrorKey ==  "Fin_Year") {
          // Focus financial year dropdown
        } else if (firstErrorKey ==  "Dept_Id") {
          // Focus department dropdown
        } else if (firstErrorKey ==  "Lg_Name") {
          ledgerNameRef.current?.focus();
        } else if (firstErrorKey ==  "Lg_Eng_Name") {
          ledgerEngNameRef.current?.focus();
        } else if (firstErrorKey ==  "Lg_Code") {
          ledgerCodeRef.current?.focus();
        } else if (firstErrorKey ==  "Gr_Id") {
          groupButtonRef.current?.focus();
        } else if (firstErrorKey ==  "Bh_Id") {
          budgetHeadButtonRef.current?.focus();
        } else if (firstErrorKey ==  "Amount") {
          amountRef.current?.focus();
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEdit ? "Update Record?" : "Create New Record?",
      text: isEdit
        ? "Are you sure you want to update this combined ledger/grant/budget record?"
        : "Are you sure you want to create this combined record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: isEdit ? "Yes, update!" : "Yes, create!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const payload = {
        Fin_Year: parseInt(formData.Fin_Year),
        Dept_Id: parseInt(formData.Dept_Id),
        Lg_Name: formData.Lg_Name.trim(),
        Lg_Eng_Name: formData.Lg_Eng_Name?.trim() || null,
        Lg_Code: formData.Lg_Code?.trim().toUpperCase() || null,
        Gr_Id: parseInt(formData.Gr_Id),
        Bh_Id: parseInt(formData.Bh_Id),
        GT_Id: formData.GT_Id ? parseInt(formData.GT_Id) : null,
        Lg_Sub: formData.Lg_Sub ==  "yes" ? "yes" : "no",
        Amount: parseFloat(formData.Amount),
        Lg_Status: formData.Lg_Status,
      };

      // Add documents if any
      if (uploadedFiles.length > 0) {
        payload.Beg_Doc = uploadedFiles.map((f) => f.base64);
        payload.Beg_Doc_description = uploadedFiles.map((f) => f.name);
      }

      let response;
      if (isEdit) {
        response = await axios.put(`${API_BASE}/combined-lgr-grt-bgt/${id}`, payload, authHeader());
      } else {
        response = await axios.post(`${API_BASE}/combined-lgr-grt-bgt`, payload, authHeader());
      }

      if (response.data?.success) {
        toast.success(isEdit ? "Record updated successfully!" : "Record created successfully!");
        setTimeout(() => {
          navigate("/transactions/bookkeeping-vouchers/ledger-mapping-entry");
        }, 1500);
      } else {
        const msg = response.data?.errors
          ? Object.values(response.data.errors).flat().join(", ")
          : response.data?.message || "Operation failed";
        toast.error(msg);
      }
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
        toast.error(Object.values(fieldErrors)[0]);
      } else {
        toast.error(error.response?.data?.message || "Operation failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/bookkeeping-vouchers/ledger-mapping-entry");
  };

  /* ── Loading State ── */
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading record...</p>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="bg-gray-100 p-3">
      <form onSubmit={handleSubmit} noValidate>

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/transactions/bookkeeping-vouchers/ledger-mapping-entry")}
              className="flex items-center px-2.5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-serif font-semibold text-gray-800">
                {isEdit ? "Edit" : "Create"} Ledger / Grant / Budget Entry
              </h1>
              <p className="text-xs text-gray-500">
                {isEdit
                  ? "Update combined ledger, grant, and budget record"
                  : "Create a new combined ledger, grant, and budget record"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 space-y-4">

            {/* ── Financial Details + Ledger Details — combined row ── */}
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center mb-3">
                <div className="h-6 w-6 rounded-md bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mr-2">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Financial & Ledger Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Financial Year */}
                <SearchableDropdown
                  label="Financial Year"
                  required
                  value={formData.Fin_Year}
                  options={financialYears}
                  getKey={(o) => o.FY_Id}
                  getLabel={(o) => o.FY_Name || o.FY_Code || `FY ${o.FY_Id}`}
                  placeholder="Select financial year..."
                  searchPlaceholder="Search financial years..."
                  loading={mastersLoading}
                  error={errors.Fin_Year}
                  icon={Calendar}
                  onSelect={(o) => {
                    setFormData((prev) => ({ ...prev, Fin_Year: String(o.FY_Id) }));
                    setErrors((prev) => ({ ...prev, Fin_Year: "" }));
                    setTimeout(() => deptButtonRef.current?.focus(), 150);
                  }}
                />

                {/* Department */}
                <SearchableDropdown
                  label="Department"
                  required
                  value={formData.Dept_Id}
                  options={departments}
                  getKey={(o) => o.Dpt_id}
                  getLabel={getDepartmentDisplay}
                  placeholder="Select department..."
                  searchPlaceholder="Search departments..."
                  loading={mastersLoading}
                  error={errors.Dept_Id}
                  icon={Building}
                  showHierarchy
                  getLevel={getDepartmentLevel}
                  getIndent={getDepartmentIndent}
                  renderItem={renderDepartmentItem}
                  triggerRef={deptButtonRef}
                  onSelect={(o) => {
                    setFormData((prev) => ({ ...prev, Dept_Id: String(o.Dpt_id), Bh_Id: "" }));
                    setErrors((prev) => ({ ...prev, Dept_Id: "", Bh_Id: "" }));
                    setTimeout(() => ledgerNameRef.current?.focus(), 150);
                  }}
                />

                {/* Ledger Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ledger Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={ledgerNameRef}
                    type="text"
                    name="Lg_Name"
                    value={formData.Lg_Name}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, ledgerEngNameRef)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.Lg_Name ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                    placeholder="e.g., Cash Account"
                    maxLength={500}
                  />
                  {errors.Lg_Name && (
                    <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{errors.Lg_Name}
                    </p>
                  )}
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">English Name</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={ledgerEngNameRef}
                      type="text"
                      name="Lg_Eng_Name"
                      value={formData.Lg_Eng_Name}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, ledgerCodeRef)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="English name (optional)"
                      maxLength={500}
                    />
                  </div>
                </div>

                {/* Ledger Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ledger Code</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={ledgerCodeRef}
                      type="text"
                      name="Lg_Code"
                      value={formData.Lg_Code}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, subLedgerRef)}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${errors.Lg_Code ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                      placeholder="e.g., CASH001 (optional)"
                      maxLength={50}
                    />
                  </div>
                  {suggestions.length > 0 && !isEdit && (
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      <span className="text-xs text-gray-400">Suggestions:</span>
                      {suggestions.map((s, i) => (
                        <button key={i} type="button"
                          onClick={() => { setFormData((p) => ({ ...p, Lg_Code: s })); setTimeout(() => groupButtonRef.current?.focus(), 100); }}
                          className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >{s}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub Ledger */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub Ledger</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      ref={subLedgerRef}
                      name="Lg_Sub"
                      value={formData.Lg_Sub}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, groupButtonRef)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mapping Details ── */}
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center mb-3">
                <div className="h-6 w-6 rounded-md bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-2">
                  <Folder className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Mapping Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Group */}
                <SearchableDropdown
                  label="Group"
                  required
                  value={formData.Gr_Id}
                  options={ledgerGroups}
                  getKey={(o) => o.Gr_Id}
                  getLabel={getGroupDisplay}
                  placeholder="Select group..."
                  searchPlaceholder="Search groups..."
                  loading={mastersLoading}
                  error={errors.Gr_Id}
                  icon={Folder}
                  showHierarchy
                  getLevel={getGroupLevel}
                  getIndent={getGroupIndent}
                  triggerRef={groupButtonRef}
                  onSelect={(o) => {
                    setFormData((prev) => ({ ...prev, Gr_Id: String(o.Gr_Id) }));
                    setErrors((prev) => ({ ...prev, Gr_Id: "" }));
                    setTimeout(() => budgetHeadButtonRef.current?.focus(), 150);
                  }}
                />

                {/* Budget Head */}
                <SearchableDropdown
                  label="Budget Head"
                  required
                  value={formData.Bh_Id}
                  options={budgetHeads}
                  getKey={(o) => o.Bh_Id}
                  getLabel={getBudgetHeadDisplay}
                  placeholder={formData.Dept_Id ? "Select budget head..." : "Select department first"}
                  searchPlaceholder="Search budget heads..."
                  loading={mastersLoading}
                  error={errors.Bh_Id}
                  icon={PieChart}
                  showHierarchy
                  getLevel={getBudgetHeadLevel}
                  getIndent={getBudgetHeadIndent}
                  disabled={!formData.Dept_Id}
                  triggerRef={budgetHeadButtonRef}
                  onSelect={(o) => {
                    setFormData((prev) => ({ ...prev, Bh_Id: String(o.Bh_Id) }));
                    setErrors((prev) => ({ ...prev, Bh_Id: "" }));
                    setTimeout(() => grantTypeButtonRef.current?.focus(), 150);
                  }}
                />

                {/* Grant Type */}
                <SearchableDropdown
                  label="Grant Type"
                  value={formData.GT_Id}
                  options={grantTypes}
                  getKey={(o) => o.GT_Id}
                  getLabel={(o) => o.GT_Name || `Grant ${o.GT_Id}`}
                  placeholder="Select grant type (optional)..."
                  searchPlaceholder="Search grant types..."
                  loading={mastersLoading}
                  error={errors.GT_Id}
                  icon={Gift}
                  triggerRef={grantTypeButtonRef}
                  onSelect={(o) => {
                    setFormData((prev) => ({ ...prev, GT_Id: String(o.GT_Id) }));
                    setErrors((prev) => ({ ...prev, GT_Id: "" }));
                    setTimeout(() => amountRef.current?.focus(), 150);
                  }}
                />
              </div>
            </div>

            {/* ── Budget & Status ── */}
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center mb-3">
                <div className="h-6 w-6 rounded-md bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-2">
                  <IndianRupee className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Budget & Status</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={amountRef}
                      type="number"
                      name="Amount"
                      value={formData.Amount}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleEnterKey(e, fileUploadAreaRef)}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${errors.Amount ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.Amount && (
                    <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{errors.Amount}
                    </p>
                  )}
                </div>

                {/* Status Toggle */}
                <div ref={statusToggleRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, Lg_Status: !prev.Lg_Status }))}
                      onKeyDown={(e) => {
                        if (e.key ==  "Enter") {
                          e.preventDefault();
                          setFormData((prev) => ({ ...prev, Lg_Status: !prev.Lg_Status }));
                        } else if (e.key ==  "Tab" && !e.shiftKey) {
                          e.preventDefault();
                          saveButtonRef.current?.focus();
                        }
                      }}
                      className={`relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${formData.Lg_Status ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <span className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm
                        ${formData.Lg_Status ? "translate-x-5" : ""}`} />
                    </button>
                    <span className={`text-sm font-medium ${formData.Lg_Status ? "text-green-600" : "text-gray-500"}`}>
                      {formData.Lg_Status
                        ? <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" />Active</span>
                        : <span className="flex items-center gap-1"><XCircle className="h-4 w-4" />Inactive</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Documents ── */}
            <div>
              <div className="flex items-center mb-3">
                <div className="h-6 w-6 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-2">
                  <Upload className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800">Documents <span className="text-xs font-normal text-gray-400">(optional, max 10MB each)</span></h2>
              </div>

              <input ref={fileRef} type="file" multiple onChange={handleFileSelect} className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx" />

              {/* Compact upload zone */}
              <div
                ref={fileUploadAreaRef}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer flex items-center justify-center gap-3
                  ${errors.Beg_Doc ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => { if (e.key ==  "Enter") { e.preventDefault(); fileRef.current?.click(); } }}
                tabIndex={0}
                role="button"
              >
                <Upload className={`h-6 w-6 flex-shrink-0 ${errors.Beg_Doc ? "text-red-400" : "text-gray-400"}`} />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">Click or drop files to upload</p>
                  <p className="text-xs text-gray-400">PDF, JPG, PNG, DOC, DOCX, XLS, XLSX</p>
                </div>
                <button type="button"
                  className="ml-auto px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-xs whitespace-nowrap">
                  <Plus className="h-3.5 w-3.5 mr-1" />Select Files
                </button>
              </div>

              {/* Existing docs */}
              {existingDocs.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Existing</p>
                  {existingDocs.map((doc, i) => (
                    <div key={`ex-${i}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                      <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="flex-1 truncate text-gray-700">{doc.name || `Document ${i + 1}`}</span>
                      <div className="flex gap-1">
                        {doc.url && <button type="button" onClick={() => previewDocument(doc.url)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="h-3.5 w-3.5" /></button>}
                        <button type="button" onClick={() => removeExistingDocument(i)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New Files</p>
                  {uploadedFiles.map((file, i) => (
                    <div key={`nf-${i}`} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                      <File className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span className="flex-1 truncate text-gray-700">{file.name}</span>
                      <button type="button" onClick={() => removeUploadedFile(i)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            <span className="text-red-500">*</span> required fields
          </p>
          <div className="flex items-center gap-2">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              onKeyDown={(e) => {
                if (e.key ==  "Enter") { e.preventDefault(); handleCancel(); }
                else if (e.key ==  "Tab" && !e.shiftKey) { e.preventDefault(); saveButtonRef.current?.focus(); }
              }}
              className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors text-sm font-medium"
            >
              <X className="h-4 w-4 mr-1.5" />Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving || mastersLoading}
              onKeyDown={(e) => {
                if (e.key ==  "Enter") { e.preventDefault(); handleSubmit(e); }
                else if (e.key ==  "Tab" && e.shiftKey) { e.preventDefault(); cancelButtonRef.current?.focus(); }
              }}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm font-medium"
            >
              {saving ? (
                <><Loader className="h-4 w-4 mr-1.5 animate-spin" />{isEdit ? "Updating..." : "Creating..."}</>
              ) : (
                <><Save className="h-4 w-4 mr-1.5" />{isEdit ? "Update Record" : "Create Record"}</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LedgerMappingAddEdit;