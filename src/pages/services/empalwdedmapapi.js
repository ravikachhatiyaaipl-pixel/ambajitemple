import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

const EmpAlwdedMapApi = {
  getAll: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/lst-emp-alwded-map`, {
      params,
      headers: authHeaders(),
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/emp-alwded-map/${id}`, {
      headers: authHeaders(),
    });
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/emp-alwded-map`, data, {
      headers: authHeaders(),
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(
      `${API_BASE_URL}/emp-alwded-map/${id}`,
      data,
      { headers: authHeaders() },
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/emp-alwded-map/${id}`,
      { headers: authHeaders() },
    );
    return response.data;
  },

  bulkAssign: async (data) => {
    const response = await axios.post(
      `${API_BASE_URL}/emp-alwded-map/bulk-assign`,
      data,
      { headers: authHeaders() },
    );
    return response.data;
  },

  bulkUnassign: async (ids) => {
    const response = await axios.post(
      `${API_BASE_URL}/emp-alwded-map/bulk-unassign`,
      { EAM_Ids: ids },
      { headers: authHeaders() },
    );
    return response.data;
  },

  getEmployees: async (params = {}) => {
    const response = await axios.get(
      `${API_BASE_URL}/emp-alwded-map-employees`,
      { params, headers: authHeaders() },
    );
    return response.data;
  },

  getHeads: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/emp-alwded-map-heads`, {
      params,
      headers: authHeaders(),
    });
    return response.data;
  },
};

export default EmpAlwdedMapApi;
