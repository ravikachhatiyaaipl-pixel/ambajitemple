import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const HolidayEmpMapApi = {
  // For the list view with pagination - GET: /lst-holiday-emptymap
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-holiday-emptymap`, {
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
      console.error("Error fetching Holiday Emp maps:", error);
      throw error.response?.data || error.message;
    }
  },

  // For fetching all records without pagination - GET: /holiday-emptymap/all
  getAllMaps: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/holiday-emptymap/all`, {
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

  // Get single record by ID - GET: /holiday-emptymap/{id}
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/holiday-emptymap/${id}`, {
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

  // Create new mapping - POST: /holiday-emptymap
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/holiday-emptymap`, data, {
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

  // Update existing mapping - PUT: /holiday-emptymap/{id}
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/holiday-emptymap/${id}`, data, {
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

  // Delete mapping - DELETE: /holiday-emptymap/{id}
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/holiday-emptymap/${id}`, {
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

export { HolidayEmpMapApi };