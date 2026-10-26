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

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

const DonationApi = {
  // ------------------------------------------------------------------
  // MASTERS
  // ------------------------------------------------------------------
  getCategories: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/donation/categories`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  createCategory: async (data) => {
    const r = await axios.post(`${API_BASE_URL}/donation/categories`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  updateCategory: async (data) => {
    const r = await axios.put(`${API_BASE_URL}/donation/categories`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  deleteCategory: async (id) => {
    const r = await axios.delete(`${API_BASE_URL}/donation/categories`, {
      data: { id },
      headers: authHeaders(),
    });
    return r.data;
  },

  getTypes: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/donation/types`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  createType: async (data) => {
    const r = await axios.post(`${API_BASE_URL}/donation/types`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  updateType: async (data) => {
    const r = await axios.put(`${API_BASE_URL}/donation/types`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  deleteType: async (id) => {
    const r = await axios.delete(`${API_BASE_URL}/donation/types`, {
      data: { id },
      headers: authHeaders(),
    });
    return r.data;
  },

  getPurity: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/donation/purity`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  createPurity: async (data) => {
    const r = await axios.post(`${API_BASE_URL}/donation/purity`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  updatePurity: async (data) => {
    const r = await axios.put(`${API_BASE_URL}/donation/purity`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  deletePurity: async (id) => {
    const r = await axios.delete(`${API_BASE_URL}/donation/purity`, {
      data: { id },
      headers: authHeaders(),
    });
    return r.data;
  },

  getWeightUnits: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/donation/weight-units`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  createWeightUnit: async (data) => {
    const r = await axios.post(`${API_BASE_URL}/donation/weight-units`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  updateWeightUnit: async (data) => {
    const r = await axios.put(`${API_BASE_URL}/donation/weight-units`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  deleteWeightUnit: async (id) => {
    const r = await axios.delete(`${API_BASE_URL}/donation/weight-units`, {
      data: { id },
      headers: authHeaders(),
    });
    return r.data;
  },




  getReceiptSeries: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/donation/receipt-series`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  createReceiptSeries: async (data) => {
    const r = await axios.post(
      `${API_BASE_URL}/donation/receipt-series`,
      data,
      { headers: authHeaders() }
    );
    return r.data;
  },
  updateReceiptSeries: async (data) => {
    const r = await axios.put(
      `${API_BASE_URL}/donation/receipt-series`,
      data,
      { headers: authHeaders() }
    );
    return r.data;
  },

  // ------------------------------------------------------------------
  // CENTRAL DOCUMENT MASTER
  // ------------------------------------------------------------------
  getDocumentMaster: async (moduleOrParams = {}) => {
    // String doge to module samajh lo, object doge to params
    const params =
      typeof moduleOrParams === "string"
        ? { module: moduleOrParams }
        : moduleOrParams || {};

    const r = await axios.get(`${API_BASE_URL}/document/master`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  createDocumentMaster: async (data) => {
    const r = await axios.post(`${API_BASE_URL}/document/master`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  updateDocumentMaster: async (data) => {
    const r = await axios.put(`${API_BASE_URL}/document/master`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  deleteDocumentMaster: async (id) => {
    const r = await axios.delete(`${API_BASE_URL}/document/master`, {
      data: { id },
      headers: authHeaders(),
    });
    return r.data;
  },
  getDocumentMappings: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/document/mappings`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  createDocumentMapping: async (data) => {
    const r = await axios.post(`${API_BASE_URL}/document/mappings`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  updateDocumentMapping: async (data) => {
    const r = await axios.put(`${API_BASE_URL}/document/mappings`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  deleteDocumentMapping: async (id) => {
    const r = await axios.delete(`${API_BASE_URL}/document/mappings`, {
      data: { id },
      headers: authHeaders(),
    });
    return r.data;
  },
  getDocumentReferences: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/document/references`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },

  // Category wise MAPPED documents (central document mapping se)
  getMappedDocuments: async (categoryId) => {
    const r = await axios.get(`${API_BASE_URL}/donation/documents`, {
      params: { category_id: categoryId },
      headers: authHeaders(),
    });
    return r.data;
  },

  // Donation storage locations (ESTATE MASTER se + mapped documents)
  getDonationStorages: async () => {
    const r = await axios.get(`${API_BASE_URL}/donation/storage-locations`, {
      headers: authHeaders(),
    });
    return r.data;
  },

  // ------------------------------------------------------------------
  // DEVOTEE PORTAL
  // ------------------------------------------------------------------
  getPortalMasters: async (categoryId) => {
    const r = await axios.get(`${API_BASE_URL}/portal/donation/masters`, {
      params: categoryId ? { category_id: categoryId } : {},
      headers: authHeaders(),
    });
    return r.data;
  },
  createPortalDonation: async (data) => {
    const r = await axios.post(`${API_BASE_URL}/portal/donation/entries`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  getPortalDonations: async () => {
    const r = await axios.get(`${API_BASE_URL}/portal/donation/entries`, {
      headers: authHeaders(),
    });
    return r.data;
  },
  getPortalDonation: async (id) => {
    const r = await axios.get(`${API_BASE_URL}/portal/donation/entries/${id}`, {
      headers: authHeaders(),
    });
    return r.data;
  },
  getPortalDocuments: async (id) => {
    const r = await axios.get(`${API_BASE_URL}/portal/donation/entries/${id}/documents`, {
      headers: authHeaders(),
    });
    return r.data;
  },
  uploadPortalDocument: async (id, formData) => {
    const r = await axios.post(
      `${API_BASE_URL}/portal/donation/entries/${id}/documents`,
      formData,
      { headers: authHeaders() }
    );
    return r.data;
  },
  // ------------------------------------------------------------------
  // DONORS
  // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  // TRANSACTIONS
  // ------------------------------------------------------------------
  getTransactions: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/donation/transactions`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  getTransaction: async (id) => {
    const r = await axios.get(`${API_BASE_URL}/donation/transactions/${id}`, {
      headers: authHeaders(),
    });
    return r.data;
  },
  createTransaction: async (data) => {
    const r = await axios.post(`${API_BASE_URL}/donation/transactions`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },
  updateTransaction: async (id, data) => {
    const r = await axios.put(
      `${API_BASE_URL}/donation/transactions/${id}`,
      data,
      { headers: authHeaders() }
    );
    return r.data;
  },

  // ------------------------------------------------------------------
  // DOCUMENTS
  // ------------------------------------------------------------------
  getDocuments: async (id) => {
    const r = await axios.get(
      `${API_BASE_URL}/donation/transactions/${id}/documents`,
      { headers: authHeaders() }
    );
    return r.data;
  },
  uploadDocument: async (id, formData) => {
    const r = await axios.post(
      `${API_BASE_URL}/donation/transactions/${id}/documents`,
      formData,
      { headers: authHeaders() }
    );
    return r.data;
  },
  deleteDocument: async (docId) => {
    const r = await axios.delete(
      `${API_BASE_URL}/donation/documents/${docId}`,
      { headers: authHeaders() }
    );
    return r.data;
  },

  // ------------------------------------------------------------------
  // APPROVALS
  // ------------------------------------------------------------------
  getPendingApprovals: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/donation/approvals/pending`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  getApprovalChain: async () => {
    const r = await axios.get(`${API_BASE_URL}/donation/approvals/chain`, {
      headers: authHeaders(),
    });
    return r.data;
  },
  getApprovalDetail: async (id) => {
    const r = await axios.get(`${API_BASE_URL}/donation/approvals/${id}`, {
      headers: authHeaders(),
    });
    return r.data;
  },
  act: async (id, data) => {
    const r = await axios.post(`${API_BASE_URL}/donation/approvals/${id}`, data, {
      headers: authHeaders(),
    });
    return r.data;
  },

  // ------------------------------------------------------------------
  // STORAGE ALLOCATION
  // ------------------------------------------------------------------
  getAllocations: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/donation/storage-allocations`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  allocateStorage: async (id, data) => {
    const r = await axios.post(
      `${API_BASE_URL}/donation/transactions/${id}/storage-allocation`,
      data,
      { headers: authHeaders() }
    );
    return r.data;
  },

  // ------------------------------------------------------------------
  // REPORTS
  // ------------------------------------------------------------------
  getSummary: async (params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/donation/reports/summary`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
  getReport: async (name, params = {}) => {
    const r = await axios.get(`${API_BASE_URL}/donation/reports/${name}`, {
      params,
      headers: authHeaders(),
    });
    return r.data;
  },
};

export default DonationApi;
