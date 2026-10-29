import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const LoanDocumentApi = {
  // Get all loan types for dropdown - GET: /loan-type/all
  getLoanTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/loan-type/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error("Error fetching loan types:", error);
      throw {
        success: false,
        message: error.response?.data?.message || "Failed to fetch loan types",
        errors: error.response?.data?.errors
      };
    }
  },

  // Get all loan documents with pagination - GET: /lst-loan-document
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-loan-document`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || ''
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      
      return {
        success: response.data.success,
        data: response.data.data?.data || [],
        meta: {
          current_page: response.data.data?.current_page || 1,
          last_page: response.data.data?.last_page || 1,
          per_page: response.data.data?.per_page || 10,
          total: response.data.data?.total || 0,
          from: response.data.data?.from || 0,
          to: response.data.data?.to || 0
        },
        message: response.data.message
      };
    } catch (error) {
      console.error("Error fetching loan documents:", error);
      throw {
        success: false,
        message: error.response?.data?.message || "Failed to fetch loan documents",
        errors: error.response?.data?.errors
      };
    }
  },

  // Get single loan document by ID - GET: /loan-document/{id}
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/loan-document/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching loan document ${id}:`, error);
      throw {
        success: false,
        message: error.response?.data?.message || "Failed to fetch loan document",
        errors: error.response?.data?.errors
      };
    }
  },

  // Create new loan document - POST: /loan-document
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/loan-document`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error("Error creating loan document:", error);
      throw {
        success: false,
        message: error.response?.data?.message || "Failed to create loan document",
        errors: error.response?.data?.errors
      };
    }
  },

  // Update existing loan document - POST with _method PUT: /loan-document/{id}
  update: async (id, data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/loan-document/${id}?_method=PUT`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`          
        }
      });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error updating loan document ${id}:`, error);
      throw {
        success: false,
        message: error.response?.data?.message || "Failed to update loan document",
        errors: error.response?.data?.errors
      };
    }
  },

  // Delete loan document - DELETE: /loan-document/{id}
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/loan-document/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
    });
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error deleting loan document ${id}:`, error);
      throw {
        success: false,
        message: error.response?.data?.message || "Failed to delete loan document",
        errors: error.response?.data?.errors
      };
    }
  },
};

export { LoanDocumentApi };