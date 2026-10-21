/***
*  Application Name: I3EMS
*  Developed By: Aark InfoSoft Pvt Ltd.
*/

import axios from "axios";
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const PropOwnershipApi = {
    getAll: async (params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/lst-prop-ownership`, { params },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    getById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/prop-ownership/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    create: async (data) => {
        const response = await axios.post(`${API_BASE_URL}/prop-ownership`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    update: async (id, data) => {
        const response = await axios.put(`${API_BASE_URL}/prop-ownership/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/prop-ownership/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    getProperties: async () => {
        const response = await axios.get(`${API_BASE_URL}/property-master/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    getOwners: async () => {
        const response = await axios.get(`${API_BASE_URL}/owner-master/all`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
};

export default PropOwnershipApi;
