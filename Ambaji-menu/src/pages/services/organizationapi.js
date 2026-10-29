
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

const OrganizationApi = {

  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-org-master`, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching organizations:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/org-master/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error(`Error fetching organization ${id}:`, error);
      throw error;
    }
  },

  create: async (organizationData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/org-master`, organizationData , {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("Error creating organization:", error);
      throw error;
    }
  },

  update: async (id, organizationData) => {
    try {
      // Laravel/PHP does not parse multipart body on PUT, so spoof PUT via POST
      let payload = organizationData;
      if (payload instanceof FormData) {
        if (!payload.has('_method')) {
          payload.append('_method', 'PUT');
        }
      } else if (payload && typeof payload === 'object') {
        payload = { ...payload, _method: 'PUT' };
      }
      const response = await axios.post(`${API_BASE_URL}/org-master/${id}`, payload , {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error(`Error updating organization ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/org-master/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting organization ${id}:`, error);
      throw error;
    }
  }

};

export default OrganizationApi;