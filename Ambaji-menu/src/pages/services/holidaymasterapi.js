import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const HolidayApi = {
  getAll: async (params = {}) => {
    try {

      const response = await axios.get(`${API_BASE_URL}/lst-holiday`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || ''
        }
      });


      // Check if response has the expected structure
      if (!response.data.success) {
        throw new Error("API returned unsuccessful response");
      }

      // The holidays array is at response.data.data.data
      let holidays = [];
      let paginationInfo = {};

      if (response.data.data && response.data.data.data) {
        // This is the correct path for your API
        holidays = response.data.data.data;
        paginationInfo = {
          current_page: response.data.data.current_page || 1,
          last_page: response.data.data.last_page || 1,
          per_page: response.data.data.per_page || params.perPage || 10,
          total: response.data.data.total || 0,
          from: response.data.data.from || 0,
          to: response.data.data.to || 0
        };
      }

      console.log("Extracted holidays:", holidays);
      console.log("Pagination info:", paginationInfo);

      return {
        data: holidays,
        meta: paginationInfo
      };

    } catch (error) {
      console.error("Error in getAll:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data || error.message;
    }
  },

  // This endpoint is correct and working
  getAllHolidays: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/holiday/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all holidays:", error);
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/holiday/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching holiday ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/holiday`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating holiday:", error);
      throw error.response?.data || error.message;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/holiday/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating holiday ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/holiday/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting holiday ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export { HolidayApi };