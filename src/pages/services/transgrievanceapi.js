import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const TransGrievanceApi = {
  // ========== CRUD Operations ==========
  getAll: async (page = 1, perPage = 15, search = "", startDate = "", endDate = "", status = "") => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("per_page", perPage);
      if (search) params.append("search", search);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (status) params.append("status", status);

      const response = await axios.get(`${API_BASE_URL}/lst-trans-grievance?${params.toString()}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching grievances:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trans-grievance/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching grievance:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/trans-grievance`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating grievance:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trans-grievance/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error updating grievance:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/trans-grievance/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error deleting grievance:", error);
      throw error;
    }
  },

  updateStatus: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/trans-grievance/${id}`, data,{
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

  getAllOwners: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/owner-master/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching owners:", error);
      throw error;
    }
  },

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

export default TransGrievanceApi;