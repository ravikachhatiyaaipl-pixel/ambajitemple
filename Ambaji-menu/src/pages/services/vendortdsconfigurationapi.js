// src/services/vendortdsconfigurationapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const VendorTDSConfigurationApi = {
  // Get all TDS configurations with pagination
  getAll: async (page = 1, perPage = 15, search = "", fyId = "", slId = "", status = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(fyId && { fy_id: fyId }),
        ...(slId && { sl_id: slId }),
        ...(status != "" && { is_active: status })
      };
  
      const response = await axios.get(`${API_BASE_URL}/lst-vend-tds`, { params },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
  
      return {
        tdsConfigs: response.data.data?.data || [],
        pagination: response.data.data?.pagination || {
          current_page: response.data.data?.current_page || 1,
          last_page: response.data.data?.last_page || 1,
          per_page: response.data.data?.per_page || perPage,
          total: response.data.data?.total || 0,
        },
      };
    } catch (error) {
      console.error("API Error loading TDS configurations:", error);
      throw error;
    }
  },

  // Get single TDS configuration by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vend-tds/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error loading TDS configuration:", error);
      throw error;
    }
  },

  // Create new TDS configuration
  create: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/vend-tds`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating TDS configuration:", error);
      throw error;
    }
  },

  // Update TDS configuration
  update: async (id, data) => {

    console.log("Ravido")
    console.log(data)
    try {
      const response = await axios.put(`${API_BASE_URL}/vend-tds/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating TDS configuration:", error);
      throw error;
    }
  },

  // Delete TDS configuration
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/vend-tds/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting TDS configuration:", error);
      throw error;
    }
  },

  // Get financial years
  getFinancialYears: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fy-master`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading financial years:", error);
      throw error;
    }
  },

  // Get vendors (sub-ledgers)
  getVendors: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sub-ledgers/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data.data || [];
    } catch (error) {
      console.error("API Error loading vendors:", error);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (docLibId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/vend-tds/document/${docLibId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("API Error deleting document:", error);
      throw error;
    }
  },
};

export { VendorTDSConfigurationApi };