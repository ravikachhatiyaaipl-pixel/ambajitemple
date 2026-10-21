import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const ChequesApi = {
  // List cheques with pagination and filters
  getAllCheques: async (page = 1, perPage = 10, search = '', filters = {}) => {
    try {
      let url = `${API_BASE_URL}/lst-cheques?page=${page}&per_page=${perPage}`;
      if (search && search.trim() !=  '') {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      // Add specific field filters
      if (filters.cheque_number && filters.cheque_number.trim() !=  '') {
        url += `&cheque_number=${encodeURIComponent(filters.cheque_number.trim())}`;
      }
      if (filters.SL_Name && filters.SL_Name.trim() !=  '') {
        url += `&SL_Name=${encodeURIComponent(filters.SL_Name.trim())}`;
      }
      if (filters.amount && filters.amount.toString().trim() !=  '') {
        url += `&amount=${encodeURIComponent(filters.amount.toString().trim())}`;
      }
      if (filters.status && filters.status.toString().trim() !=  '') {
        url += `&status=${encodeURIComponent(filters.status.toString().trim())}`;
      }
      if (filters.date_from && filters.date_from.trim() !=  '') {
        url += `&date_from=${encodeURIComponent(filters.date_from.trim())}`;
      }
      if (filters.date_to && filters.date_to.trim() !=  '') {
        url += `&date_to=${encodeURIComponent(filters.date_to.trim())}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.success) {
        const paginationData = response.data.data;
        
        return {
          cheques: paginationData?.data || [],
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
      throw new Error(response.data.message || "Failed to fetch cheques");
    } catch (error) {
      console.error("Error fetching cheques:", error);
      throw error;
    }
  },

  // Get cheque by ID
  getById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/cheques/${id}?with=cheque_format,cheque_book,organize,chl_voucher`,
        {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch cheque");
    } catch (error) {
      console.error(`Error fetching cheque ${id}:`, error);
      throw error;
    }
  },

  // Create new cheque
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cheques`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating cheque:", error);
      throw error;
    }
  },

  // Update cheque
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/cheques/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating cheque ${id}:`, error);
      throw error;
    }
  },

  // Get all cheque books
  getAllChequeBooks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheque-books/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching cheque books:", error);
      return [];
    }
  },

  // Get all cheque formats
  getAllChequeFormats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheque-formats/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching cheque formats:", error);
      return [];
    }
  },

  // Delete cheque
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cheques/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.status ==  200 || response.status ==  204 || response.data.success) {
        return { success: true };
      }
      throw new Error("Failed to delete cheque");
    } catch (error) {
      console.error(`Error deleting cheque ${id}:`, error);
      throw error;
    }
  },

  // Get organizations list
  getOrganizations: async (page = 1, perPage = 100) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-org-master?page=${page}&per_page=${perPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  },

  // Get bank accounts list
  getBankAccounts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bank-accounts/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      return [];
    }
  },

  // Get cheque books list
  getChequeBooks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheque-books/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching cheque books:", error);
      return [];
    }
  },

  // Get cheque formats list
  getChequeFormats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheque-formats/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching cheque formats:", error);
      return [];
    }
  },

  // Get all cheques (for dropdown/select)
  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheques/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching all cheques:", error);
      return [];
    }
  }
  
};

export { ChequesApi };