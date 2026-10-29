import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Plus,
  Edit,
  Eye,
  ArrowRight,
  Calendar,
  Building2,
  Loader,
  AlertCircle,
  Download,
  Users,
  Briefcase,
  Filter,
  ChevronDown,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { LeaveCarryForwardApi } from "../../../../services/leavecarryforwardapi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const LeaveCarryForwardList = ({ user }) => {
  const navigate = useNavigate();
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

  // Filter states
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Dropdown search terms
  const [financialYearSearch, setFinancialYearSearch] = useState("");
  const [leaveTypeSearch, setLeaveTypeSearch] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

  // Dropdown refs
  const financialYearDropdownRef = useRef(null);
  const leaveTypeDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);
  const employeeButtonRef = useRef(null);
  const employeeSearchRef = useRef(null);
  const employeeItemRefs = useRef([]);
  const employeeListRef = useRef(null);

  // Dropdown open states
  const [isFinancialYearOpen, setIsFinancialYearOpen] = useState(false);
  const [isLeaveTypeOpen, setIsLeaveTypeOpen] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  
  // Keyboard navigation states
  const [focusedFinancialYearIndex, setFocusedFinancialYearIndex] = useState(-1);
  const [focusedLeaveTypeIndex, setFocusedLeaveTypeIndex] = useState(-1);
  const [employeeHighlightedIndex, setEmployeeHighlightedIndex] = useState(-1);

  // State Variables
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [pageTitle, setPageTitle] = useState("Leave Carry Forward Entry");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showData, setShowData] = useState(false);

  // Master Data for Dropdowns
  const [financialYears, setFinancialYears] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Loading states
  const [loadingFinancialYears, setLoadingFinancialYears] = useState(false);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Leave Balance States
  const [leaveBalances, setLeaveBalances] = useState({});
  const [loadingBalances, setLoadingBalances] = useState({});

  // Bulk Operations
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  // Form validation states (only for Leave Type and Employee)
  const [validationErrors, setValidationErrors] = useState({
    leaveType: false,
    employee: false
  });

  // Check Admin Status
  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);
  }, [user]);

  // Fetch all dropdown data on component mount
  useEffect(() => {
    const fetchAllDropdownData = async () => {
      await Promise.all([
        fetchFinancialYears(),
        fetchLeaveTypes(),
        fetchEmployees(),
      ]);
    };
    fetchAllDropdownData();
  }, []);

  // Set default financial year (current year) when data loads - KEPT ORIGINAL BEHAVIOR
  useEffect(() => {
    if (financialYears.length > 0 && !selectedFinancialYear) {
      const currentYear = financialYears.find(fy => fy.is_current_year ==  true);
      if (currentYear) {
        setSelectedFinancialYear(currentYear.FY_Id);
      } else if (financialYears.length > 0) {
        setSelectedFinancialYear(financialYears[0].FY_Id);
      }
    }
  }, [financialYears]);

  // Filter employees based on search term
  useEffect(() => {
    if (!employeeSearchTerm.trim()) {
      setFilteredEmployees(employees);
    } else {
      const term = employeeSearchTerm.toLowerCase();
      const filtered = employees.filter(
        (item) =>
          item.First_Name?.toLowerCase().includes(term) ||
          item.Last_Name?.toLowerCase().includes(term) ||
          item.Emp_Code?.toLowerCase().includes(term)
      );
      setFilteredEmployees(filtered);
    }
    setEmployeeHighlightedIndex(-1);
  }, [employeeSearchTerm, employees]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        financialYearDropdownRef.current &&
        !financialYearDropdownRef.current.contains(event.target)
      ) {
        setIsFinancialYearOpen(false);
        setFocusedFinancialYearIndex(-1);
      }
      if (
        leaveTypeDropdownRef.current &&
        !leaveTypeDropdownRef.current.contains(event.target)
      ) {
        setIsLeaveTypeOpen(false);
        setFocusedLeaveTypeIndex(-1);
      }
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setIsEmployeeDropdownOpen(false);
        setEmployeeHighlightedIndex(-1);
        setEmployeeSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Financial Years
  const fetchFinancialYears = async () => {
    setLoadingFinancialYears(true);
    try {
      const response = await LeaveCarryForwardApi.getAllFinancialYears();
      if (response.success && response.data) {
        const sortedYears = [...response.data].sort((a, b) => b.FY_Id - a.FY_Id);
        setFinancialYears(sortedYears);
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
      toast.error("Failed to load financial years");
    } finally {
      setLoadingFinancialYears(false);
    }
  };

  // Fetch Leave Types
  const fetchLeaveTypes = async () => {
    setLoadingLeaveTypes(true);
    try {
      const response = await LeaveCarryForwardApi.getAllLeaveTypes();
      if (response.success && response.data) {
        setLeaveTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
      toast.error("Failed to load leave types");
    } finally {
      setLoadingLeaveTypes(false);
    }
  };

  // Fetch Employees
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetch(`${API_BASE_URL}/emp-mast/all`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      const result = await response.json();
      if (result.status && result.data) {
        setEmployees(result.data);
        setFilteredEmployees(result.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Validate filters before generating report (only Leave Type and Employee are required)
  const validateFilters = () => {
    const errors = {
      leaveType: !selectedLeaveType,
      employee: !selectedEmployee
    };
    
    setValidationErrors(errors);
    
    if (!selectedLeaveType) {
      toast.error("Please select a leave type");
      return false;
    }
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return false;
    }
    
    return true;
  };

  // Load Entries from API with all filters and call leave-balance API
  const loadEntries = async () => {
    setLoading(true);
    try {
      const result = await LeaveCarryForwardApi.getAll(
        currentPage,
        itemsPerPage,
        "",
        selectedFinancialYear,
        selectedFinancialYear,
        selectedEmployee,
        selectedLeaveType
      );

      setEntries(result.entries || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
      
      setSelectedEntries([]);
      setShowBulkActions(false);
      setLeaveBalances({});
      
      if (result.entries && result.entries.length > 0) {
        await fetchAllLeaveBalances(result.entries);
      }
    } catch (error) {
      console.error("Error loading carry forward records:", error);
      toast.error(error.response?.data?.message || "Failed to load carry forward records");
      setEntries([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Generate Report based on selected filters - with validation (only for Leave Type and Employee)
  const handleGenerate = async () => {
    if (!validateFilters()) {
      return;
    }
    setCurrentPage(1);
    setShowData(true);
    await loadEntries();
    toast.success("Report generated successfully");
  };

  // Reset all filters
  const handleReset = () => {
    // Reset financial year to default (current year or first year)
    const currentYear = financialYears.find(fy => fy.is_current_year ==  true);
    if (currentYear) {
      setSelectedFinancialYear(currentYear.FY_Id);
    } else if (financialYears.length > 0) {
      setSelectedFinancialYear(financialYears[0].FY_Id);
    } else {
      setSelectedFinancialYear("");
    }
    setSelectedLeaveType("");
    setSelectedEmployee("");
    setFinancialYearSearch("");
    setLeaveTypeSearch("");
    setEmployeeSearchTerm("");
    setShowData(false);
    setEntries([]);
    setSelectedEntries([]);
    setExpandedRows({});
    setLeaveBalances({});
    setValidationErrors({
      leaveType: false,
      employee: false
    });
    toast.success("All filters cleared");
  };

  // Fetch leave balance for a single employee/leave type/financial year
  const fetchLeaveBalance = async (entry) => {
    const empId = entry.emp_id || entry.employee_id;
    const ltId = entry.lt_id;
    const toFyId = entry.to_fy_id;

    if (!empId || !ltId || !toFyId) {
      return null;
    }

    const cacheKey = `${empId}_${ltId}_${toFyId}`;
    
    if (leaveBalances[cacheKey]) {
      return leaveBalances[cacheKey];
    }
    
    if (loadingBalances[cacheKey]) {
      return null;
    }

    setLoadingBalances(prev => ({ ...prev, [cacheKey]: true }));

    try {
      const response = await LeaveCarryForwardApi.getLeaveBalance(empId, ltId, toFyId);
      
      if (response.success && response.data) {
        const balanceData = {
          availableBalance: response.data.available_balance || 0,
          empId: response.data.emp_id,
          ltId: response.data.lt_id,
          fyId: toFyId,
        };
        
        setLeaveBalances(prev => ({ ...prev, [cacheKey]: balanceData }));
        return balanceData;
      } else {
        const errorData = { availableBalance: null, error: response.message || "No data available" };
        setLeaveBalances(prev => ({ ...prev, [cacheKey]: errorData }));
        return errorData;
      }
    } catch (error) {
      const errorData = { availableBalance: null, error: "Failed to load balance" };
      setLeaveBalances(prev => ({ ...prev, [cacheKey]: errorData }));
      return errorData;
    } finally {
      setLoadingBalances(prev => {
        const newState = { ...prev };
        delete newState[cacheKey];
        return newState;
      });
    }
  };

  // Fetch leave balances for all entries
  const fetchAllLeaveBalances = async (entriesList) => {
    for (let i = 0; i < entriesList.length; i++) {
      await fetchLeaveBalance(entriesList[i]);
      if (i < entriesList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  // Get leave balance for display
  const getLeaveBalance = (entry) => {
    const empId = entry.emp_id || entry.employee_id;
    const ltId = entry.lt_id;
    const toFyId = entry.to_fy_id;
    
    if (!empId || !ltId || !toFyId) {
      return { available: null, error: "Missing data", isLoading: false };
    }
    
    const cacheKey = `${empId}_${ltId}_${toFyId}`;
    const balance = leaveBalances[cacheKey];
    const isLoading = loadingBalances[cacheKey];
    
    return { 
      available: balance?.availableBalance != undefined && balance?.availableBalance != null 
        ? balance.availableBalance 
        : null, 
      error: balance?.error,
      isLoading: isLoading || false,
    };
  };

  // Refresh balance for a specific entry
  const handleRefreshBalance = async (entry, e) => {
    e.stopPropagation();
    
    const empId = entry.emp_id || entry.employee_id;
    const ltId = entry.lt_id;
    const toFyId = entry.to_fy_id;
    const cacheKey = `${empId}_${ltId}_${toFyId}`;
    
    setLeaveBalances(prev => {
      const newState = { ...prev };
      delete newState[cacheKey];
      return newState;
    });
    
    toast.loading("Fetching latest balance...", { id: `refresh-${cacheKey}` });
    
    const result = await fetchLeaveBalance(entry);
    
    if (result && result.availableBalance != null && !result.error) {
      toast.success(`Balance: ${result.availableBalance} days`, { id: `refresh-${cacheKey}` });
    } else if (result && result.error) {
      toast.error(result.error, { id: `refresh-${cacheKey}` });
    } else {
      toast.error("Failed to refresh balance", { id: `refresh-${cacheKey}` });
    }
  };

  // Utility Functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (entry) => {
    const status = entry.status || "Completed";
    let colorClass = "bg-green-100 text-green-800";
    let icon = <CheckCircle className="h-3 w-3 mr-1" />;
    
    if (status == "Pending") {
      colorClass = "bg-yellow-100 text-yellow-800";
      icon = <Clock className="h-3 w-3 mr-1" />;
    } else if (status == "Failed") {
      colorClass = "bg-red-100 text-red-800";
      icon = <XCircle className="h-3 w-3 mr-1" />;
    } else if (status == "Processing") {
      colorClass = "bg-blue-100 text-blue-800";
      icon = <RefreshCw className="h-3 w-3 mr-1 animate-spin" />;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {icon}
        {status}
      </span>
    );
  };

  const getEmployeeName = (entry) => {
    if (entry.employee) {
      return `${entry.employee.First_Name || ""} ${entry.employee.Last_Name || ""}`.trim();
    }
    if (entry.employee_name) return entry.employee_name;
    if (entry.emp_name) return entry.emp_name;
    const emp = employees.find(e => e.Emp_Id == (entry.emp_id || entry.employee_id));
    return emp ? `${emp.First_Name || ""} ${emp.Last_Name || ""}`.trim() : `Employee #${entry.emp_id || entry.employee_id || "Unknown"}`;
  };

  const getEmployeeCode = (entry) => {
    if (entry.employee?.Emp_Code) return entry.employee.Emp_Code;
    if (entry.emp_code) return entry.emp_code;
    const emp = employees.find(e => e.Emp_Id == (entry.emp_id || entry.employee_id));
    return emp?.Emp_Code || null;
  };

  const getLeaveTypeName = (entry) => {
    if (entry.leave_type?.LT_name) return entry.leave_type.LT_name;
    if (entry.leave_type_name) return entry.leave_type_name;
    if (entry.lt_name) return entry.lt_name;
    const lt = leaveTypes.find(l => l.LT_id == entry.lt_id);
    return lt?.LT_name || `Leave Type #${entry.lt_id || "Unknown"}`;
  };

  const getFinancialYearName = (fyId) => {
    if (!fyId) return "N/A";
    const fy = financialYears.find(f => f.FY_Id == fyId);
    return fy ? fy.FY_Name : `FY #${fyId}`;
  };

  // Navigation & Selection
  const handleViewDetails = (entryId) => {
    navigate(`/transactions/attendance-management/leave/leave-carryforward-entry/view/${entryId}`);
  };

  const handleSelectEntry = (entryId, checked) => {
    if (checked) {
      setSelectedEntries(prev => [...prev, entryId]);
      setShowBulkActions(true);
    } else {
      setSelectedEntries(prev => prev.filter(id => id != entryId));
      if (selectedEntries.length == 1) {
        setShowBulkActions(false);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedEntries.length == entries.length) {
      setSelectedEntries([]);
      setShowBulkActions(false);
    } else {
      setSelectedEntries(entries.map(entry => entry.id || entry.cf_id));
      setShowBulkActions(true);
    }
  };

  const toggleRowExpand = (entryId) => {
    setExpandedRows((prev) => ({ ...prev, [entryId]: !prev[entryId] }));
  };

  // Employee Dropdown Handlers - EXACT MATCH from reference code
  const handleEmployeeKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      setIsEmployeeDropdownOpen(true);
      setEmployeeSearchTerm("");
      setEmployeeHighlightedIndex(-1);
      setTimeout(() => employeeSearchRef.current?.focus(), 0);
    }
  };

  const handleEmployeeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredEmployees.length > 0) {
        setEmployeeHighlightedIndex(0);
        setTimeout(() => employeeItemRefs.current[0]?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmployeeDropdownOpen(false);
      setEmployeeHighlightedIndex(-1);
      setEmployeeSearchTerm("");
      employeeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredEmployees.length > 0 && employeeHighlightedIndex >= 0) {
        handleEmployeeSelect(filteredEmployees[employeeHighlightedIndex]);
      } else if (filteredEmployees.length > 0) {
        handleEmployeeSelect(filteredEmployees[0]);
      }
    }
  };

  const handleEmployeeItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredEmployees.length) {
        setEmployeeHighlightedIndex(nextIndex);
        setTimeout(() => employeeItemRefs.current[nextIndex]?.focus(), 0);
      } else {
        setEmployeeHighlightedIndex(-1);
        setTimeout(() => employeeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setEmployeeHighlightedIndex(-1);
        setTimeout(() => employeeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setEmployeeHighlightedIndex(prevIndex);
        setTimeout(() => employeeItemRefs.current[prevIndex]?.focus(), 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleEmployeeSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmployeeDropdownOpen(false);
      setEmployeeHighlightedIndex(-1);
      setEmployeeSearchTerm("");
      employeeButtonRef.current?.focus();
    }
  };

  const handleEmployeeSelect = (item) => {
    setSelectedEmployee(item.Emp_Id.toString());
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearchTerm("");
    setEmployeeHighlightedIndex(-1);
    setValidationErrors(prev => ({ ...prev, employee: false }));
  };

  const getSelectedEmployeeName = () => {
    if (!selectedEmployee) return "";
    const selected = employees.find((item) => item.Emp_Id == parseInt(selectedEmployee));
    return selected ? `${selected.First_Name || ""} ${selected.Last_Name || ""}`.trim() : "";
  };

  // Financial Year Dropdown Handlers
  const handleFinancialYearSelect = (item) => {
    setSelectedFinancialYear(item.FY_Id);
    setIsFinancialYearOpen(false);
    setFinancialYearSearch("");
    setFocusedFinancialYearIndex(-1);
  };

  const getSelectedFinancialYearName = () => {
    if (!selectedFinancialYear) return "";
    const selected = financialYears.find((item) => item.FY_Id == parseInt(selectedFinancialYear));
    return selected ? selected.FY_Name : "";
  };

  const filteredFinancialYears = financialYears.filter((fy) =>
    fy.FY_Name?.toLowerCase().includes(financialYearSearch.toLowerCase())
  );

  // Leave Type Dropdown Handlers
  const handleLeaveTypeSelect = (item) => {
    setSelectedLeaveType(item.LT_id);
    setIsLeaveTypeOpen(false);
    setLeaveTypeSearch("");
    setFocusedLeaveTypeIndex(-1);
    setValidationErrors(prev => ({ ...prev, leaveType: false }));
  };

  const getSelectedLeaveTypeName = () => {
    if (!selectedLeaveType) return "";
    const selected = leaveTypes.find((item) => item.LT_id == parseInt(selectedLeaveType));
    return selected ? selected.LT_name : "";
  };

  const filteredLeaveTypes = leaveTypes.filter((lt) =>
    lt.LT_name?.toLowerCase().includes(leaveTypeSearch.toLowerCase())
  );

  // Export to Excel
  const handleExportToExcel = () => {
    const excelData = [
      [
        "Sr.",
        "Processed Date",
        "Employee Code",
        "Employee Name",
        "Leave Type",
        "From Financial Year",
        "To Financial Year",
        "Carried Forward Days",
        "Lapsed Days",
        "New Balance",
        "Status",
      ],
    ];
    
    entries.forEach((entry, idx) => {
      const balanceInfo = getLeaveBalance(entry);
      excelData.push([
        idx + 1,
        formatDate(entry.processed_date || entry.created_at),
        getEmployeeCode(entry) || "",
        getEmployeeName(entry),
        getLeaveTypeName(entry),
        getFinancialYearName(entry.from_fy_id),
        getFinancialYearName(entry.to_fy_id),
        entry.carry_forward_days || entry.carried_days || 0,
        entry.lapsed_days || 0,
        balanceInfo.available != null ? balanceInfo.available : "N/A",
        entry.status || "Completed",
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Leave_CarryForward_${new Date().toISOString().split("T")[0]}`);
    XLSX.writeFile(wb, `Leave_CarryForward_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Export completed");
  };

  // Export to PDF
  const handleExportToPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");
    doc.setFontSize(16);
    doc.text("Leave Carry Forward Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    
    const tableHeaders = [
      "Sr.",
      "Processed Date",
      "Emp Code",
      "Employee Name",
      "Leave Type",
      "From FY",
      "To FY",
      "Carried",
      "Lapsed",
      "New Balance",
      "Status",
    ];
    
    const tableBody = entries.map((entry, idx) => {
      const balanceInfo = getLeaveBalance(entry);
      return [
        idx + 1,
        formatDate(entry.processed_date || entry.created_at),
        getEmployeeCode(entry) || "",
        getEmployeeName(entry),
        getLeaveTypeName(entry),
        getFinancialYearName(entry.from_fy_id),
        getFinancialYearName(entry.to_fy_id),
        entry.carry_forward_days || entry.carried_days || 0,
        entry.lapsed_days || 0,
        balanceInfo.available != null ? balanceInfo.available : "N/A",
        entry.status || "Completed",
      ];
    });
    
    doc.autoTable({
      head: [tableHeaders],
      body: tableBody,
      startY: 35,
      theme: "striped",
      styles: { fontSize: 7, cellPadding: 1, halign: "center" },
      headStyles: { fillColor: [102, 102, 102], textColor: 255, fontSize: 7 },
    });
    
    doc.save(`Leave_CarryForward_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Export completed");
  };

  // Pagination
  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    loadEntries();
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible - 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - (maxVisible - 2); i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">Manage leave carry forward records</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {entries.length > 0 && (
            <>
              <button
                onClick={handleExportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center text-sm transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </button>
              <button
                onClick={handleExportToPDF}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center text-sm transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </>
          )}
          <Link
            to="/transactions/attendance-management/leave/leave-carryforward-entry/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Carry Forward
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Clear All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Financial Year Dropdown - ORIGINAL BEHAVIOR (no validation, auto-selected) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedFinancialYear}
                onChange={(e) => setSelectedFinancialYear(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Financial Year</option>
                {financialYears.map(fy => (
                  <option key={fy.FY_Id} value={fy.FY_Id}>
                    {fy.FY_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Leave Type Dropdown - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedLeaveType}
                onChange={(e) => {
                  setSelectedLeaveType(e.target.value);
                  setValidationErrors(prev => ({ ...prev, leaveType: false }));
                }}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.leaveType && !selectedLeaveType 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-300"
                }`}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map(lt => (
                  <option key={lt.LT_id} value={lt.LT_id}>
                    {lt.LT_name}
                  </option>
                ))}
              </select>
              {validationErrors.leaveType && !selectedLeaveType && (
                <p className="mt-1 text-xs text-red-500">Leave type is required</p>
              )}
            </div>
          </div>

          {/* Employee Dropdown - REQUIRED */}
          <div className="relative" ref={employeeDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              {loadingEmployees ? (
                <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-gray-500">Loading employees...</span>
                </div>
              ) : (
                <>
                  <button
                    ref={employeeButtonRef}
                    type="button"
                    onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                    onKeyDown={handleEmployeeKeyDown}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white truncate ${
                      selectedEmployee ? "text-gray-900" : "text-gray-500"
                    } ${
                      validationErrors.employee && !selectedEmployee 
                        ? "border-red-500 bg-red-50" 
                        : "border-gray-300"
                    }`}
                  >
                    {selectedEmployee ? getSelectedEmployeeName() : "Select Employee"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {isEmployeeDropdownOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </>
              )}
            </div>
            {validationErrors.employee && !selectedEmployee && (
              <p className="mt-1 text-xs text-red-500">Employee is required</p>
            )}

            {isEmployeeDropdownOpen && !loadingEmployees && (
              <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={employeeSearchRef}
                      type="text"
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      onKeyDown={handleEmployeeSearchKeyDown}
                      placeholder="Search by name or code..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div ref={employeeListRef} className="overflow-y-auto max-h-64">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((item, idx) => (
                      <button
                        key={item.Emp_Id}
                        ref={(el) => { employeeItemRefs.current[idx] = el; }}
                        type="button"
                        onClick={() => handleEmployeeSelect(item)}
                        onKeyDown={(e) => handleEmployeeItemKeyDown(e, item, idx)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                          employeeHighlightedIndex == idx ? "bg-blue-100" : ""
                        }`}
                        tabIndex={0}
                      >
                        <div className="font-medium text-gray-900">
                          {`${item.First_Name || item.Last_Name || ""}`.trim()}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <p>No employees found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {showData && (
        <>
          {/* Stats Summary */}
          {entries.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">📊 Total Records: {totalItems}</span>
                  <span className="mx-2">•</span>
                  <span>Showing: {entries.length} records</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-teal-500 rounded-full mr-1"></span>
                    Balance Loaded
                  </span>
                  <span className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-1"></span>
                    Balance N/A
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Table */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading records...</p>
            </div>
          ) : entries.length == 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No carry forward records found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new carry forward</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="w-10 px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedEntries.length == entries.length && entries.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Processed Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Leave Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Financial Year</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Carried</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Lapsed</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">New Balance</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {entries.map((entry, index) => {
                      const entryId = entry.id || entry.cf_id;
                      const isSelected = selectedEntries.includes(entryId);
                      const balanceInfo = getLeaveBalance(entry);
                      
                      return (
                        <React.Fragment key={entryId}>
                          <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                            <td className="px-2 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleSelectEntry(entryId, e.target.checked)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">
                                {formatDate(entry.processed_date || entry.created_at)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{getEmployeeName(entry)}</div>
                              {getEmployeeCode(entry) && (
                                <div className="text-xs text-gray-500">Code: {getEmployeeCode(entry)}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{getLeaveTypeName(entry)}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900 whitespace-nowrap">
                                {getFinancialYearName(entry.from_fy_id)} 
                                <ChevronRight className="inline h-3 w-3 mx-1 text-gray-400" />
                                {getFinancialYearName(entry.to_fy_id)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm font-semibold text-green-600">
                                  {entry.carry_forward_days || entry.carried_days || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center">
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-sm font-semibold text-red-600">
                                  {entry.lapsed_days || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                {balanceInfo.isLoading ? (
                                  <Loader className="h-4 w-4 animate-spin text-gray-400" />
                                ) : balanceInfo.available != null ? (
                                  <div className="flex items-center bg-teal-50 px-2 py-1 rounded-lg">
                                    <CheckCircle className="h-3 w-3 text-teal-500 mr-1" />
                                    <span className="text-sm font-bold text-teal-700">{balanceInfo.available}</span>
                                  </div>
                                ) : balanceInfo.error ? (
                                  <div className="flex items-center text-red-500 group relative">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Error</span>
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-xs">N/A</div>
                                )}
                                <button
                                  onClick={(e) => handleRefreshBalance(entry, e)}
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                  title="Refresh balance"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">{getStatusBadge(entry)}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleViewDetails(entryId)}
                                  className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                                  title="View Details"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => toggleRowExpand(entryId)}
                                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                  title="More Details"
                                >
                                  <ChevronDown className={`h-3 w-3 transition-transform ${expandedRows[entryId] ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRows[entryId] && (
                            <tr className="bg-gray-50">
                              <td colSpan="10" className="px-4 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Carry Forward Details</div>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>Carried Forward:</span>
                                        <span className="font-semibold text-green-600">{entry.carry_forward_days || entry.carried_days || 0} days</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Lapsed Days:</span>
                                        <span className="font-semibold text-red-600">{entry.lapsed_days || 0} days</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>New Balance:</span>
                                        <span className="font-semibold text-teal-600">{balanceInfo.available != null ? `${balanceInfo.available} days` : 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Employee Details</div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div>ID: {entry.emp_id || entry.employee_id}</div>
                                      <div>Code: {getEmployeeCode(entry) || 'N/A'}</div>
                                      <div>Name: {getEmployeeName(entry)}</div>
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Financial Details</div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div>From: {getFinancialYearName(entry.from_fy_id)}</div>
                                      <div>To: {getFinancialYearName(entry.to_fy_id)}</div>
                                      <div>Processed: {formatDate(entry.processed_date || entry.created_at)}</div>
                                    </div>
                                  </div>
                                </div>
                               </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                  </div>
                  <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage == 1}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page == 'number' && goToPage(page)}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          currentPage == page
                            ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                            : page == '...' 
                              ? "bg-white border border-gray-300 cursor-default"
                              : "bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                        disabled={page == '...'}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage == totalPages}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeaveCarryForwardList;