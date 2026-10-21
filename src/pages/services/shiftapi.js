import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const ShiftApi = {
  // For the list view with pagination - GET: /lst-shift
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-shift`, {
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
      console.error("Error fetching Shifts:", error);
      throw error.response?.data || error.message;
    }
  },

  // For fetching all records without pagination - GET: /shift/all
  getAllShifts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shift/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all shifts:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get single record by ID - GET: /shift/{id}
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shift/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching shift ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Create new shift - POST: /shift
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/shift`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating shift:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update existing shift - PUT: /shift/{id}
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/shift/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error updating shift ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete shift - DELETE: /shift/{id}
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/shift/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting shift ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
  
  // Check if shift code exists
  checkCodeExists: async (code, excludeId = null) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shift/check-code`, {
        params: { code, exclude_id: excludeId },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.exists;
    } catch (error) {
      console.error("Error checking code existence:", error);
      return false;
    }
  }
};

export { ShiftApi };