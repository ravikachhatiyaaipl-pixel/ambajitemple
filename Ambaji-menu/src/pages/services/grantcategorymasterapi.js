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

const GrantCategoryMasterApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-grant-cat`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || '',
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.status) {
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
          success: response.data.status
        };
      }
      throw new Error(response.data.message || "Failed to fetch grant categories");
    } catch (error) {
      console.error("Error fetching grant categories:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-cat/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch grant category");
    } catch (error) {
      console.error(`Error fetching grant category ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const apiData = {
        GC_Name: data.GC_Name,
        GC_Code: data.GC_Code || null,        
        Is_Active: data.Is_Active

      };
      
      const response = await axios.post(`${API_BASE_URL}/grant-cat`, apiData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create grant category");
    } catch (error) {
      console.error("Error creating grant category:", error);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        throw new Error(errors[0] || "Validation failed");
      }
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const apiData = {
        GC_Name: data.GC_Name,
        GC_Code: data.GC_Code || null,
        Is_Active: data.Is_Active
      };
      
      const response = await axios.put(`${API_BASE_URL}/grant-cat/${id}`, apiData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update grant category");
    } catch (error) {
      console.error(`Error updating grant category ${id}:`, error);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        throw new Error(errors[0] || "Validation failed");
      }
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/grant-cat/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to delete grant category");
    } catch (error) {
      console.error(`Error deleting grant category ${id}:`, error);
      throw error;
    }
  },
};

export { GrantCategoryMasterApi };