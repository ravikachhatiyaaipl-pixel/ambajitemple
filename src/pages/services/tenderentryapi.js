import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const TenderEntryApi = {
  // Get all tender entries with pagination
  getAll: async (page = 1, perPage = 15, search = "", bra_id = "", start_date = "", end_date = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(bra_id && { bra_id }),
        ...(start_date && { start_date }),
        ...(end_date && { end_date })
      };

      const response = await axios.get(`${API_BASE_URL}/lst-tender-entries`, { params },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});

      return {
        tenders: response.data.data?.data || response.data.data || [],
        pagination: response.data.data?.pagination || {
          current_page: response.data.data?.current_page || 1,
          last_page: response.data.data?.last_page || 1,
          per_page: response.data.data?.per_page || perPage,
          total: response.data.data?.total || 0,
        },
      };
    } catch (error) {
      console.error("API Error loading tender entries:", error);
      throw error;
    }
  },

  // Get all tender entries without pagination
  getAllData: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tender-entries/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading all tender entries:", error);
      throw error;
    }
  },

  // Get single tender entry by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tender-entries/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading tender entry:", error);
      throw error;
    }
  },

  // Create new tender entry
  create: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tender-entries`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating tender entry:", error);
      throw error;
    }
  },


  // Update tender entry
   update: async (id, data) => {
      try {
        const response = await axios.put(`${API_BASE_URL}/tender-entries/${id}`, data, {
          headers: {
            'Content-Type': 'application/json',
            
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    
          },
        });
        return response.data;
      } catch (error) {
        console.error("API Error updating tender entry:", error);
        throw error;
      }
  },

  // Delete tender entry
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tender-entries/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting tender entry:", error);
      throw error;
    }
  },

  // Get main departments (branches)
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

  // Get tender works
  getTenderWorks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tender-type/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      
      // Extract data array from response
      const tenderWorksData = response.data.data || [];

      // Map TnT_ID to tend_work_id and TnT_Name to work_name
      const mappedTenderWorks = tenderWorksData.map(item => ({
        TnT_ID: item.TnT_ID,
        work_name: item.TnT_Name,
        TnT_Code: item.TnT_Code,
        TnT_Name: item.TnT_Name,
        original: item
      }));

      return mappedTenderWorks;
    } catch (error) {
      console.error("API Error loading tender works:", error);
      throw error;
    }
  },

  // Get budget heads by branch
  getBudgetHeadsByBranch: async (branchId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-dept-map/by-department/${branchId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error(`API Error loading budget heads for branch ${branchId}:`, error);
      throw error;
    }
  },

  // Get ledgers by budget head
  getLedgersByBudgetHead: async (budgetHeadId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-dept-map/budget-head/ledgers/${budgetHeadId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error(`API Error loading ledgers for budget head ${budgetHeadId}:`, error);
      throw error;
    }
  },

  deleteDocument: async (docId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/tender-entries/tender-document/${docId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
    return response.data;
  } catch (error) {
    console.error("API Error deleting document:", error);
    throw error;
  }
},


  // Note: The following methods are kept but commented out as per your request
  /*
  getBudgetByLedger: async (lgId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/budget-entries/all`, {
        params: { Lg_Id: lgId }
      });
      return response.data;
    } catch (error) {
      console.error(`API Error loading budget for ledger ${lgId}:`, error);
      throw error;
    }
  },

  getWorkAllocationsByLedger: async (lgId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/work-allocations/all`, {
        params: { Lg_Id: lgId }
      });
      return response.data;
    } catch (error) {
      console.error(`API Error loading work allocations for ledger ${lgId}:`, error);
      throw error;
    }
  }
  */
};

export { TenderEntryApi };