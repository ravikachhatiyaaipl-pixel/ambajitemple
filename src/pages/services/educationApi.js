import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const EducationApi = {
  // Paginated list with search
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-emp-edu`, {
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
      console.error("Error fetching education qualifications:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get all records (for export/filtering)
  getAllList: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-edu/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return {
        success: response.data.success,
        data: response.data.data || []
      };
    } catch (error) {
      console.error("Error fetching all education qualifications:", error);
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-edu/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching education qualification ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emp-edu`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating education qualification:", error);
      throw error.response?.data || error.message;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/emp-edu/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating education qualification ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/emp-edu/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting education qualification ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export default EducationApi;