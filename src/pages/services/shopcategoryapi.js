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

const ShopCategoryApi = {
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-shop-categories`, { 
                params, 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                } 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching shop categories:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/shop-categories/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching shop category ${id}:`, error);
            throw error;
        }
    },

    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/shop-categories`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating shop category:", error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/shop-categories/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating shop category ${id}:`, error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/shop-categories/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting shop category ${id}:`, error);
            throw error;
        }
    },
};

export default ShopCategoryApi;