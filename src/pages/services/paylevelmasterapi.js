import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const PayLevelApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-pay-level`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || ''
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return {
        data: response.data.data?.data || [],
        meta: response.data.data || {}
      };
    } catch (error) {
      console.error("Error fetching pay levels:", error);
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pay-level/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching pay level ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/pay-level`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating pay level:", error);
      throw error.response?.data || error.message;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/pay-level/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error updating pay level ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/pay-level/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting pay level ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  getPayCommissions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pay-commission/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching pay commissions:", error);
      throw error.response?.data || error.message;
    }
  },

  getEmpGrades: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-grade/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching employee grades:", error);
      throw error.response?.data || error.message;
    }
  }
};

export { PayLevelApi };