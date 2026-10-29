import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const BillChallanEntryApi = {
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/pay-voucher`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating payment voucher:", error);
      throw new Error(error.response?.data?.message || "Failed to create payment voucher");
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/pay-voucher/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating payment voucher:", error);
      throw new Error(error.response?.data?.message || "Failed to update payment voucher");
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/pay-voucher/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting payment voucher:", error);
      throw new Error(error.response?.data?.message || "Failed to delete payment voucher");
    }
  },



  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-pay-voucher`, {
        params: {
          per_page: params.perPage || 15,
          page: params.page || 1,
          search: params.search || '',
          Status: params.status || '',
          PV_Ty : 'VEND'
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payment vouchers:", error);
      throw new Error(error.response?.data?.message || "Failed to load payment vouchers");
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pay-voucher/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payment voucher:", error);
      throw new Error(error.response?.data?.message || "Failed to load payment voucher");
    }
  },

  getOrganisationSettings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-org-master`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching organisation settings:", error);
      throw new Error("Failed to load organisation settings");
    }
  },

  getFinancialYears: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fy-master`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching financial years:", error);
      throw new Error("Failed to load financial years");
    }
  },

  getTenderUniqueBranchWithLedger: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tender-branches-ledgers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching branches with ledgers:", error);
      throw new Error("Failed to load branches and ledgers");
    }
  },

  getTenderEntriesByBranchLedger: async (Dpt_id, Lg_Id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tender-entries-by-branch`, {
        params: {
          Dpt_id: Dpt_id,
          Lg_Id: Lg_Id
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching tender entries:", error);
      throw new Error("Failed to load tender entries");
    }
  },

getPenalties: async (WA_Id, SL_Id, billNo = 'empty') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tender-adjustments/all`, {
      params: {
        WA_Id: WA_Id,
        SL_Id: SL_Id,
        Bill_No: billNo,
        Status:'hod_app'
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching penalties:", error);
    throw new Error("Failed to load penalties");
  }
},

  updatePenalty: async (penaltyId, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tender-adjustments/${penaltyId}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating penalty:", error);
      throw error;
    }
  },

  updateMultiplePenalties: async (penaltiesData) => {
    try {
      const promises = penaltiesData.map(penalty =>
        BillChallanEntryApi.updatePenalty(penalty.tp_id, { Bill_No: penalty.billNo }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      );
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error("Error updating multiple penalties:", error);
      throw error;
    }
  }
};

export { BillChallanEntryApi };