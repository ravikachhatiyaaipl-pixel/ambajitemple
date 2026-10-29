// services/woffpatternapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const WoffPatternApi = {
  // For the list view with pagination - GET: /lst-woff-pattern
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-woff-pattern`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || ''
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      return {
        data: response.data.data?.data || [],
        meta: {
          current_page: response.data.data?.current_page || 1,
          last_page: response.data.data?.last_page || 1,
          per_page: response.data.data?.per_page || 10,
          total: response.data.data?.total || 0,
          from: response.data.data?.from || 0,
          to: response.data.data?.to || 0
        }
      };
    } catch (error) {
      console.error("Error fetching Woff Patterns:", error);
      throw error.response?.data || error.message;
    }
  },

  // For fetching all records without pagination - GET: /woff-pattern/all
  getAllTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/woff-pattern/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all woff patterns:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get single record by ID - GET: /woff-pattern/{id}
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/woff-pattern/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching woff pattern ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Create new woff pattern - POST: /woff-pattern
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/woff-pattern`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating woff pattern:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update existing woff pattern - PUT: /woff-pattern/{id}
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/woff-pattern/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error updating woff pattern ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete woff pattern - DELETE: /woff-pattern/{id}
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/woff-pattern/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting woff pattern ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export { WoffPatternApi };