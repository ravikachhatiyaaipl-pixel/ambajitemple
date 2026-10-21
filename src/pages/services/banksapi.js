import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const BanksApi = {
  getAllBanks: async (page = 1, perPage = 10, search = '', filters = {}) => {
  try {
    let url = `${API_BASE_URL}/lst-banks?page=${page}&per_page=${perPage} `;
    
    // Add generic search if present
    if (search && search.trim() !=  '') {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    
    // Add specific field filters
    if (filters.bank_code && filters.bank_code.trim() !=  '') {
      url += `&bank_code=${encodeURIComponent(filters.bank_code.trim())}`;
    }
    if (filters.bank_name && filters.bank_name.trim() !=  '') {
      url += `&bank_name=${encodeURIComponent(filters.bank_name.trim())}`;
    }
    if (filters.short_name && filters.short_name.trim() !=  '') {
      url += `&short_name=${encodeURIComponent(filters.short_name.trim())}`;
    }
    if (filters.is_active !=  '' && filters.is_active !=  null && filters.is_active !=  undefined) {
      url += `&is_active=${filters.is_active}`;
    }
    
    const response = await axios.get(url ,{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data.success) {
      const paginationData = response.data.data;
      
      return {
        banks: paginationData?.data || [],
        pagination: {
          current_page: paginationData?.current_page || 1,
          last_page: paginationData?.last_page || 1,
          per_page: paginationData?.per_page || perPage,
          total: paginationData?.total || 0,
          from: paginationData?.from || 0,
          to: paginationData?.to || 0,
        },
        count: paginationData?.total || 0,
      };
    }
    throw new Error(response.data.message || "Failed to fetch banks");
  } catch (error) {
    console.error("Error fetching banks:", error);
    throw error;
  }
},

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banks/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch bank");
    } catch (error) {
      console.error(`Error fetching bank ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/banks`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      // Return the created bank data (response is the bank object directly)
      return response.data;
    } catch (error) {
      console.error("Error creating bank:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/banks/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating bank ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/banks/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.status ==  200 || response.status ==  204) {
        return { success: true };
      }
      throw new Error("Failed to delete bank");
    } catch (error) {
      console.error(`Error deleting bank ${id}:`, error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banks/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching all banks:", error);
      return [];
    }
  }
};

export { BanksApi };