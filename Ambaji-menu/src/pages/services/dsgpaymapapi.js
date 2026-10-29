import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const DsgPayMapApi = {
  // Get all designation pay mappings with pagination
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-dsg-pay-map`, {
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
      console.error("Error fetching designation pay mappings:", error);
      throw error;
    }
  },

  // Get single designation pay mapping by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dsg-pay-map/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching designation pay mapping ${id}:`, error);
      throw error;
    }
  },

  // Create new designation pay mapping
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/dsg-pay-map`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating designation pay mapping:", error);
      if (error.response?.data?.errors) {
        throw {
          message: error.response.data.message || "Validation failed",
          errors: error.response.data.errors
        };
      }
      throw error;
    }
  },

  // Update existing designation pay mapping
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/dsg-pay-map/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating designation pay mapping ${id}:`, error);
      if (error.response?.data?.errors) {
        throw {
          message: error.response.data.message || "Validation failed",
          errors: error.response.data.errors
        };
      }
      throw error;
    }
  },

  // Delete designation pay mapping
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/dsg-pay-map/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting designation pay mapping ${id}:`, error);
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
  },

  // Get all pay commissions for dropdown
  getPayCommissions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pay-commission/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching pay commissions:", error);
      throw error;
    }
  },

  // Get all pay structure types for dropdown
  getPayStructureTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pay-strtyp/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching pay structure types:", error);
      throw error;
    }
  },

  // Get all pay scales for dropdown
  getPayScales: async (commissionId) => {
    try {
      let url = `${API_BASE_URL}/pay-scales/all`;
      if (commissionId) {
        url = `${API_BASE_URL}/pay-scales/all?PC_id=${commissionId}`;
      }
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching pay scales:", error);
      throw error;
    }
  },

  // Get all pay bands for dropdown
  getPayBands: async (commissionId) => {
    try {
      let url = `${API_BASE_URL}/pay-bands/all`;
      if (commissionId) {
        url = `${API_BASE_URL}/pay-bands/all?PC_id=${commissionId}`;
      }
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching pay bands:", error);
      throw error;
    }
  },

  // Get all pay grades for dropdown - Using emp-grade/all
  getPayGrades: async (commissionId) => {
    try {
      let url = `${API_BASE_URL}/emp-grade/all`;
      if (commissionId) {
        url = `${API_BASE_URL}/emp-grade/all?PC_id=${commissionId}`;
      }
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching pay grades:", error);
      throw error;
    }
  },

  // Get all pay levels for dropdown
  getPayLevels: async (commissionId = null, scaleId = null) => {
    try {
      let url = `${API_BASE_URL}/pay-level/all`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching pay levels:", error);
      throw error;
    }
  },

  // Get all payroll bills for dropdown
  getPayrollBills: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll-bill/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching payroll bills:", error);
      throw error;
    }
  }
};

export { DsgPayMapApi };