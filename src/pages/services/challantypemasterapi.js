/***
*
*  Application Name: I3EMS
*
*  Developed By: Aark InfoSoft Pvt Ltd.
*
*  Version: Ambaji Mata Temple Management
*  
*  All Rights Reserved...
*  
*/

import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const ChallanTypeMasterApi = {
  // Fetch paginated list with search
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-challan-type`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || '',
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      // The API response structure: { success: true, data: { data: [...], meta: {...} } }
      return {
        data: response.data.data.data || [],
        meta: response.data.data || {}, // Contains pagination info
        success: response.data.success
      };
    } catch (error) {
      console.error("Error fetching challan types:", error);
      throw new Error(error.response?.data?.message || "Failed to load challan types");
    }
  },

  // Fetch a single record by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/challan-type/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to load challan type");
    } catch (error) {
      console.error("Error fetching challan type:", error);
      throw new Error(error.response?.data?.message || "Failed to load challan type");
    }
  },

  // Create a new record
  create: async (data) => {
    try {
      // Payload must match { "Cht_Code": "...", "Cht_Name": "..." }
      const response = await axios.post(`${API_BASE_URL}/challan-type`, {
        Cht_Code: data.code,
        Cht_Name: data.name,
        Is_Active:data.Is_Active
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to create challan type");
    } catch (error) {
      console.error("Error creating challan type:", error);
      if (error.response?.data?.errors) {
        throw new Error(Object.values(error.response.data.errors).join(', '));
      }
      throw new Error(error.response?.data?.message || "Failed to create challan type");
    }
  },

  // Update an existing record
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/challan-type/${id}`, {
        Cht_Code: data.code,
        Cht_Name: data.name,
        Is_Active:data.Is_Active
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to update challan type");
    } catch (error) {
      console.error("Error updating challan type:", error);
      if (error.response?.data?.errors) {
        throw new Error(Object.values(error.response.data.errors).join(', '));
      }
      throw new Error(error.response?.data?.message || "Failed to update challan type");
    }
  },

  // Delete a record
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/challan-type/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete challan type");
    } catch (error) {
      console.error("Error deleting challan type:", error);
      throw new Error(error.response?.data?.message || "Failed to delete challan type");
    }
  },
};

export { ChallanTypeMasterApi };