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

const ShopRentAgreementApi = {
    // Get all shop rent agreements
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-shop-rent-agreements`, { 
                params, 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                } 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching shop rent agreements:", error);
            throw error;
        }
    },

    // Get single agreement by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/shop-rent-agreements/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching shop rent agreement ${id}:`, error);
            throw error;
        }
    },

    // Create new agreement
    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/shop-rent-agreements`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating shop rent agreement:", error);
            throw error;
        }
    },

    // Update agreement
    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/shop-rent-agreements/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating shop rent agreement ${id}:`, error);
            throw error;
        }
    },

    // Delete agreement
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/shop-rent-agreements/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting shop rent agreement ${id}:`, error);
            throw error;
        }
    },

    // Get all shop rent applications for dropdown
    getAllShopRentApplications: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/shop-rent-application/all`, {
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

    // Get all shops for dropdown
    getAllShops: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/shop/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching shops:", error);
            throw error;
        }
    }
};

export default ShopRentAgreementApi;