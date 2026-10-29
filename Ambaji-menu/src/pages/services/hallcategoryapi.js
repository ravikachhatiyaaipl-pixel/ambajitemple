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

const HallCategoryApi = {
    // Get all hall categories
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-hall-category`, { 
                params, 
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                } 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching hall categories:", error);
            throw error;
        }
    },

    // Get single hall category by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hall-category/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching hall category ${id}:`, error);
            throw error;
        }
    },

    // Create new hall category
    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/hall-category`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating hall category:", error);
            throw error;
        }
    },

    // Update hall category
    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/hall-category/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating hall category ${id}:`, error);
            throw error;
        }
    },

    // Delete hall category
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/hall-category/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting hall category ${id}:`, error);
            throw error;
        }
    }
};

export default HallCategoryApi;