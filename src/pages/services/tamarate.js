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

const Tamarate = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-ta-ma-rate`, { params },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching TA-MA rates:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ta-ma-rate/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error fetching TA-MA rate ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ta-ma-rate`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error creating TA-MA rate:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/ta-ma-rate/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error updating TA-MA rate ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/ta-ma-rate/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting TA-MA rate ${id}:`, error);
      throw error;
    }
  },

  getEmpGrades: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-grade/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching employee grades:", error);
      throw error;
    }
  },
  
  getCityGrades: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/city-grade/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching city grades:", error);
      throw error;
    }
  }
};

export default Tamarate;