import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const PropertyAssessmentApi = {
  // ========== CRUD Operations ==========

  // Get all property assessments with pagination
  getAll: async (page = 1, perPage = 15, search = "", startDate = "", endDate = "", status = "") => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("per_page", perPage);
      if (search) params.append("search", search);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (status) params.append("status", status);

      const response = await axios.get(`${API_BASE_URL}/lst-property-assessment?${params.toString()}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching property assessments:", error);
      throw error;
    }
  },

  // Get single record by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/property-assessment/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching property assessment:", error);
      throw error;
    }
  },

  // Create new record
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/property-assessment`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating property assessment:", error);
      throw error;
    }
  },

  // Update existing record
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/property-assessment/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error updating property assessment:", error);
      throw error;
    }
  },

  // Delete record
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/property-assessment/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error deleting property assessment:", error);
      throw error;
    }
  },

  // Update status (for approval flow)
  updateStatus: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/property-assessment/${id}`, data,{
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

  // Get all properties
  getAllProperties: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/property-master/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }
  },

  // Get all financial years
  getAllFinancialYears: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fy-master`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching financial years:", error);
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

export default PropertyAssessmentApi;