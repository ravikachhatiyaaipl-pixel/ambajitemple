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

const HallRentBookingApi = {
    // Get all hall rent bookings
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-hall-rent-booking`, { 
                params, 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                } 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching hall rent bookings:", error);
            throw error;
        }
    },

    // Get single booking by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-rent-booking/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching hall rent booking ${id}:`, error);
            throw error;
        }
    },

    // Create new booking
    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/hall-rent-booking`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating hall rent booking:", error);
            throw error;
        }
    },

    // Update booking
    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/hall-rent-booking/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating hall rent booking ${id}:`, error);
            throw error;
        }
    },

    // Update booking status (for approval)
    updateStatus: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/hall-rent-booking/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating hall rent booking status ${id}:`, error);
            throw error;
        }
    },

    // Delete booking
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/hall-rent-booking/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting hall rent booking ${id}:`, error);
            throw error;
        }
    },

    // Get all hall applications for dropdown
    getAllHallApplications: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-rent-application/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching hall applications:", error);
            throw error;
        }
    },

    // Get all halls for dropdown
    getAllHalls: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-master/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching halls:", error);
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
                `${API_BASE_URL}/hall-rent-booking/bulk/status/update`,
                { ids, ...data }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error bulk updating booking status:", error);
            throw error;
        }
    },

    // Get activity logs
    getActivityLogs: async (tranId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/activity-logs?HLRB_Id=${tranId}`, {
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

export default HallRentBookingApi;