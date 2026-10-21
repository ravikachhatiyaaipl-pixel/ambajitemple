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

const CityHraClaApi = {
    // Get paginated list with search (for list page)
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-city-hracla`, {
                params: {
                    per_page: params.perPage || 10,
                    page: params.page || 1,
                    search: params.search || ''
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            console.log("API Response:", response.data); // Add this for debugging

            // Check if the response has the expected structure
            if (response.data?.success && response.data?.data) {
                // The records are in response.data.data.data (nested)
                const responseData = response.data.data;

                // Extract the records array from responseData.data
                let recordsArray = [];
                if (responseData.data && Array.isArray(responseData.data)) {
                    recordsArray = responseData.data;
                } else if (Array.isArray(responseData)) {
                    recordsArray = responseData;
                }

                // Extract pagination info from responseData
                const paginationInfo = {
                    current_page: responseData.current_page || params.page || 1,
                    last_page: responseData.last_page || 1,
                    per_page: responseData.per_page || params.perPage || 10,
                    total: responseData.total || recordsArray.length,
                    from: responseData.from || (recordsArray.length > 0 ? 1 : 0),
                    to: responseData.to || recordsArray.length,
                };

                return {
                    data: recordsArray,
                    meta: paginationInfo
                };
            }

            // Fallback for unexpected response structure
            return {
                data: [],
                meta: {
                    current_page: params.page || 1,
                    last_page: 1,
                    per_page: params.perPage || 10,
                    total: 0,
                    from: 0,
                    to: 0,
                }
            };
        } catch (error) {
            console.error("Error fetching city HRA/CLA records:", error);
            return {
                data: [],
                meta: {
                    current_page: params.page || 1,
                    last_page: 1,
                    per_page: params.perPage || 10,
                    total: 0,
                    from: 0,
                    to: 0,
                }
            };
        }
    },

    // Get all records (for dropdowns, etc.)
    getAllRecords: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/city-hracla/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data.data || [];
        } catch (error) {
            console.error("Error fetching all city HRA/CLA records:", error);
            throw error.response?.data || error.message;
        }
    },

    // Get single record by ID
    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/city-hracla/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            console.log("Get by ID Response:", response.data); // Add for debugging

            // Check if the response has the expected structure
            if (response.data?.success && response.data?.data) {
                return response.data; // Return the whole response object
            }

            // Fallback
            return { data: response.data };
        } catch (error) {
            console.error(`Error fetching city HRA/CLA record ${id}:`, error);
            throw {
                message: error.response?.data?.message || "Failed to fetch record",
                errors: error.response?.data?.errors || {}
            };
        }
    },

    // Create new record
    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/city-hracla`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating city HRA/CLA record:", error);
            if (error.response?.data?.errors) {
                throw error.response.data;
            }
            throw error.response?.data || error.message;
        }
    },

    // Update existing record
    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/city-hracla/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating city HRA/CLA record ${id}:`, error);
            if (error.response?.data?.errors) {
                throw error.response.data;
            }
            throw error.response?.data || error.message;
        }
    },

    // Delete record
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/city-hracla/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting city HRA/CLA record ${id}:`, error);
            throw error.response?.data || error.message;
        }
    },
};

export { CityHraClaApi };