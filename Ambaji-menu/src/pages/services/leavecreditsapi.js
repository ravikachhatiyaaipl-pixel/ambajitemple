// services/leavecreditsapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const LeaveCreditsApi = {
  getAll: async (page = 1, perPage = 15, search = "", financialYearId = "") => {
    try {
      const params = { 
        page, 
        per_page: perPage, 
        ...(search && { search }),
        ...(financialYearId && { fy_id: financialYearId }) // Change parameter name as needed
      };
      const response = await axios.get(`${API_BASE_URL}/lst-leave-trans`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
      
      let filteredData = response.data?.data?.data || [];
      
      // Client-side filtering if backend doesn't support FY filtering
      if (financialYearId && financialYearId !=  "") {
        filteredData = filteredData.filter(
          entry => entry.FY_Id == financialYearId || entry.financial_year?.FY_Id == financialYearId
        );
      }
      
      // Client-side search if needed
      if (search && search.trim() !=  "") {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(entry => 
          entry.employee?.First_Name?.toLowerCase().includes(searchLower) ||
          entry.employee?.Last_Name?.toLowerCase().includes(searchLower) ||
          entry.employee?.Emp_Code?.toLowerCase().includes(searchLower) ||
          entry.leave_type?.LT_name?.toLowerCase().includes(searchLower) ||
          entry.Tr_Type?.toLowerCase().includes(searchLower)
        );
      }
      
      // Manual pagination for client-side filtered data
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      return {
        entries: paginatedData,
        pagination: {
          current_page: page,
          last_page: Math.ceil(filteredData.length / perPage),
          per_page: perPage,
          total: filteredData.length,
        },
      };
    } catch (error) {
      console.error("API Error loading leave credit:", error);
      throw error;
    }
  },

  getFinancialYears: async () => {
    try {
      // Method 1: If you have a dedicated financial years endpoint
      const response = await axios.get(`${API_BASE_URL}/fy-master`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: true, data: [] };
    } catch (error) {
      console.error("Error fetching financial years:", error);
      // Method 2: Extract unique financial years from leave transactions
      try {
        const leaveTransResponse = await axios.get(`${API_BASE_URL}/lst-leave-trans`, { 
          params: { per_page: 1000 } 
}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const transactions = leaveTransResponse.data?.data?.data || [];
        const uniqueFYs = new Map();
        
        transactions.forEach(transaction => {
          if (transaction.financial_year && transaction.financial_year.FY_Id) {
            const fy = transaction.financial_year;
            if (!uniqueFYs.has(fy.FY_Id)) {
              uniqueFYs.set(fy.FY_Id, fy);
            }
          }
        });
        
        return { 
          success: true, 
          data: Array.from(uniqueFYs.values()).sort((a, b) => b.FY_Id - a.FY_Id)
        };
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        return { success: true, data: [] };
      }
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-trans/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data?.data;
    } catch (error) {
      console.error("API Error loading leave transaction:", error);
      throw error;
    }
  },

  createBulk: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/leave-trans/bulk`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating bulk leave credit:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/leave-trans/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error deleting leave transaction:", error);
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
      return response.data;
    } catch (error) {
      console.error("API Error loading financial years:", error);
      throw error;
    }
  },

  getAllLeaveTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-type/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success && response.data.data) {
        response.data.data = response.data.data.filter(type => type.Is_Active == true);
      }
      return response.data;
    } catch (error) {
      console.error("API Error loading leave types:", error);
      throw error;
    }
  },

  getAllPayrollBills: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll-bill/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading payroll bills:", error);
      throw error;
    }
  },

  getAllDepartments: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dpt-master/all/lst-dpt-master`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading departments:", error);
      throw error;
    }
  },

  getAllDesignations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/designation/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading designations:", error);
      throw error;
    }
  },

  getAllEmployees: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-mast/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading employees:", error);
      throw error;
    }
  },

  getEmployeePayrollReport: async (filters) => {
    try {
      const params = new URLSearchParams();
      if (filters.PRB_id) params.append("PRB_id", filters.PRB_id);
      if (filters.Dpt_Id) params.append("Dpt_Id", filters.Dpt_Id);
      if (filters.Dsg_Id) params.append("Dsg_Id", filters.Dsg_Id);
      if (filters.Emp_Id) params.append("Emp_Id", filters.Emp_Id);
      const response = await axios.get(`${API_BASE_URL}/emp-payroll-report?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading employee payroll report:", error);
      throw error;
    }
  },
};

export { LeaveCreditsApi };