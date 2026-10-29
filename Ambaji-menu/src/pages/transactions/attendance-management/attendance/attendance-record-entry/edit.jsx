// components/attendance/attendance-record-entry/edit.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Printer,
  Download,
  Calendar as CalendarIcon,
  Building2,
  Loader,
  AlertCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  ChevronDown,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";
import "jspdf-autotable";
import { AttendanceEntryApi } from "../../../../services/attendanceentryapi";

// Searchable Employee Dropdown Component
const SearchableEmployeeSelect = ({ 
    employees, 
    value, 
    onChange, 
    placeholder, 
    loading,
    disabled,
    error,
    required = false
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const buttonRef = useRef(null);
    const itemRefs = useRef([]);
    const listRef = useRef(null);
  
    const selectedEmployee = employees.find(emp => emp.Emp_Id?.toString() == value);
  
    const filteredEmployees = employees.filter(emp =>
      (emp.Emp_Name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (emp.Emp_Code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (emp.Emp_Id?.toString() || "").includes(searchTerm)
    );
  
    const handleSelect = (employee) => {
      onChange(employee.Emp_Id?.toString());
      setIsOpen(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
    };
  
    const getEmployeeDisplay = (emp) => {
      if (!emp) return "";
      if (emp.Emp_Code && emp.Emp_Name) {
        return `${emp.Emp_Code} - ${emp.Emp_Name}`;
      }
      if (emp.Emp_Code) return emp.Emp_Code;
      if (emp.Emp_Name) return emp.Emp_Name;
      return `Employee #${emp.Emp_Id || ""}`;
    };
  
    const getSelectedEmployeeDisplay = () => {
      if (!value) return "";
      const selected = employees.find(emp => emp.Emp_Id?.toString() == value);
      if (!selected) return "Selected employee not found";
      return getEmployeeDisplay(selected);
    };
  
    const handleKeyDown = (e) => {
      if (disabled) return;
      
      if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setSearchTerm("");
          setHighlightedIndex(-1);
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }
      } else if (e.key == "Escape") {
        e.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          setHighlightedIndex(-1);
          setSearchTerm("");
        }
      }
    };
  
    const handleSearchKeyDown = (e) => {
      if (e.key == "ArrowDown") {
        e.preventDefault();
        if (filteredEmployees.length > 0) {
          setHighlightedIndex(0);
          setTimeout(() => {
            if (itemRefs.current[0]) itemRefs.current[0].focus();
          }, 0);
        }
      } else if (e.key == "Escape") {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm("");
        buttonRef.current?.focus();
      }
    };
  
    const handleItemKeyDown = (e, idx, employee) => {
      if (e.key == "ArrowDown") {
        e.preventDefault();
        const nextIndex = idx + 1;
        if (nextIndex < filteredEmployees.length) {
          setHighlightedIndex(nextIndex);
          setTimeout(() => {
            if (itemRefs.current[nextIndex]) itemRefs.current[nextIndex].focus();
          }, 0);
        } else {
          setHighlightedIndex(-1);
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }
      } else if (e.key == "ArrowUp") {
        e.preventDefault();
        if (idx == 0) {
          setHighlightedIndex(-1);
          setTimeout(() => searchInputRef.current?.focus(), 0);
        } else {
          const prevIndex = idx - 1;
          setHighlightedIndex(prevIndex);
          setTimeout(() => {
            if (itemRefs.current[prevIndex]) itemRefs.current[prevIndex].focus();
          }, 0);
        }
      } else if (e.key == "Enter") {
        e.preventDefault();
        handleSelect(employee);
      } else if (e.key == "Escape") {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm("");
        buttonRef.current?.focus();
      }
    };
  
    const handleWheel = (e) => {
      e.stopPropagation();
    };
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
          setSearchTerm("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        setTimeout(() => searchInputRef.current.focus(), 0);
      }
    }, [isOpen]);
  
    return (
      <div ref={dropdownRef} className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Employee {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
  
          <button
            ref={buttonRef}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`w-full pl-10 pr-10 py-2.5 border ${
              error ? "border-red-300" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-left ${
              disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:border-purple-400"
            }`}
          >
            {value ? (
              <span className="text-gray-900">{getSelectedEmployeeDisplay()}</span>
            ) : (
              <span className="text-gray-500">
                {loading ? "Loading employees..." : placeholder || "Select Employee"}
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
            className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
            style={{ minWidth: "500px", width: "auto" }}
          >
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by employee code or name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
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
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee, idx) => {
                  const empId = employee.Emp_Id?.toString();
                  const isSelected = value == empId;
                  
                  return (
                    <button
                      key={empId || idx}
                      ref={(el) => {
                        if (el && itemRefs.current) {
                          itemRefs.current[idx] = el;
                        }
                      }}
                      type="button"
                      onClick={() => handleSelect(employee)}
                      onKeyDown={(e) => handleItemKeyDown(e, idx, employee)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-purple-50 ${
                        highlightedIndex == idx
                          ? "bg-purple-100"
                          : isSelected
                            ? "bg-purple-50 text-purple-600"
                            : "text-gray-700"
                      }`}
                      tabIndex={0}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {getEmployeeDisplay(employee)}
                          </div>
                          {employee.Emp_Name && employee.Emp_Code && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              ID: {employee.Emp_Id}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p>No employees found</p>
                </div>
              )}
            </div>
  
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex justify-between text-xs text-gray-600">
                <span>{filteredEmployees.length} employees found</span>
                {value && <span>1 selected</span>}
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

const EditAttendanceRecord = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const payrollBillIdFromQuery = queryParams.get('payrollBillId');
  const monthFromQuery = queryParams.get('month');
  const yearFromQuery = queryParams.get('year');
  const empIdFromQuery = queryParams.get('empId');
  
  // Convert month name to index if needed
  const getMonthIndex = (monthName) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const index = months.indexOf(monthName);
    return index !=  -1 ? index : new Date().getMonth();
  };
  
  // Filter States
  const [payrollBills, setPayrollBills] = useState([]);
  const [selectedPayrollBill, setSelectedPayrollBill] = useState(payrollBillIdFromQuery || "");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(empIdFromQuery || "");
  const [selectedMonth, setSelectedMonth] = useState(
    monthFromQuery ? getMonthIndex(monthFromQuery) : new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState(
    yearFromQuery ? parseInt(yearFromQuery) : new Date().getFullYear()
  );
  const [financialYears, setFinancialYears] = useState([]);
  
  // Attendance Data States
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [originalAttendanceData, setOriginalAttendanceData] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Additional Data States
  const [weekOffPattern, setWeekOffPattern] = useState(null);
  const [weekOffDates, setWeekOffDates] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [holidayDates, setHolidayDates] = useState({});
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [leaveDates, setLeaveDates] = useState({});
  const [employeeAttendanceMap, setEmployeeAttendanceMap] = useState({});
  
  // Status Legend Checkboxes & Highlighting - only for visual highlight without affecting bg colors
  const [highlightedStatuses, setHighlightedStatuses] = useState({
    P: false,
    A: false,
    L: false,
    H: false,
    WO: false,
    'N/A': false
  });
  
  // UI States
  const [loadingPayrollBills, setLoadingPayrollBills] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingFinancialYears, setLoadingFinancialYears] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  const generateCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const calendarDays = [];
    
    const prevMonthDays = getDaysInMonth(selectedYear, selectedMonth - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthDays - i,
        date: new Date(selectedYear, selectedMonth - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        date: new Date(selectedYear, selectedMonth, i),
        isCurrentMonth: true
      });
    }
    
    const remainingCells = 42 - calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({
        day: i,
        date: new Date(selectedYear, selectedMonth + 1, i),
        isCurrentMonth: false
      });
    }
    
    return calendarDays;
  };
  
  const calendarGrid = generateCalendarGrid();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const calculateWeekOffDatesFromPattern = (woffPattern, year, month) => {
    let weeks = null;

    if (Array.isArray(woffPattern?.weeks)) {
      weeks = woffPattern.weeks;
    } else if (Array.isArray(woffPattern?.pattern_data?.weeks)) {
      weeks = woffPattern.pattern_data.weeks;
    } else if (Array.isArray(woffPattern?.pattern_data?.days)) {
      const flat = woffPattern.pattern_data.days;
      weeks = [];
      for (let w = 0; w < 6; w++) weeks.push(flat.slice(w * 7, w * 7 + 7));
    } else if (Array.isArray(woffPattern?.days)) {
      const flat = woffPattern.days;
      weeks = [];
      for (let w = 0; w < 6; w++) weeks.push(flat.slice(w * 7, w * 7 + 7));
    }

    if (!weeks || weeks.length == 0) return {};

    const daysCount = getDaysInMonth(year, month);
    const weekOffMap = {};

    for (let date = 1; date <= daysCount; date++) {
      const jsDate = new Date(year, month, date);
      const jsDay = jsDate.getDay();
      const colIndex = (jsDay + 6) % 7;
      const rowIndex = Math.floor((date - 1) / 7);

      if (rowIndex < weeks.length && weeks[rowIndex][colIndex] == 1) {
        weekOffMap[date] = "WO";
      }
    }

    return weekOffMap;
  };
  
  const calculateHolidayDates = (holidaysList, year, month) => {
    const holidayMap = {};
    holidaysList.forEach((holiday) => {
      const holidayDate = new Date(holiday.HL_Date);
      const holidayYear = holidayDate.getFullYear();
      const holidayMonth = holidayDate.getMonth();
      const holidayDay = holidayDate.getDate();
      if (holidayYear == year && holidayMonth == month) {
        holidayMap[holidayDay] = {
          status: "H",
          name: holiday.HL_Name,
          type: holiday.HL_Type,
        };
      }
    });
    return holidayMap;
  };
  
  const calculateLeaveDates = (leavesList, year, month, empId) => {
    const leaveMap = {};
    leavesList.forEach((leave) => {
      if (leave.Emp_Id !=  parseInt(empId)) return;
      
      const fromDate = new Date(leave.Fr_Date);
      const toDate = new Date(leave.To_Date);
      const fromYear = fromDate.getFullYear();
      const toYear = toDate.getFullYear();
      const fromMonth = fromDate.getMonth();
      const toMonth = toDate.getMonth();
      
      let isOverlap = false;
      if (year == fromYear && year == toYear) {
        if (month >= fromMonth && month <= toMonth) isOverlap = true;
      } else if (year == fromYear && month >= fromMonth) {
        isOverlap = true;
      } else if (year == toYear && month <= toMonth) {
        isOverlap = true;
      } else if (year > fromYear && year < toYear) {
        isOverlap = true;
      }
      
      if (isOverlap) {
        const daysCount = getDaysInMonth(year, month);
        for (let date = 1; date <= daysCount; date++) {
          const currentDate = new Date(year, month, date);
          if (currentDate >= fromDate && currentDate <= toDate) {
            leaveMap[date] = {
              status: "L",
              leaveType: leave.leave_type?.LT_name || "Leave",
            };
          }
        }
      }
    });
    return leaveMap;
  };
  
  const fetchAllAttendanceMap = async () => {
    try {
      const result = await AttendanceEntryApi.getAttendanceListWithFilters({
        per_page: 10000,
        page: 1,
      });
      
      console.log("Fetch all attendance map result:", result);
      
      const attendanceMap = {};
      
      if (result && result.success == true) {
        let records = [];
        
        if (result.data && result.data.data && Array.isArray(result.data.data)) {
          records = result.data.data;
        }
        else if (result.data && Array.isArray(result.data)) {
          records = result.data;
        }
        else if (Array.isArray(result)) {
          records = result;
        }
        
        records.forEach(record => {
          if (record && record.PRB_id && record.EA_Month && record.Fr_Year) {
            const key = `${record.PRB_id}_${record.EA_Month}_${record.Fr_Year}`;
            attendanceMap[key] = record;
          }
        });
      }
      
      console.log("Attendance map built, keys:", Object.keys(attendanceMap).length);
      setEmployeeAttendanceMap(attendanceMap);
      return attendanceMap;
    } catch (err) {
      console.error("Error fetching attendance map:", err);
      return {};
    }
  };
  
  const fetchFinancialYears = async () => {
    setLoadingFinancialYears(true);
    try {
      const years = await AttendanceEntryApi.getFinancialYears();
      setFinancialYears(years);
    } catch (err) {
      console.error("Error fetching financial years:", err);
    } finally {
      setLoadingFinancialYears(false);
    }
  };
  
  const fetchPayrollBills = async () => {
    setLoadingPayrollBills(true);
    try {
      const bills = await AttendanceEntryApi.getPayrollBills();
      setPayrollBills(bills);
    } catch (err) {
      console.error("Error fetching payroll bills:", err);
      setError("Error loading payroll bills");
    } finally {
      setLoadingPayrollBills(false);
    }
  };
  
  const fetchEmployees = async (prbId) => {
    if (!prbId) return;
    setLoadingEmployees(true);
    try {
      const transformedEmployees = await AttendanceEntryApi.getEmployeesByPayrollBill(prbId);
      setEmployees(transformedEmployees);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Error loading employees");
    } finally {
      setLoadingEmployees(false);
    }
  };
  
  const fetchAdditionalData = async () => {
    try {
      const [holidaysList, leavesList] = await Promise.all([
        AttendanceEntryApi.getHolidays(),
        AttendanceEntryApi.getLeaveApplications(),
      ]);
      setHolidays(holidaysList);
      setLeaveApplications(leavesList);
    } catch (err) {
      console.error("Error fetching additional data:", err);
    }
  };
  
  const fetchAttendanceData = useCallback(async () => {
    if (!selectedPayrollBill || !selectedEmployee || !selectedYear || selectedMonth == undefined) return;
    
    setLoadingAttendance(true);
    try {
      const monthIndex = selectedMonth + 1;
      const year = parseInt(selectedYear);
      const payrollBillId = parseInt(selectedPayrollBill);

      const toRecords = (response) => {
        if (!response?.data) return [];
        if (Array.isArray(response.data)) return response.data;
        if (Array.isArray(response.data?.data)) return response.data.data;
        return [];
      };

      const [allAttendanceResponse, monthAttendanceResponse] = await Promise.all([
        AttendanceEntryApi.getAttendanceList(null, null),
        AttendanceEntryApi.getAttendanceList(monthIndex, year),
      ]);

      const allRecords = toRecords(allAttendanceResponse);
      const monthRecords = toRecords(monthAttendanceResponse);

      let foundPattern = null;
      allRecords
        .filter(r => r.PRB_id == payrollBillId)
        .forEach(record => {
          (record.employees || []).forEach(empData => {
            if (empData.employee?.Emp_Id == parseInt(selectedEmployee) && empData.woff_pattern) {
              foundPattern = empData.woff_pattern;
            }
          });
        });

      if (foundPattern) {
        setWeekOffPattern(foundPattern);
      }

      const record = monthRecords.find(
        r => r.PRB_id == payrollBillId && r.EA_Month == monthIndex && r.Fr_Year == year
      );

      if (record) {
        setAttendanceRecord(record);
        
        const attendanceMapData = {};
        
        if (record.employees && Array.isArray(record.employees)) {
          const empAttendance = record.employees.find(
            empData => empData.employee?.Emp_Id == parseInt(selectedEmployee)
          );
          
          if (empAttendance && empAttendance.days && Array.isArray(empAttendance.days)) {
            empAttendance.days.forEach(item => {
              if (item.day && item.status) {
                attendanceMapData[item.day] = item;
              }
            });
          }
        }
        else if (record.attendance_data && Array.isArray(record.attendance_data)) {
          const empAttendance = record.attendance_data.find(
            item => item.Emp_Id == parseInt(selectedEmployee)
          );
          
          if (empAttendance && empAttendance.days && Array.isArray(empAttendance.days)) {
            empAttendance.days.forEach(item => {
              if (item.day && item.status) {
                attendanceMapData[item.day] = item;
              }
            });
          }
        }
        else if (record.attendance_data && typeof record.attendance_data == 'object') {
          let attendanceArray = [];
          if (Array.isArray(record.attendance_data)) {
            attendanceArray = record.attendance_data;
          } else if (typeof record.attendance_data == 'object') {
            attendanceArray = Object.values(record.attendance_data);
          }
          
          attendanceArray.forEach(item => {
            if (item.day && item.status) {
              attendanceMapData[item.day] = item;
            }
          });
        }
        
        setAttendanceData(attendanceMapData);
        setOriginalAttendanceData(JSON.parse(JSON.stringify(attendanceMapData)));
      } else {
        setAttendanceRecord(null);
        setAttendanceData({});
        setOriginalAttendanceData({});
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      toast.error("Error loading attendance data");
    } finally {
      setLoadingAttendance(false);
    }
  }, [selectedPayrollBill, selectedEmployee, selectedYear, selectedMonth]);
  
  // Initialize data and set values from query params
  useEffect(() => {
    const initializeData = async () => {
      await fetchFinancialYears();
      await fetchPayrollBills();
      await fetchAdditionalData();
      
      if (payrollBillIdFromQuery) {
        await fetchEmployees(payrollBillIdFromQuery);
      }
      
      setIsInitialLoad(false);
    };
    
    initializeData();
  }, []);
  
  // Set employee details when employees are loaded and we have an empId from query
  useEffect(() => {
    if (employees.length > 0 && empIdFromQuery && !selectedEmployeeDetails) {
      const empDetails = employees.find(e => e.Emp_Id == parseInt(empIdFromQuery));
      if (empDetails) {
        setSelectedEmployeeDetails(empDetails);
      }
    }
  }, [employees, empIdFromQuery, selectedEmployeeDetails]);
  
  // Auto-fetch attendance data when all filters are set
  useEffect(() => {
    if (!isInitialLoad && selectedPayrollBill && selectedEmployee && selectedYear && selectedMonth !=  undefined) {
      fetchAttendanceData();
    }
  }, [selectedEmployee, selectedPayrollBill, selectedYear, selectedMonth, fetchAttendanceData, isInitialLoad]);
  
  useEffect(() => {
    if (weekOffPattern && selectedYear && selectedMonth != undefined) {
      setWeekOffDates(
        calculateWeekOffDatesFromPattern(weekOffPattern, selectedYear, selectedMonth)
      );
    }
  }, [selectedMonth, selectedYear, weekOffPattern]);
  
  useEffect(() => {
    if (holidays && selectedYear && selectedMonth !=  undefined) {
      setHolidayDates(
        calculateHolidayDates(holidays, selectedYear, selectedMonth)
      );
    }
  }, [selectedMonth, selectedYear, holidays]);
  
  useEffect(() => {
    if (leaveApplications && selectedYear && selectedMonth !=  undefined && selectedEmployee) {
      setLeaveDates(
        calculateLeaveDates(leaveApplications, selectedYear, selectedMonth, selectedEmployee)
      );
    }
  }, [selectedMonth, selectedYear, leaveApplications, selectedEmployee]);
  
  useEffect(() => {
    if (selectedPayrollBill) {
      fetchEmployees(selectedPayrollBill);
      if (!empIdFromQuery || selectedPayrollBill !=  payrollBillIdFromQuery) {
        setSelectedEmployee("");
        setSelectedEmployeeDetails(null);
        setAttendanceData({});
        setAttendanceRecord(null);
      }
    }
  }, [selectedPayrollBill]);
  
  const handlePayrollBillChange = (e) => {
    setSelectedPayrollBill(e.target.value);
    setError(null);
  };
  
  const handleEmployeeChange = (empId) => {
    setSelectedEmployee(empId);
    
    if (empId) {
      const empDetails = employees.find(e => e.Emp_Id == parseInt(empId));
      setSelectedEmployeeDetails(empDetails);
    } else {
      setSelectedEmployeeDetails(null);
    }
  };
  
  const handleMonthChange = (direction) => {
    if (direction == 'prev') {
      if (selectedMonth == 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth == 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };
  
  const handleAttendanceStatusChange = (day, newStatus) => {
    const current = getAttendanceStatus(day, true);
    if (current.isLocked) return;

    setAttendanceData(prev => {
      const updated = { ...prev };
      
      if (newStatus == "-") {
        delete updated[day];
      } else {
        updated[day] = {
          day: day,
          shift: "General",
          in_time: newStatus == "P" ? "09:00" : null,
          out_time: newStatus == "P" ? "18:00" : null,
          late_by: newStatus == "P" ? "00:00" : null,
          early_by: newStatus == "P" ? "00:00" : null,
          duration: newStatus == "P" ? "09:00" : "00:00",
          status: newStatus
        };
      }
      
      return updated;
    });
  };
  
  const getAttendanceStatus = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return { status: "", isEditable: false, isLocked: true };
    
    if (holidayDates[day]) {
      return {
        status: "H",
        holidayInfo: holidayDates[day],
        isEditable: false,
        isLocked: true,
      };
    }
    
    if (weekOffDates[day]) {
      return {
        status: "WO",
        isEditable: false,
        isLocked: true,
      };
    }

    if (leaveDates[day]) {
      return {
        status: "L",
        leaveInfo: leaveDates[day],
        isEditable: false,
        isLocked: true,
      };
    }

    if (attendanceData[day]) {
      const savedStatus = attendanceData[day].status;
      if (savedStatus == "L") {
        return {
          status: "L",
          isEditable: false,
          isLocked: true,
        };
      }
      return {
        status: savedStatus,
        isEditable: true,
        isLocked: false,
      };
    }
    
    return {
      status: "-",
      isEditable: true,
      isLocked: false,
    };
  };
  
  const calculateStats = () => {
    let present = 0, absent = 0, leave = 0, holiday = 0, workout = 0, notMarked = 0;
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const { status } = getAttendanceStatus(day, true);
      if (status == "P") present++;
      else if (status == "A") absent++;
      else if (status == "L") leave++;
      else if (status == "H") holiday++;
      else if (status == "WO") workout++;
      else if (status == "-") notMarked++;
    }
    
    const netDays = present + absent + leave + holiday + workout + notMarked;
    
    return { present, absent, leave, holiday, workout, notMarked, netDays };
  };
  
  const handleHighlightToggle = (status) => {
    setHighlightedStatuses(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };
  
  const isDateHighlighted = (status) => {
    if (!status || status == "-") return highlightedStatuses['N/A'];
    return highlightedStatuses[status] == true;
  };
  
  const hasChanges = () => {
    const currentKeys = Object.keys(attendanceData);
    const originalKeys = Object.keys(originalAttendanceData);
    
    if (currentKeys.length != originalKeys.length) return true;
    
    for (const day of currentKeys) {
      const current = attendanceData[day];
      const original = originalAttendanceData[day];
      if (!original || current.status != original.status) {
        return true;
      }
    }
    return false;
  };
  
  // ========== NEW HELPER FUNCTIONS FOR SINGLE & MULTIPLE UPDATES ==========
  
  // Find which days changed for current employee
  const findChangedDaysForEmployee = () => {
    const changedDays = [];
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Skip locked days (Holiday, Week Off)
      if (holidayDates[day] || weekOffDates[day]) {
        continue;
      }
      
      // Skip if this day has a leave (locked by API)
      if (leaveDates[day]) {
        continue;
      }
      
      const currentStatus = attendanceData[day]?.status || "-";
      const originalStatus = originalAttendanceData[day]?.status || "-";
      
      if (currentStatus != originalStatus) {
        changedDays.push(day);
      }
    }
    
    return changedDays;
  };
  
  // Save single day using simple payload
  const saveSingleDay = async (eaId, empId, day) => {
    let status = attendanceData[day]?.status || "A";
    
    let inTime = null, outTime = null, duration = "00:00";
    let lateBy = null, earlyBy = null;
    
    if (status == "P") {
      inTime = "09:00";
      outTime = "18:00";
      duration = "09:00";
      lateBy = "00:00";
      earlyBy = "00:00";
    }
    
    const payload = {
      Emp_Id: empId,
      day: day,
      shift: "General",
      in_time: inTime,
      out_time: outTime,
      late_by: lateBy,
      early_by: earlyBy,
      duration: duration,
      status: status
    };
    
    console.log("Single day payload:", payload);
    
    const result = await AttendanceEntryApi.update(eaId, payload);
    
    if (result && result.success) {
      toast.success(`Day ${day} updated successfully!`);
      await fetchAttendanceData();
      setOriginalAttendanceData(JSON.parse(JSON.stringify(attendanceData)));
      return true;
    }
    return false;
  };
  
  // Save multiple days using bulk payload
  const saveMultipleDays = async (eaId, prbId, monthIndex, year, empId, changedDays) => {
    const daysArray = [];
    
    for (const day of changedDays) {
      let status = attendanceData[day]?.status;
      if (!status || status == "-") continue;
      
      let inTime = null, outTime = null, duration = "00:00";
      
      if (status == "P") {
        inTime = "09:00";
        outTime = "18:00";
        duration = "09:00";
      }
      
      daysArray.push({
        day: day,
        shift: "General",
        in_time: inTime,
        out_time: outTime,
        duration: duration,
        status: status
      });
    }
    
    if (daysArray.length == 0) {
      toast.error("No valid days to update");
      return false;
    }
    
    const payload = {
      EA_Code: attendanceRecord.EA_Code || `ATT_${months[selectedMonth].toUpperCase().substring(0, 3)}_${year}`,
      EA_Month: monthIndex,
      Fr_Year: year,
      PRB_id: prbId,
      attendance_data: [
        {
          Emp_Id: empId,
          days: daysArray
        }
      ],
      Status: 1
    };
    
    console.log("Multiple days payload:", payload);
    
    const result = await AttendanceEntryApi.update(eaId, payload);
    
    if (result && result.success) {
      toast.success(`${daysArray.length} day(s) updated successfully!`);
      await fetchAttendanceData();
      setOriginalAttendanceData(JSON.parse(JSON.stringify(attendanceData)));
      return true;
    }
    return false;
  };
  
  // ========== UPDATED HANDLE SAVE FUNCTION ==========
  const handleSave = async () => {
    if (!attendanceRecord) {
      toast.error("No attendance record found to update");
      return;
    }
    
    if (!hasChanges()) {
      toast.error("No changes to save");
      return;
    }
    
    setSaving(true);
    
    try {
      const eaId = attendanceRecord.EA_id;
      const monthIndex = selectedMonth + 1;
      const year = parseInt(selectedYear);
      const prbId = parseInt(selectedPayrollBill);
      const currentEmpId = parseInt(selectedEmployee);
      
      // Find changed days
      const changedDays = findChangedDaysForEmployee();
      
      if (changedDays.length == 0) {
        toast.error("No changes detected");
        return;
      }
      
      // Decide which API to use based on number of changed days
      if (changedDays.length == 1) {
        // Single day update - use simple payload
        await saveSingleDay(eaId, currentEmpId, changedDays[0]);
      } else {
        // Multiple days update - use bulk payload
        await saveMultipleDays(eaId, prbId, monthIndex, year, currentEmpId, changedDays);
      }
      
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error(error.message || "Error saving attendance");
    } finally {
      setSaving(false);
    }
  };
  
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const stats = calculateStats();
    const payrollBill = payrollBills.find(b => b.PRB_id == selectedPayrollBill);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Report - ${selectedEmployeeDetails?.Emp_Name || selectedEmployee}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f4f4f4; }
            .present { background-color: #d1fae5; }
            .absent { background-color: #fee2e2; }
            .leave { background-color: #fef3c7; }
            .holiday { background-color: #FFCDD2; }
            .weekoff { background-color: #f3e8ff; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Employee Attendance Report</h2>
            <p><strong>Employee:</strong> ${selectedEmployeeDetails?.Emp_Name || 'N/A'} (${selectedEmployee})</p>
            <p><strong>Month/Year:</strong> ${months[selectedMonth]} ${selectedYear}</p>
            <p><strong>Payroll Bill:</strong> ${payrollBill?.PayBill_Code || 'N/A'}</p>
          </div>
          <table>
            <thead>
              <tr>${weekDays.map(day => `<th>${day}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${Array.from({ length: 6 }, (_, row) => {
                const startIdx = row * 7;
                const weekDaysData = calendarGrid.slice(startIdx, startIdx + 7);
                return `<tr>${weekDaysData.map(({ day, isCurrentMonth }) => {
                  const { status } = getAttendanceStatus(day, isCurrentMonth);
                  const displayStatus = status == "-" ? "" : status;
                  let className = "";
                  if (status == "P") className = "present";
                  else if (status == "A") className = "absent";
                  else if (status == "L") className = "leave";
                  else if (status == "H") className = "holiday";
                  else if (status == "WO") className = "weekoff";
                  return `<td class="${className}"><div>${isCurrentMonth ? day : ''}</div><div><strong>${displayStatus}</strong></div>`;
                }).join('')}</tr>`;
              }).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 20px;">
            <strong>Summary:</strong> P:${stats.present} | A:${stats.absent} | L:${stats.leave} | H:${stats.holiday} | WO:${stats.workout} | Net:${stats.netDays}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  const handleExportToExcel = () => {
    const stats = calculateStats();
    const payrollBill = payrollBills.find(b => b.PRB_id == selectedPayrollBill);
    
    const excelData = [
      ["Employee Attendance Report"],
      [`Employee: ${selectedEmployeeDetails?.Emp_Name || 'N/A'} (${selectedEmployee})`],
      [`Month/Year: ${months[selectedMonth]} ${selectedYear}`],
      [`Payroll Bill: ${payrollBill?.PayBill_Code || 'N/A'}`],
      [],
      weekDays,
    ];
    
    for (let row = 0; row < 6; row++) {
      const rowData = [];
      for (let col = 0; col < 7; col++) {
        const idx = row * 7 + col;
        if (idx < calendarGrid.length) {
          const { day, isCurrentMonth } = calendarGrid[idx];
          if (isCurrentMonth) {
            const { status } = getAttendanceStatus(day, true);
            rowData.push(`${day}\n${status == "-" ? "" : status}`);
          } else {
            rowData.push("");
          }
        } else {
          rowData.push("");
        }
      }
      excelData.push(rowData);
    }
    
    excelData.push([]);
    excelData.push(["Summary", `Present: ${stats.present}`, `Absent: ${stats.absent}`, `Leave: ${stats.leave}`, `Holiday: ${stats.holiday}`, `Week Off: ${stats.workout}`, `Net Days: ${stats.netDays}`]);
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Attendance_${selectedEmployee}_${months[selectedMonth]}_${selectedYear}`);
    XLSX.writeFile(wb, `Attendance_${selectedEmployee}_${months[selectedMonth]}_${selectedYear}.xlsx`);
  };
  
  const handleExportToPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");
    const stats = calculateStats();
    const payrollBill = payrollBills.find(b => b.PRB_id == selectedPayrollBill);
    
    doc.setFontSize(16);
    doc.text("Employee Attendance Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Employee: ${selectedEmployeeDetails?.Emp_Name || 'N/A'} (${selectedEmployee})`, 14, 25);
    doc.text(`Month/Year: ${months[selectedMonth]} ${selectedYear}`, 14, 32);
    doc.text(`Payroll Bill: ${payrollBill?.PayBill_Code || 'N/A'}`, 14, 39);
    
    const tableHeaders = weekDays;
    const tableBody = [];
    
    for (let row = 0; row < 6; row++) {
      const rowData = [];
      for (let col = 0; col < 7; col++) {
        const idx = row * 7 + col;
        if (idx < calendarGrid.length) {
          const { day, isCurrentMonth } = calendarGrid[idx];
          if (isCurrentMonth) {
            const { status } = getAttendanceStatus(day, true);
            rowData.push(`${day}\n${status}`);
          } else {
            rowData.push("");
          }
        } else {
          rowData.push("");
        }
      }
      tableBody.push(rowData);
    }
    
    doc.autoTable({
      head: [tableHeaders],
      body: tableBody,
      startY: 45,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 1, halign: "center" },
      headStyles: { fillColor: [102, 102, 102], textColor: 255, fontSize: 8 },
    });
    
    doc.save(`Attendance_${selectedEmployee}_${months[selectedMonth]}_${selectedYear}.pdf`);
  };
  
  const isFiltersComplete = selectedPayrollBill && selectedEmployee && selectedYear && selectedMonth != undefined;
  const stats = calculateStats();
  
  if (loadingPayrollBills && isInitialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/transactions/attendance-management/attendance/attendance-record-entry")}
              className="mr-4 text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Attendance Record</h1>
              <p className="text-gray-500 mt-1">Update employee attendance for a specific month</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Payroll Bill Select */}
          {/* <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payroll Bill <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedPayrollBill}
                onChange={handlePayrollBillChange}
                disabled={loadingPayrollBills}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingPayrollBills ? "Loading..." : "Select Payroll Bill"}
                </option>
                {payrollBills.map((bill) => (
                  <option key={bill.PRB_id} value={bill.PRB_id}>
                    {bill.PayBill_Code} - {bill.Description || bill.PRB_id}
                  </option>
                ))}
              </select>
            </div>
          </div> */}

          {/* Employee Searchable Dropdown */}
          {/* <SearchableEmployeeSelect
            employees={employees}
            value={selectedEmployee}
            onChange={handleEmployeeChange}
            placeholder="Select Employee"
            loading={loadingEmployees}
            disabled={!selectedPayrollBill || loadingEmployees}
            required
          /> */}

          {/* Month Select */}
          {/* <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Month <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div> */}

          {/* Year Select */}
          {/* <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Year <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                disabled={loadingFinancialYears}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingFinancialYears ? "Loading..." : "Select Year"}
                </option>
                {financialYears.map((fy) => {
                  const yearVal = fy.FY_Code ? fy.FY_Code.split("-")[0] : fy.FY_Id;
                  return (
                    <option key={fy.FY_Id} value={yearVal}>
                      {fy.FY_Code || yearVal}
                    </option>
                  );
                })}
              </select>
            </div>
          </div> */}
        </div>
        
        {/* Employee Details */}
        {selectedEmployeeDetails && isFiltersComplete && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Employee Code</p>
                <p className="text-sm font-semibold text-gray-900">{selectedEmployeeDetails.Emp_Code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-semibold text-gray-900">{selectedEmployeeDetails.Emp_Name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Designation</p>
                <p className="text-sm text-gray-700">{selectedEmployeeDetails.designation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm text-gray-700">{selectedEmployeeDetails.department || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
      </div>
      
      {/* Main Content Area: Calendar (Left) + Status Legend (Right) */}
      {isFiltersComplete ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Calendar with Square Cells - Date and Status Inline */}
          <div className="lg:w-2/3">
            {loadingAttendance ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading attendance data...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        {weekDays.map(day => (
                          <th key={day} className="px-1 py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 w-[110px]">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 6 }, (_, row) => {
                        const startIdx = row * 7;
                        const weekDaysData = calendarGrid.slice(startIdx, startIdx + 7);
                        return (
                          <tr key={row} className="border-b border-gray-200">
                            {weekDaysData.map(({ day, isCurrentMonth, date }, colIdx) => {
                              const { status, holidayInfo, leaveInfo, isEditable, isLocked } = getAttendanceStatus(day, isCurrentMonth);
                              
                              const shouldHighlight = isDateHighlighted(status);
                              
                              let bgColor = "";
                              let statusColor = "";
                              let borderColor = "";
                              
                              if (status == "P") { bgColor = "bg-green-50"; statusColor = "text-green-700"; borderColor = "border-green-200"; }
                              else if (status == "A") { bgColor = "bg-red-50"; statusColor = "text-red-700"; borderColor = "border-red-200"; }
                              else if (status == "L") { bgColor = "bg-yellow-50"; statusColor = "text-yellow-700"; borderColor = "border-yellow-200"; }
                              else if (status == "H") { bgColor = "bg-blue-50"; statusColor = "text-blue-700"; borderColor = "border-blue-200"; }
                              else if (status == "WO") { bgColor = "bg-purple-50"; statusColor = "text-purple-700"; borderColor = "border-purple-200"; }
                              else if (status == "-" && isCurrentMonth) { bgColor = "bg-gray-50"; statusColor = "text-gray-500"; borderColor = "border-gray-200"; }
                              else { bgColor = "bg-white"; borderColor = "border-gray-200"; }
                              
                              const isToday = new Date().toDateString() == date?.toDateString();
                              
                              let dropdownOptions = [
                                { value: "-", label: "-" },
                                { value: "P", label: "P" },
                                { value: "A", label: "A" }
                              ];
                              
                              if (leaveDates[day]) {
                                dropdownOptions.push({ value: "L", label: "L" });
                              }
                              
                              return (
                                <td 
                                  key={colIdx} 
                                  className={`p-2 text-center border-r border-gray-200 last:border-r-0 ${bgColor} transition-all`}
                                >
                                  <div 
                                    className={`flex gap-2 items-center justify-center min-h-[80px] rounded-lg transition-all ${shouldHighlight ? 'ring-2 ring-black ring-inset' : ''}`}
                                  > 
                                    <div className={`text-base font-bold ${isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}`}>
                                      {isCurrentMonth ? day : ""}
                                    </div>
                                    
                                    {isCurrentMonth ? (
                                      isLocked ? (
                                        <div className={`px-3 py-1 rounded-md font-bold text-sm ${statusColor} ${borderColor} border bg-white bg-opacity-80`}>
                                          {status}
                                          {holidayInfo?.name && (
                                            <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                                              {holidayInfo.name.length > 10 ? holidayInfo.name.substring(0, 10) + '...' : holidayInfo.name}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <select
                                          value={status}
                                          onChange={(e) => handleAttendanceStatusChange(day, e.target.value)}
                                          className={`px-3 py-1.5 text-sm font-bold rounded-md border-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer transition-all ${statusColor} ${borderColor} bg-white hover:shadow-md`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {dropdownOptions.map(opt => (
                                            <option key={opt.value} value={opt.value} className="font-normal">
                                              {opt.label}
                                            </option>
                                          ))}
                                        </select>
                                      )
                                    ) : (
                                      <div className="text-xs text-gray-300">-</div>
                                    )}
                                    
                                    {leaveInfo?.leaveType && isCurrentMonth && (
                                      <div className="text-[9px] text-gray-500 mt-1 max-w-[80px] truncate">
                                        {leaveInfo.leaveType.length > 12 ? leaveInfo.leaveType.substring(0, 12) + '...' : leaveInfo.leaveType}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column: Simple Status Legend with Checkboxes + Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Status Legend & Summary
              </h3>
              
              {/* Status Cards with Count */}
              <div className="space-y-3 mb-5">
                <div 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${highlightedStatuses.P ? 'ring-2 ring-black' : 'hover:bg-gray-50'}`}
                  onClick={() => handleHighlightToggle('P')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={highlightedStatuses.P}
                      onChange={() => {}}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-green-700">P</span>
                    </div>
                    <span className="text-base font-semibold text-gray-800">Present</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{stats.present}</span>
                </div>
                
                <div 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${highlightedStatuses.A ? 'ring-2 ring-black' : 'hover:bg-gray-50'}`}
                  onClick={() => handleHighlightToggle('A')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={highlightedStatuses.A}
                      onChange={() => {}}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-red-700">A</span>
                    </div>
                    <span className="text-base font-semibold text-gray-800">Absent</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{stats.absent}</span>
                </div>
                
                <div 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${highlightedStatuses.L ? 'ring-2 ring-black' : 'hover:bg-gray-50'}`}
                  onClick={() => handleHighlightToggle('L')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={highlightedStatuses.L}
                      onChange={() => {}}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-yellow-700">L</span>
                    </div>
                    <span className="text-base font-semibold text-gray-800">Leave</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{stats.leave}</span>
                </div>
                
                <div 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${highlightedStatuses.H ? 'ring-2 ring-black' : 'hover:bg-gray-50'}`}
                  onClick={() => handleHighlightToggle('H')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={highlightedStatuses.H}
                      onChange={() => {}}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">H</span>
                    </div>
                    <span className="text-base font-semibold text-gray-800">Holiday</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{stats.holiday}</span>
                </div>
                
                <div 
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${highlightedStatuses.WO ? 'ring-2 ring-black' : 'hover:bg-gray-50'}`}
                  onClick={() => handleHighlightToggle('WO')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={highlightedStatuses.WO}
                      onChange={() => {}}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-700">WO</span>
                    </div>
                    <span className="text-base font-semibold text-gray-800">Week Off</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{stats.workout}</span>
                </div>
              </div>
              
              {/* Net Days Summary */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-2">
                <span className="text-base font-bold text-gray-800">Net Days</span>
                <span className="text-xl font-semibold text-gray-900">{stats.netDays}</span>
              </div>
              
              {/* Save Button */}
              <div className="mt-5 pt-2 flex flex-col gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || loadingAttendance || !hasChanges()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {saving ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  <span className="font-semibold">{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Filters to View Attendance</h3>
          <p className="text-gray-500">Please select Payroll Bill, Employee, Month, and Year to edit attendance records</p>
        </div>
      )}
    </div>
  );
};

export default EditAttendanceRecord;