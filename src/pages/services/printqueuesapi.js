import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const PrintQueuesApi = {
  // Get paginated list with filters
  getAllPrintQueues: async (page = 1, perPage = 10, search = '', statusFilter = '') => {
    try {
      let url = `${API_BASE_URL}/lst-print-queues?page=${page}&per_page=${perPage}`;
      
      // Add search parameter (can search by cheque_id)
      if (search && search.trim() !=  '') {
        // Check if search is numeric (for cheque_id) or text (for status)
        if (!isNaN(search) && search.trim() !=  '') {
          url += `&cheque_id=${encodeURIComponent(search.trim())}`;
        } else {
          url += `&print_status=${encodeURIComponent(search.trim().toLowerCase())}`;
        }
      }
      
      // Add status filter (printed/pending)
      if (statusFilter && statusFilter !=  '') {
        url += `&print_status=${encodeURIComponent(statusFilter)}`;
      }
      
      const response = await axios.get(url,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      
      // Handle Laravel pagination response format
      if (response.data && response.data.data) {
        return {
          printQueues: response.data.data || [],
          pagination: {
            current_page: response.data.current_page || 1,
            last_page: response.data.last_page || 1,
            per_page: response.data.per_page || perPage,
            total: response.data.total || 0,
            from: response.data.from || 0,
            to: response.data.to || 0,
          },
          count: response.data.total || 0,
        };
      }
      
      throw new Error(response.data.message || "Failed to fetch print queues");
    } catch (error) {
      console.error("Error fetching print queues:", error);
      throw error;
    }
  },

  // Get by ID for view/edit
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/print-queues/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch print queue");
    } catch (error) {
      console.error(`Error fetching print queue ${id}:`, error);
      throw error;
    }
  },

  // Create new print queue
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/print-queues`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create print queue");
    } catch (error) {
      console.error("Error creating print queue:", error);
      throw error;
    }
  },

  // Update print queue
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/print-queues/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update print queue");
    } catch (error) {
      console.error(`Error updating print queue ${id}:`, error);
      throw error;
    }
  },

  // Delete print queue
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/print-queues/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
      throw new Error("Failed to delete print queue");
    } catch (error) {
      console.error(`Error deleting print queue ${id}:`, error);
      throw error;
    }
  },

  // Get all print queues (for dropdowns etc.)
  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/print-queues/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching all print queues:", error);
      return [];
    }
  }
};

export { PrintQueuesApi };