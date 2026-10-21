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

const DogBiteCasesApi = {
  // Get all dog bite cases with pagination and search
  getAll: async (page = 1, perPage = 10, search = "") => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-dog-bite-cases`, {
        params: {
          page,
          per_page: perPage,
          ...(search && { search }),
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },

      });

      if (response.data.status) {
        return {
          data: response.data.data.data || [],
          meta: {
            current_page: response.data.data.current_page || 1,
            last_page: response.data.data.last_page || 1,
            per_page: response.data.data.per_page || perPage,
            total: response.data.data.total || 0,
          },
        };
      }
      return {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: 0,
        },
      };
    } catch (error) {
      console.error("API Error loading dog bite cases:", error);
      throw error;
    }
  },

  // Get all dog bite cases (no pagination)
  getAllUnpaginated: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-dog-bite-cases/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("API Error loading all dog bite cases:", error);
      throw error;
    }
  },

  // Get single dog bite case by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-dog-bite-cases`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status && response.data.data.data) {
        const record = response.data.data.data.find((r) => String(r.DBC_Id) ==  String(id));
        if (!record) throw new Error("Record not found");
        return record;
      }
      throw new Error("Record not found");
    } catch (error) {
      console.error("API Error loading dog bite case:", error);
      throw error;
    }
  },

  // Create new dog bite case
  create: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/dog-bite-cases`, formData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating dog bite case:", error);
      throw error;
    }
  },

  // Update dog bite case
  update: async (id, formData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/dog-bite-cases/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating dog bite case:", error);
      throw error;
    }
  },

  // Delete dog bite case
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/dog-bite-cases/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error deleting dog bite case:", error);
      throw error;
    }
  },
};

export { DogBiteCasesApi };