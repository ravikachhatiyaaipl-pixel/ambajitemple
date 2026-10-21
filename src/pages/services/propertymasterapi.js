import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const PropertyMasterApi = {
  // Property CRUD
  getList: async (page = 1, perPage = 10, search = "", status = "") => {
    try {
      const params = new URLSearchParams({
        page: page,
        per_page: perPage,
      });

      if (search) {
        params.append("search", search);
      }
      if (status) {
        params.append("status", status);
      }

      const response = await axios.get(
        `${API_BASE_URL}/lst-property-master?${params.toString()}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }}
      );

      if (response.data.status) {
        return {
          properties: response.data.data?.data || [],
          pagination: {
            current_page: response.data.data?.current_page || 1,
            last_page: response.data.data?.last_page || 1,
            per_page: response.data.data?.per_page || perPage,
            total: response.data.data?.total || 0,
            from: response.data.data?.from || 0,
            to: response.data.data?.to || 0,
          },
        };
      }
      throw new Error(response.data.message || "Failed to fetch properties");
    } catch (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/property-master/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch property");
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/property-master`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to create property");
    } catch (error) {
      console.error("Error creating property:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/property-master/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to update property");
    } catch (error) {
      console.error(`Error updating property ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/property-master/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.status) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to delete property");
    } catch (error) {
      console.error(`Error deleting property ${id}:`, error);
      throw error;
    }
  },

  // Dropdown APIs
  getWards: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wards/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching wards:", error);
      return [];
    }
  },

  getZones: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zone-master/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching zones:", error);
      return [];
    }
  },

  getOwners: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/owner-master/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.status) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching owners:", error);
      return [];
    }
  },

  getUsageTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/property-usage-type/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.status) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching usage types:", error);
      return [];
    }
  },

  getConstructionTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/construction-type/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.status) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching construction types:", error);
      return [];
    }
  },

  getOccupancyStatuses: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/occupancy-status/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      if (response.data.status) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching occupancy statuses:", error);
      return [];
    }
  },
};

export { PropertyMasterApi };