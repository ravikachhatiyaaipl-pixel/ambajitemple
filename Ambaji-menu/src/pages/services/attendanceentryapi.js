// services/attendanceentryapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const AttendanceEntryApi = {
  // Get list of attendance records with filters - GET: /api/emp-attendance/all
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-attendance/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || "",
          month: params.month || "",
          year: params.year || "",
          emp_id: params.emp_id || "",
          department_id: params.department_id || "",
          designation_id: params.designation_id || "",
          paybill_id: params.paybill_id || "",
        },
      });

      // Handle different response structures
      let dataArray = [];
      let metaData = {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
      };

      if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
          dataArray = response.data.data;
          metaData = {
            current_page: response.data.current_page || 1,
            last_page: response.data.last_page || 1,
            per_page: response.data.per_page || 10,
            total: response.data.total || 0,
            from: response.data.from || 0,
            to: response.data.to || 0,
          };
        } else if (
          response.data.data.data &&
          Array.isArray(response.data.data.data)
        ) {
          dataArray = response.data.data.data;
          metaData = {
            current_page: response.data.data.current_page || 1,
            last_page: response.data.data.last_page || 1,
            per_page: response.data.data.per_page || 10,
            total: response.data.data.total || 0,
            from: response.data.data.from || 0,
            to: response.data.data.to || 0,
          };
        }
      } else if (Array.isArray(response.data)) {
        dataArray = response.data;
      }

      return {
        success: true,
        data: dataArray,
        meta: metaData,
      };
    } catch (error) {
      console.error("Error fetching Attendance Records:", error);
      return {
        success: false,
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
        },
      };
    }
  },

  // Get attendance list with all filters using the correct endpoint
  getAttendanceListWithFilters: async (filters = {}) => {
    try {
      // Build params object with all filter parameters
      const params = {};

      // Search filter
      if (filters.search) params.search = filters.search;

      // Month filter (1-12)
      if (filters.month) params.month = filters.month;

      // Year filter
      if (filters.year) params.year = filters.year;

      // Employee ID filter
      if (filters.emp_id) params.emp_id = filters.emp_id;

      // Department ID filter
      if (filters.department_id) params.department_id = filters.department_id;

      // Designation ID filter
      if (filters.designation_id)
        params.designation_id = filters.designation_id;

      // Paybill ID filter
      if (filters.paybill_id) params.paybill_id = filters.paybill_id;

      // Pagination
      params.per_page = filters.per_page || 10000;
      params.page = filters.page || 1;

      console.log("Fetching attendance with filters:", params);
      const response = await axios.get(`${API_BASE_URL}/emp-attendance/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching attendance list with filters:", error);
      throw error;
    }
  },

  // Get attendance list with month and year filters (for add/edit page)
  getAttendanceList: async (month = null, year = null) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;


      params.per_page = 10000;

      console.log("Fetching attendance with month/year:", params);
      const response = await axios.get(`${API_BASE_URL}/emp-attendance/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance list:", error);
      throw error;
    }
  },

  // Get single attendance record by ID - GET: /emp-attendance/{id}
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-attendance/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance record ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Create new attendance record - POST: /emp-attendance
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emp-attendance`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error creating attendance record:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update existing attendance record - PUT: /emp-attendance/{id}
  update: async (id, data) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/emp-attendance/${id}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error(`Error updating attendance record ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete attendance record - DELETE: /emp-attendance/{id}
  delete: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/emp-attendance/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error(`Error deleting attendance record ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Save attendance record (POST to /emp-attendance)
  saveAttendance: async (payload) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/emp-attendance`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      return {
        success: response.data.success || true,
        message: response.data.message || "Attendance saved successfully",
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error saving attendance:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Error saving attendance",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get employees by payroll bill - GET: /emp-payroll-report/{prbId}
getEmployeesByPayrollBill: async (prbId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/emp-payroll-report/${prbId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    console.log("Payroll bill API response:", response.data);

    let employeesData = [];

    if (response.data.success && response.data.data) {
      if (response.data.data.employees && Array.isArray(response.data.data.employees)) {
        employeesData = response.data.data.employees;
      } else if (Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      }
    } else if (Array.isArray(response.data)) {
      employeesData = response.data;
    }

    console.log("Raw employees data:", employeesData);

    // ✅ NEW: Transform employees data with week-off pattern
    const transformedEmployees = employeesData.map((emp) => ({
      Emp_Id: emp.Emp_Id,
      Emp_Name: emp.Emp_Name || `${emp.First_Name || ''} ${emp.Last_Name || ''}`.trim(),
      Emp_Code: emp.Emp_Code || emp.Emp_Id,
      designation: emp.profile?.Designation || emp.designation || "N/A",
      department: emp.profile?.Department || emp.department || "Other",
      basic: emp.profile?.Basic || "0",
      joinDate: emp.profile?.Join_Date || null,
      First_Name: emp.First_Name,
      Last_Name: emp.Last_Name,
      // ✅ NEW: week_off_pattern from payroll report
      week_off_pattern: emp.week_off_pattern || null,
      WOP_id: emp.profile?.WOP_id || emp.WOP_id || null,
      // ✅ NEW: attendance summary with week-off dates
      attendance_summary: emp.attendance_summary || null,
      daily_attendance: emp.daily_attendance || null,
    }));

    console.log("Transformed employees:", transformedEmployees);
    return transformedEmployees;
    
  } catch (error) {
    console.error("Error fetching employees by payroll bill:", error);
    throw error.response?.data || error.message;
  }
},

  // Get financial years - GET: /fy-master
  getFinancialYears: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fy-master`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching financial years:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get payroll bills - GET: /payroll-bill/all
  getPayrollBills: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll-bill/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching payroll bills:", error);
      throw error.response?.data || error.message;
    }
  },

  // Add this method to AttendanceEntryApi in attendanceentryapi.js
  getEmployeesWithWeekOffFromAttendance: async (month, year, prbId) => {
    try {
      // Call the attendance endpoint which has the complete data
      const response = await axios.get(`${API_BASE_URL}/emp-attendance/all`, {
        params: {
          month: month,
          year: year,
          per_page: 10000,
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      let employeesWithPatterns = [];

      // Parse the response structure
      if (response.data && response.data.success && response.data.data) {
        let attendanceRecords = response.data.data;

        // Handle paginated response
        if (attendanceRecords.data && Array.isArray(attendanceRecords.data)) {
          attendanceRecords = attendanceRecords.data;
        }

        // Filter by PRB_id and extract employees with their week-off patterns
        attendanceRecords.forEach((record) => {
          // Check if this record matches the selected payroll bill
          if (
            record.PRB_id == prbId &&
            record.employees &&
            Array.isArray(record.employees)
          ) {
            record.employees.forEach((empData) => {
              if (empData.employee) {
                const employee = empData.employee;
                employeesWithPatterns.push({
                  Emp_Id: employee.Emp_Id,
                  Emp_Name: `${employee.First_Name} ${
                    employee.Last_Name || ""
                  }`.trim(),
                  Emp_Code: employee.Emp_Code,
                  designation:
                    employee.profile?.Dsg_Name ||
                    employee.profile?.Designation ||
                    "N/A",
                  department:
                    employee.profile?.Dpt_Name ||
                    employee.profile?.Department ||
                    "Other",
                  basic: employee.profile?.Basic || "0",
                  joinDate: employee.profile?.Join_Date || null,
                  WOP_id: empData.WOP_id,
                  woff_pattern: empData.woff_pattern, // This is what you need!
                  weekly_off_dates: empData.weekly_off_dates,
                });
              }
            });
          }
        });
      }

      console.log("Employees with week-off patterns:", employeesWithPatterns);
      return employeesWithPatterns;
    } catch (error) {
      console.error("Error fetching employees with week-off patterns:", error);
      throw error;
    }
  },

  // Get week-off pattern - GET: /woff-pattern/all
  // getWeekOffPattern: async () => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/woff-pattern/all`);
  //     if (response.data.success && response.data.data.length > 0) {
  //       return response.data.data[0];
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error("Error fetching week-off pattern:", error);
  //     throw error;
  //   }
  // },

  // Get holidays - GET: /holiday/all
  getHolidays: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/holiday/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching holidays:", error);
      throw error;
    }
  },

  // Get leave applications - GET: /leave-application/all
  getLeaveApplications: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-application/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching leave applications:", error);
      throw error;
    }
  },
};

export { AttendanceEntryApi };
