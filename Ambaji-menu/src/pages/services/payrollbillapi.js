import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const PayrollBillApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-payroll-bill`, {
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
      console.error("Error fetching payroll bills:", error);
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll-bill/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching payroll bill ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  getAllLedgers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ledgers/all/data`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching ledgers:", error);
      throw error.response?.data || error.message;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/payroll-bill`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating payroll bill:", error);
      throw error.response?.data || error.message;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/payroll-bill/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error updating payroll bill ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/payroll-bill/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting payroll bill ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export { PayrollBillApi };