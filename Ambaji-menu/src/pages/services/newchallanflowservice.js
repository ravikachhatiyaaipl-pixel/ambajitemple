import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

export const extractCvSerial = (cvNo) => {
  if (cvNo == null || cvNo ==  "") return 0;
  const str = String(cvNo).trim();
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  const match = str.match(/(\d+)\s*$/);
  return match ? parseInt(match[1], 10) : 0;
};

export const formatCvNo = (branch, serial) => {
  const branchCode = String(
    branch?.Dpt_Desc || branch?.Dpt_Name || branch?.Dpt_id || "",
  )
    .replace(/^\/+|\/+$/g, "")
    .trim();
  const num = parseInt(serial, 10);
  const serialStr = Number.isFinite(num) && num > 0 ? String(num) : "1";
  if (!branchCode) return serialStr;
  return `AMT/${branchCode}/${serialStr}`;
};

const newChallanFlowService = {
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

      const response = await axios.get(`${API_BASE_URL}/lst-new-one-chl-voucher`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });



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

    // Get all challan vouchers with pagination and status filter
  getAllVoucher: async (page = 1, perPage = 15, search = "", dpt_id = "", start_date = "", end_date = "", Is_income = "", status = "") => {
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

      const response = await axios.get(`${API_BASE_URL}/lst-new-one-chl-voucher/non-appr`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });



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

  getAllWithoutPagenation: async (page = 1, perPage = 15000000, search = "", dpt_id = "", start_date = "", end_date = "", Is_income = "", status = "",Py_Status = "") => {
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
      if (Py_Status && String(Py_Status).trim() !=  "") {
        params.Py_Status = Py_Status;
      }

      const response = await axios.get(`${API_BASE_URL}/lst-new-one-chl-voucher`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });

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
      const response = await axios.get(`${API_BASE_URL}/new-one-chl-voucher/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error loading challan voucher:", error);
      throw error;
    }
  },

  // Update challan voucher status
  updateStatus: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/new-chl-voucher/${id}/status`, data,{
        headers: {

          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error updating challan voucher:", error);
      throw error;
    }
  },

  // Set Acc_Chl_No
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
  // Bulk update status
  bulkUpdateStatus: async (ids, data) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/new-chl-voucher/bulk/status/update`,
        { ids, ...data },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }}
      );
      return response.data;
    } catch (error) {
      console.error("API Error bulk updating voucher status:", error);
      throw error;
    }
  },
  // Bulk set Acc_Chl_No
  bulkSetAccChlNo: async (ids, data) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/new-chl-voucher/set-acc-chl-no/bulk/status`,
        { ids, ...data },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }}
      );
      return response.data;
    } catch (error) {
      console.error("API Error bulk setting Acc_Chl_No:", error);
      throw error;
    }
  },

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

  // Calculate summary by payment mode
  calculateSummary: (details) => {
    const summary = { total: 0, cash: 0, bank: 0, cheque: 0, dd: 0, online: 0, card: 0, pos: 0, mchallan: 0 };
    if (!details || !Array.isArray(details)) return summary;
    details.forEach(detail => {
      const amount = parseFloat(detail.Amount) || 0;
      summary.total += amount;
      const mode = detail.Py_Mode || detail.Payment_Mode;
      switch (mode) {
        case 'Cash': summary.cash += amount; break;
        case 'Bank': summary.bank += amount; break;
        case 'Cheque': summary.cheque += amount; break;
        case 'DD': summary.dd += amount; break;
        case 'Online': summary.online += amount; break;
        case 'Card': summary.card += amount; break;
        case 'Pos': summary.pos += amount; break;
        case 'MChallan': summary.mchallan += amount; break;
      }
    });
    return summary;
  },

  // Create new challan voucher
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/new-one-chl-voucher`, data ,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error creating challan voucher:", error);
      throw error;
    }
  },

  // Update challan voucher
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/new-one-chl-voucher/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error updating challan voucher:", error);
      throw error;
    }
  },

  // Delete challan voucher
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/dlt-new-one-chl-voucher/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting challan voucher:", error);
      throw error;
    }
  },

  // ===================  COMMON ENDPOINTS FOR NEW FLOW ====================

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

  // Get ALL ledgers
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

  // Get tax parameters by challan type
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

  // Get payment modes from API (with Is_Active filter)
  getPaymentModes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payment-mode/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      // Filter only active payment modes (Is_Active == 1)
      const activeModes = (response.data.data || []).filter(mode => mode.Is_Active == 1);
      // Transform to format expected by the component, including Is_Cash and Is_Digital flags
      return activeModes.map(mode => ({
        value: mode.PayMd_Name,
        label: mode.PayMd_Name,
        PayMd_ID: mode.PayMd_ID,
        Lg_Id: mode.Lg_Id,
        Is_Cash: mode.Is_Cash==1 || 0,
        Is_Digital: mode.Is_Digital==1 || 0,
        Is_Chl: mode.Is_Chl == 1 || 0,
        PayMd_Code: mode.PayMd_Code,
      }));
    } catch (error) {
      console.error("API Error loading payment modes:", error);
      throw error;
    }
  },

  // Get sub-ledgers (parties)
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

  // Update sub-ledger GST
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

  // Create sub-ledger
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

  // Get activity logs
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

  // Get tender types
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

  // Get tax parameters by tender type 
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

  // Generate voucher number
  generateVoucherNumber: (branch, serial = 1) => formatCvNo(branch, serial),

  // Get sub-ledger by GSTIN
  getSubLedgerByGSTIN: async (gstin) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sub-ledgers/by-gstin?gstin=${gstin}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }});
      return response.data;
    } catch (error) {
      console.error("API Error fetching sub-ledger by GSTIN:", error);
      throw error;
    }
  },
  getLedgerAvailableBalance: async (lgId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ledger-available-balance?lg_id=${lgId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error fetching ledger balance:", error);
      throw error;
    }
  },
  getGrantDeptMap: async (deptId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/grant-dept-map/by-department/${deptId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("API Error loading grant-dept-map:", error);
    throw error;
  }
},
  getNextVoucherNumber: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/new-chl-voucher/next-vou-no/data/by-cv-no`,
        { headers: authHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error("API Error fetching next voucher number:", error);
      throw error;
    }
  },

  formatCvNo,
  extractCvSerial,
};

export { newChallanFlowService };