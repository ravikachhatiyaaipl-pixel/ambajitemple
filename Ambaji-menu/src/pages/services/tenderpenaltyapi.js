import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const tenderPenaltyApi = {
    getAll: async (params = {}) => {
      try {
        const queryParams = {
          page: params.page || 1,
          per_page: params.perPage || 10,
          search: params.search || '',
        };
        
        // Add status filter if not "all"
        if (params.status && params.status != 'all') {
          queryParams.Status = params.status;
        }
  
        const response = await axios.get(`${API_BASE_URL}/lst-tender-adjustments`, {
          params: queryParams,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
        });
  
        const apiData = response.data.data;
        return {
          data: apiData?.data || [],
          meta: {
            current_page: apiData?.current_page || 1,
            last_page: apiData?.last_page || 1,
            per_page: apiData?.per_page || params.perPage,
            total: apiData?.total || 0,
            from: apiData?.from || 0,
            to: apiData?.to || 0,
          },
          success: true
        };
      } catch (error) {
        console.error("Error fetching tender adjustments:", error);
        throw new Error(error.response?.data?.message || "Failed to load tender adjustments");
      }
    },

  // Get single tender adjustment by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tender-adjustments/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data;
    } catch (error) {
      console.error("Error fetching tender adjustment:", error);
      throw new Error(error.response?.data?.message || "Failed to load tender adjustment");
    }
  },

  // Create new tender adjustment
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tender-adjustments`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating tender adjustment:", error);
      if (error.response?.data?.errors) {
        throw error;
      }
      throw new Error(error.response?.data?.message || "Failed to create tender adjustment");
    }
  },

  // Update existing tender adjustment
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tender-adjustments/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error updating tender adjustment:", error);
      if (error.response?.data?.errors) {
        throw error;
      }
      throw new Error(error.response?.data?.message || "Failed to update tender adjustment");
    }
  },

  // Delete tender adjustment
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tender-adjustments/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error deleting tender adjustment:", error);
      throw new Error(error.response?.data?.message || "Failed to delete tender adjustment");
    }
  },

  // Get all sub-ledgers for dropdown
  getSubLedgers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sub-ledgers/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching sub-ledgers:", error);
      throw new Error(error.response?.data?.message || "Failed to load sub-ledgers");
    }
  },

  // Get work allocations filtered by sub-ledger 
  getAllocationsBySubLedger: async (subLedgerId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/work-allocation/sl/${subLedgerId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching allocations by sub-ledger:", error);
      throw error;
    }
  },
};

export { tenderPenaltyApi };