import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const EmployeeEducationProfileApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-empedu-profile`, {
        params: {
          page: params.page || 1,
          per_page: params.perPage || 10,
          search: params.search || '',
          ...params
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee education profiles:", error);
      throw error;
    }
  },

  getAllList: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/empedu-profile/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all education profiles:", error);
      throw error;
    }
  },

  getById: async (EEP_Id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/empedu-profile/${EEP_Id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching education profile ${EEP_Id}:`, error);
      throw error;
    }
  },

  create: async (profileData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/empedu-profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating education profile:", error);
      throw error;
    }
  },

  update: async (EEP_Id, profileData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/empedu-profile/${EEP_Id}`, profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating education profile ${EEP_Id}:`, error);
      throw error;
    }
  },

  delete: async (EEP_Id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/empedu-profile/${EEP_Id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting education profile ${EEP_Id}:`, error);
      throw error;
    }
  }
};

export default EmployeeEducationProfileApi;