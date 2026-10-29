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

export const LoanTypeMasterApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-loan-type`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
      return response.data;
    } catch (error) {
      console.error("Error fetching loan types:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/loan-type/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        } });
      return response.data;
    } catch (error) {
      console.error(`Error fetching loan type ${id}:`, error);
      throw error;
    }
  },

  create: async (loanTypeData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/loan-type`, loanTypeData , {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
    });
      return response.data;
    } catch (error) {
      console.error("Error creating loan type:", error);
      throw error;
    }
  },

  update: async (id, loanTypeData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/loan-type/${id}`, loanTypeData , {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error(`Error updating loan type ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/loan-type/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting loan type ${id}:`, error);
      throw error;
    }
  }

};

export default LoanTypeMasterApi;