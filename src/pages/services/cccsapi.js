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

const CccsApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-cccs`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
      return response.data;
    } catch (error) {
      console.error("Error fetching CCCs:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cccs/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching CCC ${id}:`, error);
      throw error;
    }
  },

  create: async (cccData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cccs`, cccData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating CCC:", error);
      throw error;
    }
  },

  update: async (id, cccData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/cccs/${id}`, cccData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating CCC ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cccs/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting CCC ${id}:`, error);
      throw error;
    }
  },

  getWards: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wards/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw error;
    }
  }
};

export default CccsApi;