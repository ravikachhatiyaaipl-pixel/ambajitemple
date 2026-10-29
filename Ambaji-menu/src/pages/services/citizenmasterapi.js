import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const CitizenMasterApi = {
  // Get all citizens with pagination and search
  getAll: async (page = 1, perPage = 10, search = "") => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-ctzn`, {
        params: {
          page,
          per_page: perPage,
          ...(search && { search }),
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });

      const responseData = response.data;
      
      return {
        data: responseData.data?.data || responseData.data || [],
        meta: {
          current_page: responseData.data?.current_page || 1,
          last_page: responseData.data?.last_page || 1,
          per_page: responseData.data?.per_page || perPage,
          total: responseData.data?.total || 0,
        },
      };
    } catch (error) {
      console.error("API Error loading citizens:", error);
      throw error;
    }
  },

  // Get single citizen by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ctzn/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("API Error loading citizen:", error);
      throw error;
    }
  },

  // Create new citizen
  create: async (formData) => {
    try {
      const data = new FormData();
      data.append("Name", formData.Name);
      data.append("Mobile", formData.Mobile);
      data.append("Email", formData.Email);
      data.append("Address", formData.Address);
      data.append("Area_id", formData.Area_id);
      
      // Handle multiple documents - append as files
      if (formData.Documents && formData.Documents.length > 0) {
        formData.Documents.forEach((file) => {
          data.append("Documents[]", file);
        });
      }

      const response = await axios.post(`${API_BASE_URL}/ctzn`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error creating citizen:", error);
      throw error;
    }
  },

  // Update citizen
  update: async (id, formData) => {
    try {
      const data = new FormData();
      data.append("Name", formData.Name);
      data.append("Mobile", formData.Mobile);
      data.append("Email", formData.Email);
      data.append("Address", formData.Address);
      data.append("Area_id", formData.Area_id);
    //   data.append("_method", "PUT");
      
      // Handle new documents - append as files
      if (formData.newDocuments && formData.newDocuments.length > 0) {
        formData.newDocuments.forEach((file) => {
          data.append("Documents[]", file);
        });
      }
      
      // Handle deleted document IDs
      if (formData.deletedDocuments && formData.deletedDocuments.length > 0) {
        data.append("deleted_documents", JSON.stringify(formData.deletedDocuments));
      }

      const response = await axios.post(`${API_BASE_URL}/ctzn/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error updating citizen:", error);
      throw error;
    }
  },

  // Delete citizen
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/ctzn/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error deleting citizen:", error);
      throw error;
    }
  },
};

export { CitizenMasterApi };