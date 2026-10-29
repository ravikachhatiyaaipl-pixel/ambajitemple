import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const AwardMasterApi = {
  // Get paginated list with search
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-award`, {
        params: {
          per_page: params.perPage || 15,
          page: params.page || 1,
          search: params.search || ''
        }
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      // Handle the nested data structure from your API response
      return {
        data: response.data.data.data || [],
        pagination: response.data.data || {
          total: 0,
          per_page: 15,
          current_page: 1,
          last_page: 1,
          from: 0,
          to: 0
        }
      };
    } catch (error) {
      console.error("Error fetching awards:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get single award by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/award/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching award ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Get all awards (for dropdowns)
  getAllAwards: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/award/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all awards:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create new award
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/award`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating award:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update existing award
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/award/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating award ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Delete award
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/award/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting award ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export { AwardMasterApi };