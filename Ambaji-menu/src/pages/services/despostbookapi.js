import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const DesPostBookApi = {
  // Get all designation post book entries with pagination
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-des-post-book`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || '',
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
          to: response.data.data?.to || 0,
        },
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error("Error fetching designation post book entries:", error);
      throw error;
    }
  },

  // Get single designation post book entry by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/des-post-book/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching designation post book entry ${id}:`, error);
      throw error;
    }
  },

  // Create new designation post book entry
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/des-post-book`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating designation post book entry:", error);
      if (error.response?.data?.errors) {
        throw {
          message: error.response.data.message || "Validation failed",
          errors: error.response.data.errors
        };
      }
      throw error;
    }
  },

  // Update existing designation post book entry
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/des-post-book/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating designation post book entry ${id}:`, error);
      if (error.response?.data?.errors) {
        throw {
          message: error.response.data.message || "Validation failed",
          errors: error.response.data.errors
        };
      }
      throw error;
    }
  },

  // Delete designation post book entry
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/des-post-book/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting designation post book entry ${id}:`, error);
      throw error;
    }
  },

  // Get all designations for dropdown
  getDesignations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/designation/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching designations:", error);
      throw error;
    }
  }
};

export { DesPostBookApi };