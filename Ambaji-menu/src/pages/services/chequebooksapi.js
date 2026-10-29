import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const ChequeBooksApi = {
  // Get paginated list with filters
  getAllChequeBooks: async (page = 1, perPage = 10, search = '', filters = {}) => {
    try {
      let url = `${API_BASE_URL}/lst-cheque-books?page=${page}&per_page=${perPage}`;
      
      // Add generic search if present
      if (search && search.trim() !=  '') {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      // Add specific field filters
      if (filters.book_reference && filters.book_reference.trim() !=  '') {
        url += `&book_reference=${encodeURIComponent(filters.book_reference.trim())}`;
      }
      if (filters.issued_by_bank && filters.issued_by_bank.trim() !=  '') {
        url += `&issued_by_bank=${encodeURIComponent(filters.issued_by_bank.trim())}`;
      }
      if (filters.leaf_from && filters.leaf_from.trim() !=  '') {
        url += `&leaf_from=${encodeURIComponent(filters.leaf_from.trim())}`;
      }
      if (filters.leaf_to && filters.leaf_to.trim() !=  '') {
        url += `&leaf_to=${encodeURIComponent(filters.leaf_to.trim())}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.success) {
        const paginationData = response.data.data;
        
        return {
          chequeBooks: paginationData?.data || [],
          pagination: {
            current_page: paginationData?.current_page || 1,
            last_page: paginationData?.last_page || 1,
            per_page: paginationData?.per_page || perPage,
            total: paginationData?.total || 0,
            from: paginationData?.from || 0,
            to: paginationData?.to || 0,
          },
          count: paginationData?.total || 0,
        };
      }
      throw new Error(response.data.message || "Failed to fetch cheque books");
    } catch (error) {
      console.error("Error fetching cheque books:", error);
      throw error;
    }
  },

  // Get single cheque book by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheque-books/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data.data ?? response.data;
    } catch (error) {
      console.error(`Error fetching cheque book ${id}:`, error);
      throw error;
    }
  },

  // Create new cheque book
  create: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cheque-books`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating cheque book:", error);
      throw error;
    }
  },

  // Update cheque book
  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/cheque-books/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating cheque book ${id}:`, error);
      throw error;
    }
  },

  // Delete cheque book
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cheque-books/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.status ==  200 || response.status ==  204) {
        return { success: true };
      }
      throw new Error("Failed to delete cheque book");
    } catch (error) {
      console.error(`Error deleting cheque book ${id}:`, error);
      throw error;
    }
  },

  // Close cheque book
  close: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cheque-books/${id}/close`, null, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error closing cheque book ${id}:`, error);
      throw error;
    }
  },

  // Get all banks for dropdown
  getAllBanks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banks/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching banks:", error);
      return [];
    }
  },

  // Get payment modes (non-digital cash) for Book Account dropdown
getPaymentModes: async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/payment-modes/non-digital-cash`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    );
    
    if (response.data.status) {
      // Return the data array from the response
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching payment modes:", error);
    throw error;
  }
},

  // Get all bank accounts for dropdown
  // getAllBankAccounts: async () => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/bank-accounts/all`, {
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  //       }
  //     });
  //     if (response.data.success) {
  //       return response.data.data || [];
  //     }
  //     return [];
  //   } catch (error) {
  //     console.error("Error fetching bank accounts:", error);
  //     return [];
  //   }
  // },

  // Get all bank ledgers (Lg_Buk = Y) for the Book Account dropdown
  // Endpoint returns the full flat list in `data` - no pagination wrapper
  // getAllLedgers: async () => {
  //   try {
  //     const response = await axios.get(
  //       `${API_BASE_URL}/ledgers/all/data?Lg_Buk=Y`,
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  //         }
  //       }
  //     );

  //     if (response.data.success) {
  //       return response.data.data || [];
  //     }
  //     return [];
  //   } catch (error) {
  //     console.error("Error fetching ledgers:", error);
  //     throw error;
  //   }
  // },

// Add ONLY this to your ChequeBooksApi.js
getAllChequeFormats: async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cheque-formats/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (response.data.success) {
      // Filter active formats (status = 12 or is_active = true)
      const formats = response.data.data?.filter(
        format => format.is_active ==  true || format.status ==  12
      ) || [];
      return formats;
    }
    return [];
  } catch (error) {
    console.error("Error fetching cheque formats:", error);
    return [];
  }
},

  // Get all cheque books (without pagination)
  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cheque-books/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.data.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching all cheque books:", error);
      return [];
    }
  }
};

export { ChequeBooksApi };