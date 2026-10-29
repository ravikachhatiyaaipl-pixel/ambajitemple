import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const TaxSlabApi = {
  // Get paginated list with search (for list page)
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-tax-slab`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || ''
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      return {
        data: response.data.data || [],
        meta: response.data.pagination || {  // ← Changed from 'meta' to 'pagination'
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: response.data.data?.length || 0,
          from: 1,
          to: response.data.data?.length || 0
        }
      };
    } catch (error) {
      console.error("Error fetching tax slabs:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get all tax slabs (for dropdowns, etc.)
  getAllTaxSlabs: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tax-slab/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching all tax slabs:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get single tax slab by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tax-slab/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error fetching tax slab ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  // Create new tax slab
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tax-slab`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating tax slab:", error);
      if (error.response?.data?.errors) {
        throw error.response.data;
      }
      throw error.response?.data || error.message;
    }
  },

  // Update existing tax slab
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tax-slab/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error updating tax slab ${id}:`, error);
      if (error.response?.data?.errors) {
        throw error.response.data;
      }
      throw error.response?.data || error.message;
    }
  },

  // Delete tax slab
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tax-slab/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting tax slab ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export { TaxSlabApi };