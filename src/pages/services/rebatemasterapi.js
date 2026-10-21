/***
*  Application Name: I3EMS
*  Developed By: Aark InfoSoft Pvt Ltd.
*/

import axios from "axios";
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const RebateMasterApi = {
    getAll: async (params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/lst-rebate-master`, { params },{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    getById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/rebate-master/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    create: async (data) => {
        const response = await axios.post(`${API_BASE_URL}/rebate-master`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    update: async (id, data) => {
        const response = await axios.put(`${API_BASE_URL}/rebate-master/${id}`, data,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/rebate-master/${id}`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
    getFinancialYears: async () => {
        const response = await axios.get(`${API_BASE_URL}/fy-master`,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
        return response.data;
    },
};

export default RebateMasterApi;
