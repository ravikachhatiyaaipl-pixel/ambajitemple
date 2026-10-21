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
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LeaveEncashmentApi } from "../../../../services/leaveencashmentapi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const LeaveEncashmentList = ({ user }) => {
  const navigate = useNavigate();
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

  // Filter states
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Dropdown search term
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

  // Dropdown refs
  const employeeDropdownRef = useRef(null);
  const employeeButtonRef = useRef(null);
  const employeeSearchRef = useRef(null);
  const employeeItemRefs = useRef([]);
  const employeeListRef = useRef(null);

  // Dropdown open state
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  
  // Keyboard navigation state
  const [employeeHighlightedIndex, setEmployeeHighlightedIndex] = useState(-1);

  // State Variables
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [pageTitle, setPageTitle] = useState("Leave Encashment History");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showData, setShowData] = useState(false);

  // Master Data for Dropdowns
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Loading states
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Summary Data
  const [summaryData, setSummaryData] = useState({
    total_encashed_days: 0,
    total_encashments: 0,
  });

  // Bulk Operations
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  // Get employee name - only First_Name or Last_Name
  const getEmployeeDisplayName = (employee) => {
    return employee.First_Name || employee.Last_Name || "";
  };

  // Check Admin Status
  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);
  }, [user]);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
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

  // Fetch Employees from emp-mast/all
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
        // Filter only active employees
        const activeEmployees = result.data.filter(emp => emp.Is_Active ==  true);
        setEmployees(activeEmployees);
        setFilteredEmployees(activeEmployees);
      } else {
        toast.error("Failed to load employees");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Load Encashment History from API
  const loadEncashmentHistory = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/leave-encashment/history/${selectedEmployee}`,  {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        });
      const result = await response.json();

      if (result.success && result.data) {
        // Set summary data
        setSummaryData({
          total_encashed_days: result.data.total_encashed_days || 0,
          total_encashments: result.data.total_encashments || 0,
        });

        // Set entries from history
        const historyEntries = (result.data.history || []).map((item, index) => ({
          id: item.transaction_id,
          transaction_id: item.transaction_id,
          encash_date: item.encash_date,
          leave_type: item.leave_type,
          encash_days: parseFloat(item.encash_days),
          paid_days: parseFloat(item.paid_days),
          status: item.status,
          created_at: item.created_at,
          employee_name: result.data.employee_name,
          emp_id: result.data.emp_id,
        }));

        setEntries(historyEntries);
        setTotalItems(historyEntries.length);
        setTotalPages(Math.ceil(historyEntries.length / itemsPerPage));
        setShowData(true);
        
        // Reset selections
        setSelectedEntries([]);
        setShowBulkActions(false);
        
        toast.success("History loaded successfully");
      } else {
        toast.error(result.message || "Failed to load history");
        setEntries([]);
        setSummaryData({ total_encashed_days: 0, total_encashments: 0 });
      }
    } catch (error) {
      console.error("Error loading encashment history:", error);
      toast.error(error.response?.data?.message || "Failed to load encashment history");
      setEntries([]);
      setSummaryData({ total_encashed_days: 0, total_encashments: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Generate Report based on selected filters
  const handleGenerate = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }
    setCurrentPage(1);
    await loadEncashmentHistory();
  };

  // Reset all filters
  const handleReset = () => {
    setSelectedEmployee("");
    setEmployeeSearchTerm("");
    setShowData(false);
    setEntries([]);
    setSelectedEntries([]);
    setExpandedRows({});
    setSummaryData({ total_encashed_days: 0, total_encashments: 0 });
    toast.success("All filters cleared");
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

  const getStatusBadge = (status) => {
    const statusLower = (status || "Unknown").toLowerCase();
    let colorClass = "bg-gray-100 text-gray-800";
    let icon = <Clock className="h-3 w-3 mr-1" />;

    if (statusLower.includes("approv") || statusLower.includes("paid")) {
      colorClass = "bg-green-100 text-green-800";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
    } else if (statusLower.includes("reject") || statusLower.includes("deny")) {
      colorClass = "bg-red-100 text-red-800";
      icon = <XCircle className="h-3 w-3 mr-1" />;
    } else if (statusLower.includes("pend") || statusLower.includes("wait")) {
      colorClass = "bg-yellow-100 text-yellow-800";
      icon = <Clock className="h-3 w-3 mr-1" />;
    } else if (statusLower.includes("process")) {
      colorClass = "bg-blue-100 text-blue-800";
      icon = <RefreshCw className="h-3 w-3 mr-1 animate-spin" />;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {icon}
        {status || "Unknown"}
      </span>
    );
  };

  const getSelectedEmployeeName = () => {
    if (!selectedEmployee) return "";
    const selected = employees.find((item) => item.Emp_Id == parseInt(selectedEmployee));
    return selected ? `${selected.First_Name || ""} ${selected.Last_Name || ""}`.trim() : "";
  };

  const getEmployeeNameForSummary = () => {
    const emp = employees.find(e => e.Emp_Id == selectedEmployee);
    if (!emp) return "";
    return `${emp.First_Name || ""} ${emp.Last_Name || ""}`.trim();
  };

  // Navigation & Selection
  const handleViewDetails = (entryId) => {
    navigate(`/transactions/attendance-management/leave/leave-encashment/view/${entryId}`);
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
    if (selectedEntries.length == paginatedEntries.length && paginatedEntries.length > 0) {
      setSelectedEntries([]);
      setShowBulkActions(false);
    } else {
      setSelectedEntries(paginatedEntries.map(entry => entry.id || entry.transaction_id));
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
  };

  // Delete entry handler
  const handleDeleteEntry = async (entry) => {
    const result = await Swal.fire({
      title: "Delete Encashment Record?",
      text: `Are you sure you want to delete this encashment record? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const entryId = entry.transaction_id || entry.id;
      await LeaveEncashmentApi.delete(entryId);
      await loadEncashmentHistory();
      toast.success("Encashment record deleted successfully!");
      setSelectedEntries(selectedEntries.filter((id) => id != entryId));
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.length == 0) {
      toast.error("No entries selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedEntries.length} selected entries?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const deletePromises = selectedEntries.map((id) =>
          LeaveEncashmentApi.delete(id)
        );
        await Promise.all(deletePromises);
        await loadEncashmentHistory();
        setSelectedEntries([]);
        toast.success(`${selectedEntries.length} entry(ies) deleted successfully!`);
      } catch (error) {
        toast.error("Failed to delete some entries");
        await loadEncashmentHistory();
      } finally {
        setLoading(false);
      }
    }
  };

  // Export to Excel
  const handleExportToExcel = () => {
    const excelData = [
      [
        "Sr.",
        "Encashment Date",
        "Leave Type",
        "Encash Days",
        "Paid Days",
        "Status",
        "Created At",
      ],
    ];
    
    paginatedEntries.forEach((entry, idx) => {
      excelData.push([
        idx + 1,
        formatDate(entry.encash_date),
        entry.leave_type || "N/A",
        entry.encash_days || 0,
        entry.paid_days || 0,
        entry.status || "Unknown",
        formatDate(entry.created_at),
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Leave_Encashment_${new Date().toISOString().split("T")[0]}`);
    XLSX.writeFile(wb, `Leave_Encashment_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Export completed");
  };

  // Export to PDF
  const handleExportToPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");
    doc.setFontSize(16);
    doc.text("Leave Encashment Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Employee: ${getEmployeeNameForSummary()}`, 14, 25);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    
    const tableHeaders = [
      "Sr.",
      "Encashment Date",
      "Leave Type",
      "Encash Days",
      "Paid Days",
      "Status",
      "Created At",
    ];
    
    const tableBody = paginatedEntries.map((entry, idx) => [
      idx + 1,
      formatDate(entry.encash_date),
      entry.leave_type || "N/A",
      entry.encash_days || 0,
      entry.paid_days || 0,
      entry.status || "Unknown",
      formatDate(entry.created_at),
    ]);
    
    doc.autoTable({
      head: [tableHeaders],
      body: tableBody,
      startY: 40,
      theme: "striped",
      styles: { fontSize: 7, cellPadding: 1, halign: "center" },
      headStyles: { fillColor: [102, 102, 102], textColor: 255, fontSize: 7 },
    });
    
    doc.save(`Leave_Encashment_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Export completed");
  };

  // Pagination
  const paginatedEntries = entries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
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
            <p className="text-gray-600 mt-1">View employee leave encashment history</p>
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
            to="/transactions/attendance-management/leave/leave-encashment/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Encashment
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

        <div className="grid grid-cols-2 gap-4">
          {/* Employee Dropdown - EXACT MATCH from reference code */}
          <div className="relative" ref={employeeDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
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
                    className={`w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white truncate ${
                      selectedEmployee ? "text-gray-900" : "text-gray-500"
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
          {entries.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employee</p>
                    <p className="text-lg font-semibold text-gray-900">{getEmployeeNameForSummary()}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Encashed Days</p>
                    <p className="text-2xl font-bold text-green-600">{summaryData.total_encashed_days}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedEntries.length > 0 && (
            <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{selectedEntries.length}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-800">
                    {selectedEntries.length} entry(ies) selected
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedEntries([])}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading records...</p>
            </div>
          ) : entries.length == 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No encashment records found</h3>
              <p className="text-gray-600">No leave encashment history available for this employee</p>
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
                          checked={selectedEntries.length == paginatedEntries.length && paginatedEntries.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Encashment Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Leave Type</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Encash Days</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Paid Days</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Created At</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedEntries.map((entry, index) => {
                      const entryId = entry.id || entry.transaction_id;
                      const isSelected = selectedEntries.includes(entryId);
                      
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
                              <div className="flex items-center text-sm">
                                <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-gray-900">
                                  {formatDate(entry.encash_date)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">
                                {entry.leave_type || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm font-semibold text-green-600">
                                  {entry.encash_days || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-blue-500 mr-1" />
                                <span className="text-sm font-semibold text-blue-600">
                                  {entry.paid_days || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getStatusBadge(entry.status)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="text-xs text-gray-500">
                                {formatDate(entry.created_at)}
                              </div>
                            </td>
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
                                  onClick={() => handleDeleteEntry(entry)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3 w-3" />
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
                              <td colSpan="8" className="px-4 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Encashment Details</div>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>Encashment Date:</span>
                                        <span className="font-semibold">{formatDate(entry.encash_date)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Encash Days:</span>
                                        <span className="font-semibold text-green-600">{entry.encash_days || 0} days</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Paid Days:</span>
                                        <span className="font-semibold text-blue-600">{entry.paid_days || 0} days</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Leave Details</div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div>Leave Type: {entry.leave_type || "N/A"}</div>
                                      <div>Status: {entry.status || "Unknown"}</div>
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Transaction Details</div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div>Transaction ID: {entry.transaction_id || entry.id}</div>
                                      <div>Created: {formatDate(entry.created_at)}</div>
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

export default LeaveEncashmentList;