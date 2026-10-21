// src/services/workallocationapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const WorkAllocationApi = {
  // Get department → ledger → tender structure
  getDepartmentLedgerTenders: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dept-ledger-tenders`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching department ledger tenders:", error);
      throw error;
    }
  },

  // Get all work allocations with pagination and search
  getAll: async (page = 1, perPage = 10, search = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
      };

      if (search) {
        params.search = search;
      }

      const response = await axios.get(`${API_BASE_URL}/lst-work-allocations`, { params },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});

      return {
        allocations: response.data.data || [],
        pagination: {
          current_page: response.data.meta?.current_page || 1,
          last_page: response.data.meta?.last_page || 1,
          per_page: response.data.meta?.per_page || perPage,
          total: response.data.meta?.total || 0,
          from: response.data.meta?.from || 0,
          to: response.data.meta?.to || 0,
        },
      };
    } catch (error) {
      console.error("Error fetching allocations:", error);
      throw error;
    }
  },


  // Get single allocation by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/work-allocations/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching allocation:", error);
      throw error;
    }
  },

  // Create new work allocation with documents
  create: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/work-allocations`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating allocation:", error);
      throw error;
    }
  },

  // Update work allocation with documents
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/work-allocations/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating allocation:", error);
      throw error;
    }
  },

  // Delete work allocation
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/work-allocations/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error deleting allocation:", error);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (docId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/work-allocation/wa-document/${docId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting document:", error);
      throw error;
    }
  },

  // Get vendors (sub-ledgers) for dropdown
  getVendors: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sub-ledgers/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching vendors:", error);
      throw error;
    }
  },
};

export { WorkAllocationApi };