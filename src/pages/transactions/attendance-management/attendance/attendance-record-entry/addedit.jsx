
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Download,
  Search,
  Eye,
  Calendar,
  Building2,
  Loader,
  AlertCircle,
  Upload,
  CheckCircle,
} from "lucide-react";

import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import { AttendanceEntryApi } from "../../../../services/attendanceentryapi";

const AddAttendanceRecord = () => {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedPayrollBill, setSelectedPayrollBill] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [attendanceOverrides, setAttendanceOverrides] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [loadingExistingAttendance, setLoadingExistingAttendance] = useState(false);
  const [existingAttendanceMap, setExistingAttendanceMap] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const [payrollBills, setPayrollBills] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [employeeWeekOffDates, setEmployeeWeekOffDates] = useState({});
  // Raw woff_pattern per employee — used to recompute week-offs on month/year change
  const [employeeWoffPatterns, setEmployeeWoffPatterns] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [holidayDates, setHolidayDates] = useState({});
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [leaveDates, setLeaveDates] = useState({});
  const [loadingPayrollBills, setLoadingPayrollBills] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingFinancialYears, setLoadingFinancialYears] = useState(false);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonthWithWeekdays = (month, year) => {
    const monthIndex = months.indexOf(month);
    const daysCount = new Date(year, monthIndex + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysCount; i++) {
      const date = new Date(year, monthIndex, i);
      const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
      days.push({ day: i, weekday: weekday, date: date });
    }
    return days;
  };

  // Use current year as fallback so initial render is always correct
  const currentCalendarYear = new Date().getFullYear();
  const monthDays = useMemo(
    () => getDaysInMonthWithWeekdays(selectedMonth, parseInt(selectedYear) || currentCalendarYear),
    [selectedMonth, selectedYear]
  );

  /**
   * Calculate week-off dates for a given month/year from a woff_pattern.
   *
   * API response shape:  woffPattern.weeks  — array of 6 arrays, each with 7 values.
   * Day column order: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
   * Value 1 = week-off, 0 = working day.
   *
   * Week-of-month mapping (pattern repeats same template every month):
   *   Week 1 → calendar days  1–7
   *   Week 2 → calendar days  8–14
   *   Week 3 → calendar days 15–21
   *   Week 4 → calendar days 22–28
   *   Week 5 → calendar days 29–35  (if month has them)
   *   Week 6 → calendar days 36–42  (if month has them)
   *
   * JS Date.getDay(): Sun=0, Mon=1 … Sat=6
   * Convert to Mon-based index: (jsDay + 6) % 7  →  Mon=0 … Sun=6
   */
  const calculateWeekOffDatesFromPattern = (woffPattern, month, year) => {
    // Resolve the weeks array — handle all possible shapes the API might return
    let weeks = null;

    if (Array.isArray(woffPattern?.weeks)) {
      // Shape: { weeks: [[...], ...] }  ← direct from /emp-attendance/all
      weeks = woffPattern.weeks;
    } else if (Array.isArray(woffPattern?.pattern_data?.weeks)) {
      // Shape: { pattern_data: { weeks: [[...], ...] } }
      weeks = woffPattern.pattern_data.weeks;
    } else if (Array.isArray(woffPattern?.pattern_data?.days)) {
      // Shape: { pattern_data: { days: [...42 flat] } }  ← from woff-master
      // Convert flat array → array of 6 arrays of 7
      const flat = woffPattern.pattern_data.days;
      weeks = [];
      for (let w = 0; w < 6; w++) {
        weeks.push(flat.slice(w * 7, w * 7 + 7));
      }
    } else if (Array.isArray(woffPattern?.days)) {
      // Shape: { days: [...42 flat] }
      const flat = woffPattern.days;
      weeks = [];
      for (let w = 0; w < 6; w++) {
        weeks.push(flat.slice(w * 7, w * 7 + 7));
      }
    }

    if (!weeks || weeks.length == 0) return {};

    const monthIndex = months.indexOf(month);
    const yearNum = parseInt(year);
    const daysCount = new Date(yearNum, monthIndex + 1, 0).getDate();
    const weekOffMap = {};

    for (let date = 1; date <= daysCount; date++) {
      const jsDate = new Date(yearNum, monthIndex, date);
      const jsDay = jsDate.getDay();           // Sun=0, Mon=1 … Sat=6
      const colIndex = (jsDay + 6) % 7;        // Mon=0, Tue=1 … Sun=6

      // Which week-row of the pattern: days 1-7 → row 0, 8-14 → row 1, etc.
      const rowIndex = Math.floor((date - 1) / 7);

      if (rowIndex < weeks.length && weeks[rowIndex][colIndex] == 1) {
        weekOffMap[date] = "WO";
      }
    }

    return weekOffMap;
  };

  const calculateHolidayDates = (holidaysList, month, year) => {
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

  const calculateLeaveDates = (leavesList, month, year) => {
  const monthIndex = months.indexOf(month);
  const leaveMap = {};
  
  leavesList.forEach((leave) => {
    const empId = leave.Emp_Id;
    // API response se exact Fr_Date aur To_Date
    const fromDate = new Date(leave.Fr_Date);
    const toDate = new Date(leave.To_Date);
    
    // Selected month ki first aur last date (time component hatao)
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
    
    // Remove time component for accurate comparison
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);
    
    // Check if leave overlaps with selected month
    if (fromDate <= lastDayOfMonth && toDate >= firstDayOfMonth) {
      // Month ke saare days check karo
      const daysCount = lastDayOfMonth.getDate();
      
      for (let day = 1; day <= daysCount; day++) {
        const currentDate = new Date(year, monthIndex, day);
        currentDate.setHours(0, 0, 0, 0);
        
        // Exact Fr_Date se To_Date tak ke beech mein hai?
        if (currentDate >= fromDate && currentDate <= toDate) {
          if (!leaveMap[empId]) leaveMap[empId] = {};
          
          leaveMap[empId][day] = {
            status: "L",
            leaveType: leave.leave_type?.LT_name || "Leave",
            fromDate: leave.Fr_Date,
            toDate: leave.To_Date,
            reason: leave.Reason,
            totalDays: leave.Tot_Days,
            isEditable: true,
          };
        }
      }
    }
  });
  
  return leaveMap;
};

const fetchEmployeesAndAttendance = useCallback(async (prbId) => {
  if (!prbId || !selectedYear || !selectedMonth) return;

  setLoadingEmployees(true);
  setLoadingExistingAttendance(true);
  try {
    const monthNumber = months.indexOf(selectedMonth) + 1;
    const year = parseInt(selectedYear);

    // ✅ NEW: Use payroll report API (gives employees + week-offs in one call)
    const payrollReport = await AttendanceEntryApi.getEmployeesByPayrollBill(prbId);
    
    // Get saved attendance separately (existing API)
    const monthAttendanceResponse = await AttendanceEntryApi.getAttendanceList(monthNumber, year);

    // ── Process payroll report data ──────────────────────────
    const employeesList = payrollReport;
    const weekOffMap = {};
    const rawPatterns = {};

    employeesList.forEach(employee => {
      const empId = employee.Emp_Id;
      
      // ✅ NEW: Extract week-off pattern from payroll report
      const weekOffPattern = employee.week_off_pattern;
      
      if (weekOffPattern && weekOffPattern.pattern_data) {
        rawPatterns[empId] = weekOffPattern;
        
        // ✅ NEW: Use pre-calculated week-off dates from API
        const weekOffDatesList = weekOffPattern.week_off_dates || [];
        const weekOffMapForEmployee = {};
        
        weekOffDatesList.forEach(dateStr => {
          const date = new Date(dateStr);
          const day = date.getDate();
          weekOffMapForEmployee[day] = "WO";
        });
        
        weekOffMap[empId] = weekOffMapForEmployee;
      } else {
        weekOffMap[empId] = {};
      }
    });

    // ── Process saved attendance data (same as before) ────────
    const attendanceMap = {};
    const toRecords = (response) => {
      if (!response?.data) return [];
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.data?.data)) return response.data.data;
      return [];
    };

    const monthRecords = toRecords(monthAttendanceResponse);
    
    monthRecords
      .filter(record => record.PRB_id == parseInt(prbId))
      .forEach(record => {
        (record.employees || []).forEach(empData => {
          const empId = empData.employee?.Emp_Id;
          if (!empId) return;
          (empData.days || []).forEach(dayData => {
            attendanceMap[`${empId}_${dayData.day}`] = dayData.status;
          });
        });
      });

    setEmployeeWoffPatterns(rawPatterns);
    setEmployeeWeekOffDates(weekOffMap);
    setExistingAttendanceMap(attendanceMap);
    setEmployees(employeesList);
    
  } catch (err) {
    console.error("Error fetching employees/attendance:", err);
    toast.error("Error loading employees: " + (err.message || "Unknown error"));
    setEmployees([]);
    setEmployeeWoffPatterns({});
    setEmployeeWeekOffDates({});
    setExistingAttendanceMap({});
  } finally {
    setLoadingEmployees(false);
    setLoadingExistingAttendance(false);
  }
}, [selectedYear, selectedMonth]);

  useEffect(() => {
    const loadMasterData = async () => {
      setLoadingPayrollBills(true);
      setLoadingFinancialYears(true);
      setLoadingHolidays(true);
      setLoadingLeaves(true);
      
      try {
        const years = await AttendanceEntryApi.getFinancialYears();
        setFinancialYears(years);
        const currentYear = years.find((fy) => fy.is_current_year == true);
        if (currentYear) {
          setSelectedYear(currentYear.FY_Code.split("-")[0]);
        } else if (years.length > 0) {
          setSelectedYear(years[0].FY_Code.split("-")[0]);
        }
        
        const bills = await AttendanceEntryApi.getPayrollBills();
        setPayrollBills(bills);
        
        const holidaysList = await AttendanceEntryApi.getHolidays();
        setHolidays(holidaysList);
        
        const leavesList = await AttendanceEntryApi.getLeaveApplications();
        setLeaveApplications(leavesList);
        
      } catch (err) {
        console.error("Error loading master data:", err);
        setError("Error loading master data");
      } finally {
        setLoadingPayrollBills(false);
        setLoadingFinancialYears(false);
        setLoadingHolidays(false);
        setLoadingLeaves(false);
      }
    };
    
    loadMasterData();
  }, []);

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

  // Recompute week-off dates from stored raw patterns whenever month/year changes.
  // This ensures week-offs are correct for every month without a new API call.
  useEffect(() => {
    if (Object.keys(employeeWoffPatterns).length == 0) return;
    const newWeekOffMap = {};
    employees.forEach(employee => {
      const empId = employee.Emp_Id;
      const pattern = employeeWoffPatterns[empId];
      newWeekOffMap[empId] = pattern
        ? calculateWeekOffDatesFromPattern(pattern, selectedMonth, selectedYear)
        : {};
    });
    setEmployeeWeekOffDates(newWeekOffMap);
  }, [selectedMonth, selectedYear, employeeWoffPatterns, employees]);

  useEffect(() => {
    if (selectedPayrollBill && selectedYear && selectedMonth) {
      fetchEmployeesAndAttendance(selectedPayrollBill);
    }
  }, [selectedPayrollBill, selectedYear, selectedMonth, refreshKey, fetchEmployeesAndAttendance]);

  const handlePayrollBillChange = (e) => {
    const prbId = e.target.value;
    setSelectedPayrollBill(prbId);
    setSearchTerm("");
    setExpandedRows({});
    setAttendanceOverrides({});
    setExistingAttendanceMap({});
    setEmployeeWoffPatterns({});
    setEmployeeWeekOffDates({});
  };

  const handleAttendanceStatusChange = (employeeId, day, newStatus) => {
    setAttendanceOverrides((prev) => ({
      ...prev,
      [`${employeeId}_${day}`]: newStatus,
    }));
  };

  const handleAllPresentChange = (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      const newOverrides = {};
      employees.forEach((employee) => {
        monthDays.forEach(({ day }) => {
          const key = `${employee.Emp_Id}_${day}`;
          const currentStatus = getAttendanceStatus(employee.Emp_Id, day).status;
          if (currentStatus == "-") {
            newOverrides[key] = "P";
          }
        });
      });
      setAttendanceOverrides((prev) => ({ ...prev, ...newOverrides }));
      toast.success("Marked all unmarked days as Present");
    } else {
      setAttendanceOverrides((prev) => {
        const newOverrides = { ...prev };
        employees.forEach((employee) => {
          monthDays.forEach(({ day }) => {
            const key = `${employee.Emp_Id}_${day}`;
            const overrideStatus = newOverrides[key];
            if (overrideStatus == "P") {
              const hasExisting = existingAttendanceMap[key];
              const hasLeave = leaveDates[employee.Emp_Id]?.[day];
              const isHoliday = holidayDates[day];
              const isWeekOff = employeeWeekOffDates[employee.Emp_Id]?.[day];
              if (!hasExisting && !hasLeave && !isHoliday && !isWeekOff) {
                delete newOverrides[key];
              }
            }
          });
        });
        return newOverrides;
      });
      toast.success("Reverted All Present changes");
    }
  };

  const getAttendanceStatus = (employeeId, date) => {
    const overrideKey = `${employeeId}_${date}`;
  
    if (attendanceOverrides[overrideKey]) {
      const status = attendanceOverrides[overrideKey];
      return {
        status: status,
        holidayInfo: null,
        leaveInfo: null,
        isEditable: status != "H" && status != "WO",
      };
    }
  
    if (holidayDates[date]) {
      return {
        status: "H",
        holidayInfo: holidayDates[date],
        leaveInfo: null,
        isEditable: false,
      };
    }
  
    if (employeeWeekOffDates[employeeId] && employeeWeekOffDates[employeeId][date]) {
      return {
        status: "WO",
        holidayInfo: null,
        leaveInfo: null,
        isEditable: false,
      };
    }
  
    if (leaveDates[employeeId] && leaveDates[employeeId][date]) {
      return {
        status: "L",
        holidayInfo: null,
        leaveInfo: leaveDates[employeeId][date],
        isEditable: true,
      };
    }
  
    if (existingAttendanceMap[overrideKey]) {
      return {
        status: existingAttendanceMap[overrideKey],
        holidayInfo: null,
        leaveInfo: null,
        isEditable: true,
      };
    }
  
    return {
      status: "-",
      holidayInfo: null,
      leaveInfo: null,
      isEditable: true,
    };
  };

  const calculateStats = (employeeId) => {
    let present = 0, absent = 0, leave = 0;
    monthDays.forEach(({ day }) => {
      const { status } = getAttendanceStatus(employeeId, day);
      if (status == "P") present++;
      else if (status == "A") absent++;
      else if (status == "L") leave++;
    });
    // Count only holidays that fall within the employee's employment period
    const employee = employees.find(e => e.Emp_Id == employeeId);
    const joinDate = employee?.joinDate ? new Date(employee.joinDate) : null;
    const holiday = Object.keys(holidayDates).filter(day => {
      if (!joinDate) return true;
      const holidayFullDate = new Date(parseInt(selectedYear), months.indexOf(selectedMonth), parseInt(day));
      return holidayFullDate >= joinDate;
    }).length;
    const workout = Object.keys(employeeWeekOffDates[employeeId] || {}).length;
    const netDays = present + leave + holiday + workout;
    return { present, absent, leave, holiday, workout, netDays };
  };

  const filteredEmployees = useMemo(
    () =>
      employees.filter(
        (emp) =>
          searchTerm == "" ||
          emp.Emp_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.Emp_Id?.toString().includes(searchTerm)
      ),
    [employees, searchTerm]
  );

  // Compute grand totals once per render, not twice
  const grandTotals = useMemo(() => {
    let totalPresent = 0, totalAbsent = 0, totalLeave = 0, totalWorkout = 0;
    filteredEmployees.forEach((employee) => {
      const stats = calculateStats(employee.Emp_Id);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEmployees, attendanceOverrides, existingAttendanceMap, holidayDates, employeeWeekOffDates, leaveDates]);

  // Derive allPresent from actual state so the checkbox stays in sync
  // when the user manually edits individual cells
  const isAllPresent = useMemo(() => {
    if (employees.length == 0) return false;
    return employees.every(employee =>
      monthDays.every(({ day }) => {
        const { status } = getAttendanceStatus(employee.Emp_Id, day);
        return status == "P" || status == "H" || status == "WO" || status == "L";
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, monthDays, attendanceOverrides, existingAttendanceMap, holidayDates, employeeWeekOffDates, leaveDates]);

  const toggleRowExpand = (empId) => {
    setExpandedRows((prev) => ({ ...prev, [empId]: !prev[empId] }));
  };

  const buildAttendanceData = (employeeId) => {
    const attendanceDays = [];

    for (let day = 1; day <= monthDays.length; day++) {
      const key = `${employeeId}_${day}`;

      // Skip holidays and week-offs — they are never saved as attendance records
      if (holidayDates[day] || employeeWeekOffDates[employeeId]?.[day]) {
        continue;
      }

      const existingStatus = existingAttendanceMap[key] || null;
      const overrideStatus = attendanceOverrides[key] || null;
      const leaveStatus = leaveDates[employeeId]?.[day] ? "L" : null;

      // Determine the effective status the user intends to save
      const effectiveStatus = overrideStatus || existingStatus || leaveStatus;

      if (!effectiveStatus || effectiveStatus == "-") continue;

      // Only include in payload if there is an actual change vs what's already saved,
      // OR if it's a leave day that hasn't been saved yet.
      const isChanged = overrideStatus && overrideStatus != existingStatus;
      const isNewLeave = leaveStatus && !existingStatus && !overrideStatus;

      if (!isChanged && !isNewLeave && existingStatus) continue;

      if (effectiveStatus == "P" || effectiveStatus == "A" || effectiveStatus == "L") {
        attendanceDays.push({
          day: day,
          shift: "General",
          in_time: effectiveStatus == "P" ? "09:00" : null,
          out_time: effectiveStatus == "P" ? "18:00" : null,
          duration: effectiveStatus == "P" ? "09:00" : "00:00",
          status: effectiveStatus,
        });
      }
    }

    return attendanceDays;
  };

  const handleSaveAttendance = async () => {
    const employeesWithChanges = new Set();

    Object.keys(attendanceOverrides).forEach((key) => {
      const [empId] = key.split("_");
      const existingStatus = existingAttendanceMap[key];
      const newStatus = attendanceOverrides[key];
      if (existingStatus != newStatus) {
        employeesWithChanges.add(parseInt(empId));
      }
    });

    if (employeesWithChanges.size == 0) {
      toast.error("No changes to save");
      return;
    }

    setSavingAttendance(true);
    try {
      const monthIndex = months.indexOf(selectedMonth) + 1;
      const year = parseInt(selectedYear);
      const prbId = parseInt(selectedPayrollBill);

      const attendanceDataArray = [];

      for (const empId of employeesWithChanges) {
        const days = buildAttendanceData(empId);
        if (days.length > 0) {
          attendanceDataArray.push({ Emp_Id: empId, days: days });
        }
      }

      if (attendanceDataArray.length == 0) {
        toast.error("No valid attendance changes to save (changes may only affect holidays or week-offs)");
        setSavingAttendance(false);
        return;
      }

      const payload = {
        EA_Code: `ATT_${selectedMonth.toUpperCase().substring(0, 3)}_${year}`,
        EA_Month: monthIndex,
        Fr_Year: year.toString(),
        PRB_id: prbId,
        attendance_data: attendanceDataArray,
        Status: 1,
      };

      const result = await AttendanceEntryApi.saveAttendance(payload);

      if (result.success) {
        toast.success(`Successfully saved attendance for ${attendanceDataArray.length} employee(s)!`);
        setAttendanceOverrides({});
        setTimeout(() => {
          setRefreshKey((prev) => prev + 1);
        }, 500);
      } else {
        toast.error(result.message || "Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error(error.message || "Error saving attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const parseExcelAttendance = (worksheet) => {
    const daysCount = monthDays.length;
    const attendanceRecords = [];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", blankrows: true });

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      if (!row || row.length == 0) continue;
      
      const firstCell = row[0] ? String(row[0]).toLowerCase().trim() : "";
      
      if (firstCell == "status") {
        let empId = null;
        for (let i = rowIndex - 1; i >= Math.max(0, rowIndex - 15); i--) {
          const checkRow = data[i];
          if (checkRow && checkRow[0]) {
            const checkFirstCell = String(checkRow[0]).toLowerCase().trim();
            if (checkFirstCell == "employee id") {
              const idValue = checkRow[1];
              if (idValue && idValue != "") {
                empId = parseInt(idValue);
                if (!isNaN(empId) && empId > 0) {
                }
              }
              break;
            }
          }
        }
        
        if (empId) {
          const attendanceData = [];
          for (let day = 0; day < daysCount; day++) {
            const colIndex = 1 + day;
            let cellValue = colIndex < row.length ? row[colIndex] : "";
            let cleanValue = cellValue != undefined && cellValue != null && cellValue != "" ? String(cellValue).trim() : "";
            let status = null;
            
            if (cleanValue == "P" || cleanValue == "WOP") {
              status = "P";
            } else if (cleanValue == "") {
              status = "A";
            } else {
              continue;
            }
            attendanceData.push({ day: day + 1, status: status });
          }
          attendanceRecords.push({ empId: empId, attendance: attendanceData });
        }
      }
    }
    
    return attendanceRecords;
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx, .xls";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setImporting(true);
      
      try {
        const fileData = await file.arrayBuffer();
        const workbook = XLSX.read(fileData);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const attendanceRecords = parseExcelAttendance(worksheet);
        
        if (attendanceRecords.length == 0) {
          toast.error(`No attendance data found in the file. Selected: ${selectedMonth} ${selectedYear}`);
          setImporting(false);
          return;
        }
        
        const newOverrides = {};
        
        attendanceRecords.forEach((record) => {
          const matchedEmployee = employees.find((emp) => emp.Emp_Id == record.empId);
          
          if (matchedEmployee) {
            record.attendance.forEach(({ day, status }) => {
              if (!holidayDates[day] && !(employeeWeekOffDates[record.empId] && employeeWeekOffDates[record.empId][day])) {
                const overrideKey = `${record.empId}_${day}`;
                newOverrides[overrideKey] = status;
              }
            });
          }
        });
        
        setAttendanceOverrides((prev) => ({ ...prev, ...newOverrides }));
        toast.success("Import complete! Click 'Save Changes' to store the data.");
      } catch (error) {
        console.error("Error importing file:", error);
        toast.error("Error importing file: " + error.message);
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

  const handleExportToExcel = () => {
    const excelData = [
      ["Sr.", "Employee Code", "Employee Name", ...monthDays.map((d) => `${d.day}/${d.weekday}`), "P", "A", "L", "H", "WO", "Net Days"],
    ];
    filteredEmployees.forEach((emp, idx) => {
      const stats = calculateStats(emp.Emp_Id);
      excelData.push([
        idx + 1,
        emp.Emp_Id,
        emp.Emp_Name,
        ...monthDays.map(({ day }) => getAttendanceStatus(emp.Emp_Id, day).status),
        stats.present,
        stats.absent,
        stats.leave,
        stats.holiday,
        stats.workout,
        stats.netDays,
      ]);
    });
    const totals = grandTotals;
    excelData.push([
      "GRAND TOTAL", "", "", ...monthDays.map(() => ""),
      totals.present, totals.absent, totals.leave, totals.holiday, totals.workout, totals.netDays,
    ]);
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Attendance_${selectedMonth}_${selectedYear}`);
    XLSX.writeFile(wb, `Attendance_${selectedMonth}_${selectedYear}.xlsx`);
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/transactions/attendance-management/attendance/attendance-record-entry")}
            className="mr-4 text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Attendance Register</h1>
            <p className="text-gray-600 mt-1">Track and manage employee attendance records</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleExportToExcel} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          <button onClick={handleImport} disabled={importing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50">
            {importing ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Import Excel
          </button>
          <button onClick={handleSaveAttendance} disabled={savingAttendance || loadingExistingAttendance} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center disabled:opacity-50">
            {savingAttendance ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Payroll Bill <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedPayrollBill}
                onChange={handlePayrollBillChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Payroll Bill</option>
                {payrollBills.map((bill) => (
                  <option key={bill.PRB_id} value={bill.PRB_id}>
                    {bill.PayBill_Code} - {bill.Description}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedPayrollBill && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Employees: {employees.length}</span>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
      </div>

      {selectedPayrollBill && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
                    {months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
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
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input type="text" placeholder="Search by name or code" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-64" />
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <input type="checkbox" id="allPresent" checked={isAllPresent} onChange={handleAllPresentChange} className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                  <label htmlFor="allPresent" className="text-sm font-medium text-gray-700 cursor-pointer select-none">All Present</label>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <span className="flex items-center"><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>P - Present</span>
                <span className="flex items-center"><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>A - Absent</span>
                <span className="flex items-center"><span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>H - Holiday</span>
                <span className="flex items-center"><span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>WO - Week Off</span>
                <span className="flex items-center"><span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>L - Leave</span>
                <span className="flex items-center"><span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-1"></span>- - Not Marked</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">📅 {selectedMonth} {selectedYear}</span>
              <span className="mx-2">•</span>
              <span>Total Days: {monthDays.length}</span>
              <span className="mx-2">•</span>
              <span>Holidays: {Object.keys(holidayDates).length}</span>
              <span className="mx-2">•</span>
              <span>Showing: {filteredEmployees.length} employees</span>
              {loadingExistingAttendance && (
                <span className="ml-2 text-purple-600"><Loader className="h-3 w-3 inline animate-spin mr-1" />Loading saved data...</span>
              )}
              {isAllPresent && (
                <span className="ml-2 text-green-600"><CheckCircle className="h-3 w-3 inline mr-1" />All Present mode active</span>
              )}
            </div>
          </div>

          {loadingEmployees ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading employees...</p>
            </div>
          ) : filteredEmployees.length == 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {employees.length == 0 ? "No Employees Found" : "No Results"}
              </h3>
              <p className="text-gray-600">
                {employees.length == 0
                  ? "No employees are assigned to this payroll bill."
                  : "No employees match your search criteria."}
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
                        <div className="text-[10px] text-gray-400">Designation</div>
                      </th>
                      {monthDays.map(({ day, weekday }) => (
                        <th key={day} className="px-0.5 py-1 text-center text-xs font-semibold text-gray-600 min-w-[40px]">
                          <div className="text-xs font-bold">{day}</div>
                          <div className="text-[9px] text-gray-500">{weekday}</div>
                        </th>
                      ))}
                      <th className="px-2 py-2 text-center text-xs font-semibold bg-green-50">P</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold bg-red-50">A</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold bg-yellow-50">L</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold bg-blue-50">H</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold bg-purple-50">WO</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold">Net Days</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEmployees.map((employee, index) => {
                      const stats = calculateStats(employee.Emp_Id);
                      const hasOverrides = Object.keys(attendanceOverrides).some((key) => key.startsWith(`${employee.Emp_Id}_`));
                      return (
                        <React.Fragment key={employee.Emp_Id}>
                          <tr className={`hover:bg-gray-50 ${hasOverrides ? "bg-yellow-50" : ""}`}>
                            <td className="px-2 py-2">
                              <div className="font-medium text-gray-900 text-xs">{index + 1}</div>
                              <div className="text-[12px] text-gray-500">{employee.Emp_Id}</div>
                            </td>
                            <td className="px-2 py-2">
                              <span className="text-xs font-medium text-gray-900">  {employee.Emp_Name.replace(/[^a-zA-Z\s]/g, '').trim()}</span>
                              <div className="text-[12px] text-gray-500">{employee.designation}</div>
                            </td>
                            {monthDays.map(({ day }) => {
                              const { status, holidayInfo, leaveInfo, isEditable } = getAttendanceStatus(employee.Emp_Id, day);
                              const hasOverride = attendanceOverrides[`${employee.Emp_Id}_${day}`];
                              const bgColor = status == "P" ? "bg-green-100" : status == "A" ? "bg-red-100" : status == "L" ? "bg-yellow-100" : status == "H" ? "bg-blue-100" : status == "WO" ? "bg-purple-100" : status == "-" ? "bg-gray-100" : "";
                              const textColor = status == "P" ? "text-green-700" : status == "A" ? "text-red-700" : status == "L" ? "text-yellow-700" : status == "H" ? "text-blue-700" : status == "WO" ? "text-purple-700" : status == "-" ? "text-gray-500" : "";
                              const isLocked = holidayDates[day] || (employeeWeekOffDates[employee.Emp_Id] && employeeWeekOffDates[employee.Emp_Id][day]);
                              
                              return (
                                <td key={day} className={`px-0.5 py-1 text-center relative group ${hasOverride ? "ring-1 ring-yellow-400" : ""}`}>
                                  {isEditable && !isLocked ? (
                                    <select
                                      value={status}
                                      onChange={(e) => handleAttendanceStatusChange(employee.Emp_Id, day, e.target.value)}
                                      className={`inline-flex items-center justify-center w-12 h-6 ${bgColor} ${textColor} rounded text-[10px] font-semibold cursor-pointer border-0 focus:ring-1 focus:ring-purple-500 appearance-none text-center px-1`}
                                    >
                                      <option value="-">-</option>
                                      <option value="P">P</option>
                                      <option value="A">A</option>
                                      {leaveDates[employee.Emp_Id]?.[day] && <option value="L">L</option>}
                                    </select>
                                  ) : (
                                    <div className={`inline-flex items-center justify-center w-6 h-6 ${bgColor} rounded`} title={holidayInfo?.name || (status == "L" && leaveInfo?.leaveType) || (status == "WO" && "Week Off") || (status == "H" && "Holiday")}>
                                      <span className={`text-[10px] font-semibold ${textColor}`}>{status}</span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-2 py-2 text-center text-xs font-semibold text-green-600">{stats.present}</td>
                            <td className="px-2 py-2 text-center text-xs font-semibold text-red-600">{stats.absent}</td>
                            <td className="px-2 py-2 text-center text-xs font-semibold text-yellow-600">{stats.leave}</td>
                            <td className="px-2 py-2 text-center text-xs font-semibold text-blue-600">{stats.holiday}</td>
                            <td className="px-2 py-2 text-center text-xs font-semibold text-purple-600">{stats.workout}</td>
                            <td className="px-2 py-2 text-center text-xs font-bold text-gray-900">{stats.netDays}</td>
                            <td className="px-2 py-2 text-center">
                              <button onClick={() => toggleRowExpand(employee.Emp_Id)} className="p-0.5 text-gray-400 hover:text-purple-600">
                                <Eye className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                          {expandedRows[employee.Emp_Id] && (
                            <tr className="bg-gray-50">
                              <td colSpan={monthDays.length + 10} className="px-4 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Attendance Summary</div>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between"><span>Present:</span><span className="font-semibold text-green-600">{stats.present} days</span></div>
                                      <div className="flex justify-between"><span>Absent:</span><span className="font-semibold text-red-600">{stats.absent} days</span></div>
                                      <div className="flex justify-between"><span>Leave:</span><span className="font-semibold text-yellow-600">{stats.leave} days</span></div>
                                      <div className="flex justify-between"><span>Holiday:</span><span className="font-semibold text-blue-600">{stats.holiday} days</span></div>
                                      <div className="flex justify-between"><span>Week Off:</span><span className="font-semibold text-purple-600">{stats.workout} days</span></div>
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Employee Details</div>
                                    <div className="text-sm text-gray-600">ID: {employee.Emp_Id}</div>
                                    <div className="text-sm text-gray-600">Basic: ₹{parseFloat(employee.basic).toLocaleString()}</div>
                                    {employee.joinDate && <div className="text-sm text-gray-600">Join Date: {new Date(employee.joinDate).toLocaleDateString()}</div>}
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
                      <td colSpan={2} className="px-2 py-2 text-sm font-bold text-gray-900">GRAND TOTAL</td>
                      {monthDays.map((_, i) => <td key={i} className="px-0.5 py-2"></td>)}
                      <td className="px-2 py-2 text-center text-xs font-bold text-green-600">{grandTotals.present}</td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-red-600">{grandTotals.absent}</td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-yellow-600">{grandTotals.leave}</td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-blue-600">{grandTotals.holiday}</td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-purple-600">{grandTotals.workout}</td>
                      <td className="px-2 py-2 text-center text-xs font-bold text-gray-900">{grandTotals.netDays}</td>
                      <td className="px-2 py-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!selectedPayrollBill && !loadingPayrollBills && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Bill Selected</h3>
          <p className="text-gray-600">Please select a payroll bill to view attendance records</p>
        </div>
      )}
    </div>
  );
};

export default AddAttendanceRecord;
