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

const ActionMasterApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-action-master`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || '',
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.status) {
        return {
          data: response.data.data.data || [],
          meta: {
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
            total: response.data.data.total,
            per_page: response.data.data.per_page,
            from: response.data.data.from,
            to: response.data.data.to
          },
          success: response.data.status
        };
      }
      throw new Error(response.data.message || "Failed to load actions");
    } catch (error) {
      console.error("Error fetching actions:", error);
      throw new Error(error.response?.data?.message || "Failed to load actions");
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/action-master/${id}`,
        {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
        }
      );
      if (response.data.status) {
        const data = response.data.data;
        
        return data;
      }
      throw new Error(response.data.message || "Failed to load action");
    } catch (error) {
      console.error("Error fetching action:", error);
      throw new Error(error.response?.data?.message || "Failed to load action");
    }
  },

  create: async (data) => {
    try {
      // Pass Authorities directly as array [1,2]
      // Previous_Status is now an ID (string or number)
      const response = await axios.post(`${API_BASE_URL}/action-master`, {
        Dpt_id: data.Dpt_id || null,
        St_Name: data.St_Name,
        Previous_Status: data.Previous_Status || null, // This is now an ID
        stage: data.stage || null,
        Is_Forward: data.Is_Forward || "N",
        Is_Bank_Select: data.Is_Bank_Select || "N",
        Is_Acc_Vou_No_Gen: data.Is_Acc_Vou_No_Gen || "N",
        Viewers: data.Viewers || null,
        Authorities: data.Authorities, // Just array [1,2]
        Act_Remarks: data.Act_Remarks || null
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to create action");
    } catch (error) {
      console.error("Error creating action:", error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(error.response?.data?.message || "Failed to create action");
    }
  },

  update: async (id, data) => {
    try {
      // Pass Authorities directly as array [1,2]
      // Previous_Status is now an ID (string or number)
      const response = await axios.put(`${API_BASE_URL}/action-master/${id}`, {
        Dpt_id: data.Dpt_id || null,
        St_Name: data.St_Name,
        Previous_Status: data.Previous_Status || null, // This is now an ID
        stage: data.stage || null,
        Is_Forward: data.Is_Forward || "N",
        Is_Bank_Select: data.Is_Bank_Select || "N",
        Is_Acc_Vou_No_Gen: data.Is_Acc_Vou_No_Gen || "N",
        Viewers: data.Viewers || null,
        Authorities: data.Authorities, // Just array [1,2]
        Act_Remarks: data.Act_Remarks || null
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to update action");
    } catch (error) {
      console.error("Error updating action:", error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(error.response?.data?.message || "Failed to update action");
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/action-master/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete action");
    } catch (error) {
      console.error("Error deleting action:", error);
      throw new Error(error.response?.data?.message || "Failed to delete action");
    }
  },

  getDesignations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-designation`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching designations:", error);
      throw new Error("Failed to load designations");
    }
  }
};

export { ActionMasterApi };