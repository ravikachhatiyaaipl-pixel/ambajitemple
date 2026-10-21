import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const EmployeeMasterApi = {
  // =========  EMPLOYEE MASTER APIs ==========
  
  // For paginated list with server-side pagination
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-emp-mast`, { 
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          search: params.search,
          sort_field: params.sort_field,
          sort_direction: params.sort_direction,
          status: params.status
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },

  // For fetching all records (for client-side operations like export)
  getAllList: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-mast/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all employees:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-mast/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emp-mast`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/emp-mast/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/emp-mast/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  },

  // =========  DROPDOWN DATA APIs ==========

  // Get all departments for dropdown
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
      return { data: [] };
    }
  },

  getDesignations: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/designation/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching designations:", error);
      return { data: [] };
    }
  },

  // Get all employee categories (replaces castes)
  getEmployeeCategories: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-category/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee categories:", error);
      throw error;
    }
  },

  // Get all quotas for dropdown
  getQuotas: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-quota/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching quotas:", error);
      throw error;
    }
  },

  // Get all employee types for dropdown
  getEmployeeTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-type/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee types:", error);
      throw error;
    }
  },

  // Get all users for dropdown
  // exclude_devotees=1 -> devotee user Employee Master me nahi dikhenge.
  getUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/usr-master/all?exclude_devotees=1`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get all languages for dropdown
  getLanguages: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-lang/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching languages:", error);
      throw error;
    }
  },

  // Helper method to load all dropdown data at once
  getAllDropdownData: async () => {
    try {
      const [
        departments,
        employeeCategories,
        quotas,
        employeeTypes,
        users,
        languages,
        designations
      ] = await Promise.all([
        EmployeeMasterApi.getDepartments(),
        EmployeeMasterApi.getEmployeeCategories(),
        EmployeeMasterApi.getQuotas(),
        EmployeeMasterApi.getEmployeeTypes(),
        EmployeeMasterApi.getUsers(),
        EmployeeMasterApi.getLanguages(),
        EmployeeMasterApi.getDesignations()
      ]);

      return {
        departments: departments.data || [],
        employeeCategories: employeeCategories.data || [],
        quotas: quotas.data || [],
        employeeTypes: employeeTypes.data || [],
        users: users.data || [],
        designations: designations.data || [],
        languages: languages.data || []
      };
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      throw error;
    }
  }
};

export default EmployeeMasterApi;