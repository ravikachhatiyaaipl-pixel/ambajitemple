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

const HallRentBookingTransactionApi = {
    // Get all transactions
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-hall-rent-booking-transaction`, { 
                params, 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                } 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching hall rent booking transactions:", error);
            throw error;
        }
    },

    // Get single transaction by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-rent-booking-transaction/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching hall rent booking transaction ${id}:`, error);
            throw error;
        }
    },

    // Create new transaction
    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/hall-rent-booking-transaction`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating hall rent booking transaction:", error);
            throw error;
        }
    },

    // Update transaction
    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/hall-rent-booking-transaction/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating hall rent booking transaction ${id}:`, error);
            throw error;
        }
    },

    // Update transaction status (for approval)
    updateStatus: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/hall-rent-booking-transaction/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating hall rent booking transaction status ${id}:`, error);
            throw error;
        }
    },

    // Delete transaction
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/hall-rent-booking-transaction/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting hall rent booking transaction ${id}:`, error);
            throw error;
        }
    },

    // Get all hall rent bookings for dropdown
    getAllHallRentBookings: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-rent-booking/all`, {
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

    // Get all CCCs for dropdown
    getAllCCCs: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/cccs/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching CCCs:", error);
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
                `${API_BASE_URL}/hall-rent-booking-transaction/bulk/status/update`,
                { ids, ...data }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error bulk updating transaction status:", error);
            throw error;
        }
    },

    // Get activity logs
    getActivityLogs: async (tranId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/activity-logs?HLRBTRN_Id=${tranId}`, {
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

export default HallRentBookingTransactionApi;