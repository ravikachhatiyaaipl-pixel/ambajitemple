import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const BankAccountsApi = {
  getAll: async (page = 1, perPage = 10, search = '', filters = {}) => {
    try {
      let url = `${API_BASE_URL}/lst-bank-accounts?page=${page}&per_page=${perPage}`;
      
      // Handle search parameter (generic search)
      if (search && search.trim() !=  '') {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      // Handle specific field filters
      if (filters.account_number && filters.account_number.trim() !=  '') {
        url += `&account_number=${encodeURIComponent(filters.account_number.trim())}`;
      }
      if (filters.ifsc && filters.ifsc.trim() !=  '') {
        url += `&ifsc=${encodeURIComponent(filters.ifsc.trim())}`;
      }
      if (filters.account_name && filters.account_name.trim() !=  '') {
        url += `&account_name=${encodeURIComponent(filters.account_name.trim())}`;
      }
      if (filters.branch_name && filters.branch_name.trim() !=  '') {
        url += `&branch_name=${encodeURIComponent(filters.branch_name.trim())}`;
      }
      if (filters.bank_name && filters.bank_name.trim() !=  '') {
        url += `&bank_name=${encodeURIComponent(filters.bank_name.trim())}`;
      }
      if (filters.city && filters.city.trim() !=  '') {
        url += `&city=${encodeURIComponent(filters.city.trim())}`;
      }
      if (filters.account_type && filters.account_type.trim() !=  '') {
        url += `&account_type=${encodeURIComponent(filters.account_type.trim())}`;
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
          bankAccounts: paginationData?.data || [],
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
      throw new Error(response.data.message || "Failed to fetch bank accounts");
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bank-accounts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch bank account");
    } catch (error) {
      console.error(`Error fetching bank account ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bank-accounts`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating bank account:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/bank-accounts/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating bank account ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/bank-accounts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.status ==  200 || response.status ==  204) {
        return { success: true };
      }
      if (response.data?.message ==  "Successfully.") {
        return { success: true };
      }
      throw new Error(response.data?.message || "Failed to delete bank account");
    } catch (error) {
      console.error(`Error deleting bank account ${id}:`, error);
      throw error;
    }
  },

  getAllBanks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banks/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching banks:", error);
      return [];
    }
  },

  getAllOrganizations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-org-master?per_page=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data?.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  }
};

export { BankAccountsApi };