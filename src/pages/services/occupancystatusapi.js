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

const OccupancyStatusApi = {
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-occupancy-status`, { params },{
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
              });
            return response.data;
        } catch (error) {
            console.error("Error fetching occupancy statuses:", error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/occupancy-status/${id}`,{
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
            return response.data;
        } catch (error) {
            console.error(`Error fetching occupancy status ${id}:`, error);
            throw error;
        }
    },

    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/occupancy-status`, data,{
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                  'Content-Type': 'application/json'
        }});
            return response.data;
        } catch (error) {
            console.error("Error creating occupancy status:", error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/occupancy-status/${id}`, data,{
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                  'Content-Type': 'application/json'
        }});
            return response.data;
        } catch (error) {
            console.error(`Error updating occupancy status ${id}:`, error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/occupancy-status/${id}`,{
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }});
            return response.data;
        } catch (error) {
            console.error(`Error deleting occupancy status ${id}:`, error);
            throw error;
        }
    },
};

export default OccupancyStatusApi;
