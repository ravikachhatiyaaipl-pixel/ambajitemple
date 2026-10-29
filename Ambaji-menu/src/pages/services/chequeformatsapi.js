import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const ChequeFormatsApi = {
  getAllChequeFormats: async (page = 1, perPage = 10, search = '', filters = {}) => {
    try {
      let url = `${API_BASE_URL}/lst-cheque-formats?page=${page}&per_page=${perPage}`;
      
      // Add generic search if present
      if (search && search.trim() !=  '') {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      // Add specific field filters
      if (filters.Bank_Id && filters.Bank_Id !=  '') {  
        url += `&Bank_Id=${filters.Bank_Id}`;
      }
      if (filters.format_name && filters.format_name.trim() !=  '') {
        url += `&format_name=${encodeURIComponent(filters.format_name.trim())}`;
      }
      if (filters.is_active !=  '' && filters.is_active !=  null && filters.is_active !=  undefined) {
        url += `&is_active=${filters.is_active}`;
      }
      if (filters.status && filters.status !=  '') {
        url += `&status=${filters.status}`;
      }
      
      const response = await axios.get(url ,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.success) {
        const paginationData = response.data.data;
        
        return {
          chequeFormats: paginationData?.data || [],
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
      throw new Error(response.data.message || "Failed to fetch cheque formats");
    } catch (error) {
      console.error("Error fetching cheque formats:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheque-formats/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching cheque format ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cheque-formats`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating cheque format:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/cheque-formats/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating cheque format ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cheque-formats/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.status ==  200 || response.status ==  204) {
        return { success: true };
      }
      throw new Error("Failed to delete cheque format");
    } catch (error) {
      console.error(`Error deleting cheque format ${id}:`, error);
      throw error;
    }
  },

  getAll: async () => {
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
      console.error("Error fetching all cheque formats:", error);
      return [];
    }
  },

  clone: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cheque-formats/${id}/clone`, null, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error cloning cheque format ${id}:`, error);
      throw error;
    }
  }
};

export { ChequeFormatsApi };