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

const HallRentalBookingAddonApi = {
    // Get all hall rental booking addons
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-hall-rental-booking-addon`, { 
                params, 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                } 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching hall rental booking addons:", error);
            throw error;
        }
    },

    // Get single addon by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-rental-booking-addon/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching hall rental booking addon ${id}:`, error);
            throw error;
        }
    },

    // Create new addon
    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/hall-rental-booking-addon`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating hall rental booking addon:", error);
            throw error;
        }
    },

    // Update addon
    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/hall-rental-booking-addon/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating hall rental booking addon ${id}:`, error);
            throw error;
        }
    },

    // Delete addon
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/hall-rental-booking-addon/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting hall rental booking addon ${id}:`, error);
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

    // Get all hall addons for dropdown
    getAllHallAddons: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-addon/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching hall addons:", error);
            throw error;
        }
    },

    // Get addon by ID with details
    getAddonById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-addon/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching hall addon ${id}:`, error);
            throw error;
        }
    },

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
    }
};

export default HallRentalBookingAddonApi;