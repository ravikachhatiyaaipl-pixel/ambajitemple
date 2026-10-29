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

const RevenueExpenseHierarchyReport = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [budgetData, setBudgetData] = useState([]);
  const [financialYear, setFinancialYear] = useState(null);
  const [totals, setTotals] = useState(null);
  const [pageTitle, setPageTitle] = useState(
    "Revenue Expense Hierarchy Report",
  );

  // Department selection states
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all"); // Default to "all"
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("current");
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [appliedDepartment, setAppliedDepartment] = useState("");
  const [appliedDepartmentData, setAppliedDepartmentData] = useState(null);
  const [appliedFinancialYear, setAppliedFinancialYear] = useState("");
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
        "/reports/budget-management/revenue-expense-hierarchy";
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
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
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

  // Fetch revenue expense hierarchy data
  const fetchBudgetData = async (departmentId = "") => {
    setLoading(true);
    try {
      // Build URL with department filter (if not "all")
      let url = `${import.meta.env.VITE_API_URL}/budget-reports/revenue-expense-hierarchy`;
      if (departmentId && departmentId != "all") {
        url += `?dept_id=${departmentId}`;
      }

      const response = await axios.get(url, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
      });

      if (response.data?.success) {
        setBudgetData(response.data.data || []);
        setFinancialYear(response.data.financial_year || null);
        setTotals(response.data.total || null);

        // If we have data and applied department is not "all", store the department data
        if (
          departmentId &&
          departmentId != "all" &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          const dept = flattenedDepartments.find(
            (d) => (d.Dpt_id || d.id)?.toString() == departmentId,
          );
          setAppliedDepartmentData(dept || null);
        } else if (departmentId && departmentId != "all") {
          // No data for this department
          const dept = flattenedDepartments.find(
            (d) => (d.Dpt_id || d.id)?.toString() == departmentId,
          );
          setAppliedDepartmentData(dept || null);
        } else {
          setAppliedDepartmentData(null);
        }

        setMessage({
          text: response.data.message || "Data loaded successfully",
          type: "success",
        });
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setBudgetData([]);
        setTotals(null);
        setAppliedDepartmentData(null);
      }
    } catch (err) {
      console.error("Error fetching revenue expense data:", err);
      setMessage({
        text:
          err.response?.data?.message || "Error loading revenue expense data",
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
    if (amount == undefined || amount == null || isNaN(amount)) return "";

    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return "";
      return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      return "";
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedDepartment("");
    setAppliedDepartmentData(null);
    setAppliedFinancialYear("");
    setBudgetData([]);
    setTotals(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setSelectedDepartment("all");
    setSelectedFinancialYear("");
    invalidateReport();
  };

  const handleFinancialYearChange = (e) => {
    const next = e.target.value || "";
    setSelectedFinancialYear(next);
    if (hasGenerated) invalidateReport();
  };

  const handleGenerateReport = async () => {
    if (!selectedFinancialYear) {
      setMessage({ text: "Please select financial year.", type: "info" });
      return;
    }
    if (!selectedDepartment) {
      setMessage({ text: "Please select department.", type: "info" });
      return;
    }

    // Lock current filters as applied filters (report should match these values)
    setAppliedFinancialYear(selectedFinancialYear);
    setAppliedDepartment(selectedDepartment);
    setHasGenerated(true);
    setMessage({ text: "", type: "" });

    await fetchBudgetData(selectedDepartment);
  };

  // =============  DEPARTMENT DISPLAY FUNCTIONS ==============
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

    // If the report is already visible, require regeneration after filter change.
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
    const yearMode = appliedFinancialYear || "";
    const fyLabel =
      yearMode == "previous"
        ? financialYear?.previous_budget?.name || "previous"
        : yearMode == "current"
          ? financialYear?.current_budget?.name || "current"
          : "report";

    const showBothColumns = !yearMode;
    const previousLabel = `Previous (${financialYear?.previous_budget?.name || ""})`;
    const currentLabel = `Current (${financialYear?.current_budget?.name || ""})`;

    const sheetData = [
      [pageTitle],
      yearMode ? [`Financial Year: ${fyLabel}`] : [],
      appliedDepartment && appliedDepartment != "all"
        ? [`Department: ${getAppliedDepartmentDisplay()}`]
        : [],
      [],
      showBothColumns
        ? ["Department", "Name", previousLabel, currentLabel]
        : ["Department", "Name", "Amount"],
    ].filter((r) => r.length > 0);

    budgetData.forEach((dept) => {
      sheetData.push([
        dept.dept_name,
        "",
        ...(showBothColumns ? ["", ""] : [""]),
      ]);
      (dept.level2_groups || []).forEach((level2) => {
        (level2.items || []).forEach((item) => {
          if (showBothColumns) {
            sheetData.push([
              dept.dept_name,
              item.name,
              parseFloat(item.previous_amount) || 0,
              parseFloat(item.current_amount) || 0,
            ]);
          } else {
            const amt =
              yearMode == "previous"
                ? item.previous_amount
                : item.current_amount;
            sheetData.push([dept.dept_name, item.name, parseFloat(amt) || 0]);
          }
        });
      });
      if (dept.total) {
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
    XLSX.utils.book_append_sheet(wb, ws, "Revenue Expense");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `revenue_expense_hierarchy_${fyLabel}.xlsx`,
    );
  };

  // Get all level2 groups from all departments
  const getAllLevel2Groups = () => {
    if (!budgetData.length) return [];

    const allGroups = [];

    budgetData.forEach((dept) => {
      if (dept.level2_groups && dept.level2_groups.length > 0) {
        dept.level2_groups.forEach((group) => {
          allGroups.push({
            ...group,
            dept_id: dept.dept_id,
            dept_name: dept.dept_name,
          });
        });
      }
    });

    return allGroups;
  };

  const level2Groups = getAllLevel2Groups();

  // Check if we have any data to display
  const hasData = budgetData.length > 0;

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
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "0",
        fontSize: "11px",
        tableLayout: "fixed",
      },
      th: {
        backgroundColor: "#ecfdf5",
        fontWeight: "600",
        padding: "8px 10px",
        borderTop: "1px solid #d1fae5",
        borderBottom: "1px solid #d1fae5",
        borderLeft: "none",
        borderRight: "none",
        textAlign: "left",
        color: "#047857",
      },
      thRight: {
        backgroundColor: "#ecfdf5",
        fontWeight: "600",
        padding: "8px 10px",
        borderTop: "1px solid #d1fae5",
        borderBottom: "1px solid #d1fae5",
        borderLeft: "none",
        borderRight: "none",
        textAlign: "right",
        whiteSpace: "nowrap",
        color: "#047857",
        width: "20%",
      },
      td: {
        padding: "6px 8px",
        borderTop: "1px solid #e5e7eb",
        borderBottom: "1px solid #e5e7eb",
        borderLeft: "none",
        borderRight: "none",
        verticalAlign: "top",
        wordWrap: "break-word",
      },
      textRight: {
        textAlign: "right",
        whiteSpace: "nowrap",
      },
      textBold: { fontWeight: "600" },
      totalRow: {
        backgroundColor: "#fdf2f8",
        fontWeight: "600",
      },
      totalText: {
        color: "#be123c",
        fontWeight: "600",
      },
    };

    const yearMode = appliedFinancialYear || "";
    const showBothColumns = !yearMode;
    const previousLabel =
      `Previous (${financialYear?.previous_budget?.name || ""}) (₹)`.trim();
    const currentLabel =
      `Current (${financialYear?.current_budget?.name || ""}) (₹)`.trim();

    const getItemAmount = (item) => {
      if (yearMode == "previous") return formatAmount(item.previous_amount);
      if (yearMode == "current") return formatAmount(item.current_amount);
      return "";
    };

    const getTotalAmount = (total) => {
      if (yearMode == "previous") return formatAmount(total.previous);
      if (yearMode == "current") return formatAmount(total.current);
      return "";
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
        </div>

        {/* Department Info */}
        {appliedDepartment && (
          <div style={styles.deptInfo}>
            <strong>Department:</strong> {getAppliedDepartmentDisplay()}
          </div>
        )}

        {/* Data Display */}
        {budgetData.map((dept, deptIdx) => (
          <div
            key={`print-dept-${dept.dept_id}-${deptIdx}`}
            style={{ ...styles.section, borderBottom: "1px solid #e2e8f0" }}
          >
            {/* Dept header with year label on first dept */}
            <div
              style={{
                ...styles.sectionTitle,
                backgroundColor: "#FFCDD2",
                borderLeftColor: "#E53935",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{dept.dept_name}</span>
              {!showBothColumns && deptIdx == 0 && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#B71C1C",
                    whiteSpace: "nowrap",
                  }}
                >
                  {yearMode == "previous" ? previousLabel : currentLabel}
                </span>
              )}
            </div>

            {/* Single merged table for all items */}
            {showBothColumns ? (
              <table style={styles.table}>
                <colgroup>
                  <col style={{ width: "60%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={styles.th}></th>
                    <th style={styles.thRight}>{previousLabel}</th>
                    <th style={styles.thRight}>{currentLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {dept.level2_groups &&
                    dept.level2_groups.flatMap((level2) =>
                      (level2.items || []).map((item, itemIdx) => (
                        <tr
                          key={`print-item-${item.gr_cd}-${itemIdx}`}
                          style={{ backgroundColor: "#ffffff" }}
                        >
                          <td style={styles.td}>
                            <div style={{ wordWrap: "break-word" }}>
                              {item.name}
                            </div>
                          </td>
                          <td style={{ ...styles.td, ...styles.textRight }}>
                            {formatAmount(item.previous_amount)}
                          </td>
                          <td style={{ ...styles.td, ...styles.textRight }}>
                            {formatAmount(item.current_amount)}
                          </td>
                        </tr>
                      )),
                    )}
                </tbody>
              </table>
            ) : (
              <table style={styles.table}>
                <colgroup>
                  <col style={{ width: "60%" }} />
                  <col style={{ width: "40%" }} />
                </colgroup>
                <tbody>
                  {dept.level2_groups &&
                    dept.level2_groups.flatMap((level2) =>
                      (level2.items || []).map((item, itemIdx) => (
                        <tr
                          key={`print-item-${item.gr_cd}-${itemIdx}`}
                          style={{ backgroundColor: "#ffffff" }}
                        >
                          <td style={styles.td}>
                            <div style={{ wordWrap: "break-word" }}>
                              {item.name}
                            </div>
                          </td>
                          <td style={{ ...styles.td, ...styles.textRight }}>
                            {getItemAmount(item)}
                          </td>
                        </tr>
                      )),
                    )}
                </tbody>
              </table>
            )}

            {/* Department Total */}
            {dept.total && (
              <div
                style={{
                  backgroundColor: "#fdf2f8",
                  padding: "6px 10px",
                  borderTop: "1px solid #fecdd3",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "40px",
                }}
              >
                {showBothColumns ? (
                  <>
                    <span
                      style={{
                        fontWeight: "600",
                        color: "#be123c",
                        whiteSpace: "nowrap",
                        fontFamily: "monospace",
                      }}
                    >
                      {formatAmount(dept.total.previous)}
                    </span>
                    <span
                      style={{
                        fontWeight: "600",
                        color: "#be123c",
                        whiteSpace: "nowrap",
                        fontFamily: "monospace",
                      }}
                    >
                      {formatAmount(dept.total.current)}
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      fontWeight: "600",
                      color: "#be123c",
                      whiteSpace: "nowrap",
                      fontFamily: "monospace",
                    }}
                  >
                    {getTotalAmount(dept.total)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Grand Totals */}
        {totals && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px 12px",
              backgroundColor: "#e0f2fe",
              borderTop: "3px solid #0284c7",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: "14px",
              color: "#0c4a6e",
            }}
          >
            <span style={{ wordWrap: "break-word", paddingRight: "10px" }}>
              GRAND TOTAL
              {yearMode == "previous"
                ? " (Previous)"
                : yearMode == "current"
                  ? " (Current)"
                  : ""}
            </span>
            {showBothColumns ? (
              <div style={{ display: "flex", width: "40%" }}>
                <div
                  style={{
                    width: "50%",
                    textAlign: "right",
                    paddingRight: "10px",
                  }}
                >
                  ₹ {formatAmount(totals.previous)}
                </div>
                <div style={{ width: "50%", textAlign: "right" }}>
                  ₹ {formatAmount(totals.current)}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", width: "40%" }}>
                <div style={{ width: "100%", textAlign: "right" }}>
                  ₹ {getTotalAmount(totals)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render filters section with department dropdown
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year
            </label>
            <select
              value={selectedFinancialYear}
              onChange={handleFinancialYearChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select Financial Year</option>
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

            {(hasGenerated || appliedDepartment || appliedFinancialYear) && (
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
      <p className="mt-2 text-gray-500">Loading revenue expense data...</p>
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
          Select <strong>Financial Year</strong> and <strong>Department</strong>
          , then click <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Revenue/Expense Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          {appliedDepartment && appliedDepartment != "all"
            ? "No revenue/expense data available for the selected department."
            : appliedDepartment == "all"
              ? "No revenue/expense data available for any department."
              : "No revenue/expense data available."}
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

  // Render data table
  const renderDataTable = () => {
    const yearMode = appliedFinancialYear || "";
    const showBothColumns = !yearMode;

    const previousLabel =
      `Previous (${financialYear?.previous_budget?.name || ""})`.trim();
    const currentLabel =
      `Current (${financialYear?.current_budget?.name || ""})`.trim();

    const getAmountForItem = (item) => {
      if (yearMode == "previous") return formatAmount(item.previous_amount);
      if (yearMode == "current") return formatAmount(item.current_amount);
      return "";
    };

    const getAmountForTotal = (total) => {
      if (yearMode == "previous") return formatAmount(total.previous);
      if (yearMode == "current") return formatAmount(total.current);
      return "";
    };

    return (
      <div className="space-y-0">
        {budgetData.map((dept, deptIdx) => (
          <div
            key={`dept-${dept.dept_id}-${deptIdx}`}
            className="border border-blue-100 rounded-lg overflow-hidden shadow-sm"
          >
            {/* Department Header */}
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-800">
                {dept.dept_name}
              </h3>
              {!showBothColumns && deptIdx == 0 && (
                <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider whitespace-nowrap">
                  {yearMode == "previous" ? previousLabel : currentLabel}
                </h3>
              )}
            </div>

            {/* Level 2 Groups */}
            {dept.level2_groups &&
              dept.level2_groups.map((level2, l2Idx) => (
                <div
                  key={`l2-${level2.level2_code}-${l2Idx}`}
                  className="border-t border-slate-100"
                >
                  {/* Items Table */}
                  {level2.items && level2.items.length > 0 && (
                    <div className="overflow-x-auto">
                      {showBothColumns ? (
                        <table className="min-w-full table-fixed divide-y divide-gray-200">
                          <colgroup>
                            <col className="w-[60%]" />
                            <col className="w-[20%]" />
                            <col className="w-[20%]" />
                          </colgroup>
                          <thead className="bg-emerald-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                                {/* Name */}
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                                {previousLabel}
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                                {currentLabel}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-100">
                            {level2.items.map((item, itemIdx) => (
                              <tr
                                key={`item-${item.gr_cd}-${itemIdx}`}
                                className="hover:bg-sky-50"
                              >
                                <td className="px-4 py-2 text-sm text-gray-900 align-top break-words">
                                  <div className="whitespace-normal">
                                    {item.name}
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-sm text-right font-mono text-gray-900 align-middle whitespace-nowrap">
                                  {formatAmount(item.previous_amount)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right font-mono text-gray-900 align-middle whitespace-nowrap">
                                  {formatAmount(item.current_amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <table className="min-w-full table-fixed divide-y divide-gray-200">
                          <colgroup>
                            <col className="w-[60%]" />
                            <col className="w-[40%]" />
                          </colgroup>
                          <tbody className="bg-white divide-y divide-slate-100">
                            {level2.items.map((item, itemIdx) => (
                              <tr
                                key={`item-${item.gr_cd}-${itemIdx}`}
                                className="hover:bg-sky-50"
                              >
                                <td className="px-4 py-2 text-sm text-gray-900 align-top break-words">
                                  <div className="whitespace-normal">
                                    {item.name}
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-sm text-right font-mono text-gray-900 align-middle whitespace-nowrap">
                                  {getAmountForItem(item)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              ))}

            {/* Department Total */}
            {dept.total && (
              <div className="bg-pink-50 px-4 py-2 border-t border-pink-200 flex justify-end items-center">
                {showBothColumns ? (
                  <div className="flex gap-6">
                    <span className="font-mono font-semibold text-rose-700 whitespace-nowrap">
                      {formatAmount(dept.total.previous)}
                    </span>
                    <span className="font-mono font-semibold text-rose-700 whitespace-nowrap">
                      {formatAmount(dept.total.current)}
                    </span>
                  </div>
                ) : (
                  <span className="font-mono font-semibold text-rose-700 whitespace-nowrap">
                    {getAmountForTotal(dept.total)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Grand Totals */}
        {totals && (
          <div className="bg-sky-100 px-4 py-3 rounded-lg flex justify-between items-center font-bold text-sky-900 border border-sky-200 shadow-sm">
            <span className="text-base break-words pr-4">
              GRAND TOTAL
              {yearMode == "previous"
                ? " (Previous)"
                : yearMode == "current"
                  ? " (Current)"
                  : ""}
            </span>
            <div className="w-[40%] text-right">
              ₹{" "}
              {showBothColumns
                ? formatAmount(totals.previous)
                : getAmountForTotal(totals)}
              {showBothColumns ? (
                <span className="ml-6">₹ {formatAmount(totals.current)}</span>
              ) : null}
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

export default RevenueExpenseHierarchyReport;
