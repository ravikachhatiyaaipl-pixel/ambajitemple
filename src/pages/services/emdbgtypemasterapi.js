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

const EmdbgTypeApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-emdbg-type`, {
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
        meta: response.data.meta || {}
      };
    } catch (error) {
      console.error("Error fetching EMDBG types:", error);
      throw error.response?.data || error.message;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emdbg-type/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching EMDBG type ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emdbg-type`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating EMDBG type:", error);
      throw error.response?.data || error.message;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/emdbg-type/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating EMDBG type ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/emdbg-type/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting EMDBG type ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export { EmdbgTypeApi };