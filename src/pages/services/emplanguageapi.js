import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const EmpLanguageApi = {
  // For paginated list with server-side pagination
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-emp-lang`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee languages:", error);
      throw error;
    }
  },

  // For fetching all records (for client-side operations like export)
  getAllList: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-lang/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all employee languages:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-lang/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee language ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emp-lang`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating employee language:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/emp-lang/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating employee language ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/emp-lang/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting employee language ${id}:`, error);
      throw error;
    }
  }
};

export default EmpLanguageApi;