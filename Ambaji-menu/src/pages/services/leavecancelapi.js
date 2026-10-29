// services/leavecancelapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const LeaveCancelApi = {
    getAll: async (page = 1, perPage = 15, search = "", status = "") => {
        try {
            const params = { page, per_page: perPage, ...(search && { search }), ...(status && { Status: status }) };
            const response = await axios.get(`${API_BASE_URL}/lst-leave-trans`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
            return {
                entries: response.data?.data?.data || [],
                pagination: response.data?.data || { current_page: 1, last_page: 1, per_page: perPage, total: 0 },
            };
        } catch (error) { console.error("API Error:", error); throw error; }
    },

    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/leave-trans/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data?.data || response.data;
        } catch (error) { console.error("API Error:", error); throw error; }
    },

    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/leave-trans`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) { console.error("API Error:", error); throw error; }
    },

    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/leave-trans/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) { console.error("API Error:", error); throw error; }
    },

    updateStatus: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/leave-trans/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) { console.error("API Error:", error); throw error; }
    },

    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/leave-trans/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) { console.error("API Error:", error); throw error; }
    },

    getAllEmployees: async () => {
        try { return (await axios.get(`${API_BASE_URL}/emp-mast/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        })).data; }
        catch (error) { console.error("API Error:", error); throw error; }
    },

    getAllLeaveTypes: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/leave-type/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            if (response.data.success && response.data.data)
                response.data.data = response.data.data.filter((t) => t.Is_Active ==  true);
            return response.data;
        } catch (error) { console.error("API Error:", error); throw error; }
    },

    getAllFinancialYears: async () => {
        try { return (await axios.get(`${API_BASE_URL}/fy-master`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        })).data; }
        catch (error) { console.error("API Error:", error); throw error; }
    },

    getAllByStage: async (stage) => {
        try { return (await axios.get(`${API_BASE_URL}/action-master/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            params: { stage }
        })).data; }
        catch (error) { console.error("API Error:", error); throw error; }
    },
};

export { LeaveCancelApi };
