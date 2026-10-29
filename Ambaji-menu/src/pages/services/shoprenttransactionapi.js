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

const ShopRentTransactionApi = {
    // Get all shop rent transactions
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-shop-rent-transactions`, { 
                params, 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                } 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching shop rent transactions:", error);
            throw error;
        }
    },

    // Get single transaction by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/shop-rent-transactions/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching shop rent transaction ${id}:`, error);
            throw error;
        }
    },

    // Create new transaction
    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/shop-rent-transactions`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating shop rent transaction:", error);
            throw error;
        }
    },

    // Update transaction
    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/shop-rent-transactions/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating shop rent transaction ${id}:`, error);
            throw error;
        }
    },

    // Delete transaction
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/shop-rent-transactions/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting shop rent transaction ${id}:`, error);
            throw error;
        }
    },

    // Get all shop rent agreements for dropdown
    getAllAgreements: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/shop-rent-agreements/all`, {
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
    }
};

export default ShopRentTransactionApi;