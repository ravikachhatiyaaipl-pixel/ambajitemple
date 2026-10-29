import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const LeaveTypeApi = {
  // For the list view with pagination - GET: /lst-leave-type
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-leave-type`, {
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
      console.error("Error fetching Leave Types:", error);
      throw error.response?.data || error.message;
    }
  },

  // For fetching all records without pagination - GET: /leave-type/all
  getAllTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-type/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all leave types:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get single record by ID - GET: /leave-type/{id}
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-type/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching leave type ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Create new leave type - POST: /leave-type
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/leave-type`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating leave type:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update existing leave type - PUT: /leave-type/{id}
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/leave-type/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating leave type ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete leave type - DELETE: /leave-type/{id}
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/leave-type/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting leave type ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export { LeaveTypeApi };