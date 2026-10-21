import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  Building,
  Layers,
  AlertCircle,
  ChevronDown,
  Search,
  ChevronUp,
  Check,
  DollarSign,
  XCircle,
  Loader,
  Receipt,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { GrantEntryApi } from "../../../services/grantentryapi";

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
  getSelectedDisplay,
  loading,
  placeholder,
  searchPlaceholder,
  buttonRef,
  dropdownRef,
  searchRef,
  itemRefs,
  listRef,
  disabled = false,
  renderItem,
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  const handleSearchChange = (e) => {
    if (typeof setSearchTerm == "function") {
      setSearchTerm(e.target.value);
    }
  };

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
                onChange={handleSearchChange}
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
                  item?.FY_Id ||
                  item?.Dpt_id ||
                  item?.Bh_Id ||
                  item?.GT_Id ||
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
                    onClick={() => onSelect(item)}
                    onKeyDown={(e) => onItemKeyDown(e, item, idx)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                      highlightedIndex == idx
                        ? "bg-blue-100"
                        : value && itemId && value == itemId.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    {renderItem ? renderItem(item) : item.name}
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

const AddEditGrantEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingBudgetHeads, setLoadingBudgetHeads] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [fncId, setFncId] = useState(null);
  const [initialActionId, setInitialActionId] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);

  // Tree-structured data for branches
  const [flattenedBranches, setFlattenedBranches] = useState([]);
  const [flattenedBudgetHeads, setFlattenedBudgetHeads] = useState([]);

  const [dropdownData, setDropdownData] = useState({
    financialYears: [],
    branches: [],
    budgetHeads: [],
    grantTypes: [],
  });

  // Financial Year dropdown states
  const [filteredFinancialYears, setFilteredFinancialYears] = useState([]);
  const [financialYearSearchTerm, setFinancialYearSearchTerm] = useState("");
  const [isFinancialYearDropdownOpen, setIsFinancialYearDropdownOpen] =
    useState(false);
  const [financialYearHighlightedIndex, setFinancialYearHighlightedIndex] =
    useState(-1);
  const financialYearDropdownRef = useRef(null);
  const financialYearSearchRef = useRef(null);
  const financialYearItemRefs = useRef([]);
  const financialYearListRef = useRef(null);
  const financialYearButtonRef = useRef(null);

  // Branch dropdown states
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchHighlightedIndex, setBranchHighlightedIndex] = useState(-1);
  const branchDropdownRef = useRef(null);
  const branchSearchRef = useRef(null);
  const branchItemRefs = useRef([]);
  const branchListRef = useRef(null);
  const branchButtonRef = useRef(null);

  // Budget Head dropdown states
  const [filteredBudgetHeads, setFilteredBudgetHeads] = useState([]);
  const [budgetHeadSearchTerm, setBudgetHeadSearchTerm] = useState("");
  const [isBudgetHeadDropdownOpen, setIsBudgetHeadDropdownOpen] =
    useState(false);
  const [budgetHeadHighlightedIndex, setBudgetHeadHighlightedIndex] =
    useState(-1);
  const budgetHeadDropdownRef = useRef(null);
  const budgetHeadSearchRef = useRef(null);
  const budgetHeadItemRefs = useRef([]);
  const budgetHeadListRef = useRef(null);
  const budgetHeadButtonRef = useRef(null);

  // Grant Type dropdown states
  const [filteredGrantTypes, setFilteredGrantTypes] = useState([]);
  const [grantTypeSearchTerm, setGrantTypeSearchTerm] = useState("");
  const [isGrantTypeDropdownOpen, setIsGrantTypeDropdownOpen] = useState(false);
  const [grantTypeHighlightedIndex, setGrantTypeHighlightedIndex] =
    useState(-1);
  const grantTypeDropdownRef = useRef(null);
  const grantTypeSearchRef = useRef(null);
  const grantTypeItemRefs = useRef([]);
  const grantTypeListRef = useRef(null);
  const grantTypeButtonRef = useRef(null);

  // Refs for focus management - Sequential order
  const dateInputRef = useRef(null);
  const financialYearButtonRefMain = useRef(null);
  const branchButtonRefMain = useRef(null);
  const budgetHeadButtonRefMain = useRef(null);
  const grantTypeButtonRefMain = useRef(null);
  const amountRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    Date: new Date().toISOString().split("T")[0],
    FY_Id: "",
    Dpt_Id: "",
    Bh_Id: "",
    GT_Id: "",
    Amount: "",
  });

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/grant-management/grant-entry";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Id) {
        setFncId(currentMenuItem.Fnc_Id);
      }

      // Get stage from the action object
      if (currentMenuItem?.action?.stage) {
        setCurrentStage(currentMenuItem.action.stage);
        loadActionsForStage(currentMenuItem.action.stage);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // Load actions for the current stage
  const loadActionsForStage = async (stage) => {
    if (!stage) return;

    try {
      const response = await GrantEntryApi.getAllByStage(stage);
      console.log(`Actions for stage ${stage}:`, response);

      if (response.status && response.data) {
        const actions = response.data;
        const initialAction = actions.find((action) => !action.Previous_Status);
        if (initialAction) {
          setInitialActionId(initialAction.Act_Id);
          console.log("Initial Action ID set to:", initialAction.Act_Id);
        }
      }
    } catch (error) {
      console.error("Error loading actions for stage:", error);
    }
  };

  // =============  BUILD TREE STRUCTURE FOR BRANCHES ==============
  const buildBranchTree = (branches) => {
    const map = {};
    const roots = [];

    branches.forEach((branch) => {
      map[branch.Dpt_id] = {
        ...branch,
        children: [],
        Dpt_id: branch.Dpt_id,
        Dpt_Name: branch.Dpt_Name,
        Dpt_Desc: branch.Dpt_Desc,
        GrStt: branch.GrStt,
        GrCod: branch.GrCod,
        UpGrp: branch.UpGrp,
      };
    });

    branches.forEach((branch) => {
      const branchId = branch.Dpt_id;
      const upGroup = branch.UpGrp;
      const currentBranch = map[branchId];

      if (currentBranch && upGroup && map[upGroup] && upGroup != branchId) {
        map[upGroup].children.push(currentBranch);
      } else if (currentBranch) {
        roots.push(currentBranch);
      }
    });

    return roots;
  };

  // =============  BUILD TREE STRUCTURE FOR BUDGET HEADS ==============
  const buildBudgetHeadTree = (heads) => {
    const map = {};
    const roots = [];

    heads.forEach((head) => {
      map[head.Bh_Id] = {
        ...head,
        children: [],
        Bh_Id: head.Bh_Id,
        Gr_Nm: head.Gr_Nm,
        Gr_Cd: head.Gr_Cd,
        Gr_St: head.Gr_St,
        Up_Gr: head.Up_Gr,
      };
    });

    heads.forEach((head) => {
      const headId = head.Bh_Id;
      const upGroup = head.Up_Gr;
      const currentHead = map[headId];

      if (currentHead && upGroup && map[upGroup] && upGroup != headId) {
        map[upGroup].children.push(currentHead);
      } else if (currentHead) {
        roots.push(currentHead);
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

  useEffect(() => {
    loadDropdownData();

    if (id && id != "create") {
      setIsEditMode(true);
      loadGrantEntryData();
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (
        financialYearDropdownRef.current &&
        !financialYearDropdownRef.current.contains(event.target)
      ) {
        setIsFinancialYearDropdownOpen(false);
        setFinancialYearHighlightedIndex(-1);
        setFinancialYearSearchTerm("");
      }
      if (
        branchDropdownRef.current &&
        !branchDropdownRef.current.contains(event.target)
      ) {
        setIsBranchDropdownOpen(false);
        setBranchHighlightedIndex(-1);
        setBranchSearchTerm("");
      }
      if (
        budgetHeadDropdownRef.current &&
        !budgetHeadDropdownRef.current.contains(event.target)
      ) {
        setIsBudgetHeadDropdownOpen(false);
        setBudgetHeadHighlightedIndex(-1);
        setBudgetHeadSearchTerm("");
      }
      if (
        grantTypeDropdownRef.current &&
        !grantTypeDropdownRef.current.contains(event.target)
      ) {
        setIsGrantTypeDropdownOpen(false);
        setGrantTypeHighlightedIndex(-1);
        setGrantTypeSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  // Focus on date field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isFinancialYearDropdownOpen && financialYearSearchRef.current) {
      setTimeout(() => financialYearSearchRef.current.focus(), 0);
    }
  }, [isFinancialYearDropdownOpen]);

  useEffect(() => {
    if (isBranchDropdownOpen && branchSearchRef.current) {
      setTimeout(() => branchSearchRef.current.focus(), 0);
    }
  }, [isBranchDropdownOpen]);

  useEffect(() => {
    if (isBudgetHeadDropdownOpen && budgetHeadSearchRef.current) {
      setTimeout(() => budgetHeadSearchRef.current.focus(), 0);
    }
  }, [isBudgetHeadDropdownOpen]);

  useEffect(() => {
    if (isGrantTypeDropdownOpen && grantTypeSearchRef.current) {
      setTimeout(() => grantTypeSearchRef.current.focus(), 0);
    }
  }, [isGrantTypeDropdownOpen]);

  // Scroll highlighted item into view
  const scrollIntoView = (container, item, highlightedIndex, isOpen) => {
    if (isOpen && highlightedIndex >= 0 && container) {
      const containerEl = container.current;
      const itemEl = item.current[highlightedIndex];
      if (itemEl) {
        const containerRect = containerEl.getBoundingClientRect();
        const itemRect = itemEl.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  };

  useEffect(() => {
    scrollIntoView(
      financialYearListRef,
      financialYearItemRefs,
      financialYearHighlightedIndex,
      isFinancialYearDropdownOpen,
    );
  }, [financialYearHighlightedIndex, isFinancialYearDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      branchListRef,
      branchItemRefs,
      branchHighlightedIndex,
      isBranchDropdownOpen,
    );
  }, [branchHighlightedIndex, isBranchDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      budgetHeadListRef,
      budgetHeadItemRefs,
      budgetHeadHighlightedIndex,
      isBudgetHeadDropdownOpen,
    );
  }, [budgetHeadHighlightedIndex, isBudgetHeadDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      grantTypeListRef,
      grantTypeItemRefs,
      grantTypeHighlightedIndex,
      isGrantTypeDropdownOpen,
    );
  }, [grantTypeHighlightedIndex, isGrantTypeDropdownOpen]);

  // Filter financial years based on search
  useEffect(() => {
    if (!financialYearSearchTerm.trim()) {
      setFilteredFinancialYears(dropdownData.financialYears);
    } else {
      const term = financialYearSearchTerm.toLowerCase();
      const filtered = dropdownData.financialYears.filter(
        (year) =>
          year.FY_Name?.toLowerCase().includes(term) ||
          year.FY_Code?.toLowerCase().includes(term),
      );
      setFilteredFinancialYears(filtered);
    }
    setFinancialYearHighlightedIndex(-1);
  }, [financialYearSearchTerm, dropdownData.financialYears]);

  // =============  FILTER BRANCHES WITH HIERARCHY ==============
  useEffect(() => {
    if (!dropdownData.branches.length) {
      setFilteredBranches([]);
      return;
    }

    const tree = buildBranchTree(dropdownData.branches);
    const flattened = flattenTree(tree);
    setFlattenedBranches(flattened);

    if (!branchSearchTerm.trim()) {
      setFilteredBranches(flattened);
    } else {
      const term = branchSearchTerm.toLowerCase();
      const filtered = flattened.filter(
        (branch) =>
          (branch.Dpt_Desc?.toLowerCase() || "").includes(term) ||
          (branch.Dpt_Name?.toLowerCase() || "").includes(term) ||
          (branch.GrCod?.toLowerCase() || "").includes(term),
      );
      setFilteredBranches(filtered);
    }
    setBranchHighlightedIndex(-1);
  }, [branchSearchTerm, dropdownData.branches]);

  // =============  FILTER BUDGET HEADS WITH HIERARCHY ==============
  useEffect(() => {
    if (!dropdownData.budgetHeads.length) {
      setFilteredBudgetHeads([]);
      return;
    }

    const tree = buildBudgetHeadTree(dropdownData.budgetHeads);
    const flattened = flattenTree(tree);
    setFlattenedBudgetHeads(flattened);

    if (!budgetHeadSearchTerm.trim()) {
      setFilteredBudgetHeads(flattened);
    } else {
      const term = budgetHeadSearchTerm.toLowerCase();
      const filtered = flattened.filter((head) =>
        (head.Gr_Nm?.toLowerCase() || "").includes(term),
      );
      setFilteredBudgetHeads(filtered);
    }
    setBudgetHeadHighlightedIndex(-1);
  }, [budgetHeadSearchTerm, dropdownData.budgetHeads]);

  // Filter grant types based on search
  useEffect(() => {
    if (!grantTypeSearchTerm.trim()) {
      setFilteredGrantTypes(dropdownData.grantTypes);
    } else {
      const term = grantTypeSearchTerm.toLowerCase();
      const filtered = dropdownData.grantTypes.filter(
        (type) =>
          type.GT_Name?.toLowerCase().includes(term) ||
          (type.GT_Code && type.GT_Code.toLowerCase().includes(term)),
      );
      setFilteredGrantTypes(filtered);
    }
    setGrantTypeHighlightedIndex(-1);
  }, [grantTypeSearchTerm, dropdownData.grantTypes]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [financialYears, branches, grantTypes] = await Promise.all([
        GrantEntryApi.getAllFinancialYears(),
        GrantEntryApi.getAllBranches(),
        GrantEntryApi.getAllGrantTypes(),
      ]);

      // Process financial years - filter active ones
      let activeFinancialYears = [];
      let currentFinancialYear = null;

      if (financialYears.success && financialYears.data) {
        activeFinancialYears = financialYears.data.filter(
          (fy) => fy.Status == "ACTIVE",
        );

        // Find the current financial year
        currentFinancialYear = activeFinancialYears.find(
          (fy) => fy.is_current_year == true,
        );
        console.log("Current Financial Year:", currentFinancialYear); // Debug log
      }

      // Process branches - filter visible ones
      let activeBranches = [];
      if (branches.success && branches.data) {
        activeBranches = branches.data.filter(
          (branch) => branch.isvisible == "1",
        );
      }

      // Process grant types
      let activeGrantTypes = [];
      if (grantTypes.status && grantTypes.data) {
        activeGrantTypes = grantTypes.data.filter(
          (type) => type.Is_Active == true,
        );
      }

      setDropdownData((prev) => ({
        ...prev,
        financialYears: activeFinancialYears,
        branches: activeBranches,
        grantTypes: activeGrantTypes,
      }));

      // Set default financial year if in create mode and no financial year selected
      if (!isEditMode && !formData.FY_Id) {
        if (currentFinancialYear) {
          setFormData((prev) => ({
            ...prev,
            FY_Id: currentFinancialYear.FY_Id.toString(),
          }));
          console.log(
            "Default financial year set to:",
            currentFinancialYear.FY_Name,
          );
        } else if (activeFinancialYears.length > 0) {
          // If no current year found, select the first active financial year
          setFormData((prev) => ({
            ...prev,
            FY_Id: activeFinancialYears[0].FY_Id.toString(),
          }));
          console.log(
            "Default financial year set to first available:",
            activeFinancialYears[0].FY_Name,
          );
        }
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadBudgetHeadsByBranch = async (branchId) => {
    if (!branchId) {
      setDropdownData((prev) => ({ ...prev, budgetHeads: [] }));
      setFilteredBudgetHeads([]);
      return;
    }

    setLoadingBudgetHeads(true);
    try {
      const response = await GrantEntryApi.getBudgetHeadsByBranch(branchId);

      if (response.success && response.data) {
        setDropdownData((prev) => ({
          ...prev,
          budgetHeads: response.data,
        }));
      } else {
        setDropdownData((prev) => ({ ...prev, budgetHeads: [] }));
      }
    } catch (error) {
      console.error(
        `Error loading budget heads for branch ${branchId}:`,
        error,
      );
      setDropdownData((prev) => ({ ...prev, budgetHeads: [] }));
      toast.error("Failed to load budget heads");
    } finally {
      setLoadingBudgetHeads(false);
    }
  };

  const loadGrantEntryData = async () => {
    setLoading(true);
    try {
      const response = await GrantEntryApi.getById(id);
      const entry = response?.data || response;

      setFormData({
        Date: entry?.Date
          ? new Date(entry.Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        FY_Id: entry?.FY_Id?.toString() || "",
        Dpt_Id: entry?.Dpt_Id?.toString() || "",
        Bh_Id: entry?.Bh_Id?.toString() || "",
        GT_Id: entry?.GT_Id?.toString() || "",
        Amount: entry?.Amount?.toString() || "",
      });

      // Load budget heads if branch exists
      if (entry?.Dpt_Id) {
        await loadBudgetHeadsByBranch(entry.Dpt_Id);
      }

      setTimeout(() => dateInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error loading grant entry:", error);
      toast.error("Failed to load grant entry data!");
      navigate("/transactions/grant-management/grant-entry");
    } finally {
      setLoading(false);
    }
  };

  // General keyboard navigation for Enter key - Sequential flow
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Financial Year keyboard handlers
  const handleFinancialYearKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsFinancialYearDropdownOpen(true);
      setFinancialYearSearchTerm("");
      setFinancialYearHighlightedIndex(-1);
      setTimeout(() => financialYearSearchRef.current?.focus(), 0);
    }
  };

  const handleFinancialYearSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredFinancialYears.length > 0) {
        setFinancialYearHighlightedIndex(0);
        setTimeout(() => {
          if (financialYearItemRefs.current[0]) {
            financialYearItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsFinancialYearDropdownOpen(false);
      setFinancialYearHighlightedIndex(-1);
      setFinancialYearSearchTerm("");
      financialYearButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (
        filteredFinancialYears.length > 0 &&
        financialYearHighlightedIndex >= 0
      ) {
        handleFinancialYearSelect(
          filteredFinancialYears[financialYearHighlightedIndex],
        );
      } else if (filteredFinancialYears.length > 0) {
        handleFinancialYearSelect(filteredFinancialYears[0]);
      }
    }
  };

  const handleFinancialYearItemKeyDown = (e, year, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredFinancialYears.length) {
        setFinancialYearHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (financialYearItemRefs.current[nextIndex]) {
            financialYearItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setFinancialYearHighlightedIndex(-1);
        setTimeout(() => financialYearSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setFinancialYearHighlightedIndex(-1);
        setTimeout(() => financialYearSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setFinancialYearHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (financialYearItemRefs.current[prevIndex]) {
            financialYearItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleFinancialYearSelect(year);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsFinancialYearDropdownOpen(false);
      setFinancialYearHighlightedIndex(-1);
      setFinancialYearSearchTerm("");
      financialYearButtonRef.current?.focus();
    }
  };

  const handleFinancialYearSelect = (year) => {
    setFormData((prev) => ({
      ...prev,
      FY_Id: year.FY_Id.toString(),
    }));
    setIsFinancialYearDropdownOpen(false);
    setFinancialYearSearchTerm("");
    setFinancialYearHighlightedIndex(-1);

    if (errors.FY_Id) {
      setErrors((prev) => ({ ...prev, FY_Id: "" }));
    }

    setTimeout(() => branchButtonRef.current?.focus(), 100);
  };

  const getSelectedFinancialYearDisplay = () => {
    if (!formData.FY_Id) return "";
    const selected = dropdownData.financialYears.find(
      (year) => year.FY_Id == parseInt(formData.FY_Id),
    );
    if (!selected) return "Selected financial year not found";
    return `${selected.FY_Name} (${selected.FY_Code})`;
  };

  const renderFinancialYearItem = (year) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{year.FY_Name}</div>
      <div className="text-xs text-gray-500 mt-0.5">
        Code: {year.FY_Code} |{" "}
        {year.is_current_year ? "Current Year" : "Previous Year"}
      </div>
    </div>
  );

  // =============  BRANCH KEYBOARD HANDLERS ==============
  const handleBranchKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
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
      if (filteredBranches.length > 0) {
        setBranchHighlightedIndex(0);
        setTimeout(() => {
          if (branchItemRefs.current[0]) {
            branchItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBranchDropdownOpen(false);
      setBranchHighlightedIndex(-1);
      setBranchSearchTerm("");
      branchButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredBranches.length > 0 && branchHighlightedIndex >= 0) {
        handleBranchSelect(filteredBranches[branchHighlightedIndex]);
      } else if (filteredBranches.length > 0) {
        handleBranchSelect(filteredBranches[0]);
      }
    }
  };

  const handleBranchItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredBranches.length) {
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
      handleBranchSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsBranchDropdownOpen(false);
      setBranchHighlightedIndex(-1);
      setBranchSearchTerm("");
      branchButtonRef.current?.focus();
    }
  };

  const handleBranchSelect = async (branch) => {
    const branchId = branch.Dpt_id?.toString();
    setFormData((prev) => ({
      ...prev,
      Dpt_Id: branchId,
      Bh_Id: "",
    }));
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm("");
    setBranchHighlightedIndex(-1);

    if (errors.Dpt_Id) {
      setErrors((prev) => ({ ...prev, Dpt_Id: "" }));
    }

    // Reset budget heads
    setDropdownData((prev) => ({ ...prev, budgetHeads: [] }));
    setFilteredBudgetHeads([]);

    // Load budget heads for selected branch
    await loadBudgetHeadsByBranch(branchId);

    setTimeout(() => {
      if (budgetHeadButtonRef.current) {
        budgetHeadButtonRef.current.focus();
      }
    }, 200);
  };

  // =============  BRANCH DISPLAY FUNCTIONS ==============
  const renderBranchItem = (branch) => {
    const level = parseInt(branch.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = branch.Dpt_Desc || "No Description";
    const name = branch.Dpt_Name;

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
              {indent}
              {desc}
            </div>
            {name && name != desc && (
              <div
                className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap"
                style={{ marginLeft: `${(level - 1) * 20}px` }}
              >
                {indent}
                {name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSelectedBranchDisplay = () => {
    if (!formData.Dpt_Id) return "";
    const selected = flattenedBranches.find(
      (branch) => branch.Dpt_id?.toString() == formData.Dpt_Id,
    );
    if (!selected) return "Selected branch not found";

    const level = parseInt(selected.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = selected.Dpt_Desc || "No Description";
    const name = selected.Dpt_Name;

    if (name && name != desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  // =============  BUDGET HEAD KEYBOARD HANDLERS ==============
  const handleBudgetHeadKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      if (!formData.Dpt_Id) {
        toast.error("Please select a branch first");
        return;
      }
      setIsBudgetHeadDropdownOpen(true);
      setBudgetHeadSearchTerm("");
      setBudgetHeadHighlightedIndex(-1);
      setTimeout(() => budgetHeadSearchRef.current?.focus(), 0);
    }
  };

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
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredBudgetHeads.length > 0 && budgetHeadHighlightedIndex >= 0) {
        handleBudgetHeadSelect(filteredBudgetHeads[budgetHeadHighlightedIndex]);
      } else if (filteredBudgetHeads.length > 0) {
        handleBudgetHeadSelect(filteredBudgetHeads[0]);
      }
    }
  };

  const handleBudgetHeadItemKeyDown = (e, item, idx) => {
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

  const handleBudgetHeadSelect = async (head) => {
    const budgetHeadId = head.Bh_Id?.toString();
    setFormData((prev) => ({
      ...prev,
      Bh_Id: budgetHeadId,
    }));
    setIsBudgetHeadDropdownOpen(false);
    setBudgetHeadSearchTerm("");
    setBudgetHeadHighlightedIndex(-1);

    if (errors.Bh_Id) {
      setErrors((prev) => ({ ...prev, Bh_Id: "" }));
    }

    setTimeout(() => {
      if (grantTypeButtonRef.current) {
        grantTypeButtonRef.current.focus();
      }
    }, 100);
  };

  // =============  BUDGET HEAD DISPLAY FUNCTIONS ==============
  const renderBudgetHeadItem = (head) => {
    const level = parseInt(head.Gr_St) || 1;
    const indent = "    ".repeat(level - 1);
    const name = head.Gr_Nm || "";

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
    const selected = flattenedBudgetHeads.find(
      (head) => head.Bh_Id?.toString() == formData.Bh_Id,
    );
    if (!selected) return "Selected budget head not found";

    const level = parseInt(selected.Gr_St) || 1;
    const indent = "    ".repeat(level - 1);
    const name = selected.Gr_Nm || "";

    return name ? `${indent}${name}` : ``;
  };

  // Grant Type keyboard handlers
  const handleGrantTypeKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsGrantTypeDropdownOpen(true);
      setGrantTypeSearchTerm("");
      setGrantTypeHighlightedIndex(-1);
      setTimeout(() => grantTypeSearchRef.current?.focus(), 0);
    }
  };

  const handleGrantTypeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredGrantTypes.length > 0) {
        setGrantTypeHighlightedIndex(0);
        setTimeout(() => {
          if (grantTypeItemRefs.current[0]) {
            grantTypeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsGrantTypeDropdownOpen(false);
      setGrantTypeHighlightedIndex(-1);
      setGrantTypeSearchTerm("");
      grantTypeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredGrantTypes.length > 0 && grantTypeHighlightedIndex >= 0) {
        handleGrantTypeSelect(filteredGrantTypes[grantTypeHighlightedIndex]);
      } else if (filteredGrantTypes.length > 0) {
        handleGrantTypeSelect(filteredGrantTypes[0]);
      }
    }
  };

  const handleGrantTypeItemKeyDown = (e, type, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredGrantTypes.length) {
        setGrantTypeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (grantTypeItemRefs.current[nextIndex]) {
            grantTypeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setGrantTypeHighlightedIndex(-1);
        setTimeout(() => grantTypeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setGrantTypeHighlightedIndex(-1);
        setTimeout(() => grantTypeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setGrantTypeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (grantTypeItemRefs.current[prevIndex]) {
            grantTypeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleGrantTypeSelect(type);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsGrantTypeDropdownOpen(false);
      setGrantTypeHighlightedIndex(-1);
      setGrantTypeSearchTerm("");
      grantTypeButtonRef.current?.focus();
    }
  };

  const handleGrantTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      GT_Id: type.GT_Id.toString(),
    }));
    setIsGrantTypeDropdownOpen(false);
    setGrantTypeSearchTerm("");
    setGrantTypeHighlightedIndex(-1);

    if (errors.GT_Id) {
      setErrors((prev) => ({ ...prev, GT_Id: "" }));
    }

    setTimeout(() => {
      if (amountRef.current) {
        amountRef.current.focus();
      }
    }, 100);
  };

  const getSelectedGrantTypeDisplay = () => {
    if (!formData.GT_Id) return "";
    const selected = dropdownData.grantTypes.find(
      (type) => type.GT_Id == parseInt(formData.GT_Id),
    );
    if (!selected) return "Selected grant type not found";
    return `${selected.GT_Name}${selected.GT_Code ? ` (${selected.GT_Code})` : ""}`;
  };

  const renderGrantTypeItem = (type) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{type.GT_Name}</div>
      {type.GT_Code && (
        <div className="text-xs text-gray-500 mt-0.5">Code: {type.GT_Code}</div>
      )}
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name == "Amount" && value != "") {
      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Date) {
      newErrors.Date = "Date is required";
    }

    if (!formData.FY_Id) {
      newErrors.FY_Id = "Financial year selection is required";
    }

    if (!formData.Dpt_Id) {
      newErrors.Dpt_Id = "Branch selection is required";
    }

    if (!formData.Bh_Id) {
      newErrors.Bh_Id = "Budget head selection is required";
    }

    if (!formData.GT_Id) {
      newErrors.GT_Id = "Grant type selection is required";
    }

    if (!formData.Amount) {
      newErrors.Amount = "Amount is required";
    } else if (parseFloat(formData.Amount) <= 0) {
      newErrors.Amount = "Amount must be greater than 0";
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
      title: isEditMode ? "Update Grant Entry?" : "Create New Grant Entry?",
      text: isEditMode
        ? "Are you sure you want to update this grant entry?"
        : "Are you sure you want to create this new grant entry?",
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
      const payload = {
        Date: formData.Date,
        FY_Id: parseInt(formData.FY_Id),
        Dpt_Id: parseInt(formData.Dpt_Id),
        Bh_Id: parseInt(formData.Bh_Id),
        GT_Id: parseInt(formData.GT_Id),
        Amount: parseFloat(formData.Amount),
      };

      // For new entries, set Status from initial action
      if (!isEditMode && initialActionId) {
        payload.Status = initialActionId;
        console.log("Setting Status to initial action ID:", initialActionId);
      }

      let response;
      if (isEditMode) {
        response = await GrantEntryApi.update(id, payload);
        toast.success("Grant entry updated successfully!");
      } else {
        response = await GrantEntryApi.create(payload);
        toast.success("Grant entry created successfully!");
      }

      setTimeout(() => {
        navigate("/transactions/grant-management/grant-entry");
      }, 1500);
    } catch (error) {
      console.error("Error saving grant entry:", error);

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};

        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = backendErrors[key][0];
        });

        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            (isEditMode
              ? "Failed to update grant entry. Please try again."
              : "Failed to create grant entry. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/grant-management/grant-entry");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading grant entry data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/grant-management/grant-entry")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Grant Entry" : "New Grant Entry"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update grant entry information"
                : "Create new grant entry"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Receipt className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Grant Entry Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateInputRef}
                  type="date"
                  name="Date"
                  value={formData.Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) =>
                    handleEnterKey(e, financialYearButtonRefMain)
                  }
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {errors.Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Date}
                </p>
              )}
            </div>

            {/* 2. Financial Year Dropdown */}
            <SearchableDropdown
              label="Financial Year"
              value={formData.FY_Id}
              error={errors.FY_Id}
              required={true}
              icon={Calendar}
              isOpen={isFinancialYearDropdownOpen}
              setIsOpen={setIsFinancialYearDropdownOpen}
              searchTerm={financialYearSearchTerm}
              setSearchTerm={setFinancialYearSearchTerm}
              items={dropdownData.financialYears}
              filteredItems={filteredFinancialYears}
              highlightedIndex={financialYearHighlightedIndex}
              onSelect={handleFinancialYearSelect}
              onKeyDown={handleFinancialYearKeyDown}
              onSearchKeyDown={handleFinancialYearSearchKeyDown}
              onItemKeyDown={handleFinancialYearItemKeyDown}
              getSelectedDisplay={getSelectedFinancialYearDisplay}
              loading={loadingDropdowns}
              placeholder="Select Financial Year"
              searchPlaceholder="Search by name or code..."
              buttonRef={financialYearButtonRef}
              dropdownRef={financialYearDropdownRef}
              searchRef={financialYearSearchRef}
              itemRefs={financialYearItemRefs}
              listRef={financialYearListRef}
              renderItem={renderFinancialYearItem}
            />

            {/* 3. Branch Dropdown */}
            <SearchableDropdown
              label="Branch"
              value={formData.Dpt_Id}
              error={errors.Dpt_Id}
              required={true}
              icon={Building}
              isOpen={isBranchDropdownOpen}
              setIsOpen={setIsBranchDropdownOpen}
              searchTerm={branchSearchTerm}
              setSearchTerm={setBranchSearchTerm}
              items={flattenedBranches}
              filteredItems={filteredBranches}
              highlightedIndex={branchHighlightedIndex}
              onSelect={handleBranchSelect}
              onKeyDown={handleBranchKeyDown}
              onSearchKeyDown={handleBranchSearchKeyDown}
              onItemKeyDown={handleBranchItemKeyDown}
              getSelectedDisplay={getSelectedBranchDisplay}
              loading={loadingDropdowns}
              placeholder="Select Branch"
              searchPlaceholder="Search by description or name..."
              buttonRef={branchButtonRef}
              dropdownRef={branchDropdownRef}
              searchRef={branchSearchRef}
              itemRefs={branchItemRefs}
              listRef={branchListRef}
              renderItem={renderBranchItem}
            />

            {/* 4. Budget Head Dropdown */}
            <SearchableDropdown
              label="Budget Head"
              value={formData.Bh_Id}
              error={errors.Bh_Id}
              required={true}
              icon={Layers}
              isOpen={isBudgetHeadDropdownOpen}
              setIsOpen={setIsBudgetHeadDropdownOpen}
              searchTerm={budgetHeadSearchTerm}
              setSearchTerm={setBudgetHeadSearchTerm}
              items={flattenedBudgetHeads}
              filteredItems={filteredBudgetHeads}
              highlightedIndex={budgetHeadHighlightedIndex}
              onSelect={handleBudgetHeadSelect}
              onKeyDown={handleBudgetHeadKeyDown}
              onSearchKeyDown={handleBudgetHeadSearchKeyDown}
              onItemKeyDown={handleBudgetHeadItemKeyDown}
              getSelectedDisplay={getSelectedBudgetHeadDisplay}
              loading={loadingBudgetHeads}
              placeholder={
                formData.Dpt_Id ? "Select Budget Head" : "Select Branch first"
              }
              searchPlaceholder="Search by name..."
              buttonRef={budgetHeadButtonRef}
              dropdownRef={budgetHeadDropdownRef}
              searchRef={budgetHeadSearchRef}
              itemRefs={budgetHeadItemRefs}
              listRef={budgetHeadListRef}
              renderItem={renderBudgetHeadItem}
              disabled={!formData.Dpt_Id}
            />

            {/* 5. Grant Type Dropdown */}
            <SearchableDropdown
              label="Grant Type"
              value={formData.GT_Id}
              error={errors.GT_Id}
              required={true}
              icon={Receipt}
              isOpen={isGrantTypeDropdownOpen}
              setIsOpen={setIsGrantTypeDropdownOpen}
              searchTerm={grantTypeSearchTerm}
              setSearchTerm={setGrantTypeSearchTerm}
              items={dropdownData.grantTypes}
              filteredItems={filteredGrantTypes}
              highlightedIndex={grantTypeHighlightedIndex}
              onSelect={handleGrantTypeSelect}
              onKeyDown={handleGrantTypeKeyDown}
              onSearchKeyDown={handleGrantTypeSearchKeyDown}
              onItemKeyDown={handleGrantTypeItemKeyDown}
              getSelectedDisplay={getSelectedGrantTypeDisplay}
              loading={loadingDropdowns}
              placeholder="Select Grant Type"
              searchPlaceholder="Search by name or code..."
              buttonRef={grantTypeButtonRef}
              dropdownRef={grantTypeDropdownRef}
              searchRef={grantTypeSearchRef}
              itemRefs={grantTypeItemRefs}
              listRef={grantTypeListRef}
              renderItem={renderGrantTypeItem}
            />

            {/* 6. Amount Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) *
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </div>
                <input
                  ref={amountRef}
                  type="text"
                  name="Amount"
                  value={formData.Amount}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                  className={`w-full pl-6 pr-4 py-2.5 border ${
                    errors.Amount ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter amount"
                  required
                />
                {errors.Amount && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Amount}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
          </div>
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
                  {isEditMode ? "Update Entry" : "Create Entry"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditGrantEntry;
