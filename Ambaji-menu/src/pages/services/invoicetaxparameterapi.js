import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const InvoiceTaxParameterApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-vendinv-parameter`, {
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || "",
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },

      });

      if (response.data.success) {
        return {
          data: response.data.data || [],
          pagination: response.data.pagination || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
          },
        };
      } else {
        throw new Error(response.data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("API Error - getAll:", error);
      throw error.response?.data?.message || error.message || "Failed to fetch tax parameters";
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vendinv-parameter/tender/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Data not found");
      }
    } catch (error) {
      console.error("API Error - getById:", error);
      throw error.response?.data?.message || error.message || "Failed to fetch tax parameter";
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/vendinv-parameter`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Creation failed");
      }
    } catch (error) {
      console.error("API Error - create:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create tax parameter";
      const errors = error.response?.data?.errors;
      if (errors) {
        throw { message: errorMessage, errors };
      }
      throw errorMessage;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/vendinv-parameter/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("API Error - update:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update tax parameter";
      const errors = error.response?.data?.errors;
      if (errors) {
        throw { message: errorMessage, errors };
      }
      throw errorMessage;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/vendinv-parameter/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Deletion failed");
      }
    } catch (error) {
      console.error("API Error - delete:", error);
      throw error.response?.data?.message || error.message || "Failed to delete tax parameter";
    }
  },

  getTenderWorkOptions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tender-type/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return (response.data.data || []).map(item => ({
          value: item.TnT_ID,
          label: `${item.TnT_Code} - ${item.TnT_Name}`,
          TnT_ID: item.TnT_ID,
          TnT_Code: item.TnT_Code,
          TnT_Name: item.TnT_Name,
        }));
      }
      return [];
    } catch (error) {
      console.error("API Error - getTenderWorkOptions:", error);
      return [];
    }
  },

  getTaxTypeOptions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoice-charges-all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return (response.data.data || []).map(item => ({
          value: item.IC_Id,
          label: `${item.IC_Name} (${item.IC_Code})`,
          IC_Id: item.IC_Id,
          IC_Code: item.IC_Code,
          IC_Name: item.IC_Name,
          Percentage: item.Percentage,
          Lg_Id: item.Lg_Id,
          ledger: item.ledger || null,
        }));
      }
      return [];
    } catch (error) {
      console.error("API Error - getTaxTypeOptions:", error);
      return [];
    }
  },

  getLedgerOptions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ledgers/all/data`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return (response.data.data || []).map(item => ({
          value: item.Lg_Id,
          label: `${item.Lg_Name} (${item.Lg_Code})`,
          Lg_Id: item.Lg_Id,
          Lg_Code: item.Lg_Code,
          Lg_Name: item.Lg_Name,
          Lg_Gr: item.Lg_Gr,
        }));
      }
      return [];
    } catch (error) {
      console.error("API Error - getLedgerOptions:", error);
      return [];
    }
  },
};

export { InvoiceTaxParameterApi };