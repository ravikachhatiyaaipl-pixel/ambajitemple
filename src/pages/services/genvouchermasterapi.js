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

const GenVoucherMasterApi = {
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-gen-voucher`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
            return response.data;
        } catch (error) {
            console.error("Error fetching gen voucher masters:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/gen-voucher/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching gen voucher master ${id}:`, error);
            throw error;
        }
    },

    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/gen-voucher`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating gen voucher master:", error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/gen-voucher/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating gen voucher master ${id}:`, error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/gen-voucher/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting gen voucher master ${id}:`, error);
            throw error;
        }
    },
};

export default GenVoucherMasterApi;
