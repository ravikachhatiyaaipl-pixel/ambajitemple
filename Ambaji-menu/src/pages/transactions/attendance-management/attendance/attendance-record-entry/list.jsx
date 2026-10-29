// components/attendance/attendance-record-entry/list.jsx
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
} from "lucide-react";
import { toast } from "react-hot-toast";
import { AttendanceEntryApi } from "../../../../services/attendanceentryapi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";


const ListAttendanceRecord = ({ user }) => {
  const navigate = useNavigate();
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

  // Filter states
  const [selectedPayrollBill, setSelectedPayrollBill] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Dropdown search terms
  const [payrollSearch, setPayrollSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [designationSearch, setDesignationSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Dropdown refs
  const payrollDropdownRef = useRef(null);
  const departmentDropdownRef = useRef(null);
  const designationDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);

  // Dropdown open states
  const [isPayrollOpen, setIsPayrollOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isDesignationOpen, setIsDesignationOpen] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [payrollBills, setPayrollBills] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [weekOffPattern, setWeekOffPattern] = useState(null);
  const [weekOffDates, setWeekOffDates] = useState({});
  // Per-employee week-off dates: { empId: { date: "WO" } }
  const [employeeWeekOffDates, setEmployeeWeekOffDates] = useState({});
  // Raw woff_patterns per employee for recomputing on month/year change
  const [employeeWoffPatterns, setEmployeeWoffPatterns] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [holidayDates, setHolidayDates] = useState({});
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [leaveDates, setLeaveDates] = useState({});

  const [loadingPayrollBills, setLoadingPayrollBills] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingFinancialYears, setLoadingFinancialYears] = useState(false);
  const [loadingWeekOff, setLoadingWeekOff] = useState(false);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState(null);
  const [showData, setShowData] = useState(false);

  const [expandedRows, setExpandedRows] = useState({});
  const [pageTitle, setPageTitle] = useState("Attendance Record Entry");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        payrollDropdownRef.current &&
        !payrollDropdownRef.current.contains(event.target)
      ) {
        setIsPayrollOpen(false);
      }
      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(event.target)
      ) {
        setIsDepartmentOpen(false);
      }
      if (
        designationDropdownRef.current &&
        !designationDropdownRef.current.contains(event.target)
      ) {
        setIsDesignationOpen(false);
      }
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setIsEmployeeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonthWithWeekdays = (month, year) => {
    if (!month || !year) return [];
    const monthIndex = months.indexOf(month);
    if (monthIndex == -1) return [];
    const daysCount = new Date(year, monthIndex + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysCount; i++) {
      const date = new Date(year, monthIndex, i);
      const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
      days.push({ day: i, weekday: weekday, date: date });
    }
    return days;
  };

  const monthDays = getDaysInMonthWithWeekdays(
    selectedMonth,
    parseInt(selectedYear) || new Date().getFullYear()
  );

  /**
   * Calculate week-off dates for a given month/year from a woff_pattern.
   * Pattern shape: { weeks: [[...7], ...6] }  — Mon=0 … Sun=6 column order.
   * Week rows: days 1-7 → row 0, 8-14 → row 1, etc.
   */
  const calculateWeekOffDatesFromPattern = (woffPattern, month, year) => {
    if (!woffPattern || !month || !year) return {};
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

    const monthIndex = months.indexOf(month);
    const yearNum = parseInt(year);
    const daysCount = new Date(yearNum, monthIndex + 1, 0).getDate();
    const weekOffMap = {};
    for (let date = 1; date <= daysCount; date++) {
      const jsDay = new Date(yearNum, monthIndex, date).getDay(); // Sun=0…Sat=6
      const colIndex = (jsDay + 6) % 7;                          // Mon=0…Sun=6
      const rowIndex = Math.floor((date - 1) / 7);
      if (rowIndex < weeks.length && weeks[rowIndex][colIndex] == 1) {
        weekOffMap[date] = "WO";
      }
    }
    return weekOffMap;
  };

  // Calculate Holiday dates for the selected month
  const calculateHolidayDates = (holidaysList, month, year) => {
    if (!holidaysList || !month || !year) return {};
    const monthIndex = months.indexOf(month);
    const holidayMap = {};
    holidaysList.forEach((holiday) => {
      const holidayDate = new Date(holiday.HL_Date);
      const holidayYear = holidayDate.getFullYear();
      const holidayMonth = holidayDate.getMonth();
      const holidayDay = holidayDate.getDate();
      if (holidayYear == year && holidayMonth == monthIndex) {
        holidayMap[holidayDay] = {
          status: "H",
          name: holiday.HL_Name,
          type: holiday.HL_Type,
          category: holiday.HL_Cate,
          isPaid: holiday.HL_ISPaid,
        };
      }
    });
    return holidayMap;
  };

  // Calculate Leave dates for each employee for the selected month
  const calculateLeaveDates = (leavesList, month, year) => {
    if (!leavesList || !month || !year) return {};
    const monthIndex = months.indexOf(month);
    const leaveMap = {};
    leavesList.forEach((leave) => {
      const empId = leave.Emp_Id;
      const fromDateParts = leave.Fr_Date.split("-");
      const toDateParts = leave.To_Date.split("-");
      const fromDate = new Date(
        parseInt(fromDateParts[0]),
        parseInt(fromDateParts[1]) - 1,
        parseInt(fromDateParts[2])
      );
      const toDate = new Date(
        parseInt(toDateParts[0]),
        parseInt(toDateParts[1]) - 1,
        parseInt(toDateParts[2])
      );
      const fromYear = fromDate.getFullYear();
      const toYear = toDate.getFullYear();
      const fromMonth = fromDate.getMonth();
      const toMonth = toDate.getMonth();

      let isOverlap = false;
      if (year == fromYear && year == toYear) {
        if (monthIndex >= fromMonth && monthIndex <= toMonth) isOverlap = true;
      } else if (year == fromYear && monthIndex >= fromMonth) {
        isOverlap = true;
      } else if (year == toYear && monthIndex <= toMonth) {
        isOverlap = true;
      } else if (year > fromYear && year < toYear) {
        isOverlap = true;
      }

      if (isOverlap) {
        const daysCount = new Date(year, monthIndex + 1, 0).getDate();
        for (let date = 1; date <= daysCount; date++) {
          const currentDate = new Date(year, monthIndex, date);
          if (currentDate >= fromDate && currentDate <= toDate) {
            if (!leaveMap[empId]) leaveMap[empId] = {};
            leaveMap[empId][date] = {
              status: "L",
              leaveType: leave.leave_type?.LT_name || "Leave",
              fromDate: leave.Fr_Date,
              toDate: leave.To_Date,
              reason: leave.Reason,
              totalDays: leave.Tot_Days,
            };
          }
        }
      }
    });
    return leaveMap;
  };

  // Transform API attendance records into display format
// Transform API attendance records into display format
const transformAttendanceRecords = (apiRecords) => {
  const displayRecords = [];
  
  // Handle paginated response structure
  let recordsArray = [];
  if (apiRecords && apiRecords.data && Array.isArray(apiRecords.data)) {
    recordsArray = apiRecords.data;
  } else if (Array.isArray(apiRecords)) {
    recordsArray = apiRecords;
  } else {
    return displayRecords;
  }
  
  recordsArray.forEach((record) => {
    // Check if employees array exists
    if (record.employees && Array.isArray(record.employees)) {
      // Each item in employees has employee object, attendance_summary, and days array
      record.employees.forEach((empData) => {
        displayRecords.push({
          EA_id: record.EA_id,
          EA_Code: record.EA_Code,
          EA_Month: record.EA_Month,
          Fr_Year: record.Fr_Year,
          PRB_id: record.PRB_id,
          Emp_Id: empData.employee?.Emp_Id,
          attendance_data: empData.days || [],
          summary: empData.attendance_summary || {},
          total_working_hours: empData.attendance_summary?.total_working_hours || 0,
          employee: empData.employee || null,
          payroll: record.payroll || null,
        });
      });
    }
  });
  
  return displayRecords;
};

const handleGenerate = async () => {
  // Validate required fields
  if (!selectedMonth) {
    toast.error("Please select a month");
    return;
  }
  if (!selectedYear) {
    toast.error("Please select a year");
    return;
  }

  setLoadingRecords(true);
  setShowData(true);

  try {
    // Build filters object with correct parameter names
    const filters = {};

    if (searchTerm) filters.search = searchTerm;
    const monthNumber = months.indexOf(selectedMonth) + 1;
    filters.month = monthNumber;
    filters.year = parseInt(selectedYear);
    if (selectedEmployee) filters.emp_id = selectedEmployee;
    if (selectedDepartment) filters.department_id = selectedDepartment;
    if (selectedDesignation) filters.designation_id = selectedDesignation;
    if (selectedPayrollBill) filters.paybill_id = selectedPayrollBill;

    console.log("API Request Filters:", filters);

    const response = await AttendanceEntryApi.getAttendanceListWithFilters(filters);
    console.log("API Response:", response);

    let transformedRecords = [];
    
    // Check if response is successful
    if (response && response.success == true && response.data) {
      // Since response.data is directly the array of attendance records
      const records = response.data;
      
      console.log("Raw records count:", records.length);

      // ── Extract per-employee woff_pattern ──────────────────────────────────
      const rawPatterns = {};   // empId → woff_pattern
      const empWeekOffMap = {}; // empId → { date: "WO" }

      records.forEach((record) => {
        if (record.employees && Array.isArray(record.employees)) {
          record.employees.forEach((empData) => {
            const empId = empData.employee?.Emp_Id;
            if (empId && empData.woff_pattern && !rawPatterns[empId]) {
              rawPatterns[empId] = empData.woff_pattern;
              empWeekOffMap[empId] = calculateWeekOffDatesFromPattern(
                empData.woff_pattern, selectedMonth, parseInt(selectedYear)
              );
            }
          });
        }
      });

      setEmployeeWoffPatterns(rawPatterns);
      setEmployeeWeekOffDates(empWeekOffMap);
      // ──────────────────────────────────────────────────────────────────────
      
      // Process each attendance record
      records.forEach((record) => {
        // Check if employees array exists and has data
        if (record.employees && Array.isArray(record.employees)) {
          // Each item in employees has employee object, attendance_summary, and days array
          record.employees.forEach((empData) => {
            transformedRecords.push({
              EA_id: record.EA_id,
              EA_Code: record.EA_Code,
              EA_Month: record.EA_Month,
              Fr_Year: record.Fr_Year,
              PRB_id: record.PRB_id,
              Emp_Id: empData.employee?.Emp_Id,
              attendance_data: empData.days || [],
              summary: empData.attendance_summary || {},
              total_working_hours: empData.attendance_summary?.total_working_hours || 0,
              employee: empData.employee || null,
              payroll: record.payroll || null,
            });
          });
        }
      });
    }

    console.log("Transformed records count:", transformedRecords.length);
    
    setAttendanceRecords(transformedRecords);
    setFilteredRecords(transformedRecords);

    if (transformedRecords.length == 0) {
      toast.info("No attendance records found for the selected filters");
    } else {
      toast.success(`Found ${transformedRecords.length} records`);
    }
  } catch (err) {
    console.error("Error fetching attendance records:", err);
    toast.error("Attendance data not available");
    setAttendanceRecords([]);
    setFilteredRecords([]);
  } finally {
    setLoadingRecords(false);
  }
};

  // Reset all filters
  const handleReset = () => {
    setSelectedPayrollBill("");
    setSelectedMonth("");
    setSelectedYear("");
    setSelectedDepartment("");
    setSelectedDesignation("");
    setSelectedEmployee("");
    setSearchTerm("");
    setPayrollSearch("");
    setDepartmentSearch("");
    setDesignationSearch("");
    setEmployeeSearch("");
    setShowData(false);
    setAttendanceRecords([]);
    setFilteredRecords([]);
    setExpandedRows({});
    setEmployeeWeekOffDates({});
    setEmployeeWoffPatterns({});
  };

  // Get selected display values
  const getSelectedPayrollName = () => {
    const bill = payrollBills.find((b) => b.PRB_id == selectedPayrollBill);
    return bill
      ? `${bill.PayBill_Code} - ${bill.Description}`
      : "Select Payroll Bill";
  };

  const getSelectedDepartmentName = () => {
    const dept = departments.find((d) => d.Dpt_id == selectedDepartment);
    return dept ? dept.Dpt_Name : "Select Department";
  };

  const getSelectedDesignationName = () => {
    const desg = designations.find((d) => d.Dsg_id == selectedDesignation);
    return desg ? desg.Dsg_Desc || desg.Dsg_EName : "Select Designation";
  };

  const getSelectedEmployeeName = () => {
    const emp = employees.find((e) => e.Emp_Id == selectedEmployee);
    return emp ? emp.First_Name || emp.Last_Name || "" : "Select Employee";
  };

  // Filtered lists based on search
  const filteredPayrolls = payrollBills.filter((bill) =>
    `${bill.PayBill_Code} ${bill.Description}`
      .toLowerCase()
      .includes(payrollSearch.toLowerCase())
  );

  const filteredDepartments = departments.filter((dept) =>
    dept.Dpt_Name.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  const filteredDesignations = designations.filter((desg) =>
    (desg.Dsg_Desc || desg.Dsg_EName || "")
      .toLowerCase()
      .includes(designationSearch.toLowerCase())
  );

  const filteredEmployees = employees.filter((emp) =>
    `${emp.First_Name} ${emp.Last_Name || ""}`
      .toLowerCase()
      .includes(employeeSearch.toLowerCase())
  );

  // Get attendance status for a day — per-employee week-offs, holidays, leaves, then saved data
  const getAttendanceStatusForDay = (record, day) => {
    const empId = record.Emp_Id;

    // Priority 1: Holiday
    if (holidayDates[day]) return "H";

    // Priority 2: Per-employee week-off
    if (employeeWeekOffDates[empId] && employeeWeekOffDates[empId][day]) return "WO";

    // Priority 3: Saved attendance from API
    if (record.attendance_data && Array.isArray(record.attendance_data)) {
      const dayData = record.attendance_data.find((d) => d.day == day);
      if (dayData && dayData.status) {
        if (dayData.status == "P" || dayData.status == "WOP") return "P";
        if (dayData.status == "A") return "A";
        if (dayData.status == "L") return "L";
      }
    }

    // Priority 4: Leave from leave API
    if (leaveDates[empId] && leaveDates[empId][day]) return "L";

    return "-";
  };

  const calculateStatsForRecord = (record) => {
    let present = 0, absent = 0, leave = 0;
    monthDays.forEach(({ day }) => {
      const status = getAttendanceStatusForDay(record, day);
      if (status == "P") present++;
      else if (status == "A") absent++;
      else if (status == "L") leave++;
    });
    const holiday = Object.keys(holidayDates).length;
    // Use per-employee week-off count
    const workout = Object.keys(employeeWeekOffDates[record.Emp_Id] || {}).length;
    const netDays = present + leave + holiday + workout;
    return { present, absent, leave, holiday, workout, netDays };
  };

  const grandTotals = () => {
    let totalPresent = 0, totalAbsent = 0, totalLeave = 0, totalWorkout = 0;
    filteredRecords.forEach((record) => {
      const stats = calculateStatsForRecord(record);
      totalPresent += stats.present;
      totalAbsent += stats.absent;
      totalLeave += stats.leave;
      totalWorkout += stats.workout;
    });
    return {
      present: totalPresent,
      absent: totalAbsent,
      leave: totalLeave,
      holiday: Object.keys(holidayDates).length,
      workout: totalWorkout,
      netDays: totalPresent + totalLeave + Object.keys(holidayDates).length + totalWorkout,
    };
  };

  const toggleRowExpand = (empId) => {
    setExpandedRows((prev) => ({ ...prev, [empId]: !prev[empId] }));
  };

  // Fetch all dropdown data on component mount
  useEffect(() => {
    const fetchAllDropdownData = async () => {
      await Promise.all([
        fetchFinancialYears(),
        fetchPayrollBills(),
        fetchDepartments(),
        fetchDesignations(),
        fetchEmployees(),
        fetchHolidays(),
        fetchLeaveApplications(),
      ]);
    };
    fetchAllDropdownData();
  }, []);

  // Recalculate holiday and leave dates when month/year changes
  useEffect(() => {
    if (holidays.length > 0 && selectedMonth && selectedYear) {
      setHolidayDates(calculateHolidayDates(holidays, selectedMonth, parseInt(selectedYear)));
    }
  }, [selectedMonth, selectedYear, holidays]);

  useEffect(() => {
    if (leaveApplications.length > 0 && selectedMonth && selectedYear) {
      setLeaveDates(calculateLeaveDates(leaveApplications, selectedMonth, parseInt(selectedYear)));
    }
  }, [selectedMonth, selectedYear, leaveApplications]);

  // Recompute per-employee week-offs when month/year changes (no new API call needed)
  useEffect(() => {
    if (Object.keys(employeeWoffPatterns).length == 0) return;
    const newMap = {};
    Object.entries(employeeWoffPatterns).forEach(([empId, pattern]) => {
      newMap[empId] = calculateWeekOffDatesFromPattern(pattern, selectedMonth, parseInt(selectedYear));
    });
    setEmployeeWeekOffDates(newMap);
  }, [selectedMonth, selectedYear, employeeWoffPatterns]);

  const fetchFinancialYears = async () => {
    setLoadingFinancialYears(true);
    try {
      const years = await AttendanceEntryApi.getFinancialYears();
      setFinancialYears(years);
      if (!selectedYear && years.length > 0) {
        const currentYear = years.find((fy) => fy.is_current_year == true);
        if (currentYear) {
          setSelectedYear(currentYear.FY_Code.split("-")[0]);
        }
      }
      setSelectedMonth(months[new Date().getMonth()]);

    } catch (err) {
      console.error("Error fetching financial years:", err);
      setError("Error loading financial years");
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

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/dpt-master/all/lst-dpt-master`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      const result = await response.json();
      if (result.success && result.data) {
        setDepartments(result.data);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      toast.error("Error loading departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchDesignations = async () => {
    setLoadingDesignations(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/designation/all`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      const result = await response.json();
      if (result.status == "success" && result.data) {
        setDesignations(result.data);
      }
    } catch (err) {
      console.error("Error fetching designations:", err);
      toast.error("Error loading designations");
    } finally {
      setLoadingDesignations(false);
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/emp-mast/all`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      const result = await response.json();
      if (result.status && result.data) {
        setEmployees(result.data);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Error loading employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const holidaysList = await AttendanceEntryApi.getHolidays();
      setHolidays(holidaysList);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const fetchLeaveApplications = async () => {
    setLoadingLeaves(true);
    try {
      const leavesList = await AttendanceEntryApi.getLeaveApplications();
      setLeaveApplications(leavesList);
    } catch (err) {
      console.error("Error fetching leave applications:", err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const handleExportToExcel = () => {
    const excelData = [
      [
        "Sr.",
        "Employee Code",
        "Employee Name",
        ...monthDays.map((d) => `${d.day}/${d.weekday}`),
        "P",
        "A",
        "L",
        "H",
        "WO",
        "Net Days",
      ],
    ];
    filteredRecords.forEach((record, idx) => {
      const stats = calculateStatsForRecord(record);
      const empName = record.employee?.First_Name || "N/A";
      const empCode = record.employee?.Emp_Code || record.Emp_Id;
      excelData.push([
        idx + 1,
        empCode,
        empName,
        ...monthDays.map(({ day }) => getAttendanceStatusForDay(record, day)),
        stats.present,
        stats.absent,
        stats.leave,
        stats.holiday,
        stats.workout,
        stats.netDays,
      ]);
    });
    const totals = grandTotals();
    excelData.push([
      "GRAND TOTAL",
      "",
      "",
      ...monthDays.map(() => ""),
      totals.present,
      totals.absent,
      totals.leave,
      totals.holiday,
      totals.workout,
      totals.netDays,
    ]);
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      `Attendance_${selectedMonth || "All"}_${selectedYear || "All"}`
    );
    XLSX.writeFile(
      wb,
      `Attendance_${selectedMonth || "All"}_${selectedYear || "All"}.xlsx`
    );
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");
    const totals = grandTotals();
    doc.setFontSize(16);
    doc.text("Monthly Attendance Register", 14, 15);
    doc.setFontSize(10);
    doc.text(
      `${selectedMonth || "All Months"} ${selectedYear || "All Years"}`,
      14,
      25
    );
    const tableHeaders = [
      "Sr.",
      "Code",
      "Name",
      ...monthDays.map((d) => `${d.day}\n${d.weekday}`),
      "P",
      "A",
      "L",
      "H",
      "WO",
      "Net",
    ];
    const tableBody = filteredRecords.map((record, idx) => {
      const stats = calculateStatsForRecord(record);
      const empName = record.employee?.First_Name || "N/A";
      const empCode = record.employee?.Emp_Code || record.Emp_Id;
      return [
        idx + 1,
        empCode,
        empName,
        ...monthDays.map(({ day }) => getAttendanceStatusForDay(record, day)),
        stats.present,
        stats.absent,
        stats.leave,
        stats.holiday,
        stats.workout,
        stats.netDays,
      ];
    });
    tableBody.push([
      "Total",
      "",
      "",
      ...monthDays.map(() => ""),
      totals.present,
      totals.absent,
      totals.leave,
      totals.holiday,
      totals.workout,
      totals.netDays,
    ]);
    doc.autoTable({
      head: [tableHeaders],
      body: tableBody,
      startY: 35,
      theme: "striped",
      styles: { fontSize: 7, cellPadding: 1, halign: "center" },
      headStyles: { fillColor: [102, 102, 102], textColor: 255, fontSize: 7 },
    });
    doc.save(
      `Attendance_${selectedMonth || "All"}_${selectedYear || "All"}.pdf`
    );
  };

  // Custom Dropdown Component
  const CustomDropdown = ({
    label,
    value,
    onChange,
    items,
    displayKey,
    valueKey,
    searchTerm,
    onSearchChange,
    isOpen,
    setIsOpen,
    loading,
    placeholder,
    dropdownRef,
    selectedDisplayText,
  }) => {
    const getItemDisplayText = (item) => {
      if (typeof displayKey == "function") {
        return displayKey(item);
      }
      return item[displayKey];
    };

    const handleSearchInput = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onSearchChange(e.target.value);
    };

    const handleItemSelect = (itemValue) => {
      onChange(itemValue);
      setIsOpen(false);
      onSearchChange("");
    };

    const inputRef = useRef(null);

    useEffect(() => {
      if (isOpen && inputRef.current) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 100);
      }
    }, [isOpen]);

    return (
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 cursor-pointer bg-white flex items-center justify-between hover:border-purple-400 transition-colors"
        >
          <span style={{ color: value ? "#111827" : "#6b7280" }}>
            {selectedDisplayText || placeholder}
          </span>
          <ChevronDown
            style={{ height: "16px", width: "16px", color: "#6b7280" }}
          />
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              zIndex: 50,
              width: "100%",
              marginTop: "4px",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              maxHeight: "320px",
              overflow: "auto",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                padding: "8px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div style={{ position: "relative" }}>
                <Search
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: "16px",
                    width: "16px",
                    color: "#9ca3af",
                    pointerEvents: "none",
                  }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={handleSearchInput}
                  onKeyDown={(e) => e.stopPropagation()}
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 32px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#111827",
                    backgroundColor: "white",
                  }}
                />
              </div>
            </div>
            <div style={{ padding: "4px 0" }}>
              {loading ? (
                <div
                  style={{
                    padding: "8px 16px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  Loading...
                </div>
              ) : items.length == 0 ? (
                <div
                  style={{
                    padding: "8px 16px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  No results found
                </div>
              ) : (
                items.map((item) => (
                  <button
                    key={item[valueKey]}
                    type="button"
                    onClick={() => handleItemSelect(item[valueKey])}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: "14px",
                      backgroundColor:
                        value == item[valueKey] ? "#f3e8ff" : "transparent",
                      color: value == item[valueKey] ? "#9333ea" : "#111827",
                      fontWeight: value == item[valueKey] ? "500" : "normal",
                      border: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (value != item[valueKey]) {
                        e.currentTarget.style.backgroundColor = "#faf5ff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (value != item[valueKey]) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {getItemDisplayText(item)}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loadingPayrollBills || loadingHolidays || loadingLeaves) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    );
  }

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
            <p className="text-gray-600 mt-1">
              View and manage attendance records
            </p>
          </div>
        </div>

        {/* Action Buttons - Combined Container */}
        <div className="flex items-center space-x-3">
          {/* Export Excel Button */}
          {filteredRecords.length > 0 && (
            <button
              onClick={handleExportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-600 text-white rounded-lg flex items-center text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </button>
          )}

          {/* Add New Record Button */}
          <Link
            to="/transactions/attendance-management/attendance/attendance-record-entry/create"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Record
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Payroll Bill Dropdown */}
          <CustomDropdown
            label="Payroll Bill"
            value={selectedPayrollBill}
            onChange={setSelectedPayrollBill}
            items={filteredPayrolls}
            displayKey={(item) => `${item.PayBill_Code} - ${item.Description}`}
            valueKey="PRB_id"
            searchTerm={payrollSearch}
            onSearchChange={setPayrollSearch}
            isOpen={isPayrollOpen}
            setIsOpen={setIsPayrollOpen}
            loading={loadingPayrollBills}
            placeholder="Select Payroll Bill"
            dropdownRef={payrollDropdownRef}
            selectedDisplayText={
              selectedPayrollBill ? getSelectedPayrollName() : null
            }
          />

          {/* Month Dropdown - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Year Dropdown - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Year</option>
                {loadingFinancialYears ? (
                  <option>Loading...</option>
                ) : (
                  financialYears.map((fy) => (
                    <option key={fy.FY_Id} value={fy.FY_Code.split("-")[0]}>
                      {fy.FY_Code.split("-")[0]}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Department Dropdown */}
          <CustomDropdown
            label="Department"
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            items={filteredDepartments}
            displayKey="Dpt_Name"
            valueKey="Dpt_id"
            searchTerm={departmentSearch}
            onSearchChange={setDepartmentSearch}
            isOpen={isDepartmentOpen}
            setIsOpen={setIsDepartmentOpen}
            loading={loadingDepartments}
            placeholder="Select Department"
            dropdownRef={departmentDropdownRef}
            selectedDisplayText={
              selectedDepartment ? getSelectedDepartmentName() : null
            }
          />

          {/* Designation Dropdown */}
          <CustomDropdown
            label="Designation"
            value={selectedDesignation}
            onChange={setSelectedDesignation}
            items={filteredDesignations}
            displayKey={(item) => item.Dsg_Desc || item.Dsg_EName || "N/A"}
            valueKey="Dsg_id"
            searchTerm={designationSearch}
            onSearchChange={setDesignationSearch}
            isOpen={isDesignationOpen}
            setIsOpen={setIsDesignationOpen}
            loading={loadingDesignations}
            placeholder="Select Designation"
            dropdownRef={designationDropdownRef}
            selectedDisplayText={
              selectedDesignation ? getSelectedDesignationName() : null
            }
          />

          {/* Employee Dropdown */}
          <CustomDropdown
            label="Employee"
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            items={filteredEmployees}
            displayKey={(item) => item.First_Name || item.Last_Name || ""}
            valueKey="Emp_Id"
            searchTerm={employeeSearch}
            onSearchChange={setEmployeeSearch}
            isOpen={isEmployeeOpen}
            setIsOpen={setIsEmployeeOpen}
            loading={loadingEmployees}
            placeholder="Select Employee"
            dropdownRef={employeeDropdownRef}
            selectedDisplayText={
              selectedEmployee ? getSelectedEmployeeName() : null
            }
          />
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loadingRecords}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingRecords ? (
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
          {filteredRecords.length > 0 && selectedMonth && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    📅 {selectedMonth} {selectedYear}
                  </span>
                  <span className="mx-2">•</span>
                  <span>Total Days: {monthDays.length}</span>
                  <span className="mx-2">•</span>
                  <span>Holidays: {Object.keys(holidayDates).length}</span>
                  <span className="mx-2">•</span>
                  <span>Week-Off Days: {Object.keys(weekOffDates).length}</span>
                  <span className="mx-2">•</span>
                  <span>Showing: {filteredRecords.length} records</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                    P - Present
                  </span>
                  <span className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                    A - Absent
                  </span>
                  <span className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                    H - Holiday
                  </span>
                  <span className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
                    WO - Week Off
                  </span>
                  <span className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                    L - Leave
                  </span>
                  <span className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-1"></span>
                    - - Not Marked
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Table - Day Wise Display */}
          {loadingRecords ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading attendance records...</p>
            </div>
          ) : filteredRecords.length == 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No attendance records found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or click Generate with different
                criteria
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 w-10">
                        <div>Sr.</div>
                        <div className="text-[10px] text-gray-400">Code</div>
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 min-w-[160px]">
                        <div>Employee Name</div>
                        <div className="text-[10px] text-gray-400">
                          Designation
                        </div>
                      </th>
                      {monthDays.map(({ day, weekday }) => (
                        <th
                          key={day}
                          className="px-0.5 py-1 text-center text-xs font-semibold text-gray-600 min-w-[40px]"
                        >
                          <div className="text-xs font-bold">{day}</div>
                          <div className="text-[9px] text-gray-500">
                            {weekday}
                          </div>
                        </th>
                      ))}
                      <th className="px-2 py-2 text-center text-xs font-semibold bg-green-50">
                        P
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-semibold bg-red-50">
                        A
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-semibold bg-yellow-50">
                        L
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-semibold bg-blue-50">
                        H
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-semibold bg-purple-50">
                        WO
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-semibold">
                        Net Days
                      </th>
                      <th className="px-2 py-2 text-center text-xs font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRecords.map((record, index) => {
                      const stats = calculateStatsForRecord(record);
                      const empName = record.employee?.First_Name || "N/A";
                      const empCode =
                        record.employee?.Emp_Code || record.Emp_Id;
                      return (
                        <React.Fragment key={record.EA_id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 py-2">
                              <div className="font-medium text-gray-900 text-xs">
                                {index + 1}
                              </div>
                              <div className="text-[12px] text-gray-500">
                                {empCode}
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              <span className="text-xs font-medium text-gray-900">
                                {empName}
                              </span>
                              <div className="text-[12px] text-gray-500">
                                {record.employee?.designation || "N/A"}
                              </div>
                            </td>
                            {monthDays.map(({ day }) => {
                              const status = getAttendanceStatusForDay(
                                record,
                                day
                              );
                              let bgColor = "bg-gray-100";
                              let textColor = "text-gray-500";
                              let title = "Not Marked";

                              if (status == "P") {
                                bgColor = "bg-green-100";
                                textColor = "text-green-700";
                                title = "Present";
                              } else if (status == "A") {
                                bgColor = "bg-red-100";
                                textColor = "text-red-700";
                                title = "Absent";
                              } else if (status == "L") {
                                bgColor = "bg-yellow-100";
                                textColor = "text-yellow-700";
                                title = `Leave`;
                              } else if (status == "H") {
                                bgColor = "bg-blue-100";
                                textColor = "text-blue-700";
                                title = `Holiday`;
                              } else if (status == "WO") {
                                bgColor = "bg-purple-100";
                                textColor = "text-purple-700";
                                title = "Week Off";
                              }

                              return (
                                <td
                                  key={day}
                                  className="px-0.5 py-1 text-center"
                                >
                                  <div
                                    className={`inline-flex items-center justify-center w-6 h-6 ${bgColor} rounded cursor-help`}
                                    title={title}
                                  >
                                    <span
                                      className={`text-[10px] font-semibold ${textColor}`}
                                    >
                                      {status}
                                    </span>
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-2 py-2 text-center text-xs font-semibold text-green-600">
                              {stats.present}
                            </td>
                            <td className="px-2 py-2 text-center text-xs font-semibold text-red-600">
                              {stats.absent}
                            </td>
                            <td className="px-2 py-2 text-center text-xs font-semibold text-yellow-600">
                              {stats.leave}
                            </td>
                            <td className="px-2 py-2 text-center text-xs font-semibold text-blue-600">
                              {stats.holiday}
                            </td>
                            <td className="px-2 py-2 text-center text-xs font-semibold text-purple-600">
                              {stats.workout}
                            </td>
                            <td className="px-2 py-2 text-center text-xs font-bold text-gray-900">
                              {stats.netDays}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                
<Link
  to={`/transactions/attendance-management/attendance/attendance-record-entry/edit/${
    record.EA_id
  }?${new URLSearchParams({
    payrollBillId: record.payroll?.PRB_id || record.employee?.profile?.PB_Id || selectedPayrollBill || "",
    month: selectedMonth,
    year: selectedYear,
    empId: record.Emp_Id
  }).toString()}`}
  className="p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded"
  title="Edit"
>
  <Edit className="h-3 w-3" />
</Link>
                                <button
                                  onClick={() => toggleRowExpand(record.Emp_Id)}
                                  className="p-1 text-gray-400 hover:text-purple-600 rounded"
                                  title="View Details"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRows[record.Emp_Id] && (
                            <tr className="bg-gray-50">
                              <td
                                colSpan={monthDays.length + 10}
                                className="px-4 py-4"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">
                                      Attendance Summary
                                    </div>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span>Present:</span>
                                        <span className="font-semibold text-green-600">
                                          {stats.present} days
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Absent:</span>
                                        <span className="font-semibold text-red-600">
                                          {stats.absent} days
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Leave:</span>
                                        <span className="font-semibold text-yellow-600">
                                          {stats.leave} days
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Holiday:</span>
                                        <span className="font-semibold text-blue-600">
                                          {stats.holiday} days
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Week Off:</span>
                                        <span className="font-semibold text-purple-600">
                                          {stats.workout} days
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Total Working Hours:</span>
                                        <span className="font-semibold text-blue-600">
                                          {record.total_working_hours || 0} hrs
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">
                                      Employee Details
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div>ID: {record.Emp_Id}</div>
                                      <div>Code: {empCode}</div>
                                      {record.EA_Month && (
                                        <div>
                                          Month: {months[record.EA_Month - 1]}{" "}
                                          {record.Fr_Year}
                                        </div>
                                      )}
                                      <div>
                                        Payroll Bill:{" "}
                                        {record.payroll?.PayBill_Code || "N/A"}
                                      </div>
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
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td
                        colSpan={2}
                        className="px-2 py-2 text-sm font-bold text-gray-900"
                      >
                        GRAND TOTAL
                      </td>
                      {monthDays.map((_, i) => (
                        <td key={i} className="px-0.5 py-2"></td>
                      ))}
                      <td className="px-2 py-2 text-center text-xs font-bold text-green-600">
                        {grandTotals().present}
                      </td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-red-600">
                        {grandTotals().absent}
                      </td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-yellow-600">
                        {grandTotals().leave}
                      </td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-blue-600">
                        {grandTotals().holiday}
                      </td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-purple-600">
                        {grandTotals().workout}
                      </td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-gray-900">
                        {grandTotals().netDays}
                      </td>
                      <td className="px-2 py-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListAttendanceRecord;