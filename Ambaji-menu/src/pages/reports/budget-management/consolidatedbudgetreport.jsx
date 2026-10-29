"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  Search,
  XCircle,
  Check,
  ChevronDown,
  Loader,
  AlertCircle,
  Info,
  Printer,
  FileText,
} from "lucide-react";
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
                  <Building className="h-4 w-4 mr-2" />
                  <span className="font-medium">{allOptionLabel}</span>
                </div>
                {value == allOptionValue && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
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
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

const ConsolidatedBudgetReport = () => {
  const [rawBudgetData, setRawBudgetData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [filters, setFilters] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("current");
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [appliedDepartment, setAppliedDepartment] = useState("");
  const [appliedDepartmentData, setAppliedDepartmentData] = useState(null);
  const [appliedFinancialYear, setAppliedFinancialYear] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [apiSummary, setApiSummary] = useState(null);

  // Print states
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");
  const { organization } = useOrganization();
  const { currentFinancialYear } = useFinancialYear();

  const previousFYCode = (() => {
    const code = currentFinancialYear?.FY_Code;
    if (!code) return null;
    const years = code.split("-");
    if (years.length != 2) return null;
    const prev = parseInt(years[0]) - 1;
    return `${prev}-${(prev + 1).toString().slice(-2)}`;
  })();

  const navigate = useNavigate();

  // Department dropdown states
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptButtonRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);

  // =============  BUILD TREE STRUCTURE FOR DEPARTMENTS ==============
  const buildDepartmentTree = (depts) => {
    const map = {};
    const roots = [];

    // First, create a map of all departments
    depts.forEach((dept) => {
      map[dept.Dpt_id] = {
        ...dept,
        children: [],
        level: parseInt(dept.GrStt) || 1,
      };
    });

    // Then build the tree structure
    depts.forEach((dept) => {
      const currentDept = map[dept.Dpt_id];
      const parentGrp = dept.UpGrp;

      // Find parent where GrCod matches UpGrp
      const parent = Object.values(map).find(
        (d) => d.GrCod == parentGrp && d.Dpt_id != dept.Dpt_id,
      );

      if (parent && parentGrp != dept.GrCod) {
        parent.children.push(currentDept);
      } else if (currentDept.level == 1 || !parent) {
        roots.push(currentDept);
      }
    });

    return roots;
  };

  // =============  FLATTEN TREE FOR DISPLAY ==============
  const flattenTree = (nodes, level = 1, result = []) => {
    nodes.forEach((node) => {
      result.push({
        ...node,
        treeLevel: level,
        displayName: `${"    ".repeat(level - 1)}${node.Dpt_Desc}`,
      });
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
          (dept) => dept.isvisible == 1 || dept.isvisible == "1",
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

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  // Extract unique years from data
  const extractYearsFromData = (data) => {
    if (!data || data.length == 0) return [];
    const years = [...new Set(data.map((item) => item.Fin_Year))]
      .filter((year) => year)
      .sort();
    return years;
  };

  // Filter data by financial year
  const filterDataByFinancialYear = (data, financialYear) => {
    if (!data || data.length == 0) return [];
    if (!financialYear) return data;

    if (financialYear == "current") {
      return data.filter((item) => item.Fin_Year == "3");
    } else if (financialYear == "previous") {
      return data.filter((item) => item.Fin_Year == "2");
    }

    return data;
  };

  // Calculate summary from filtered data
  const calculateSummaryFromData = (filteredData) => {
    if (!filteredData || filteredData.length == 0) {
      return {
        total_income: 0,
        total_expense: 0,
        net_surplus_deficit: 0,
        status: "SURPLUS",
        year: "",
      };
    }

    const incomeTotal = filteredData
      .filter((item) => item.AccountType == "INCOME")
      .reduce((sum, item) => sum + (parseFloat(item.Amount) || 0), 0);

    const expenseTotal = filteredData
      .filter((item) => item.AccountType == "EXPENSE")
      .reduce((sum, item) => sum + (parseFloat(item.Amount) || 0), 0);

    const netTotal = incomeTotal - expenseTotal;
    const status = netTotal >= 0 ? "SURPLUS" : "DEFICIT";

    const finYear = filteredData.length > 0 ? filteredData[0].Fin_Year : "";

    return {
      total_income: incomeTotal,
      total_expense: expenseTotal,
      net_surplus_deficit: Math.abs(netTotal),
      status: status,
      year: finYear,
    };
  };

  // Apply all filters to the raw data
  const applyFilters = () => {
    if (!rawBudgetData.length) {
      setBudgetData([]);
      setSummaryData(null);
      return;
    }

    // Filter by financial year
    let filtered = filterDataByFinancialYear(
      rawBudgetData,
      appliedFinancialYear,
    );

    // Calculate summary from filtered data
    const calculatedSummary = calculateSummaryFromData(filtered);
    setSummaryData(calculatedSummary);
    setBudgetData(filtered);

    // Extract available years from raw data for display
    const years = extractYearsFromData(rawBudgetData);
    setAvailableYears(years);
  };

  // Apply filters whenever applied filters change
  useEffect(() => {
    if (hasGenerated && rawBudgetData.length) {
      applyFilters();
    }
  }, [appliedFinancialYear, rawBudgetData]);

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedDepartment("");
    setAppliedDepartmentData(null);
    setAppliedFinancialYear("");
    setBudgetData([]);
    setSummaryData(null);
    setFilters(null);
    setStatistics(null);
    setApiSummary(null);
    setError(null);
    setAvailableYears([]);
  };

  // Fetch budget summary data from API
  const fetchBudgetData = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${import.meta.env.VITE_API_URL}/budget/summary`;
      const params = new URLSearchParams();

      if (selectedDepartment && selectedDepartment != "all") {
        params.append("dpt_id", selectedDepartment);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log("Fetching URL:", url);
      const response = await axios.get(url,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      console.log("Budget API Response:", response.data);

      if (response.data.success) {
        const apiData = response.data.details || [];
        setRawBudgetData(apiData);

        const years = extractYearsFromData(apiData);
        setAvailableYears(years);
        console.log("Available years in data:", years);

        setFilters(response.data.filters || null);
        setStatistics(response.data.statistics || null);
        setApiSummary(response.data.summary || null);

        if (
          selectedDepartment &&
          selectedDepartment != "all" &&
          apiData.length > 0
        ) {
          const dept = flattenedDepartments.find(
            (d) => d.Dpt_id?.toString() == selectedDepartment,
          );
          setAppliedDepartmentData(dept || null);
        } else if (selectedDepartment && selectedDepartment != "all") {
          const dept = flattenedDepartments.find(
            (d) => d.Dpt_id?.toString() == selectedDepartment,
          );
          setAppliedDepartmentData(dept || null);
        } else {
          setAppliedDepartmentData(null);
        }
      } else {
        setRawBudgetData([]);
        setBudgetData([]);
        setSummaryData(null);
        setFilters(null);
        setStatistics(null);
        setApiSummary(null);
        setAppliedDepartmentData(null);
        setAvailableYears([]);
      }
      setLoading(false);
    } catch (err) {
      console.error(
        "Error fetching budget data:",
        err.message,
        err.response?.status,
      );
      setError(
        err.response?.status == 404
          ? "Budget data not found. Please check the API endpoint."
          : `Failed to load data: ${err.message}`,
      );
      setRawBudgetData([]);
      setBudgetData([]);
      setSummaryData(null);
      setFilters(null);
      setStatistics(null);
      setApiSummary(null);
      setAppliedDepartmentData(null);
      setAvailableYears([]);
      setLoading(false);
    }
  };

  // Generate report handler
  const handleGenerateReport = async () => {
    if (!selectedFinancialYear) {
      setError("Please select financial year.");
      return;
    }

    setAppliedFinancialYear(selectedFinancialYear);
    setAppliedDepartment(selectedDepartment);
    setHasGenerated(true);
    setError(null);

    await fetchBudgetData();
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedDepartment("all");
    setSelectedFinancialYear("current");
    invalidateReport();
  };

  // =============  DEPARTMENT DISPLAY FUNCTIONS ==============
  const renderDepartmentItem = (dept) => {
    const level = dept.treeLevel || parseInt(dept.GrStt, 10) || 1;
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
    if (selectedDepartment == "all") return "All Departments";
    if (!selectedDepartment) return "";
    const selected = flattenedDepartments.find(
      (dept) => dept.Dpt_id?.toString() == selectedDepartment,
    );
    if (!selected) return "Selected department not found";

    const level = selected.treeLevel || parseInt(selected.GrStt, 10) || 1;
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

    const level =
      appliedDepartmentData.treeLevel ||
      parseInt(appliedDepartmentData.GrStt, 10) ||
      1;
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
    } else if (dept && dept.Dpt_id) {
      setSelectedDepartment(dept.Dpt_id.toString());
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

  // Separate income and expense data
  const incomeData = budgetData.filter((item) => item.AccountType == "INCOME");
  const expenseData = budgetData.filter(
    (item) => item.AccountType == "EXPENSE",
  );

  const formatAmount = (amount) => {
    if (!amount && amount != 0) return "0.00";
    const num = parseFloat(amount) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const displaySummary = summaryData || {
    total_income: 0,
    total_expense: 0,
    net_surplus_deficit: 0,
    status: "SURPLUS",
    year: "",
  };

  const hasData = budgetData.length > 0;

  const getDisplayYear = () => {
    if (appliedFinancialYear == "current") {
      return currentFinancialYear?.FY_Code || "";
    } else if (appliedFinancialYear == "previous") {
      return previousFYCode || "";
    }
    return "";
  };

  // Get department name from Dpt_Id
  const getDepartmentName = (dptId) => {
    if (!dptId) return "-";
    const dept = flattenedDepartments.find(
      (d) => d.Dpt_id?.toString() == dptId.toString(),
    );
    return dept ? dept.Dpt_Desc || dept.Dpt_Name || dptId : dptId;
  };

  // Render group name with indentation based on Gr_St level
  const renderGroupNameWithIndent = (groupName, grSt) => {
    if (!groupName) return "-";
    const level = parseInt(grSt) || 1;
    const marginLeft = (level - 1) * 24;
    return (
      <div style={{ marginLeft: `${marginLeft}px` }} className="break-words">
        {groupName.trim()}
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="text-red-500 text-center p-4">{error}</div>
  );

  // Render no data state
  const renderNoData = () => {
    const displayYearValue = getDisplayYear();

    return !hasGenerated ? (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <Info className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Generate report to view results
        </h3>
        <p className="text-gray-600 mb-4">
          Select <strong>Financial Year</strong> and <strong>Department</strong>
          , then click <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-gray-500 text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <Info className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Budget Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          {appliedDepartment && appliedDepartment != "all"
            ? `No budget data available for the selected department.`
            : appliedDepartment == "all"
              ? "No budget data available for any department."
              : "No budget data available for the selected filters."}
        </p>
        {appliedDepartment &&
          appliedDepartment != "all" &&
          appliedDepartmentData && (
            <div className="bg-blue-50 p-3 rounded-lg inline-block mx-auto">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Selected Department:</span>{" "}
                {getAppliedDepartmentDisplay()}
              </p>
            </div>
          )}
        {appliedFinancialYear && displayYearValue && (
          <div className="mt-2 text-sm text-gray-600">
            Financial Year:{" "}
            {appliedFinancialYear == "current"
              ? "Current Year"
              : "Previous Year"}{" "}
            ({displayYearValue})
          </div>
        )}
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Clear Filters
        </button>
      </div>
    );
  };

  const PrintReportContent = () => {
    const printIncomeData = budgetData.filter(
      (item) => item.AccountType == "INCOME",
    );
    const printExpenseData = budgetData.filter(
      (item) => item.AccountType == "EXPENSE",
    );
    const styles = {
      section: { marginBottom: "12px" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "8px 12px",
        margin: "10px 0",
        fontWeight: "600",
        borderLeft: "3px solid #EF5350",
        fontSize: "14px",
        color: "#1f2937",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "8px 0",
        fontSize: "11px",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "8px 10px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      td: {
        padding: "6px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textRight: { textAlign: "right" },
      textBold: { fontWeight: "600" },
      textBlue: { color: "#E53935" },
      textRed: { color: "#dc2626" },
      textGreen: { color: "#16a34a" },
    };

    // Function to preserve indentation in print
    const renderGroupNameForPrint = (groupName, grSt) => {
      if (!groupName) return "-";
      const level = parseInt(grSt) || 1;
      return (
        <span
          style={{
            display: "inline-block",
            marginLeft: `${(level - 1) * 12}px`,
          }}
        >
          {groupName.trim()}
        </span>
      );
    };

    const displayYearValue = getDisplayYear();

    return (
      <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Consolidated Budget Report
          </h1>
          {appliedFinancialYear && displayYearValue && (
            <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
              Financial Year: {displayYearValue}
            </div>
          )}
        </div>

        {appliedDepartment && appliedDepartment != "all" && (
          <div style={styles.section}>
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: "#f8fafc",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: "4px 0" }}>
                <span style={{ fontWeight: "600" }}>Department: </span>
                {getAppliedDepartmentDisplay()}
              </p>
            </div>
          </div>
        )}

        {/* Income Section with Tree Format */}
        {printIncomeData.length > 0 && (
          <div style={styles.section}>
            <div
              style={{
                ...styles.sectionTitle,
                backgroundColor: "#dcfce7",
                borderLeftColor: "#16a34a",
              }}
            >
              INCOME
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Group Name</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {printIncomeData.map((item, index) => (
                  <tr key={`print-income-${item.Gr_Cd}-${index}`}>
                    <td style={styles.td}>{getDepartmentName(item.Dpt_Id)}</td>
                    <td style={styles.td}>
                      {renderGroupNameForPrint(item.GroupName, item.Gr_St)}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        ...styles.textGreen,
                      }}
                    >
                      ₹ {formatAmount(item.Amount)}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: "#f0fdf4", fontWeight: "600" }}>
                  <td colSpan="2" style={{ ...styles.td, textAlign: "right" }}>
                    TOTAL INCOME
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.textGreen,
                    }}
                  >
                    ₹ {formatAmount(displaySummary.total_income)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Expense Section with Tree Format */}
        {printExpenseData.length > 0 && (
          <div style={styles.section}>
            <div
              style={{
                ...styles.sectionTitle,
                backgroundColor: "#fee2e2",
                borderLeftColor: "#dc2626",
              }}
            >
              EXPENSES
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Group Name</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {printExpenseData.map((item, index) => (
                  <tr key={`print-expense-${item.Gr_Cd}-${index}`}>
                    <td style={styles.td}>{getDepartmentName(item.Dpt_Id)}</td>
                    <td style={styles.td}>
                      {renderGroupNameForPrint(item.GroupName, item.Gr_St)}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        ...styles.textRed,
                      }}
                    >
                      ₹ {formatAmount(item.Amount)}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: "#fef2f2", fontWeight: "600" }}>
                  <td colSpan="2" style={{ ...styles.td, textAlign: "right" }}>
                    TOTAL EXPENSES
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.textRed,
                    }}
                  >
                    ₹ {formatAmount(displaySummary.total_expense)}
                  </td>
                </tr>
                <tr
                  style={{
                    backgroundColor:
                      displaySummary.status == "SURPLUS"
                        ? "#f0fdf4"
                        : "#fef2f2",
                    fontWeight: "700",
                    borderTop: "2px solid",
                    borderTopColor:
                      displaySummary.status == "SURPLUS"
                        ? "#16a34a"
                        : "#dc2626",
                  }}
                >
                  <td
                    colSpan="2"
                    style={{
                      ...styles.td,
                      textAlign: "right",
                      fontWeight: "700",
                    }}
                  >
                    NET {displaySummary.status}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      fontWeight: "700",
                      color:
                        displaySummary.status == "SURPLUS"
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                  >
                    ₹ {formatAmount(displaySummary.net_surplus_deficit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const handleExportExcel = () => {
    const displayYearValue = getDisplayYear();
    const wb = XLSX.utils.book_new();

    const buildSheetData = (data, type) => {
      const rows = [
        ["Consolidated Budget Report"],
        displayYearValue ? [`Financial Year: ${displayYearValue}`] : [],
        [],
        [type],
        ["Department", "Group Name", "Amount (₹)"],
        ...data.map((item) => [
          getDepartmentName(item.Dpt_Id),
          `${" ".repeat(((parseInt(item.Gr_St) || 1) - 1) * 2)}${item.GroupName?.trim() || ""}`,
          parseFloat(item.Amount) || 0,
        ]),
      ];
      return rows;
    };

    const incomeRows = buildSheetData(incomeData, "INCOME");
    const totalIncomeRow = [
      "",
      "TOTAL INCOME",
      parseFloat(displaySummary.total_income) || 0,
    ];
    const expenseRows = buildSheetData(expenseData, "EXPENSES");
    const totalExpenseRow = [
      "",
      "TOTAL EXPENSES",
      parseFloat(displaySummary.total_expense) || 0,
    ];
    const netRow = [
      "",
      `NET ${displaySummary.status}`,
      parseFloat(displaySummary.net_surplus_deficit) || 0,
    ];

    const allRows = [
      ...incomeRows,
      totalIncomeRow,
      [],
      ...expenseRows.slice(3), // skip duplicate header rows
      totalExpenseRow,
      netRow,
    ];

    const ws = XLSX.utils.aoa_to_sheet(allRows);
    XLSX.utils.book_append_sheet(wb, ws, "Budget Report");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `consolidated_budget_${displayYearValue || "report"}.xlsx`,
    );
  };

  // Render budget table with tree format (preserving indentation)
  const renderBudgetTable = () => (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
              Department
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Group Name
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
              Amount (₹)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Income Section */}
          {incomeData.length > 0 && (
            <tr className="bg-gray-100 sticky top-10 z-10">
              <td
                colSpan={3}
                className="px-4 py-2 text-left text-sm font-bold text-gray-900 uppercase"
              >
                INCOME
              </td>
            </tr>
          )}

          {incomeData.map((item, index) => (
            <tr
              key={`income-${item.Gr_Cd}-${index}`}
              className={`${index % 2 == 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
            >
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 align-top">
                {getDepartmentName(item.Dpt_Id)}
              </td>
              <td className="px-4 py-2 text-sm align-top">
                {renderGroupNameWithIndent(item.GroupName, item.Gr_St)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-mono align-top">
                <span className="font-medium text-blue-700">
                  ₹ {formatAmount(item.Amount)}
                </span>
              </td>
            </tr>
          ))}

          {/* Total Income */}
          {incomeData.length > 0 && (
            <tr className="bg-blue-50 font-bold border-t-2 border-blue-300">
              <td className="px-4 py-2 text-left text-sm text-gray-900"></td>
              <td className="px-4 py-2 text-left text-sm text-blue-700">
                TOTAL INCOME
              </td>
              <td className="px-4 py-2 text-right text-sm text-blue-700">
                ₹ {formatAmount(displaySummary.total_income)}
              </td>
            </tr>
          )}

          {/* Expense Section */}
          {expenseData.length > 0 && (
            <tr className="bg-gray-100 sticky top-10 z-10">
              <td
                colSpan={3}
                className="px-4 py-2 text-left text-sm font-bold text-gray-900 uppercase"
              >
                EXPENSES
              </td>
            </tr>
          )}

          {expenseData.map((item, index) => (
            <tr
              key={`expense-${item.Gr_Cd}-${index}`}
              className={`${index % 2 == 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
            >
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 align-top">
                {getDepartmentName(item.Dpt_Id)}
              </td>
              <td className="px-4 py-2 text-sm align-top">
                {renderGroupNameWithIndent(item.GroupName, item.Gr_St)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-mono align-top">
                <span className="font-medium text-red-700">
                  ₹ {formatAmount(item.Amount)}
                </span>
              </td>
            </tr>
          ))}

          {/* Total Expenses */}
          {expenseData.length > 0 && (
            <tr className="bg-red-50 font-bold border-t-2 border-red-300">
              <td className="px-4 py-2 text-left text-sm text-gray-900"></td>
              <td className="px-4 py-2 text-left text-sm text-red-700">
                TOTAL EXPENSES
              </td>
              <td className="px-4 py-2 text-right text-sm text-red-700">
                ₹ {formatAmount(displaySummary.total_expense)}
              </td>
            </tr>
          )}

          {/* Net Surplus/Deficit - only when both sections have data */}
          {incomeData.length > 0 && expenseData.length > 0 && (
            <tr
              className={`font-bold border-t-2 ${
                displaySummary.status == "SURPLUS"
                  ? "bg-green-50 border-green-300"
                  : "bg-yellow-50 border-yellow-300"
              }`}
            >
              <td className="px-4 py-2 text-left text-sm"></td>
              <td className="px-4 py-2 text-left text-sm">
                <span
                  className={
                    displaySummary.status == "SURPLUS"
                      ? "text-green-700"
                      : "text-yellow-700"
                  }
                >
                  NET {displaySummary.status}
                </span>
              </td>
              <td
                className={`px-4 py-2 text-right text-sm ${
                  displaySummary.status == "SURPLUS"
                    ? "text-green-700"
                    : "text-yellow-700"
                }`}
              >
                ₹ {formatAmount(displaySummary.net_surplus_deficit)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Render filters section with department dropdown and financial year
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedFinancialYear}
              onChange={(e) => {
                setSelectedFinancialYear(e.target.value);
                if (hasGenerated) invalidateReport();
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="current">
                Current{" "}
                {currentFinancialYear?.FY_Code
                  ? `(${currentFinancialYear.FY_Code})`
                  : "Year"}
              </option>
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
              placeholder="Select Department"
              searchPlaceholder="Search by department name, description..."
              buttonRef={deptButtonRef}
              dropdownRef={deptDropdownRef}
              searchRef={deptSearchRef}
              itemRefs={deptItemRefs}
              listRef={deptListRef}
              getId={(item) => item?.Dpt_id?.toString()}
              renderItem={renderDepartmentItem}
              includeAllOption={true}
              allOptionLabel="All Departments"
              allOptionValue="all"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading || !selectedFinancialYear || dropdownLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </button>

            {(hasGenerated || appliedDepartment || appliedFinancialYear) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title="Consolidated Budget Report"
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
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center border-b p-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <ArrowLeft className="mr-1" /> Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              Consolidated Budget Report
            </h1>

            {/* Action Buttons */}
            <div className="flex gap-2">
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
              {hasData && hasGenerated && (
                <button
                  onClick={() => setShowPrint(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
                  title="Print Report"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </button>
              )}
            </div>
          </div>

          <div className="p-4 w-full">
            {renderFilters()}

            {loading ? (
              renderLoading()
            ) : error ? (
              renderError()
            ) : !hasData && !hasGenerated ? (
              renderNoData()
            ) : !hasData && hasGenerated ? (
              renderNoData()
            ) : (
              <>{renderBudgetTable()}</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedBudgetReport;
