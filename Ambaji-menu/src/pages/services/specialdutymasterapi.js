import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const SpecialDutyApi = {
  // Get all special duties with pagination and search
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-special-duty`, {
        params: {
          per_page: params.perPage || 15,
          page: params.page || 1,
          search: params.search || ''
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      // Handle the nested data structure from the API response
      const responseData = response.data.data || response.data;
      
      return {
        data: responseData.data || [],
        pagination: {
          total: responseData.total || 0,
          per_page: responseData.per_page || 15,
          current_page: responseData.current_page || 1,
          last_page: responseData.last_page || 1,
          from: responseData.from || 0,
          to: responseData.to || 0
        }
      };
    } catch (error) {
      console.error("Error fetching special duties:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get all special duties (without pagination for dropdowns)
  getAllWithoutPagination: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/special-duty/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all special duties:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get special duty by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/special-duty/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching special duty ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Create new special duty
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/special-duty`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating special duty:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update special duty
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/special-duty/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error updating special duty ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete special duty
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/special-duty/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting special duty ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export { SpecialDutyApi };