// granttypemasterapi.js
/***
*
*  Application Name: I3EMS
*
*  Developed By: Aark InfoSoft Pvt Ltd.
*
*  Version: Ambaji Mata Temple Management
*  
*  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
*  All source code, database structures, UI/UX designs, workflows,
*  business logic, and documentation are confidential intellectual property.
*  Reverse engineering, duplication, or redistribution without written permission
*  is strictly prohibited and may result in legal action.
*  
*/

import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const GrantTypeMasterApi = {

  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-grant-types`, {
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
      throw new Error(response.data.message || "Failed to fetch grant types");
    } catch (error) {
      console.error("Error fetching grant types:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-types/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch grant type");
    } catch (error) {
      console.error(`Error fetching grant type ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/grant-types`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create grant type");
    } catch (error) {
      console.error("Error creating grant type:", error);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        throw new Error(errors[0] || "Validation failed");
      }
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/grant-types/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update grant type");
    } catch (error) {
      console.error(`Error updating grant type ${id}:`, error);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        throw new Error(errors[0] || "Validation failed");
      }
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/grant-types/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to delete grant type");
    } catch (error) {
      console.error(`Error deleting grant type ${id}:`, error);
      throw error;
    }
  },

  getGrantAuthorities: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gr-auth-master/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {        
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching grant authorities:", error);
      throw error;
    }
  },

  getGrantCategories: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-cat/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching grant categories:", error);
      throw error;
    }
  }

};

export { GrantTypeMasterApi };