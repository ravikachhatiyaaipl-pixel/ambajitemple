// src/pages/Transactions/TenderManagement/TenderEntry/AddEdit.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  Calendar,
  Building,
  Layers,
  AlertCircle,
  Trash2,
  Plus,
  Briefcase,
  ChevronDown,
  Search,
  Check,
  Loader,
  XCircle,
  PieChart,
  Download,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { TenderEntryApi } from "../../../services/tenderentryapi";

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
                  item?.Dpt_id ||
                  item?.Bh_Id ||
                  item?.TnT_ID ||
                  item?.Lg_Id ||
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

const AddEditTenderEntry = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingBudgetHeads, setLoadingBudgetHeads] = useState(false);
  const [loadingLedgers, setLoadingLedgers] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [fncId, setFncId] = useState(null);

  // Tree-structured data
  const [flattenedBranches, setFlattenedBranches] = useState([]);
  const [flattenedBudgetHeads, setFlattenedBudgetHeads] = useState([]);

  const [dropdownData, setDropdownData] = useState({
    branches: [],
    budgetHeads: [],
    ledgerAccounts: [],
    tenderWorks: [],
  });

  // Tender Work dropdown states
  const [filteredTenderWorks, setFilteredTenderWorks] = useState([]);
  const [tenderWorkSearchTerm, setTenderWorkSearchTerm] = useState("");
  const [isTenderWorkDropdownOpen, setIsTenderWorkDropdownOpen] =
    useState(false);
  const [tenderWorkHighlightedIndex, setTenderWorkHighlightedIndex] =
    useState(-1);
  const tenderWorkDropdownRef = useRef(null);
  const tenderWorkSearchRef = useRef(null);
  const tenderWorkItemRefs = useRef([]);
  const tenderWorkListRef = useRef(null);
  const tenderWorkButtonRef = useRef(null);

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

  // Ledger dropdown states
  const [filteredLedgerAccounts, setFilteredLedgerAccounts] = useState([]);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
  const [ledgerHighlightedIndex, setLedgerHighlightedIndex] = useState(-1);
  const ledgerDropdownRef = useRef(null);
  const ledgerSearchRef = useRef(null);
  const ledgerItemRefs = useRef([]);
  const ledgerListRef = useRef(null);
  const ledgerButtonRef = useRef(null);

  // Refs for focus management
  const dateInputRef = useRef(null);
  const teDateRef = useRef(null); // NEW FIELD REF
  const proposalAmountRef = useRef(null);
  const approvedAmountRef = useRef(null);
  const teEdDateRef = useRef(null);
  const bgPerRef = useRef(null);
  const emdPerRef = useRef(null);
  const teFeeRef = useRef(null);
  const descriptionRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    Dpt_id: "",
    Bh_Id: "",
    Lg_Id: "",
    TnT_ID: "",
    TE_St_Date: "",
    TE_Date: "", // NEW FIELD ADDED
    Proposal_Amount: "",
    Approved_Amount: "",
    TE_Ed_Date: "",
    BG_Per: "",
    EMD_Per: "",
    TE_Fee: "",
    Description: "",
    Documents: [],
  });

  // Separate state for new documents to upload
  const [newDocuments, setNewDocuments] = useState([
    {
      files: [],
      description: "",
      id: Date.now(),
    },
  ]);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/tender-management/tenderentry";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Id) {
        setFncId(currentMenuItem.Fnc_Id);
      } else {
        console.warn("Fnc_Id not found in menu details for path:", currentPath);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

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
      loadTenderData();
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (
        tenderWorkDropdownRef.current &&
        !tenderWorkDropdownRef.current.contains(event.target)
      ) {
        setIsTenderWorkDropdownOpen(false);
        setTenderWorkHighlightedIndex(-1);
        setTenderWorkSearchTerm("");
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
  }, [id]);

  // Focus on date field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isTenderWorkDropdownOpen && tenderWorkSearchRef.current) {
      setTimeout(() => tenderWorkSearchRef.current.focus(), 0);
    }
  }, [isTenderWorkDropdownOpen]);

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
    if (isLedgerDropdownOpen && ledgerSearchRef.current) {
      setTimeout(() => ledgerSearchRef.current.focus(), 0);
    }
  }, [isLedgerDropdownOpen]);

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
      ledgerListRef,
      ledgerItemRefs,
      ledgerHighlightedIndex,
      isLedgerDropdownOpen,
    );
  }, [ledgerHighlightedIndex, isLedgerDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      tenderWorkListRef,
      tenderWorkItemRefs,
      tenderWorkHighlightedIndex,
      isTenderWorkDropdownOpen,
    );
  }, [tenderWorkHighlightedIndex, isTenderWorkDropdownOpen]);

  // Filter tender works based on search
  useEffect(() => {
    if (!tenderWorkSearchTerm.trim()) {
      setFilteredTenderWorks(dropdownData.tenderWorks);
    } else {
      const term = tenderWorkSearchTerm.toLowerCase();
      const filtered = dropdownData.tenderWorks.filter(
        (work) =>
          work.work_name?.toLowerCase().includes(term) ||
          work.TnT_Code?.toLowerCase().includes(term) ||
          work.TnT_Name?.toLowerCase().includes(term),
      );
      setFilteredTenderWorks(filtered);
    }
    setTenderWorkHighlightedIndex(-1);
  }, [tenderWorkSearchTerm, dropdownData.tenderWorks]);

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

  // Filter ledgers based on search
  useEffect(() => {
    if (!ledgerSearchTerm.trim()) {
      setFilteredLedgerAccounts(dropdownData.ledgerAccounts);
    } else {
      const term = ledgerSearchTerm.toLowerCase();
      const filtered = dropdownData.ledgerAccounts.filter(
        (account) =>
          account.Lg_Name?.toLowerCase().includes(term) ||
          (account.Lg_Eng_Name &&
            account.Lg_Eng_Name.toLowerCase().includes(term)) ||
          (account.Lg_Code && account.Lg_Code.toLowerCase().includes(term)),
      );
      setFilteredLedgerAccounts(filtered);
    }
    setLedgerHighlightedIndex(-1);
  }, [ledgerSearchTerm, dropdownData.ledgerAccounts]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      var [branches, tenderWorks] = await Promise.all([
        TenderEntryApi.getBranches(),
        TenderEntryApi.getTenderWorks(),
      ]);

      // console.log("anand14161",tenderWorks)
      // var filterTenderTypeList = []
      // for(var a=0; a<tenderWorks.length; a++){
      //   if(tenderWorks[a].TnT_Name == "General Work"){
      //     filterTenderTypeList.push(tenderWorks[a])
      //     break;
      //   }
      // }
      // if(filterTenderTypeList.length > 0){
      //   tenderWorks = filterTenderTypeList;
      // }


      setDropdownData((prev) => ({
        ...prev,
        branches: branches || [],
        tenderWorks: tenderWorks || [],
      }));
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
      const response = await TenderEntryApi.getBudgetHeadsByBranch(branchId);

      // Extract all budget heads from all mappings
      let allBudgetHeads = [];
      if (response && Array.isArray(response)) {
        response.forEach((mapping) => {
          if (
            mapping.all_budget_heads &&
            Array.isArray(mapping.all_budget_heads)
          ) {
            allBudgetHeads = [...allBudgetHeads, ...mapping.all_budget_heads];
          }
        });

        // Remove duplicates by Bh_Id
        const uniqueBudgetHeads = Array.from(
          new Map(allBudgetHeads.map((head) => [head.Bh_Id, head])).values(),
        );

        setDropdownData((prev) => ({
          ...prev,
          budgetHeads: uniqueBudgetHeads,
        }));

        // Clear ledger when budget head changes
        if (formData.Bh_Id) {
          const budgetHeadExists = uniqueBudgetHeads.some(
            (head) => head.Bh_Id == parseInt(formData.Bh_Id),
          );
          if (!budgetHeadExists) {
            setFormData((prev) => ({ ...prev, Bh_Id: "", Lg_Id: "" }));
            setDropdownData((prev) => ({ ...prev, ledgerAccounts: [] }));
            setFilteredLedgerAccounts([]);
          }
        }
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

  const loadLedgersByBudgetHead = async (budgetHeadId) => {
    if (!budgetHeadId) {
      setDropdownData((prev) => ({ ...prev, ledgerAccounts: [] }));
      setFilteredLedgerAccounts([]);
      return;
    }

    setLoadingLedgers(true);
    try {
      const response =
        await TenderEntryApi.getLedgersByBudgetHead(budgetHeadId);

      const ledgers = response || [];

      setDropdownData((prev) => ({
        ...prev,
        ledgerAccounts: ledgers,
      }));
      setFilteredLedgerAccounts(ledgers);

      if (formData.Lg_Id && ledgers.length > 0) {
        const ledgerExists = ledgers.some(
          (ledger) => ledger.Lg_Id == parseInt(formData.Lg_Id),
        );
        if (!ledgerExists) {
          setFormData((prev) => ({ ...prev, Lg_Id: "" }));
        }
      }
    } catch (error) {
      console.error(
        `Error loading ledgers for budget head ${budgetHeadId}:`,
        error,
      );
      setDropdownData((prev) => ({ ...prev, ledgerAccounts: [] }));
      setFilteredLedgerAccounts([]);
      toast.error("Failed to load ledger accounts");
    } finally {
      setLoadingLedgers(false);
    }
  };

  const loadTenderData = async () => {
    setLoading(true);
    try {
      const response = await TenderEntryApi.getById(id);
      const tender = response?.data || response;

      // Extract Documents from API response - these come as base64 strings
      const existingDocuments = tender?.Documents || [];

      // Set form data
      const newFormData = {
        Dpt_id: tender?.Dpt_id?.toString() || "",
        Bh_Id: tender?.Bh_Id?.toString() || "",
        Lg_Id: tender?.Lg_Id?.toString() || "",
        TnT_ID: tender?.TnT_ID?.toString() || "",
        TE_St_Date: tender?.TE_St_Date
          ? new Date(tender.TE_St_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        TE_Date: tender?.TE_Date // NEW FIELD
          ? new Date(tender.TE_Date).toISOString().split("T")[0]
          : "",
        Proposal_Amount: tender?.Proposal_Amount?.toString() || "",
        Approved_Amount: tender?.Approved_Amount?.toString() || "",
        TE_Ed_Date: tender?.TE_Ed_Date
          ? new Date(tender.TE_Ed_Date).toISOString().split("T")[0]
          : "",
        BG_Per: tender?.BG_Per?.toString() || "",
        EMD_Per: tender?.EMD_Per?.toString() || "",
        TE_Fee: tender?.TE_Fee?.toString() || "",
        Description: tender?.Description || "",
        Documents: existingDocuments, // These contain base64 data
      };

      setFormData(newFormData);

      // Load budget heads if branch exists
      if (newFormData.Dpt_id) {
        await loadBudgetHeadsByBranch(newFormData.Dpt_id);

        // Load ledgers if budget head exists
        if (newFormData.Bh_Id) {
          await loadLedgersByBudgetHead(newFormData.Bh_Id);
        }
      }

      setTimeout(() => dateInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error loading tender entry:", error);
      toast.error("Failed to load tender entry data!");
      navigate("/transactions/tender-management/tenderentry");
    } finally {
      setLoading(false);
    }
  };

  // General keyboard navigation for Enter key
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Tender Work keyboard handlers
  const handleTenderWorkKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsTenderWorkDropdownOpen(true);
      setTenderWorkSearchTerm("");
      setTenderWorkHighlightedIndex(-1);
      setTimeout(() => tenderWorkSearchRef.current?.focus(), 0);
    }
  };

  const handleTenderWorkSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredTenderWorks.length > 0) {
        setTenderWorkHighlightedIndex(0);
        setTimeout(() => {
          if (tenderWorkItemRefs.current[0]) {
            tenderWorkItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderWorkDropdownOpen(false);
      setTenderWorkHighlightedIndex(-1);
      setTenderWorkSearchTerm("");
      tenderWorkButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredTenderWorks.length > 0 && tenderWorkHighlightedIndex >= 0) {
        handleTenderWorkSelect(
          filteredTenderWorks[tenderWorkHighlightedIndex].TnT_ID,
        );
      } else if (filteredTenderWorks.length > 0) {
        handleTenderWorkSelect(filteredTenderWorks[0].TnT_ID);
      }
    }
  };

  const handleTenderWorkItemKeyDown = (e, work, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredTenderWorks.length) {
        setTenderWorkHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (tenderWorkItemRefs.current[nextIndex]) {
            tenderWorkItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setTenderWorkHighlightedIndex(-1);
        setTimeout(() => tenderWorkSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setTenderWorkHighlightedIndex(-1);
        setTimeout(() => tenderWorkSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setTenderWorkHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (tenderWorkItemRefs.current[prevIndex]) {
            tenderWorkItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleTenderWorkSelect(work.TnT_ID);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderWorkDropdownOpen(false);
      setTenderWorkHighlightedIndex(-1);
      setTenderWorkSearchTerm("");
      tenderWorkButtonRef.current?.focus();
    }
  };

  const handleTenderWorkSelect = (workId) => {
    setFormData((prev) => ({
      ...prev,
      TnT_ID: workId.toString(),
    }));
    setIsTenderWorkDropdownOpen(false);
    setTenderWorkSearchTerm("");
    setTenderWorkHighlightedIndex(-1);

    if (errors.TnT_ID) {
      setErrors((prev) => ({ ...prev, TnT_ID: "" }));
    }

    setTimeout(() => {
      if (branchButtonRef.current) {
        branchButtonRef.current.focus();
      }
    }, 100);
  };

  const getSelectedTenderWorkName = () => {
    if (!formData.TnT_ID) return "";
    const selectedWork = dropdownData.tenderWorks.find(
      (work) => work.TnT_ID == parseInt(formData.TnT_ID),
    );
    return selectedWork ? selectedWork.work_name || "" : "";
  };

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
      Dpt_id: branchId,
      Bh_Id: "",
      Lg_Id: "",
    }));
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm("");
    setBranchHighlightedIndex(-1);

    if (errors.Dpt_id) {
      setErrors((prev) => ({ ...prev, Dpt_id: "" }));
    }

    // Reset budget heads and ledgers
    setDropdownData((prev) => ({
      ...prev,
      budgetHeads: [],
      ledgerAccounts: [],
    }));
    setFilteredBudgetHeads([]);
    setFilteredLedgerAccounts([]);

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
    if (!formData.Dpt_id) return "";
    const selected = flattenedBranches.find(
      (branch) => branch.Dpt_id?.toString() == formData.Dpt_id,
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
      if (!formData.Dpt_id) {
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
      Lg_Id: "",
    }));
    setIsBudgetHeadDropdownOpen(false);
    setBudgetHeadSearchTerm("");
    setBudgetHeadHighlightedIndex(-1);

    if (errors.Bh_Id) {
      setErrors((prev) => ({ ...prev, Bh_Id: "" }));
    }

    // Reset ledgers
    setDropdownData((prev) => ({ ...prev, ledgerAccounts: [] }));
    setFilteredLedgerAccounts([]);

    // Load ledgers for selected budget head
    await loadLedgersByBudgetHead(budgetHeadId);

    setTimeout(() => {
      if (ledgerButtonRef.current) {
        ledgerButtonRef.current.focus();
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

  // Ledger keyboard handlers
  const handleLedgerKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      if (!formData.Bh_Id) {
        toast.error("Please select a budget head first");
        return;
      }
      setIsLedgerDropdownOpen(true);
      setLedgerSearchTerm("");
      setLedgerHighlightedIndex(-1);
      setTimeout(() => ledgerSearchRef.current?.focus(), 0);
    }
  };

  const handleLedgerSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredLedgerAccounts.length > 0) {
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
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredLedgerAccounts.length > 0 && ledgerHighlightedIndex >= 0) {
        handleLedgerSelect(
          filteredLedgerAccounts[ledgerHighlightedIndex].Lg_Id,
        );
      } else if (filteredLedgerAccounts.length > 0) {
        handleLedgerSelect(filteredLedgerAccounts[0].Lg_Id);
      }
    }
  };

  const handleLedgerItemKeyDown = (e, account, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredLedgerAccounts.length) {
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
      handleLedgerSelect(account.Lg_Id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    }
  };

  const handleLedgerSelect = async (ledgerId) => {
    setFormData((prev) => ({
      ...prev,
      Lg_Id: ledgerId.toString(),
    }));
    setIsLedgerDropdownOpen(false);
    setLedgerSearchTerm("");
    setLedgerHighlightedIndex(-1);

    if (errors.Lg_Id) {
      setErrors((prev) => ({ ...prev, Lg_Id: "" }));
    }

    setTimeout(() => {
      if (proposalAmountRef.current) {
        proposalAmountRef.current.focus();
      }
    }, 100);
  };

  const getSelectedLedgerName = () => {
    if (!formData.Lg_Id) return "";
    const selectedLedger = dropdownData.ledgerAccounts.find(
      (account) => account.Lg_Id == parseInt(formData.Lg_Id),
    );

    if (!selectedLedger) return "";

    let displayText = selectedLedger.Lg_Name || "";

    if (
      selectedLedger.Lg_Eng_Name &&
      selectedLedger.Lg_Eng_Name != selectedLedger.Lg_Name
    ) {
      displayText += ` (${selectedLedger.Lg_Eng_Name})`;
    }

    if (selectedLedger.Lg_Code) {
      displayText += ` - ${selectedLedger.Lg_Code}`;
    }

    return displayText;
  };

  const renderLedgerItem = (account) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">
        {account.Lg_Name || "No Name"}
      </div>
      {account.Lg_Eng_Name && (
        <div className="text-xs text-gray-600 mt-0.5">
          {account.Lg_Eng_Name}
        </div>
      )}
      {account.Lg_Code && (
        <div className="text-xs text-gray-500 mt-1">
          <span className="bg-gray-100 px-1.5 py-0.5 rounded">
            {account.Lg_Code}
          </span>
        </div>
      )}
    </div>
  );

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (
      (name == "Proposal_Amount" ||
        name == "Approved_Amount" ||
        name == "BG_Per" ||
        name == "EMD_Per" ||
        name == "TE_Fee") &&
      value != ""
    ) {
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

  // Handle multiple file selection for new documents
  const handleFileChange = (index, files) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    // Convert FileList to array
    const fileArray = Array.from(files);

    // Validate each file
    for (const file of fileArray) {
      if (!validTypes.includes(file.type)) {
        toast.error(`File type not supported: ${file.name}`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File too large (max 10MB): ${file.name}`);
        return;
      }
    }

    const updatedDocuments = [...newDocuments];

    // If there are existing files, append new ones
    if (
      updatedDocuments[index].files &&
      updatedDocuments[index].files.length > 0
    ) {
      // Check for duplicates
      const existingNames = updatedDocuments[index].files.map((f) => f.name);
      const newFiles = fileArray.filter((f) => !existingNames.includes(f.name));

      if (newFiles.length > 0) {
        updatedDocuments[index].files = [
          ...updatedDocuments[index].files,
          ...newFiles,
        ];
        toast.success(`${newFiles.length} file(s) added successfully`);
      } else {
        toast.error("All selected files already exist in this row");
        return;
      }
    } else {
      updatedDocuments[index].files = fileArray;
      toast.success(`${fileArray.length} file(s) selected successfully`);
    }

    setNewDocuments(updatedDocuments);
  };

  // Remove a specific file from a new document row
  const removeFileFromRow = (rowIndex, fileIndex) => {
    const updatedDocuments = [...newDocuments];
    updatedDocuments[rowIndex].files.splice(fileIndex, 1);

    // If no files left, set to empty array
    if (updatedDocuments[rowIndex].files.length == 0) {
      updatedDocuments[rowIndex].files = [];
    }

    setNewDocuments(updatedDocuments);
    toast.success("File removed");
  };

  const handleDescriptionChange = (index, description) => {
    const updatedDocuments = [...newDocuments];
    updatedDocuments[index].description = description;
    setNewDocuments(updatedDocuments);
  };

  const addNewDocumentRow = () => {
    setNewDocuments([
      ...newDocuments,
      {
        files: [],
        description: "",
        id: Date.now() + Math.random(),
      },
    ]);
  };

  const removeDocumentRow = (index) => {
    if (newDocuments.length == 1) {
      setNewDocuments([{ files: [], description: "", id: Date.now() }]);
    } else {
      setNewDocuments(newDocuments.filter((_, i) => i != index));
    }
  };

  // Handle delete existing document
  const handleDeleteDocument = async (doc) => {
    const docId = doc.doc_lib_id || doc.id;

    const result = await Swal.fire({
      title: "Delete Document?",
      text: "Are you sure you want to delete this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      // Show loading state
      toast.loading("Deleting document...", { id: "delete-doc" });

      // Call delete API
      await TenderEntryApi.deleteDocument(docId);

      // Remove from formData.Documents
      setFormData((prev) => ({
        ...prev,
        Documents: prev.Documents.filter((d) => d != doc),
      }));

      toast.success("Document deleted successfully!", { id: "delete-doc" });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document. Please try again.", {
        id: "delete-doc",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.TnT_ID) {
      newErrors.TnT_ID = "Tender work selection is required";
    }

    if (!formData.Dpt_id) {
      newErrors.Dpt_id = "Branch selection is required";
    }

    if (!formData.Bh_Id) {
      newErrors.Bh_Id = "Budget head selection is required";
    }

    if (!formData.Lg_Id) {
      newErrors.Lg_Id = "Ledger account selection is required";
    }

    if (!formData.TE_St_Date) {
      newErrors.TE_St_Date = "Date is required";
    }

    // NEW FIELD: TE_Date validation (optional, no validation required)
    if (formData.TE_Date && !/^\d{4}-\d{2}-\d{2}$/.test(formData.TE_Date)) {
      newErrors.TE_Date = "Invalid date format";
    }

    if (!formData.Proposal_Amount) {
      newErrors.Proposal_Amount = "Proposal amount is required";
    } else if (parseFloat(formData.Proposal_Amount) <= 0) {
      newErrors.Proposal_Amount = "Proposal amount must be greater than 0";
    }

    if (formData.Approved_Amount && parseFloat(formData.Approved_Amount) < 0) {
      newErrors.Approved_Amount = "Approved amount cannot be negative";
    }

    if (formData.BG_Per && parseFloat(formData.BG_Per) < 0) {
      newErrors.BG_Per = "BG percentage cannot be negative";
    }

    if (formData.EMD_Per && parseFloat(formData.EMD_Per) < 0) {
      newErrors.EMD_Per = "EMD percentage cannot be negative";
    }

    if (formData.TE_Fee && parseFloat(formData.TE_Fee) < 0) {
      newErrors.TE_Fee = "Tender fee cannot be negative";
    }

    if (!formData.Description || formData.Description.trim() == "") {
      newErrors.Description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fncId) {
      console.warn("Fnc_Id not loaded from menu details");
    }

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Tender Entry?" : "Create New Tender Entry?",
      text: isEditMode
        ? "Are you sure you want to update this tender entry?"
        : "Are you sure you want to create this new tender entry?",
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
        // ====  EDIT MODE - JSON with ALL documents (existing + new) =====

        // Prepare JSON data with new fields
        const jsonData = {
          TnT_ID: formData.TnT_ID,
          Dpt_id: formData.Dpt_id,
          Bh_Id: formData.Bh_Id,
          Lg_Id: formData.Lg_Id,
          Proposal_Amount: formData.Proposal_Amount,
          Approved_Amount: formData.Approved_Amount || null,
          TE_St_Date: formData.TE_St_Date,
          TE_Date: formData.TE_Date || null, // NEW FIELD
          TE_Ed_Date: formData.TE_Ed_Date || null,
          BG_Per: formData.BG_Per || null,
          EMD_Per: formData.EMD_Per || null,
          TE_Fee: formData.TE_Fee || null,
          Description: formData.Description,
          Fnc_Id: fncId || "",
        };

        let docIndex = 0;

        // 1. Add existing documents (base64) - jo abhi bhi formData.Documents mein hain
        formData.Documents.forEach((doc) => {
          const base64Content = doc.content || doc.base64;
          jsonData[`Documents[${docIndex}]`] = base64Content;
          jsonData[`Documents_description[${docIndex}]`] =
            doc.description || "";
          docIndex++;
        });

        // 2. Add new documents (convert to base64) - only if they exist
        const hasNewFiles = newDocuments.some(
          (doc) => doc.files && doc.files.length > 0,
        );

        if (hasNewFiles) {
          const filePromises = [];

          newDocuments.forEach((doc) => {
            if (doc.files && doc.files.length > 0) {
              doc.files.forEach((file) => {
                const promise = new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () =>
                    resolve({
                      base64: reader.result,
                      description: doc.description,
                    });
                  reader.onerror = reject;
                });
                filePromises.push(promise);
              });
            }
          });

          const convertedFiles = await Promise.all(filePromises);

          // Add converted files to jsonData with sequential indices
          convertedFiles.forEach((file) => {
            jsonData[`Documents[${docIndex}]`] = file.base64;
            jsonData[`Documents_description[${docIndex}]`] = file.description;
            docIndex++;
          });
        }

        response = await TenderEntryApi.update(id, jsonData);
        toast.success("Tender entry updated successfully!");
      } else {
        // ====  CREATE MODE - FormData with binary files =====
        const formDataObj = new FormData();

        // Basic fields
        formDataObj.append("TnT_ID", formData.TnT_ID);
        formDataObj.append("Dpt_id", formData.Dpt_id);
        formDataObj.append("Bh_Id", formData.Bh_Id);
        formDataObj.append("Lg_Id", formData.Lg_Id);
        formDataObj.append("Proposal_Amount", formData.Proposal_Amount);
        formDataObj.append("Fnc_Id", fncId || "");

        if (formData.Approved_Amount) {
          formDataObj.append("Approved_Amount", formData.Approved_Amount);
        }

        formDataObj.append("TE_St_Date", formData.TE_St_Date);

        // NEW FIELD
        if (formData.TE_Date) {
          formDataObj.append("TE_Date", formData.TE_Date);
        }

        if (formData.TE_Ed_Date) {
          formDataObj.append("TE_Ed_Date", formData.TE_Ed_Date);
        }

        if (formData.BG_Per) {
          formDataObj.append("BG_Per", formData.BG_Per);
        }

        if (formData.EMD_Per) {
          formDataObj.append("EMD_Per", formData.EMD_Per);
        }

        if (formData.TE_Fee) {
          formDataObj.append("TE_Fee", formData.TE_Fee);
        }

        formDataObj.append("Description", formData.Description);

        // Add new files (binary) - only if they exist
        let fileIndex = 0;
        newDocuments.forEach((doc) => {
          if (doc.files && doc.files.length > 0) {
            doc.files.forEach((file) => {
              formDataObj.append(`Documents[${fileIndex}]`, file);
              formDataObj.append(
                `Documents_description[${fileIndex}]`,
                doc.description,
              );
              fileIndex++;
            });
          }
        });

        response = await TenderEntryApi.create(formDataObj);
        toast.success("Tender entry created successfully!");
      }

      setTimeout(() => {
        navigate("/transactions/tender-management/tenderentry");
      }, 1500);
    } catch (error) {
      console.error("Error saving tender entry:", error);

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
              ? "Failed to update tender entry. Please try again."
              : "Failed to create tender entry. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/tender-management/tenderentry");
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "📎";
    const ext = fileName.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "🖼️";
    return "📎";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const openDocument = (doc) => {
    if (doc.url) {
      // If it's a URL, open in new tab
      window.open(doc.url, "_blank", "noopener,noreferrer");
    } else if (doc.content || doc.base64) {
      // If it's base64 content, create a blob and open
      try {
        const base64Content = doc.content || doc.base64;
        // Remove data URL prefix if present
        const base64Data = base64Content.includes("base64,")
          ? base64Content.split("base64,")[1]
          : base64Content;

        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: doc.type || "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (error) {
        console.error("Error opening base64 document:", error);
        toast.error("Failed to open document");
      }
    }
  };

  const downloadBase64Document = (doc) => {
    try {
      const base64Content = doc.content || doc.base64;
      // Remove data URL prefix if present
      const base64Data = base64Content.includes("base64,")
        ? base64Content.split("base64,")[1]
        : base64Content;

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: doc.type || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = doc.name || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error downloading base64 document:", error);
      toast.error("Failed to download document");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tender entry data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/tender-management/tenderentry")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Tender Entry" : "New Tender Entry"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update tender entry information"
                : "Create new tender entry"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tender Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tender Entry Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NEW FIELD: Tender Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tender Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={teDateRef}
                  type="date"
                  name="TE_Date"
                  value={formData.TE_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, tenderWorkButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.TE_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.TE_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.TE_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TE_Date}
                </p>
              )}
            </div>

            {/* Tender Work Dropdown */}
            <SearchableDropdown
              label="Tender Work"
              value={formData.TnT_ID}
              error={errors.TnT_ID}
              required={true}
              icon={Briefcase}
              isOpen={isTenderWorkDropdownOpen}
              setIsOpen={setIsTenderWorkDropdownOpen}
              searchTerm={tenderWorkSearchTerm}
              setSearchTerm={setTenderWorkSearchTerm}
              items={dropdownData.tenderWorks}
              filteredItems={filteredTenderWorks}
              highlightedIndex={tenderWorkHighlightedIndex}
              onSelect={(item) => handleTenderWorkSelect(item.TnT_ID)}
              onKeyDown={handleTenderWorkKeyDown}
              onSearchKeyDown={handleTenderWorkSearchKeyDown}
              onItemKeyDown={handleTenderWorkItemKeyDown}
              getSelectedDisplay={getSelectedTenderWorkName}
              loading={loadingDropdowns}
              placeholder="Select Tender Work"
              searchPlaceholder="Search by work name or code..."
              buttonRef={tenderWorkButtonRef}
              dropdownRef={tenderWorkDropdownRef}
              searchRef={tenderWorkSearchRef}
              itemRefs={tenderWorkItemRefs}
              listRef={tenderWorkListRef}
              renderItem={(work) => (
                <div className="py-1">
                  <div className="font-medium text-gray-900">
                    {work.work_name || "No Name"}
                  </div>
                  {work.TnT_Code && (
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                        {work.TnT_Code}
                      </span>
                    </div>
                  )}
                </div>
              )}
            />

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateInputRef}
                  type="date"
                  name="TE_St_Date"
                  value={formData.TE_St_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, teDateRef)} // Changed to focus on TE_Date
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.TE_St_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {errors.TE_St_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.TE_St_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TE_St_Date}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={teEdDateRef}
                  type="date"
                  name="TE_Ed_Date"
                  value={formData.TE_Ed_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, bgPerRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.TE_Ed_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.TE_Ed_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.TE_Ed_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TE_Ed_Date}
                </p>
              )}
            </div>

            {/* Branch Dropdown */}
            <SearchableDropdown
              label="Branch"
              value={formData.Dpt_id}
              error={errors.Dpt_id}
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

            {/* Budget Head Dropdown */}
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
                formData.Dpt_id ? "Select Budget Head" : "Select Branch first"
              }
              searchPlaceholder="Search by name or code..."
              buttonRef={budgetHeadButtonRef}
              dropdownRef={budgetHeadDropdownRef}
              searchRef={budgetHeadSearchRef}
              itemRefs={budgetHeadItemRefs}
              listRef={budgetHeadListRef}
              renderItem={renderBudgetHeadItem}
              disabled={!formData.Dpt_id}
            />

            {/* Ledger Dropdown */}
            <SearchableDropdown
              label="Ledger Account"
              value={formData.Lg_Id}
              error={errors.Lg_Id}
              required={true}
              icon={Layers}
              isOpen={isLedgerDropdownOpen}
              setIsOpen={setIsLedgerDropdownOpen}
              searchTerm={ledgerSearchTerm}
              setSearchTerm={setLedgerSearchTerm}
              items={dropdownData.ledgerAccounts}
              filteredItems={filteredLedgerAccounts}
              highlightedIndex={ledgerHighlightedIndex}
              onSelect={(item) => handleLedgerSelect(item.Lg_Id)}
              onKeyDown={handleLedgerKeyDown}
              onSearchKeyDown={handleLedgerSearchKeyDown}
              onItemKeyDown={handleLedgerItemKeyDown}
              getSelectedDisplay={getSelectedLedgerName}
              loading={loadingLedgers}
              placeholder={
                formData.Bh_Id
                  ? "Select Ledger Account"
                  : "Select Budget Head first"
              }
              searchPlaceholder="Search by name, english name or code..."
              buttonRef={ledgerButtonRef}
              dropdownRef={ledgerDropdownRef}
              searchRef={ledgerSearchRef}
              itemRefs={ledgerItemRefs}
              listRef={ledgerListRef}
              renderItem={renderLedgerItem}
              disabled={!formData.Bh_Id}
            />

            {/* Proposal Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposal Amount (₹) *
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </div>
                <input
                  ref={proposalAmountRef}
                  type="text"
                  name="Proposal_Amount"
                  value={formData.Proposal_Amount}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, approvedAmountRef)}
                  className={`w-full pl-6 pr-4 py-2.5 border ${
                    errors.Proposal_Amount
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter proposal amount"
                  required
                />
                {errors.Proposal_Amount && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Proposal_Amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Proposal_Amount}
                </p>
              )}
            </div>

            {/* Approved Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approved Amount (₹)
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </div>
                <input
                  ref={approvedAmountRef}
                  type="text"
                  name="Approved_Amount"
                  value={formData.Approved_Amount}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, teEdDateRef)}
                  className={`w-full pl-6 pr-4 py-2.5 border ${
                    errors.Approved_Amount
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter approved amount"
                />
                {errors.Approved_Amount && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Approved_Amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Approved_Amount}
                </p>
              )}
            </div>

            {/* BG Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BG Percentage (%)
              </label>
              <div className="relative">
                <input
                  ref={bgPerRef}
                  type="text"
                  name="BG_Per"
                  value={formData.BG_Per}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, emdPerRef)}
                  className={`w-full px-4 py-2.5 border ${
                    errors.BG_Per ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter BG percentage"
                />
                {errors.BG_Per && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.BG_Per && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.BG_Per}
                </p>
              )}
            </div>

            {/* EMD Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EMD Percentage (%)
              </label>
              <div className="relative">
                <input
                  ref={emdPerRef}
                  type="text"
                  name="EMD_Per"
                  value={formData.EMD_Per}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, teFeeRef)}
                  className={`w-full px-4 py-2.5 border ${
                    errors.EMD_Per ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter EMD percentage"
                />
                {errors.EMD_Per && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.EMD_Per && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.EMD_Per}
                </p>
              )}
            </div>

            {/* Tender Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tender Fee (₹)
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ₹
                </div>
                <input
                  ref={teFeeRef}
                  type="text"
                  name="TE_Fee"
                  value={formData.TE_Fee}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, descriptionRef)}
                  className={`w-full pl-6 pr-4 py-2.5 border ${
                    errors.TE_Fee ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter tender fee"
                />
                {errors.TE_Fee && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.TE_Fee && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.TE_Fee}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                ref={descriptionRef}
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                rows="4"
                className={`w-full p-3 border ${
                  errors.Description ? "border-red-300" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter tender description..."
                required
              />
              {errors.Description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Description}
                </p>
              )}
            </div>

            {/* Document Upload Section */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Reference Documents
                  <span className="text-xs text-gray-500 ml-2">
                    (PDF, Word, Excel, Images - max 10MB each, multiple files
                    allowed)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={addNewDocumentRow}
                  className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add More
                </button>
              </div>

              {/* Existing Documents (for edit mode) */}
              {isEditMode && formData.Documents.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Existing Documents ({formData.Documents.length})
                  </h4>
                  <div className="space-y-3">
                    {formData.Documents.map((doc, index) => {
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start flex-1">
                              <span className="text-xl mr-3">
                                {getFileIcon(doc.name)}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h5 className="font-medium text-gray-900">
                                    {doc.name}
                                  </h5>
                                  <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                    Existing
                                  </span>
                                </div>
                                {doc.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {doc.description}
                                  </p>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  <span>Type: {doc.type}</span>
                                  <span className="mx-2">•</span>
                                  <button
                                    type="button"
                                    onClick={() => openDocument(doc)}
                                    className="text-blue-600 hover:underline inline-flex items-center"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </button>
                                  <span className="mx-2">•</span>
                                  {doc.url ? (
                                    <a
                                      href={doc.url}
                                      download
                                      className="text-green-600 hover:underline inline-flex items-center"
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </a>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        downloadBase64Document(doc)
                                      }
                                      className="text-green-600 hover:underline inline-flex items-center"
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete document"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click the delete button to permanently remove a document.
                  </p>
                </div>
              )}

              {/* New Document Upload Rows */}
              <div className="space-y-4">
                {newDocuments.map((doc, index) => (
                  <div
                    key={doc.id}
                    className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        {isEditMode
                          ? "Add New Document Row"
                          : `Document Row #${index + 1}`}
                      </h4>
                      {newDocuments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDocumentRow(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove this document row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* File Upload - Multiple files */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Files {isEditMode ? "(New)" : ""}
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            multiple
                            onChange={(e) =>
                              handleFileChange(index, e.target.files)
                            }
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            You can select multiple files at once
                          </p>
                        </div>

                        {/* Show selected files preview */}
                        {doc.files && doc.files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Selected Files ({doc.files.length}):
                            </p>
                            {doc.files.map((file, fileIndex) => (
                              <div
                                key={fileIndex}
                                className="p-2 bg-white border border-green-200 rounded-lg flex items-center justify-between"
                              >
                                <div className="flex items-center flex-1">
                                  <span className="text-lg mr-2">
                                    {getFileIcon(file.name)}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(file.size)} • {file.type}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFileFromRow(index, fileIndex)
                                  }
                                  className="text-red-600 hover:text-red-800 p-1 ml-2"
                                  title="Remove this file"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Description - Common for all files in this row */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Document Description (for all files in this row)
                        </label>
                        <div className="relative">
                          <textarea
                            value={doc.description}
                            onChange={(e) =>
                              handleDescriptionChange(index, e.target.value)
                            }
                            rows="2"
                            className={`w-full p-3 border ${
                              errors[`documentDesc_${index}`]
                                ? "border-red-300"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            placeholder="Enter description for these documents (optional)..."
                          />
                          {errors[`documentDesc_${index}`] && (
                            <AlertCircle className="absolute right-2 top-2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {errors[`documentDesc_${index}`] && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors[`documentDesc_${index}`]}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          This description will apply to all files in this row
                          (optional)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fnc_Id warning if not loaded (optional) */}
        {!fncId && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              Note: Function ID not found. Some features may not work properly.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isEditMode
                ? "Existing documents can be deleted. New documents can be added."
                : "Note: You can add multiple files per row and multiple rows. Documents are optional."}
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
                  {isEditMode ? "Update Tender" : "Create Tender"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditTenderEntry;
