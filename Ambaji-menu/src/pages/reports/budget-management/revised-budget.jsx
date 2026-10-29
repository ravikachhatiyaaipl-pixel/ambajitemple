"use client";
import React, { useState, useEffect, useRef } from "react";
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
  TrendingUp,
  TrendingDown,
  Minus,
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

const RevisedBudgetReport = () => {
  const [rawBudgetData, setRawBudgetData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [filtersApplied, setFiltersApplied] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [appliedDepartment, setAppliedDepartment] = useState("");
  const [appliedDepartmentData, setAppliedDepartmentData] = useState(null);
  const [appliedFinancialYear, setAppliedFinancialYear] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);

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

  // Set default financial year when component mounts
  useEffect(() => {
    if (currentFinancialYear?.FY_Code && !selectedFinancialYear) {
      setSelectedFinancialYear(currentFinancialYear.FY_Code);
    }
  }, [currentFinancialYear]);

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

    depts.forEach((dept) => {
      map[dept.Dpt_id] = {
        ...dept,
        children: [],
        level: parseInt(dept.GrStt) || 1,
      };
    });

    depts.forEach((dept) => {
      const currentDept = map[dept.Dpt_id];
      const parentGrp = dept.UpGrp;

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

  // Extract unique years from data (from API response if available)
  const extractYearsFromData = (data) => {
    const currentYear = currentFinancialYear?.FY_Code;
    const previousYear = previousFYCode;
    const years = [];
    if (currentYear) years.push(currentYear);
    if (previousYear && previousYear != currentYear) years.push(previousYear);
    return years;
  };

  // Filter data by department (filter groups that have children with matching department_id)
  const filterDataByDepartment = (data, departmentId) => {
    if (!data || data.length == 0) return [];
    if (!departmentId || departmentId == "all") return data;

    // Filter groups that have at least one child with matching department_id
    return data
      .filter((item) => {
        if (item.children && item.children.length > 0) {
          const hasMatchingChild = item.children.some(
            (child) =>
              child.department_id?.toString() == departmentId ||
              child.department_id == departmentId,
          );
          if (hasMatchingChild) {
            // Filter children to only matching department
            const filteredChildren = item.children.filter(
              (child) =>
                child.department_id?.toString() == departmentId ||
                child.department_id == departmentId,
            );
            return { ...item, children: filteredChildren };
          }
          return false;
        }
        return false;
      })
      .filter((item) => item != false);
  };

  // Calculate summary from filtered data using API summary if available
  const calculateSummaryFromData = (filteredData, apiSummary) => {
    if (
      apiSummary &&
      (apiSummary.total_approved_amount != undefined ||
        apiSummary.total_revised_amount != undefined)
    ) {
      return {
        total_proposed: apiSummary.total_approved_amount || 0,
        total_revised: apiSummary.total_revised_amount || 0,
        total_difference: apiSummary.total_difference || 0,
        overall_change_percentage: apiSummary.overall_change_percentage || 0,
        increase_count: apiSummary.increase_count || 0,
        decrease_count: apiSummary.decrease_count || 0,
        unchanged_count: apiSummary.unchanged_count || 0,
      };
    }

    if (!filteredData || filteredData.length == 0) {
      return {
        total_proposed: 0,
        total_revised: 0,
        total_difference: 0,
        overall_change_percentage: 0,
        increase_count: 0,
        decrease_count: 0,
        unchanged_count: 0,
      };
    }

    let totalProposed = 0;
    let totalRevised = 0;
    let increaseCount = 0;
    let decreaseCount = 0;
    let unchangedCount = 0;

    const processItem = (item) => {
      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => {
          if (
            child.approved_amount != null &&
            child.approved_amount != undefined
          ) {
            totalProposed += parseFloat(child.approved_amount) || 0;
            totalRevised += parseFloat(child.revised_amount) || 0;

            const diff =
              (parseFloat(child.revised_amount) || 0) -
              (parseFloat(child.approved_amount) || 0);
            if (diff > 0) increaseCount++;
            else if (diff < 0) decreaseCount++;
            else unchangedCount++;
          }
        });
      } else if (item.approved_amount != null || item.revised_amount != null) {
        totalProposed += parseFloat(item.approved_amount) || 0;
        totalRevised += parseFloat(item.revised_amount) || 0;

        const diff =
          (parseFloat(item.revised_amount) || 0) -
          (parseFloat(item.approved_amount) || 0);
        if (diff > 0) increaseCount++;
        else if (diff < 0) decreaseCount++;
        else unchangedCount++;
      }
    };

    filteredData.forEach((item) => processItem(item));

    const totalDifference = totalRevised - totalProposed;
    const overallChangePercentage =
      totalProposed != 0 ? (totalDifference / totalProposed) * 100 : 0;

    return {
      total_proposed: totalProposed,
      total_revised: totalRevised,
      total_difference: totalDifference,
      overall_change_percentage: overallChangePercentage,
      increase_count: increaseCount,
      decrease_count: decreaseCount,
      unchanged_count: unchangedCount,
    };
  };

  // Apply all filters to the raw data
  const applyFilters = () => {
    if (!rawBudgetData.length) {
      setBudgetData([]);
      setSummaryData(null);
      return;
    }

    // First filter by department
    let filtered = filterDataByDepartment(rawBudgetData, appliedDepartment);

    // Calculate summary from filtered data (use API summary if no department filter)
    const calculatedSummary = calculateSummaryFromData(
      filtered,
      appliedDepartment == "all" ? statistics : null,
    );
    setSummaryData(calculatedSummary);
    setBudgetData(filtered);
  };

  // Apply filters whenever applied filters change
  useEffect(() => {
    if (hasGenerated && rawBudgetData.length) {
      applyFilters();
    }
  }, [appliedDepartment, rawBudgetData]);

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedDepartment("");
    setAppliedDepartmentData(null);
    setAppliedFinancialYear("");
    setBudgetData([]);
    setSummaryData(null);
    setFiltersApplied(null);
    setStatistics(null);
    setError(null);
    setAvailableYears([]);
  };

  // Fetch revised budget data from API
  const fetchBudgetData = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${import.meta.env.VITE_API_URL}/budget-reports/revised`;
      const params = new URLSearchParams();

      if (appliedFinancialYear) {
        params.append("fin_year", appliedFinancialYear);
      }

      if (appliedDepartment && appliedDepartment != "all") {
        params.append("dept_id", appliedDepartment);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log("Fetching URL:", url);
      const response = await axios.get(url, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
      });

      console.log("Revised Budget API Response:", response.data);

      if (response.data.success) {
        const apiData = response.data.data || [];
        setRawBudgetData(apiData);

        const years = extractYearsFromData(apiData);
        setAvailableYears(years);

        setFiltersApplied(response.data.filters_applied || null);
        setStatistics(response.data.summary || null);

        if (response.data.summary) {
          setSummaryData({
            total_proposed: response.data.summary.total_approved_amount || 0,
            total_revised: response.data.summary.total_revised_amount || 0,
            total_difference: response.data.summary.total_difference || 0,
            overall_change_percentage:
              response.data.summary.overall_change_percentage || 0,
            increase_count: response.data.summary.increase_count || 0,
            decrease_count: response.data.summary.decrease_count || 0,
            unchanged_count: response.data.summary.unchanged_count || 0,
          });
        }

        if (
          appliedDepartment &&
          appliedDepartment != "all" &&
          apiData.length > 0
        ) {
          const dept = flattenedDepartments.find(
            (d) => d.Dpt_id?.toString() == appliedDepartment,
          );
          setAppliedDepartmentData(dept || null);
        } else {
          setAppliedDepartmentData(null);
        }
      } else {
        setRawBudgetData([]);
        setBudgetData([]);
        setSummaryData(null);
        setFiltersApplied(null);
        setStatistics(null);
        setAppliedDepartmentData(null);
        setAvailableYears([]);
      }
      setLoading(false);
    } catch (err) {
      console.error(
        "Error fetching revised budget data:",
        err.message,
        err.response?.status,
      );
      setError(
        err.response?.status == 404
          ? "Revised budget data not found. Please check the API endpoint."
          : `Failed to load data: ${err.message}`,
      );
      setRawBudgetData([]);
      setBudgetData([]);
      setSummaryData(null);
      setFiltersApplied(null);
      setStatistics(null);
      setAppliedDepartmentData(null);
      setAvailableYears([]);
      setLoading(false);
    }
  };

  // Generate report handler
  const handleGenerateReport = async () => {
    setAppliedFinancialYear(selectedFinancialYear);
    setAppliedDepartment(selectedDepartment);
    setHasGenerated(true);
    setError(null);

    await fetchBudgetData();
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedDepartment("all");
    setSelectedFinancialYear(currentFinancialYear?.FY_Code || "");
    invalidateReport();
  };

  // =============  DEPARTMENT DISPLAY FUNCTIONS ==============
  const renderDepartmentItem = (dept) => {
    const level = dept.treeLevel || parseInt(dept.GrStt, 10) || 1;
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

  // Use filtered data for display
  const budgetDataForDisplay = budgetData;

  const formatAmount = (amount) => {
    if (!amount && amount != 0) return "0.00";
    const num = parseFloat(amount) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDifference = (difference) => {
    const formatted = formatAmount(Math.abs(difference));
    return difference >= 0 ? `+ ₹ ${formatted}` : `- ₹ ${formatted}`;
  };

  const displaySummary = summaryData || {
    total_proposed: 0,
    total_revised: 0,
    total_difference: 0,
    overall_change_percentage: 0,
    increase_count: 0,
    decrease_count: 0,
    unchanged_count: 0,
  };

  const hasData = budgetData.length > 0;

  const getDisplayYear = () => {
    if (appliedFinancialYear) {
      return appliedFinancialYear;
    }
    return "";
  };

  // Get department name from Dpt_Id
  const getDepartmentName = (dptId) => {
    if (!dptId || dptId == 0) return "-";
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
      <div
        style={{ marginLeft: `${marginLeft}px` }}
        className="break-words whitespace-pre-wrap"
      >
        {groupName.trim()}
      </div>
    );
  };

  // Render child items for a group (actual budget entries)
  const renderChildItems = (children, parentGroupName) => {
    if (!children || children.length == 0) return null;

    return children.map((child, idx) => (
      <tr
        key={`child-${child.budg_id || idx}`}
        className="bg-white hover:bg-gray-50"
      >
        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
          {child.department_name && child.department_name != "Unknown"
            ? child.department_name
            : "-"}
        </td>
        <td className="px-4 py-2 text-sm text-gray-600">
          <span className="text-xs text-gray-400 mr-2">└─</span>
          {child.title || parentGroupName}
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-mono">
          <span className="text-blue-700">
            ₹ {formatAmount(child.approved_amount)}
          </span>
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-mono">
          <span className="text-green-700">
            ₹ {formatAmount(child.revised_amount)}
          </span>
        </td>
        <td
          className={`px-4 py-2 whitespace-nowrap text-sm text-right font-mono font-medium ${
            (child.revision_difference || 0) > 0
              ? "text-green-600"
              : (child.revision_difference || 0) < 0
                ? "text-red-600"
                : "text-gray-500"
          }`}
        >
          {formatDifference(child.revision_difference || 0)}
        </td>
      </tr>
    ));
  };

  const handleExportExcel = () => {
    const displayYearValue = getDisplayYear();

    const buildRows = (data, type) => {
      const rows = [
        [type],
        [
          "Department",
          "Group Name",
          "Approved (₹)",
          "Revised (₹)",
          "Difference (₹)",
        ],
      ];
      data.forEach((item) => {
        if (
          item.AccountType != type &&
          !(type == "INCOME"
            ? item.AccountType == "INCOME"
            : item.AccountType == "EXPENSE")
        )
          return;
        const hasChildren = item.children && item.children.length > 0;
        const hasDirectAmount =
          item.approved_amount != null ||
          item.revised_amount != null ||
          item.total_amount != null;
        const level = parseInt(item.Gr_St) || 1;
        const indent = " ".repeat((level - 1) * 2);
        rows.push([
          !hasChildren && hasDirectAmount
            ? item.Dpt_Id
              ? getDepartmentName(item.Dpt_Id)
              : ""
            : "",
          `${indent}${item.GroupName?.trim() || ""}`,
          item.approved_amount != null
            ? parseFloat(item.approved_amount) || 0
            : item.total_amount != null
              ? parseFloat(item.total_amount) || 0
              : "",
          item.revised_amount != null
            ? parseFloat(item.revised_amount) || 0
            : item.total_amount != null
              ? parseFloat(item.total_amount) || 0
              : "",
          item.revision_difference != null
            ? parseFloat(item.revision_difference) || 0
            : item.total_amount != null
              ? 0
              : "",
        ]);
        if (hasChildren) {
          item.children.forEach((child) => {
            rows.push([
              child.department_name && child.department_name != "Unknown"
                ? child.department_name
                : "-",
              `  └─ ${child.title || item.GroupName || ""}`,
              parseFloat(child.approved_amount) || 0,
              parseFloat(child.revised_amount) || 0,
              parseFloat(child.revision_difference) || 0,
            ]);
          });
        }
      });
      return rows;
    };

    const incomeData = budgetDataForDisplay.filter(
      (i) => i.AccountType == "INCOME",
    );
    const expenseData = budgetDataForDisplay.filter(
      (i) => i.AccountType == "EXPENSE",
    );

    const sheetData = [
      ["Revised Budget Report"],
      displayYearValue ? [`Financial Year: ${displayYearValue}`] : [],
      [],
      ...buildRows(incomeData, "INCOME"),
      [],
      ...buildRows(expenseData, "EXPENSE").slice(2),
      [],
      [
        "",
        "TOTAL",
        parseFloat(displaySummary.total_proposed) || 0,
        parseFloat(displaySummary.total_revised) || 0,
        parseFloat(displaySummary.total_difference) || 0,
      ],
    ].filter((r) => r.length > 0);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revised Budget");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `revised_budget_${displayYearValue || "report"}.xlsx`,
    );
  };

  // Render budget table with tree format - show ALL groups exactly as from API
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
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
              Approved (₹)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
              Revised (₹)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
              Difference (₹)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Show ALL groups from API - maintain exact hierarchy */}
          {budgetDataForDisplay.length > 0 && (
            <>
              {/* Income Section */}
              {budgetDataForDisplay.filter(
                (item) => item.AccountType == "INCOME",
              ).length > 0 && (
                <>
                  <tr className="bg-green-50 sticky top-10 z-10">
                    <td
                      colSpan={5}
                      className="px-4 py-2 text-left text-sm font-bold text-green-800 uppercase"
                    >
                      INCOME
                    </td>
                  </tr>
                  {budgetDataForDisplay.map((item, index) => {
                    if (item.AccountType != "INCOME") return null;
                    const hasChildren =
                      item.children && item.children.length > 0;
                    // Check if this group has any amount data (either direct or from children)
                    const hasDirectAmount =
                      item.approved_amount != null ||
                      item.revised_amount != null ||
                      item.total_amount != null;
                    const hasChildAmount =
                      hasChildren &&
                      item.children.some(
                        (child) =>
                          child.approved_amount != null ||
                          child.revised_amount != null,
                      );
                    const showAmounts = hasDirectAmount || hasChildAmount;

                    return (
                      <React.Fragment key={`income-${item.Gr_Cd || index}`}>
                        <tr
                          className={
                            !hasChildren && showAmounts
                              ? "bg-white"
                              : "bg-gray-50"
                          }
                        >
                          <td className="px-4 py-2 text-sm text-gray-700 align-top">
                            {/* Show department only for leaf nodes that have direct data */}
                            {!hasChildren && hasDirectAmount
                              ? item.Dpt_Id
                                ? getDepartmentName(item.Dpt_Id)
                                : ""
                              : ""}
                          </td>
                          <td
                            className={`px-4 py-2 text-sm align-top ${!hasChildren && showAmounts ? "font-semibold text-gray-800" : "font-medium text-gray-700"}`}
                          >
                            {renderGroupNameWithIndent(
                              item.GroupName,
                              item.Gr_St,
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-mono align-top">
                            {item.approved_amount != null ? (
                              <span className="text-blue-700">
                                ₹ {formatAmount(item.approved_amount)}
                              </span>
                            ) : item.total_amount != null ? (
                              <span className="text-blue-700">
                                ₹ {formatAmount(item.total_amount)}
                              </span>
                            ) : hasChildAmount ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-mono align-top">
                            {item.revised_amount != null ? (
                              <span className="text-green-700">
                                ₹ {formatAmount(item.revised_amount)}
                              </span>
                            ) : item.total_amount != null ? (
                              <span className="text-green-700">
                                ₹ {formatAmount(item.total_amount)}
                              </span>
                            ) : hasChildAmount ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td
                            className={`px-4 py-2 whitespace-nowrap text-sm text-right font-mono align-top ${
                              item.revision_difference > 0
                                ? "text-green-600"
                                : item.revision_difference < 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                            }`}
                          >
                            {item.revision_difference != null ? (
                              formatDifference(item.revision_difference)
                            ) : item.total_amount != null ? (
                              formatDifference(0)
                            ) : hasChildAmount ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                        {hasChildren &&
                          renderChildItems(item.children, item.GroupName)}
                      </React.Fragment>
                    );
                  })}
                </>
              )}

              {/* Expense Section */}
              {budgetDataForDisplay.filter(
                (item) => item.AccountType == "EXPENSE",
              ).length > 0 && (
                <>
                  <tr className="bg-red-50 sticky top-10 z-10">
                    <td
                      colSpan={5}
                      className="px-4 py-2 text-left text-sm font-bold text-red-800 uppercase"
                    >
                      EXPENSES
                    </td>
                  </tr>
                  {budgetDataForDisplay.map((item, index) => {
                    if (item.AccountType != "EXPENSE") return null;
                    const hasChildren =
                      item.children && item.children.length > 0;
                    // Check if this group has any amount data (either direct or from children)
                    const hasDirectAmount =
                      item.approved_amount != null ||
                      item.revised_amount != null ||
                      item.total_amount != null;
                    const hasChildAmount =
                      hasChildren &&
                      item.children.some(
                        (child) =>
                          child.approved_amount != null ||
                          child.revised_amount != null,
                      );
                    const showAmounts = hasDirectAmount || hasChildAmount;

                    return (
                      <React.Fragment key={`expense-${item.Gr_Cd || index}`}>
                        <tr
                          className={
                            !hasChildren && showAmounts
                              ? "bg-white"
                              : "bg-gray-50"
                          }
                        >
                          <td className="px-4 py-2 text-sm text-gray-700 align-top">
                            {/* Show department only for leaf nodes that have direct data */}
                            {!hasChildren && hasDirectAmount
                              ? item.Dpt_Id
                                ? getDepartmentName(item.Dpt_Id)
                                : ""
                              : ""}
                          </td>
                          <td
                            className={`px-4 py-2 text-sm align-top ${!hasChildren && showAmounts ? "font-semibold text-gray-800" : "font-medium text-gray-700"}`}
                          >
                            {renderGroupNameWithIndent(
                              item.GroupName,
                              item.Gr_St,
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-mono align-top">
                            {item.approved_amount != null ? (
                              <span className="text-blue-700">
                                ₹ {formatAmount(item.approved_amount)}
                              </span>
                            ) : item.total_amount != null ? (
                              <span className="text-blue-700">
                                ₹ {formatAmount(item.total_amount)}
                              </span>
                            ) : hasChildAmount ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-mono align-top">
                            {item.revised_amount != null ? (
                              <span className="text-green-700">
                                ₹ {formatAmount(item.revised_amount)}
                              </span>
                            ) : item.total_amount != null ? (
                              <span className="text-green-700">
                                ₹ {formatAmount(item.total_amount)}
                              </span>
                            ) : hasChildAmount ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td
                            className={`px-4 py-2 whitespace-nowrap text-sm text-right font-mono align-top ${
                              item.revision_difference > 0
                                ? "text-green-600"
                                : item.revision_difference < 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                            }`}
                          >
                            {item.revision_difference != null ? (
                              formatDifference(item.revision_difference)
                            ) : item.total_amount != null ? (
                              formatDifference(0)
                            ) : hasChildAmount ? (
                              <span className="text-gray-400">-</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                        {hasChildren &&
                          renderChildItems(item.children, item.GroupName)}
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* Summary Row - only show if there is data with amounts */}
          {(displaySummary.total_proposed > 0 ||
            displaySummary.total_revised > 0) && (
            <tr
              className={`font-bold border-t-2 ${
                displaySummary.total_difference >= 0
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <td colSpan={2} className="px-4 py-3 text-right text-sm">
                TOTAL
              </td>
              <td className="px-4 py-3 text-right text-sm font-mono text-blue-700">
                ₹ {formatAmount(displaySummary.total_proposed)}
              </td>
              <td className="px-4 py-3 text-right text-sm font-mono text-green-700">
                ₹ {formatAmount(displaySummary.total_revised)}
              </td>
              <td
                className={`px-4 py-3 text-right text-sm font-mono ${
                  displaySummary.total_difference >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {formatDifference(displaySummary.total_difference)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

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
          No Revised Budget Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          {appliedDepartment && appliedDepartment != "all"
            ? `No revised budget data available for the selected department.`
            : appliedDepartment == "all"
              ? "No revised budget data available for any department."
              : "No revised budget data available for the selected filters."}
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
            Financial Year: {displayYearValue}
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
    const printBudgetData = budgetData;

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

    const renderChildItemsForPrint = (children, parentGroupName) => {
      if (!children || children.length == 0) return null;

      return children.map((child, idx) => (
        <tr key={`print-child-${child.budg_id || idx}`}>
          <td style={styles.td}>
            {child.department_name && child.department_name != "Unknown"
              ? child.department_name
              : "-"}
          </td>
          <td style={styles.td}>
            <span style={{ fontSize: "10px", color: "#666" }}>└─ </span>
            {child.title || parentGroupName}
          </td>
          <td style={{ ...styles.td, ...styles.textRight }}>
            {formatAmount(child.approved_amount)}
          </td>
          <td style={{ ...styles.td, ...styles.textRight }}>
            {formatAmount(child.revised_amount)}
          </td>
          <td style={{ ...styles.td, ...styles.textRight }}>
            {formatDifference(child.revision_difference || 0)}
          </td>
        </tr>
      ));
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
            Revised Budget Report
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

        {/* Income Section */}
        {printBudgetData.filter((item) => item.AccountType == "INCOME").length >
          0 && (
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
                    Approved (₹)
                  </th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Revised (₹)
                  </th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Difference (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {printBudgetData.map((item, index) => {
                  if (item.AccountType != "INCOME") return null;
                  const hasChildren = item.children && item.children.length > 0;
                  const hasDirectAmount =
                    item.approved_amount != null ||
                    item.revised_amount != null ||
                    item.total_amount != null;
                  const hasChildAmount =
                    hasChildren &&
                    item.children.some(
                      (child) =>
                        child.approved_amount != null ||
                        child.revised_amount != null,
                    );

                  return (
                    <React.Fragment key={`print-income-${item.Gr_Cd || index}`}>
                      <tr
                        style={
                          !hasChildren && (hasDirectAmount || hasChildAmount)
                            ? { fontWeight: 600 }
                            : {}
                        }
                      >
                        <td style={styles.td}>
                          {!hasChildren && hasDirectAmount
                            ? item.Dpt_Id
                              ? getDepartmentName(item.Dpt_Id)
                              : ""
                            : ""}
                        </td>
                        <td style={styles.td}>
                          {renderGroupNameForPrint(item.GroupName, item.Gr_St)}
                        </td>
                        <td style={{ ...styles.td, ...styles.textRight }}>
                          {item.approved_amount != null
                            ? formatAmount(item.approved_amount)
                            : item.total_amount != null
                              ? formatAmount(item.total_amount)
                              : "-"}
                        </td>
                        <td style={{ ...styles.td, ...styles.textRight }}>
                          {item.revised_amount != null
                            ? formatAmount(item.revised_amount)
                            : item.total_amount != null
                              ? formatAmount(item.total_amount)
                              : "-"}
                        </td>
                        <td style={{ ...styles.td, ...styles.textRight }}>
                          {item.revision_difference != null
                            ? formatDifference(item.revision_difference)
                            : item.total_amount != null
                              ? formatDifference(0)
                              : "-"}
                        </td>
                      </tr>
                      {hasChildren &&
                        renderChildItemsForPrint(item.children, item.GroupName)}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Expense Section */}
        {printBudgetData.filter((item) => item.AccountType == "EXPENSE")
          .length > 0 && (
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
                    Approved (₹)
                  </th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Revised (₹)
                  </th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Difference (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {printBudgetData.map((item, index) => {
                  if (item.AccountType != "EXPENSE") return null;
                  const hasChildren = item.children && item.children.length > 0;
                  const hasDirectAmount =
                    item.approved_amount != null ||
                    item.revised_amount != null ||
                    item.total_amount != null;
                  const hasChildAmount =
                    hasChildren &&
                    item.children.some(
                      (child) =>
                        child.approved_amount != null ||
                        child.revised_amount != null,
                    );

                  return (
                    <React.Fragment
                      key={`print-expense-${item.Gr_Cd || index}`}
                    >
                      <tr
                        style={
                          !hasChildren && (hasDirectAmount || hasChildAmount)
                            ? { fontWeight: 600 }
                            : {}
                        }
                      >
                        <td style={styles.td}>
                          {!hasChildren && hasDirectAmount
                            ? item.Dpt_Id
                              ? getDepartmentName(item.Dpt_Id)
                              : ""
                            : ""}
                        </td>
                        <td style={styles.td}>
                          {renderGroupNameForPrint(item.GroupName, item.Gr_St)}
                        </td>
                        <td style={{ ...styles.td, ...styles.textRight }}>
                          {item.approved_amount != null
                            ? formatAmount(item.approved_amount)
                            : item.total_amount != null
                              ? formatAmount(item.total_amount)
                              : "-"}
                        </td>
                        <td style={{ ...styles.td, ...styles.textRight }}>
                          {item.revised_amount != null
                            ? formatAmount(item.revised_amount)
                            : item.total_amount != null
                              ? formatAmount(item.total_amount)
                              : "-"}
                        </td>
                        <td style={{ ...styles.td, ...styles.textRight }}>
                          {item.revision_difference != null
                            ? formatDifference(item.revision_difference)
                            : item.total_amount != null
                              ? formatDifference(0)
                              : "-"}
                        </td>
                      </tr>
                      {hasChildren &&
                        renderChildItemsForPrint(item.children, item.GroupName)}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render filters section
  const renderFilters = () => {
    const yearOptions = [];
    if (currentFinancialYear?.FY_Code) {
      yearOptions.push({
        value: currentFinancialYear.FY_Code,
        label: `Current Year (${currentFinancialYear.FY_Code})`,
      });
    }
    if (previousFYCode && previousFYCode != currentFinancialYear?.FY_Code) {
      yearOptions.push({
        value: previousFYCode,
        label: `Previous Year (${previousFYCode})`,
      });
    }

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year
            </label>
            <select
              value={selectedFinancialYear}
              onChange={(e) => {
                setSelectedFinancialYear(e.target.value);
                if (hasGenerated) invalidateReport();
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {yearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              disabled={loading || dropdownLoading}
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
          title="Revised Budget Report"
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
            <h1 className="text-xl font-bold text-gray-800 text-center">
              Revised Budget Report
            </h1>

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
            ) : !hasGenerated ? (
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

export default RevisedBudgetReport;
