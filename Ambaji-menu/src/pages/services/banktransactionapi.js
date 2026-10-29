// services/banktransactionapi.js
/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *
 */

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const BankTransactionApi = {
  // Get all bank transactions with pagination and search
  getAll: async (page = 1, perPage = 10, search = '', filters = {}) => {
    try {
      let url = `${API_BASE_URL}/lst-bank-trans-details?page=${page}&per_page=${perPage}`;
      
      if (search && search.trim() !=  '') {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      // Add filters to URL
      if (filters && Object.keys(filters).length > 0) {
        Object.keys(filters).forEach(key => {
          if (filters[key] != null && filters[key] !=  undefined && filters[key] !=  '') {
            url += `&${key}=${encodeURIComponent(filters[key])}`;
          }
        });
      }
      
      const response = await fetch(url ,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch bank transactions');
      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: result.message
        };
      } else {
        throw new Error(result.message || 'Failed to fetch bank transactions');
      }
    } catch (error) {
      console.error('Error fetching bank transactions:', error);
      return {
        success: false,
        message: error.message,
        data: { data: [], current_page: 1, last_page: 1, total: 0 }
      };
    }
  },

  // Get all bank transactions (without pagination)
  getAllUnpaginated: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bank-trans-details/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch all bank transactions');
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          count: result.count,
          message: result.message
        };
      } else {
        throw new Error(result.message || 'Failed to fetch bank transactions');
      }
    } catch (error) {
      console.error('Error fetching all bank transactions:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  },

  // Get single bank transaction by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bank-trans-details/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: result.message
        };
      } else {
        throw new Error(result.message || 'Bank transaction not found');
      }
    } catch (error) {
      console.error('Error fetching bank transaction:', error);
      return {
        success: false,
        message: error.message || 'Failed to load bank transaction data',
        data: null
      };
    }
  },

  // Create new bank transaction
  create: async (data) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      };
      
      const response = await fetch(`${API_BASE_URL}/bank-trans-details`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create bank transaction');
      }
      
      return result;
    } catch (error) {
      console.error('Error creating bank transaction:', error);
      throw error;
    }
  },

  // Update bank transaction
  update: async (id, data) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      };
      
      const response = await fetch(`${API_BASE_URL}/bank-trans-details/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update bank transaction');
      }
      
      return result;
    } catch (error) {
      console.error('Error updating bank transaction:', error);
      throw error;
    }
  },

  // Delete bank transaction
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bank-trans-details/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete bank transaction');
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting bank transaction:', error);
      throw error;
    }
  },

  // Get status options for dropdown
  getStatusOptions: async () => {
    // Return static status options as per validation
    return [
      { value: 'initial', label: 'Initial' },
      { value: 'pending', label: 'Pending' },
      { value: 'success', label: 'Success' },
      { value: 'fail', label: 'Failed' },
    ];
  }
};