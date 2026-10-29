import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const LeaveApplicationApi = {
  getAll: async (page = 1, perPage = 15, search = "", status = "", lv_mode = "", emp_id = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
      };
      
      if (search && search.trim() !=  "") {
        params.search = search;
      }
      
      if (status && status !=  "") {
        params.status = status;
      }
      
      if (lv_mode && lv_mode !=  "") {
        params.lv_mode = lv_mode;
      }
      
      if (emp_id && emp_id !=  "") {
      params.emp_id = emp_id;
      } 

      const response = await axios.get(`${API_BASE_URL}/lst-leave-application`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });

      // Handle the response structure correctly
      const responseData = response.data.data || response.data;
      
      return {
        entries: responseData.data || responseData || [],
        pagination: {
          current_page: responseData.current_page || 1,
          last_page: responseData.last_page || 1,
          per_page: responseData.per_page || perPage,
          total: responseData.total || 0,
          from: responseData.from || null,
          to: responseData.to || null,
        },
      };
    } catch (error) {
      console.error("API Error loading Leave Applications:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-application/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error("API Error loading Leave Application:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/leave-application`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating Leave Application:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/leave-application/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating Leave Application:", error);
      throw error;
    }
  },
  
  updateStatus: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/leave-application/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating leave application status:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/leave-application/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error deleting Leave Application:", error);
      throw error;
    }
  },

  getAllEmployees: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-mast/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading employees:", error);
      throw error;
    }
  },

  getAllLeaveTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-type/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success && response.data.data) {
        response.data.data = response.data.data.filter(type => type.Is_Active == true);
      }
      return response.data;
    } catch (error) {
      console.error("API Error loading leave types:", error);
      throw error;
    }
  },
  
  getAllHolidays: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/holiday/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading holidays:", error);
      throw error;
    }
  },

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

  // getStatusIdsByStage: async (stage) => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/action-master/status-ids`, {
  //       params: { stage }
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error(`API Error loading status IDs for stage ${stage}:`, error);
  //     throw error;
  //   }
  // },

  isHoliday: (date, holidays , headers) => {
    if (!holidays || holidays.length == 0) return false;
    
    const dateStr = new Date(date).toISOString().split('T')[0];
    
    return holidays.some(holiday => {
      const holidayDateStr = new Date(holiday.HL_Date).toISOString().split('T')[0];
      return holidayDateStr == dateStr;
    });
  },

  hasPreviousConsecutiveHoliday: (date, holidays , headers) => {
    if (!holidays || holidays.length == 0) return false;
    
    const targetDate = new Date(date);
    const previousDay = new Date(targetDate);
    previousDay.setDate(targetDate.getDate() - 1);
    const previousDayStr = previousDay.toISOString().split('T')[0];
    
    return holidays.some(holiday => {
      const holidayDateStr = new Date(holiday.HL_Date).toISOString().split('T')[0];
      return holidayDateStr == previousDayStr;
    });
  },

  hasSubsequentConsecutiveHoliday: (date, holidays , headers) => {
    if (!holidays || holidays.length == 0) return false;
    
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];
    
    return holidays.some(holiday => {
      const holidayDateStr = new Date(holiday.HL_Date).toISOString().split('T')[0];
      return holidayDateStr == nextDayStr;
    });
  }
};

export { LeaveApplicationApi };