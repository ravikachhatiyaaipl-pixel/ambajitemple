import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiX,
  FiSearch,
  FiCalendar,
  FiHome,
  FiChevronDown,
  FiChevronRight,
  FiCheck,
  FiFolder,
  FiFileText,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiPrinter as FiPrinterIcon,
} from "react-icons/fi";
import axios from "axios";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
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
  disabled = false,
  renderItem,
  includeAllOption = false,
  allOptionLabel = "All Departments",
  allOptionValue = "all",
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
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
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
          </div>
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
                  <FiHome className="h-4 w-4 mr-2" />
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
                    {renderItem ? renderItem(item) : getDisplay(item)}
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

// Payment modes constant
const PAYMENT_MODES = ["Cash", "Bank", "Cheque", "Pos", "MChallan"];
const MODE_LABELS = {
  Cash: "Cash",
  Bank: "Bank Amt",
  Cheque: "Cheque/DD Amt",
  Pos: "POsAmt",
  MChallan: "M-Chalan",
};

// Update this function to handle case-insensitive mode matching
const getPayMode = (payModeDetails, mode) => {
  if (!payModeDetails || !Array.isArray(payModeDetails)) return 0;

  // For Cheque/DD column, combine both "Cheque" and "DD" modes
  if (mode == "Cheque") {
    const chequeTotal = payModeDetails
      .filter((p) => p.mode && p.mode.toLowerCase() == "cheque")
      .reduce((sum, p) => sum + (p.income || 0), 0);

    const ddTotal = payModeDetails
      .filter((p) => p.mode && p.mode.toLowerCase() == "dd")
      .reduce((sum, p) => sum + (p.income || 0), 0);

    return chequeTotal + ddTotal;
  }

  // For other modes, match case-insensitively
  // Handle the exact string variations from your API
  const targetMode = mode.toLowerCase();

  const total = payModeDetails
    .filter((p) => {
      if (!p.mode) return false;
      const pmode = p.mode.toLowerCase();

      if (targetMode == "pos") {
        return pmode == "pos";
      }
      if (targetMode == "mchallan") {
        return pmode == "mchallan";
      }
      return pmode == targetMode;
    })
    .reduce((sum, p) => sum + (p.income || 0), 0);

  return total;
};

// Format currency
const formatCurrency = (amount) => {
  if (amount == undefined || amount == null || amount == 0) return "-";
  const num = typeof amount == "number" ? amount : parseFloat(amount);
  if (isNaN(num)) return "-";
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));
  if (num < 0) {
    return `(${formatted})`;
  }
  return formatted;
};

const SummaryIncomeReport = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState([]);
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [pageTitle, setPageTitle] = useState("Summary Challan/Income Report");

  // Filter states
  const [dateFrom, setDateFrom] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [dateTo, setDateTo] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");

  // Department dropdown states
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptButtonRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    from_date: null,
    to_date: null,
    dept_name: null,
  });
  const [hasGenerated, setHasGenerated] = useState(false);

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();

  // Get dynamic page title
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/cash-bank/summary-income-report";
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

  // Build department tree structure
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

  // Flatten tree for dropdown
  const flattenTree = (nodes, level = 1, result = []) => {
    nodes.forEach((node) => {
      result.push({
        ...node,
        treeLevel: level,
        displayName: `${"    ".repeat(level - 1)}${
          node.Dpt_Desc || node.Dpt_Name
        }`,
      });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1, result);
      }
    });
    return result;
  };

  // Load departments structure
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

  useEffect(() => {
    loadDepartments();
  }, []);

  // Click outside handler
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

  // Focus search when dropdown opens
  useEffect(() => {
    if (isDeptDropdownOpen && deptSearchRef.current) {
      setTimeout(() => deptSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen]);

  // Filter departments
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

  // Fetch report data from API
  const fetchReportData = async (filters = null) => {
    setLoading(true);
    try {
      const activeFilters = filters || appliedFilters;

      const params = new URLSearchParams();

      if (activeFilters.from_date)
        params.append("from_date", activeFilters.from_date);
      if (activeFilters.to_date)
        params.append("to_date", activeFilters.to_date);
      if (activeFilters.dept_name)
        params.append("dept_name", activeFilters.dept_name);

      const url = `${import.meta.env.VITE_API_URL}/ch-income-summary-report?${params.toString()}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.data?.success) {
        // Transform new API response to match the old structure
        const transformedData = response.data.data.map((item) => {
          // Create Pay_Mode_Details from the single payment mode
          const payModeDetails = [];
          if (item["Payment Mode"] && item["Net Payable Amount"]) {
            payModeDetails.push({
              mode: item["Payment Mode"],
              income: parseFloat(item["Net Payable Amount"]) || 0,
              Chq_No: item["Chq/DD No"] || null,
            });
          }

          // Map fields to match old structure
          return {
            Acc_Chl_No: item.Receipt_No,
            CHL_HDT: item.Trans_Date,
            CV_No: item.Bill_No,
            Remarks: item.Description || "",
            Bank_Name: item["Bank Name"] || "",
            Chq_Date: item["Chq/DD Date"] || "",
            Pay_Mode_Details: payModeDetails,
            Dept_Name: "All Departments", // Since API doesn't return department
            CV_Id: item.CV_Id,
          };
        });

        // Group by department (all under "All Departments" since API doesn't return dept)
        const groupedData = [
          {
            Dept_Name: "All Departments",
            Ledger_Details: transformedData,
          },
        ];

        setReportData(groupedData);
        setMessage({
          text: response.data.message || "Data loaded successfully",
          type: "success",
        });
      } else {
        setReportData([]);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading report data",
        type: "error",
      });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setReportData([]);
    setExpandedDepartment(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedDeptFilter("all");
    const emptyFilters = {
      from_date: null,
      to_date: null,
      dept_name: null,
    };
    setAppliedFilters(emptyFilters);
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    let deptNameValue = null;

    if (selectedDeptFilter && selectedDeptFilter != "all") {
      const selectedDept = flattenedDepartments.find(
        (d) => d.Dpt_id?.toString() == selectedDeptFilter,
      );
      deptNameValue = selectedDept?.Dpt_Name || null;
    }

    const newFilters = {
      from_date: dateFrom || null,
      to_date: dateTo || null,
      dept_name: deptNameValue,
    };

    setAppliedFilters(newFilters);
    setHasGenerated(true);
    setExpandedDepartment(null);

    await fetchReportData(newFilters);
  };

  // Department display functions for dropdown
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
    if (selectedDeptFilter == "all") return "All Departments";
    if (!selectedDeptFilter) return "";
    const selected = flattenedDepartments.find(
      (dept) => dept.Dpt_id?.toString() == selectedDeptFilter,
    );
    if (!selected) return "Select Department";

    const level = selected.treeLevel || parseInt(selected.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = selected.Dpt_Desc || selected.desc || "No Description";
    const name = selected.Dpt_Name || selected.name;

    if (name && name != desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  const handleDeptFilterSelect = (dept) => {
    if (dept && dept.isAllOption) {
      setSelectedDeptFilter("all");
    } else if (dept && dept.Dpt_id) {
      setSelectedDeptFilter(dept.Dpt_id.toString());
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
      handleDeptFilterSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    }
  };

  const renderDepartmentTable = () => {
    const allRows = reportData.flatMap((dept) => dept.Ledger_Details || []);
    if (!allRows.length) return null;

    const DETAIL_HEADERS = [
      { label: "S.N.", align: "left" },
      { label: "Receipt No", align: "left" },
      { label: "Receipt Date", align: "left" },
      { label: "Chalan No / Chalan Date", align: "left" },
      { label: "Description", align: "left" },
      { label: "Bank Name", align: "left" },
      { label: "Chq/DD", align: "left" },
      { label: "Chq/DD Dt", align: "left" },
      { label: "Cash", align: "right" },
      { label: "Cheque/DD Amt", align: "right" },
      { label: "POsAmt", align: "right" },
      { label: "M-Chalan", align: "right" },
    ];

    return (
      <div className="border border-gray-200 rounded-lg">
        <div className="w-full overflow-x-auto">
          <table
            className="w-full border-collapse"
            style={{ fontSize: "9pt", tableLayout: "fixed", width: "100%" }}
          >
            <colgroup>
              <col style={{ width: "3%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead className="bg-gray-100">
              <tr>
                {DETAIL_HEADERS.map((col) => (
                  <th
                    key={col.label}
                    style={{
                      textAlign: col.align,
                      padding: "4px",
                      fontSize: "9pt",
                      fontWeight: "600",
                      background: "#f3f4f6",
                      border: "1px solid #999",
                      wordBreak: "break-word",
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allRows.map((bh, idx) => {
                const chqPm = (bh.Pay_Mode_Details || []).find(
                  (p) => p.mode == "Cheque" || p.mode == "DD",
                );
                const chqNo = chqPm?.Chq_No || "-";
                const tdStyle = {
                  padding: "3px 4px",
                  border: "1px solid #999",
                  fontSize: "9pt",
                  wordBreak: "break-word",
                };
                const tdRight = {
                  ...tdStyle,
                  textAlign: "right",
                  fontFamily: "monospace",
                  whiteSpace: "nowrap",
                };
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>
                    <button
  onClick={() =>
    window.open(
      `/transactions/bookkeeping-vouchers/new-challan-update/view/${bh.CV_Id}`,
      '_blank'
    )
  }
  className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
>
  {bh.Acc_Chl_No || "-"}
</button>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {bh.CHL_HDT || "-"}
                    </td>
                    <td style={{ ...tdStyle, wordBreak: "break-all" }}>
                      {bh.CV_No && bh.CHL_HDT
                        ? `${bh.CV_No} / ${bh.CHL_HDT}`
                        : bh.CV_No || bh.CHL_HDT || "-"}
                    </td>
                    <td style={tdStyle}>{bh.Remarks || "-"}</td>
                    <td style={tdStyle}>{bh.Bank_Name || "-"}</td>
                    <td style={tdStyle}>{chqNo}</td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {chqNo != "-" ? bh.Chq_Date || "-" : "-"}
                    </td>
                    <td style={tdRight}>
                      {formatCurrency(getPayMode(bh.Pay_Mode_Details, "Cash"))}
                    </td>
                    <td style={tdRight}>
                      {formatCurrency(
                        getPayMode(bh.Pay_Mode_Details, "Cheque"),
                      )}
                    </td>
                    <td style={tdRight}>
                      {formatCurrency(getPayMode(bh.Pay_Mode_Details, "Pos"))}
                    </td>
                    <td style={tdRight}>
                      {formatCurrency(
                        getPayMode(bh.Pay_Mode_Details, "MChallan"),
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "4px",
                    border: "1px solid #999",
                    fontWeight: "700",
                    fontSize: "9pt",
                    background: "#f9fafb",
                  }}
                >
                  Grand Total
                </td>
                {["Cash", "Cheque", "Pos", "MChallan"].map((mode) => (
                  <td
                    key={mode}
                    style={{
                      padding: "4px",
                      border: "1px solid #999",
                      fontWeight: "700",
                      fontSize: "9pt",
                      textAlign: "right",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                      background: "#f9fafb",
                    }}
                  >
                    {formatCurrency(
                      allRows.reduce(
                        (sum, bh) =>
                          sum + getPayMode(bh.Pay_Mode_Details, mode),
                        0,
                      ),
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // Render filters
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiCalendar className="inline mr-1 h-3 w-3" /> Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiCalendar className="inline mr-1 h-3 w-3" /> Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <SearchableDropdown
              label="Department"
              value={selectedDeptFilter}
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
              onSelect={handleDeptFilterSelect}
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
              renderItem={renderDepartmentItem}
              includeAllOption={true}
              allOptionLabel="All Departments"
              allOptionValue="all"
            />
          </div>

          <div className="flex items-end gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading || dropdownLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <FiSearch className="h-4 w-4 mr-2" />
              Generate Report
            </button>
            {(hasGenerated ||
              appliedFilters.from_date ||
              appliedFilters.to_date ||
              appliedFilters.dept_name) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
              >
                <FiX className="h-4 w-4 mr-2" />
                Clear
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
      <p className="mt-2 text-gray-500">Loading report data...</p>
    </div>
  );

  // Render no data state
  const renderNoData = () =>
    !hasGenerated ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Generate report to view results
        </h3>
        <p className="text-gray-600">
          Select filters and click{" "}
          <span className="font-medium">Generate Report</span> to fetch data.
        </p>
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Records Found
        </h3>
        <p className="text-gray-600">
          No records found for the selected filters.
        </p>
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          <FiX className="h-4 w-4 mr-2" />
          Clear Filters
        </button>
      </div>
    );

  const hasData = reportData.flatMap((d) => d.Ledger_Details || []).length > 0;

  // Export to Excel
  const handleExcelExport = () => {
    const allRows = reportData.flatMap((dept) => dept.Ledger_Details || []);
    const data = allRows.map((bh, idx) => {
      const chqPm = (bh.Pay_Mode_Details || []).find(
        (p) => p.mode == "Cheque" || p.mode == "DD",
      );
      const chqNo = chqPm?.Chq_No || "-";
      return {
        "S.N.": idx + 1,
        "Receipt No": bh.Acc_Chl_No || "-",
        "Receipt Date": bh.CHL_HDT || "-",
        "Chalan No / Chalan Date":
          bh.CV_No && bh.CHL_HDT
            ? `${bh.CV_No} / ${bh.CHL_HDT}`
            : bh.CV_No || bh.CHL_HDT || "-",
        Description: bh.Remarks || "-",
        "Bank Name": bh.Bank_Name || "-",
        "Chq/DD": chqNo,
        "Chq/DD Dt": chqNo != "-" ? bh.CHL_HDT || "-" : "-",
        Cash: getPayMode(bh.Pay_Mode_Details, "Cash"),
        "Cheque/DD Amt": getPayMode(bh.Pay_Mode_Details, "Cheque"),
        POsAmt: getPayMode(bh.Pay_Mode_Details, "Pos"),
        "M-Chalan": getPayMode(bh.Pay_Mode_Details, "MChallan"),
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Income Report");
    XLSX.writeFile(
      wb,
      `Income_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // Signature Line Component for Print (will appear on every page)
  const PrintSignatureLine = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "40px",
        padding: "0 8px",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            borderTop: "1px solid #1f2937",
            width: "160px",
            marginBottom: "4px",
          }}
        ></div>
        <p style={{ fontSize: "10px", fontWeight: "600", margin: 0 }}>
          Account HOD
        </p>
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            borderTop: "1px solid #1f2937",
            width: "160px",
            marginBottom: "4px",
          }}
        ></div>
        <p style={{ fontSize: "10px", fontWeight: "600", margin: 0 }}>DYMC</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100">
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
          <div>
            <style>
              {`
                @media print {
                  body { 
                    margin: 0; 
                    padding: 0;
                  }
                  
                  /* Ensure proper page breaks */
                  .print-content {
                    display: block;
                  }
                  
                  table { 
                    border-collapse: collapse !important; 
                    width: 100% !important; 
                    table-layout: fixed !important;
                    margin-bottom: 20px;
                  }
                  
                  th, td { 
                    border: 1px solid #999 !important; 
                    padding: 4px 6px !important;
                    font-size: 9pt !important;
                  }
                  
                  th { 
                    font-weight: 600 !important; 
                    background: #f3f4f6 !important;
                  }
                  
                  /* Signature appears after table content */
                  .print-signature {
                    margin-top: 60px;
                    page-break-inside: avoid;
                    break-inside: avoid;
                  }
                  
                  /* Prevent orphaned rows */
                  tr {
                    page-break-inside: avoid;
                  }
                  
                  thead {
                    display: table-header-group;
                  }
                  
                  tfoot {
                    display: table-footer-group;
                  }
                }
              `}
            </style>

            {/* Report Header */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                }}
              >
                {pageTitle}
              </h1>
              {appliedFilters.from_date && appliedFilters.to_date && (
                <p style={{ fontSize: "12px", margin: 0 }}>
                  Period: {appliedFilters.from_date} to {appliedFilters.to_date}
                </p>
              )}
              {appliedFilters.dept_name && (
                <p style={{ fontSize: "12px", margin: "4px 0 0 0" }}>
                  Department: {appliedFilters.dept_name}
                </p>
              )}
            </div>

            {/* Report Table */}
            <div className="print-content">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "9pt",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "3%",
                      }}
                    >
                      S.N.
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "6%",
                      }}
                    >
                      Receipt No
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "7%",
                      }}
                    >
                      Receipt Date
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "14%",
                      }}
                    >
                      Chalan No / Chalan Date
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "10%",
                      }}
                    >
                      Description
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "8%",
                      }}
                    >
                      Bank Name
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "7%",
                      }}
                    >
                      Chq/DD
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "6%",
                      }}
                    >
                      Chq/DD Dt
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "11%",
                      }}
                    >
                      Cash
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "11%",
                      }}
                    >
                      Cheque/DD Amt
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "10%",
                      }}
                    >
                      POsAmt
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        border: "1px solid #999",
                        padding: "4px",
                        width: "8%",
                      }}
                    >
                      M-Chalan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData
                    .flatMap((dept) => dept.Ledger_Details || [])
                    .map((bh, idx) => {
                      const chqPm = (bh.Pay_Mode_Details || []).find(
                        (p) => p.mode == "Cheque" || p.mode == "DD",
                      );
                      const chqNo = chqPm?.Chq_No || "-";
                      return (
                        <tr key={idx}>
                          <td
                            style={{ border: "1px solid #999", padding: "4px" }}
                          >
                            {idx + 1}
                          </td>
                          <td
                            style={{ border: "1px solid #999", padding: "4px" }}
                          >
                            {bh.Acc_Chl_No || "-"}
                          </td>
                          <td
                            style={{
                              border: "1px solid #999",
                              padding: "4px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {bh.CHL_HDT || "-"}
                          </td>
                          <td
                            style={{
                              border: "1px solid #999",
                              padding: "4px",
                              wordBreak: "break-word",
                            }}
                          >
                            {bh.CV_No && bh.CHL_HDT
                              ? `${bh.CV_No} / ${bh.CHL_HDT}`
                              : bh.CV_No || bh.CHL_HDT || "-"}
                          </td>
                          <td
                            style={{ border: "1px solid #999", padding: "4px" }}
                          >
                            {bh.Remarks || "-"}
                          </td>
                          <td
                            style={{ border: "1px solid #999", padding: "4px" }}
                          >
                            {bh.Bank_Name || "-"}
                          </td>
                          <td
                            style={{ border: "1px solid #999", padding: "4px" }}
                          >
                            {chqNo}
                          </td>
                          <td
                            style={{
                              border: "1px solid #999",
                              padding: "4px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {chqNo != "-" ? bh.Chq_Date || "-" : "-"}
                          </td>
                          <td
                            style={{
                              border: "1px solid #999",
                              padding: "4px",
                              textAlign: "right",
                              fontFamily: "monospace",
                            }}
                          >
                            {formatCurrency(
                              getPayMode(bh.Pay_Mode_Details, "Cash"),
                            )}
                          </td>
                          <td
                            style={{
                              border: "1px solid #999",
                              padding: "4px",
                              textAlign: "right",
                              fontFamily: "monospace",
                            }}
                          >
                            {formatCurrency(
                              getPayMode(bh.Pay_Mode_Details, "Cheque"),
                            )}
                          </td>
                          <td
                            style={{
                              border: "1px solid #999",
                              padding: "4px",
                              textAlign: "right",
                              fontFamily: "monospace",
                            }}
                          >
                            {formatCurrency(
                              getPayMode(bh.Pay_Mode_Details, "Pos"),
                            )}
                          </td>
                          <td
                            style={{
                              border: "1px solid #999",
                              padding: "4px",
                              textAlign: "right",
                              fontFamily: "monospace",
                            }}
                          >
                            {formatCurrency(
                              getPayMode(bh.Pay_Mode_Details, "MChallan"),
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        border: "1px solid #999",
                        padding: "4px",
                        fontWeight: "bold",
                        background: "#f9fafb",
                      }}
                    >
                      Grand Total
                    </td>
                    {["Cash", "Cheque", "Pos", "MChallan"].map((mode) => {
                      const allRows = reportData.flatMap(
                        (dept) => dept.Ledger_Details || [],
                      );
                      return (
                        <td
                          key={mode}
                          style={{
                            border: "1px solid #999",
                            padding: "4px",
                            fontWeight: "bold",
                            textAlign: "right",
                            fontFamily: "monospace",
                            background: "#f9fafb",
                          }}
                        >
                          {formatCurrency(
                            allRows.reduce(
                              (sum, bh) =>
                                sum + getPayMode(bh.Pay_Mode_Details, mode),
                              0,
                            ),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signature Line - Appears after table on every page */}
            <PrintSignatureLine />
          </div>
        </PrintLayout>
      )}

      <div className="px-4 py-6 max-w-full">
        {/* Header with back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-grey-600 hover:text-grey-600 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>

          <div className="flex space-x-2">
            <button
              onClick={handleExcelExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-600 text-white rounded-lg flex items-center transition-colors shadow-sm"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" /> Excel
            </button>
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-600 text-white rounded-lg flex items-center transition-colors shadow-sm"
              disabled={!hasData || loading}
              title="Print Report"
            >
              <FiPrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* Header with dynamic title */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {pageTitle}
            </h2>
            <p className="text-center text-sm text-gray-500 mt-1">
              Income Report - Transaction Details
            </p>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Period Display */}
          {hasGenerated &&
            appliedFilters.from_date &&
            appliedFilters.to_date && (
              <div className="mb-4 p-2 bg-blue-50 rounded-lg text-center text-sm text-blue-700 border border-blue-200">
                Report Period: {appliedFilters.from_date} to{" "}
                {appliedFilters.to_date}
                {appliedFilters.dept_name &&
                  ` | Department: ${appliedFilters.dept_name}`}
              </div>
            )}

          {/* Success/Error Message */}
          {message.text && !loading && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type == "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : message.type == "error"
                    ? "bg-red-50 border border-red-200 text-red-700"
                    : "bg-blue-50 border border-blue-200 text-blue-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Loading State */}
          {loading && renderLoading()}

          {/* No Data State */}
          {!loading && !hasData && renderNoData()}

          {/* Data Display - Summary Table with Inline Details */}
          {!loading && hasData && renderDepartmentTable()}

          {/* Signature Line - Screen/Web View (only at bottom of page) */}
          {!loading && hasData && (
            <div className="flex justify-between mt-10 px-4">
              <div className="text-center">
                <div className="border-t border-gray-800 w-48 mb-1"></div>
                <p className="text-sm font-semibold text-gray-700">
                  Account HOD
                </p>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-800 w-48 mb-1"></div>
                <p className="text-sm font-semibold text-gray-700">DYMC</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryIncomeReport;
