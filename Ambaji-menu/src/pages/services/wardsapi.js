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

const WardsApi = {
  getAll: async (params = {}) => {
    try {
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params
      };
      
      const response = await axios.get(`${API_BASE_URL}/lst-wards`, { 
        params: queryParams ,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wards/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error fetching ward ${id}:`, error);
      throw error;
    }
  },

  create: async (wardData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wards`, wardData,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating ward:", error);
      throw error;
    }
  },

  update: async (id, wardData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/wards/${id}`, wardData,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error updating ward ${id}:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/wards/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting ward ${id}:`, error);
      throw error;
    }
  },

  getZones: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zone-master/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching zones:", error);
      throw error;
    }
  }
};

export default WardsApi;