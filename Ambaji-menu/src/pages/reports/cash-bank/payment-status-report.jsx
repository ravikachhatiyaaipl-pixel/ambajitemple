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

// Status mapping - government style gray/black colors
const getStatusColor = (statusName) => {
  return { bg: "bg-gray-50", text: "text-gray-700" };
};

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

const PaymentStatusReport = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState([]);
  const [pageTitle, setPageTitle] = useState("Payment Status Report");

  // Filter states - simplified
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedLedgerFilter, setSelectedLedgerFilter] = useState("all");
  
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

  // Ledger dropdown states
  const [ledgerOptions, setLedgerOptions] = useState([]);
  const [filteredLedgerOptions, setFilteredLedgerOptions] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const [ledgerHighlightedIndex, setLedgerHighlightedIndex] = useState(-1);
  const ledgerDropdownRef = useRef(null);
  const ledgerSearchRef = useRef(null);
  const ledgerButtonRef = useRef(null);
  const ledgerItemRefs = useRef([]);
  const ledgerListRef = useRef(null);

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    from_date: null,
    to_date: null,
    dpt_id: null,
    status: null,
    lg_id: null,
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
        localStorage.getItem("menu_details") || "[]"
      );
      const currentPath = "/reports/cash-bank/payment-status-report";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath
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
        localStorage.getItem("menu_details") || "[]"
      );
      const currentPath = "/transactions/bookkeeping-vouchers/new-expense-challan-update";
      for (let i = 0; i < menuDetails.length; i++) {
        if (menuDetails[i].Menu_Links == currentPath) {
          action = menuDetails[i].action?.stage;
          break;
        }
      }

      const apiUrl = action
        ? `${import.meta.env.VITE_API_URL}/action-master/all?stage=${action}`
        : `${import.meta.env.VITE_API_URL}/action-master/all?stage=4LYR`;

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
      } else {
        const fallbackStatuses = [
          { Act_Id: 1, St_Name: "Initial Entry" },
          { Act_Id: 2, St_Name: "Account HOD Approval" },
          { Act_Id: 3, St_Name: "Pending" },
          { Act_Id: 4, St_Name: "Approved" },
          { Act_Id: 5, St_Name: "Rejected" },
          { Act_Id: 6, St_Name: "Completed" },
        ];
        setStatusOptions(fallbackStatuses);
        setFilteredStatusOptions(fallbackStatuses);
      }
    } catch (error) {
      console.error("Failed to load status options:", error);
      const fallbackStatuses = [
        { Act_Id: 1, St_Name: "Initial Entry" },
        { Act_Id: 2, St_Name: "Account HOD Approval" },
        { Act_Id: 3, St_Name: "Pending" },
        { Act_Id: 4, St_Name: "Approved" },
        { Act_Id: 5, St_Name: "Rejected" },
        { Act_Id: 6, St_Name: "Completed" },
      ];
      setStatusOptions(fallbackStatuses);
      setFilteredStatusOptions(fallbackStatuses);
    } finally {
      setStatusDropdownLoading(false);
    }
  };

  // Load ledger options from API
  const loadLedgers = async () => {
    setLedgerLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/ledgers/all/data`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.data?.success) {
        const options = response.data.data || [];
        const filteredOptions = options.filter(
          (ledger) => ledger.Lg_Buk != "Y"
        );
        setLedgerOptions(filteredOptions);
        setFilteredLedgerOptions(filteredOptions);
      } else {
        setLedgerOptions([]);
        setFilteredLedgerOptions([]);
      }
    } catch (err) {
      console.error("Failed to load ledgers:", err);
      setLedgerOptions([]);
      setFilteredLedgerOptions([]);
    } finally {
      setLedgerLoading(false);
    }
  };

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
        (d) => d.GrCod == parentGrp && d.Dpt_id != dept.Dpt_id
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
        displayName: `${"    ".repeat(level - 1)}${node.Dpt_Desc || node.Dpt_Name}`,
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
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data.success) {
        const activeDepartments = (response.data.data || []).filter(
          (dept) => dept.isvisible == 1 || dept.isvisible == "1"
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
    loadLedgers();
  }, []);

  // Click outside handlers
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ledgerDropdownRef.current &&
        !ledgerDropdownRef.current.contains(event.target)
      ) {
        setIsLedgerDropdownOpen(false);
        setLedgerHighlightedIndex(-1);
        setLedgerSearchTerm("");
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
    if (isStatusDropdownOpen && statusSearchRef.current) {
      setTimeout(() => statusSearchRef.current.focus(), 0);
    }
    if (isLedgerDropdownOpen && ledgerSearchRef.current) {
      setTimeout(() => ledgerSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen, isStatusDropdownOpen, isLedgerDropdownOpen]);

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
          (dept.GrCod?.toLowerCase() || "").includes(term)
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, flattenedDepartments]);

  // Filter status options
  useEffect(() => {
    if (!statusOptions.length) return;
    if (!statusSearchTerm.trim()) {
      setFilteredStatusOptions(statusOptions);
    } else {
      const term = statusSearchTerm.toLowerCase();
      const filtered = statusOptions.filter((status) =>
        (status.St_Name?.toLowerCase() || "").includes(term)
      );
      setFilteredStatusOptions(filtered);
    }
    setStatusHighlightedIndex(-1);
  }, [statusSearchTerm, statusOptions]);

  // Filter ledger options
  useEffect(() => {
    if (!ledgerOptions.length) return;
    if (!ledgerSearchTerm.trim()) {
      setFilteredLedgerOptions(ledgerOptions);
    } else {
      const term = ledgerSearchTerm.toLowerCase();
      const filtered = ledgerOptions.filter((ledger) => {
        const lgName = ledger.Lg_Name || "";
        const lgEngName = ledger.Lg_Eng_Name || "";
        const lgCode = ledger.Lg_Code || "";
        const lgId = ledger.Lg_Id ? ledger.Lg_Id.toString() : "";
        return (
          lgName.toLowerCase().includes(term) ||
          lgEngName.toLowerCase().includes(term) ||
          lgCode.toLowerCase().includes(term) ||
          lgId.includes(term)
        );
      });
      setFilteredLedgerOptions(filtered);
    }
    setLedgerHighlightedIndex(-1);
  }, [ledgerSearchTerm, ledgerOptions]);

  // Fetch report data from API - UPDATED to handle new response format
  const fetchReportData = async (filters = null) => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      const activeFilters = filters || appliedFilters;

      const params = new URLSearchParams();

      if (activeFilters.from_date)
        params.append("from_date", activeFilters.from_date);
      if (activeFilters.to_date)
        params.append("to_date", activeFilters.to_date);
      if (activeFilters.dpt_id && activeFilters.dpt_id != "all")
        params.append("Dpt_Id", activeFilters.dpt_id);
      if (activeFilters.status && activeFilters.status != "all")
        params.append("Status", activeFilters.status);
      if (activeFilters.lg_id && activeFilters.lg_id != "all")
        params.append("Lg_Id", activeFilters.lg_id);
      
      params.append("Is_income", "N");

      const url = `${import.meta.env.VITE_API_URL}/ch-status-summary/report?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
      });

      if (response.data?.status && response.data?.data) {
        // Directly set the data - it's already a flat list
        const data = response.data.data;
        setReportData(data);
        
        if (data.length == 0) {
          setMessage({
            text: "No records found for the selected filters",
            type: "info",
          });
        }
      } else {
        setReportData([]);
        setMessage({
          text: response.data?.message || "No data found",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setMessage({
        text: err.response?.data?.message || err.message || "Error loading report data",
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
    setSelectedLedgerFilter("all");
    setDeptSearchTerm("");
    setStatusSearchTerm("");
    setLedgerSearchTerm("");
    const emptyFilters = {
      from_date: null,
      to_date: null,
      dpt_id: null,
      status: null,
      lg_id: null,
    };
    setAppliedFilters(emptyFilters);
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    let dptIdValue = null;
    let statusValue = null;
    let ledgerValue = null;

    if (selectedDeptFilter && selectedDeptFilter != "all") {
      dptIdValue = selectedDeptFilter;
    }
    
    if (selectedStatusFilter && selectedStatusFilter != "all") {
      statusValue = selectedStatusFilter;
    }

    if (selectedLedgerFilter && selectedLedgerFilter != "all") {
      ledgerValue = selectedLedgerFilter;
    }

    const newFilters = {
      from_date: dateFrom || null,
      to_date: dateTo || null,
      dpt_id: dptIdValue,
      status: statusValue,
      lg_id: ledgerValue,
    };

    setAppliedFilters(newFilters);
    setHasGenerated(true);

    await fetchReportData(newFilters);
  };

  // Calculate total amount from report data
  const calculateTotal = () => {
    return reportData.reduce((sum, item) => {
      const amount = parseFloat(item.Amount) || 0;
      return sum + amount;
    }, 0);
  };

  // Render the report table - SIMPLIFIED as a flat list
  const renderReportTable = () => {
    if (!reportData || reportData.length == 0) {
      return null;
    }

    const totalAmount = calculateTotal();

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Challan No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ledger Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Party Name</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => {
                const statusColors = getStatusColor(item.Status);
                
                return (
                  <tr key={item.CV_Id || index} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link 
                        to={`/transactions/bookkeeping-vouchers/new-expense-challan-update/view/${item.CV_Id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {item.CV_No || "-"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.Chl_Date || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {item.Ledger_Name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.Party_Name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-gray-800">
                      {formatCurrency(item.Amount)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                        {item.Status || "-"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {/* Grand Total Row */}
              <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                <td colSpan="5" className="px-4 py-3 text-base font-semibold text-gray-800 text-right">
                  Grand Total
                </td>
                <td className="px-4 py-3 text-base text-right font-mono font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Department dropdown renderItem function
  const renderDepartmentItem = (dept) => {
    const level = dept.treeLevel || 1;
    const desc = dept.Dpt_Desc || dept.Dpt_Name;
    const name = dept.Dpt_Name;

    const fontSizeClass = {
      1: "text-sm",
      2: "text-sm",
      3: "text-xs",
      4: "text-xs",
    }[level] || "text-xs";

    return (
      <div className="py-1">
        <div className="flex items-start">
          <div className="h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 bg-gray-100 text-gray-600">
            <span className="text-xs font-medium">L{level}</span>
          </div>
          <div className="flex-1">
            <div
              className={`${fontSizeClass} font-medium text-gray-800 whitespace-pre-wrap`}
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

  // Status renderItem function
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

  // Ledger renderItem function
  const renderLedgerItem = (ledger) => {
    const displayName = ledger.Lg_Eng_Name || ledger.Lg_Name || "Unnamed";
    return (
      <div className="py-1">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {displayName}
          </span>
          <div className="flex gap-2 text-xs text-gray-500">
            {ledger.Lg_Name && ledger.Lg_Name != ledger.Lg_Eng_Name && (
              <span>{ledger.Lg_Name}</span>
            )}
            {ledger.Lg_Code && <span>Code: {ledger.Lg_Code}</span>}
            {ledger.Lg_Id && <span>ID: {ledger.Lg_Id}</span>}
          </div>
        </div>
      </div>
    );
  };

  const getSelectedDepartmentDisplay = () => {
    if (selectedDeptFilter == "all") return "All Departments";
    if (!selectedDeptFilter) return "";
    const selected = flattenedDepartments.find(
      (dept) => dept.Dpt_id?.toString() == selectedDeptFilter
    );
    if (!selected) return "Select Department";
    const level = selected.treeLevel || 1;
    const indent = "    ".repeat(level - 1);
    const desc = selected.Dpt_Desc || selected.Dpt_Name;
    const name = selected.Dpt_Name;
    if (name && name != desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  const getSelectedStatusDisplay = () => {
    if (selectedStatusFilter == "all") return "All Status";
    if (!selectedStatusFilter) return "";
    const selected = statusOptions.find(
      (status) => status.Act_Id?.toString() == selectedStatusFilter
    );
    if (!selected) return "Select Status";
    return selected.St_Name;
  };

  const getSelectedLedgerDisplay = () => {
    if (selectedLedgerFilter == "all") return "All Ledgers";
    if (!selectedLedgerFilter) return "";
    const selected = ledgerOptions.find(
      (ledger) => ledger.Lg_Id?.toString() == selectedLedgerFilter
    );
    if (!selected) return "Select Ledger";
    return selected.Lg_Eng_Name || selected.Lg_Name || "Unnamed";
  };

  // SearchableDropdown component (kept for filter dropdowns)
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
                    item?.Lg_Id ||
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

  // Handle department filter select
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

  const handleLedgerFilterSelect = (ledger) => {
    if (ledger && ledger.isAllOption) {
      setSelectedLedgerFilter("all");
    } else if (ledger && ledger.Lg_Id) {
      setSelectedLedgerFilter(ledger.Lg_Id.toString());
    }
    setIsLedgerDropdownOpen(false);
    setLedgerSearchTerm("");
    setLedgerHighlightedIndex(-1);
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

  // Ledger dropdown key handlers
  const handleLedgerKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isLedgerDropdownOpen) {
        setIsLedgerDropdownOpen(true);
        setLedgerSearchTerm("");
        setLedgerHighlightedIndex(-1);
        setTimeout(() => ledgerSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isLedgerDropdownOpen) {
        setIsLedgerDropdownOpen(false);
        setLedgerHighlightedIndex(-1);
        setLedgerSearchTerm("");
      }
    }
  };

  const handleLedgerSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredLedgerOptions.length > 0) {
        setLedgerHighlightedIndex(0);
        setTimeout(() => {
          if (ledgerItemRefs.current[0]) {
            ledgerItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    }
  };

  const handleLedgerItemKeyDown = (e, idx, item) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredLedgerOptions.length) {
        setLedgerHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (ledgerItemRefs.current[nextIndex]) {
            ledgerItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setLedgerHighlightedIndex(-1);
        setTimeout(() => ledgerSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setLedgerHighlightedIndex(-1);
        setTimeout(() => ledgerSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setLedgerHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (ledgerItemRefs.current[prevIndex]) {
            ledgerItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleLedgerFilterSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLedgerDropdownOpen(false);
      setLedgerHighlightedIndex(-1);
      setLedgerSearchTerm("");
      ledgerButtonRef.current?.focus();
    }
  };

  // Render filters
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiCalendar className="inline mr-1 h-3 w-3" /> Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>
          <div>
            <SearchableDropdown
              label="Department"
              value={selectedDeptFilter}
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
              getDisplay={(item) => item.Dpt_Desc || item.Dpt_Name}
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
          <div>
            <SearchableDropdown
              label="Ledger"
              value={selectedLedgerFilter}
              icon={FiFileText}
              isOpen={isLedgerDropdownOpen}
              setIsOpen={setIsLedgerDropdownOpen}
              searchTerm={ledgerSearchTerm}
              setSearchTerm={setLedgerSearchTerm}
              items={ledgerOptions}
              filteredItems={filteredLedgerOptions}
              highlightedIndex={ledgerHighlightedIndex}
              onSelect={handleLedgerFilterSelect}
              onKeyDown={handleLedgerKeyDown}
              onSearchKeyDown={handleLedgerSearchKeyDown}
              onItemKeyDown={handleLedgerItemKeyDown}
              getDisplay={(item) => item.Lg_Eng_Name || item.Lg_Name || "Unnamed"}
              getSelectedDisplay={getSelectedLedgerDisplay}
              loading={ledgerLoading}
              placeholder="Select Ledger"
              searchPlaceholder="Search by ledger name, code..."
              buttonRef={ledgerButtonRef}
              dropdownRef={ledgerDropdownRef}
              searchRef={ledgerSearchRef}
              itemRefs={ledgerItemRefs}
              listRef={ledgerListRef}
              renderItem={renderLedgerItem}
              includeAllOption={true}
              allOptionLabel="All Ledgers"
              allOptionValue="all"
            />
          </div>
          <div>
            <SearchableDropdown
              label="Status"
              value={selectedStatusFilter}
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
              getDisplay={(item) => item.St_Name}
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
              allOptionLabel="All Status"
              allOptionValue="all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={loading || dropdownLoading || statusDropdownLoading || ledgerLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-600 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <FiSearch className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          {(hasGenerated ||
            appliedFilters.from_date ||
            appliedFilters.to_date ||
            appliedFilters.dpt_id ||
            appliedFilters.status ||
            appliedFilters.lg_id) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
            >
              <FiX className="h-4 w-4 mr-2" />
              Clear
            </button>
          )}
        </div>
        
        {/* Message Display */}
        {message.text && (
          <div className={`mt-3 p-3 rounded-lg ${
            message.type == 'error' ? 'bg-gray-100 text-gray-800 border border-gray-300' : 
            message.type == 'info' ? 'bg-gray-50 text-gray-700 border border-gray-200' :
            'bg-gray-50 text-gray-700 border border-gray-200'
          }`}>
            <div className="flex items-center">
              <FiAlertCircle className="h-4 w-4 mr-2" />
              {message.text}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Export to Excel - UPDATED for new response format
  const handleExcelExport = () => {
    const excelData = [];
    
    // Add header
    excelData.push({
      "SR No": "",
      "Challan No": "",
      "Date": "",
      "Ledger Name": "",
      "Party Name": "",
      "Amount": "",
      "Status": ""
    });
    
    // Add data rows
    reportData.forEach((item, index) => {
      excelData.push({
        "SR No": index + 1,
        "Challan No": item.CV_No || "-",
        "Date": item.Chl_Date || "-",
        "Ledger Name": item.Ledger_Name || "-",
        "Party Name": item.Party_Name || "-",
        "Amount": item.Amount || 0,
        "Status": item.Status || "-"
      });
    });
    
    // Add blank row
    excelData.push({
      "SR No": "",
      "Challan No": "",
      "Date": "",
      "Ledger Name": "",
      "Party Name": "",
      "Amount": "",
      "Status": ""
    });
    
    // Add grand total
    const totalAmount = calculateTotal();
    excelData.push({
      "SR No": "",
      "Challan No": "",
      "Date": "",
      "Ledger Name": "GRAND TOTAL",
      "Party Name": "",
      "Amount": totalAmount,
      "Status": ""
    });
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payment Status Report");
    
    const fileName = `Payment_Status_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading report data...</p>
    </div>
  );

  // Render no data state
  const renderNoData = () =>
    !hasGenerated ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">
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
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          No Records Found
        </h3>
        <p className="text-gray-600">
          No records found for the selected filters.
        </p>
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 inline-flex items-center"
        >
          <FiX className="h-4 w-4 mr-2" />
          Clear Filters
        </button>
      </div>
    );

  const hasData = reportData && reportData.length > 0;

  // Print content component - UPDATED for new response format
  const PrintContent = () => {
    const totalAmount = calculateTotal();
    
    return (
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
                border: 1px solid #000 !important;
                padding: 6px !important;
                text-align: left !important;
              }
              .no-print-border {
                border: none !important;
              }
              .text-right {
                text-align: right !important;
              }
              .text-center {
                text-align: center !important;
              }
            }
          `}
        </style>
        <h1 className="text-xl font-bold text-center mb-4 text-gray-800">{pageTitle}</h1>
        {appliedFilters.from_date && appliedFilters.to_date && (
          <p className="text-center text-sm mb-4 text-gray-600">
            Period: {appliedFilters.from_date} to {appliedFilters.to_date}
          </p>
        )}
        {appliedFilters.dpt_id && appliedFilters.dpt_id != "all" && (
          <p className="text-center text-sm mb-4 text-gray-600">
            Department: {flattenedDepartments.find(d => d.Dpt_id?.toString() == appliedFilters.dpt_id)?.Dpt_Desc || appliedFilters.dpt_id}
          </p>
        )}
        {appliedFilters.status && appliedFilters.status != "all" && (
          <p className="text-center text-sm mb-4 text-gray-600">
            Status: {statusOptions.find(s => s.Act_Id?.toString() == appliedFilters.status)?.St_Name || appliedFilters.status}
          </p>
        )}
        {appliedFilters.lg_id && appliedFilters.lg_id != "all" && (
          <p className="text-center text-sm mb-4 text-gray-600">
            Ledger: {ledgerOptions.find(l => l.Lg_Id?.toString() == appliedFilters.lg_id)?.Lg_Eng_Name || appliedFilters.lg_id}
          </p>
        )}
        <div className="print-container">
          <table className="min-w-full" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th className="px-2 py-2 text-left text-sm font-semibold border border-gray-800 text-gray-800">#</th>
                <th className="px-2 py-2 text-left text-sm font-semibold border border-gray-800 text-gray-800">Challan No.</th>
                <th className="px-2 py-2 text-left text-sm font-semibold border border-gray-800 text-gray-800">Date</th>
                <th className="px-2 py-2 text-left text-sm font-semibold border border-gray-800 text-gray-800">Ledger Name</th>
                <th className="px-2 py-2 text-left text-sm font-semibold border border-gray-800 text-gray-800">Party Name</th>
                <th className="px-2 py-2 text-right text-sm font-semibold border border-gray-800 text-gray-800">Amount</th>
                <th className="px-2 py-2 text-left text-sm font-semibold border border-gray-800 text-gray-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => {
                const statusColors = getStatusColor(item.Status);
                return (
                  <tr key={item.CV_Id || index}>
                    <td className="px-2 py-1 text-sm border border-gray-800 text-gray-500">{index + 1}</td>
                    <td className="px-2 py-1 text-sm border border-gray-800 text-gray-700">{item.CV_No || "-"}</td>
                    <td className="px-2 py-1 text-sm border border-gray-800 text-gray-700">{item.Chl_Date || "-"}</td>
                    <td className="px-2 py-1 text-sm border border-gray-800 text-gray-800">{item.Ledger_Name || "-"}</td>
                    <td className="px-2 py-1 text-sm border border-gray-800 text-gray-700">{item.Party_Name || "-"}</td>
                    <td className="px-2 py-1 text-sm text-right border border-gray-800 text-gray-800">
                      {formatCurrency(item.Amount)}
                    </td>
                    <td className="px-2 py-1 text-sm border border-gray-800 text-gray-700">
                      <span className={`px-1 py-0.5 ${statusColors.bg} ${statusColors.text}`}>
                        {item.Status || "-"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-200 font-semibold">
              <tr>
                <td colSpan="5" className="px-2 py-1 text-sm font-semibold border border-gray-800 text-gray-800 text-right">Grand Total</td>
                <td className="px-2 py-1 text-sm text-right border border-gray-800 text-gray-900">
                  {formatCurrency(totalAmount)}
                </td>
                <td className="border border-gray-800"></td>
              </tr>
            </tfoot>
          </table>
        </div>
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
          <PrintContent />
        </PrintLayout>
      )}

      <div className="px-4 py-6 max-w-full">
        {/* Header with back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors font-medium">
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
              Payment Status Report - Click on Challan No. to view details
            </p>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Period Display */}
          {hasGenerated &&
            appliedFilters.from_date &&
            appliedFilters.to_date && (
              <div className="mb-4 p-2 bg-gray-50 rounded-lg text-center text-sm text-gray-700 border border-gray-200">
                Report Period: {appliedFilters.from_date} to {appliedFilters.to_date}
                {appliedFilters.dpt_id && appliedFilters.dpt_id != "all" && (
                  ` | Department: ${flattenedDepartments.find(d => d.Dpt_id?.toString() == appliedFilters.dpt_id)?.Dpt_Desc || ""}`
                )}
                {appliedFilters.lg_id && appliedFilters.lg_id != "all" && (
                  ` | Ledger: ${ledgerOptions.find(l => l.Lg_Id?.toString() == appliedFilters.lg_id)?.Lg_Eng_Name || ""}`
                )}
                {appliedFilters.status && appliedFilters.status != "all" && (
                  ` | Status: ${statusOptions.find(s => s.Act_Id?.toString() == appliedFilters.status)?.St_Name || appliedFilters.status}`
                )}
              </div>
            )}

          {/* Loading State */}
          {loading && renderLoading()}

          {/* No Data State */}
          {!loading && !hasData && renderNoData()}

          {/* Data Display - Flat List */}
          {!loading && hasData && renderReportTable()}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusReport;