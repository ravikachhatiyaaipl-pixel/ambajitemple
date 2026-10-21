import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const NocEntryApi = {
  // Get all NOC entries with pagination
  getAll: async (page = 1, perPage = 15, search = "", status = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(status && { Status: status })
      };

      const response = await axios.get(`${API_BASE_URL}/lst-wonoc`, { params },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

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
      console.error("API Error loading NOC entries:", error);
      throw error;
    }
  },

  // Get single NOC entry by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wonoc/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error loading NOC entry:", error);
      throw error;
    }
  },

  // Create new NOC entry - Send as JSON
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wonoc`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating NOC entry:", error);
      throw error;
    }
  },

  // Update NOC entry - Send as JSON
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/wonoc/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating NOC entry:", error);
      throw error;
    }
  },

  // Delete NOC entry
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/wonoc/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting NOC entry:", error);
      throw error;
    }
  },

  // Get all work allocations for dropdown
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

  // NEW: Get subledgers by work allocation ID
  getSubledgersByWorkAllocation: async (waId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wonoc/subledger-by-wa/${waId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error loading subledgers by work allocation:", error);
      throw error;
    }
  },

  // Remove the old getAllSubledgers function as it's no longer needed
  // getAllSubledgers: async () => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/sub-ledgers/all`);
  //     return response.data;
  //   } catch (error) {
  //     console.error("API Error loading subledgers:", error);
  //     throw error;
  //   }
  // }
};

export { NocEntryApi };