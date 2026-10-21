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

const HallRentApplicationApi = {
    // Get all hall rent applications
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-hall-rent-application`, { 
                params, 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                } 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching hall rent applications:", error);
            throw error;
        }
    },

    // Get single application by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-rent-application/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching hall rent application ${id}:`, error);
            throw error;
        }
    },

    // Create new application
    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/hall-rent-application`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating hall rent application:", error);
            throw error;
        }
    },

    // Update application
    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/hall-rent-application/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating hall rent application ${id}:`, error);
            throw error;
        }
    },

    // Update application status (for approval)
    updateStatus: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/hall-rent-application/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating hall rent application status ${id}:`, error);
            throw error;
        }
    },

    // Delete application
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/hall-rent-application/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting hall rent application ${id}:`, error);
            throw error;
        }
    },

    // Get all hall rentals for dropdown
    getAllHallRentals: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-rental/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching hall rentals:", error);
            throw error;
        }
    },

    // Get all users for dropdown
    getAllUsers: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/usr-master/all`, {
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

    // Get action master for stage
    getActionsByStage: async (stage) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/action-master/all`, {
                params: { stage },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching actions:", error);
            throw error;
        }
    },

    // Get action master by ID
    getActionById: async (actionId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/action-master/${actionId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching action:", error);
            throw error;
        }
    },

    // Bulk update status
    bulkUpdateStatus: async (ids, data) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/hall-rent-application/bulk/status/update`,
                { ids, ...data }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error bulk updating application status:", error);
            throw error;
        }
    },

    // Get activity logs
    getActivityLogs: async (tranId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/activity-logs?HLRA_Id=${tranId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error loading activity logs:", error);
            throw error;
        }
    }
};

export default HallRentApplicationApi;