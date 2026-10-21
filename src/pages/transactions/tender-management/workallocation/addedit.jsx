// src/pages/Transactions/TenderManagement/WorkAllocation/AddEdit.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  DollarSign,
  AlertCircle,
  Upload,
  Trash2,
  Paperclip,
  Briefcase,
  Users,
  Info,
  Calendar,
  Hash,
  FileCheck,
  Building,
  PieChart,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Layers,
  XCircle,
  Loader,
  Download,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { WorkAllocationApi } from "../../../services/workallocationapi";

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
            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId =
                  item?.Dpt_id ||
                  item?.Lg_Id ||
                  item?.TE_Id ||
                  item?.SL_Id ||
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
              <span>{filteredItems?.length || 0} items found</span>
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

const AddEditWorkAllocation = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingLedgers, setLoadingLedgers] = useState(false);
  const [loadingTenders, setLoadingTenders] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [fncId, setFncId] = useState(null);

  const [selectedTender, setSelectedTender] = useState(null);
  const [currentAllocationAmount, setCurrentAllocationAmount] = useState(0);

  // Tree-structured data for branches
  const [flattenedBranches, setFlattenedBranches] = useState([]);

  // Department → Ledger → Tender structure data
  const [hierarchicalData, setHierarchicalData] = useState([]);

  const [dropdownData, setDropdownData] = useState({
    branches: [],
    vendors: [],
  });

  // Branch dropdown states with keyboard navigation
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchHighlightedIndex, setBranchHighlightedIndex] = useState(-1);
  const branchDropdownRef = useRef(null);
  const branchSearchRef = useRef(null);
  const branchItemRefs = useRef([]);
  const branchListRef = useRef(null);
  const branchButtonRef = useRef(null);

  // Ledger dropdown states with keyboard navigation
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
  const [ledgerHighlightedIndex, setLedgerHighlightedIndex] = useState(-1);
  const ledgerDropdownRef = useRef(null);
  const ledgerSearchRef = useRef(null);
  const ledgerItemRefs = useRef([]);
  const ledgerListRef = useRef(null);
  const ledgerButtonRef = useRef(null);

  // Tender dropdown states with keyboard navigation
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [tenderSearchTerm, setTenderSearchTerm] = useState("");
  const [isTenderDropdownOpen, setIsTenderDropdownOpen] = useState(false);
  const [tenderHighlightedIndex, setTenderHighlightedIndex] = useState(-1);
  const tenderDropdownRef = useRef(null);
  const tenderSearchRef = useRef(null);
  const tenderItemRefs = useRef([]);
  const tenderListRef = useRef(null);
  const tenderButtonRef = useRef(null);

  // Vendor dropdown states with keyboard navigation
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorHighlightedIndex, setVendorHighlightedIndex] = useState(-1);
  const vendorDropdownRef = useRef(null);
  const vendorSearchRef = useRef(null);
  const vendorItemRefs = useRef([]);
  const vendorListRef = useRef(null);
  const vendorButtonRef = useRef(null);
  const [vendorDropdownKey, setVendorDropdownKey] = useState(0); // Add key for forcing re-render

  // Refs for focus management
  const woDateRef = useRef(null);
  const grossAmountRef = useRef(null);
  const refIdRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    WO_Date: new Date().toISOString().split("T")[0],
    Dpt_id: "",
    Lg_Id: "",
    tenderId: "",
    vendorId: "",
    grossAmount: "",
    refId: "",
    WA_Documents: [],
  });

  // Separate state for new documents to upload
  const [newDocuments, setNewDocuments] = useState([
    {
      files: [],
      description: "",
      id: Date.now(),
    },
  ]);

  // Get Fnc_Id from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/tender-management/workallocation";

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
      loadAllocationData();
    }

    // Close dropdowns when clicking outside
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
        tenderDropdownRef.current &&
        !tenderDropdownRef.current.contains(event.target)
      ) {
        setIsTenderDropdownOpen(false);
        setTenderHighlightedIndex(-1);
        setTenderSearchTerm("");
      }
      if (
        vendorDropdownRef.current &&
        !vendorDropdownRef.current.contains(event.target)
      ) {
        setIsVendorDropdownOpen(false);
        setVendorHighlightedIndex(-1);
        setVendorSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  // Focus on WO_Date field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => woDateRef.current?.focus(), 100);
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
    if (isTenderDropdownOpen && tenderSearchRef.current) {
      setTimeout(() => tenderSearchRef.current.focus(), 0);
    }
  }, [isTenderDropdownOpen]);

  useEffect(() => {
    if (isVendorDropdownOpen && vendorSearchRef.current) {
      setTimeout(() => vendorSearchRef.current.focus(), 0);
    }
  }, [isVendorDropdownOpen]);

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
      ledgerListRef,
      ledgerItemRefs,
      ledgerHighlightedIndex,
      isLedgerDropdownOpen,
    );
  }, [ledgerHighlightedIndex, isLedgerDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      tenderListRef,
      tenderItemRefs,
      tenderHighlightedIndex,
      isTenderDropdownOpen,
    );
  }, [tenderHighlightedIndex, isTenderDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      vendorListRef,
      vendorItemRefs,
      vendorHighlightedIndex,
      isVendorDropdownOpen,
    );
  }, [vendorHighlightedIndex, isVendorDropdownOpen]);

  // Update selections when hierarchical data loads in edit mode
  useEffect(() => {
    if (isEditMode && hierarchicalData.length > 0) {
      if (formData.Dpt_id) {
        const branch = hierarchicalData.find(
          (b) => b.Dpt_id?.toString() == formData.Dpt_id,
        );

        if (branch) {
          const ledgers = branch.ledgers || [];
          setFilteredLedgers(ledgers);

          if (formData.Lg_Id) {
            const ledger = ledgers.find(
              (l) => l.Lg_Id?.toString() == formData.Lg_Id,
            );

            if (ledger) {
              const tenders = ledger.tender_entries || [];
              setFilteredTenders(tenders);

              if (formData.tenderId) {
                const tender = tenders.find(
                  (t) => t.TE_Id?.toString() == formData.tenderId,
                );

                if (tender) {
                  updateSelectedTender(tender);
                }
              }
            }
          }
        }
      }
    }
  }, [
    hierarchicalData,
    isEditMode,
    formData.Dpt_id,
    formData.Lg_Id,
    formData.tenderId,
  ]);

  // Filter branches with hierarchy
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

  // Filter ledgers
  useEffect(() => {
    if (!formData.Dpt_id) {
      setFilteredLedgers([]);
      return;
    }

    if (!ledgerSearchTerm.trim()) {
      const branch = hierarchicalData.find(
        (b) => b.Dpt_id?.toString() == formData.Dpt_id,
      );
      setFilteredLedgers(branch?.ledgers || []);
    } else {
      const term = ledgerSearchTerm.toLowerCase();
      const branch = hierarchicalData.find(
        (b) => b.Dpt_id?.toString() == formData.Dpt_id,
      );
      const ledgers = branch?.ledgers || [];

      const filtered = ledgers.filter(
        (ledger) =>
          ledger.Lg_Name?.toLowerCase().includes(term) ||
          (ledger.Lg_Eng_Name &&
            ledger.Lg_Eng_Name.toLowerCase().includes(term)) ||
          (ledger.Lg_Code && ledger.Lg_Code.toLowerCase().includes(term)),
      );
      setFilteredLedgers(filtered);
    }
    setLedgerHighlightedIndex(-1);
  }, [ledgerSearchTerm, hierarchicalData, formData.Dpt_id]);

  // Filter tenders
  useEffect(() => {
    if (!formData.Dpt_id || !formData.Lg_Id) {
      setFilteredTenders([]);
      return;
    }

    if (!tenderSearchTerm.trim()) {
      const branch = hierarchicalData.find(
        (b) => b.Dpt_id?.toString() == formData.Dpt_id,
      );
      const ledger = branch?.ledgers?.find(
        (l) => l.Lg_Id?.toString() == formData.Lg_Id,
      );
      setFilteredTenders(ledger?.tender_entries || []);
    } else {
      const term = tenderSearchTerm.toLowerCase();
      const branch = hierarchicalData.find(
        (b) => b.Dpt_id?.toString() == formData.Dpt_id,
      );
      const ledger = branch?.ledgers?.find(
        (l) => l.Lg_Id?.toString() == formData.Lg_Id,
      );
      const tenders = ledger?.tender_entries || [];

      const filtered = tenders.filter(
        (tender) =>
          tender.Description?.toLowerCase().includes(term) ||
          tender.Proposal_Amount?.toString().includes(term),
      );
      setFilteredTenders(filtered);
    }
    setTenderHighlightedIndex(-1);
  }, [tenderSearchTerm, hierarchicalData, formData.Dpt_id, formData.Lg_Id]);

  // =============  FIXED: VENDOR FILTERING ==============
  useEffect(() => {
    console.log("Vendor filtering triggered:", {
      vendorSearchTerm,
      totalVendors: dropdownData.vendors?.length,
      hasVendors: dropdownData.vendors && dropdownData.vendors.length > 0,
    });

    // Check if vendors exist
    if (!dropdownData.vendors || dropdownData.vendors.length == 0) {
      console.log("No vendors available");
      setFilteredVendors([]);
      return;
    }

    let newFilteredVendors;

    // If search term is empty, show all vendors
    if (!vendorSearchTerm || vendorSearchTerm.trim() == "") {
      console.log(
        "No search term, showing all vendors:",
        dropdownData.vendors.length,
      );
      newFilteredVendors = [...dropdownData.vendors];
    } else {
      // Filter vendors based on search term
      const term = vendorSearchTerm.toLowerCase().trim();
      console.log("Filtering with term:", term);

      newFilteredVendors = dropdownData.vendors.filter((vendor) => {
        // Check multiple fields for matches with null checks
        const nameMatch =
          vendor?.SL_Name?.toLowerCase().includes(term) || false;
        const codeMatch =
          vendor?.SL_Code?.toLowerCase().includes(term) || false;

        return nameMatch || codeMatch;
      });
    }

    console.log("Filtered vendors count:", newFilteredVendors.length);
    setFilteredVendors(newFilteredVendors);
    setVendorHighlightedIndex(-1);
    // Force re-render by updating key
    setVendorDropdownKey((prev) => prev + 1);
  }, [vendorSearchTerm, dropdownData.vendors]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Fetch department → ledger → tender structure
      const structure = await WorkAllocationApi.getDepartmentLedgerTenders();
      setHierarchicalData(structure || []);

      // Extract branches from the structure
      const branches = structure.map((item) => ({
        Dpt_id: item.Dpt_id,
        Dpt_Desc: item.Dpt_Desc,
        Dpt_Name: item.Dpt_Name,
        GrStt: item.GrStt,
        GrCod: item.GrCod,
        UpGrp: item.UpGrp,
      }));

      setDropdownData((prev) => ({
        ...prev,
        branches: branches || [],
      }));

      // Fetch vendors separately
      const vendors = await WorkAllocationApi.getVendors();
      console.log("Vendors loaded:", vendors); // Debug log

      setDropdownData((prev) => ({
        ...prev,
        vendors: vendors || [],
      }));

      // Important: Also set filteredVendors initially to show all vendors
      setFilteredVendors(vendors || []);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadAllocationData = async () => {
    setLoading(true);
    try {
      const data = await WorkAllocationApi.getById(id);
      const allocation = data.allocation || data;

      if (allocation) {
        // Format WO_Date to YYYY-MM-DD
        let woDate = allocation.WO_Date;
        if (woDate) {
          try {
            const date = new Date(woDate);
            if (!isNaN(date.getTime())) {
              woDate = date.toISOString().split("T")[0];
            }
          } catch (e) {
            console.error("Error parsing date:", e);
          }
        } else {
          woDate = new Date().toISOString().split("T")[0];
        }

        setFormData({
          WO_Date: woDate,
          Dpt_id: allocation.Dpt_id?.toString() || "",
          Lg_Id: allocation.Lg_Id?.toString() || "",
          tenderId: allocation.TE_Id?.toString() || "",
          vendorId: allocation.SL_Id?.toString() || "",
          grossAmount: allocation.WO_Amount?.toString() || "",
          refId: allocation.WA_RefId || "",
          WA_Documents: allocation.WA_Documents || [],
        });

        setCurrentAllocationAmount(parseFloat(allocation.WO_Amount) || 0);
      }
    } catch (error) {
      console.error("Error loading work allocation:", error);
      toast.error("Failed to load work allocation data!");
      navigate("/transactions/tender-management/workallocation");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update selected tender
  const updateSelectedTender = (tender) => {
    if (!tender) {
      setSelectedTender(null);
      return;
    }

    const baseAmount = tender.Approved_Amount
      ? parseFloat(tender.Approved_Amount)
      : parseFloat(tender.Proposal_Amount || 0);

    const remainingAmount = parseFloat(tender.remaining_amount || 0);

    let totalAllocated = baseAmount - remainingAmount;
    let availableAmount = remainingAmount;

    if (isEditMode && tender.TE_Id?.toString() == formData.tenderId) {
      availableAmount = remainingAmount + currentAllocationAmount;
      totalAllocated = baseAmount - (remainingAmount + currentAllocationAmount);
    }

    setSelectedTender({
      id: tender.TE_Id,
      description: tender.Description,
      baseAmount: baseAmount,
      proposalAmount: parseFloat(tender.Proposal_Amount || 0),
      approvedAmount: tender.Approved_Amount
        ? parseFloat(tender.Approved_Amount)
        : null,
      remainingAmount: parseFloat(tender.remaining_amount || 0),
      availableAmount: availableAmount,
      totalAllocated: totalAllocated,
      tenderNo: `TEN-${tender.TE_Id}`,
      tenderDate: tender.Tnd_Date || "N/A",
    });
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

  // Branch keyboard handlers
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

  const handleBranchSelect = (branch) => {
    const branchId = branch.Dpt_id?.toString();
    setFormData((prev) => ({
      ...prev,
      Dpt_id: branchId,
      Lg_Id: "",
      tenderId: "",
    }));
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm("");
    setBranchHighlightedIndex(-1);

    // Reset filtered ledgers and tenders
    setFilteredLedgers([]);
    setFilteredTenders([]);
    setSelectedTender(null);

    if (errors.Dpt_id) {
      setErrors((prev) => ({ ...prev, Dpt_id: "" }));
    }

    // Load ledgers for selected branch
    loadLedgersByBranch(branchId);

    setTimeout(() => ledgerButtonRef.current?.focus(), 100);
  };

  // Load ledgers by branch
  const loadLedgersByBranch = (branchId) => {
    setLoadingLedgers(true);

    const branch = hierarchicalData.find(
      (b) => b.Dpt_id?.toString() == branchId.toString(),
    );
    const ledgers = branch?.ledgers || [];

    setFilteredLedgers(ledgers);
    setLoadingLedgers(false);
  };

  // Ledger keyboard handlers
  const handleLedgerKeyDown = (e) => {
    if (!formData.Dpt_id) {
      toast.error("Please select a branch first");
      return;
    }

    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
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
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredLedgers.length > 0 && ledgerHighlightedIndex >= 0) {
        handleLedgerSelect(filteredLedgers[ledgerHighlightedIndex]);
      } else if (filteredLedgers.length > 0) {
        handleLedgerSelect(filteredLedgers[0]);
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
      handleLedgerSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    }
  };

  const handleLedgerSelect = (ledger) => {
    setFormData((prev) => ({
      ...prev,
      Lg_Id: ledger.Lg_Id?.toString(),
      tenderId: "",
    }));
    setIsLedgerDropdownOpen(false);
    setLedgerSearchTerm("");
    setLedgerHighlightedIndex(-1);

    // Reset filtered tenders
    setFilteredTenders([]);
    setSelectedTender(null);

    if (errors.Lg_Id) {
      setErrors((prev) => ({ ...prev, Lg_Id: "" }));
    }

    // Load tenders for selected ledger
    loadTendersByLedger(ledger.Lg_Id);

    setTimeout(() => tenderButtonRef.current?.focus(), 100);
  };

  const getSelectedLedgerName = () => {
    if (!formData.Lg_Id || !formData.Dpt_id) return "";

    const branch = hierarchicalData.find(
      (b) => b.Dpt_id?.toString() == formData.Dpt_id,
    );
    const selectedLedger = branch?.ledgers?.find(
      (ledger) => ledger.Lg_Id?.toString() == formData.Lg_Id,
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

  // Load tenders by ledger
  const loadTendersByLedger = (ledgerId) => {
    setLoadingTenders(true);

    const branch = hierarchicalData.find(
      (b) => b.Dpt_id?.toString() == formData.Dpt_id,
    );
    const ledger = branch?.ledgers?.find(
      (l) => l.Lg_Id?.toString() == ledgerId.toString(),
    );
    const tenders = ledger?.tender_entries || [];

    setFilteredTenders(tenders);
    setLoadingTenders(false);
  };

  // Tender keyboard handlers
  const handleTenderKeyDown = (e) => {
    if (!formData.Lg_Id) {
      toast.error("Please select a ledger first");
      return;
    }

    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
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
      if (filteredTenders.length > 0) {
        setTenderHighlightedIndex(0);
        setTimeout(() => {
          if (tenderItemRefs.current[0]) {
            tenderItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderDropdownOpen(false);
      setTenderHighlightedIndex(-1);
      setTenderSearchTerm("");
      tenderButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredTenders.length > 0 && tenderHighlightedIndex >= 0) {
        handleTenderSelect(filteredTenders[tenderHighlightedIndex]);
      } else if (filteredTenders.length > 0) {
        handleTenderSelect(filteredTenders[0]);
      }
    }
  };

  const handleTenderItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredTenders.length) {
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
      handleTenderSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderDropdownOpen(false);
      setTenderHighlightedIndex(-1);
      setTenderSearchTerm("");
      tenderButtonRef.current?.focus();
    }
  };

  const handleTenderSelect = (tender) => {
    setFormData((prev) => ({
      ...prev,
      tenderId: tender.TE_Id?.toString(),
      grossAmount: "",
    }));
    setIsTenderDropdownOpen(false);
    setTenderSearchTerm("");
    setTenderHighlightedIndex(-1);

    // Update selected tender
    if (tender) {
      if (isEditMode && tender.TE_Id?.toString() != formData.tenderId) {
        setCurrentAllocationAmount(0);
      }
      updateSelectedTender(tender);
    } else {
      setSelectedTender(null);
    }

    if (errors.tenderId) {
      setErrors((prev) => ({ ...prev, tenderId: "" }));
    }
    if (errors.grossAmount) {
      setErrors((prev) => ({ ...prev, grossAmount: "" }));
    }

    setTimeout(() => vendorButtonRef.current?.focus(), 100);
  };

  const getSelectedTenderName = () => {
    if (!formData.tenderId || !formData.Dpt_id || !formData.Lg_Id) return "";

    const branch = hierarchicalData.find(
      (b) => b.Dpt_id?.toString() == formData.Dpt_id,
    );
    const ledger = branch?.ledgers?.find(
      (l) => l.Lg_Id?.toString() == formData.Lg_Id,
    );
    const tender = ledger?.tender_entries?.find(
      (t) => t.TE_Id?.toString() == formData.tenderId,
    );

    return tender ? tender.Description : "";
  };

  // Vendor keyboard handlers
  const handleVendorKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
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
      if (filteredVendors.length > 0) {
        setVendorHighlightedIndex(0);
        setTimeout(() => {
          if (vendorItemRefs.current[0]) {
            vendorItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsVendorDropdownOpen(false);
      setVendorHighlightedIndex(-1);
      setVendorSearchTerm("");
      vendorButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredVendors.length > 0 && vendorHighlightedIndex >= 0) {
        handleVendorSelect(filteredVendors[vendorHighlightedIndex]);
      } else if (filteredVendors.length > 0) {
        handleVendorSelect(filteredVendors[0]);
      }
    }
  };

  const handleVendorItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredVendors.length) {
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
      handleVendorSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsVendorDropdownOpen(false);
      setVendorHighlightedIndex(-1);
      setVendorSearchTerm("");
      vendorButtonRef.current?.focus();
    }
  };

  const handleVendorSelect = (vendor) => {
    setFormData((prev) => ({
      ...prev,
      vendorId: vendor.SL_Id?.toString(),
    }));
    setIsVendorDropdownOpen(false);
    setVendorSearchTerm("");
    setVendorHighlightedIndex(-1);

    if (errors.vendorId) {
      setErrors((prev) => ({ ...prev, vendorId: "" }));
    }

    setTimeout(() => grossAmountRef.current?.focus(), 100);
  };

  const getSelectedVendorName = () => {
    if (!formData.vendorId) return "";
    const selectedVendor = dropdownData.vendors.find(
      (vendor) => vendor.SL_Id?.toString() == formData.vendorId,
    );
    return selectedVendor ? selectedVendor.SL_Name : "";
  };

  // Render vendor item function
  const renderVendorItem = (vendor) => (
    <div className="py-1">
      <div className="font-medium">{vendor?.SL_Name || "Unnamed Vendor"}</div>
      <div className="text-xs text-gray-500 mt-1">
        {vendor?.SL_Cont_Pers && (
          <div className="mt-1 text-gray-400">
            Contact: {vendor.SL_Cont_Pers}
          </div>
        )}
      </div>
    </div>
  );

  // General keyboard navigation for Enter key
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

    // Validate numeric fields
    if (name == "grossAmount" && value != "") {
      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }

      // Check if amount exceeds tender's available amount
      if (selectedTender && selectedTender.availableAmount != undefined) {
        const enteredAmount = parseFloat(value);
        const availableAmount = parseFloat(selectedTender.availableAmount);

        if (!isNaN(enteredAmount) && enteredAmount > availableAmount) {
          setErrors((prev) => ({
            ...prev,
            grossAmount: isEditMode
              ? `Amount cannot exceed available amount of ₹${availableAmount.toLocaleString("en-IN")} (includes current allocation)`
              : `Amount cannot exceed available amount of ₹${availableAmount.toLocaleString("en-IN")}`,
          }));
          return;
        } else {
          setErrors((prev) => ({ ...prev, grossAmount: "" }));
        }
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

    const fileArray = Array.from(files);

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

    if (
      updatedDocuments[index].files &&
      updatedDocuments[index].files.length > 0
    ) {
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

  // Delete existing document
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
      toast.loading("Deleting document...", { id: "delete-doc" });

      await WorkAllocationApi.deleteDocument(docId);

      setFormData((prev) => ({
        ...prev,
        WA_Documents: prev.WA_Documents.filter((d) => d != doc),
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

    if (!formData.WO_Date) {
      newErrors.WO_Date = "Work order date is required";
    }

    if (!formData.Dpt_id) {
      newErrors.Dpt_id = "Branch selection is required";
    }

    if (!formData.Lg_Id) {
      newErrors.Lg_Id = "Ledger account selection is required";
    }

    if (!formData.tenderId) {
      newErrors.tenderId = "Tender selection is required";
    }

    if (!formData.vendorId) {
      newErrors.vendorId = "Vendor selection is required";
    }

    if (!formData.grossAmount) {
      newErrors.grossAmount = "Gross amount is required";
    } else {
      const enteredAmount = parseFloat(formData.grossAmount);

      if (isNaN(enteredAmount) || enteredAmount <= 0) {
        newErrors.grossAmount = "Gross amount must be greater than 0";
      }

      if (selectedTender && selectedTender.availableAmount != undefined) {
        const availableAmount = parseFloat(selectedTender.availableAmount);

        if (enteredAmount > availableAmount) {
          newErrors.grossAmount = isEditMode
            ? `Amount cannot exceed available amount of ₹${availableAmount.toLocaleString("en-IN")} (includes current allocation)`
            : `Amount cannot exceed available amount of ₹${availableAmount.toLocaleString("en-IN")}`;
        }
      }
    }

    // Documents validation - only if files are selected
    newDocuments.forEach((doc, index) => {
      if (doc.files && doc.files.length > 0 && !doc.description.trim()) {
        newErrors[`documentDesc_${index}`] =
          `Document description is required for row ${index + 1}`;
      }
    });

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
      title: isEditMode
        ? "Update Work Allocation?"
        : "Create New Work Allocation?",
      text: isEditMode
        ? "Are you sure you want to update this work allocation?"
        : "Are you sure you want to create this new work allocation?",
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

        // Prepare JSON data
        const jsonData = {
          TE_Id: formData.tenderId,
          SL_Id: formData.vendorId,
          WO_Amount: formData.grossAmount,
          WO_Date: formData.WO_Date,
          WA_RefId: formData.refId || null,
          Fnc_Id: fncId || "",
          Lg_Id: formData.Lg_Id,
          Dpt_id: formData.Dpt_id,
        };

        let docIndex = 0;

        // 1. Add existing documents (base64)
        formData.WA_Documents.forEach((doc) => {
          const base64Content = doc.content || doc.base64;
          jsonData[`WA_Documents[${docIndex}]`] = base64Content;
          jsonData[`WA_Documents_description[${docIndex}]`] =
            doc.description || "";
          docIndex++;
        });

        // 2. Add new documents (convert to base64)
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

          convertedFiles.forEach((file) => {
            jsonData[`WA_Documents[${docIndex}]`] = file.base64;
            jsonData[`WA_Documents_description[${docIndex}]`] =
              file.description;
            docIndex++;
          });
        }

        response = await WorkAllocationApi.update(id, jsonData);
        toast.success("Work allocation updated successfully!");
      } else {
        // ====  CREATE MODE - FormData with binary files =====
        const formDataObj = new FormData();

        formDataObj.append("TE_Id", formData.tenderId);
        formDataObj.append("SL_Id", formData.vendorId);
        formDataObj.append("WO_Amount", formData.grossAmount);
        formDataObj.append("WO_Date", formData.WO_Date);
        formDataObj.append("Fnc_Id", fncId || "");

        if (formData.refId) {
          formDataObj.append("WA_RefId", formData.refId);
        }

        formDataObj.append("Lg_Id", formData.Lg_Id);
        formDataObj.append("Dpt_id", formData.Dpt_id);

        // Add new files (binary) - start from 0
        let fileIndex = 0;
        newDocuments.forEach((doc) => {
          if (doc.files && doc.files.length > 0) {
            doc.files.forEach((file) => {
              formDataObj.append(`WA_Documents[${fileIndex}]`, file);
              formDataObj.append(
                `WA_Documents_description[${fileIndex}]`,
                doc.description,
              );
              fileIndex++;
            });
          }
        });

        response = await WorkAllocationApi.create(formDataObj);
        toast.success("Work allocation created successfully!");
      }

      setTimeout(() => {
        navigate("/transactions/tender-management/workallocation");
      }, 1500);
    } catch (error) {
      console.error("Error saving work allocation:", error);

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
              ? "Failed to update work allocation. Please try again."
              : "Failed to create work allocation. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/tender-management/workallocation");
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

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "₹0";
    const num = parseFloat(amount);
    return isNaN(num) ? "₹0" : `₹${num.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString == "N/A") return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const openDocument = (doc) => {
    if (doc.url) {
      window.open(doc.url, "_blank", "noopener,noreferrer");
    } else if (doc.content || doc.base64) {
      try {
        const base64Content = doc.content || doc.base64;
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
        <p className="mt-4 text-gray-600">Loading work allocation data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/transactions/tender-management/workallocation")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Work Allocation" : "Allocate Work"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update work allocation information"
                : "Allocate work to a vendor for a tender"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Allocation Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Work Allocation Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Work Order Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Order Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={woDateRef}
                  type="date"
                  name="WO_Date"
                  value={formData.WO_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, branchButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.WO_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {errors.WO_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.WO_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.WO_Date}
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
              items={filteredLedgers}
              filteredItems={filteredLedgers}
              highlightedIndex={ledgerHighlightedIndex}
              onSelect={handleLedgerSelect}
              onKeyDown={handleLedgerKeyDown}
              onSearchKeyDown={handleLedgerSearchKeyDown}
              onItemKeyDown={handleLedgerItemKeyDown}
              getSelectedDisplay={getSelectedLedgerName}
              loading={loadingLedgers}
              placeholder={
                formData.Dpt_id
                  ? "Select Ledger Account"
                  : "Select Branch first"
              }
              searchPlaceholder="Search by name, english name or code..."
              buttonRef={ledgerButtonRef}
              dropdownRef={ledgerDropdownRef}
              searchRef={ledgerSearchRef}
              itemRefs={ledgerItemRefs}
              listRef={ledgerListRef}
              renderItem={(account) => (
                <div className="py-1">
                  <div className="font-medium text-gray-900">
                    {account.Lg_Name}
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
              )}
              disabled={!formData.Dpt_id}
            />

            {/* Tender Dropdown */}
            <SearchableDropdown
              label="Tender"
              value={formData.tenderId}
              error={errors.tenderId}
              required={true}
              icon={FileText}
              isOpen={isTenderDropdownOpen}
              setIsOpen={setIsTenderDropdownOpen}
              searchTerm={tenderSearchTerm}
              setSearchTerm={setTenderSearchTerm}
              items={filteredTenders}
              filteredItems={filteredTenders}
              highlightedIndex={tenderHighlightedIndex}
              onSelect={handleTenderSelect}
              onKeyDown={handleTenderKeyDown}
              onSearchKeyDown={handleTenderSearchKeyDown}
              onItemKeyDown={handleTenderItemKeyDown}
              getSelectedDisplay={getSelectedTenderName}
              loading={loadingTenders}
              placeholder={
                formData.Lg_Id ? "Select Tender" : "Select Ledger first"
              }
              searchPlaceholder="Search by description or amount..."
              buttonRef={tenderButtonRef}
              dropdownRef={tenderDropdownRef}
              searchRef={tenderSearchRef}
              itemRefs={tenderItemRefs}
              listRef={tenderListRef}
              renderItem={(tender) => (
                <div className="py-1">
                  <div className="font-medium">{tender.Description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Proposal: {formatCurrency(tender.Proposal_Amount)}
                    {tender.Approved_Amount &&
                      ` | Approved: ${formatCurrency(tender.Approved_Amount)}`}
                  </div>
                </div>
              )}
              disabled={!formData.Lg_Id}
            />

            {/* Vendor Dropdown - FIXED with key prop */}
            <SearchableDropdown
              key={`vendor-dropdown-${vendorDropdownKey}`} // Add key to force re-render
              label="Vendor"
              value={formData.vendorId}
              error={errors.vendorId}
              required={true}
              icon={Users}
              isOpen={isVendorDropdownOpen}
              setIsOpen={setIsVendorDropdownOpen}
              searchTerm={vendorSearchTerm}
              setSearchTerm={setVendorSearchTerm}
              items={dropdownData.vendors}
              filteredItems={filteredVendors}
              highlightedIndex={vendorHighlightedIndex}
              onSelect={handleVendorSelect}
              onKeyDown={handleVendorKeyDown}
              onSearchKeyDown={handleVendorSearchKeyDown}
              onItemKeyDown={handleVendorItemKeyDown}
              getSelectedDisplay={getSelectedVendorName}
              loading={loadingDropdowns}
              placeholder="Select Vendor"
              searchPlaceholder="Search by name & person "
              buttonRef={vendorButtonRef}
              dropdownRef={vendorDropdownRef}
              searchRef={vendorSearchRef}
              itemRefs={vendorItemRefs}
              listRef={vendorListRef}
              renderItem={renderVendorItem}
            />

            {/* Gross Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gross Amount (₹) *
                {selectedTender && (
                  <>
                    <span className="text-xs text-gray-500 ml-2">
                      (Available:{" "}
                      {formatCurrency(selectedTender.availableAmount)})
                    </span>
                    {isEditMode && formData.tenderId == selectedTender?.id && (
                      <span className="text-amber-600 ml-1 text-xs">
                        (including current allocation)
                      </span>
                    )}
                  </>
                )}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={grossAmountRef}
                  type="text"
                  name="grossAmount"
                  value={formData.grossAmount}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, refIdRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.grossAmount ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter gross amount"
                  required
                />
                {errors.grossAmount && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.grossAmount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.grossAmount}
                </p>
              )}
            </div>

            {/* Reference ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={refIdRef}
                  type="text"
                  name="refId"
                  value={formData.refId}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reference ID"
                />
              </div>
            </div>

            {/* Selected Tender Details */}
            {selectedTender && (
              <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-800">
                      Selected Tender Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1">Description</p>
                      <p className="text-sm text-gray-900">
                        {selectedTender.description}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1">
                        Available Amount
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(selectedTender.availableAmount)}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1">
                        Already Allocated
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(selectedTender.totalAllocated)}
                      </p>
                    </div>
                    {selectedTender.approvedAmount && (
                      <div className="bg-white p-3 rounded-lg border border-green-100">
                        <p className="text-xs text-green-600 mb-1">
                          Approved Amount
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(selectedTender.approvedAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                  <Upload className="h-3 w-3 mr-1" />
                  Add More
                </button>
              </div>

              {/* Existing Documents (for edit mode) */}
              {isEditMode && formData.WA_Documents.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Existing Documents ({formData.WA_Documents.length})
                  </h4>
                  <div className="space-y-3">
                    {formData.WA_Documents.map((doc, index) => {
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
                            You can select multiple files at once (optional)
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
                            placeholder="Enter description for these documents (required only if files are selected)..."
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
                          Required only if files are selected
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
                : "Note: You can add multiple files per row and multiple rows (documents are optional)"}
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
                  {isEditMode ? "Update Allocation" : "Create Allocation"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditWorkAllocation;
