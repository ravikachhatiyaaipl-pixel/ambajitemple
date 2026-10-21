import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const TenderEmdReleaseApi = {
  getAllTenders: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tender-entries/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading tenders:", error);
      throw error;
    }
  },

  getAllEmdEntries: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tnd-emd/all?Status=hod_app`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading EMD entries:", error);
      throw error;
    }
  },

  getAllWorkAllocations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/work-allocations/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading work allocations:", error);
      throw error;
    }
  },

  getAllBankGuarantees: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/work-bg/all?WBT_Type=Receipt&Status=hod_app`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading bank guarantees:", error);
      throw error;
    }
  },

  bulkUpdate: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tnd-emd/cd-update`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error bulk updating EMD entries:", error);
      throw error;
    }
  },
};

export { TenderEmdReleaseApi };