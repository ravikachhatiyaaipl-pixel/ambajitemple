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

export const GrantAuthoritiesMasterApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-gr-auth-master`, {
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
      throw new Error(response.data.message || "Failed to fetch grant authorities");
    } catch (error) {
      console.error("Error fetching grant authorities:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gr-auth-master/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch grant authority");
    } catch (error) {
      console.error(`Error fetching grant authority ${id}:`, error);
      throw error;
    }
  },

  create: async (grantAuthorityData) => {
    try {
      const apiData = {
        GA_Code: grantAuthorityData.GA_Code || null,
        GA_Name: grantAuthorityData.GA_Name,
        Is_Active: grantAuthorityData.is_active ? 1 : 0,
      };
      
      const response = await axios.post(`${API_BASE_URL}/gr-auth-master`, apiData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create grant authority");
    } catch (error) {
      console.error("Error creating grant authority:", error);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        throw new Error(errors[0] || "Validation failed");
      }
      throw error;
    }
  },

  update: async (id, grantAuthorityData) => {
    try {
      const apiData = {
        GA_Code: grantAuthorityData.GA_Code || null,
        GA_Name: grantAuthorityData.GA_Name,
        Is_Active: grantAuthorityData.is_active ? 1 : 0,
      };
      
      const response = await axios.put(`${API_BASE_URL}/gr-auth-master/${id}`, apiData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update grant authority");
    } catch (error) {
      console.error(`Error updating grant authority ${id}:`, error);
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        throw new Error(errors[0] || "Validation failed");
      }
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/gr-auth-master/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to delete grant authority");
    } catch (error) {
      console.error(`Error deleting grant authority ${id}:`, error);
      throw error;
    }
  }
};