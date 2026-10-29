// src/services/manualattendanceapi.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const ManualAttendanceApi = {
  // ===================  MANUAL ATTENDANCE ENDPOINTS ====================
  // Get all manual attendance entries with pagination and filters
  getAll: async (page = 1, perPage = 15, search = "", empId = "", startDate = "", endDate = "", status = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(empId && { Emp_Id: empId }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
        ...(status && { status :status })
      };

      const response = await axios.get(`${API_BASE_URL}/lst-attn-regularize`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });

      return {
        regularizations: response.data.data || [],
        pagination: response.data.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: 0,
        },
      };
    } catch (error) {
      console.error("API Error loading manual attendance:", error);
      throw error;
    }
  },

  // Get single manual attendance by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attn-regularize/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error loading manual attendance:", error);
      throw error;
    }
  },

  // Create new manual attendance
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/attn-regularize`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error creating manual attendance:", error);
      throw error;
    }
  },

  // Update manual attendance
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/attn-regularize/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error updating manual attendance:", error);
      throw error;
    }
  },

  // Update manual attendance status
  updateStatus: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/attn-regularize/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error updating manual attendance status:", error);
      throw error;
    }
  },

  // Delete manual attendance
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/attn-regularize/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting manual attendance:", error);
      throw error;
    }
  },

  // ===================  COMMON ENDPOINTS ====================
  
  // Get all actions for a stage
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

  // Get all employees
  getEmployees: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-mast/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading employees:", error);
      throw error;
    }
  },

  // Get all holidays
  getHolidays: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/holiday/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading holidays:", error);
      throw error;
    }
  },

  // Calculate days between dates with holidays
  calculateDays: (startDate, endDate, holidays = []) => {
    if (!startDate || !endDate) return { totalDays: 0, holidays: 0, workingDays: 0 };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    let holidayCount = 0;
    const holidayDates = holidays.map(h => h.HL_Date);
    
    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      if (holidayDates.includes(dateStr)) {
        holidayCount++;
      }
    }
    
    return {
      totalDays: diffDays,
      holidays: holidayCount,
      workingDays: diffDays - holidayCount,
    };
  },
};