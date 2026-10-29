/***
*
*  Application Name: I3EMS
*
*  Developed By: Aark InfoSoft Pvt Ltd.
*
*  Version: Ambaji Mata Temple Management
*
*/

import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    Accept: "application/json",
});

const ZoneCollectionApi = {
    summary: async (params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/zone-collection/summary`, {
            params,
            headers: authHeaders(),
        });
        return response.data;
    },
    getAll: async (params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/lst-zone-collection`, {
            params,
            headers: authHeaders(),
        });
        return response.data;
    },
    getById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/zone-collection/${id}`, {
            headers: authHeaders(),
        });
        return response.data;
    },
    create: async (data) => {
        const response = await axios.post(`${API_BASE_URL}/zone-collection`, data, {
            headers: authHeaders(),
        });
        return response.data;
    },
    update: async (id, data) => {
        const response = await axios.put(`${API_BASE_URL}/zone-collection/${id}`, data, {
            headers: authHeaders(),
        });
        return response.data;
    },
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/zone-collection/${id}`, {
            headers: authHeaders(),
        });
        return response.data;
    },
};

export default ZoneCollectionApi;
