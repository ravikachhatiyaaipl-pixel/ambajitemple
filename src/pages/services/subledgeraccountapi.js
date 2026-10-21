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

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

// Helper function for common headers
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  'Accept': 'application/json'
});

export const SubLedgerAccountApi = {
  getAll: async (page = 1, perPage = 15, search = '', filters = {}) => {
    try {
      let url = `${API_BASE_URL}/lst-sub-ledgers?page=${page}&per_page=${perPage}`;
      
      if (search && search.trim() != '') {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      // Add filters to URL
      if (filters && Object.keys(filters).length > 0) {
        Object.keys(filters).forEach(key => {
          if (filters[key] != null && filters[key] != undefined && filters[key] != '') {
            url += `&${key}=${encodeURIComponent(filters[key])}`;
          }
        });
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch subledgers');
      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: result.message
        };
      } else {
        throw new Error(result.message || 'Failed to fetch subledgers');
      }
    } catch (error) {
      console.error('Error fetching subledgers:', error);
      return {
        success: false,
        message: error.message,
        data: { data: [], pagination: {} }
      };
    }
  },

  getAllPartySl: async (page = 1, perPage = 15, search = '') => {
    try {
      let url = `${API_BASE_URL}/lst-sub-ledgers?page=${page}&per_page=${perPage}&is_party=Y`;
      
      if (search && search.trim() != '') {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch subledgers');
      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: result.message
        };
      } else {
        throw new Error(result.message || 'Failed to fetch subledgers');
      }
    } catch (error) {
      console.error('Error fetching subledgers:', error);
      return {
        success: false,
        message: error.message,
        data: { data: [], pagination: {} }
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sub-ledgers/${id}`, {
        headers: getAuthHeaders()
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
          ledger_details: result.ledger_details || [], 
          message: result.message
        };
      } else {
        throw new Error(result.message || 'Subledger not found');
      }
    } catch (error) {
      console.error('Error fetching subledger:', error);
      return {
        success: false,
        message: error.message || 'Failed to load subledger data',
        data: null,
        ledger_details: []
      };
    }
  },

  create: async (data) => {
    try {
      let requestBody;
      let headers = {
        ...getAuthHeaders()
      };
      
      // Check if there's a file to upload
      if (data.Documents && data.Documents instanceof File) {
        // Use FormData for file upload
        const formData = new FormData();
        
        // Append all fields to FormData
        Object.keys(data).forEach(key => {
          if (key ==  'Documents') {
            formData.append('Documents', data[key]);
          } else if (key ==  'Lg_Id') {
            // Handle Lg_Id array
            formData.append('Lg_Id', JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        });
        
        requestBody = formData;
        // Remove Content-Type for FormData (browser will set it with boundary)
        delete headers['Content-Type'];
      } else {
        // Send as JSON
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(data);
      }
      
      const response = await fetch(`${API_BASE_URL}/sub-ledgers`, {
        method: 'POST',
        headers: headers,
        body: requestBody,
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create subledger');
      }
      
      return result;
    } catch (error) {
      console.error('Error creating subledger:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      let requestBody;
      let headers = {
        ...getAuthHeaders()
      };
      
      // Check if there's a file to upload
      if (data.Documents && data.Documents instanceof File) {
        // Use FormData for file upload
        const formData = new FormData();
        
        // Append all fields to FormData
        Object.keys(data).forEach(key => {
          if (key ==  'Documents') {
            formData.append('Documents', data[key]);
          } else if (key ==  'Lg_Id') {
            // Handle Lg_Id array
            formData.append('Lg_Id', JSON.stringify(data[key]));
          } else {
            formData.append(key, data[key]);
          }
        });
        
        requestBody = formData;
        // Remove Content-Type for FormData
        delete headers['Content-Type'];
      } else {
        // Send as JSON
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(data);
      }
      
      const response = await fetch(`${API_BASE_URL}/sub-ledgers/${id}`, {
        method: 'PUT',
        headers: headers,
        body: requestBody,
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update subledger');
      }
      
      return result;
    } catch (error) {
      console.error('Error updating subledger:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sub-ledgers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete subledger');
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting subledger:', error);
      throw error;
    }
  },

  getLedgers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ledgers/all/data`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch ledgers');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching ledgers:", error);
      throw error;
    }
  },

  // Uncommented and fixed bulkUpdateBankVerification
  bulkUpdateBankVerification: async (ids) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sub-ledgers/bulk-update-bank-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ sl_ids: ids }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update bank verification');
      }
      
      return result;
    } catch (error) {
      console.error('Error bulk updating bank verification:', error);
      throw error;
    }
  }
};