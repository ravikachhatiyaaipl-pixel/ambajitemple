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

import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const BranchApi = {

    // Get all branches (list view)
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-branch`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });

            // Transform paginated response to include the data array at top level
            if (response.data && response.data.success && response.data.data) {
                // If it's paginated, extract the inner data array
                if (response.data.data.data && Array.isArray(response.data.data.data)) {
                    return {
                        ...response.data,
                        data: response.data.data.data,  // Extract the actual branch list
                        pagination: {
                            current_page: response.data.data.current_page,
                            last_page: response.data.data.last_page,
                            total: response.data.data.total,
                            per_page: response.data.data.per_page
                        }
                    };
                }
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching branches:", error);
            throw error;
        }
    },

    // Get all branches (alternative endpoint)
    all: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/branch/all`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
            return response.data;
        } catch (error) {
            console.error("Error fetching all branches:", error);
            throw error;
        }
    },

    // Get trashed (soft deleted) branches
    getTrashed: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/branch/trashed/list`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
            return response.data;
        } catch (error) {
            console.error("Error fetching trashed branches:", error);
            throw error;
        }
    },

    // Get single branch by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/branch/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching branch ${id}:`, error);
            throw error;
        }
    },

    // Create new branch
    create: async (branchData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/branch`, branchData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating branch:", error);
            throw error;
        }
    },

    // Update branch
    update: async (id, branchData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/branch/${id}`, branchData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating branch ${id}:`, error);
            throw error;
        }
    },

    // Soft delete branch
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/branch/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting branch ${id}:`, error);
            throw error;
        }
    },

    // Restore soft deleted branch
    restore: async (id) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/branch/restore/${id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error restoring branch ${id}:`, error);
            throw error;
        }
    },

    // Permanently delete branch
    forceDelete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/branch/force-delete/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error force deleting branch ${id}:`, error);
            throw error;
        }
    }

};

export default BranchApi;