import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiHome,
  FiX,
  FiSearch,
  FiChevronDown,
  FiCheck,
  FiLayers,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiFileText,
} from "react-icons/fi";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import { BiLoader } from "react-icons/bi";
import axios from "axios";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

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
  getId = (item) => item?.id,
  disabled = false,
  renderItem,
  showAsText = false,
  lockedValue = "",
  includeAllOption = false,
  allOptionLabel = "All Departments",
  allOptionValue = "all",
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
          <BiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          !disabled && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiChevronDown className="h-4 w-4" />
            </button>
          )
        )}

        {error && (
          <FiAlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "300px" }}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {includeAllOption && !searchTerm && (
              <button
                type="button"
                onClick={() => {
                  onSelect({
                    id: allOptionValue,
                    name: allOptionLabel,
                    isAllOption: true,
                  });
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                  value == allOptionValue
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
                tabIndex={0}
              >
                <div className="flex items-center">
                  <FiLayers className="h-4 w-4 mr-2" />
                  <span className="font-medium">{allOptionLabel}</span>
                </div>
                {value == allOptionValue && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center">
                    <FiCheck className="h-3 w-3 mr-1" />
                    Selected
                  </div>
                )}
              </button>
            )}

            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId = item?.Dpt_id || item?.id || `item-${idx}`;

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
                    {renderItem
                      ? renderItem(item)
                      : item?.Dpt_Name || item?.name}
                    {value && itemId && value == itemId.toString() && (
                      <div className="text-xs text-blue-600 mt-1 flex items-center">
                        <FiCheck className="h-3 w-3 mr-1" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <FiSearch className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No departments found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} departments found</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <FiAlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

const DepartmentwiseEmdRegister = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [departmentWiseData, setDepartmentWiseData] = useState([]);
  const [reportInfo, setReportInfo] = useState({
    report_name: "",
    generated_date: "",
    filters_applied: {},
  });
  const [grandSummary, setGrandSummary] = useState(null);
  const [pageTitle, setPageTitle] = useState("Departmentwise EMD Register");

  // Department selection states
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [appliedDepartment, setAppliedDepartment] = useState("");
  const [appliedDepartmentData, setAppliedDepartmentData] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  // Tender filter
  const [tenderId, setTenderId] = useState("");
  const [appliedTenderId, setAppliedTenderId] = useState("");
  const [tenders, setTenders] = useState([]);
  const [tenderSearch, setTenderSearch] = useState("");
  const [showTenderDrop, setShowTenderDrop] = useState(false);

  // Vendor filter
  const [vendorId, setVendorId] = useState("");
  const [appliedVendorId, setAppliedVendorId] = useState("");
  const [vendors, setVendors] = useState([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [showVendorDrop, setShowVendorDrop] = useState(false);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  // Department dropdown states
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptButtonRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);

  const { organization } = useOrganization();

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/reports/tender-management/departmentwise-emd-register";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
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

  // Load departments
  const loadDepartments = async () => {
    setDropdownLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );

      if (response.data.success) {
        const activeDepartments = (response.data.data || []).filter(
          (dept) =>
            dept.is_visible == 1 ||
            dept.is_visible == "1" ||
            dept.isvisible == 1 ||
            dept.isvisible == "1",
        );

        const tree = buildDepartmentTree(activeDepartments);
        const flattened = flattenTree(tree);
        setDepartments(activeDepartments);
        setFlattenedDepartments(flattened);
        setFilteredDepartments(flattened);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    } finally {
      setDropdownLoading(false);
    }
  };

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  // Load tender and vendor dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [tRes, vRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/tender-entries/all`,{ 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }),
          axios.get(`${import.meta.env.VITE_API_URL}/sub-ledgers/all`,{ 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }),
        ]);
        if (tRes.data?.success) setTenders(tRes.data.data || []);
        if (vRes.data?.success) setVendors(vRes.data.data || []);
      } catch (e) {}
    };
    fetchDropdowns();
  }, []);

  // Click outside handler for tender/vendor dropdowns
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".tender-drop")) setShowTenderDrop(false);
      if (!e.target.closest(".vendor-drop")) setShowVendorDrop(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch departmentwise EMD register data
  const fetchEmdRegisterData = async (deptId, fDate, tDate, tId, vId) => {
    if (!deptId) return;

    setLoading(true);
    try {
      const params = {};

      if (deptId && deptId != "all") {
        params.department_id = deptId;
      }
      if (fDate) params.from_date = fDate;
      if (tDate) params.to_date = tDate;
      if (tId) params.tender_id = tId;
      if (vId) params.vendor_id = vId;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/departmentwise-emd-register`,
        { params,
          
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        
         },
      );

      if (response.data.success) {
        setReportInfo({
          report_name: response.data.data?.report_name || pageTitle,
          generated_date:
            response.data.data?.generated_date || new Date().toLocaleString(),
          filters_applied: response.data.data?.filters_applied || {},
        });
        setGrandSummary(response.data.data?.grand_summary || null);
        setDepartmentWiseData(response.data.data?.department_wise_data || []);

        if ((response.data.data?.department_wise_data || []).length == 0) {
          setMessage({
            text: response.data.message || "No EMD records found",
            type: "info",
          });
        } else {
          setMessage({
            text: `Loaded ${response.data.data?.department_wise_data?.length || 0} department(s) with EMD records`,
            type: "success",
          });
        }
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setDepartmentWiseData([]);
        setGrandSummary(null);
      }
    } catch (err) {
      console.error("Error fetching EMD register data:", err);
      setMessage({
        text:
          err.response?.data?.message ||
          "Error loading departmentwise EMD register",
        type: "error",
      });
      setDepartmentWiseData([]);
      setGrandSummary(null);
    } finally {
      setLoading(false);
    }
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

  // =============  FILTER DEPARTMENTS ==============
  useEffect(() => {
    if (!flattenedDepartments.length) return;

    if (!deptSearchTerm.trim()) {
      setFilteredDepartments(flattenedDepartments);
    } else {
      const term = deptSearchTerm.toLowerCase();
      const filtered = flattenedDepartments.filter(
        (dept) =>
          (dept.Dpt_Desc?.toLowerCase() || "").includes(term) ||
          (dept.Dpt_Name?.toLowerCase() || "").includes(term) ||
          (dept.GrCod?.toLowerCase() || "").includes(term),
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, flattenedDepartments]);

  // Filter entries based on search query
  const filterEntriesBySearch = (entries) => {
    if (!searchQuery.trim()) return entries;
    const term = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.account_budget_head?.name?.toLowerCase().includes(term) ||
        entry.tender_no?.toLowerCase().includes(term) ||
        entry.vendor_name?.toLowerCase().includes(term) ||
        entry.status_name?.toLowerCase().includes(term),
    );
  };

  // Format amount
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || amount == "") return "₹ 0.00";
    const num =
      typeof amount == "string"
        ? parseFloat(amount.replace(/,/g, ""))
        : parseFloat(amount);
    if (isNaN(num)) return "₹ 0.00";
    return `₹ ${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (statusName) => {
    const name = statusName?.toLowerCase() || "";
    switch (name) {
      case "approved":
      case "initial entry":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedDepartment("");
    setAppliedDepartmentData(null);
    setAppliedFromDate("");
    setAppliedToDate("");
    setAppliedTenderId("");
    setAppliedVendorId("");
    setDepartmentWiseData([]);
    setGrandSummary(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setSelectedDepartment("all");
    setFromDate("");
    setToDate("");
    setTenderId("");
    setVendorId("");
    setTenderSearch("");
    setVendorSearch("");
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    // Lock current filters as applied filters
    setAppliedDepartment(selectedDepartment);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedTenderId(tenderId);
    setAppliedVendorId(vendorId);
    setHasGenerated(true);
    setMessage({ text: "", type: "" });

    // Store selected department data for display
    if (selectedDepartment && selectedDepartment != "all") {
      const selected = flattenedDepartments.find(
        (d) => (d.Dpt_id || d.id)?.toString() == selectedDepartment,
      );
      setAppliedDepartmentData(selected || null);
    } else {
      setAppliedDepartmentData(null);
    }

    await fetchEmdRegisterData(
      selectedDepartment,
      fromDate,
      toDate,
      tenderId,
      vendorId,
    );
  };

  // =============  DEPARTMENT DISPLAY FUNCTIONS ==============
  const renderDepartmentItem = (dept) => {
    const level = parseInt(dept.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = dept.Dpt_Desc || dept.desc || "No Description";
    const name = dept.Dpt_Name || dept.name;
    const colorClass = "bg-gray-100 text-gray-600";

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
    if (!selectedDepartment) return "";
    if (selectedDepartment == "all") return "All Departments";
    const selected = flattenedDepartments.find(
      (dept) => (dept.Dpt_id || dept.id)?.toString() == selectedDepartment,
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

  const getAppliedDepartmentDisplay = () => {
    if (appliedDepartment == "all") return "All Departments";
    if (!appliedDepartmentData) return "";

    const level = parseInt(appliedDepartmentData.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc =
      appliedDepartmentData.Dpt_Desc ||
      appliedDepartmentData.desc ||
      "No Description";
    const name = appliedDepartmentData.Dpt_Name || appliedDepartmentData.name;

    if (name && name != desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  // Department select handler
  const handleDepartmentSelect = (dept) => {
    if (dept && dept.isAllOption) {
      setSelectedDepartment("all");
    } else if (dept && (dept.Dpt_id || dept.id)) {
      const deptId = (dept.Dpt_id || dept.id).toString();
      setSelectedDepartment(deptId);
    }
    setIsDeptDropdownOpen(false);
    setDeptSearchTerm("");
    setDeptHighlightedIndex(-1);

    // If the report is already visible, require regeneration after filter change
    if (hasGenerated) invalidateReport();
  };

  // Department dropdown key handlers
  const handleDepartmentKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isDeptDropdownOpen) {
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

  // Check if we have any data to display
  const hasData = departmentWiseData.length > 0;

  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new();
    departmentWiseData.forEach((dept) => {
      const rows = (dept.entries || []).map((entry) => ({
        "Account / Budget Head": entry.account_budget_head?.name || "",
        "Tender No": entry.tender_no || "",
        "Tender Date": formatDate(entry.tender_date),
        "Amount Proposed": entry.amount_proposed || 0,
        "Vendor Name": entry.vendor_name || "",
        "EMD Date": formatDate(entry.emd_submission_date),
        "EMD Amount": entry.emd_amount || 0,
        "Maturity Date": formatDate(entry.maturity_date),
        Status: entry.status_name || "",
      }));
      rows.push({
        "Account / Budget Head": "Total Department EMD",
        "Tender No": "",
        "Tender Date": "",
        "Amount Proposed": "",
        "Vendor Name": "",
        "EMD Date": "",
        "EMD Amount": dept.summary.total_department_emd || 0,
        "Maturity Date": "",
        Status: "",
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      const sheetName = (dept.department.name || "Dept").substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    XLSX.writeFile(wb, `DeptEMDRegister.xlsx`);
  };

  // Print Report Content
  const PrintReportContent = () => {
    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
      },
      header: {
        textAlign: "center",
        marginBottom: "8px",
        borderBottom: "2px solid #333",
        paddingBottom: "8px",
      },
      title: {
        fontSize: "18px",
        fontWeight: "bold",
        margin: "5px 0",
      },
      deptInfo: {
        margin: "0 0 8px 0",
        padding: "8px 10px",
        backgroundColor: "#e6f3ff",
        borderLeft: "4px solid #E53935",
      },
      section: {
        margin: "0",
        padding: "0",
        pageBreakInside: "avoid",
      },
      sectionTitle: {
        backgroundColor: "#FFCDD2",
        padding: "8px 12px",
        margin: "0",
        fontWeight: "600",
        borderLeft: "none",
        fontSize: "14px",
        color: "#B71C1C",
      },
      subSectionTitle: {
        backgroundColor: "#f0fdf4",
        padding: "6px 10px",
        margin: "6px 0 0 0",
        fontWeight: "600",
        fontSize: "12px",
        color: "#166534",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "0",
        fontSize: "10px",
        tableLayout: "fixed",
      },
      th: {
        backgroundColor: "#ffffff",
        fontWeight: "700",
        padding: "6px 8px",
        border: "1px solid #d1d5db",
        textAlign: "left",
        color: "#000000",
        textTransform: "uppercase",
        fontSize: "9px",
      },
      thRight: {
        backgroundColor: "#ffffff",
        fontWeight: "700",
        padding: "6px 8px",
        border: "1px solid #d1d5db",
        textAlign: "right",
        color: "#000000",
        textTransform: "uppercase",
        fontSize: "9px",
      },
      td: {
        padding: "5px 8px",
        border: "1px solid #d1d5db",
        verticalAlign: "top",
        color: "#000000",
        fontSize: "10px",
      },
      tdRight: {
        padding: "5px 8px",
        border: "1px solid #d1d5db",
        verticalAlign: "top",
        color: "#000000",
        fontSize: "10px",
        textAlign: "right",
      },
      textRight: {
        textAlign: "right",
      },
      textBold: { fontWeight: "600" },
      totalRow: {
        backgroundColor: "#ffffff",
        fontWeight: "700",
        color: "#000000",
        borderTop: "2px solid #d1d5db",
      },
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div>Generated: {reportInfo.generated_date}</div>
        </div>

        {/* Department Info */}
        {appliedDepartment && (
          <div style={styles.deptInfo}>
            <strong>Department:</strong> {getAppliedDepartmentDisplay()}
          </div>
        )}

        {/* Filters Info */}
        {(appliedFromDate || appliedToDate) && (
          <div
            style={{
              ...styles.deptInfo,
              backgroundColor: "#f3f4f6",
              borderLeftColor: "#6b7280",
              marginBottom: "8px",
            }}
          >
            <strong>Filters Applied:</strong>
            {appliedFromDate && (
              <span> From: {formatDate(appliedFromDate)}</span>
            )}
            {appliedToDate && <span> To: {formatDate(appliedToDate)}</span>}
          </div>
        )}

        {/* Department-wise Data */}
        {departmentWiseData.map((dept, deptIdx) => (
          <div
            key={`print-dept-${dept.department.id}-${deptIdx}`}
            style={{
              ...styles.section,
              marginBottom: "15px",
              pageBreakInside: "avoid",
            }}
          >
            {/* Department Header */}
            <div style={{
              backgroundColor: "transparent",
              padding: "8px 12px",
              fontWeight: "700",
              fontSize: "13px",
              color: "#000000",
              borderBottom: "1px solid #d1d5db",
              marginBottom: "0",
            }}>
              {dept.department.name}
            </div>

            {/* EMD Entries Section */}
            {dept.entries && dept.entries.length > 0 && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tender No</th>
                    <th style={styles.th}>Tender Date</th>
                    <th style={styles.th}>Department Name</th>
                    <th style={styles.thRight}>Amount Proposed</th>
                    <th style={styles.th}>Vendor Name</th>
                    <th style={styles.th}>EMD Date</th>
                    <th style={styles.thRight}>EMD Amount</th>
                    <th style={styles.th}>Maturity Date</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dept.entries.map((entry, entryIdx) => (
                    <tr key={`print-entry-${entry.emd_entry_id}-${entryIdx}`} style={{ borderBottom: "1px solid #d1d5db" }}>
                      <td style={styles.td}>{entry.tender_no}</td>
                      <td style={styles.td}>{formatDate(entry.tender_date)}</td>
                      <td style={styles.td}>{dept.department.name}</td>
                      <td style={styles.tdRight}>{formatAmount(entry.amount_proposed)}</td>
                      <td style={styles.td}>{entry.vendor_name}</td>
                      <td style={styles.td}>{formatDate(entry.emd_submission_date)}</td>
                      <td style={styles.tdRight}>{formatAmount(entry.emd_amount)}</td>
                      <td style={styles.td}>{formatDate(entry.maturity_date)}</td>
                      <td style={styles.td}>{entry.status_name}</td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}
          </div>
        ))}

        {/* Grand Summary */}
        {grandSummary && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px 12px",
              backgroundColor: "transparent",
              borderTop: "2px solid #d1d5db",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: "12px",
              color: "#000000",
            }}
          >
            <span>GRAND TOTAL</span>
            <div>
              <span>Total Departments: {grandSummary.total_departments}</span>
              <span style={{ marginLeft: "20px" }}>
                Total Records: {grandSummary.total_records}
              </span>
              <span style={{ marginLeft: "20px" }}>
                Grand Total EMD: {formatAmount(grandSummary.grand_total_emd)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render filters section with department dropdown
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <SearchableDropdown
              label="Department"
              value={selectedDepartment}
              error={null}
              required={false}
              icon={FiHome}
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
              placeholder="Select Department"
              searchPlaceholder="Search by department name, description..."
              buttonRef={deptButtonRef}
              dropdownRef={deptDropdownRef}
              searchRef={deptSearchRef}
              itemRefs={deptItemRefs}
              listRef={deptListRef}
              getId={(item) => (item.Dpt_id || item.id)?.toString()}
              renderItem={renderDepartmentItem}
              includeAllOption={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="relative tender-drop">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tender
            </label>
            <div
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center"
              onClick={() => setShowTenderDrop((v) => !v)}
            >
              <span className={tenderId ? "text-gray-900" : "text-gray-400"}>
                {tenderId
                  ? tenders.find((t) => t.TE_Id == parseInt(tenderId))
                      ?.Description || `Tender #${tenderId}`
                  : "Select Tender"}
              </span>
              <span className="text-gray-400">▾</span>
            </div>
            {showTenderDrop && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                <div className="p-2 border-b">
                  <input
                    autoFocus
                    type="text"
                    value={tenderSearch}
                    onChange={(e) => setTenderSearch(e.target.value)}
                    placeholder="Search tender..."
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none text-sm"
                  />
                </div>
                <div className="overflow-y-auto max-h-48">
                  <div
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-500"
                    onClick={() => {
                      setTenderId("");
                      setTenderSearch("");
                      setShowTenderDrop(false);
                      if (hasGenerated) invalidateReport();
                    }}
                  >
                    All Tenders
                  </div>
                  {tenders
                    .filter(
                      (t) =>
                        !tenderSearch ||
                        (t.Description || "")
                          .toLowerCase()
                          .includes(tenderSearch.toLowerCase()),
                    )
                    .map((t) => (
                      <div
                        key={t.TE_Id}
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm ${tenderId == String(t.TE_Id) ? "bg-blue-100 font-medium" : ""}`}
                        onClick={() => {
                          setTenderId(String(t.TE_Id));
                          setTenderSearch("");
                          setShowTenderDrop(false);
                          if (hasGenerated) invalidateReport();
                        }}
                      >
                        {t.Description || `Tender #${t.TE_Id}`}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative vendor-drop">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <div
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center"
              onClick={() => setShowVendorDrop((v) => !v)}
            >
              <span className={vendorId ? "text-gray-900" : "text-gray-400"}>
                {vendorId
                  ? vendors.find((v) => v.SL_Id == parseInt(vendorId))
                      ?.SL_Name || `Vendor #${vendorId}`
                  : "Select Vendor"}
              </span>
              <span className="text-gray-400">▾</span>
            </div>
            {showVendorDrop && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                <div className="p-2 border-b">
                  <input
                    autoFocus
                    type="text"
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    placeholder="Search vendor..."
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none text-sm"
                  />
                </div>
                <div className="overflow-y-auto max-h-48">
                  <div
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-500"
                    onClick={() => {
                      setVendorId("");
                      setVendorSearch("");
                      setShowVendorDrop(false);
                      if (hasGenerated) invalidateReport();
                    }}
                  >
                    All Vendors
                  </div>
                  {vendors
                    .filter(
                      (v) =>
                        !vendorSearch ||
                        (v.SL_Name || "")
                          .toLowerCase()
                          .includes(vendorSearch.toLowerCase()),
                    )
                    .map((v) => (
                      <div
                        key={v.SL_Id}
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm ${vendorId == String(v.SL_Id) ? "bg-blue-100 font-medium" : ""}`}
                        onClick={() => {
                          setVendorId(String(v.SL_Id));
                          setVendorSearch("");
                          setShowVendorDrop(false);
                          if (hasGenerated) invalidateReport();
                        }}
                      >
                        {v.SL_Name}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading || dropdownLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
              title="Generate Report"
            >
              <FiCheck className="h-4 w-4 mr-2" />
              Generate Report
            </button>

            {(hasGenerated ||
              appliedDepartment ||
              appliedFromDate ||
              appliedToDate ||
              appliedTenderId ||
              appliedVendorId) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <FiX className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render search bar
  const renderSearchBar = () => {
    return (
      <div className="flex justify-end mb-4">
        <div className="relative w-80">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Budget Head, Tender No, Vendor, or Status..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading EMD register data...</p>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-500">{message.text}</p>
    </div>
  );

  // Render no data state
  const renderNoData = () =>
    !hasGenerated ? (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Generate report to view results
        </h3>
        <p className="text-gray-600 mb-4">
          Select <strong>Department</strong> and optional filters, then click{" "}
          <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No EMD Records Found
        </h3>
        <p className="text-gray-600 mb-4">
          {appliedDepartment && appliedDepartment != "all"
            ? "No EMD records found for the selected department with the applied filters."
            : "No EMD records found for the selected criteria."}
        </p>
        {appliedDepartment &&
          appliedDepartment != "all" &&
          appliedDepartmentData && (
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg inline-block mx-auto">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Selected Department:</span>{" "}
                {getAppliedDepartmentDisplay()}
              </p>
            </div>
          )}
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          <FiX className="h-4 w-4 mr-2" />
          Clear Filters
        </button>
      </div>
    );

  // Render data table with department-wise grouping
  const renderDataTable = () => {
    return (
      <div className="space-y-6">
        {departmentWiseData.map((dept, deptIdx) => {
          // Filter entries based on search
          const filteredEntries = filterEntriesBySearch(dept.entries || []);
          const hasFilteredEntries = filteredEntries.length > 0;

          if (!hasFilteredEntries && searchQuery) return null;

          return (
            <div
              key={`dept-${dept.department.id}-${deptIdx}`}
              className="border border-blue-100 rounded-lg overflow-hidden shadow-sm"
            >
              {/* EMD Entries Table */}
              {filteredEntries.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                          Tender No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                          Tender Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                          Department Name
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                          Amount Proposed
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                          Vendor Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                          EMD Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                          EMD Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                          Maturity Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {filteredEntries.map((entry, entryIdx) => (
                        <tr
                          key={`entry-${entry.emd_entry_id}-${entryIdx}`}
                          className="border-b border-gray-300"
                        >
                          <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                            {entry.tender_no}
                          </td>
                          <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                            {formatDate(entry.tender_date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                            {dept.department.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-black border-r border-gray-300">
                            {formatAmount(entry.amount_proposed)}
                          </td>
                          <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                            {entry.vendor_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                            {formatDate(entry.emd_submission_date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-black border-r border-gray-300">
                            {formatAmount(entry.emd_amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                            {formatDate(entry.maturity_date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-black">
                            {entry.status_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredEntries.length == 0 && searchQuery && (
                <div className="text-center py-4 text-gray-500">
                  No matching EMD records found for this department
                </div>
              )}
            </div>
          );
        })}

        {/* Grand Summary */}
        {grandSummary && departmentWiseData.length > 0 && (
          <div className="px-4 py-3 rounded-lg flex flex-wrap justify-between items-center font-bold text-black border border-gray-300 shadow-sm">
            <span className="text-base text-black">GRAND TOTAL</span>
            <div className="flex flex-wrap gap-4 text-black">
              <span>Total Departments: {grandSummary.total_departments}</span>
              <span>Total Records: {grandSummary.total_records}</span>
              <span>
                Grand Total EMD: {formatAmount(grandSummary.grand_total_emd)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title={`${pageTitle}`}
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="px-2 py-6 max-w-full">
        {/* Header with back button and print */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>

          <div className="flex space-x-2">
            <button
              onClick={handleExcelExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Print Report"
            >
              <FiPrinter className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          {/* Header with title */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {pageTitle}
            </h2>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Search Bar */}
          {hasData && renderSearchBar()}

          {/* Loading State */}
          {loading && renderLoading()}

          {/* Error State */}
          {!loading && message.type == "error" && renderError()}

          {/* No Data State */}
          {!loading && !hasData && message.type != "error" && renderNoData()}

          {/* Data Display */}
          {!loading && hasData && renderDataTable()}
        </div>
      </div>
    </div>
  );
};

export default DepartmentwiseEmdRegister;
