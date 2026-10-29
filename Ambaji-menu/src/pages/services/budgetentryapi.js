// src/services/budgetentryapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const budgetEntryApi = {
  // Get all budget entries with filters
  getAll: async (params = {}) => {
    try {
      // Build query parameters properly
      const queryParams = {
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.Fin_Year && { Fin_Year: params.Fin_Year }),
        // Set is_latest to true by default, but allow override
        is_latest: params.is_latest != undefined ? params.is_latest : true,
      };

      const response = await axios.get(`${API_BASE_URL}/lst-budget-entries`, {
        params: queryParams,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching budget entries:", error);
      throw error;
    }
  },

  // Get status counts from API
  getStatusCounts: async (params = {}) => {
    try {
      // Create a new params object with is_latest defaulted to true
      const queryParams = {
        ...params,
        // Default is_latest to true if not provided
        is_latest: params.is_latest ?? true,
      };

      const response = await axios.get(`${API_BASE_URL}/budget-entries/status-counts`, {
        params: queryParams,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching status counts:", error);
      throw error;
    }
  },

  // Get single budget entry by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/budget-entries/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching budget entry ${id}:`, error);
      throw error;
    }
  },

  // Create new budget entry
  create: async (data) => {
    try {
      // Send the data exactly as received from the component
      const response = await axios.post(`${API_BASE_URL}/budget-entries`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating budget entry:", error);
      throw error;
    }
  },

  // Update budget entry
  update: async (id, data) => {
    try {
      // Send the data exactly as received from the component
      const response = await axios.put(`${API_BASE_URL}/budget-entries/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating budget entry ${id}:`, error);
      throw error;
    }
  },

  // Delete budget entry
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/budget-entries/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting budget entry ${id}:`, error);
      throw error;
    }
  },

  // Get financial years for dropdown
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
      throw error;
    }
  },

  // Get main departments for dropdown
  getMainDepartments: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dpt-master/all/lst-dpt-master`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },

  // Get budget heads by department
  getBudgetHeadsByDepartment: async (departmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-dept-map/by-department/${departmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching budget heads for department ${departmentId}:`, error);
      throw error;
    }
  },

  // Update status for single entry
  updateStatus: async (id, newStatus) => {
    try {
      // First get the current entry to preserve other fields
      const currentEntry = await budgetEntryApi.getById(id);

      if (currentEntry.success && currentEntry.data) {
        const entry = currentEntry.data;

        // Prepare data with all required fields
        const data = {
          Fin_Year: parseInt(entry.FY_Id),
          Dpt_Id: parseInt(entry.Dpt_id),
          Bh_Id: parseInt(entry.Bh_Id),
          Amount: parseFloat(entry.amount),
          Status: newStatus,
          ...(entry.sug_amount && { Sug_Amount: parseFloat(entry.sug_amount) }),
        };

        const response = await axios.put(`${API_BASE_URL}/budget-entries/${id}`, data, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        return response.data;
      }

      throw new Error("Could not fetch current entry data");
    } catch (error) {
      console.error(`Error updating status for entry ${id}:`, error);
      throw error;
    }
  },

  // Bulk update status
  bulkUpdateStatus: async (ids, newStatus) => {
    try {
      const updatePromises = ids.map(id =>
        budgetEntryApi.updateStatus(id, newStatus)
          .then(response => ({ id, success: true, data: response }))
          .catch(error => ({ id, success: false, error: error.message }))
      );

      const results = await Promise.all(updatePromises);

      const successfulUpdates = results.filter(result => result.success);
      const failedUpdates = results.filter(result => !result.success);

      return {
        success: failedUpdates.length ==  0,
        data: {
          successful: successfulUpdates,
          failed: failedUpdates,
          total_successful: successfulUpdates.length,
          total_failed: failedUpdates.length,
          total: ids.length
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      };
    } catch (error) {
      console.error("Error in bulk status update:", error);
      throw error;
    }
  }
};

export default budgetEntryApi;