// overtime-record-entry/services/overtimerecordapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const OverTimeRecordApi = {
  // Get all overtime records with pagination
  getAll: async (page = 1, perPage = 15, search = "", status = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(status && { Status: status })
      };

      const response = await axios.get(`${API_BASE_URL}/lst-overtime`, { params },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});

      return {
        entries: response.data.data || [],
        pagination: {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || perPage,
          total: response.data.total || 0,
        },
      };
    } catch (error) {
      console.error("API Error loading overtime records:", error);
      throw error;
    }
  },

  // Get single overtime record by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/overtime/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading overtime record:", error);
      throw error;
    }
  },

  // Create new overtime record
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/overtime`, data, {
        headers: {
          'Content-Type': 'application/json',
        
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating overtime record:", error);
      throw error;
    }
  },

  // Update overtime record
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/overtime/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
    
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating overtime record:", error);
      throw error;
    }
  },

  // Update status (for approval)
  updateStatus: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/overtime/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error updating overtime status:", error);
      throw error;
    }
  },

  // Delete overtime record
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/overtime/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting overtime record:", error);
      throw error;
    }
  },

  // Get all employees
  getAllEmployees: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-mast/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading employees:", error);
      throw error;
    }
  },

  // Get all holidays
  getAllHolidays: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/holiday/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading holidays:", error);
      throw error;
    }
  },

  // Get all actions by stage
  getAllByStage: async (stage) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/action-master/all`, {
        params: { stage },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`API Error loading actions for stage ${stage}:`, error);
      throw error;
    }
  },

  // Helper: Get date string in YYYY-MM-DD format
  getDateString: (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  },

  // Helper: Check if two dates are consecutive (next day)
  isConsecutiveDay: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays ==  1;
  },

  // Helper: Check if a specific date is a holiday
  isHoliday: (date, holidays) => {
    if (!holidays || holidays.length ==  0) return false;
    
    const dateStr = OverTimeRecordApi.getDateString(date);
    
    return holidays.some(holiday => {
      const holidayDateStr = OverTimeRecordApi.getDateString(holiday.HL_Date);
      return holidayDateStr ==  dateStr;
    });
  },

  // Helper: Check if there is a holiday immediately BEFORE the selected date
  hasPreviousConsecutiveHoliday: (date, holidays) => {
    if (!holidays || holidays.length ==  0) return false;
    
    const targetDate = new Date(date);
    const previousDay = new Date(targetDate);
    previousDay.setDate(targetDate.getDate() - 1);
    const previousDayStr = OverTimeRecordApi.getDateString(previousDay);
    
    return holidays.some(holiday => {
      const holidayDateStr = OverTimeRecordApi.getDateString(holiday.HL_Date);
      return holidayDateStr ==  previousDayStr;
    });
  },

  // Helper: Check if there is a holiday immediately AFTER the selected date
  hasSubsequentConsecutiveHoliday: (date, holidays) => {
    if (!holidays || holidays.length ==  0) return false;
    
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);
    const nextDayStr = OverTimeRecordApi.getDateString(nextDay);
    
    return holidays.some(holiday => {
      const holidayDateStr = OverTimeRecordApi.getDateString(holiday.HL_Date);
      return holidayDateStr ==  nextDayStr;
    });
  },

  // Helper: Calculate overtime hours in HH:MM format based on In_Time and Out_Time
  // Shift timing: 10:00 AM to 6:00 PM (8 hours)
  calculateOvertimeHours: (inTime, outTime) => {
    if (!inTime || !outTime) return "00:00";
    
    const shiftStart = new Date(inTime);
    const shiftEnd = new Date(outTime);
    
    // Set shift boundaries to 10:00 AM and 6:00 PM on the same date
    const normalStart = new Date(inTime);
    normalStart.setHours(10, 0, 0, 0);
    
    const normalEnd = new Date(inTime);
    normalEnd.setHours(18, 0, 0, 0);
    
    let totalOvertimeMinutes = 0;
    
    // Calculate overtime before shift start (early coming - before 10:00 AM)
    if (shiftStart < normalStart) {
      const beforeShiftMinutes = (normalStart - shiftStart) / (1000 * 60);
      totalOvertimeMinutes += beforeShiftMinutes;
    }
    
    // Calculate overtime after shift end (late going - after 6:00 PM)
    if (shiftEnd > normalEnd) {
      const afterShiftMinutes = (shiftEnd - normalEnd) / (1000 * 60);
      totalOvertimeMinutes += afterShiftMinutes;
    }
    
    // Convert minutes to HH:MM format
    const hours = Math.floor(totalOvertimeMinutes / 60);
    const minutes = Math.round(totalOvertimeMinutes % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  // Helper: Convert HH:MM format to decimal for API (if needed)
  convertTimeToDecimal: (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':');
    return parseFloat(hours) + (parseFloat(minutes) / 60);
  },

  // Helper: Convert decimal to HH:MM format for display
  convertDecimalToTime: (decimalHours) => {
    if (!decimalHours && decimalHours != 0) return "00:00";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  // Helper: Check if time is early coming (before 10:00 AM) - returns 'Y' or 'N'
  isEarlyComing: (inTime, date) => {
    if (!inTime || !date) return 'N';
    const inDateTime = new Date(`${date}T${inTime}`);
    const shiftStart = new Date(`${date}T10:00:00`);
    return inDateTime < shiftStart ? 'Y' : 'N';
  },

  // Helper: Check if time is late going (after 6:00 PM) - returns 'Y' or 'N'
  isLateGoing: (outTime, date) => {
    if (!outTime || !date) return 'N';
    const outDateTime = new Date(`${date}T${outTime}`);
    const shiftEnd = new Date(`${date}T18:00:00`);
    return outDateTime > shiftEnd ? 'Y' : 'N';
  }
};

export { OverTimeRecordApi };