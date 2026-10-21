// src/services/transactionreceiptapi.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const TransactionReceiptApi = {
  // ========== CRUD Operations ==========

  // Get all transaction receipts with pagination
  getAll: async (page = 1, perPage = 15, search = "", startDate = "", endDate = "", status = "") => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("per_page", perPage);
      if (search) params.append("search", search);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (status) params.append("status", status);

      const response = await axios.get(`${API_BASE_URL}/lst-transaction-receipt?${params.toString()}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction receipts:", error);
      throw error;
    }
  },

  // Get single record by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transaction-receipt/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction receipt:", error);
      throw error;
    }
  },

  // Create new record
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/transaction-receipt`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating transaction receipt:", error);
      throw error;
    }
  },

  // Update existing record
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/transaction-receipt/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error updating transaction receipt:", error);
      throw error;
    }
  },

  // Delete record
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/transaction-receipt/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error deleting transaction receipt:", error);
      throw error;
    }
  },

  // Update status (for approval flow)
  updateStatus: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/transaction-receipt/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  },

  // ========== Dropdown Data ==========

  // Get all demands (approved only - status filter)
  getAllDemands: async (statusId = null) => {
    try {
      let url = `${API_BASE_URL}/trans-demand/all`;
      if (statusId) {
        url += `?status=${statusId}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching demands:", error);
      throw error;
    }
  },

  // Get all collection centers
  getAllCollectionCenters: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/collection-center/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching collection centers:", error);
      throw error;
    }
  },

  // Get all payment modes
  getAllPaymentModes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payment-mode/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      throw error;
    }
  },

  // Get all tax types
  getAllTaxTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tax-type-master/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching tax types:", error);
      throw error;
    }
  },

  // Get all actions for a stage
  getActionsByStage: async (stage) => {
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

export default TransactionReceiptApi;