import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const FamilyInfoApi = {
    getAll: async (params = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lst-family-info`, {
                params: {
                    per_page: params.perPage || 10,
                    page: params.page || 1,
                    search: params.search || ''
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            console.log("Raw API Response:", response.data); // For debugging

            // Handle the actual response structure from your API
            if (response.data && response.data.success ==  true) {
                return {
                    data: response.data.data?.data || [], // The actual family info array is in data.data
                    meta: {
                        current_page: response.data.data?.current_page || 1,
                        last_page: response.data.data?.last_page || 1,
                        per_page: response.data.data?.per_page || 10,
                        total: response.data.data?.total || 0,
                        from: response.data.data?.from || 0,
                        to: response.data.data?.to || 0
                    }
                };
            }

            return {
                data: [],
                meta: {}
            };
        } catch (error) {
            console.error("Error fetching family information:", error);
            throw error.response?.data || error.message;
        }
    },

    getById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/family-info/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching family information ${id}:`, error);
            throw error.response?.data || error.message;
        }
    },

    create: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/family-info`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating family information:", error);
            throw error.response?.data || error.message;
        }
    },

    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/family-info/${id}`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating family information ${id}:`, error);
            throw error.response?.data || error.message;
        }
    },

    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/family-info/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting family information ${id}:`, error);
            throw error.response?.data || error.message;
        }
    },
};

export { FamilyInfoApi };