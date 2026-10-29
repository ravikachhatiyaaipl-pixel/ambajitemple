/***
*  Application Name: I3EMS
*  Developed By: Aark InfoSoft Pvt Ltd.
*/

import axios from "axios";
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const CollectionCenterApi = {
    getAll: async (params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/lst-collection-center`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
        return response.data;
    },
    getById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/collection-center/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.data;
    },
    create: async (data) => {
        const response = await axios.post(`${API_BASE_URL}/collection-center`, data, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.data;
    },
    update: async (id, data) => {
        const response = await axios.put(`${API_BASE_URL}/collection-center/${id}`, data, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.data;
    },
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/collection-center/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.data;
    },
    getWards: async () => {
        const response = await axios.get(`${API_BASE_URL}/wards/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        return response.data;
    },
};

export default CollectionCenterApi;
