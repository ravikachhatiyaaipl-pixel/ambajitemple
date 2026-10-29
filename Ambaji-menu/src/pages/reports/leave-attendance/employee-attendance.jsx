import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiX,
  FiSearch,
  FiCalendar,
  FiUser,
  FiFolder,
  FiChevronDown,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";
import axios from "axios";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

// ============= SEARCHABLE DROPDOWN COMPONENT ==============
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
  allOptionLabel = "All",
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
                  <FiFolder className="h-4 w-4 mr-2" />
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
                const itemId = item.id || item.Emp_Id || item.Dpt_id || `item-${idx}`;

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
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <FiAlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Status badge component based on Status ID (for Excel and print, but hidden in UI)
const getStatusName = (status, statusData) => {
  if (statusData && statusData.St_Name) {
    return statusData.St_Name;
  }
  switch (status) {
    case 58:
      return "Account Approve";
    case 57:
      return "HOD Approved";
    case 56:
      return "Initial Entry";
    default:
      return statusData?.St_Name || `Status ${status}`;
  }
};

const EmployeeAttendance = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [attendanceData, setAttendanceData] = useState(null);
  const [pageTitle, setPageTitle] = useState("Employee Leave Report");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
  });

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get first day of current month
  const getFirstDayOfMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split("T")[0];
  };

  // Filter states - default to current month
  const [dateFrom, setDateFrom] = useState(getFirstDayOfMonth());
  const [dateTo, setDateTo] = useState(getTodayDate());
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("all");

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

  // Employee dropdown states
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
  const [empSearchTerm, setEmpSearchTerm] = useState("");
  const [empHighlightedIndex, setEmpHighlightedIndex] = useState(-1);
  const empDropdownRef = useRef(null);
  const empSearchRef = useRef(null);
  const empButtonRef = useRef(null);
  const empItemRefs = useRef([]);
  const empListRef = useRef(null);

  // Applied filters (status filter removed)
  const [appliedFilters, setAppliedFilters] = useState({
    from_date: null,
    to_date: null,
    dept_id: null,
    emp_id: null,
  });
  const [hasGenerated, setHasGenerated] = useState(false);

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");
  const [printReady, setPrintReady] = useState(false);

  const { organization } = useOrganization();

  // Get dynamic page title
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/attendance/employee-attendance";
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
      const id = dept.Dpt_id ?? dept.Dpt_Id;
      map[id] = {
        ...dept,
        Dpt_id: id,
        children: [],
        level: parseInt(dept.GrStt) || 1,
      };
    });

    depts.forEach((dept) => {
      const id = dept.Dpt_id ?? dept.Dpt_Id;
      const currentDept = map[id];
      const parentGrp = dept.UpGrp;

      const parent = Object.values(map).find(
        (d) => d.GrCod == parentGrp && (d.Dpt_id ?? d.Dpt_Id) != id,
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

  // Load employees based on selected department
  
const loadEmployees = async (deptId = null) => {
  setEmployeeLoading(true);
  try {
    let url = `${import.meta.env.VITE_API_URL}/emp-mast/all`;
    if (deptId && deptId !=  "all") {
      url += `?Dpt_Id=${deptId}`;
    }
    const response = await axios.get(url, { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });

    if (response.data.status) {  // Note: response uses "status" instead of "success"
      const activeEmployees = (response.data.data || []).filter(
        (emp) => emp.Is_Active == true || emp.Is_Active == 1,
      );
      setEmployees(activeEmployees);
      setFilteredEmployees(activeEmployees);
    }
  } catch (error) {
    console.error("Failed to load employees:", error);
  } finally {
    setEmployeeLoading(false);
  }
};

  useEffect(() => {
    loadDepartments();
    loadEmployees();
  }, []);

  // Reload employees when department changes
  useEffect(() => {
    if (selectedDeptFilter && selectedDeptFilter !=  "all") {
      loadEmployees(selectedDeptFilter);
    } else {
      loadEmployees();
    }
    // Reset employee selection when department changes
    setSelectedEmployeeFilter("all");
  }, [selectedDeptFilter]);

  // Click outside handlers
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
      if (
        empDropdownRef.current &&
        !empDropdownRef.current.contains(event.target)
      ) {
        setIsEmpDropdownOpen(false);
        setEmpHighlightedIndex(-1);
        setEmpSearchTerm("");
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
    if (isEmpDropdownOpen && empSearchRef.current) {
      setTimeout(() => empSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen, isEmpDropdownOpen]);

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

  // Filter employees
  useEffect(() => {
    if (!employees.length) return;

    if (!empSearchTerm.trim()) {
      setFilteredEmployees(employees);
    } else {
      const term = empSearchTerm.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          (emp.Emp_Name?.toLowerCase() || "").includes(term) ||
          (emp.First_Name?.toLowerCase() || "").includes(term) ||
          (emp.Last_Name?.toLowerCase() || "").includes(term) ||
          (emp.Emp_Code?.toLowerCase() || "").includes(term) ||
          (emp.Email_Id?.toLowerCase() || "").includes(term),
      );
      setFilteredEmployees(filtered);
    }
    setEmpHighlightedIndex(-1);
  }, [empSearchTerm, employees]);

  // Fetch attendance data from API (status filter removed)
  const fetchAttendanceData = async (filters = null) => {
    setLoading(true);
    try {
      const activeFilters = filters || appliedFilters;
      
      const params = new URLSearchParams();
      params.append("page", pagination.currentPage);
      params.append("per_page", pagination.perPage);
      
      if (activeFilters.from_date) 
        params.append("from_date", activeFilters.from_date);
      if (activeFilters.to_date) 
        params.append("to_date", activeFilters.to_date);
      if (activeFilters.dept_id && activeFilters.dept_id !=  "all") 
        params.append("Dpt_Id", activeFilters.dept_id);
      if (activeFilters.emp_id && activeFilters.emp_id !=  "all") 
        params.append("Emp_Id", activeFilters.emp_id);

      const url = `${import.meta.env.VITE_API_URL}/lst-leave-application?${params.toString()}`;
      const response = await axios.get(url, { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });

      if (response.data?.success) {
        const payload = response.data.data;
        setAttendanceData(payload);
        if (payload?.current_page !=  undefined) {
          setPagination({
            currentPage: payload.current_page,
            perPage: payload.per_page,
            total: payload.total,
            lastPage: payload.last_page,
          });
        }
        if (!payload?.data?.length) {
          setMessage({
            text: "No leave records found for selected filters",
            type: "warning",
          });
        } else {
          setMessage({ text: "", type: "" });
        }
      } else {
        setAttendanceData(null);
        setMessage({
          text: response.data?.message || "No data found",
          type: "warning",
        });
      }
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading leave data",
        type: "error",
      });
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAttendanceData(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setDateFrom(getFirstDayOfMonth());
    setDateTo(getTodayDate());
    setSelectedDeptFilter("all");
    setSelectedEmployeeFilter("all");
    const emptyFilters = {
      from_date: null,
      to_date: null,
      dept_id: null,
      emp_id: null,
    };
    setAppliedFilters(emptyFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    let deptIdValue = null;
    let empIdValue = null;

    if (selectedDeptFilter && selectedDeptFilter != "all") {
      deptIdValue = selectedDeptFilter;
    }

    if (selectedEmployeeFilter && selectedEmployeeFilter != "all") {
      empIdValue = selectedEmployeeFilter;
    }

    const newFilters = {
      from_date: dateFrom || null,
      to_date: dateTo || null,
      dept_id: deptIdValue,
      emp_id: empIdValue,
    };

    setAppliedFilters(newFilters);
    setHasGenerated(true);
    setMessage({ text: "", type: "" });
    setPagination(prev => ({ ...prev, currentPage: 1 }));

    await fetchAttendanceData(newFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.lastPage) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    fetchAttendanceData({ ...appliedFilters });
  };

  // Get employee display name
 const getEmployeeDisplayName = (emp) => {
  // Use First_Name for English name only
  if (emp.First_Name) {
    return emp.First_Name.trim();
  }
  // Fallback to Emp_Name if available
  if (emp.Emp_Name) {
    return emp.Emp_Name.trim();
  }
  return "No Name";
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
    if (!selectedDeptFilter || selectedDeptFilter == "all")
      return "All Departments";
    const selected = flattenedDepartments.find(
      (dept) => (dept.Dpt_id ?? dept.Dpt_Id)?.toString() == selectedDeptFilter,
    );
    if (!selected) return "All Departments";

    const level = selected.treeLevel || parseInt(selected.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = selected.Dpt_Desc || selected.desc || "No Description";
    const name = selected.Dpt_Name || selected.name;

    if (name && name != desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  // Employee display functions
  const renderEmployeeItem = (emp) => {
    const empName = getEmployeeDisplayName(emp);
    return (
      <div className="py-1">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
            <FiUser className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {empName}
            </div>
            <div className="text-xs text-gray-500">
              {emp.Emp_Code && <span>Code: {emp.Emp_Code} | </span>}
              {emp.Email_Id && <span>{emp.Email_Id}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getSelectedEmployeeDisplay = () => {
    if (!selectedEmployeeFilter || selectedEmployeeFilter == "all")
      return "All Employees";
    const selected = employees.find(
      (emp) => emp.Emp_Id?.toString() == selectedEmployeeFilter,
    );
    if (!selected) return "All Employees";
    return getEmployeeDisplayName(selected);
  };

  const handleDeptFilterSelect = (dept) => {
    if (dept?.isAllOption) {
      setSelectedDeptFilter("all");
    } else if (dept) {
      const id = dept.Dpt_id ?? dept.Dpt_Id;
      if (id != null) setSelectedDeptFilter(id.toString());
    }
    setIsDeptDropdownOpen(false);
    setDeptSearchTerm("");
    setDeptHighlightedIndex(-1);
    if (hasGenerated) invalidateReport();
  };

  const handleEmployeeFilterSelect = (emp) => {
    if (emp?.isAllOption) {
      setSelectedEmployeeFilter("all");
    } else if (emp) {
      const id = emp.Emp_Id;
      if (id != null) setSelectedEmployeeFilter(id.toString());
    }
    setIsEmpDropdownOpen(false);
    setEmpSearchTerm("");
    setEmpHighlightedIndex(-1);
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

  // Employee dropdown key handlers
  const handleEmployeeKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isEmpDropdownOpen) {
        setIsEmpDropdownOpen(true);
        setEmpSearchTerm("");
        setEmpHighlightedIndex(-1);
        setTimeout(() => empSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isEmpDropdownOpen) {
        setIsEmpDropdownOpen(false);
        setEmpHighlightedIndex(-1);
        setEmpSearchTerm("");
      }
    }
  };

  const handleEmpSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredEmployees.length > 0) {
        setEmpHighlightedIndex(0);
        setTimeout(() => {
          if (empItemRefs.current[0]) {
            empItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmpDropdownOpen(false);
      setEmpHighlightedIndex(-1);
      setEmpSearchTerm("");
      empButtonRef.current?.focus();
    }
  };

  const handleEmpItemKeyDown = (e, idx, item) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredEmployees.length) {
        setEmpHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (empItemRefs.current[nextIndex]) {
            empItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setEmpHighlightedIndex(-1);
        setTimeout(() => empSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setEmpHighlightedIndex(-1);
        setTimeout(() => empSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setEmpHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (empItemRefs.current[prevIndex]) {
            empItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleEmployeeFilterSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmpDropdownOpen(false);
      setEmpHighlightedIndex(-1);
      setEmpSearchTerm("");
      empButtonRef.current?.focus();
    }
  };

  const handlePrintClick = () => {
    if (!attendanceData) return;
    setPrintReady(true);
    setTimeout(() => {
      setShowPrint(true);
    }, 100);
  };

  // Export to Excel (removed App. Code, Employee Code, Status columns)
  const handleExcelExport = () => {
    if (!attendanceData || !attendanceData.data) return;

    const data = attendanceData.data.map((record, idx) => ({
      "S.N.": idx + 1,
      "Employee Name": record.employee ? getEmployeeDisplayName(record.employee) : "-",
      "Leave Type": record.leave_type?.LT_name || "-",
      "From Date": formatDate(record.Fr_Date),
      "To Date": formatDate(record.To_Date),
      "Total Days": record.Tot_Days || "-",
      "Paid Days": record.Paid || "-",
      "Unpaid Days": record.UnPaid || "-",
      "Reason": record.Reason || "-",
      "Contact": record.Lv_Cnt || "-",
      "Address": record.Lv_Adr || "-",
      "Applied On": formatDate(record.created_at),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Leave Report");
    XLSX.writeFile(
      wb,
      `Employee_Leave_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // Render leave table (removed App. Code, Employee Code, Status columns)
  const renderAttendanceTable = () => {
    if (!attendanceData || !attendanceData.data || attendanceData.data.length == 0) {
      return null;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unpaid</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData.data.map((record, idx) => (
              <tr key={record.LA_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">
                  {(pagination.currentPage - 1) * pagination.perPage + idx + 1}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {record.employee ? getEmployeeDisplayName(record.employee) : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {record.leave_type?.LT_name || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(record.Fr_Date)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(record.To_Date)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {record.Tot_Days || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {record.Paid || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {record.UnPaid || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {record.Reason || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(record.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.lastPage > 1 && (
          <div className="flex justify-between items-center mt-4 px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to{" "}
              {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of{" "}
              {pagination.total} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage == 1}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.currentPage} of {pagination.lastPage}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage == pagination.lastPage}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render filters (status filter removed)
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiCalendar className="inline mr-1 h-3 w-3" />
              From Date
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
              <FiCalendar className="inline mr-1 h-3 w-3" />
              To Date
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
              required={false}
              icon={FiFolder}
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
              getDisplay={(dept) => dept.Dpt_Desc || dept.Dpt_Name || "No Name"}
              getSelectedDisplay={getSelectedDepartmentDisplay}
              loading={dropdownLoading}
              placeholder="All Departments"
              searchPlaceholder="Search departments..."
              buttonRef={deptButtonRef}
              dropdownRef={deptDropdownRef}
              searchRef={deptSearchRef}
              itemRefs={deptItemRefs}
              listRef={deptListRef}
              renderItem={renderDepartmentItem}
              includeAllOption={true}
              allOptionLabel="All Departments"
            />
          </div>

          <div>
            <SearchableDropdown
              label="Employee"
              value={selectedEmployeeFilter}
              required={false}
              icon={FiUser}
              isOpen={isEmpDropdownOpen}
              setIsOpen={setIsEmpDropdownOpen}
              searchTerm={empSearchTerm}
              setSearchTerm={setEmpSearchTerm}
              items={employees}
              filteredItems={filteredEmployees}
              highlightedIndex={empHighlightedIndex}
              onSelect={handleEmployeeFilterSelect}
              onKeyDown={handleEmployeeKeyDown}
              onSearchKeyDown={handleEmpSearchKeyDown}
              onItemKeyDown={handleEmpItemKeyDown}
              getDisplay={getEmployeeDisplayName}
              getSelectedDisplay={getSelectedEmployeeDisplay}
              loading={employeeLoading}
              placeholder="All Employees"
              searchPlaceholder="Search employees..."
              buttonRef={empButtonRef}
              dropdownRef={empDropdownRef}
              searchRef={empSearchRef}
              itemRefs={empItemRefs}
              listRef={empListRef}
              renderItem={renderEmployeeItem}
              includeAllOption={true}
              allOptionLabel="All Employees"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={loading || dropdownLoading || employeeLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <FiSearch className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          {(hasGenerated ||
            (appliedFilters.from_date && appliedFilters.from_date != getFirstDayOfMonth()) ||
            (appliedFilters.to_date && appliedFilters.to_date != getTodayDate()) ||
            appliedFilters.dept_id ||
            appliedFilters.emp_id) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
            >
              <FiX className="h-4 w-4 mr-2" />
              Clear
            </button>
          )}
        </div>

        {message.text && message.type == "error" && (
          <div className="mt-2 text-red-600 text-sm flex items-center">
            <FiAlertCircle className="h-4 w-4 mr-1" />
            {message.text}
          </div>
        )}
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading leave records...</p>
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
          Select filters and click <span className="font-medium">Generate Report</span> to fetch data.
        </p>
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Records Found
        </h3>
        <p className="text-gray-600">
          No leave records found for the selected filters.
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

  const hasData = attendanceData && attendanceData.data && attendanceData.data.length > 0;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Print Layout Component - Updated columns */}
      {showPrint && attendanceData && printReady && (
        <PrintLayout
          title={`${pageTitle}`}
          showControls={true}
          onClose={() => {
            setShowPrint(false);
            setPrintReady(false);
          }}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <div>
            <style>
              {`
                @media print {
                  body { margin: 0; padding: 0; }
                  .print-content { display: block; }
                  table { border-collapse: collapse !important; width: 100% !important; margin-bottom: 20px; }
                  th, td { border: 1px solid #ccc !important; padding: 8px !important; font-size: 10pt !important; }
                  th { font-weight: 600 !important; background: #f3f4f6 !important; }
                  tr { page-break-inside: avoid; }
                  thead { display: table-header-group; }
                  tfoot { display: table-footer-group; }
                }
              `}
            </style>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <h1 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 4px 0" }}>
                {pageTitle}
              </h1>
              {appliedFilters.from_date && (
                <p style={{ fontSize: "11px", margin: "2px 0" }}>
                  Period: {formatDate(appliedFilters.from_date)} - {formatDate(appliedFilters.to_date)}
                </p>
              )}
            </div>
            <div className="print-content">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Employee Name</th>
                    <th>Leave Type</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Total Days</th>
                    <th>Paid</th>
                    <th>Unpaid</th>
                    <th>Reason</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.data.map((record, idx) => (
                    <tr key={record.LA_id}>
                      <td>{idx + 1}</td>
                      <td>{record.employee ? getEmployeeDisplayName(record.employee) : "-"}</td>
                      <td>{record.leave_type?.LT_name || "-"}</td>
                      <td>{formatDate(record.Fr_Date)}</td>
                      <td>{formatDate(record.To_Date)}</td>
                      <td style={{ textAlign: "center" }}>{record.Tot_Days || "-"}</td>
                      <td style={{ textAlign: "center" }}>{record.Paid || "-"}</td>
                      <td style={{ textAlign: "center" }}>{record.UnPaid || "-"}</td>
                      <td>{record.Reason || "-"}</td>
                      <td>{formatDate(record.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors shadow-sm"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" /> Excel
            </button>
            <button
              onClick={handlePrintClick}
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
              Employee Leave Application Records
            </p>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Period Display */}
          {hasGenerated && attendanceData && (
            <div className="mb-4 p-2 bg-blue-50 rounded-lg text-center text-sm text-blue-700 border border-blue-200">
              <strong>Period:</strong> {formatDate(appliedFilters.from_date)} to {formatDate(appliedFilters.to_date)}
              {appliedFilters.dept_id && appliedFilters.dept_id !=  "all" && (
                <> | <strong>Department:</strong> {flattenedDepartments.find(d => (d.Dpt_id?.toString() || d.Dpt_Id?.toString()) == appliedFilters.dept_id)?.Dpt_Desc || "Selected"}</>
              )}
              {appliedFilters.emp_id && appliedFilters.emp_id !=  "all" && (
                <> | <strong>Employee:</strong> {employees.find(e => e.Emp_Id?.toString() == appliedFilters.emp_id)?.First_Name || "Selected"}</>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && renderLoading()}

          {/* No Data State */}
          {!loading && !hasData && renderNoData()}

          {/* Data Display */}
          {!loading && hasData && renderAttendanceTable()}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;