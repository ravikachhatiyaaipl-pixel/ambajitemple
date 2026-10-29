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
import { FileText } from "lucide-react";
import { BiLoader } from "react-icons/bi";
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

const BudgetUtilization = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [budgetData, setBudgetData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [departmentWiseSummary, setDepartmentWiseSummary] = useState([]);
  const [allDeptSummaryCache, setAllDeptSummaryCache] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");
  const [pageTitle, setPageTitle] = useState("Budget Utilization Report");
  const [reportInfo, setReportInfo] = useState(null);
  const [appliedDepartment, setAppliedDepartment] = useState("");
  const [appliedDepartmentData, setAppliedDepartmentData] = useState(null);
  const [appliedFinancialYear, setAppliedFinancialYear] = useState("");

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
  const { currentFinancialYear, financialYears } = useFinancialYear();

  // Build FY dropdown options
  const fyOptions = (financialYears || [])
    .filter((fy) => fy.FY_Id)
    .map((fy) => ({
      id: String(fy.FY_Id),
      label: fy.is_current_year
        ? `Current (${fy.FY_Code})`
        : `Previous (${fy.FY_Code})`,
    }));

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/budget-management/utilization";
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

  // Auto-select current FY and pre-fetch dept list for dropdown
  useEffect(() => {
    if (currentFinancialYear?.FY_Id) {
      const fyId = String(currentFinancialYear.FY_Id);
      setSelectedFinancialYear(fyId);
      // Pre-fetch to populate allDeptSummaryCache so dropdown shows only API departments
      axios
        .get(
          `${import.meta.env.VITE_API_URL}/budget-reports/utilization?fin_year=${fyId}`,{ headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
        )
        .then((res) => {
          if (res.data?.success) {
            setAllDeptSummaryCache(res.data.department_wise_summary || []);
          }
        })
        .catch(() => {});
    }
  }, [currentFinancialYear]);

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
  // Only show departments that appear in the table data (from the all-depts cache)
  const tableDeptsBase =
    allDeptSummaryCache.length > 0
      ? flattenedDepartments.filter((d) =>
          allDeptSummaryCache.some(
            (s) => String(s.department_id) == String(d.Dpt_id || d.id),
          ),
        )
      : flattenedDepartments;

  useEffect(() => {
    const base =
      allDeptSummaryCache.length > 0
        ? flattenedDepartments.filter((d) =>
            allDeptSummaryCache.some(
              (s) => String(s.department_id) == String(d.Dpt_id || d.id),
            ),
          )
        : flattenedDepartments;

    if (!deptSearchTerm.trim()) {
      setFilteredDepartments(base);
    } else {
      const term = deptSearchTerm.toLowerCase();
      setFilteredDepartments(
        base.filter(
          (dept) =>
            (dept.Dpt_Desc?.toLowerCase() || "").includes(term) ||
            (dept.Dpt_Name?.toLowerCase() || "").includes(term) ||
            (dept.GrCod?.toLowerCase() || "").includes(term),
        ),
      );
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, flattenedDepartments, allDeptSummaryCache]);

  const resetResults = () => {
    setBudgetData([]);
    setSummary(null);
    setDepartmentWiseSummary([]);
    setReportInfo(null);
    setHasGenerated(false);
    setSearchTerm("");
    setMessage({ text: "", type: "" });
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedDepartment("");
    setAppliedDepartmentData(null);
    setAppliedFinancialYear("");
    setBudgetData([]);
    setSummary(null);
    setDepartmentWiseSummary([]);
    setReportInfo(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setSelectedDepartment("all");
    if (currentFinancialYear?.FY_Id)
      setSelectedFinancialYear(String(currentFinancialYear.FY_Id));
    invalidateReport();
  };

  const fetchData = async (fyId, deptId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("fin_year", fyId);
      if (deptId && deptId != "all") params.append("dept_id", deptId);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/budget-reports/utilization?${params.toString()}`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (res.data?.success) {
        // Store report info
        setReportInfo({
          report_name: res.data.report_name,
          financial_year: res.data.financial_year,
          report_date: res.data.report_date,
          filters_applied: res.data.filters_applied,
        });

        // Store summary
        setSummary(res.data.summary || null);

        // Store department-wise summary
        const deptSummary = res.data.department_wise_summary || [];
        setDepartmentWiseSummary(deptSummary);
        // Cache the full list only when fetching all departments
        if (!deptId || deptId == "all") {
          setAllDeptSummaryCache(deptSummary);
        }

        // Normalize data: for specific dept, wrap flat array into expected structure
        const rawData = res.data.data || [];
        if (
          deptId &&
          deptId != "all" &&
          Array.isArray(rawData) &&
          rawData.length > 0 &&
          !rawData[0]?.department_name
        ) {
          setBudgetData([
            {
              department_id: res.data.department?.department_id || deptId,
              department_name: res.data.department?.department_name || "",
              data: rawData,
            },
          ]);
        } else {
          setBudgetData(rawData);
        }

        if (deptId && deptId != "all") {
          const dept = flattenedDepartments.find(
            (d) => (d.Dpt_id || d.id)?.toString() == deptId,
          );
          setAppliedDepartmentData(dept || null);
        } else {
          setAppliedDepartmentData(null);
        }

        setMessage({ text: "", type: "success" });
      } else {
        setBudgetData([]);
        setSummary(null);
        setDepartmentWiseSummary([]);
        setMessage({
          text: res.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("API Error:", err);
      setBudgetData([]);
      setSummary(null);
      setDepartmentWiseSummary([]);
      setMessage({
        text: err.response?.data?.message || "Error loading data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedFinancialYear) {
      setMessage({ text: "Please select a financial year.", type: "info" });
      return;
    }

    // Lock current filters as applied filters
    setAppliedFinancialYear(selectedFinancialYear);
    setAppliedDepartment(selectedDepartment);
    setHasGenerated(true);
    setMessage({ text: "", type: "" });

    await fetchData(selectedFinancialYear, selectedDepartment);
  };

  const handleExportExcel = () => {
    const fyCode =
      reportInfo?.financial_year?.financial_year_code ||
      appliedFinancialYear ||
      "report";

    if (appliedDepartment == "all") {
      // Department-wise summary sheet
      const sheetData = [
        [pageTitle],
        [`Financial Year: ${fyCode}`],
        [],
        [
          "Department",
          "Total Budget",
          "Total Utilized",
          "Total Balance",
          "Utilization %",
        ],
      ];
      departmentWiseSummary.forEach((dept) => {
        sheetData.push([
          dept.department_name,
          parseFloat(dept.total_budget) || 0,
          parseFloat(dept.total_utilized) || 0,
          parseFloat(dept.total_balance) || 0,
          dept.utilization_percentage
            ? `${parseFloat(dept.utilization_percentage).toFixed(2)}%`
            : "-",
        ]);
      });
      if (summary) {
        sheetData.push([]);
        sheetData.push([
          "Total",
          parseFloat(summary.total_budget_approved) || 0,
          parseFloat(summary.total_utilized_amount) || 0,
          parseFloat(summary.total_balance_budget) || 0,
          summary.overall_utilization_percentage
            ? `${parseFloat(summary.overall_utilization_percentage).toFixed(2)}%`
            : "-",
        ]);
      }
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Utilization");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        `budget_utilization_${fyCode}.xlsx`,
      );
    } else {
      // Detailed account heads sheet
      const sheetData = [
        [pageTitle],
        [`Financial Year: ${fyCode}`],
        appliedDepartmentData
          ? [`Department: ${getAppliedDepartmentDisplay()}`]
          : [],
        [],
        [
          "Account Head",
          "Budget Approved",
          "Total Used Budget",
          "Balance Budget",
          "Utilization %",
        ],
      ].filter((r) => r.length > 0);
      filteredRows.forEach((row) => {
        const indent = " ".repeat((row._level - 1) * 2);
        const name =
          row._type == "dept"
            ? row.title || row.department_name
            : row.GroupName?.trim();
        sheetData.push([
          `${indent}${name}`,
          row.budget_approved != null && row.budget_approved != undefined
            ? parseFloat(row.budget_approved) || 0
            : "-",
          row.utilized_amount != null && row.utilized_amount != undefined
            ? parseFloat(row.utilized_amount) || 0
            : "-",
          row.balance_budget != null && row.balance_budget != undefined
            ? parseFloat(row.balance_budget) || 0
            : "-",
          row.utilization_percentage != null &&
          row.utilization_percentage != undefined
            ? `${parseFloat(row.utilization_percentage).toFixed(2)}%`
            : "-",
        ]);
      });
      if (summary) {
        sheetData.push([]);
        sheetData.push([
          "Total",
          parseFloat(summary.total_budget_approved) || 0,
          parseFloat(summary.total_utilized_amount) || 0,
          parseFloat(summary.total_balance_budget) || 0,
          summary.overall_utilization_percentage
            ? `${parseFloat(summary.overall_utilization_percentage).toFixed(2)}%`
            : "-",
        ]);
      }
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Utilization");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        `budget_utilization_${fyCode}.xlsx`,
      );
    }
  };

  const formatAmount = (val) => {
    if (val == undefined || val == null || val == "") return "-";
    const num = parseFloat(val);
    if (isNaN(num)) return "-";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercent = (val) => {
    if (val == undefined || val == null || val == "") return "-";
    const num = parseFloat(val);
    if (isNaN(num)) return "-";
    return `${num.toFixed(2)}%`;
  };

  // Build rows with proper hierarchy from the API structure
  const buildRowsFromAPI = (departmentData) => {
    const rows = [];

    if (!departmentData || !departmentData.data) return rows;

    const processGroup = (group, level = 1, parentName = null) => {
      const row = {
        ...group,
        _type: "group",
        _level: level,
        _parentName: parentName,
        department_name: departmentData.department_name,
        department_id: departmentData.department_id,
      };
      rows.push(row);

      // Process children if they exist and are not empty
      if (group.children && group.children.length > 0) {
        group.children.forEach((child) => {
          rows.push({
            ...child,
            _type: "dept",
            _level: level + 1,
            _parentName: group.GroupName,
            department_name:
              child.department_name || departmentData.department_name,
            budget_approved: child.budget_approved,
            utilized_amount: child.utilized_amount,
            balance_budget: child.balance_budget,
            utilization_percentage: child.utilization_percentage,
          });
        });
      }
    };

    // Process all groups in the data array
    (departmentData.data || []).forEach((group) => {
      const level = parseInt(group.Gr_St) || 1;
      processGroup(group, level);
    });

    return rows;
  };

  // Build all rows for display
  const buildAllRows = () => {
    const allRows = [];
    budgetData.forEach((department) => {
      const departmentRows = buildRowsFromAPI(department);
      allRows.push(...departmentRows);
    });
    return allRows;
  };

  const allRows = buildAllRows();

  const filteredRows = allRows.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (row._type == "group")
      return (row.GroupName || "").toLowerCase().includes(term);
    if (row._type == "dept")
      return (row.title || row.department_name || "")
        .toLowerCase()
        .includes(term);
    return true;
  });

  const hasData = budgetData.length > 0;

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
    if (selected) {
      const level = parseInt(selected.GrStt, 10) || 1;
      const indent = "    ".repeat(level - 1);
      const desc = selected.Dpt_Desc || selected.desc || "No Description";
      const name = selected.Dpt_Name || selected.name;
      return name && name != desc
        ? `${indent}${desc} (${name})`
        : `${indent}${desc}`;
    }
    // fallback: use name from allDeptSummaryCache
    const cached = allDeptSummaryCache.find(
      (s) => String(s.department_id) == selectedDepartment,
    );
    return cached?.department_name || "Selected department";
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

  const handleFinancialYearChange = (e) => {
    const next = e.target.value || "";
    setSelectedFinancialYear(next);
    if (hasGenerated) invalidateReport();
    if (next) {
      axios
        .get(
          `${import.meta.env.VITE_API_URL}/budget-reports/utilization?fin_year=${next}`,{ headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
        )
        .then((res) => {
          if (res.data?.success)
            setAllDeptSummaryCache(res.data.department_wise_summary || []);
        })
        .catch(() => {});
    } else {
      setAllDeptSummaryCache([]);
    }
  };

  const PrintReportContent = () => (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px" }}>
      <div
        style={{
          textAlign: "center",
          marginBottom: "12px",
          borderBottom: "2px solid #333",
          paddingBottom: "8px",
        }}
      >
        <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: "5px 0" }}>
          {pageTitle}
        </h1>
        {reportInfo && (
          <>
            <p style={{ margin: "3px 0", fontSize: "11px" }}>
              Financial Year: {reportInfo.financial_year?.financial_year_code} (
              {reportInfo.financial_year?.financial_year_name})
            </p>
            <p style={{ margin: "3px 0", fontSize: "11px" }}>
              Report Date: {reportInfo.report_date}
            </p>
            {appliedDepartment != "all" && appliedDepartmentData && (
              <p style={{ margin: "3px 0", fontSize: "11px" }}>
                Department: {getAppliedDepartmentDisplay()}
              </p>
            )}
          </>
        )}
      </div>

      {/* Department-wise Summary Table */}
      {departmentWiseSummary.length > 0 && appliedDepartment == "all" && (
        <>
          <h3
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              margin: "10px 0 5px 0",
            }}
          >
            Department-wise Summary
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "11px",
              marginBottom: "15px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0fdf4" }}>
                <th
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #d1fae5",
                    textAlign: "left",
                  }}
                >
                  Department
                </th>
                <th
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #d1fae5",
                    textAlign: "right",
                  }}
                >
                  Total Budget
                </th>
                <th
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #d1fae5",
                    textAlign: "right",
                  }}
                >
                  Total Utilized
                </th>
                <th
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #d1fae5",
                    textAlign: "right",
                  }}
                >
                  Total Balance
                </th>
                <th
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #d1fae5",
                    textAlign: "right",
                  }}
                >
                  Utilization %
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentWiseSummary.map((dept, idx) => (
                <tr
                  key={idx}
                  style={{ backgroundColor: idx % 2 == 0 ? "#fff" : "#f9fafb" }}
                >
                  <td
                    style={{ padding: "6px 8px", border: "1px solid #e5e7eb" }}
                  >
                    {dept.department_name}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    {dept.formatted_total_budget ||
                      formatAmount(dept.total_budget)}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    {dept.formatted_total_utilized ||
                      formatAmount(dept.total_utilized)}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    {dept.formatted_total_balance ||
                      formatAmount(dept.total_balance)}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e5e7eb",
                      textAlign: "right",
                    }}
                  >
                    {formatPercent(dept.utilization_percentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Detailed Budget Utilization Table */}
      <h3
        style={{ fontSize: "13px", fontWeight: "bold", margin: "10px 0 5px 0" }}
      >
        Budget Utilization Details
      </h3>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#ecfdf5" }}>
            <th
              style={{
                padding: "8px 10px",
                border: "1px solid #d1fae5",
                textAlign: "left",
                color: "#047857",
                fontWeight: 600,
              }}
            >
              Account Head
            </th>
            <th
              style={{
                padding: "8px 10px",
                border: "1px solid #d1fae5",
                textAlign: "right",
                color: "#047857",
                fontWeight: 600,
              }}
            >
              Budget Approved
            </th>
            <th
              style={{
                padding: "8px 10px",
                border: "1px solid #d1fae5",
                textAlign: "right",
                color: "#047857",
                fontWeight: 600,
              }}
            >
              Total Used Budget
            </th>
            <th
              style={{
                padding: "8px 10px",
                border: "1px solid #d1fae5",
                textAlign: "right",
                color: "#047857",
                fontWeight: 600,
              }}
            >
              Balance Budget
            </th>
            <th
              style={{
                padding: "8px 10px",
                border: "1px solid #d1fae5",
                textAlign: "right",
                color: "#047857",
                fontWeight: 600,
              }}
            >
              Utilization %
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row, i) => (
            <tr
              key={i}
              style={{
                backgroundColor:
                  row._type == "dept"
                    ? "#f0f9ff"
                    : i % 2 == 0
                      ? "#fff"
                      : "#f9fafb",
              }}
            >
              <td
                style={{
                  padding: "6px 10px",
                  paddingLeft: `${10 + (row._level - 1) * 16}px`,
                  border: "1px solid #e5e7eb",
                  fontStyle: row._type == "dept" ? "italic" : "normal",
                }}
              >
                {row._type == "dept"
                  ? row.title || row.department_name
                  : row.GroupName}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  border: "1px solid #e5e7eb",
                  textAlign: "right",
                }}
              >
                {row.formatted_budget_approved ||
                  formatAmount(row.budget_approved)}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  border: "1px solid #e5e7eb",
                  textAlign: "right",
                }}
              >
                {row.formatted_utilized_amount ||
                  formatAmount(row.utilized_amount)}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  border: "1px solid #e5e7eb",
                  textAlign: "right",
                }}
              >
                {row.formatted_balance_budget ||
                  formatAmount(row.balance_budget)}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  border: "1px solid #e5e7eb",
                  textAlign: "right",
                }}
              >
                {formatPercent(row.utilization_percentage)}
              </td>
            </tr>
          ))}
          {filteredRows.length == 0 && (
            <tr>
              <td
                colSpan="5"
                style={{
                  padding: "20px",
                  textAlign: "center",
                  border: "1px solid #e5e7eb",
                }}
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Overall Summary */}
      {summary && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            borderTop: "2px solid #d1fae5",
            backgroundColor: "#f0fdf4",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "30px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: "bold" }}>Total Approved:</span>
            <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>
              {summary.formatted_total_budget_approved ||
                formatAmount(summary.total_budget_approved)}
            </span>
            <span style={{ fontWeight: "bold" }}>Total Utilized:</span>
            <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>
              {summary.formatted_total_utilized_amount ||
                formatAmount(summary.total_utilized_amount)}
            </span>
            <span style={{ fontWeight: "bold" }}>Balance:</span>
            <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>
              {summary.formatted_total_balance_budget ||
                formatAmount(summary.total_balance_budget)}
            </span>
            <span style={{ fontWeight: "bold" }}>Overall Utilization:</span>
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: "bold",
                color:
                  summary.overall_utilization_percentage > 100
                    ? "#dc2626"
                    : "#047857",
              }}
            >
              {formatPercent(summary.overall_utilization_percentage)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {showPrint && (
        <PrintLayout
          title={pageTitle}
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
        {/* Top nav */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>
          <div className="flex gap-2">
            {hasData && hasGenerated && (
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
                title="Export to Excel"
              >
                <FileText className="h-4 w-4 mr-2" /> Excel
              </button>
            )}
            <button
              onClick={() => setShowPrint(true)}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiPrinter className="h-4 w-4 mr-2" /> Print
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-bold text-gray-800 text-center py-4 border-b border-gray-100">
            {pageTitle}
          </h2>

          {/* Filters Section */}
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Financial Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedFinancialYear}
                  onChange={handleFinancialYearChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Financial Year</option>
                  {fyOptions.map((fy) => (
                    <option key={fy.id} value={fy.id}>
                      {fy.label}
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
                    loading || !selectedFinancialYear || dropdownLoading
                  }
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FiCheck className="h-4 w-4 mr-2" /> Generate Report
                </button>
                {(hasGenerated ||
                  appliedDepartment ||
                  appliedFinancialYear) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
                  >
                    <FiX className="h-4 w-4 mr-2" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading utilization data...</p>
            </div>
          )}

          {!loading && message.type == "error" && (
            <div className="text-center py-16">
              <FiAlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{message.text}</p>
            </div>
          )}

          {!loading && !hasGenerated && message.type != "error" && (
            <div className="text-center py-16">
              <div className="h-12 w-12 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-base mb-1">
                Generate report to view results
              </p>
              <p className="text-gray-400 text-sm">
                Select <strong className="text-gray-600">Financial Year</strong>{" "}
                and <strong className="text-gray-600">Department</strong>, then
                click Generate Report.
              </p>
            </div>
          )}

          {!loading && hasGenerated && message.type != "error" && (
            <div>
              {/* Report Info Bar */}
              {reportInfo && (
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-sm text-gray-600 flex flex-wrap justify-between items-center">
                  <div>
                    <span className="font-medium">Financial Year:</span>{" "}
                    {reportInfo.financial_year?.financial_year_code} (
                    {reportInfo.financial_year?.financial_year_name}) |
                    <span className="font-medium ml-3">Report Date:</span>{" "}
                    {reportInfo.report_date}
                  </div>
                  {appliedDepartment != "all" && appliedDepartmentData && (
                    <div>
                      <span className="font-medium">Department:</span>{" "}
                      {getAppliedDepartmentDisplay()}
                    </div>
                  )}
                </div>
              )}

              {/* Default view: Department-wise Summary only */}
              {appliedDepartment == "all" && (
                <div className="mb-4">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Department-wise Summary
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                            Department
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                            Total Budget
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                            Total Utilized
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                            Total Balance
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                            Utilization %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {departmentWiseSummary.length > 0 ? (
                          departmentWiseSummary.map((dept, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2.5 text-sm text-gray-900">
                                {dept.department_name}
                              </td>
                              <td className="px-4 py-2.5 text-sm text-right font-mono">
                                {dept.formatted_total_budget ||
                                  formatAmount(dept.total_budget)}
                              </td>
                              <td className="px-4 py-2.5 text-sm text-right font-mono">
                                {dept.formatted_total_utilized ||
                                  formatAmount(dept.total_utilized)}
                              </td>
                              <td className="px-4 py-2.5 text-sm text-right font-mono">
                                {dept.formatted_total_balance ||
                                  formatAmount(dept.total_balance)}
                              </td>
                              <td className="px-4 py-2.5 text-sm text-right font-mono">
                                <span
                                  className={
                                    dept.utilization_percentage > 100
                                      ? "text-red-600 font-semibold"
                                      : dept.utilization_percentage >= 75
                                        ? "text-green-600"
                                        : "text-gray-900"
                                  }
                                >
                                  {formatPercent(dept.utilization_percentage)}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-16 text-center">
                              <FiAlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-400 text-sm">
                                No department data available
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {summary && departmentWiseSummary.length > 0 && (
                        <tfoot>
                          <tr className="border-t-2 border-blue-200 bg-blue-50">
                            <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                              Total
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-gray-900">
                              {summary.formatted_total_budget_approved ||
                                formatAmount(summary.total_budget_approved)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-gray-900">
                              {summary.formatted_total_utilized_amount ||
                                formatAmount(summary.total_utilized_amount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-gray-900">
                              {summary.formatted_total_balance_budget ||
                                formatAmount(summary.total_balance_budget)}
                            </td>
                            <td
                              className={`px-4 py-3 text-sm text-right font-mono font-semibold ${summary.overall_utilization_percentage > 100 ? "text-red-600" : summary.overall_utilization_percentage >= 75 ? "text-green-600" : "text-blue-700"}`}
                            >
                              {formatPercent(
                                summary.overall_utilization_percentage,
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}

              {/* Department-specific view: Account heads detail */}
              {appliedDepartment != "all" && (
                <>
                  {/* Toolbar for details */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      Budget Heads:{" "}
                      {
                        allRows.filter(
                          (r) =>
                            r._type == "group" && r.budget_approved != null,
                        ).length
                      }
                    </span>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by account head..."
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                      />
                    </div>
                  </div>

                  {/* Detailed Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          {[
                            "Account Head",
                            "Budget Approved",
                            "Total Used Budget",
                            "Balance Budget",
                            "Utilization %",
                          ].map((h) => (
                            <th
                              key={h}
                              className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h == "Account Head" ? "text-left" : "text-right"}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredRows.length > 0 ? (
                          filteredRows.map((row, i) => {
                            const isDept = row._type == "dept";
                            const isHeader =
                              !isDept && row.budget_approved == null;
                            return (
                              <tr
                                key={i}
                                className={
                                  isDept
                                    ? "bg-blue-50 hover:bg-blue-100"
                                    : isHeader
                                      ? "bg-gray-50"
                                      : "hover:bg-sky-50"
                                }
                              >
                                <td
                                  className={`px-4 py-2.5 text-sm ${isHeader ? "font-semibold text-gray-700" : isDept ? "text-gray-600 italic" : "text-gray-900"}`}
                                  style={{
                                    paddingLeft: `${16 + (row._level - 1) * 20}px`,
                                  }}
                                >
                                  {isDept
                                    ? row.title || row.department_name
                                    : row.GroupName?.trim()}
                                </td>
                                <td
                                  className={`px-4 py-2.5 text-sm text-right font-mono whitespace-nowrap ${isDept ? "text-gray-600" : "text-gray-900"}`}
                                >
                                  {row.formatted_budget_approved ||
                                    formatAmount(row.budget_approved)}
                                </td>
                                <td
                                  className={`px-4 py-2.5 text-sm text-right font-mono whitespace-nowrap ${isDept ? "text-gray-600" : "text-gray-900"}`}
                                >
                                  {row.formatted_utilized_amount ||
                                    formatAmount(row.utilized_amount)}
                                </td>
                                <td
                                  className={`px-4 py-2.5 text-sm text-right font-mono whitespace-nowrap ${isDept ? "text-gray-600" : parseFloat(row.balance_budget) < 0 ? "text-red-600" : "text-gray-900"}`}
                                >
                                  {row.formatted_balance_budget ||
                                    formatAmount(row.balance_budget)}
                                </td>
                                <td
                                  className={`px-4 py-2.5 text-sm text-right font-mono whitespace-nowrap ${isDept ? "text-gray-600" : parseFloat(row.utilization_percentage) > 100 ? "text-red-600 font-semibold" : parseFloat(row.utilization_percentage) >= 75 ? "text-green-600" : "text-gray-900"}`}
                                >
                                  {formatPercent(row.utilization_percentage)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-16 text-center">
                              <FiAlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-400 text-sm">
                                No data found for the selected filters
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Summary Footer for dept-specific view */}
              {summary && appliedDepartment != "all" && (
                <div className="border-t-2 border-blue-200 bg-blue-50">
                  <table className="min-w-full">
                    <tfoot>
                      <tr>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-gray-900 whitespace-nowrap">
                          {summary.formatted_total_budget_approved ||
                            formatAmount(summary.total_budget_approved)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-gray-900 whitespace-nowrap">
                          {summary.formatted_total_utilized_amount ||
                            formatAmount(summary.total_utilized_amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-gray-900 whitespace-nowrap">
                          {summary.formatted_total_balance_budget ||
                            formatAmount(summary.total_balance_budget)}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm text-right font-mono font-semibold whitespace-nowrap ${summary.overall_utilization_percentage > 100 ? "text-red-600" : summary.overall_utilization_percentage >= 75 ? "text-green-600" : "text-blue-700"}`}
                        >
                          {formatPercent(
                            summary.overall_utilization_percentage,
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetUtilization;
