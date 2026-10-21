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

const ChallanVoucherApi = {
  // Get all challan vouchers with pagination
  getAll: async (page = 1, perPage = 15, search = "", dpt_id = "", start_date = "", end_date = "", Is_income = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(dpt_id && { dpt_id }),
        ...(start_date && { start_date }),
        ...(end_date && { end_date }),
        ...(Is_income && { Is_income })

      };

      const response = await axios.get(`${API_BASE_URL}/lst-chl-voucher`, { params } ,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      return {
        vouchers: response.data.data || [],
        pagination: response.data.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: 0,
        },
      };
    } catch (error) {
      console.error("API Error loading challan vouchers:", error);
      throw error;
    }
  },

  // Get single challan voucher by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chl-voucher/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading challan voucher:", error);
      throw error;
    }
  },

  // Create new challan voucher
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chl-voucher`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating challan voucher:", error);
      throw error;
    }
  },

  // Update challan voucher
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/chl-voucher/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating challan voucher:", error);
      throw error;
    }
  },

  // Delete challan voucher
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/chl-voucher/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error deleting challan voucher:", error);
      throw error;
    }
  },

  // Get main departments (branches)
  getBranches: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dpt-master/all/lst-dpt-master`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading branches:", error);
      throw error;
    }
  },

  // Get budget heads by branch
  getBudgetHeadsByBranch: async (branchId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-dept-map/by-department/${branchId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error(`API Error loading budget heads for branch ${branchId}:`, error);
      throw error;
    }
  },

  // Get ledgers by budget head
  getLedgersByBudgetHead: async (budgetHeadId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-dept-map/budget-head/ledgers/${budgetHeadId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error(`API Error loading ledgers for budget head ${budgetHeadId}:`, error);
      throw error;
    }
  },

  // Get challan types
  getChallanTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/challan-type/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading challan types:", error);
      throw error;
    }
  },

  // Get sub-ledgers (vendors)
  getSubLedgers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sub-ledgers/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading sub-ledgers:", error);
      throw error;
    }
  },

  // Get payment modes
  getPaymentModes: async () => {
    return [
      { value: "Cash", label: "Cash" },
      { value: "Bank", label: "Bank" },
      { value: "Cheque", label: "Cheque" },
      { value: "DD", label: "Demand Draft" },
      { value: "Online", label: "Online Transfer" },
      { value: "Card", label: "Card Payment" }
    ];
  },


generateVoucherNumber: (branch, budgetHead, ledger, existingVouchers = []) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`
  };
  
  if (!branch || !budgetHead) return "";
  
  const branchCode = branch.Dpt_Desc || branch.Dpt_id?.toString() || "";
  
  const budgetHeadName = budgetHead.Gr_Nm || budgetHead.Bh_Id?.toString() || "";
  
  // Generate random 4-digit number (1000-9999)
  const randomSeq = Math.floor(Math.random() * 9000 + 1000).toString();
  
  return `${branchCode}/${budgetHeadName}/${randomSeq}`;
}
};

export { ChallanVoucherApi };