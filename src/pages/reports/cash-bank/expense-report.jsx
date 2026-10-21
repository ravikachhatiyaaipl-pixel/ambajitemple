import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiX,
  FiSearch,
  FiCalendar,
  FiHome,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import axios from "axios";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
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

const ExpenseReport = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pageTitle, setPageTitle] = useState("Expense Report");

  // Filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedDeptName, setSelectedDeptName] = useState("");

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
  const [appliedDepartmentData, setAppliedDepartmentData] = useState(null);

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();

  // Payment modes from API
  const paymentModes = ["Cash", "Bank", "Cheque", "Online", "DD", "Pos"];

  // Get dynamic page title
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/core-ledger/expense";

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

  // Flatten tree for display
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

  // Transform API data to include only expense for each payment mode
  const transformReportData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData.map((dept, index) => {
      // Initialize payment mode expense data
      const paymentModeExpense = {};
      paymentModes.forEach((mode) => {
        paymentModeExpense[mode] = 0;
      });

      // Fill data from Pay_Mode_Details (only expense)
      if (dept.Pay_Mode_Details && Array.isArray(dept.Pay_Mode_Details)) {
        dept.Pay_Mode_Details.forEach((mode) => {
          const modeName = mode.mode;
          if (paymentModeExpense[modeName] != undefined) {
            paymentModeExpense[modeName] = mode.expense || 0;
          }
        });
      }

      const totalExpense = parseFloat(dept.Total_Expense) || 0;

      return {
        sr_no: index + 1,
        department: dept.Dept_Name,
        total_expense: totalExpense,
        payment_modes_expense: paymentModeExpense,
      };
    });
  };

  // Calculate summary from transformed data
  const calculateSummary = (data) => {
    let totalExpense = 0;
    const totalPaymentModesExpense = {};

    paymentModes.forEach((mode) => {
      totalPaymentModesExpense[mode] = 0;
    });

    data.forEach((item) => {
      totalExpense += item.total_expense;

      paymentModes.forEach((mode) => {
        totalPaymentModesExpense[mode] += item.payment_modes_expense[mode];
      });
    });

    return {
      total_expense: totalExpense,
      total_payment_modes_expense: totalPaymentModesExpense,
      department_count: data.length,
    };
  };

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

      const url = `${import.meta.env.VITE_API_URL}/ch-voucher/report?${params.toString()}`;
      const response = await axios.get(url,{ headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });

      if (response.data?.success) {
        let data = response.data.data || [];

        // Client-side department filtering by name if needed
        if (activeFilters.dept_name && activeFilters.dept_name != "all") {
          data = data.filter((item) =>
            item.Dept_Name?.toLowerCase().includes(
              activeFilters.dept_name.toLowerCase(),
            ),
          );
        }

        // Filter out departments with zero expense if needed? (keeping all for now)
        const transformedData = transformReportData(data);
        setReportData(transformedData);

        const calculatedSummary = calculateSummary(transformedData);
        setSummary(calculatedSummary);

        // setMessage({
        //     text: response.data.message || "Data loaded successfully",
        //     type: "success",
        // });
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setReportData([]);
        setSummary(null);
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading report data",
        type: "error",
      });
      setReportData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setReportData([]);
    setSummary(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedDepartment("all");
    setSelectedDeptName("");
    setAppliedDepartmentData(null);
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
    let selectedDeptData = null;

    if (selectedDepartment && selectedDepartment != "all") {
      const selectedDept = flattenedDepartments.find(
        (d) => d.Dpt_id?.toString() == selectedDepartment,
      );
      deptNameValue = selectedDept?.Dpt_Name || null;
      selectedDeptData = selectedDept || null;
    }

    setAppliedDepartmentData(selectedDeptData);
    setSelectedDeptName(deptNameValue);

    const newFilters = {
      from_date: dateFrom || null,
      to_date: dateTo || null,
      dept_name: deptNameValue,
    };

    setAppliedFilters(newFilters);
    setHasGenerated(true);

    await fetchReportData(newFilters);
  };

  // Department display functions
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

  // Format currency as per Indian format
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

  // Export to Excel
  const handleExcelExport = () => {
    const exportData = [];

    reportData.forEach((item) => {
      const row = {
        "SR. NO.": item.sr_no,
        DEPARTMENT: item.department,
        "TOTAL EXPENSE (₹)": formatCurrency(item.total_expense),
      };

      paymentModes.forEach((mode) => {
        row[`${mode} Expense (₹)`] = formatCurrency(
          item.payment_modes_expense[mode],
        );
      });

      exportData.push(row);
    });

    if (summary) {
      exportData.push({});
      const totalRow = {
        "SR. NO.": "GRAND TOTAL",
        DEPARTMENT: "",
        "TOTAL EXPENSE (₹)": formatCurrency(summary.total_expense),
      };

      paymentModes.forEach((mode) => {
        totalRow[`${mode} Expense (₹)`] = formatCurrency(
          summary.total_payment_modes_expense[mode],
        );
      });

      exportData.push(totalRow);
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
    const fileName = `Expense_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Print Report Content
  // Print Report Content (vertical lines removed)
  const PrintReportContent = () => {
    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        fontSize: "10px",
        position: "relative",
      },
      header: {
        textAlign: "center",
        marginBottom: "20px",
        borderBottom: "2px solid #333",
        paddingBottom: "10px",
      },
      title: {
        fontSize: "14px",
        fontWeight: "bold",
        margin: "5px 0",
      },
      subtitle: {
        fontSize: "10px",
        color: "#666",
        margin: "5px 0",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "9px",
      },
      th: {
        backgroundColor: "#fef3c7",
        fontWeight: "600",
        padding: "4px",
        borderBottom: "1px solid #fde68a",
        borderTop: "1px solid #fde68a",
        textAlign: "center",
      },
      td: {
        padding: "3px 4px",
        borderBottom: "1px solid #ddd",
        textAlign: "right",
      },
      tdLeft: {
        padding: "3px 4px",
        borderBottom: "1px solid #ddd",
        textAlign: "left",
      },
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div style={styles.subtitle}>
            Generated On: {new Date().toLocaleString()}
          </div>
          {appliedFilters.from_date && appliedFilters.to_date && (
            <div style={styles.subtitle}>
              Period: {appliedFilters.from_date} to {appliedFilters.to_date}
            </div>
          )}
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th} rowSpan="2">
                SR. NO.
              </th>
              <th style={styles.th} rowSpan="2">
                DEPARTMENT
              </th>
              <th style={styles.th} rowSpan="2">
                TOTAL EXPENSE (₹)
              </th>
              {paymentModes.map((mode) => (
                <th key={mode} style={styles.th} colSpan="1">
                  {mode}
                </th>
              ))}
            </tr>
            <tr>
              {paymentModes.map((mode) => (
                <th key={mode} style={styles.th}>
                  Expense (₹)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((item) => (
              <tr key={item.sr_no}>
                <td style={styles.tdLeft}>{item.sr_no}</td>
                <td style={styles.tdLeft}>{item.department}</td>
                <td style={styles.td}>{formatCurrency(item.total_expense)}</td>
                {paymentModes.map((mode) => (
                  <td key={mode} style={styles.td}>
                    {formatCurrency(item.payment_modes_expense[mode])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {summary && (
            <tfoot>
              <tr style={{ backgroundColor: "#fef3c7", fontWeight: "bold" }}>
                <td
                  colSpan="2"
                  style={{ ...styles.tdLeft, borderTop: "2px solid #333" }}
                >
                  Grand Total
                </td>
                <td style={{ ...styles.td, borderTop: "2px solid #333" }}>
                  {formatCurrency(summary.total_expense)}
                </td>
                {paymentModes.map((mode) => (
                  <td
                    key={mode}
                    style={{ ...styles.td, borderTop: "2px solid #333" }}
                  >
                    {formatCurrency(summary.total_payment_modes_expense[mode])}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>

        <div
          style={{
            marginTop: "20px",
            fontSize: "9px",
            color: "#666",
            textAlign: "center",
            borderTop: "1px solid #ddd",
            paddingTop: "10px",
          }}
        >
          <p>
            This is a system-generated report. Subject to audit verification.
          </p>
          <p>
            Generated by: {user?.name || "System"} | Date:{" "}
            {new Date().toLocaleString()}
          </p>
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
          No expense records found for the selected filters.
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

  // Render data table with only expense columns
  // Render data table with only expense columns (vertical lines removed)
  const renderDataTable = () => (
    <div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-amber-50 sticky top-0 z-10">
            <tr>
              <th
                rowSpan="2"
                className="px-3 py-3 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider border-b border-amber-200"
              >
                SR. NO.
              </th>
              <th
                rowSpan="2"
                className="px-3 py-3 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider border-b border-amber-200"
              >
                Department / વિભાગ
              </th>
              <th
                rowSpan="2"
                className="px-3 py-3 text-right text-xs font-semibold text-amber-700 uppercase tracking-wider border-b border-amber-200"
              >
                TOTAL EXPENSE (₹)
              </th>
              {paymentModes.map((mode) => (
                <th
                  key={mode}
                  className="px-3 py-3 text-right text-xs font-semibold text-amber-700 uppercase tracking-wider border-b border-amber-200"
                >
                  {mode} (₹)
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-amber-50 transition-colors duration-150"
              >
                <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap border-b border-gray-200">
                  {item.sr_no}
                </td>
                <td className="px-3 py-3 text-sm text-gray-900 border-b border-gray-200">
                  {item.department}
                </td>
                <td className="px-3 py-3 text-sm text-right font-mono font-bold text-red-600 border-b border-gray-200">
                  {formatCurrency(item.total_expense)}
                </td>
                {paymentModes.map((mode) => (
                  <td
                    key={mode}
                    className="px-3 py-3 text-sm text-right font-mono text-red-600 border-b border-gray-200"
                  >
                    {formatCurrency(item.payment_modes_expense[mode])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {summary && (
            <tfoot className="bg-amber-50">
              <tr className="border-t-2 border-amber-200">
                <td
                  colSpan="2"
                  className="px-3 py-3 text-sm font-bold text-amber-800 whitespace-nowrap border-b border-amber-200"
                >
                  કુલ સરવાળો / Grand Total
                </td>
                <td className="px-3 py-3 text-sm text-right font-mono font-bold text-red-700 border-b border-amber-200">
                  {formatCurrency(summary.total_expense)}
                </td>
                {paymentModes.map((mode) => (
                  <td
                    key={mode}
                    className="px-3 py-3 text-sm text-right font-mono font-bold text-red-700 border-b border-amber-200"
                  >
                    {formatCurrency(summary.total_payment_modes_expense[mode])}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );

  const hasData = reportData.length > 0;

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

      <div className="px-4 py-6 max-w-full">
        {/* Header with back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-grey-600 hover:text-grey-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>

          <div className="flex space-x-2">
            <button
              onClick={handleExcelExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors shadow-sm"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" /> Excel
            </button>
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors shadow-sm"
              disabled={!hasData || loading}
              title="Print Report"
            >
              <FiPrinter className="h-4 w-4 mr-2" />
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
              Expense Report - Department-wise Expense Summary by Payment Mode
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

          {/* Success Message */}
          {message.type == "success" && !loading && hasData && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {message.text}
            </div>
          )}

          {/* Error Message */}
          {message.type == "error" && !loading && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {message.text}
            </div>
          )}

          {/* Loading State */}
          {loading && renderLoading()}

          {/* No Data State */}
          {!loading && !hasData && renderNoData()}

          {/* Data Display */}
          {!loading && hasData && renderDataTable()}
        </div>
      </div>
    </div>
  );
};

export default ExpenseReport;
