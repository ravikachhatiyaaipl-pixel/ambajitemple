import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const GraDeptMapApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-grant-department`, { 
        params: {
          per_page: params.perPage || 10,
          page: params.page || 1,
          search: params.search || '',
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.success) {
        return {
          data: response.data.data?.data || [],
          pagination: {
            current_page: response.data.data?.current_page || 1,
            last_page: response.data.data?.last_page || 1,
            per_page: response.data.data?.per_page || 10,
            total: response.data.data?.total || 0,
            from: response.data.data?.from || 0,
            to: response.data.data?.to || 0,
          },
          success: response.data.success,
          message: response.data.message
        };
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching grant-department mappings:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-department/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching mapping ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/grant-department`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating mapping:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/grant-department/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating mapping ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/grant-department/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting mapping ${id}:`, error);
      throw error;
    }
  },

  getByDepartment: async (departmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-department/by-department/${departmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching mapping for department ${departmentId}:`, error);
      throw error;
    }
  },

  getDepartments: async () => {
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

  getGrantTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grant-types/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.status ==  true) {
        const activeGrantTypes = (response.data.data || []).filter(
          grant => grant.Is_Active ==  true
        );
        return {
          success: true,
          data: activeGrantTypes
        };
      }
      return {
        success: false,
        data: []
      };
    } catch (error) {
      console.error("Error fetching grant types:", error);
      throw error;
    }
  }
};

export default GraDeptMapApi;