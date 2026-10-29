import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const TenderBgReleaseApi = {
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

  getAllNocApprovals: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wonoc/all?Status=hod_app`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading NOC approvals:", error);
      throw error;
    }
  },

  bulkUpdate: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/work-bg/cd-update`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error bulk updating BG entries:", error);
      throw error;
    }
  },
};