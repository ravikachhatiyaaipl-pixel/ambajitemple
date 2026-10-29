// src/services/demandrebatetransapi.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const DemandRebateTransApi = {
  // ========== CRUD Operations ==========

  // Get all demand rebate transactions with pagination
  getAll: async (page = 1, perPage = 15, search = "") => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("per_page", perPage);
      if (search) params.append("search", search);

      const response = await axios.get(`${API_BASE_URL}/lst-demand-rebate-trans?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching demand rebate transactions:", error);
      throw error;
    }
  },

  // Get single record by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/demand-rebate-trans/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching demand rebate transaction:", error);
      throw error;
    }
  },

  // Create new record
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/demand-rebate-trans`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating demand rebate transaction:", error);
      throw error;
    }
  },

  // Update existing record
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/demand-rebate-trans/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating demand rebate transaction:", error);
      throw error;
    }
  },

  // Delete record
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/demand-rebate-trans/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting demand rebate transaction:", error);
      throw error;
    }
  },

  // ========== Dropdown Data ==========

  getAllDemands: async (lastApprovedStatus = null) => {
    try {
      const params = new URLSearchParams();
      if (lastApprovedStatus) params.append("status", lastApprovedStatus);
      const url = `${API_BASE_URL}/trans-demand/all${lastApprovedStatus ? `?${params.toString()}` : ""}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching demands:", error);
      throw error;
    }
  },

  // Get all rebates (for dropdown)
  getAllRebates: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rebate-master/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching rebates:", error);
      throw error;
    }
  },

  // ========== Helper Functions ==========

  // Format currency for display
  formatCurrency: (amount) => {
    if (!amount && amount != 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Format date for display
  formatDate: (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  },
};

export default DemandRebateTransApi;