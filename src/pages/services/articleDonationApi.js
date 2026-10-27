import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

const ArticleDonationApi = {
  getTransactions: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/article-donation/transactions`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  getTransaction: async (id) => {
    const r = await axios.get(`${API_BASE_URL}/article-donation/transactions/${id}`, {
      headers: authHeaders(),
    });
    return r.data;
  },
  createTransaction: async (formData) => {
    const r = await axios.post(`${API_BASE_URL}/article-donation/transactions`, formData, {
      headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    });
    return r.data;
  },
  updateTransaction: async (id, formData) => {
    const r = await axios.put(`${API_BASE_URL}/article-donation/transactions/${id}`, formData, {
      headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    });
    return r.data;
  },
  getDocuments: async (id) => {
    const r = await axios.get(`${API_BASE_URL}/article-donation/transactions/${id}/documents`, {
      headers: authHeaders(),
    });
    return r.data;
  },
  uploadDocument: async (id, formData) => {
    const r = await axios.post(`${API_BASE_URL}/article-donation/transactions/${id}/documents`, formData, {
      headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    });
    return r.data;
  },
  deleteDocument: async (docId) => {
    const r = await axios.delete(`${API_BASE_URL}/article-donation/documents/${docId}`, {
      headers: authHeaders(),
    });
    return r.data;
  },
  getStorageLocations: async () => {
    const r = await axios.get(`${API_BASE_URL}/article-donation/storage-locations`, {
      headers: authHeaders(),
    });
    return r.data;
  },

  // ------------------------------------------------------------------
  // APPROVALS (dynamic flow - action_master stage 'ART')
  // ------------------------------------------------------------------
  getPendingApprovals: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/article-donation/approvals/pending`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  getApprovalDetail: async (id) => {
    const r = await axios.get(`${API_BASE_URL}/article-donation/approvals/${id}`, {
      headers: authHeaders(),
    });
    return r.data;
  },
  act: async (id, data) => {
    const r = await axios.post(`${API_BASE_URL}/article-donation/approvals/${id}`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },

  // ------------------------------------------------------------------
  // DEVOTEE - my article donations
  // ------------------------------------------------------------------
  getMyDonations: async () => {
    const r = await axios.get(`${API_BASE_URL}/article-donation/my`, {
      headers: authHeaders(),
    });
    return r.data;
  },

  allocateStorage: async (id, data) => {
    const r = await axios.post(`${API_BASE_URL}/article-donation/transactions/${id}/storage-allocation`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  getReport: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/article-donation/reports/list`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  getDocumentMaster: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/document/master`, {
      params: { ...params, module: params.module || "ARTICLE" },
      headers: authHeaders(),
    });
    return r.data;
  },
};

export default ArticleDonationApi;
