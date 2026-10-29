import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const IncExamApi = {
  // Paginated list with search
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst/inc-exam`, {
        params: {
          per_page: params.perPage || 15,
          page: params.page || 1,
          search: params.search || ''
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      // Handle the response structure from your API
      const responseData = response.data;
      
      return {
        data: responseData.data || [],
        meta: {
          current_page: responseData.pagination?.current_page || 1,
          last_page: responseData.pagination?.last_page || 1,
          total: responseData.pagination?.total || 0,
          per_page: responseData.pagination?.per_page || 15,
        }
      };
    } catch (error) {
      console.error("Error fetching increment exams:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get all records (for export/filtering)
  getAllList: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all/inc-exam`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      console.log("All Exams API Response:", response.data); // Debug log
      return {
        success: response.data.success,
        data: response.data.data || []
      };
    } catch (error) {
      console.error("Error fetching all increment exams:", error);
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inc-exam/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      console.log("Get By ID Response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error(`Error fetching increment exam ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/inc-exam`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating increment exam:", error);
      throw error.response?.data || error.message;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/inc-exam/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating increment exam ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/inc-exam/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting increment exam ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export default IncExamApi;