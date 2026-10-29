import React, { useState, useEffect, useRef, useCallback } from "react";
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
  FiGrid,
  FiChevronRight,
} from "react-icons/fi";
import { BiLoader } from "react-icons/bi";
import { FileText } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

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
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${error ? "border-red-300" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${disabled
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
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${value == allOptionValue
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
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${highlightedIndex == idx
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

// Group options
const GROUP_OPTIONS = [
  {
    value: "revenue_income",
    label: "Revenue Income",
    apiPath: "/budget-reports/revenue-income-hierarchy",
    title: "Revenue Income",
  },
  {
    value: "revenue_expense",
    label: "Revenue Expense",
    apiPath: "/budget-reports/revenue-expense-hierarchy",
    title: "Revenue Expense",
  },
  {
    value: "capital_income",
    label: "Capital Income",
    apiPath: "/budget-reports/capital-income-hierarchy",
    title: "Capital Income",
  },
  {
    value: "capital_expense",
    label: "Capital Expense",
    apiPath: "/budget-reports/capital-expense-hierarchy",
    title: "Capital Expense",
  },
];

const DepartmentBudgetSummary = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [budgetData, setBudgetData] = useState([]);
  const [financialYear, setFinancialYear] = useState(null);
  const [totals, setTotals] = useState(null);
  const [pageTitle, setPageTitle] = useState("Department Budget Summary");
  const [expandedDepartment, setExpandedDepartment] = useState(null);

  // Filter states
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("current");

  // Department selection states
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [appliedDepartment, setAppliedDepartment] = useState("");
  const [appliedDepartmentData, setAppliedDepartmentData] = useState(null);
  const [appliedFinancialYear, setAppliedFinancialYear] = useState("");
  const [appliedGroup, setAppliedGroup] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

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
  const { currentFinancialYear } = useFinancialYear();

  const currentFYLabel = currentFinancialYear?.FY_Code
    ? `Current (${currentFinancialYear.FY_Code})`
    : "Current Year";

  const previousFYCode = (() => {
    const code = currentFinancialYear?.FY_Code;
    if (!code) return null;
    const years = code.split("-");
    if (years.length != 2) return null;
    const prev = parseInt(years[0]) - 1;
    return `${prev}-${(prev + 1).toString().slice(-2)}`;
  })();

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/reports/budget-management/department-budget-summary";
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
        { headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
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

  // Fetch budget data based on selected group
  const fetchBudgetData = async (groupId, departmentId = "") => {
    setLoading(true);
    try {
      const groupsToFetch =
        groupId == "all"
          ? GROUP_OPTIONS
          : [GROUP_OPTIONS.find((g) => g.value == groupId)];
      if (!groupsToFetch[0]) throw new Error("Invalid group selected");

      const deptQuery =
        departmentId && departmentId != "all" ? `?dept_id=${departmentId}` : "";

      const responses = await Promise.all(
        groupsToFetch.map((g) =>
          axios.get(`${import.meta.env.VITE_API_URL}${g.apiPath}${deptQuery}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }),
        ),
      );

      const allData = [];
      let fyData = null;
      let combinedTotals = null;

      responses.forEach((response, idx) => {
        if (response.data?.success) {
          const groupValue = groupsToFetch[idx].value;
          allData.push(
            ...(response.data.data || []).map((d) => ({
              ...d,
              _groupValue: groupValue,
            })),
          );
          if (!fyData) fyData = response.data.financial_year || null;
          const t = response.data.total;
          if (t) {
            combinedTotals = combinedTotals
              ? {
                previous:
                  (parseFloat(combinedTotals.previous) || 0) +
                  (parseFloat(t.previous) || 0),
                current:
                  (parseFloat(combinedTotals.current) || 0) +
                  (parseFloat(t.current) || 0),
              }
              : {
                previous: parseFloat(t.previous) || 0,
                current: parseFloat(t.current) || 0,
              };
          }
        }
      });

      if (allData.length > 0) {
        setBudgetData(allData);
        setFinancialYear(fyData);
        setTotals(combinedTotals);
        if (departmentId && departmentId != "all") {
          const dept = flattenedDepartments.find(
            (d) => (d.Dpt_id || d.id)?.toString() == departmentId,
          );
          setAppliedDepartmentData(dept || null);
        } else {
          setAppliedDepartmentData(null);
        }
        setMessage({ text: "Data loaded successfully", type: "success" });
      } else {
        setMessage({ text: "No data available", type: "info" });
        setBudgetData([]);
        setTotals(null);
        setAppliedDepartmentData(null);
      }
    } catch (err) {
      console.error("Error fetching budget data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading budget data",
        type: "error",
      });
      setBudgetData([]);
      setTotals(null);
      setAppliedDepartmentData(null);
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

  // Format amount
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || isNaN(amount)) return "-";
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return "-";
      return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      return "-";
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedDepartment("");
    setAppliedDepartmentData(null);
    setAppliedFinancialYear("");
    setAppliedGroup("");
    setBudgetData([]);
    setTotals(null);
    setExpandedDepartment(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setSelectedGroup("all");
    setSelectedDepartment("all");
    setSelectedFinancialYear("current");
    invalidateReport();
  };

  const handleFinancialYearChange = (e) => {
    const next = e.target.value || "";
    setSelectedFinancialYear(next);
    if (hasGenerated) invalidateReport();
  };

  const handleGroupChange = (e) => {
    const next = e.target.value || "";
    setSelectedGroup(next);
    if (hasGenerated) invalidateReport();
  };

  const handleGenerateReport = async () => {
    if (!selectedGroup) {
      setMessage({ text: "Please select report group.", type: "info" });
      return;
    }
    if (!selectedFinancialYear) {
      setMessage({ text: "Please select financial year.", type: "info" });
      return;
    }
    if (!selectedDepartment) {
      setMessage({ text: "Please select department.", type: "info" });
      return;
    }

    setAppliedFinancialYear(selectedFinancialYear);
    setAppliedDepartment(selectedDepartment);
    setAppliedGroup(selectedGroup);
    setHasGenerated(true);
    setExpandedDepartment(null);
    setMessage({ text: "", type: "" });

    await fetchBudgetData(selectedGroup, selectedDepartment);
  };

  const handleDepartmentClick = (deptName) => {
    setExpandedDepartment(expandedDepartment == deptName ? null : deptName);
  };

  // Get current group label for display
  const getCurrentGroupLabel = () => {
    if (appliedGroup == "all") return "All Groups";
    const group = GROUP_OPTIONS.find((g) => g.value == appliedGroup);
    return group ? group.label : "";
  };

  // =============  DEPARTMENT DISPLAY FUNCTIONS ==============
  const renderDepartmentItem = (dept) => {
    const level = parseInt(dept.GrStt, 10) || 1;
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
    if (selectedDepartment == "all") return "All Departments";
    if (!selectedDepartment) return "";
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

  // Render department details (items under a department)
  const renderDepartmentDetails = (dept) => {
    const yearMode = appliedFinancialYear || "";
    const showBothColumns = !yearMode || yearMode == "both";

    const previousLabel = `Previous (${financialYear?.previous_budget?.name || ""})`;
    const currentLabel = `Current (${financialYear?.current_budget?.name || ""})`;

    const items =
      dept.level2_groups?.flatMap((level2) => level2.items || []) || [];

    if (items.length == 0) {
      return (
        <tr className="bg-gray-50">
          <td
            colSpan={showBothColumns ? 3 : 2}
            className="px-4 py-8 text-center text-gray-500"
          >
            <FiAlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            No budget items available for this department
          </td>
        </tr>
      );
    }

    return (
      <>
        {/* Details Header Row */}
        <tr className="bg-blue-50">
          <td colSpan={showBothColumns ? 3 : 2} className="px-4 py-2">
            <div className="flex items-center" style={{ paddingLeft: "20px" }}>
              <span className="text-xs font-semibold text-blue-700">
                Budget Items Details
              </span>
            </div>
          </td>
        </tr>

        {/* Details Column Headers with left padding */}
        <tr className="bg-gray-100">
          <td
            className="px-4 py-2 text-xs font-semibold text-gray-600 border-b"
            style={{ paddingLeft: "46px" }}
          >
            Head Name
          </td>
          {showBothColumns ? (
            <>
              <td className="px-4 py-2 text-right text-xs font-semibold text-gray-600 border-b">
                {previousLabel}
              </td>
              <td className="px-4 py-2 text-right text-xs font-semibold text-gray-600 border-b">
                {currentLabel}
              </td>
            </>
          ) : (
            <td className="px-4 py-2 text-right text-xs font-semibold text-gray-600 border-b">
              {yearMode == "previous" ? previousLabel : currentLabel}
            </td>
          )}
        </tr>

        {items.map((item, idx) => (
          <tr key={idx} className="hover:bg-gray-50">
            <td
              className="px-4 py-2 text-xs text-gray-700"
              style={{ paddingLeft: "46px" }}
            >
              {item.name || "N/A"}
            </td>
            {showBothColumns ? (
              <>
                <td className="px-4 py-2 text-xs text-right font-mono text-green-600">
                  {formatAmount(item.previous_amount)}
                </td>
                <td className="px-4 py-2 text-xs text-right font-mono text-green-600">
                  {formatAmount(item.current_amount)}
                </td>
              </>
            ) : (
              <td className="px-4 py-2 text-xs text-right font-mono text-green-600">
                {formatAmount(
                  yearMode == "previous"
                    ? item.previous_amount
                    : item.current_amount,
                )}
              </td>
            )}
          </tr>
        ))}

        {/* Details Footer Row - Totals */}
        {dept.total && (
          <tr className="bg-gray-100 font-semibold">
            <td
              className="px-4 py-2 text-xs font-semibold text-gray-700"
              style={{ paddingLeft: "46px" }}
            >
              Total
            </td>
            {showBothColumns ? (
              <>
                <td className="px-4 py-2 text-xs text-right font-mono font-bold text-green-700">
                  {formatAmount(dept.total.previous)}
                </td>
                <td className="px-4 py-2 text-xs text-right font-mono font-bold text-green-700">
                  {formatAmount(dept.total.current)}
                </td>
              </>
            ) : (
              <td className="px-4 py-2 text-xs text-right font-mono font-bold text-green-700">
                {formatAmount(
                  yearMode == "previous"
                    ? dept.total.previous
                    : dept.total.current,
                )}
              </td>
            )}
          </tr>
        )}
      </>
    );
  };

  const handleExportExcel = () => {
    const yearMode = appliedFinancialYear || "";
    const fyLabel =
      yearMode == "previous"
        ? financialYear?.previous_budget?.name || "previous"
        : yearMode == "current"
          ? financialYear?.current_budget?.name || "current"
          : "report";

    const showBothColumns = !yearMode || yearMode == "both";
    const previousLabel = `Previous (${financialYear?.previous_budget?.name || ""})`;
    const currentLabel = `Current (${financialYear?.current_budget?.name || ""})`;
    const groupLabel = getCurrentGroupLabel();

    const sheetData = [
      [pageTitle],
      [`Group: ${groupLabel}`],
      yearMode ? [`Financial Year: ${fyLabel}`] : [],
      appliedDepartment && appliedDepartment != "all"
        ? [`Department: ${getAppliedDepartmentDisplay()}`]
        : [],
      [],
      showBothColumns
        ? ["Department", "Head Name", previousLabel, currentLabel]
        : ["Department", "Head Name", "Amount"],
    ].filter((r) => r.length > 0);

    budgetData.forEach((dept) => {
      const items =
        dept.level2_groups?.flatMap((level2) => level2.items || []) || [];
      items.forEach((item) => {
        if (showBothColumns) {
          sheetData.push([
            dept.dept_name,
            item.name,
            parseFloat(item.previous_amount) || 0,
            parseFloat(item.current_amount) || 0,
          ]);
        } else {
          const amt =
            yearMode == "previous" ? item.previous_amount : item.current_amount;
          sheetData.push([dept.dept_name, item.name, parseFloat(amt) || 0]);
        }
      });
      if (dept.total && items.length > 0) {
        if (showBothColumns) {
          sheetData.push([
            "Total",
            "",
            parseFloat(dept.total.previous) || 0,
            parseFloat(dept.total.current) || 0,
          ]);
        } else {
          const t =
            yearMode == "previous" ? dept.total.previous : dept.total.current;
          sheetData.push(["Total", "", parseFloat(t) || 0]);
        }
      }
      sheetData.push([]);
    });

    if (totals) {
      if (showBothColumns) {
        sheetData.push([
          "GRAND TOTAL",
          "",
          parseFloat(totals.previous) || 0,
          parseFloat(totals.current) || 0,
        ]);
      } else {
        const gt = yearMode == "previous" ? totals.previous : totals.current;
        sheetData.push(["GRAND TOTAL", "", parseFloat(gt) || 0]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${groupLabel}`);
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `${groupLabel.toLowerCase().replace(/\s/g, "_")}_${fyLabel}.xlsx`,
    );
  };

  // Check if we have any data to display
  const hasData = budgetData.length > 0;

  // Print Report Content
  // Print Report Content - Updated to match table display
  const PrintReportContent = () => {
    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        padding: "20px",
      },
      header: {
        textAlign: "center",
        marginBottom: "20px",
        borderBottom: "2px solid #333",
        paddingBottom: "10px",
      },
      title: {
        fontSize: "18px",
        fontWeight: "bold",
        margin: "5px 0",
      },
      subtitle: {
        fontSize: "12px",
        color: "#666",
        marginTop: "5px",
      },
      groupHeading: {
        fontSize: "14px",
        fontWeight: "bold",
        margin: "15px 0 10px 0",
        padding: "8px 12px",
        backgroundColor: "#f3f4f6",
        borderLeft: "4px solid #EF5350",
        borderRadius: "4px",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
        fontSize: "11px",
        pageBreakInside: "avoid",
      },
      th: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
        padding: "8px 10px",
        border: "1px solid #d1d5db",
        textAlign: "left",
      },
      thRight: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
        padding: "8px 10px",
        border: "1px solid #d1d5db",
        textAlign: "right",
      },
      td: {
        padding: "6px 10px",
        border: "1px solid #d1d5db",
        verticalAlign: "top",
      },
      tdRight: {
        padding: "6px 10px",
        border: "1px solid #d1d5db",
        textAlign: "right",
        verticalAlign: "top",
      },
      departmentRow: {
        backgroundColor: "#ffffff",
        cursor: "pointer",
      },
      expandedRow: {
        backgroundColor: "#f9fafb",
      },
      detailsTable: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "0",
        fontSize: "10px",
      },
      detailsTh: {
        backgroundColor: "#ffffff",
        fontWeight: "bold",
        padding: "6px 8px",
        border: "1px solid #bfdbfe",
        textAlign: "left",
      },
      detailsThRight: {
        backgroundColor: "#ffffff",
        fontWeight: "bold",
        padding: "6px 8px",
        border: "1px solid #bfdbfe",
        textAlign: "right",
      },
      detailsTd: {
        padding: "5px 8px",
        border: "1px solid #bfdbfe",
        verticalAlign: "top",
      },
      detailsTdRight: {
        padding: "5px 8px",
        border: "1px solid #bfdbfe",
        textAlign: "right",
        verticalAlign: "top",
      },
      totalRow: {
        backgroundColor: "#fef2f2",
        fontWeight: "bold",
      },
      grandTotalRow: {
        backgroundColor: "#e0f2fe",
        fontWeight: "bold",
        borderTop: "2px solid #0284c7",
      },
      indent1: { paddingLeft: "20px" },
      indent2: { paddingLeft: "35px" },
      indent3: { paddingLeft: "50px" },
    };

    const yearMode = appliedFinancialYear || "";
    const showBothColumns = !yearMode || yearMode == "both";
    const previousLabel = `Previous (${financialYear?.previous_budget?.name || ""})`;
    const currentLabel = `Current (${financialYear?.current_budget?.name || ""})`;
    const singleColumnLabel =
      yearMode == "previous" ? previousLabel : currentLabel;

    const getTotalForDepartment = (dept) => {
      if (yearMode == "previous") return formatAmount(dept.total?.previous);
      if (yearMode == "current") return formatAmount(dept.total?.current);
      return "";
    };

    // Group budgetData by _groupValue for "all" mode
    const isAllGroups = appliedGroup == "all";
    const groupedData = isAllGroups
      ? GROUP_OPTIONS.map((g) => ({
        groupLabel: g.label,
        groupValue: g.value,
        depts: budgetData.filter((d) => d._groupValue == g.value),
      })).filter((g) => g.depts.length > 0)
      : [
        {
          groupLabel: getCurrentGroupLabel(),
          groupValue: appliedGroup,
          depts: budgetData,
        },
      ];

    return (
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          {appliedDepartment && appliedDepartment != "all" && (
            <div style={styles.subtitle}>
              Department: {getAppliedDepartmentDisplay()}
            </div>
          )}
          {appliedFinancialYear && appliedFinancialYear != "both" && (
            <div style={styles.subtitle}>
              Financial Year:{" "}
              {appliedFinancialYear == "previous"
                ? previousLabel
                : currentLabel}
            </div>
          )}
        </div>

        {/* Group-wise Data Display */}
        {groupedData.map((group, gIdx) => (
          <div key={group.groupValue}>
            {/* Group Heading */}
            <div style={styles.groupHeading}>{group.groupLabel}</div>

            {/* Main Table */}
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: "5%" }}>Sr No.</th>
                  <th
                    style={{
                      ...styles.th,
                      width: showBothColumns ? "35%" : "55%",
                    }}
                  >
                    Department Name
                  </th>
                  {showBothColumns ? (
                    <>
                      <th style={{ ...styles.thRight, width: "30%" }}>
                        {previousLabel}
                      </th>
                      <th style={{ ...styles.thRight, width: "30%" }}>
                        {currentLabel}
                      </th>
                    </>
                  ) : (
                    <th style={{ ...styles.thRight, width: "40%" }}>
                      {singleColumnLabel}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {group.depts.map((dept, idx) => {
                  // Get items for details section
                  const items =
                    dept.level2_groups?.flatMap(
                      (level2) => level2.items || [],
                    ) || [];

                  return (
                    <React.Fragment key={`print-dept-${dept.dept_id}-${idx}`}>
                      {/* Department Row */}
                      <tr style={styles.departmentRow}>
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={styles.td}>
                          <strong>{dept.dept_name}</strong>
                        </td>
                        {showBothColumns ? (
                          <>
                            <td style={styles.tdRight}>
                              {formatAmount(dept.total?.previous)}
                            </td>
                            <td style={styles.tdRight}>
                              {formatAmount(dept.total?.current)}
                            </td>
                          </>
                        ) : (
                          <td style={styles.tdRight}>
                            {getTotalForDepartment(dept)}
                          </td>
                        )}
                      </tr>

                      {/* Details Section - Always expanded in print */}
                      {items.length > 0 && (
                        <tr>
                          <td
                            colSpan={showBothColumns ? 4 : 3}
                            style={{ padding: 0 }}
                          >
                            <table style={styles.detailsTable}>
                              <thead>
                                <tr>
                                  <th
                                    style={{
                                      ...styles.detailsTh,
                                      width: showBothColumns ? "40%" : "50%",
                                    }}
                                  >
                                    Head Name
                                  </th>
                                  {showBothColumns ? (
                                    <>
                                      <th
                                        style={{
                                          ...styles.detailsThRight,
                                          width: "30%",
                                        }}
                                      >
                                        {previousLabel}
                                      </th>
                                      <th
                                        style={{
                                          ...styles.detailsThRight,
                                          width: "30%",
                                        }}
                                      >
                                        {currentLabel}
                                      </th>
                                    </>
                                  ) : (
                                    <th
                                      style={{
                                        ...styles.detailsThRight,
                                        width: "50%",
                                      }}
                                    >
                                      {singleColumnLabel}
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((item, itemIdx) => (
                                  <tr
                                    key={`print-item-${item.gr_cd}-${itemIdx}`}
                                  >
                                    <td style={styles.detailsTd}>
                                      {item.name || "N/A"}
                                    </td>
                                    {showBothColumns ? (
                                      <>
                                        <td style={styles.detailsTdRight}>
                                          {formatAmount(item.previous_amount)}
                                        </td>
                                        <td style={styles.detailsTdRight}>
                                          {formatAmount(item.current_amount)}
                                        </td>
                                      </>
                                    ) : (
                                      <td style={styles.detailsTdRight}>
                                        {formatAmount(
                                          yearMode == "previous"
                                            ? item.previous_amount
                                            : item.current_amount,
                                        )}
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                              {dept.total && (
                                <tfoot>
                                  <tr style={styles.totalRow}>
                                    <td
                                      style={{
                                        ...styles.detailsTd,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Total
                                    </td>
                                    {showBothColumns ? (
                                      <>
                                        <td
                                          style={{
                                            ...styles.detailsTdRight,
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {formatAmount(dept.total.previous)}
                                        </td>
                                        <td
                                          style={{
                                            ...styles.detailsTdRight,
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {formatAmount(dept.total.current)}
                                        </td>
                                      </>
                                    ) : (
                                      <td
                                        style={{
                                          ...styles.detailsTdRight,
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {formatAmount(
                                          yearMode == "previous"
                                            ? dept.total.previous
                                            : dept.total.current,
                                        )}
                                      </td>
                                    )}
                                  </tr>
                                </tfoot>
                              )}
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* Grand Total for single group */}
              {!isAllGroups && totals && (
                <tfoot>
                  <tr style={styles.grandTotalRow}>
                    <td
                      colSpan="2"
                      style={{ ...styles.td, fontWeight: "bold" }}
                    >
                      Grand Total
                    </td>
                    {showBothColumns ? (
                      <>
                        <td style={{ ...styles.tdRight, fontWeight: "bold" }}>
                          {formatAmount(totals.previous)}
                        </td>
                        <td style={{ ...styles.tdRight, fontWeight: "bold" }}>
                          {formatAmount(totals.current)}
                        </td>
                      </>
                    ) : (
                      <td style={{ ...styles.tdRight, fontWeight: "bold" }}>
                        {formatAmount(
                          yearMode == "previous"
                            ? totals.previous
                            : totals.current,
                        )}
                      </td>
                    )}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ))}
      </div>
    );
  };

  // Render filters section
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiGrid className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedGroup}
                onChange={handleGroupChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Groups</option>
                {GROUP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedFinancialYear}
              onChange={handleFinancialYearChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select Financial Year</option>
              <option value="both">All (Both Years)</option>
              <option value="current">{currentFYLabel}</option>
              <option value="previous">
                Previous {previousFYCode ? `(${previousFYCode})` : "Year"}
              </option>
            </select>
          </div>

          <div className="flex-1">
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
              allOptionLabel="All Departments"
              allOptionValue="all"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={
                loading ||
                !selectedGroup ||
                !selectedFinancialYear ||
                !selectedDepartment ||
                dropdownLoading
              }
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
              title="Generate Report"
            >
              <FiCheck className="h-4 w-4 mr-2" />
              Generate Report
            </button>

            {(hasGenerated ||
              appliedDepartment ||
              appliedFinancialYear ||
              appliedGroup) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
                >
                  <FiX className="h-4 w-4 mr-2" />
                  Clear Filter
                </button>
              )}
          </div>
        </div>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading budget data...</p>
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
          Select <strong>Group</strong>, <strong>Financial Year</strong> and{" "}
          <strong>Department</strong>, then click{" "}
          <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          {appliedDepartment && appliedDepartment != "all"
            ? `No ${getCurrentGroupLabel()} data available for the selected department.`
            : appliedDepartment == "all"
              ? `No ${getCurrentGroupLabel()} data available for any department.`
              : `No ${getCurrentGroupLabel()} data available.`}
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
        {appliedDepartment && (
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <FiX className="h-4 w-4 mr-2" />
            Clear Filter
          </button>
        )}
      </div>
    );

  // Render data table with click-to-expand functionality
  // Render data table with click-to-expand functionality
  const renderDataTable = () => {
    const yearMode = appliedFinancialYear || "";
    const showBothColumns = !yearMode || yearMode == "both";

    const previousLabel = `Previous (${financialYear?.previous_budget?.name || ""})`;
    const currentLabel = `Current (${financialYear?.current_budget?.name || ""})`;

    const getTotalForDepartment = (dept) => {
      if (yearMode == "previous") return formatAmount(dept.total?.previous);
      if (yearMode == "current") return formatAmount(dept.total?.current);
      return "";
    };

    // Group budgetData by _groupValue for "all" mode
    const isAllGroups = appliedGroup == "all";
    const groupedData = isAllGroups
      ? GROUP_OPTIONS.map((g) => ({
        groupLabel: g.label,
        groupValue: g.value,
        depts: budgetData.filter((d) => d._groupValue == g.value),
      })).filter((g) => g.depts.length > 0)
      : [
        {
          groupLabel: getCurrentGroupLabel(),
          groupValue: appliedGroup,
          depts: budgetData,
        },
      ];

    // Calculate column widths based on showBothColumns
    const colWidths = showBothColumns
      ? { srNo: "5%", deptName: "35%", previous: "30%", current: "30%" }
      : { srNo: "5%", deptName: "55%", amount: "40%" };

    return (
      <div>
        {groupedData.map((group, gIdx) => (
          <div key={group.groupValue} className={gIdx > 0 ? "mt-6" : ""}>
            {/* Group Name Heading */}
            <div className="mb-4">
              <div className="text-lg font-semibold text-gray-800 bg-gray-100 p-3 rounded-md border-l-4 border-blue-500">
                {group.groupLabel}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed">
                  <colgroup>
                    <col style={{ width: colWidths.srNo }} />
                    <col style={{ width: colWidths.deptName }} />
                    {showBothColumns ? (
                      <>
                        <col style={{ width: colWidths.previous }} />
                        <col style={{ width: colWidths.current }} />
                      </>
                    ) : (
                      <col style={{ width: colWidths.amount }} />
                    )}
                  </colgroup>
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Sr No.
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Department Name
                      </th>
                      {showBothColumns ? (
                        <>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                            {previousLabel}
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                            {currentLabel}
                          </th>
                        </>
                      ) : (
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                          {yearMode == "previous"
                            ? previousLabel
                            : currentLabel}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.depts.map((dept, idx) => {
                      const isExpanded = expandedDepartment == dept.dept_name;

                      return (
                        <React.Fragment key={`dept-${dept.dept_id}-${idx}`}>
                          {/* Main Department Row */}
                          <tr
                            className={`hover:bg-blue-50 cursor-pointer transition-colors ${isExpanded ? "bg-blue-50" : ""
                              }`}
                            onClick={() =>
                              handleDepartmentClick(dept.dept_name)
                            }
                          >
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                {isExpanded ? (
                                  <FiChevronDown
                                    className="mr-2 text-blue-500 print-hidden flex-shrink-0"
                                    size={16}
                                  />
                                ) : (
                                  <FiChevronRight
                                    className="mr-2 text-gray-400 print-hidden flex-shrink-0"
                                    size={16}
                                  />
                                )}
                                <span>{idx + 1}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 break-words">
                              {dept.dept_name}
                            </td>
                            {showBothColumns ? (
                              <>
                                <td className="px-4 py-3 text-sm text-right font-mono text-green-600 whitespace-nowrap">
                                  {formatAmount(dept.total?.previous)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-mono text-green-600 whitespace-nowrap">
                                  {formatAmount(dept.total?.current)}
                                </td>
                              </>
                            ) : (
                              <td className="px-4 py-3 text-sm text-right font-mono text-green-600 whitespace-nowrap">
                                {getTotalForDepartment(dept)}
                              </td>
                            )}
                          </tr>

                          {/* Expanded Details Section */}
                          {isExpanded && (
                            <tr className="bg-gray-50">
                              <td
                                colSpan={showBothColumns ? 4 : 3}
                                className="px-0 py-0"
                              >
                                <div className="p-4 bg-gray-50 border-t border-gray-200">
                                  <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                      <colgroup>
                                        <col
                                          style={{
                                            width: showBothColumns
                                              ? "40%"
                                              : "50%",
                                          }}
                                        />
                                        {showBothColumns ? (
                                          <>
                                            <col style={{ width: "30%" }} />
                                            <col style={{ width: "30%" }} />
                                          </>
                                        ) : (
                                          <col style={{ width: "50%" }} />
                                        )}
                                      </colgroup>
                                      <thead>
                                        <tr className="bg-blue-50">
                                          <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 border-b border-blue-200">
                                            Head Name
                                          </th>
                                          {showBothColumns ? (
                                            <>
                                              <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 border-b border-blue-200 whitespace-nowrap">
                                                {previousLabel}
                                              </th>
                                              <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 border-b border-blue-200 whitespace-nowrap">
                                                {currentLabel}
                                              </th>
                                            </>
                                          ) : (
                                            <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 border-b border-blue-200 whitespace-nowrap">
                                              {yearMode == "previous"
                                                ? previousLabel
                                                : currentLabel}
                                            </th>
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {dept.level2_groups?.flatMap(
                                          (level2, l2Idx) =>
                                            (level2.items || []).map(
                                              (item, itemIdx) => (
                                                <tr
                                                  key={`item-${item.gr_cd}-${l2Idx}-${itemIdx}`}
                                                  className="hover:bg-gray-100"
                                                >
                                                  <td className="px-4 py-2 text-sm text-gray-700 break-words">
                                                    {item.name || "N/A"}
                                                  </td>
                                                  {showBothColumns ? (
                                                    <>
                                                      <td className="px-4 py-2 text-sm text-right font-mono text-green-600 whitespace-nowrap">
                                                        {formatAmount(
                                                          item.previous_amount,
                                                        )}
                                                      </td>
                                                      <td className="px-4 py-2 text-sm text-right font-mono text-green-600 whitespace-nowrap">
                                                        {formatAmount(
                                                          item.current_amount,
                                                        )}
                                                      </td>
                                                    </>
                                                  ) : (
                                                    <td className="px-4 py-2 text-sm text-right font-mono text-green-600 whitespace-nowrap">
                                                      {formatAmount(
                                                        yearMode == "previous"
                                                          ? item.previous_amount
                                                          : item.current_amount,
                                                      )}
                                                    </td>
                                                  )}
                                                </tr>
                                              ),
                                            ),
                                        )}
                                      </tbody>
                                      {dept.total && (
                                        <tfoot>
                                          <tr className="bg-gray-100 font-semibold">
                                            <td className="px-4 py-2 text-sm font-semibold text-gray-700">
                                              Total
                                            </td>
                                            {showBothColumns ? (
                                              <>
                                                <td className="px-4 py-2 text-sm text-right font-mono font-bold text-green-700 whitespace-nowrap">
                                                  {formatAmount(
                                                    dept.total.previous,
                                                  )}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-right font-mono font-bold text-green-700 whitespace-nowrap">
                                                  {formatAmount(
                                                    dept.total.current,
                                                  )}
                                                </td>
                                              </>
                                            ) : (
                                              <td className="px-4 py-2 text-sm text-right font-mono font-bold text-green-700 whitespace-nowrap">
                                                {formatAmount(
                                                  yearMode == "previous"
                                                    ? dept.total.previous
                                                    : dept.total.current,
                                                )}
                                              </td>
                                            )}
                                          </tr>
                                        </tfoot>
                                      )}
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  {!isAllGroups && totals && (
                    <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                      <tr>
                        <td
                          colSpan="2"
                          className="px-4 py-3 text-sm font-semibold text-gray-700"
                        >
                          Grand Total
                        </td>
                        {showBothColumns ? (
                          <>
                            <td className="px-4 py-3 text-sm text-right font-mono font-bold text-green-700 whitespace-nowrap">
                              {formatAmount(totals.previous)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono font-bold text-green-700 whitespace-nowrap">
                              {formatAmount(totals.current)}
                            </td>
                          </>
                        ) : (
                          <td className="px-4 py-3 text-sm text-right font-mono font-bold text-green-700 whitespace-nowrap">
                            {formatAmount(
                              yearMode == "previous"
                                ? totals.previous
                                : totals.current,
                            )}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        ))}
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
            {hasData && hasGenerated && (
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                title="Export to Excel"
              >
                <FileText className="h-4 w-4 mr-2" />
                Excel
              </button>
            )}
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
            <p className="text-center text-sm text-gray-500 mt-1">
              Department-wise Budget Summary (Click on any department row to
              view budget items details)
            </p>
          </div>

          {/* Filters */}
          {renderFilters()}

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

export default DepartmentBudgetSummary;
