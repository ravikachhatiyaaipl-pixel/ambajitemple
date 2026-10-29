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

const ShopRentApplicationApi = {
    // Get all shop rent applications
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-shop-rent-application`, { 
                params, 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                } 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching shop rent applications:", error);
            throw error;
        }
    },

    // Applications jinka CURRENT step is user ko perform/view karna hai
    // (Seva booking approvals screen jaisa - authority filtered)
    getPendingApprovals: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/shop-rent-application/pending-approvals`, {
                params,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching pending approvals:", error);
            throw error;
        }
    },

    // Get single application by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/shop-rent-application/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching shop rent application ${id}:`, error);
            throw error;
        }
    },

    // Create new application
    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/shop-rent-application`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating shop rent application:", error);
            throw error;
        }
    },

    // Update application
    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/shop-rent-application/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating shop rent application ${id}:`, error);
            throw error;
        }
    },

    // Update application status
    updateStatus: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/shop-rent-application/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating shop rent application status ${id}:`, error);
            throw error;
        }
    },

    // Delete application
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/shop-rent-application/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting shop rent application ${id}:`, error);
            throw error;
        }
    },

    // Get all shop rentals for dropdown
    getAllShopRentals: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/shop-rental/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching shop rentals:", error);
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
                `${API_BASE_URL}/shop-rent-application/bulk/status/update`,
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
            const response = await axios.get(`${API_BASE_URL}/activity-logs?SPRA_Id=${tranId}`, {
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

export default ShopRentApplicationApi;