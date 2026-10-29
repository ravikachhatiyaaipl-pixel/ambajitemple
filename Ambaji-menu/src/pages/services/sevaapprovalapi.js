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

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

const SevaApprovalApi = {
  // All seva bookings (server side pagination + search)
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/seva/bookings`, {
        params,
        headers: authHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching seva bookings:", error);
      throw error;
    }
  },

  // Bookings jinka CURRENT step is user ko perform/view karna hai
  // (authority filtered - shop approval list jaisa)
  getPendingApprovals: async (params = {}) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/seva/bookings/pending-approvals`,
        {
          params,
          headers: authHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      throw error;
    }
  },

  // Single booking by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/seva/bookings/${id}`, {
        headers: authHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching seva booking ${id}:`, error);
      throw error;
    }
  },

  // Approval chain (Action Master stage SEV)
  getApprovalChain: async (stage = "SEV") => {
    try {
      const response = await axios.get(`${API_BASE_URL}/seva/approval-chain`, {
        params: { stage },
        headers: authHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching approval chain:", error);
      throw error;
    }
  },

  // Priests list (priest assignment ke liye)
  getPriests: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/seva/priests`, {
        headers: authHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching priests:", error);
      throw error;
    }
  },

  // Forward approval - next step par move
  approve: async (id, data = {}) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/seva/bookings/${id}/approve`,
        data,
        { headers: authHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error approving booking:", error);
      throw error;
    }
  },

  // Query raise - previous stage par wapas
  raiseQuery: async (id, reason) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/seva/bookings/${id}/query`,
        { reason },
        { headers: authHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error raising query:", error);
      throw error;
    }
  },

  // Reject booking
  reject: async (id, reason) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/seva/bookings/${id}/reject`,
        { reason },
        { headers: authHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error rejecting booking:", error);
      throw error;
    }
  },

  // Priest assign
  assignPriest: async (id, priestId, role = "LEAD") => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/seva/bookings/${id}/assign-priest`,
        { priest_id: Number(priestId), role },
        { headers: authHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning priest:", error);
      throw error;
    }
  },
};

export default SevaApprovalApi;
