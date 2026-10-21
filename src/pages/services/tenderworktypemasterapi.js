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

const TenderWorkTypeMasterApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-tender-type`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || '',
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return {
        data: response.data.data || [],
        meta: response.data.meta || {},
        success: response.data.success
      };
    } catch (error) {
      console.error("Error fetching tender works:", error);
      throw new Error(error.response?.data?.message || "Failed to load tender works");
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tender-type/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to load tender work");
    } catch (error) {
      console.error("Error fetching tender work:", error);
      throw new Error(error.response?.data?.message || "Failed to load tender work");
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tender-type`, {
        TnT_Code: data.TnT_Code,
        TnT_Name: data.TnT_Name,
        Is_Active:data.Is_Active
      },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to create tender work");
    } catch (error) {
      console.error("Error creating tender work:", error);
      if (error.response?.data?.errors) {
        throw new Error(Object.values(error.response.data.errors).join(', '));
      }
      throw new Error(error.response?.data?.message || "Failed to create tender work");
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tender-type/${id}`, {
        TnT_Code: data.TnT_Code,
        TnT_Name: data.TnT_Name,
        Is_Active:data.Is_Active
      },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to update tender work");
    } catch (error) {
      console.error("Error updating tender work:", error);
      if (error.response?.data?.errors) {
        throw new Error(Object.values(error.response.data.errors).join(', '));
      }
      throw new Error(error.response?.data?.message || "Failed to update tender work");
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tender-type/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete tender work");
    } catch (error) {
      console.error("Error deleting tender work:", error);
      throw new Error(error.response?.data?.message || "Failed to delete tender work");
    }
  },
};

export { TenderWorkTypeMasterApi };