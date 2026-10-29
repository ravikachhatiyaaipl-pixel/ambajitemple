// daratemasterapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const DaRateApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-da-rate`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || ''
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      // Check if response has the nested structure
      if (response.data && response.data.success && response.data.data) {
        return {
          data: response.data.data.data || [], // Access the nested data array
          meta: {
            current_page: response.data.data.current_page || 1,
            last_page: response.data.data.last_page || 1,
            per_page: response.data.data.per_page || params.perPage || 10,
            total: response.data.data.total || 0,
            from: response.data.data.from || 0,
            to: response.data.data.to || 0
          }
        };
      }

      // Fallback for different response structure
      return {
        data: response.data?.data || [],
        meta: response.data?.meta || {
          current_page: 1,
          last_page: 1,
          per_page: params.perPage || 10,
          total: 0,
          from: 0,
          to: 0
        }
      };
    } catch (error) {
      console.error("Error fetching DA rates:", error);
      throw error.response?.data || error.message;
    }
  },

  getAllCommissions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pay-commission/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching pay commissions:", error);
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/da-rate/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching DA rate ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/da-rate`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating DA rate:", error);
      throw error.response?.data || error.message;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/da-rate/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating DA rate ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/da-rate/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting DA rate ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export { DaRateApi };