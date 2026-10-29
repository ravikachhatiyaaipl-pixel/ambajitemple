import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const SigniWorkApi = {
  // Paginated list with search - MAIN API TO BE USED
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-signi-work`, {
        params: {
          per_page: params.perPage || 15,
          page: params.page || 1,
          search: params.search || ''
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return {
        success: response.data.success,
        data: response.data.data?.data || [],
        meta: {
          current_page: response.data.data?.current_page || 1,
          last_page: response.data.data?.last_page || 1,
          total: response.data.data?.total || 0,
          per_page: response.data.data?.per_page || 15,
          from: response.data.data?.from || 0,
          to: response.data.data?.to || 0
        }
      };
    } catch (error) {
      console.error("Error fetching significant work:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get single record by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/signi-work/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error fetching significant work ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Create new record
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signi-work`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating significant work:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update record
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/signi-work/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error updating significant work ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete record
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/signi-work/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting significant work ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export default SigniWorkApi;