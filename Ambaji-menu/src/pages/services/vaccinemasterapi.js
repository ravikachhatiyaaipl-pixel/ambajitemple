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

const VaccineMasterApi = {
  // Get all vaccines with pagination and search
  getAll: async (page = 1, perPage = 10, search = "") => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-vaccine`, {
        params: {
          page,
          per_page: perPage,
          ...(search && { search }),
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      return {
        data: response.data.data?.data || [],
        meta: {
          current_page: response.data.data?.current_page || 1,
          last_page: response.data.data?.last_page || 1,
          per_page: response.data.data?.per_page || perPage,
          total: response.data.data?.total || 0,
        },
      };
    } catch (error) {
      console.error("API Error loading vaccines:", error);
      throw error;
    }
  },

  // Get all vaccines (no pagination)
  getAllUnpaginated: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vaccine/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.status) {
        return response.data.data;
      }
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading all vaccines:", error);
      throw error;
    }
  },

  // Get single vaccine by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-vaccine`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      const allData = response.data.data?.data || [];
      const record = allData.find((r) => String(r.VM_Id) ==  String(id));
      if (!record) throw new Error("Record not found");
      return record;
    } catch (error) {
      console.error("API Error loading vaccine:", error);
      throw error;
    }
  },

  // Create new vaccine
  create: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/vaccine`, formData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating vaccine:", error);
      throw error;
    }
  },

  // Update vaccine
  update: async (id, formData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/vaccine/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
         
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
       
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating vaccine:", error);
      throw error;
    }
  },

  // Delete vaccine
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/vaccine/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting vaccine:", error);
      throw error;
    }
  },
};

export { VaccineMasterApi };