import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const BookAccountsApi = {

  getAllBukLedger: async (page = 1, perPage = 10, filterDeletedBuk = true, search = '') => {
    try {
      let url = `${API_BASE_URL}/lst-ledgers?page=${page}&per_page=${perPage}&filter_deleted_buk_y=${filterDeletedBuk}`;
      
      if (search && search.trim() != '') {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await axios.get(url , {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.success) {
        return {
          ledgers: response.data.data?.data || [],
          pagination: {
            current_page: response.data.data?.current_page || 1,
            last_page: response.data.data?.last_page || 1,
            per_page: response.data.data?.per_page || perPage,
            total: response.data.data?.total || 0,
            from: response.data.data?.from || 0,
            to: response.data.data?.to || 0,
          },
          success: response.data.success
        };
      }
      throw new Error(response.data.message || "Failed to fetch ledgers");
    } catch (error) {
      console.error("Error fetching ledgers:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ledgers/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch ledger");
    } catch (error) {
      console.error(`Error fetching ledger ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ledgers`, data , {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to create ledger");
    } catch (error) {
      console.error("Error creating ledger:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/ledgers/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to update ledger");
    } catch (error) {
      console.error(`Error updating ledger ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/ledgers/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete ledger");
    } catch (error) {
      console.error(`Error deleting ledger ${id}:`, error);
      throw error;
    }
  },

  getLedgerGroups: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-ledg-grps`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status ==  "success") {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching ledger groups:", error);
      throw error;
    }
  }

};

export { BookAccountsApi };