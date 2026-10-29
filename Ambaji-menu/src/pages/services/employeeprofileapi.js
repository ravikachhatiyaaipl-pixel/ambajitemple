import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const EmployeeProfileApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-emppers-profile`, {
        params: {
          page: params.page || 1,
          per_page: params.perPage || 15,
          search: params.search || '',
          ...params
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee profiles:", error);
      throw error;
    }
  },

  getAllList: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emppers-profile/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all profiles:", error);
      throw error;
    }
  },

  getById: async (EPP_Id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emppers-profile/${EPP_Id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching profile ${EPP_Id}:`, error);
      throw error;
    }
  },

  create: async (profileData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emppers-profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating employee profile:", error);
      throw error;
    }
  },

  update: async (EPP_Id, profileData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/emppers-profile/${EPP_Id}`, profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating profile ${EPP_Id}:`, error);
      throw error;
    }
  },

  delete: async (EPP_Id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/emppers-profile/${EPP_Id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting profile ${EPP_Id}:`, error);
      throw error;
    }
  },

  getHistoryByEmpId: async (empId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emppers-profile/history/${empId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching profile history for employee ${empId}:`, error);
      throw error;
    }
  }
};

export default EmployeeProfileApi;