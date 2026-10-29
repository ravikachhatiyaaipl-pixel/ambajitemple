// src/pages/Finance/BudgetManagement/BudgetInitialEntry/AddEdit.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  Building,
  FileText,
  IndianRupee,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  Lock,
  AlertTriangle,
  Plus,
  ChevronRight,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  XCircle,
  FileCheck,
  Upload,
  File,
  X as XIcon,
  Paperclip,
  Eye,
  Search,
  ChevronUp,
  Loader,
  PieChart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import budgetEntryApi from "../../../services/budgetentryapi";

// =============  SEARCHABLE DROPDOWN COMPONENT ==============
const SearchableDropdown = ({
  label,
  value,
  error,
  required = false,
  icon: Icon,
  isOpen,
  setIsOpen,
  searchTerm,
  setSearchTerm,
  items,
  filteredItems,
  highlightedIndex,
  onSelect,
  onKeyDown,
  onSearchKeyDown,
  onItemKeyDown,
  getDisplay,
  getSelectedDisplay,
  loading,
  placeholder,
  searchPlaceholder,
  buttonRef,
  dropdownRef,
  searchRef,
  itemRefs,
  listRef,
  getId = (item) => item?.id,
  disabled = false,
  renderItem,
  showAsText = false,
  lockedValue = "",
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  if (showAsText) {
    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          )}
          <div
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700`}
          >
            {lockedValue || "Auto-filled"}
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Auto-filled from selection (non-editable)
        </p>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        )}

        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={!disabled ? onKeyDown : undefined}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${
            error ? "border-red-300" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          } transition-colors`}
        >
          {value ? (
            <span className="text-gray-900">{getSelectedDisplay()}</span>
          ) : (
            <span className="text-gray-500">
              {loading ? `Loading ${label.toLowerCase()}...` : placeholder}
            </span>
          )}
        </button>

        {loading ? (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          !disabled && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )
        )}

        {error && (
          <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "300px" }}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId =
                  item?.Bh_Id ||
                  item?.bh_id ||
                  item?.Dpt_id ||
                  item?.FY_Id ||
                  `item-${idx}`;

                return (
                  <button
                    key={itemId}
                    ref={(el) => {
                      if (el && itemRefs.current) {
                        itemRefs.current[idx] = el;
                      }
                    }}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                    }}
                    onKeyDown={(e) => onItemKeyDown(e, idx, item)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                      highlightedIndex == idx
                        ? "bg-blue-100"
                        : value && itemId && value == itemId.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    {renderItem ? renderItem(item) : getDisplay(item)}
                    {value && itemId && value == itemId.toString() && (
                      <div className="text-xs text-blue-600 mt-1 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No items found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} items found</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

const AddEditBudgetEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [budgetHeadsLoading, setBudgetHeadsLoading] = useState(false);
  const [noCurrentYear, setNoCurrentYear] = useState(false);
  const [showFinancialYearDropdown, setShowFinancialYearDropdown] =
    useState(false);
  const [fncId, setFncId] = useState(null);

  // New state for file uploads
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const fileInputRef = useRef(null);

  // Dropdown data
  const [financialYears, setFinancialYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [budgetHeads, setBudgetHeads] = useState([]);
  const [filteredBudgetHeads, setFilteredBudgetHeads] = useState([]);

  // =============  DEPARTMENT DROPDOWN STATES ==============
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptButtonRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);

  // Budget Head dropdown states
  const [isBudgetHeadDropdownOpen, setIsBudgetHeadDropdownOpen] =
    useState(false);
  const [budgetHeadSearchTerm, setBudgetHeadSearchTerm] = useState("");
  const [budgetHeadHighlightedIndex, setBudgetHeadHighlightedIndex] =
    useState(-1);
  const budgetHeadDropdownRef = useRef(null);
  const budgetHeadSearchRef = useRef(null);
  const budgetHeadButtonRef = useRef(null);
  const budgetHeadItemRefs = useRef([]);
  const budgetHeadListRef = useRef(null);

  // Refs for focus management
  const amountRef = useRef(null);
  const saveButtonRef = useRef(null);

  // Form state - Updated to use Bh_Id instead of Ledg_ID
  const [formData, setFormData] = useState({
    Fin_Year: "",
    Dept_Id: "",
    Bh_Id: "",
    Amount: "",
    Status: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Status options
  const statusOptions = [
    {
      value: "D",
      label: "Draft",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "R",
      label: "Revised",
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "P",
      label: "Approve",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "F",
      label: "Freeze",
      icon: Shield,
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "RJ",
      label: "Reject",
      icon: XCircle,
      color: "bg-red-100 text-red-800",
    },
    {
      value: "J",
      label: "Justification",
      icon: FileCheck,
      color: "bg-amber-100 text-amber-800",
    },
    {
      value: "A",
      label: "Active",
      icon: CheckCircle,
      color: "bg-teal-100 text-teal-800",
    },
    {
      value: "I",
      label: "Inactive",
      icon: Clock,
      color: "bg-gray-100 text-gray-800",
    },
    {
      value: "RR",
      label: "Re-Revised",
      icon: TrendingUp,
      color: "bg-cyan-100 text-cyan-800",
    },
  ];

  // Load Fnc_Id from menu details on component mount
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/budget-management/budgetinitialentry";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Id) {
        setFncId(currentMenuItem.Fnc_Id);
        console.log("Fnc_Id loaded:", currentMenuItem.Fnc_Id);
      } else {
        console.warn("Fnc_Id not found in menu details for path:", currentPath);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // =============  BUILD TREE STRUCTURE FOR DEPARTMENTS ==============
  const buildDepartmentTree = (depts) => {
    const map = {};
    const roots = [];

    depts.forEach((dept) => {
      map[dept.id || dept.Dpt_id] = {
        ...dept,
        children: [],
        Dpt_id: dept.id || dept.Dpt_id,
        Dpt_Name: dept.name || dept.Dpt_Name,
        Dpt_Desc: dept.desc || dept.Dpt_Desc,
        GrStt: dept.group_stt || dept.GrStt,
        GrCod: dept.group_code || dept.GrCod,
        UpGrp: dept.up_group || dept.UpGrp,
      };
    });

    depts.forEach((dept) => {
      const deptId = dept.id || dept.Dpt_id;
      const upGroup = dept.up_group || dept.UpGrp;
      const currentDept = map[deptId];

      if (currentDept && upGroup && map[upGroup] && upGroup != deptId) {
        map[upGroup].children.push(currentDept);
      } else if (currentDept) {
        roots.push(currentDept);
      }
    });

    return roots;
  };

  // =============  FLATTEN TREE FOR DISPLAY ==============
  const flattenTree = (nodes, level = 1, result = []) => {
    nodes.forEach((node) => {
      result.push({ ...node, treeLevel: level });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1, result);
      }
    });
    return result;
  };

  // =============  CLICK OUTSIDE HANDLER ==============
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(event.target)
      ) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDeptSearchTerm("");
      }
      if (
        budgetHeadDropdownRef.current &&
        !budgetHeadDropdownRef.current.contains(event.target)
      ) {
        setIsBudgetHeadDropdownOpen(false);
        setBudgetHeadHighlightedIndex(-1);
        setBudgetHeadSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =============  FOCUS SEARCH WHEN DROPDOWN OPENS ==============
  useEffect(() => {
    if (isDeptDropdownOpen && deptSearchRef.current) {
      setTimeout(() => deptSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen]);

  useEffect(() => {
    if (isBudgetHeadDropdownOpen && budgetHeadSearchRef.current) {
      setTimeout(() => budgetHeadSearchRef.current.focus(), 0);
    }
  }, [isBudgetHeadDropdownOpen]);

  // =============  SCROLL HIGHLIGHTED ITEM INTO VIEW ==============
  useEffect(() => {
    if (
      isDeptDropdownOpen &&
      deptHighlightedIndex >= 0 &&
      deptListRef.current
    ) {
      const container = deptListRef.current;
      const item = deptItemRefs.current[deptHighlightedIndex];
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
  }, [deptHighlightedIndex, isDeptDropdownOpen]);

  useEffect(() => {
    if (
      isBudgetHeadDropdownOpen &&
      budgetHeadHighlightedIndex >= 0 &&
      budgetHeadListRef.current
    ) {
      const container = budgetHeadListRef.current;
      const item = budgetHeadItemRefs.current[budgetHeadHighlightedIndex];
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
  }, [budgetHeadHighlightedIndex, isBudgetHeadDropdownOpen]);

  // =============  FILTER DEPARTMENTS ==============
  useEffect(() => {
    if (!departments.length) return;

    const tree = buildDepartmentTree(departments);
    const flattened = flattenTree(tree);
    setFlattenedDepartments(flattened);

    if (!deptSearchTerm.trim()) {
      setFilteredDepartments(flattened);
    } else {
      const term = deptSearchTerm.toLowerCase();
      const filtered = flattened.filter(
        (dept) =>
          (dept.Dpt_Desc?.toLowerCase() || "").includes(term) ||
          (dept.Dpt_Name?.toLowerCase() || "").includes(term) ||
          (dept.GrCod?.toLowerCase() || "").includes(term),
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, departments]);

  // =============  FILTER BUDGET HEADS ==============
  useEffect(() => {
    if (!budgetHeads.length) return;

    if (!budgetHeadSearchTerm.trim()) {
      setFilteredBudgetHeads(budgetHeads);
    } else {
      const term = budgetHeadSearchTerm.toLowerCase();
      setFilteredBudgetHeads(
        budgetHeads.filter(
          (head) =>
            (head.Gr_Nm?.toLowerCase() || "").includes(term) ||
            (head.Gr_Cd?.toLowerCase() || "").includes(term),
        ),
      );
    }
    setBudgetHeadHighlightedIndex(-1);
  }, [budgetHeadSearchTerm, budgetHeads]);

  // Initial load of dropdowns
  useEffect(() => {
    loadDropdowns();
  }, []);

  // Load budget data when in edit mode
  useEffect(() => {
    if (id && id != "create" && id != "add") {
      setIsEditMode(true);
      loadBudgetEntryData();
    }
  }, [id]);

  // Load budget heads when department changes
  useEffect(() => {
    if (formData.Dept_Id && formData.Dept_Id != "" && formData.Dept_Id != "0") {
      loadBudgetHeadsByDepartment(formData.Dept_Id);
    } else {
      setBudgetHeads([]);
      setFilteredBudgetHeads([]);
    }
  }, [formData.Dept_Id]);

  // Function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to validate file
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
      toast.error(
        `File size too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Max 10MB allowed.`,
      );
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);

    if (uploadedFiles.length + files.length > 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    const validFiles = files.filter((file) => validateFile(file));

    if (validFiles.length == 0) return;

    setUploadingFiles(true);

    try {
      const newFiles = await Promise.all(
        validFiles.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            base64: base64,
            file: file,
          };
        }),
      );

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      toast.success(`Added ${newFiles.length} file(s)`);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error converting files:", error);
      toast.error("Failed to process files");
    } finally {
      setUploadingFiles(false);
    }
  };

  // Remove uploaded file
  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i != index));
  };

  // Remove existing document
  const removeExistingDocument = (index) => {
    setExistingDocuments((prev) => prev.filter((_, i) => i != index));
  };

  // Preview document
  const previewDocument = (url) => {
    window.open(url, "_blank");
  };

  const loadDropdowns = async () => {
    setDropdownLoading(true);
    setNoCurrentYear(false);
    try {
      const [fyResponse, deptResponse] = await Promise.all([
        budgetEntryApi.getFinancialYears(),
        budgetEntryApi.getMainDepartments(),
      ]);

      if (fyResponse.success) {
        const activeYears = (fyResponse.data || []).filter(
          (fy) => fy.Status == "ACTIVE",
        );
        setFinancialYears(activeYears);

        const currentFY = activeYears.find((fy) => fy.is_current_year == true);
        const budgetOpenYears = activeYears.filter(
          (fy) => fy.is_budget_open == true,
        );
        setAvailableYears(budgetOpenYears);

        if (currentFY) {
          setCurrentYear(currentFY);
          // Only set default if not in edit mode
          if (!id || id == "create" || id == "add") {
            if (currentFY.is_budget_open) {
              setFormData((prev) => ({
                ...prev,
                Fin_Year: currentFY.FY_Id?.toString() || "",
              }));
            } else {
              if (budgetOpenYears.length > 0) {
                setFormData((prev) => ({
                  ...prev,
                  Fin_Year: budgetOpenYears[0].FY_Id?.toString() || "",
                }));
              } else {
                setNoCurrentYear(true);
              }
            }
          }
        } else {
          setNoCurrentYear(true);
        }

        if (budgetOpenYears.length == 0) {
          setNoCurrentYear(true);
        }
      }

      if (deptResponse.success) {
        const activeDepartments = (deptResponse.data || []).filter(
          (dept) =>
            dept.is_visible == 1 ||
            dept.is_visible == "1" ||
            dept.isvisible == 1 ||
            dept.isvisible == "1",
        );
        setDepartments(activeDepartments);
      }
    } catch (error) {
      console.error("Failed to load dropdowns:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setDropdownLoading(false);
    }
  };

  const loadBudgetEntryData = async () => {
    setLoading(true);
    try {
      const response = await budgetEntryApi.getById(id);
      if (response.success && response.data) {
        const entryData = response.data;

        console.log("📥 Loading budget entry data:", entryData);

        // Set form data - Updated to use Bh_Id
        setFormData({
          Fin_Year: entryData.FY_Id?.toString() || "",
          Dept_Id: entryData.Dpt_id?.toString() || "",
          Bh_Id: entryData.Bh_Id?.toString() || "",
          Amount: entryData.amount?.toString() || "",
          Status: entryData.status || "",
        });

        // Set existing documents
        if (
          entryData.Beg_Doc &&
          Array.isArray(entryData.Beg_Doc) &&
          entryData.Beg_Doc.length > 0
        ) {
          setExistingDocuments(entryData.Beg_Doc);
        }

        // Set showFinancialYearDropdown to true to display the selected year
        setShowFinancialYearDropdown(true);

        // Load budget heads for the department if department exists
        if (entryData.Dpt_id) {
          await loadBudgetHeadsByDepartment(entryData.Dpt_id.toString());
        }
      } else {
        toast.error("Failed to load budget entry data!");
        navigate("/transactions/budget-management/budgetinitialentry");
      }
    } catch (error) {
      console.error("❌ Error loading budget entry:", error);
      toast.error("Failed to load budget entry data!");
      navigate("/transactions/budget-management/budgetinitialentry");
    } finally {
      setLoading(false);
    }
  };

  const loadBudgetHeadsByDepartment = async (departmentId) => {
    if (!departmentId || departmentId == "" || departmentId == "0") {
      setBudgetHeads([]);
      setFilteredBudgetHeads([]);
      return;
    }

    setBudgetHeadsLoading(true);
    try {
      const response =
        await budgetEntryApi.getBudgetHeadsByDepartment(departmentId);

      if (response.success && response.data) {
        // Extract all budget heads from the mappings
        let departmentBudgetHeads = [];

        if (Array.isArray(response.data)) {
          response.data.forEach((mapping) => {
            if (
              mapping.all_budget_heads &&
              Array.isArray(mapping.all_budget_heads)
            ) {
              departmentBudgetHeads = [
                ...departmentBudgetHeads,
                ...mapping.all_budget_heads,
              ];
            }
          });
        }

        // Remove duplicates based on Bh_Id
        const uniqueBudgetHeads = Array.from(
          new Map(
            departmentBudgetHeads.map((head) => [head.Bh_Id, head]),
          ).values(),
        );

        // Sort by Gr_Cd
        const sortedBudgetHeads = uniqueBudgetHeads.sort((a, b) =>
          (a.Gr_Cd || "").localeCompare(b.Gr_Cd || ""),
        );

        setBudgetHeads(sortedBudgetHeads);
        setFilteredBudgetHeads(sortedBudgetHeads);
      } else {
        setBudgetHeads([]);
        setFilteredBudgetHeads([]);
      }
    } catch (error) {
      console.error(
        `Error fetching budget heads for department ${departmentId}:`,
        error,
      );
      setBudgetHeads([]);
      setFilteredBudgetHeads([]);
    } finally {
      setBudgetHeadsLoading(false);
    }
  };

  // =============  DEPARTMENT SELECT HANDLER ==============
  const handleDepartmentSelect = (dept) => {
    if (dept && (dept.Dpt_id || dept.id)) {
      const deptId = (dept.Dpt_id || dept.id).toString();
      console.log("🎯 Department selected:", deptId);
      setFormData((prev) => ({
        ...prev,
        Dept_Id: deptId,
        Bh_Id: "", // Clear budget head when department changes
      }));
      setIsDeptDropdownOpen(false);
      setDeptSearchTerm("");
      setDeptHighlightedIndex(-1);

      if (errors.Dept_Id) {
        setErrors((prev) => ({ ...prev, Dept_Id: "" }));
      }

      loadBudgetHeadsByDepartment(deptId);

      setTimeout(() => {
        if (budgetHeadButtonRef.current) {
          budgetHeadButtonRef.current.focus();
        }
      }, 100);
    }
  };

  // =============  BUDGET HEAD SELECT HANDLER ==============
  const handleBudgetHeadSelect = (head) => {
    if (head && head.Bh_Id) {
      const headId = head.Bh_Id.toString();
      console.log("🎯 Budget Head selected:", headId, head.Gr_Nm);
      setFormData((prev) => ({
        ...prev,
        Bh_Id: headId,
      }));
      setIsBudgetHeadDropdownOpen(false);
      setBudgetHeadSearchTerm("");
      setBudgetHeadHighlightedIndex(-1);

      if (errors.Bh_Id) {
        setErrors((prev) => ({ ...prev, Bh_Id: "" }));
      }

      setTimeout(() => {
        if (amountRef.current) {
          amountRef.current.focus();
        }
      }, 100);
    }
  };

  // =============  KEYBOARD NAVIGATION ==============
  useEffect(() => {
    const timer = setTimeout(() => {
      if (deptButtonRef.current && formData.Fin_Year) {
        deptButtonRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [formData.Fin_Year]);

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  // Department dropdown search keydown
  const handleDeptSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredDepartments.length > 0) {
        setDeptHighlightedIndex(0);
        setTimeout(() => {
          if (deptItemRefs.current[0]) {
            deptItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    }
  };

  // Department button keydown
  const handleDepartmentKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isDeptDropdownOpen && formData.Fin_Year) {
        setIsDeptDropdownOpen(true);
        setDeptSearchTerm("");
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isDeptDropdownOpen) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDeptSearchTerm("");
      }
    }
  };

  // Department item keydown
  const handleDeptItemKeyDown = (e, idx, item) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredDepartments.length) {
        setDeptHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (deptItemRefs.current[nextIndex]) {
            deptItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setDeptHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (deptItemRefs.current[prevIndex]) {
            deptItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleDepartmentSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    }
  };

  // Budget Head dropdown search keydown
  const handleBudgetHeadSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredBudgetHeads.length > 0) {
        setBudgetHeadHighlightedIndex(0);
        setTimeout(() => {
          if (budgetHeadItemRefs.current[0]) {
            budgetHeadItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBudgetHeadDropdownOpen(false);
      setBudgetHeadHighlightedIndex(-1);
      setBudgetHeadSearchTerm("");
      budgetHeadButtonRef.current?.focus();
    }
  };

  // Budget Head button keydown
  const handleBudgetHeadKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isBudgetHeadDropdownOpen && formData.Dept_Id) {
        setIsBudgetHeadDropdownOpen(true);
        setBudgetHeadSearchTerm("");
        setBudgetHeadHighlightedIndex(-1);
        setTimeout(() => budgetHeadSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isBudgetHeadDropdownOpen) {
        setIsBudgetHeadDropdownOpen(false);
        setBudgetHeadHighlightedIndex(-1);
        setBudgetHeadSearchTerm("");
      }
    }
  };

  // Budget Head item keydown
  const handleBudgetHeadItemKeyDown = (e, idx, item) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredBudgetHeads.length) {
        setBudgetHeadHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (budgetHeadItemRefs.current[nextIndex]) {
            budgetHeadItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setBudgetHeadHighlightedIndex(-1);
        setTimeout(() => budgetHeadSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setBudgetHeadHighlightedIndex(-1);
        setTimeout(() => budgetHeadSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setBudgetHeadHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (budgetHeadItemRefs.current[prevIndex]) {
            budgetHeadItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleBudgetHeadSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBudgetHeadDropdownOpen(false);
      setBudgetHeadHighlightedIndex(-1);
      setBudgetHeadSearchTerm("");
      budgetHeadButtonRef.current?.focus();
    }
  };

  // =============  DISPLAY FUNCTIONS ==============
  const getDepartmentDisplayName = (dept) => {
    if (!dept) return "";
    const level = parseInt(dept.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = dept.Dpt_Desc || dept.desc || "No Description";
    const name = dept.Dpt_Name || dept.name;

    return {
      primary: `${indent}${desc}`,
      secondary: name ? `${indent}${name}` : null,
      level: level,
    };
  };

  const renderDepartmentItem = (dept) => {
    const level = parseInt(dept.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = dept.Dpt_Desc || dept.desc || "No Description";
    const name = dept.Dpt_Name || dept.name;

    const levelColors = {
      1: "bg-blue-100 text-blue-600",
      2: "bg-green-100 text-green-600",
      3: "bg-amber-100 text-amber-600",
      4: "bg-purple-100 text-purple-600",
    };
    const colorClass = levelColors[level] || "bg-gray-100 text-gray-600";

    return (
      <div className="py-1">
        <div className="flex items-start">
          <div
            className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${colorClass}`}
          >
            <span className="text-xs font-bold">L{level}</span>
          </div>
          <div className="flex-1">
            <div
              className="text-sm font-medium text-gray-900 whitespace-pre-wrap"
              style={{ marginLeft: `${(level - 1) * 20}px` }}
            >
              {desc}
            </div>
            {name && name != desc && (
              <div
                className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap"
                style={{ marginLeft: `${(level - 1) * 20}px` }}
              >
                {name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSelectedDepartmentDisplay = () => {
    if (!formData.Dept_Id) return "";
    const selected = flattenedDepartments.find(
      (dept) => (dept.Dpt_id || dept.id)?.toString() == formData.Dept_Id,
    );
    if (!selected) return "Selected department not found";

    const level = parseInt(selected.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = selected.Dpt_Desc || selected.desc || "No Description";
    const name = selected.Dpt_Name || selected.name;

    if (name && name != desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  // =============  BUDGET HEAD DISPLAY FUNCTIONS ==============
  const getBudgetHeadDisplay = (head) => {
    if (!head) return "";

    const name = head.Gr_Nm || "";
    const code = head.Gr_Cd || "";

    return code ? `${code} - ${name}` : name;
  };

  const renderBudgetHeadItem = (head) => {
    const level = parseInt(head.Gr_St) || 1;
    const indent = "    ".repeat(level - 1);
    const name = head.Gr_Nm || "";
    const code = head.Gr_Cd || "";

    const levelColors = {
      1: "bg-blue-100 text-blue-600",
      2: "bg-green-100 text-green-600",
      3: "bg-amber-100 text-amber-600",
      4: "bg-purple-100 text-purple-600",
    };
    const colorClass = levelColors[level] || "bg-gray-100 text-gray-600";

    return (
      <div className="py-1">
        <div className="flex items-start">
          <div
            className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${colorClass}`}
          >
            <span className="text-xs font-bold">L{level}</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              <span className="whitespace-pre">{indent}</span>
              {name}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getSelectedBudgetHeadDisplay = () => {
    if (!formData.Bh_Id) return "";
    const selected = budgetHeads.find(
      (head) => head.Bh_Id?.toString() == formData.Bh_Id,
    );
    if (!selected) return "Selected budget head not found";

    const level = parseInt(selected.Gr_St) || 1;
    const indent = "    ".repeat(level - 1);
    const name = selected.Gr_Nm || "";
    const code = selected.Gr_Cd || "";

    return `${indent}${name}`;
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name == "Amount") {
      const isValid = /^\d*\.?\d*$/.test(value);
      if (!isValid && value != "") return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const toggleFinancialYearDropdown = () => {
    if (availableYears.length <= 1) {
      toast.info("Only one financial year is available for budget entry");
      return;
    }
    setShowFinancialYearDropdown(!showFinancialYearDropdown);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Fin_Year) {
      newErrors.Fin_Year = "Financial year is required";
    } else {
      const selectedYear = availableYears.find(
        (fy) => fy.FY_Id?.toString() == formData.Fin_Year,
      );
      if (!selectedYear || !selectedYear.is_budget_open) {
        newErrors.Fin_Year =
          "Selected financial year is not open for budget entries";
      }
    }

    if (!formData.Dept_Id) {
      newErrors.Dept_Id = "Department is required";
    }

    if (!formData.Bh_Id) {
      newErrors.Bh_Id = "Budget head is required";
    }

    if (!formData.Amount) {
      newErrors.Amount = "Amount is required";
    } else if (parseFloat(formData.Amount) <= 0) {
      newErrors.Amount = "Amount must be greater than 0";
    }

    if (formData.Status == "J" || formData.Status == "Justification") {
      const totalDocuments = uploadedFiles.length + existingDocuments.length;
      if (totalDocuments == 0) {
        newErrors.Beg_Doc =
          "At least one document is required for Justification status";
      } else if (totalDocuments > 10) {
        newErrors.Beg_Doc = "Maximum 10 documents allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🚀 Form submitted with data:", formData);

    if (
      (formData.Status == "J" || formData.Status == "Justification") &&
      uploadedFiles.length > 0
    ) {
      if (!fncId) {
        toast.error(
          "Function ID not available for document upload. Please refresh the page.",
        );
        return;
      }
    }

    if (availableYears.length == 0) {
      toast.error(
        "No financial year is open for budget entries. Please contact administrator.",
      );
      return;
    }

    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const selectedYear = availableYears.find(
      (fy) => fy.FY_Id?.toString() == formData.Fin_Year,
    );

    // Updated to use Bh_Id instead of Ledg_ID
    const submitData = {
      Fin_Year: parseInt(formData.Fin_Year) || null,
      Dpt_Id: formData.Dept_Id ? parseInt(formData.Dept_Id) : null,
      Bh_Id: formData.Bh_Id ? parseInt(formData.Bh_Id) : null,
      Amount: parseFloat(formData.Amount) || 0,
    };

    if (formData.Status) {
      submitData.Status = formData.Status;
    }

    const isJustificationStatus =
      formData.Status == "J" || formData.Status == "Justification";
    if (isJustificationStatus && uploadedFiles.length > 0) {
      submitData.Beg_Doc = uploadedFiles.map((file) => file.base64);
      submitData.Fnc_Id = fncId;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Budget Entry?" : "Create New Budget Entry?",
      text: isEditMode
        ? "Are you sure you want to update this budget entry?"
        : `Are you sure you want to create this budget entry for ${selectedYear?.FY_Name}?`,
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
      let response;
      if (isEditMode) {
        response = await budgetEntryApi.update(id, submitData);
        toast.success("Budget entry updated successfully!");
      } else {
        response = await budgetEntryApi.create(submitData);
        toast.success("Budget entry created successfully!");
      }

      console.log("✅ API Response:", response);

      setTimeout(() => {
        navigate("/transactions/budget-management/budgetinitialentry");
      }, 1500);
    } catch (error) {
      console.error("❌ Error saving budget entry:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          if (key == "Dpt_Id") fieldErrors.Dept_Id = apiErrors[key][0];
          else if (key == "Bh_Id") fieldErrors.Bh_Id = apiErrors[key][0];
          else fieldErrors[key] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update budget entry. Please try again."
            : "Failed to create budget entry. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/budget-management/budgetinitialentry");
  };

  const formatAmount = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const getSelectedYearDetails = () => {
    if (!formData.Fin_Year) return null;
    return availableYears.find(
      (fy) => fy.FY_Id?.toString() == formData.Fin_Year,
    );
  };

  const selectedYear = getSelectedYearDetails();

  const getStatusBadge = (statusValue) => {
    const statusOption = statusOptions.find((opt) => opt.value == statusValue);
    if (!statusOption) return null;

    const Icon = statusOption.icon;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusOption.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {statusOption.label}
      </span>
    );
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes == 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("word")) return "📝";
    if (type.includes("excel") || type.includes("sheet")) return "📊";
    return "📎";
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading budget entry data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/budget-management/budgetinitialentry")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Budget Entry" : "Add New Budget Entry"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update budget allocation information"
                : "Create a new budget allocation entry"}
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner for No Budget-Open Financial Year */}
      {noCurrentYear && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-400 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800">
                No Financial Year Open for Budget Entries
              </h3>
              <div className="mt-1 text-sm text-amber-700">
                <p className="mb-2">
                  You cannot create budget entries without a financial year that
                  is open for budget entries. Please create or open a financial
                  year first.
                </p>

                <button
                  onClick={() =>
                    navigate(
                      "/settings/profile-management/financial-year-master",
                    )
                  }
                  className="ml-3 inline-flex items-center px-4 py-2 bg-white border border-blue-300 text-blue-700 text-sm font-medium rounded-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Financial Years
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Financial Details Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mr-3">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Financial Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financial Year *
              </label>

              {showFinancialYearDropdown ? (
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      name="Fin_Year"
                      value={formData.Fin_Year}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                        errors.Fin_Year ? "border-red-300" : "border-gray-300"
                      } ${noCurrentYear || availableYears.length == 0 ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      required
                      disabled={
                        dropdownLoading ||
                        noCurrentYear ||
                        availableYears.length == 0
                      }
                    >
                      <option value="">Select financial year</option>
                      {availableYears.map((fy) => (
                        <option key={fy.FY_Id} value={fy.FY_Id}>
                          {fy.FY_Name} ({fy.FY_Code})
                          {fy.is_current_year && " - Current Year"}
                          {!fy.is_budget_open && " - Budget Closed"}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {availableYears.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowFinancialYearDropdown(false)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Use default financial year selection
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <div
                    className={`relative flex items-center justify-between p-3 border rounded-lg ${
                      noCurrentYear || availableYears.length == 0
                        ? "border-amber-300 bg-amber-50 cursor-not-allowed"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer group"
                    } transition-colors`}
                    onClick={
                      availableYears.length > 1
                        ? toggleFinancialYearDropdown
                        : undefined
                    }
                  >
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        {selectedYear ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="font-medium text-gray-700">
                              {selectedYear.FY_Name} ({selectedYear.FY_Code})
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {selectedYear.is_current_year && (
                                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  Current Year
                                </span>
                              )}
                              {selectedYear.is_budget_open && (
                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                  Budget Open
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span
                            className={`font-medium ${
                              noCurrentYear ? "text-amber-700" : "text-gray-700"
                            }`}
                          >
                            {noCurrentYear || availableYears.length == 0
                              ? "No financial year open for budget entries"
                              : "Select financial year"}
                          </span>
                        )}
                      </div>
                    </div>

                    {availableYears.length > 1 && !noCurrentYear && (
                      <div className="flex items-center text-blue-600">
                        <span className="text-xs mr-1">Change</span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <input
                    type="hidden"
                    name="Fin_Year"
                    value={formData.Fin_Year}
                  />

                  {selectedYear ? (
                    <p className="text-xs text-gray-500 flex items-start">
                      <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span>
                        {selectedYear.is_current_year
                          ? "Current financial year is selected. Click 'Change' to select a different year."
                          : "Non-current year selected. Budget entries are allowed because budget is open."}
                      </span>
                    </p>
                  ) : noCurrentYear || availableYears.length == 0 ? (
                    <p className="text-sm text-amber-600 flex items-start">
                      <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span>
                        No financial year is open for budget entries. Please
                        contact administrator.
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Default selection:{" "}
                      {availableYears.length == 1
                        ? "Only one year available for budget entries"
                        : "Click to select a different financial year"}
                    </p>
                  )}
                </div>
              )}

              {errors.Fin_Year && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Fin_Year}
                </p>
              )}
            </div>

            {/* Department */}
            <SearchableDropdown
              label="Department"
              value={formData.Dept_Id}
              error={errors.Dept_Id}
              required={true}
              icon={Building}
              isOpen={isDeptDropdownOpen}
              setIsOpen={setIsDeptDropdownOpen}
              searchTerm={deptSearchTerm}
              setSearchTerm={setDeptSearchTerm}
              items={flattenedDepartments}
              filteredItems={filteredDepartments}
              highlightedIndex={deptHighlightedIndex}
              onSelect={handleDepartmentSelect}
              onKeyDown={handleDepartmentKeyDown}
              onSearchKeyDown={handleDeptSearchKeyDown}
              onItemKeyDown={handleDeptItemKeyDown}
              getSelectedDisplay={getSelectedDepartmentDisplay}
              loading={dropdownLoading}
              placeholder={
                formData.Fin_Year
                  ? "Select Department"
                  : "Select Financial Year first"
              }
              searchPlaceholder="Search by department name, description..."
              buttonRef={deptButtonRef}
              dropdownRef={deptDropdownRef}
              searchRef={deptSearchRef}
              itemRefs={deptItemRefs}
              listRef={deptListRef}
              getId={(item) => (item.Dpt_id || item.id)?.toString()}
              renderItem={renderDepartmentItem}
              disabled={!formData.Fin_Year || noCurrentYear}
            />
          </div>
        </div>

        {/* Budget Head & Amount Card - Updated from Ledger to Budget Head */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3">
              <PieChart className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Budget Head & Amount
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget Head - Replaced Ledger */}
            <SearchableDropdown
              label="Budget Head"
              value={formData.Bh_Id}
              error={errors.Bh_Id}
              required={true}
              icon={PieChart}
              isOpen={isBudgetHeadDropdownOpen}
              setIsOpen={setIsBudgetHeadDropdownOpen}
              searchTerm={budgetHeadSearchTerm}
              setSearchTerm={setBudgetHeadSearchTerm}
              items={budgetHeads}
              filteredItems={filteredBudgetHeads}
              highlightedIndex={budgetHeadHighlightedIndex}
              onSelect={handleBudgetHeadSelect}
              onKeyDown={handleBudgetHeadKeyDown}
              onSearchKeyDown={handleBudgetHeadSearchKeyDown}
              onItemKeyDown={handleBudgetHeadItemKeyDown}
              getSelectedDisplay={getSelectedBudgetHeadDisplay}
              loading={budgetHeadsLoading}
              placeholder={
                formData.Dept_Id
                  ? "Select Budget Head"
                  : "Select Department first"
              }
              searchPlaceholder="Search by name..."
              buttonRef={budgetHeadButtonRef}
              dropdownRef={budgetHeadDropdownRef}
              searchRef={budgetHeadSearchRef}
              itemRefs={budgetHeadItemRefs}
              listRef={budgetHeadListRef}
              getId={(item) => item.Bh_Id?.toString()}
              renderItem={renderBudgetHeadItem}
              disabled={
                !formData.Dept_Id || !formData.Fin_Year || noCurrentYear
              }
            />

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={amountRef}
                  type="text"
                  name="Amount"
                  value={formData.Amount}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.Amount ? "border-red-300" : "border-gray-300"
                  } ${noCurrentYear || !formData.Fin_Year ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="0.00"
                  required
                  disabled={noCurrentYear || !formData.Fin_Year}
                  onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                />
                {formData.Amount &&
                  !errors.Amount &&
                  !noCurrentYear &&
                  formData.Fin_Year && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <span className="text-sm text-gray-500 mr-2">
                        ₹ {formatAmount(formData.Amount)}
                      </span>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
              </div>
              {errors.Amount ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Amount}
                </p>
              ) : noCurrentYear || !formData.Fin_Year ? (
                <p className="mt-1 text-xs text-amber-600">
                  Amount entry requires a valid financial year
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Enter the budget amount in Indian Rupees (₹)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Field - Only in Edit Mode */}
        {isEditMode && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-3">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Status Management
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Status: {getStatusBadge(formData.Status)}
                </label>
                <div className="relative">
                  <select
                    name="Status"
                    value={formData.Status}
                    onChange={handleInputChange}
                    className={`w-full pl-4 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none ${
                      errors.Status ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Keep current status</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.Status ? (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Status}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Optional: Change the status of this budget entry
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Upload - Only when Status is Justification */}
        {(formData.Status == "J" || formData.Status == "Justification") && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mr-3">
                <Paperclip className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Justification Documents
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Upload supporting documents for justification (Max 10 files,
                  10MB each)
                </p>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  errors.Beg_Doc
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                />
                <Upload
                  className={`h-12 w-12 mx-auto mb-4 ${
                    errors.Beg_Doc ? "text-red-400" : "text-gray-400"
                  }`}
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: PDF, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Files
                </button>
              </div>

              {errors.Beg_Doc && (
                <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.Beg_Doc}
                </p>
              )}

              {uploadingFiles && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-sm text-gray-600">
                    Processing files...
                  </span>
                </div>
              )}
            </div>

            {/* Uploaded Files List */}
            {(uploadedFiles.length > 0 || existingDocuments.length > 0) && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Uploaded Documents (
                  {uploadedFiles.length + existingDocuments.length}/10)
                </h3>

                {existingDocuments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-600">
                      Existing Documents:
                    </h4>
                    {existingDocuments.map((doc, index) => (
                      <div
                        key={`existing-${index}`}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-3">
                            {getFileIcon(doc.mime || doc.url || "")}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {doc.name ||
                                doc.original_name ||
                                `Document ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doc.formatted_size ||
                                formatFileSize(doc.size || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.url && (
                            <button
                              type="button"
                              onClick={() => previewDocument(doc.url)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingDocument(index)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Remove"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {existingDocuments.length > 0 && (
                      <h4 className="text-xs font-medium text-gray-600">
                        New Documents:
                      </h4>
                    )}
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={`new-${index}`}
                        className="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-3">
                            {getFileIcon(file.type)}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {file.type}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(index)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Remove"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fnc_Id warning if not loaded */}
            {!fncId &&
              (formData.Status == "J" ||
                formData.Status == "Justification") && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <p className="text-sm text-yellow-700">
                      Function ID not loaded. Document upload may not work.
                      Please refresh the page.
                    </p>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
            {availableYears.length > 0 && selectedYear && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {selectedYear.FY_Name} •
                {selectedYear.is_current_year
                  ? " Current Year"
                  : " Non-Current Year"}{" "}
                •
                {selectedYear.is_budget_open
                  ? " Budget Open"
                  : " Budget Closed"}
              </p>
            )}
            {(formData.Status == "J" || formData.Status == "Justification") && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Justification status requires document upload
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
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
              disabled={
                saving ||
                dropdownLoading ||
                budgetHeadsLoading ||
                availableYears.length == 0 ||
                !formData.Fin_Year ||
                ((formData.Status == "J" ||
                  formData.Status == "Justification") &&
                  uploadedFiles.length > 0 &&
                  !fncId)
              }
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : availableYears.length == 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  No Financial Year Open for Budget
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Budget Entry" : "Create Budget Entry"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditBudgetEntry;
