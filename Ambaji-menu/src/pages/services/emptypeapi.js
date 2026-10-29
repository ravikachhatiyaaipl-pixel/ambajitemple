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

const EmpTypeApi = {
  // Get paginated list with filters
  getPaginated: async (page = 1, perPage = 10, search = '', status = '') => {
    try {
      const params = {
        page,
        per_page: perPage
      };
      
      if (search && search.trim() != '') {
        params.search = search;
      }
      
      if (status && status != 'all') {
        params.status = status;
      }
      
      const response = await axios.get(`${API_BASE_URL}/lst-emp-type`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
      return response.data;
    } catch (error) {
      console.error("Error fetching paginated employee types:", error);
      throw error;
    }
  },

  // Get all records (for stats)
  getAllForStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-emp-type`, { 
        params: { per_page: 1000 } // Get maximum records for stats
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee types for stats:", error);
      throw error;
    }
  },

  // Get single record by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-type/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee type ${id}:`, error);
      throw error;
    }
  },

  // Create new record
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emp-type`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating employee type:", error);
      throw error;
    }
  },

  // Update record
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/emp-type/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating employee type ${id}:`, error);
      throw error;
    }
  },

  // Delete record
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/emp-type/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting employee type ${id}:`, error);
      throw error;
    }
  }
};

export default EmpTypeApi;