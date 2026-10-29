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

const authHeaders = (multipart = false) => ({
    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    Accept: "application/json",
    ...(multipart ? {} : {}),
});

const BgEntryApi = {
    getAll: async (params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/lst-bg-entry`, {
            params,
            headers: authHeaders(),
        });
        return response.data;
    },

    getAllForExport: async (params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/bg-entry/all`, {
            params,
            headers: authHeaders(),
        });
        return response.data;
    },

    getById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/bg-entry/${id}`, {
            headers: authHeaders(),
        });
        return response.data;
    },

    create: async (formData) => {
        const response = await axios.post(`${API_BASE_URL}/bg-entry`, formData, {
            headers: authHeaders(true),
        });
        return response.data;
    },

    update: async (id, formData) => {
        const response = await axios.post(`${API_BASE_URL}/bg-entry/${id}`, formData, {
            headers: authHeaders(true),
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/bg-entry/${id}`, {
            headers: authHeaders(),
        });
        return response.data;
    },
};

export default BgEntryApi;
