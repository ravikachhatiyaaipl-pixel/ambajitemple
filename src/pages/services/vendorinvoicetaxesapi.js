import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const VendorInvoiceTaxesApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-invoice-charges`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || '',
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.success) {
        return {
          data: response.data.data?.data || [],
          pagination: {
            current_page: response.data.data?.current_page || 1,
            last_page: response.data.data?.last_page || 1,
            per_page: response.data.data?.per_page || 10,
            total: response.data.data?.total || 0,
            from: response.data.data?.from || 0,
            to: response.data.data?.to || 0,
          },
          success: response.data.success
        };
      }
      throw new Error(response.data.message || "Failed to fetch tax types");
    } catch (error) {
      console.error("API Error loading tax types:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoice-charges/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch tax type");
    } catch (error) {
      console.error("API Error loading tax type:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/invoice-charges`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to create tax type");
    } catch (error) {
      console.error("API Error creating tax type:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/invoice-charges/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to update tax type");
    } catch (error) {
      console.error("API Error updating tax type:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/invoice-charges/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete tax type");
    } catch (error) {
      console.error("API Error deleting tax type:", error);
      throw error;
    }
  },

  getLedgers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ledgers/all/data`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("API Error loading ledgers:", error);
      throw error;
    }
  },
};

export { VendorInvoiceTaxesApi };