import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const HolidayDesgMapApi = {
  // For the list view with pagination - GET: /lst-holiday-dsg-map
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-holiday-dsg-map`, {
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
        meta: response.data.data || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0
        }
      };
    } catch (error) {
      console.error("Error fetching Holiday Desg maps:", error);
      throw error.response?.data || error.message;
    }
  },

  // For fetching all records without pagination - GET: /holiday-dsg-map/all
  getAllMaps: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/holiday-dsg-map/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all maps:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get single record by ID - GET: /holiday-dsg-map/{id}
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/holiday-dsg-map/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching map ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Create new mapping - POST: /holiday-dsg-map
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/holiday-dsg-map`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating map:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update existing mapping - PUT: /holiday-dsg-map/{id}
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/holiday-dsg-map/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating map ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete mapping - DELETE: /holiday-dsg-map/{id}
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/holiday-dsg-map/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting map ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export { HolidayDesgMapApi };