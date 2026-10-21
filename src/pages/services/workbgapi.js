import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const WorkBgApi = {
  getAll: async (page = 1, perPage = 15, search = "", status = "",wbtType="") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(status && { Status: status }),
        ...(wbtType && { WBT_Type: wbtType })
      };

      const response = await axios.get(`${API_BASE_URL}/lst-work-bg`, { params },{
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
      console.error("API Error loading BG entries:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/work-bg/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading BG entry:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const payload = {
        ...data,
        WBT_CD: "Credit"
      };
      
      const response = await axios.post(`${API_BASE_URL}/work-bg`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating BG entry:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const { WBT_CD, ...updateData } = data;
      
      const response = await axios.put(`${API_BASE_URL}/work-bg/${id}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating BG entry:", error);
      throw error;
    }
  },

  updateStatus: async (id, statusData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/work-bg/${id}/status`, statusData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating BG entry status:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/work-bg/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting BG entry:", error);
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

  getAllApprovedNocEntries: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wonoc/all`, {
        params: { Status: "hod_app" },
         headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading approved NOC entries:", error);
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
};

export { WorkBgApi };