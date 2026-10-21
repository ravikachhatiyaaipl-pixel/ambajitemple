import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const QualificationApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-emp-edu`, { params },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching qualification details:", error);
      throw error;
    }
  },

  getById: async (EEd_Id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-edu/${EEd_Id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error fetching qualification ${EEd_Id}:`, error);
      throw error;
    }
  },

  create: async (qualificationData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emp-edu`, qualificationData,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating qualification:", error);
      throw error;
    }
  },

  update: async (EEd_Id, qualificationData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/emp-edu/${EEd_Id}`, qualificationData,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error updating qualification ${EEd_Id}:`, error);
      throw error;
    }
  },

  delete: async (EEd_Id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/emp-edu/${EEd_Id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting qualification ${EEd_Id}:`, error);
      throw error;
    }
  }
};

export default QualificationApi;