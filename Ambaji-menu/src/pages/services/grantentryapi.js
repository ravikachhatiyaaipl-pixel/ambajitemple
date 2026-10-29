import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const GrantEntryApi = {
  getAll: async (page = 1, perPage = 15, search = "", status = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(status && { Status: status })
      };

      const response = await axios.get(`${API_BASE_URL}/lst-grant-entry`,{ params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });

      return {
        entries: response.data.data?.data || [],
        pagination: response.data.data || {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: 0,
          from: 0,
          to: 0,
        },
      };
    } catch (error) {
      console.error("API Error loading grant entries:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-entry/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading grant entry:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/grant-entry`, data, {        
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating grant entry:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/grant-entry/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating grant entry:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/grant-entry/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error deleting grant entry:", error);
      throw error;
    }
  },

  getAllFinancialYears: async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fy-master`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    // Transform the response to have consistent structure
    return {
      success: response.data.success || false,
      data: response.data.data || []
    };
  } catch (error) {
    console.error("API Error loading financial years:", error);
    throw error;
  }
},

  getAllBranches: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dpt-master/all/lst-dpt-master`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading branches:", error);
      throw error;
    }
  },

  // CORRECTED FUNCTION - Using correct API endpoint
  getBudgetHeadsByBranch: async (branchId) => {
    try {
      // Use the correct API endpoint
      const response = await axios.get(`${API_BASE_URL}/grant-dept-map/by-department/${branchId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      // Extract and filter budget heads where Is_Grant ==  "Y"
      let allBudgetHeads = [];
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach(mapping => {
          if (mapping.all_budget_heads && Array.isArray(mapping.all_budget_heads)) {
            // Filter only budget heads where Is_Grant ==  "Y"
            const grantBudgetHeads = mapping.all_budget_heads.filter(
              head => head.Is_Grant ==  "Y"
            );
            allBudgetHeads = [...allBudgetHeads, ...grantBudgetHeads];
          }
        });
        
        // Remove duplicates by Bh_Id
        const uniqueBudgetHeads = Array.from(
          new Map(allBudgetHeads.map(head => [head.Bh_Id, head])).values()
        );
        
        return {
          success: true,
          data: uniqueBudgetHeads
        };
      }
      
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error(`API Error loading budget heads for branch ${branchId}:`, error);
      throw error;
    }
  },

  getAllGrantTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-types/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading grant types:", error);
      throw error;
    }
  },

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

  updateStatus: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/grant-entry/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating status:", error);
      throw error;
    }
  },
};

export { GrantEntryApi };