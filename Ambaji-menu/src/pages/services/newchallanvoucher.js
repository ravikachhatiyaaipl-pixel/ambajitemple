import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const newChallanVoucherApi = {
  // ===================  NEW CHALLAN VOUCHER ENDPOINTS ====================
  // Get all challan vouchers with pagination and status filter
  getAll: async (page = 1, perPage = 15, search = "", dpt_id = "", start_date = "", end_date = "", Is_income = "", status = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(dpt_id && { Dpt_Id: dpt_id }),
        ...(start_date && { start_date }),
        ...(end_date && { end_date }),
        ...(Is_income && { Is_income }),
      };
      if (status && String(status).trim() != "") {
        params.Status = status;
      }

      const response = await axios.get(`${API_BASE_URL}/lst-new-chl-voucher`, { params },{
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
      const response = await axios.get(`${API_BASE_URL}/new-chl-voucher/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error loading challan voucher:", error);
      throw error;
    }
  },

  // Create new challan voucher
  createChallanVoucher: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/new-chl-voucher`, data ,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error creating challan voucher:", error);
      throw error;
    }
  },

  // Add this inside the newChallanVoucherApi object
getActivityLogs: async (tranId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/activity-logs?CV_No=${tranId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`

  }});
    return response.data;
  } catch (error) {
    console.error("API Error loading activity logs:", error);
    throw error;
  }
},

  // Update challan voucher
  updateChallanVoucher: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/new-chl-voucher/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error updating challan voucher:", error);
      throw error;
    }
  },

  // Update challan voucher status
  updateStatus: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/new-chl-voucher/${id}/status`, data ,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error updating challan voucher:", error);
      throw error;
    }
  },

  setAccChlNo: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/new-chl-voucher/${id}/set-acc-chl-no/status`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error setting Acc_Chl_No:", error);
      throw error;
    }
  },
  bulkUpdateStatus: async (ids, data) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/new-chl-voucher/bulk/status/update`,
        { ids, ...data },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`}
    });
      return response.data;
    } catch (error) {
      console.error("API Error bulk updating voucher status:", error);
      throw error;
    }
  },

  bulkSetAccChlNo: async (ids, data) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/new-chl-voucher/set-acc-chl-no/bulk/status`,
        { ids, ...data },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("API Error bulk setting Acc_Chl_No:", error);
      throw error;
    }
  },

  // Delete challan voucher
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/chl-voucher/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting challan voucher:", error);
      throw error;
    }
  },

  // ===================  PAYMENT VOUCHER ENDPOINTS ====================
  
  // Get payment voucher by PV No
  getPaymentVoucherByPVNo: async (pvNo) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pay-voucher/pv-no/${encodeURIComponent(pvNo)}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error loading payment voucher by PV No:", error);
      throw error;
    }
  },

  // Create payment voucher (for challan)
  createPaymentVoucher: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/pay-voucher`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error creating payment voucher:", error);
      throw error;
    }
  },

  // Update payment voucher
  updatePaymentVoucher: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/pay-voucher/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error updating payment voucher:", error);
      throw error;
    }
  },

  // ===================  COMMON ENDPOINTS ====================
  
  // Get all actions for a stage
  getAllByStage: async (stage) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/action-master/all`, {
        params: { stage },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`API Error loading actions for stage ${stage}:`, error);
      throw error;
    }
  },

  // Get all departments (branches)
  getBranches: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dpt-master/all/lst-dpt-master`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading branches:", error);
      throw error;
    }
  },

  // Get ALL ledgers (no filter) - we'll filter in component based on use case
  getAllLedgers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ledgers/all/data`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading ledgers:", error);
      throw error;
    }
  },

  // Get expense ledgers only (for new creation)
  getExpenseLedgers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ledgers/all/data`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      
      const expenseLedgers = (response.data.data || []).filter(ledger => 
        ledger.budget_head && ledger.budget_head.Gr_Exp != "Y"
      );
      
      return expenseLedgers;
    } catch (error) {
      console.error("API Error loading expense ledgers:", error);
      throw error;
    }
  },

  // Get challan types
  getChallanTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/challan-type/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading challan types:", error);
      throw error;
    }
  },

  getTaxParametersByChallanType: async (challanTypeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chlnv-parameter/challan-type/${challanTypeId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error loading tax parameters:", error);
      throw error;
    }
  },

  // Get payment modes 
  getPaymentModesApi: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payment-mode/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data; // This returns { status: true, data: [...] }
    } catch (error) {
      console.error("API Error loading payment modes:", error);
      throw error;
    }
  },

    // Get payment modes (hardcoded)
    getPaymentModes: async () => {
      return [
        { value: "Cash", label: "Cash" },
        { value: "Bank", label: "Bank" },
        { value: "Cheque", label: "Cheque" },
        { value: "DD", label: "Demand Draft" },
        { value: "Online", label: "Online Transfer" },
        { value: "Card", label: "Card Payment" },
        { value: "Pos", label: "Pos" },
        { value: "MChallan", label: "MChallan" }
      ];
    },

  generateVoucherNumber: (branch, existingVouchers = []) => {
    if (!branch) return "";
    
    const branchCode = branch.Dpt_Desc || branch.Dpt_id?.toString() || "";

    const randomSeq = Math.floor(Math.random() * 9000 + 1000).toString();
    
    return `AMT/${branchCode}/${randomSeq}`;
  },

  // Calculate summary by payment mode
  calculateSummary: (details) => {
    const summary = {
      total: 0,
      cash: 0,
      bank: 0,
      cheque: 0,
      dd: 0,
      online: 0,
      card: 0
    };

    if (!details || !Array.isArray(details)) return summary;

    details.forEach(detail => {
      const amount = parseFloat(detail.Amount) || 0;
      summary.total += amount;
      
      const mode = detail.Py_Mode || detail.Payment_Mode;
      switch (mode) {
        case 'Cash':
          summary.cash += amount;
          break;
        case 'Bank':
          summary.bank += amount;
          break;
        case 'Cheque':
          summary.cheque += amount;
          break;
        case 'DD':
          summary.dd += amount;
          break;
        case 'Online':
          summary.online += amount;
          break;
        case 'Card':
          summary.card += amount;
          break;
        default:
          break;
      }
    });

    return summary;
  },

getTenderTypes: async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tender-type/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }});
    return response.data.data || [];
  } catch (error) {
    console.error("API Error loading tender types:", error);
    throw error;
  }
},

getTaxParametersByTenderType: async (tenderTypeId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vendinv-parameter/tender/${tenderTypeId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }});
    return response.data;
  } catch (error) {
    console.error("API Error loading tax parameters by tender type:", error);
    throw error;
  }
},

getSubLedgers: async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sub-ledgers/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }});
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("API Error loading sub-ledgers:", error);
    return [];
  }
},

updateSubLedgerGST: async (slId, gstin) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/sub-ledgers/${slId}`, { GSTIN: gstin },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }});
    return response.data;
  } catch (error) {
    console.error("API Error updating sub-ledger GST:", error);
    throw error;
  }
},

createSubLedger: async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sub-ledgers`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }});
    return response.data;
  } catch (error) {
    console.error("API Error creating sub-ledger:", error);
    throw error;
  }
},

};

export { newChallanVoucherApi };
