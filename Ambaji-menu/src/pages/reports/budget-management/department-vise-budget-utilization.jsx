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
  FiCalendar,
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

const GROUP_OPTIONS = [
  {
    value: "revenue_income",
    label: "Revenue Income",
    apiPath: "/budget-reports/revenue-income-utilize",
    title: "Revenue Income",
  },
  {
    value: "revenue_expense",
    label: "Revenue Expense",
    apiPath: "/budget-reports/revenue-expense-utilize",
    title: "Revenue Expense",
  },
  {
    value: "capital_income",
    label: "Capital Income",
    apiPath: "/budget-reports/capital-income-utilize",
    title: "Capital Income",
  },
  {
    value: "capital_expense",
    label: "Capital Expense",
    apiPath: "/budget-reports/capital-expense-utilize",
    title: "Capital Expense",
  },
];

const DepartmentViseBudgetUtilization = () => {
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
  
  // Date range filter states - Initialize with empty strings (NO DEFAULT DATE)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Department selection states
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [appliedDepartment, setAppliedDepartment] = useState("");
  const [appliedDepartmentData, setAppliedDepartmentData] = useState(null);
  const [appliedFinancialYear, setAppliedFinancialYear] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
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

  // NO DEFAULT DATE - Commented out to prevent auto-filling dates
  // useEffect(() => {
  //   if (!fromDate && !toDate && currentFinancialYear?.FY_Code) {
  //     const years = currentFinancialYear.FY_Code.split("-");
  //     if (years.length == 2) {
  //       const startYear = parseInt(years[0]);
  //       const endYear = parseInt(years[1]);
  //       setFromDate(`${startYear}-04-01`);
  //       setToDate(`${endYear}-03-31`);
  //     }
  //   }
  // }, [currentFinancialYear]);

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
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
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
  const fetchBudgetData = async (groupId, departmentId = "", fromDt = "", toDt = "") => {
    setLoading(true);
    try {
      const groupsToFetch =
        groupId == "all"
          ? GROUP_OPTIONS
          : [GROUP_OPTIONS.find((g) => g.value == groupId)];
      if (!groupsToFetch[0]) throw new Error("Invalid group selected");

      // Build query parameters
      const params = new URLSearchParams();
      if (departmentId && departmentId != "all") {
        params.append("dept_id", departmentId);
      }
      if (fromDt) {
        params.append("from_date", fromDt);
      }
      if (toDt) {
        params.append("to_date", toDt);
      }
      const queryString = params.toString();
      const deptQuery = queryString ? `?${queryString}` : "";

      const responses = await Promise.all(
        groupsToFetch.map((g) =>
          axios.get(`${import.meta.env.VITE_API_URL}${g.apiPath}${deptQuery}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }),
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
                  utilized_amount:
                    (parseFloat(combinedTotals.utilized_amount) || 0) +
                    (parseFloat(t.utilized_amount) || 0),
                  balance_amount:
                    (parseFloat(combinedTotals.balance_amount) || 0) +
                    (parseFloat(t.balance_amount) || 0),
                }
              : {
                  previous: parseFloat(t.previous) || 0,
                  current: parseFloat(t.current) || 0,
                  utilized_amount: parseFloat(t.utilized_amount) || 0,
                  balance_amount: parseFloat(t.balance_amount) || 0,
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

  // Format amount with red color for negative values
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || isNaN(amount)) return "-";
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return "-";
      const formatted = num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatted;
    } catch (error) {
      return "-";
    }
  };

  // Check if amount is negative
  const isNegative = (amount) => {
    if (amount == undefined || amount == null || isNaN(amount)) return false;
    return parseFloat(amount) < 0;
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value == undefined || value == null || isNaN(value)) return "-";
    const num = parseFloat(value);
    if (isNaN(num)) return "-";
    return num.toFixed(2) + "%";
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedDepartment("");
    setAppliedDepartmentData(null);
    setAppliedFinancialYear("");
    setAppliedFromDate("");
    setAppliedToDate("");
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
    // Reset date range to empty (NO DEFAULT DATE)
    setFromDate("");
    setToDate("");
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

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    if (hasGenerated) invalidateReport();
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
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
    if (!fromDate) {
      setMessage({ text: "Please select from date.", type: "info" });
      return;
    }
    if (!toDate) {
      setMessage({ text: "Please select to date.", type: "info" });
      return;
    }
    if (fromDate > toDate) {
      setMessage({ text: "From date cannot be greater than to date.", type: "error" });
      return;
    }

    setAppliedFinancialYear(selectedFinancialYear);
    setAppliedDepartment(selectedDepartment);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedGroup(selectedGroup);
    setHasGenerated(true);
    setExpandedDepartment(null);
    setMessage({ text: "", type: "" });

    await fetchBudgetData(selectedGroup, selectedDepartment, fromDate, toDate);
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

  const handleExportExcel = () => {
    const sheetData = [
      [pageTitle],
      [`Group: ${getCurrentGroupLabel()}`],
      appliedDepartment && appliedDepartment != "all"
        ? [`Department: ${getAppliedDepartmentDisplay()}`]
        : [],
      appliedFromDate && appliedToDate ? [`Date Range: ${appliedFromDate} to ${appliedToDate}`] : [],
      [],
      [
        "Department / Head Name",
        "Current Budget",
        "Utilized Amount",
        "Balance Amount",
        "Utilization %",
      ],
    ].filter((r) => r.length > 0);

    budgetData.forEach((dept) => {
      const items =
        dept.level2_groups?.flatMap((level2) => level2.items || []) || [];
      
      // Add department name with total row
      sheetData.push([
        dept.dept_name,
        parseFloat(dept.total?.current) || 0,
        parseFloat(dept.total?.utilized_amount) || 0,
        parseFloat(dept.total?.balance_amount) || 0,
        parseFloat(dept.total?.utilization_percentage) || 0,
      ]);
      
      // Add each item with indentation (3 spaces for hierarchy)
      items.forEach((item) => {
        sheetData.push([
          `   ${item.name || "N/A"}`, // 3 spaces indentation
          parseFloat(item.current_amount) || 0,
          parseFloat(item.utilized_amount) || 0,
          parseFloat(item.balance_amount) || 0,
          parseFloat(item.utilization_percentage) || 0,
        ]);
      });
      
      // Add a separator row if there are items
      if (items.length > 0) {
        sheetData.push([]);
      }
    });

    if (totals) {
      sheetData.push([
        "GRAND TOTAL",
        parseFloat(totals.current) || 0,
        parseFloat(totals.utilized_amount) || 0,
        parseFloat(totals.balance_amount) || 0,
        "",
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Set column widths for better display
    ws['!cols'] = [
      { wch: 40 }, // Department / Head Name
      { wch: 18 }, // Current Budget
      { wch: 18 }, // Utilized Amount
      { wch: 18 }, // Balance Amount
      { wch: 12 }, // Utilization %
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${getCurrentGroupLabel()}`);
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `${getCurrentGroupLabel().toLowerCase().replace(/\s/g, "_")}_utilization.xlsx`,
    );
  };

  // Check if we have any data to display
  const hasData = budgetData.length > 0;

  // Print Report Content - Updated with hierarchical display and right alignment
  const PrintReportContent = () => {
    // Check if we have data
    if (!budgetData || budgetData.length == 0) {
      return (
        <div
          style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}
        >
          <h2>{pageTitle}</h2>
          <p>No data available for the selected filters.</p>
        </div>
      );
    }

    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        padding: "15px",
      },
      header: {
        textAlign: "center",
        marginBottom: "15px",
        borderBottom: "2px solid #333",
        paddingBottom: "8px",
      },
      title: {
        fontSize: "16px",
        fontWeight: "bold",
        margin: "3px 0",
      },
      subtitle: {
        fontSize: "11px",
        color: "#666",
        marginTop: "3px",
      },
      groupHeading: {
        fontSize: "13px",
        fontWeight: "bold",
        margin: "12px 0 8px 0",
        padding: "6px 10px",
        backgroundColor: "#f3f4f6",
        borderLeft: "3px solid #EF5350",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "15px",
        fontSize: "10px",
      },
      th: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
        padding: "5px 8px",
        border: "1px solid #d1d5db",
        textAlign: "left",
      },
      thRight: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
        padding: "5px 8px",
        border: "1px solid #d1d5db",
        textAlign: "right",
      },
      thCenter: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
        padding: "5px 8px",
        border: "1px solid #d1d5db",
        textAlign: "center",
      },
      td: {
        padding: "4px 8px",
        border: "1px solid #d1d5db",
        verticalAlign: "top",
      },
      tdRight: {
        padding: "4px 8px",
        border: "1px solid #d1d5db",
        textAlign: "right",
        verticalAlign: "top",
      },
      tdCenter: {
        padding: "4px 8px",
        border: "1px solid #d1d5db",
        textAlign: "center",
        verticalAlign: "top",
      },
      tdRed: {
        padding: "4px 8px",
        border: "1px solid #d1d5db",
        textAlign: "right",
        verticalAlign: "top",
        color: "#dc2626",
        fontWeight: "bold",
      },
      tdIndent: {
        padding: "4px 8px",
        border: "1px solid #d1d5db",
        verticalAlign: "top",
        paddingLeft: "25px",
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
      itemRow: {
        backgroundColor: "#f9fafb",
      },
    };

    const isNeg = (val) => {
      if (val == undefined || val == null || isNaN(val)) return false;
      return parseFloat(val) < 0;
    };

    // Group data
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

    if (groupedData.length == 0 || groupedData.every(g => g.depts.length == 0)) {
      return (
        <div style={styles.page}>
          <div style={styles.header}>
            <h1 style={styles.title}>{pageTitle}</h1>
          </div>
          <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
            No data available for the selected filters.
          </div>
        </div>
      );
    }

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
          {financialYear && (
            <div style={styles.subtitle}>
              Financial Year: {financialYear.current_budget?.name || "Current Year"}
            </div>
          )}
          {appliedFromDate && appliedToDate && (
            <div style={styles.subtitle}>
              Date Range: {appliedFromDate} to {appliedToDate}
            </div>
          )}
        </div>

        {/* Data Tables */}
        {groupedData.map((group, gIdx) => (
          <div key={group.groupValue} style={{ marginBottom: "20px" }}>
            {(isAllGroups || groupedData.length > 1) && (
              <div style={styles.groupHeading}>{group.groupLabel}</div>
            )}

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: "5%" }}>#</th>
                  <th style={{ ...styles.th, width: "30%" }}>Department / Head Name</th>
                  <th style={{ ...styles.thRight, width: "20%" }}>Budget</th>
                  <th style={{ ...styles.thRight, width: "20%" }}>Utilized</th>
                  <th style={{ ...styles.thRight, width: "20%" }}>Balance</th>
                  <th style={{ ...styles.thCenter, width: "5%" }}>%</th>
                </tr>
              </thead>
              <tbody>
                {group.depts.map((dept, idx) => {
                  const items =
                    dept.level2_groups?.flatMap(
                      (level2) => level2.items || [],
                    ) || [];

                  return (
                    <React.Fragment key={`print-dept-${dept.dept_id}-${idx}`}>
                      {/* Department Row */}
                      <tr>
                        <td style={styles.td}>{idx + 1}</td>
                        <td style={styles.td}>
                          <strong>{dept.dept_name}</strong>
                        </td>
                        <td style={isNeg(dept.total?.current) ? styles.tdRed : styles.tdRight}>
                          {formatAmount(dept.total?.current)}
                        </td>
                        <td style={isNeg(dept.total?.utilized_amount) ? styles.tdRed : styles.tdRight}>
                          {dept.total?.formatted_utilized_amount || formatAmount(dept.total?.utilized_amount)}
                        </td>
                        <td style={isNeg(dept.total?.balance_amount) ? styles.tdRed : styles.tdRight}>
                          {dept.total?.formatted_balance_amount || formatAmount(dept.total?.balance_amount)}
                        </td>
                        <td style={styles.tdCenter}>
                          {formatPercentage(dept.total?.utilization_percentage)}
                        </td>
                      </tr>

                      {/* Items with indentation */}
                      {items.map((item, itemIdx) => (
                        <tr key={`print-item-${item.gr_cd}-${itemIdx}`} style={styles.itemRow}>
                          <td style={styles.td}></td>
                          <td style={styles.tdIndent}>
                            {item.name || "N/A"}
                          </td>
                          <td style={isNeg(item.current_amount) ? styles.tdRed : styles.tdRight}>
                            {formatAmount(item.current_amount)}
                          </td>
                          <td style={isNeg(item.utilized_amount) ? styles.tdRed : styles.tdRight}>
                            {item.formatted_utilized_amount || formatAmount(item.utilized_amount)}
                          </td>
                          <td style={isNeg(item.balance_amount) ? styles.tdRed : styles.tdRight}>
                            {item.formatted_balance_amount || formatAmount(item.balance_amount)}
                          </td>
                          <td style={styles.tdCenter}>
                            {formatPercentage(item.utilization_percentage)}
                          </td>
                        </tr>
                      ))}

                      {/* Total row for department */}
                      {dept.total && items.length > 0 && (
                        <tr style={styles.totalRow}>
                          <td style={styles.td}></td>
                          <td style={{ ...styles.td, fontWeight: "bold" }}>
                            Total
                          </td>
                          <td style={isNeg(dept.total.current) ? { ...styles.tdRed, fontWeight: "bold" } : { ...styles.tdRight, fontWeight: "bold" }}>
                            {formatAmount(dept.total.current)}
                          </td>
                          <td style={isNeg(dept.total.utilized_amount) ? { ...styles.tdRed, fontWeight: "bold" } : { ...styles.tdRight, fontWeight: "bold" }}>
                            {dept.total.formatted_utilized_amount || formatAmount(dept.total.utilized_amount)}
                          </td>
                          <td style={isNeg(dept.total.balance_amount) ? { ...styles.tdRed, fontWeight: "bold" } : { ...styles.tdRight, fontWeight: "bold" }}>
                            {dept.total.formatted_balance_amount || formatAmount(dept.total.balance_amount)}
                          </td>
                          <td style={{ ...styles.tdCenter, fontWeight: "bold" }}>
                            {formatPercentage(dept.total.utilization_percentage)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>

              {!isAllGroups && totals && (
                <tfoot>
                  <tr style={styles.grandTotalRow}>
                    <td colSpan="2" style={{ ...styles.td, fontWeight: "bold" }}>
                      Grand Total
                    </td>
                    <td style={isNeg(totals.current) ? { ...styles.tdRight, fontWeight: "bold", color: "#dc2626" } : { ...styles.tdRight, fontWeight: "bold" }}>
                      {formatAmount(totals.current)}
                    </td>
                    <td style={isNeg(totals.utilized_amount) ? { ...styles.tdRight, fontWeight: "bold", color: "#dc2626" } : { ...styles.tdRight, fontWeight: "bold" }}>
                      {formatAmount(totals.utilized_amount)}
                    </td>
                    <td style={isNeg(totals.balance_amount) ? { ...styles.tdRight, fontWeight: "bold", color: "#dc2626" } : { ...styles.tdRight, fontWeight: "bold" }}>
                      {formatAmount(totals.balance_amount)}
                    </td>
                    <td style={{ ...styles.tdCenter, fontWeight: "bold" }}>
                      {formatPercentage(
                        totals.utilized_amount && totals.balance_amount
                          ? (totals.utilized_amount / (totals.utilized_amount + totals.balance_amount)) * 100
                          : 0
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ))}
      </div>
    );
  };

  // Render filters section with date range
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
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

          <div>
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

          <div>
            <SearchableDropdown
              label="Department"
              value={selectedDepartment}
              error={null}
              required={true}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={handleFromDateChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="DD-MM-YYYY"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={toDate}
                onChange={handleToDateChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="DD-MM-YYYY"
              />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={
                loading ||
                !selectedGroup ||
                !selectedFinancialYear ||
                !selectedDepartment ||
                !fromDate ||
                !toDate ||
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
              appliedGroup ||
              appliedFromDate ||
              appliedToDate) && (
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
          Select <strong>Group</strong>, <strong>Financial Year</strong>, <strong>Department</strong> and{" "}
          <strong>Date Range</strong>, then click{" "}
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
      </div>
    );

  // Render data table with click-to-expand functionality - Hierarchical display with right alignment
  const renderDataTable = () => {
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
      <div>
        {groupedData.map((group, gIdx) => (
          <div key={group.groupValue} className={gIdx > 0 ? "mt-6" : ""}>
            <div className="mb-4">
              <div className="text-lg font-semibold text-gray-800 bg-gray-100 p-3 rounded-md border-l-4 border-blue-500">
                {group.groupLabel}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 w-[5%]">
                        Sr No.
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 w-[25%]">
                        Department / Head Name
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200 w-[20%]">
                        Current Budget
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200 w-[20%]">
                        Utilized Amount
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b border-gray-200 w-[20%]">
                        Balance Amount
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-[10%]">
                        Utilization %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.depts.map((dept, idx) => {
                      const isExpanded = expandedDepartment == dept.dept_name;
                      const items =
                        dept.level2_groups?.flatMap(
                          (level2) => level2.items || [],
                        ) || [];

                      return (
                        <React.Fragment key={`dept-${dept.dept_id}-${idx}`}>
                          <tr
                            className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                              isExpanded ? "bg-blue-50" : ""
                            }`}
                            onClick={() => handleDepartmentClick(dept.dept_name)}
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
                            <td
                              className={`px-4 py-3 text-sm text-right font-mono whitespace-nowrap ${isNegative(dept.total?.current) ? "text-red-600" : "text-purple-600"}`}
                            >
                              {formatAmount(dept.total?.current)}
                            </td>
                            <td
                              className={`px-4 py-3 text-sm text-right font-mono whitespace-nowrap ${isNegative(dept.total?.utilized_amount) ? "text-red-600" : "text-blue-600"}`}
                            >
                              {dept.total?.formatted_utilized_amount ||
                                formatAmount(dept.total?.utilized_amount)}
                            </td>
                            <td
                              className={`px-4 py-3 text-sm text-right font-mono whitespace-nowrap ${isNegative(dept.total?.balance_amount) ? "text-red-600" : "text-green-600"}`}
                            >
                              {dept.total?.formatted_balance_amount ||
                                formatAmount(dept.total?.balance_amount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-center font-mono whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  dept.total?.utilization_percentage > 100
                                    ? "bg-red-100 text-red-700"
                                    : dept.total?.utilization_percentage > 80
                                      ? "bg-yellow-100 text-yellow-700"
                                      : dept.total?.utilization_percentage > 50
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-green-100 text-green-700"
                                }`}
                              >
                                {formatPercentage(
                                  dept.total?.utilization_percentage,
                                )}
                              </span>
                            </td>
                          </tr>

                          {isExpanded && items.length > 0 && (
                            <>
                              {items.map((item, itemIdx) => (
                                <tr key={`item-${item.gr_cd}-${itemIdx}`} className="bg-gray-50 hover:bg-gray-100">
                                  <td className="px-4 py-2 text-sm text-gray-400"></td>
                                  <td className="px-4 py-2 text-sm text-gray-700 break-words pl-8">
                                    {item.name || "N/A"}
                                  </td>
                                  <td
                                    className={`px-4 py-2 text-sm text-right font-mono whitespace-nowrap ${isNegative(item.current_amount) ? "text-red-600" : "text-purple-600"}`}
                                  >
                                    {formatAmount(item.current_amount)}
                                  </td>
                                  <td
                                    className={`px-4 py-2 text-sm text-right font-mono whitespace-nowrap ${isNegative(item.utilized_amount) ? "text-red-600" : "text-blue-600"}`}
                                  >
                                    {item.formatted_utilized_amount ||
                                      formatAmount(item.utilized_amount)}
                                  </td>
                                  <td
                                    className={`px-4 py-2 text-sm text-right font-mono whitespace-nowrap ${isNegative(item.balance_amount) ? "text-red-600" : "text-green-600"}`}
                                  >
                                    {item.formatted_balance_amount ||
                                      formatAmount(item.balance_amount)}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-center font-mono whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        item.utilization_percentage > 100
                                          ? "bg-red-100 text-red-700"
                                          : item.utilization_percentage > 80
                                            ? "bg-yellow-100 text-yellow-700"
                                            : item.utilization_percentage > 50
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {formatPercentage(
                                        item.utilization_percentage,
                                      )}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {dept.total && (
                                <tr className="bg-gray-100 font-semibold">
                                  <td className="px-4 py-2 text-sm text-gray-400"></td>
                                  <td className="px-4 py-2 text-sm font-semibold text-gray-700 pl-8">
                                    Total
                                  </td>
                                  <td
                                    className={`px-4 py-2 text-sm text-right font-mono font-bold whitespace-nowrap ${isNegative(dept.total.current) ? "text-red-600" : "text-purple-700"}`}
                                  >
                                    {formatAmount(dept.total.current)}
                                  </td>
                                  <td
                                    className={`px-4 py-2 text-sm text-right font-mono font-bold whitespace-nowrap ${isNegative(dept.total.utilized_amount) ? "text-red-600" : "text-blue-700"}`}
                                  >
                                    {dept.total.formatted_utilized_amount ||
                                      formatAmount(
                                        dept.total.utilized_amount,
                                      )}
                                  </td>
                                  <td
                                    className={`px-4 py-2 text-sm text-right font-mono font-bold whitespace-nowrap ${isNegative(dept.total.balance_amount) ? "text-red-600" : "text-green-700"}`}
                                  >
                                    {dept.total.formatted_balance_amount ||
                                      formatAmount(
                                        dept.total.balance_amount,
                                      )}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-center font-mono font-bold whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        dept.total.utilization_percentage > 100
                                          ? "bg-red-100 text-red-700"
                                          : dept.total.utilization_percentage > 80
                                            ? "bg-yellow-100 text-yellow-700"
                                            : dept.total.utilization_percentage > 50
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {formatPercentage(
                                        dept.total.utilization_percentage,
                                      )}
                                    </span>
                                  </td>
                                </tr>
                              )}
                            </>
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
                        <td
                          className={`px-4 py-3 text-sm text-right font-mono font-bold whitespace-nowrap ${isNegative(totals.current) ? "text-red-600" : ""}`}
                        >
                          {formatAmount(totals.current)}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm text-right font-mono font-bold whitespace-nowrap ${isNegative(totals.utilized_amount) ? "text-red-600" : ""}`}
                        >
                          {formatAmount(totals.utilized_amount)}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm text-right font-mono font-bold whitespace-nowrap ${isNegative(totals.balance_amount) ? "text-red-600" : ""}`}
                        >
                          {formatAmount(totals.balance_amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-mono font-bold whitespace-nowrap">
                          {formatPercentage(
                            totals.utilized_amount && totals.balance_amount
                              ? (totals.utilized_amount /
                                  (totals.utilized_amount +
                                    totals.balance_amount)) *
                                  100
                              : 0,
                          )}
                        </td>
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
              Department-wise Budget Utilization (Click on any department row to
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

export default DepartmentViseBudgetUtilization;