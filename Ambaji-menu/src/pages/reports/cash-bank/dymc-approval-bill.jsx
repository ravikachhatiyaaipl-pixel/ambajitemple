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
        {label} {required && <span className="text-black-500">*</span>}
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
            error ? "border-black-300" : "border-gray-300"
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
          <FiAlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-500" />
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
                const itemId =
                  item?.PayMd_ID ||
                  item?.Dpt_id ||
                  item?.id ||
                  item?.Act_Id ||
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
                <p>No records found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} records found</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-black-600 flex items-center">
          <FiAlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
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

const DymcApproval = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState([]);
  const [pageTitle, setPageTitle] = useState("Summary Challan/Expense Report");

  // Filter states
  const [dateFrom, setDateFrom] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [dateTo, setDateTo] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedPaymentModeFilter, setSelectedPaymentModeFilter] =
    useState("all");

  // Status dropdown states
  const [statusOptions, setStatusOptions] = useState([]);
  const [filteredStatusOptions, setFilteredStatusOptions] = useState([]);
  const [statusDropdownLoading, setStatusDropdownLoading] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusSearchTerm, setStatusSearchTerm] = useState("");
  const [statusHighlightedIndex, setStatusHighlightedIndex] = useState(-1);
  const statusDropdownRef = useRef(null);
  const statusSearchRef = useRef(null);
  const statusButtonRef = useRef(null);
  const statusItemRefs = useRef([]);
  const statusListRef = useRef(null);

  // Payment Mode dropdown states
  const [paymentModes, setPaymentModes] = useState([]);
  const [filteredPaymentModes, setFilteredPaymentModes] = useState([]);
  const [paymentModeLoading, setPaymentModeLoading] = useState(false);
  const [isPaymentModeDropdownOpen, setIsPaymentModeDropdownOpen] =
    useState(false);
  const [paymentModeSearchTerm, setPaymentModeSearchTerm] = useState("");
  const [paymentModeHighlightedIndex, setPaymentModeHighlightedIndex] =
    useState(-1);
  const paymentModeDropdownRef = useRef(null);
  const paymentModeSearchRef = useRef(null);
  const paymentModeButtonRef = useRef(null);
  const paymentModeItemRefs = useRef([]);
  const paymentModeListRef = useRef(null);

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
    start_date: null,
    end_date: null,
    dept_name: null,
    status: null,
    payment_mode_id: null,
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
      const currentPath = "/reports/cash-bank/dymc-approval-bill";
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

  // Load status options from API
  const loadStatusOptions = async () => {
    setStatusDropdownLoading(true);
    try {
      let action = null;
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      for (let i = 0; i < menuDetails.length; i++) {
        if (
          menuDetails[i].Menu_Links ==
          "/transactions/bookkeeping-vouchers/new-expense-challan-approval"
        ) {
          action = menuDetails[i].action?.stage;
          break;
        }
      }

      const apiUrl = action
        ? `${import.meta.env.VITE_API_URL}/action-master/all?stage=${action}`
        : `${import.meta.env.VITE_API_URL}/action-master/all?stage=action`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.data?.status && response.data?.data) {
        const uniqueStatuses = [];
        const statusMap = new Map();

        response.data.data.forEach((item) => {
          if (item.St_Name && !statusMap.has(item.St_Name)) {
            statusMap.set(item.St_Name, {
              Act_Id: item.Act_Id,
              St_Name: item.St_Name,
              stage: item.stage,
            });
            uniqueStatuses.push({
              Act_Id: item.Act_Id,
              St_Name: item.St_Name,
              stage: item.stage,
            });
          }
        });

        setStatusOptions(uniqueStatuses);
        setFilteredStatusOptions(uniqueStatuses);
      }
    } catch (error) {
      console.error("Failed to load status options:", error);
    } finally {
      setStatusDropdownLoading(false);
    }
  };

  // Load payment modes from API
  const loadPaymentModes = async () => {
    setPaymentModeLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/payment-mode/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      );

      if (response.data?.status && response.data?.data) {
        // Filter where Is_Chl is false
        const nonChlModes = response.data.data.filter(
          (mode) => mode.Is_Chl == false,
        );
        setPaymentModes(nonChlModes);
        setFilteredPaymentModes(nonChlModes);
      }
    } catch (error) {
      console.error("Failed to load payment modes:", error);
    } finally {
      setPaymentModeLoading(false);
    }
  };

  // Set default status filter to DYMC Approval if available
  useEffect(() => {
    if (statusOptions.length > 0) {
      const dymcApprovalStatus = statusOptions.find(
        (status) => status.St_Name == "DYMC Approval",
      );

      if (dymcApprovalStatus) {
        setSelectedStatusFilter(dymcApprovalStatus.Act_Id.toString());
      } else {
        setSelectedStatusFilter("all");
      }
    }
  }, [statusOptions]);

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
    loadStatusOptions();
    loadPaymentModes();
  }, []);

  // Click outside handler for status dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusDropdownOpen(false);
        setStatusHighlightedIndex(-1);
        setStatusSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Click outside handler for payment mode dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        paymentModeDropdownRef.current &&
        !paymentModeDropdownRef.current.contains(event.target)
      ) {
        setIsPaymentModeDropdownOpen(false);
        setPaymentModeHighlightedIndex(-1);
        setPaymentModeSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Click outside handler for department dropdown
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
    if (isStatusDropdownOpen && statusSearchRef.current) {
      setTimeout(() => statusSearchRef.current.focus(), 0);
    }
  }, [isStatusDropdownOpen]);

  useEffect(() => {
    if (isPaymentModeDropdownOpen && paymentModeSearchRef.current) {
      setTimeout(() => paymentModeSearchRef.current.focus(), 0);
    }
  }, [isPaymentModeDropdownOpen]);

  useEffect(() => {
    if (isDeptDropdownOpen && deptSearchRef.current) {
      setTimeout(() => deptSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen]);

  // Filter status options
  useEffect(() => {
    if (!statusOptions.length) return;

    if (!statusSearchTerm.trim()) {
      setFilteredStatusOptions(statusOptions);
    } else {
      const term = statusSearchTerm.toLowerCase();
      const filtered = statusOptions.filter((status) =>
        (status.St_Name?.toLowerCase() || "").includes(term),
      );
      setFilteredStatusOptions(filtered);
    }
    setStatusHighlightedIndex(-1);
  }, [statusSearchTerm, statusOptions]);

  // Filter payment modes
  useEffect(() => {
    if (!paymentModes.length) return;

    if (!paymentModeSearchTerm.trim()) {
      setFilteredPaymentModes(paymentModes);
    } else {
      const term = paymentModeSearchTerm.toLowerCase();
      const filtered = paymentModes.filter((mode) =>
        (mode.PayMd_Name?.toLowerCase() || "").includes(term),
      );
      setFilteredPaymentModes(filtered);
    }
    setPaymentModeHighlightedIndex(-1);
  }, [paymentModeSearchTerm, paymentModes]);

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

  // Fetch report data from new API
  const fetchReportData = async (filters = null) => {
    setLoading(true);
    try {
      const activeFilters = filters || appliedFilters;

      const params = new URLSearchParams();

      if (activeFilters.start_date)
        params.append("start_date", activeFilters.start_date);
      if (activeFilters.end_date)
        params.append("end_date", activeFilters.end_date);
      if (activeFilters.dept_name)
        params.append("dept_name", activeFilters.dept_name);
      if (activeFilters.status && activeFilters.status != "all")
        params.append("status", activeFilters.status);
      if (
        activeFilters.payment_mode_id &&
        activeFilters.payment_mode_id != "all"
      )
        params.append("PayMd_ID", activeFilters.payment_mode_id);

      const url = `${import.meta.env.VITE_API_URL}/chl-voucher/bank-payment-report?${params.toString()}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.data?.success) {
        setReportData(response.data.data || []);
      } else {
        setReportData([]);
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
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedDeptFilter("all");
    setSelectedStatusFilter("all");
    setSelectedPaymentModeFilter("all");
    const emptyFilters = {
      start_date: null,
      end_date: null,
      dept_name: null,
      status: null,
      payment_mode_id: null,
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
      start_date: dateFrom || null,
      end_date: dateTo || null,
      dept_name: deptNameValue,
      status: selectedStatusFilter != "all" ? selectedStatusFilter : null,
      payment_mode_id:
        selectedPaymentModeFilter != "all" ? selectedPaymentModeFilter : null,
    };

    setAppliedFilters(newFilters);
    setHasGenerated(true);

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

  // Status display functions for dropdown
  const renderStatusItem = (status) => {
    return (
      <div className="py-1">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {status.St_Name}
            </div>
            {status.stage && (
              <div className="text-xs text-gray-500 mt-0.5">
                Stage: {status.stage}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSelectedStatusDisplay = () => {
    if (selectedStatusFilter == "all") return "All Statuses";
    if (!selectedStatusFilter) return "";
    const selected = statusOptions.find(
      (status) => status.Act_Id?.toString() == selectedStatusFilter,
    );
    if (!selected) return "Select Status";
    return selected.St_Name;
  };

  // Payment Mode display functions for dropdown
  const renderPaymentModeItem = (mode) => {
    return (
      <div className="py-1">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {mode.PayMd_Name}
            </div>
            {mode.Is_Digital == "1" && (
              <div className="text-xs text-green-600 mt-0.5">
                Digital Payment
              </div>
            )}
            {mode.Is_Cash == "1" && mode.Is_Digital != "1" && (
              <div className="text-xs text-amber-600 mt-0.5">Cash Payment</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSelectedPaymentModeDisplay = () => {
    if (selectedPaymentModeFilter == "all") return "All Payment Modes";
    if (!selectedPaymentModeFilter) return "";
    const selected = paymentModes.find(
      (mode) => mode.PayMd_ID?.toString() == selectedPaymentModeFilter,
    );
    if (!selected) return "Select Payment Mode";
    return selected.PayMd_Name;
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

  const handleStatusFilterSelect = (status) => {
    if (status && status.isAllOption) {
      setSelectedStatusFilter("all");
    } else if (status && status.Act_Id) {
      setSelectedStatusFilter(status.Act_Id.toString());
    }
    setIsStatusDropdownOpen(false);
    setStatusSearchTerm("");
    setStatusHighlightedIndex(-1);

    if (hasGenerated) invalidateReport();
  };

  const handlePaymentModeFilterSelect = (mode) => {
    if (mode && mode.isAllOption) {
      setSelectedPaymentModeFilter("all");
    } else if (mode && mode.PayMd_ID) {
      setSelectedPaymentModeFilter(mode.PayMd_ID.toString());
    }
    setIsPaymentModeDropdownOpen(false);
    setPaymentModeSearchTerm("");
    setPaymentModeHighlightedIndex(-1);

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

  // Status dropdown key handlers
  const handleStatusKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isStatusDropdownOpen) {
        setIsStatusDropdownOpen(true);
        setStatusSearchTerm("");
        setStatusHighlightedIndex(-1);
        setTimeout(() => statusSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isStatusDropdownOpen) {
        setIsStatusDropdownOpen(false);
        setStatusHighlightedIndex(-1);
        setStatusSearchTerm("");
      }
    }
  };

  const handleStatusSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredStatusOptions.length > 0) {
        setStatusHighlightedIndex(0);
        setTimeout(() => {
          if (statusItemRefs.current[0]) {
            statusItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsStatusDropdownOpen(false);
      setStatusHighlightedIndex(-1);
      setStatusSearchTerm("");
      statusButtonRef.current?.focus();
    }
  };

  const handleStatusItemKeyDown = (e, idx, item) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredStatusOptions.length) {
        setStatusHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (statusItemRefs.current[nextIndex]) {
            statusItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setStatusHighlightedIndex(-1);
        setTimeout(() => statusSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setStatusHighlightedIndex(-1);
        setTimeout(() => statusSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setStatusHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (statusItemRefs.current[prevIndex]) {
            statusItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleStatusFilterSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsStatusDropdownOpen(false);
      setStatusHighlightedIndex(-1);
      setStatusSearchTerm("");
      statusButtonRef.current?.focus();
    }
  };

  // Payment Mode dropdown key handlers
  const handlePaymentModeKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isPaymentModeDropdownOpen) {
        setIsPaymentModeDropdownOpen(true);
        setPaymentModeSearchTerm("");
        setPaymentModeHighlightedIndex(-1);
        setTimeout(() => paymentModeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isPaymentModeDropdownOpen) {
        setIsPaymentModeDropdownOpen(false);
        setPaymentModeHighlightedIndex(-1);
        setPaymentModeSearchTerm("");
      }
    }
  };

  const handlePaymentModeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredPaymentModes.length > 0) {
        setPaymentModeHighlightedIndex(0);
        setTimeout(() => {
          if (paymentModeItemRefs.current[0]) {
            paymentModeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPaymentModeDropdownOpen(false);
      setPaymentModeHighlightedIndex(-1);
      setPaymentModeSearchTerm("");
      paymentModeButtonRef.current?.focus();
    }
  };

  const handlePaymentModeItemKeyDown = (e, idx, item) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredPaymentModes.length) {
        setPaymentModeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (paymentModeItemRefs.current[nextIndex]) {
            paymentModeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setPaymentModeHighlightedIndex(-1);
        setTimeout(() => paymentModeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setPaymentModeHighlightedIndex(-1);
        setTimeout(() => paymentModeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setPaymentModeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (paymentModeItemRefs.current[prevIndex]) {
            paymentModeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handlePaymentModeFilterSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPaymentModeDropdownOpen(false);
      setPaymentModeHighlightedIndex(-1);
      setPaymentModeSearchTerm("");
      paymentModeButtonRef.current?.focus();
    }
  };

  // Render transaction table with exact columns as per image
  const renderTransactionTable = () => {
    if (!reportData.length) return null;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  SR NO
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  AMOUNT
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200 whitespace-nowrap">
                  TXN DATE
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  SENDING CUSTOMER AC NO
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  BENEFICIARY BRANCH IFSC
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  BENEFICIARY AC TYPE
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  BENEFICIARY AC NO
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  BENEFICIARY NAME
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  SENDER ADDRESS
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  PAYMENT DETAIL 1
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
                  PAYMENT DETAIL 2
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.map((transaction, idx) => (
                <tr key={transaction.CV_Id || idx} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-xs text-gray-600 border border-gray-200">
                    {transaction.SrNo || idx + 1}
                  </td>
                  <td className="px-2 py-2 text-xs text-right font-mono text-gray-700 border border-gray-200 whitespace-nowrap">
                    {formatCurrency(transaction.Payable_Amount)}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200 whitespace-nowrap">
                    {transaction.tran_date || "-"}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                    {transaction.LG_Name || "-"}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                    {transaction.IFSC || "-"}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                    SAVING
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                    {transaction.acc_no || "-"}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                    {transaction.SL_Name || "-"}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                    Ambaji
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                    {transaction.vouchar_no || "-"}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 border border-gray-200">
                    {transaction.Acc_Chall_no || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-200">
              <tr>
                <td
                  colSpan="1"
                  className="px-2 py-2 text-xs font-semibold text-gray-700 border border-gray-200"
                >
                  Total
                </td>
                <td className="px-2 py-2 text-xs text-right font-mono font-bold text-gray-700 border border-gray-200 whitespace-nowrap">
                  {formatCurrency(
                    reportData.reduce(
                      (sum, t) => sum + (parseFloat(t.Payable_Amount) || 0),
                      0,
                    ),
                  )}
                </td>
                <td
                  colSpan="9"
                  className="px-2 py-2 text-xs border border-gray-200"
                ></td>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
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
              label="Payment Mode"
              value={selectedPaymentModeFilter}
              error={null}
              required={false}
              icon={FiAlertCircle}
              isOpen={isPaymentModeDropdownOpen}
              setIsOpen={setIsPaymentModeDropdownOpen}
              searchTerm={paymentModeSearchTerm}
              setSearchTerm={setPaymentModeSearchTerm}
              items={paymentModes}
              filteredItems={filteredPaymentModes}
              highlightedIndex={paymentModeHighlightedIndex}
              onSelect={handlePaymentModeFilterSelect}
              onKeyDown={handlePaymentModeKeyDown}
              onSearchKeyDown={handlePaymentModeSearchKeyDown}
              onItemKeyDown={handlePaymentModeItemKeyDown}
              getSelectedDisplay={getSelectedPaymentModeDisplay}
              loading={paymentModeLoading}
              placeholder="Select Payment Mode"
              searchPlaceholder="Search payment mode..."
              buttonRef={paymentModeButtonRef}
              dropdownRef={paymentModeDropdownRef}
              searchRef={paymentModeSearchRef}
              itemRefs={paymentModeItemRefs}
              listRef={paymentModeListRef}
              renderItem={renderPaymentModeItem}
              includeAllOption={true}
              allOptionLabel="All Payment Modes"
              allOptionValue="all"
            />
          </div>
          <div>
            <SearchableDropdown
              label="Status"
              value={selectedStatusFilter}
              error={null}
              required={false}
              icon={FiAlertCircle}
              isOpen={isStatusDropdownOpen}
              setIsOpen={setIsStatusDropdownOpen}
              searchTerm={statusSearchTerm}
              setSearchTerm={setStatusSearchTerm}
              items={statusOptions}
              filteredItems={filteredStatusOptions}
              highlightedIndex={statusHighlightedIndex}
              onSelect={handleStatusFilterSelect}
              onKeyDown={handleStatusKeyDown}
              onSearchKeyDown={handleStatusSearchKeyDown}
              onItemKeyDown={handleStatusItemKeyDown}
              getSelectedDisplay={getSelectedStatusDisplay}
              loading={statusDropdownLoading}
              placeholder="Select Status"
              searchPlaceholder="Search by status name..."
              buttonRef={statusButtonRef}
              dropdownRef={statusDropdownRef}
              searchRef={statusSearchRef}
              itemRefs={statusItemRefs}
              listRef={statusListRef}
              renderItem={renderStatusItem}
              includeAllOption={true}
              allOptionLabel="All Statuses"
              allOptionValue="all"
            />
          </div>
          <div className="flex items-end gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={
                loading ||
                dropdownLoading ||
                statusDropdownLoading ||
                paymentModeLoading
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <FiSearch className="h-4 w-4 mr-2" />
              Generate Report
            </button>
            {(hasGenerated ||
              appliedFilters.start_date ||
              appliedFilters.end_date ||
              appliedFilters.dept_name ||
              appliedFilters.status ||
              appliedFilters.payment_mode_id) && (
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

  const hasData = reportData.length > 0;

  // Get status name for display
  const getStatusName = () => {
    if (!appliedFilters.status) return null;
    const status = statusOptions.find(
      (s) => s.Act_Id?.toString() == appliedFilters.status,
    );
    return status?.St_Name;
  };

  // Get payment mode name for display
  const getPaymentModeName = () => {
    if (
      !appliedFilters.payment_mode_id ||
      appliedFilters.payment_mode_id == "all"
    )
      return null;
    const mode = paymentModes.find(
      (m) => m.PayMd_ID?.toString() == appliedFilters.payment_mode_id,
    );
    return mode?.PayMd_Name;
  };

  const handleExcelExport = () => {
    const totalAmount = reportData.reduce(
      (sum, t) => sum + (parseFloat(t.Payable_Amount) || 0),
      0,
    );

    const excelData = [];

    // Add table header only (no company header, no filters, no dates, no signatures)
    excelData.push({
      A: "SR NO",
      B: "AMOUNT",
      C: "TXN DATE",
      D: "SENDING CUSTOMER AC NO",
      E: "BENEFICIARY BRANCH IFSC",
      F: "BENEFICIARY AC TYPE",
      G: "BENEFICIARY AC NO",
      H: "BENEFICIARY NAME",
      I: "SENDER ADDRESS",
      J: "PAYMENT DETAIL 1",
      K: "PAYMENT DETAIL 2",
    });

    // Add data rows
    reportData.forEach((transaction, idx) => {
      // Extract only the last numeric part from PAYMENT DETAIL 1
      let paymentDetail1 = transaction.vouchar_no || "-";
      if (paymentDetail1 != "-") {
        // Try to extract the last number/digit sequence after the last '/'
        const parts = paymentDetail1.split("/");
        const lastPart = parts[parts.length - 1];
        // Check if last part contains digits
        const digitsMatch = lastPart.match(/\d+/);
        if (digitsMatch) {
          paymentDetail1 = digitsMatch[0]; // Only the digits
        } else {
          paymentDetail1 = lastPart; // Keep the last part if no digits found
        }
      }

      // Format BENEFICIARY AC NO as text to preserve leading zeros
      let beneficiaryAcNo = transaction.acc_no || "-";
      if (
        beneficiaryAcNo != "-" &&
        beneficiaryAcNo != null &&
        beneficiaryAcNo != undefined
      ) {
        // Convert to string and ensure leading zeros are preserved
        beneficiaryAcNo = `'${beneficiaryAcNo.toString()}`;
      }

      excelData.push({
        A: transaction.SrNo || idx + 1,
        B: parseFloat(transaction.Payable_Amount) || 0,
        C: transaction.tran_date || "-",
        D: transaction.LG_Name || "-",
        E: transaction.IFSC || "-",
        F: "SAVING",
        G: beneficiaryAcNo, // This will preserve leading zeros
        H: transaction.SL_Name || "-",
        I: "Ambaji",
        J: paymentDetail1, // Only the last digits
        K: transaction.Acc_Chall_no || "-",
      });
    });

    // Add empty row before total
    excelData.push({
      A: "",
      B: "",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
      H: "",
      I: "",
      J: "",
      K: "",
    });

    // Add total row with proper total amount
    excelData.push({
      A: "TOTAL",
      B: totalAmount,
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
      H: "",
      I: "",
      J: "",
      K: "",
    });

    const ws = XLSX.utils.json_to_sheet(excelData, {
      header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
      skipHeader: true,
    });

    ws["!cols"] = [
      { wch: 10 }, // SR NO
      { wch: 15 }, // AMOUNT
      { wch: 12 }, // TXN DATE
      { wch: 30 }, // SENDING CUSTOMER AC NO
      { wch: 25 }, // BENEFICIARY BRANCH IFSC
      { wch: 20 }, // BENEFICIARY AC TYPE
      { wch: 20 }, // BENEFICIARY AC NO
      { wch: 35 }, // BENEFICIARY NAME
      { wch: 20 }, // SENDER ADDRESS
      { wch: 30 }, // PAYMENT DETAIL 1
      { wch: 20 }, // PAYMENT DETAIL 2
    ];

    // Set column G (BENEFICIARY AC NO) as text format to preserve leading zeros
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:K1");
    for (let row = 1; row <= reportData.length; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 6 }); // Column G is index 6
      if (ws[cellAddress] && ws[cellAddress].v != "-") {
        // Force text format by setting 't' type to 's' (string)
        ws[cellAddress].t = "s";
        ws[cellAddress].z = "@"; // Text format
      }
    }

    // Style the header row
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, sz: 11, color: { rgb: "FFFFFF" }, name: "Arial" },
          fill: { fgColor: { rgb: "4472C4" }, patternType: "solid" },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "FFFFFF" } },
            bottom: { style: "thin", color: { rgb: "FFFFFF" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } },
          },
        };
      }
    }

    // Style data rows (alternating colors)
    for (let row = 1; row <= reportData.length; row++) {
      const isEvenRow = (row - 1) % 2 == 0;
      const fillColor = isEvenRow ? "FFFFFF" : "F5F5F5";

      for (let col = 0; col <= 10; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

        if (ws[cellAddress]) {
          let alignment = { vertical: "center" };
          if (col == 0) alignment.horizontal = "center";
          else if (col == 1) alignment.horizontal = "right";
          else if (col == 2) alignment.horizontal = "center";
          else alignment.horizontal = "left";

          ws[cellAddress].s = {
            fill: { fgColor: { rgb: fillColor }, patternType: "solid" },
            alignment: alignment,
            border: {
              top: { style: "thin", color: { rgb: "D0D0D0" } },
              bottom: { style: "thin", color: { rgb: "D0D0D0" } },
              left: { style: "thin", color: { rgb: "D0D0D0" } },
              right: { style: "thin", color: { rgb: "D0D0D0" } },
            },
            font: { sz: 10 },
          };

          // Format amount column (column B) as currency
          if (col == 1 && typeof ws[cellAddress].v == "number") {
            ws[cellAddress].z = "#,##0.00";
          }
        }
      }
    }

    // Style total row (now at index reportData.length + 2 because of empty row)
    const totalRowIndex = reportData.length + 2;
    for (let col = 0; col <= 10; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: totalRowIndex, c: col });

      if (ws[cellAddress]) {
        let alignment = { vertical: "center" };
        if (col == 1) alignment.horizontal = "right";
        else if (col == 0) alignment.horizontal = "center";
        else alignment.horizontal = "left";

        // Make total row A cell bold
        if (col == 0 && ws[cellAddress].v == "TOTAL") {
          ws[cellAddress].s = {
            font: { bold: true, sz: 11 },
            fill: { fgColor: { rgb: "E8F0FE" }, patternType: "solid" },
            alignment: alignment,
            border: {
              top: { style: "thin", color: { rgb: "D0D0D0" } },
              bottom: { style: "thin", color: { rgb: "D0D0D0" } },
              left: { style: "thin", color: { rgb: "D0D0D0" } },
              right: { style: "thin", color: { rgb: "D0D0D0" } },
            },
          };
        } else if (col == 1 && typeof ws[cellAddress].v == "number") {
          ws[cellAddress].s = {
            font: { bold: true, sz: 11 },
            fill: { fgColor: { rgb: "E8F0FE" }, patternType: "solid" },
            alignment: alignment,
            border: {
              top: { style: "thin", color: { rgb: "D0D0D0" } },
              bottom: { style: "thin", color: { rgb: "D0D0D0" } },
              left: { style: "thin", color: { rgb: "D0D0D0" } },
              right: { style: "thin", color: { rgb: "D0D0D0" } },
            },
          };
          ws[cellAddress].z = "#,##0.00";
        } else if (ws[cellAddress]) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 11 },
            fill: { fgColor: { rgb: "E8F0FE" }, patternType: "solid" },
            alignment: alignment,
            border: {
              top: { style: "thin", color: { rgb: "D0D0D0" } },
              bottom: { style: "thin", color: { rgb: "D0D0D0" } },
              left: { style: "thin", color: { rgb: "D0D0D0" } },
              right: { style: "thin", color: { rgb: "D0D0D0" } },
            },
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bank_Payment_Report");

    const fileName = `Bank_Payment_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
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
          <div>
            <style>
              {`
                @media print {
                  .print-hidden {
                    display: none !important;
                  }
                  table {
                    border-collapse: collapse !important;
                    width: 100% !important;
                  }
                  th, td {
                    border: 1px solid #ddd !important;
                    padding: 4px !important;
                    text-align: left !important;
                    font-size: 9px !important;
                  }
                  .no-print-border {
                    border: none !important;
                  }
                }
              `}
            </style>
            <h1 className="text-xl font-bold text-center mb-4">{pageTitle}</h1>
            <p className="text-center text-sm mb-4">
              {appliedFilters.start_date && appliedFilters.end_date && (
                <span>
                  Period: {appliedFilters.start_date} to{" "}
                  {appliedFilters.end_date}
                </span>
              )}
              {/* {getStatusName() && (
                <span className="ml-4">Status: {getStatusName()}</span>
              )} */}
              {getPaymentModeName() && (
                <span className="ml-4">
                  Payment Mode: {getPaymentModeName()}
                </span>
              )}
            </p>
            <div className="print-container">
              <table
                className="min-w-full"
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300">
                      SR NO
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300">
                      AMOUNT
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300 whitespace-nowrap">
                      TXN DATE
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300">
                      SENDING CUSTOMER AC NO
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300">
                      BENEFICIARY BRANCH IFSC
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300">
                      BENEFICIARY AC TYPE
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300">
                      BENEFICIARY AC NO
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300">
                      BENEFICIARY NAME
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300">
                      SENDER ADDRESS
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300">
                      PAYMENT DETAIL 1
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold border border-gray-300">
                      PAYMENT DETAIL 2
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((transaction, idx) => (
                    <tr key={transaction.CV_Id || idx}>
                      <td className="px-1 py-1 text-xs border border-gray-300">
                        {transaction.SrNo || idx + 1}
                      </td>
                      <td className="px-1 py-1 text-xs text-right font-mono border border-gray-300">
                        {formatCurrency(transaction.Payable_Amount)}
                      </td>
                      <td className="px-1 py-1 text-xs border border-gray-300 whitespace-nowrap">
                        {transaction.tran_date || "-"}
                      </td>
                      <td className="px-1 py-1 text-xs border border-gray-300">
                        {transaction.LG_Name || "-"}
                      </td>
                      <td className="px-1 py-1 text-xs border border-gray-300">
                        {transaction.IFSC || "-"}
                      </td>
                      <td className="px-1 py-1 text-xs border border-gray-300">
                        SAVING
                      </td>
                      <td className="px-1 py-1 text-xs border border-gray-300">
                        {transaction.acc_no || "-"}
                      </td>
                      <td className="px-1 py-1 text-xs border border-gray-300">
                        {transaction.SL_Name || "-"}
                      </td>
                      <td className="px-1 py-1 text-xs border border-gray-300">
                        Ambaji
                      </td>
                      <td className="px-1 py-1 text-xs border border-gray-300">
                        {transaction.vouchar_no || "-"}
                      </td>
                      <td className="px-1 py-1 text-xs border border-gray-300">
                        {transaction.Acc_Chall_no || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td
                      colSpan="1"
                      className="px-1 py-1 text-xs font-semibold border border-gray-300"
                    >
                      Total
                    </td>
                    <td className="px-1 py-1 text-xs text-right font-mono font-bold border border-gray-300">
                      {formatCurrency(
                        reportData.reduce(
                          (sum, t) => sum + (parseFloat(t.Payable_Amount) || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td
                      colSpan="9"
                      className="px-1 py-1 text-xs border border-gray-300"
                    ></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div
              className="signature-block"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "48px",
                padding: "0 8px",
              }}
            >
              <div className="signature-item" style={{ textAlign: "center" }}>
                <div
                  className="signature-line"
                  style={{
                    borderTop: "1px solid #1f2937",
                    width: "160px",
                    marginBottom: "4px",
                  }}
                ></div>
                <p
                  className="signature-label"
                  style={{ fontSize: "10px", fontWeight: "600" }}
                >
                  Account HOD
                </p>
              </div>
              <div className="signature-item" style={{ textAlign: "center" }}>
                <div
                  className="signature-line"
                  style={{
                    borderTop: "1px solid #1f2937",
                    width: "160px",
                    marginBottom: "4px",
                  }}
                ></div>
                <p
                  className="signature-label"
                  style={{ fontSize: "10px", fontWeight: "600" }}
                >
                  DYMC
                </p>
              </div>
            </div>
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
              Bank Payment Report - Transaction Details
            </p>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Period Display */}
          {hasGenerated &&
            appliedFilters.start_date &&
            appliedFilters.end_date && (
              <div className="mb-4 p-2 bg-blue-50 rounded-lg text-center text-sm text-blue-700 border border-blue-200">
                Report Period: {appliedFilters.start_date} to{" "}
                {appliedFilters.end_date}
                {appliedFilters.dept_name &&
                  ` | Department: ${appliedFilters.dept_name}`}
                {/* {getStatusName() && ` | Status: ${getStatusName()}`} */}
                {getPaymentModeName() &&
                  ` | Payment Mode: ${getPaymentModeName()}`}
              </div>
            )}

          {/* Loading State */}
          {loading && renderLoading()}

          {/* No Data State */}
          {!loading && !hasData && renderNoData()}

          {/* Data Display - Transaction Table */}
          {!loading && hasData && renderTransactionTable()}

          {/* Signature Line */}
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

export default DymcApproval;
