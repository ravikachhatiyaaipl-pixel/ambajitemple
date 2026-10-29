// vetdoctorapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const VetDoctorApi = {
  // =========  VET DOCTOR APIs ==========
  
  // For paginated list with server-side pagination
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-vet-doctor`, { 
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          search: params.search,
          sort_field: params.sort_field,
          sort_direction: params.sort_direction
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching vet doctors:", error);
      throw error;
    }
  },

  // For fetching all records (for client-side operations like export)
  getAllList: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vet-doctor/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error("Error fetching all vet doctors:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vet-doctor/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error fetching vet doctor ${id}:`, error);
      throw error;
    }
  },

  // Create with FormData (for file uploads)
  create: async (data) => {
    try {
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key ==  'Documents' && Array.isArray(data[key])) {
          data[key].forEach((doc, index) => {
            if (doc.file) {
              formData.append(`Documents[${index}]`, doc.file);
            }
          });
        } else if (data[key] != null && data[key] != undefined) {
          formData.append(key, data[key]);
        }
      });
      
      const response = await axios.post(`${API_BASE_URL}/vet-doctor`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating vet doctor:", error);
      throw error;
    }
  },

  // Update with FormData (for file uploads - base64 for existing docs)
  update: async (id, data) => {
    try {
      const formData = new FormData();
      
      // Append all regular fields
      Object.keys(data).forEach(key => {
        if (key ==  'Documents' && Array.isArray(data[key])) {
          data[key].forEach((doc, index) => {
            if (doc.file) {
              // New file being added - send as file
              formData.append(`Documents[${index}]`, doc.file);
            } else if (doc.doc_lib_id) {
              // Existing document - send as JSON with base64 for updated file
              formData.append(`Documents[${index}]`, JSON.stringify({
                doc_lib_id: doc.doc_lib_id,
                name: doc.name,
                description: doc.description,
                file_base64: doc.file_base64 || null
              }));
            }
          });
        } else if (data[key] != null && data[key] != undefined) {
          formData.append(key, data[key]);
        }
      });
      
      // Add _method for Laravel to handle as PUT
      formData.append('_method', 'PUT');
      
      const response = await axios.post(`${API_BASE_URL}/vet-doctor/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating vet doctor ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/vet-doctor/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting vet doctor ${id}:`, error);
      throw error;
    }
  },

  // Delete a specific document
  deleteDocument: async (docId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/vet-doctor/document/${docId}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${docId}:`, error);
      throw error;
    }
  },

  // =========  DROPDOWN DATA APIs ==========

  // Helper method to load all dropdown data at once
  getAllDropdownData: async () => {
    try {
      // Add any dropdown APIs here if needed (like areas)
      return {
        areas: [] // To be populated if area API exists
      };
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      throw error;
    }
  }
};

export default VetDoctorApi;