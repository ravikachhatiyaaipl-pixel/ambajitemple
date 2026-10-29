import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const TenderEmdBgApi = {
  // Get all EMD/BG entries with pagination
  getAll: async (page = 1, perPage = 15, search = "", status = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(status && { Status: status })
      };

      const response = await axios.get(`${API_BASE_URL}/lst-tnd-emd`, { params },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});

      return {
        entries: response.data.data || [],
        pagination: response.data.meta || {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: 0,
        },
      };
    } catch (error) {
      console.error("API Error loading EMD/BG entries:", error);
      throw error;
    }
  },

  // Get single EMD/BG entry by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tnd-emd/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading EMD/BG entry:", error);
      throw error;
    }
  },

  // Create new EMD/BG entry - Send as JSON
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tnd-emd`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating EMD/BG entry:", error);
      throw error;
    }
  },

  // Update EMD/BG entry - Send as JSON
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tnd-emd/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating EMD/BG entry:", error);
      throw error;
    }
  },

  // Delete EMD/BG entry
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tnd-emd/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting EMD/BG entry:", error);
      throw error;
    }
  },

  getAllSubledgers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sub-ledgers/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading subledgers:", error);
      throw error;
    }
  },

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

  getAllByStage: async (stage) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/action-master/all`, {
        params: { stage },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`API Error loading actions for stage ${stage}:`, error);
      throw error;
    }
  },

};

export { TenderEmdBgApi };