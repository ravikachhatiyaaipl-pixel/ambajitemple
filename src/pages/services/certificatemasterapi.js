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

const CertificateMasterApi = {
  // Get all certificates with pagination and search
  getAll: async (page = 1, perPage = 10, search = "") => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-certificate-master`, {
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
        data: response.data.data || [],
        meta: {
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || perPage,
          total: response.data.total || 0,
        },
      };
    } catch (error) {
      console.error("API Error loading certificates:", error);
      throw error;
    }
  },

  // Get all certificates (no pagination)
  getAllUnpaginated: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/certificate-master/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status) {
        return response.data.data;
      }
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading all certificates:", error);
      throw error;
    }
  },

  // Get single certificate by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-certificate-master` , {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      } );
      const allData = response.data.data || [];
      const record = allData.find((r) => String(r.CM_Id) ==  String(id));
      if (!record) throw new Error("Record not found");
      return record;
    } catch (error) {
      console.error("API Error loading certificate:", error);
      throw error;
    }
  },

  // Create new certificate
  create: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/certificate-master`, formData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating certificate:", error);
      throw error;
    }
  },

  // Update certificate
  update: async (id, formData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/certificate-master/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating certificate:", error);
      throw error;
    }
  },

  // Delete certificate
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/certificate-master/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error deleting certificate:", error);
      throw error;
    }
  },
};

export { CertificateMasterApi };