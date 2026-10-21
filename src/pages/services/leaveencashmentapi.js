// leaveencashmentapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const LeaveEncashmentApi = {
  // Get all encashment records with pagination and filters
  getAll: async (page = 1, perPage = 15, search = "", fyId = "", empId = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(fyId && { fy_id: fyId }),
        ...(empId && { emp_id: empId })
      };

      // Use the correct endpoint /lst-leave-trans
      const response = await axios.get(`${API_BASE_URL}/lst-leave-trans`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });

      // Get all data from response
      let allData = response.data.data?.data || [];
      
      // Filter to show only encashment transactions (Tr_Type contains 'ENCASHMENT')
      let encashmentData = allData.filter(item => 
        item.Tr_Type && item.Tr_Type.includes('ENCASHMENT')
      );

      // Transform data to match component expectations
      const transformedData = encashmentData.map(item => ({
        // Transaction ID
        transaction_id: item.LTr_id,
        LTr_id: item.LTr_id,
        
        // Employee information
        emp_id: item.Emp_Id,
        employee_id: item.Emp_Id,
        employee_name: item.employee?.First_Name || `Employee #${item.Emp_Id}`,
        employee_code: item.employee?.Emp_Code || '',
        employee: item.employee,
        
        // Leave type information
        lt_id: item.LT_id,
        leave_type: item.leave_type?.LT_name || `Leave Type #${item.LT_id}`,
        leave_type_code: item.leave_type?.LT_code || '',
        leave_type_obj: item.leave_type,
        
        // Financial year information
        fy_id: item.FY_Id,
        fy_name: item.financial_year?.FY_Name || `FY #${item.FY_Id}`,
        financial_year: item.financial_year,
        
        // Transaction details
        encash_days: parseFloat(item.Tr_Days) || 0,
        Tr_Days: item.Tr_Days,
        Tr_Type: item.Tr_Type,
        Tr_Mode: item.Tr_Mode,
        Tr_Date: item.Tr_Date,
        LT_Date: item.LT_Date,
        
        // Payment and amount details (amount may need to be calculated or from another source)
        total_amount: 0, // This might need to be calculated
        amount: 0,
        daily_rate: 0,
        
        // Payment reference - using transaction type as reference
        payment_reference: item.Tr_Type,
        payment_date: item.LT_Date || item.Tr_Date,
        
        // Remarks and status
        remarks: item.Tr_Type,
        Status: item.Status,
        status_action: item.status_action,
        
        // Original data for reference
        original_data: item
      }));
      
      // Return in the format expected by the component
      return {
        entries: transformedData,
        pagination: response.data.data || {
          current_page: page,
          last_page: Math.ceil(encashmentData.length / perPage) || 1,
          per_page: perPage,
          total: transformedData.length,
        },
      };
    } catch (error) {
      console.error("API Error loading Encashment records:", error);
      throw error;
    }
  },

  // Get encashment history for a specific employee
getEncashmentHistory: async (empId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leave-encashment/history/${empId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching encashment history:", error);
    throw error;
  }
},

  // Get encashment record by ID
  getById: async (id) => {
    try {
      // Fetch all transactions and filter by ID
      const response = await axios.get(`${API_BASE_URL}/lst-leave-trans`, {
        params: { per_page: 10000 },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const allData = response.data.data?.data || [];
      const encashmentRecord = allData.find(item => 
        item.LTr_id == id && item.Tr_Type && item.Tr_Type.includes('ENCASHMENT')
      );
      
      if (!encashmentRecord) {
        throw new Error('Encashment record not found');
      }
      
      // Transform single record
      const transformedRecord = {
        success: true,
        data: {
          transaction_id: encashmentRecord.LTr_id,
          LTr_id: encashmentRecord.LTr_id,
          emp_id: encashmentRecord.Emp_Id,
          employee_name: encashmentRecord.employee?.First_Name,
          employee_code: encashmentRecord.employee?.Emp_Code,
          employee: encashmentRecord.employee,
          leave_type: encashmentRecord.leave_type?.LT_name,
          leave_type_code: encashmentRecord.leave_type?.LT_code,
          leave_type_obj: encashmentRecord.leave_type,
          fy_id: encashmentRecord.FY_Id,
          fy_name: encashmentRecord.financial_year?.FY_Name,
          financial_year: encashmentRecord.financial_year,
          encash_days: encashmentRecord.Tr_Days,
          Tr_Days: encashmentRecord.Tr_Days,
          Tr_Type: encashmentRecord.Tr_Type,
          Tr_Mode: encashmentRecord.Tr_Mode,
          Tr_Date: encashmentRecord.Tr_Date,
          LT_Date: encashmentRecord.LT_Date,
          original_data: encashmentRecord
        }
      };
      
      return transformedRecord;
    } catch (error) {
      console.error("API Error loading Encashment record:", error);
      throw error;
    }
  },

  /**
   * Get encashment summary from transactions
   */
  getEncashmentSummary: async (fyId = null, startDate = null, endDate = null) => {
    try {
      const params = {
        per_page: 10000,
        ...(fyId && { fy_id: fyId })
      };
      
      const response = await axios.get(`${API_BASE_URL}/lst-leave-trans`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
      const allData = response.data.data?.data || [];
      
      // Filter encashment transactions
      const encashments = allData.filter(item => 
        item.Tr_Type && item.Tr_Type.includes('ENCASHMENT')
      );
      
      // Calculate summary
      const summary = {
        total_encashments: encashments.length,
        total_days_encashed: encashments.reduce((sum, item) => sum + (parseFloat(item.Tr_Days) || 0), 0),
        total_amount: 0, // Amount might need to be fetched from another source
      };
      
      return {
        success: true,
        data: summary
      };
    } catch (error) {
      console.error("API Error fetching encashment summary:", error);
      return {
        success: false,
        data: {
          total_encashments: 0,
          total_days_encashed: 0,
          total_amount: 0
        }
      };
    }
  },

  /**
   * Check eligibility for leave encashment
   * ENDPOINT: GET /leave-encashment/eligibility
   */
  checkEligibility: async (fyId = null, empId = null, ltId = null) => {
    try {
      const params = {};
      
      if (fyId && fyId !=  null && fyId !=  "") {
        params.fy_id = fyId;
      }
      
      if (empId && empId !=  null && empId !=  "") {
        params.emp_id = empId;
      }
      
      if (ltId && ltId !=  null && ltId !=  "") {
        params.lt_id = ltId;
      }
      
      const response = await axios.get(`${API_BASE_URL}/leave-encashment/eligibility`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
      
      return response.data;
    } catch (error) {
      console.error("API Error checking encashment eligibility:", error);
      throw {
        response: {
          data: {
            message: error.response?.data?.message || "Failed to check eligibility",
            ...error.response?.data
          }
        },
        message: error.message
      };
    }
  },

  /**
   * Process leave encashment
   * ENDPOINT: POST /leave-encashment
   */
  processEncashment: async (data) => {
    try {
      const payload = {
        emp_id: parseInt(data.emp_id),
        lt_id: parseInt(data.lt_id),
        fy_id: parseInt(data.fy_id),
        encash_days: parseFloat(data.encash_days),
      };
      
      // Add optional parameters if provided
      if (data.daily_rate && data.daily_rate !=  null && data.daily_rate !=  "") {
        payload.daily_rate = parseFloat(data.daily_rate);
      }
      
      if (data.total_amount && data.total_amount !=  null && data.total_amount !=  "") {
        payload.total_amount = parseFloat(data.total_amount);
      }
      
      if (data.payment_reference && data.payment_reference !=  "") {
        payload.payment_reference = data.payment_reference;
      }
      
      if (data.payment_date && data.payment_date !=  "") {
        payload.payment_date = data.payment_date;
      }
      
      if (data.remarks && data.remarks !=  "") {
        payload.remarks = data.remarks;
      }
      
      if (data.Status && data.Status !=  null && data.Status !=  "") {
        payload.Status = parseInt(data.Status);
      }
      
      const response = await axios.post(`${API_BASE_URL}/leave-encashment`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("API Error processing encashment:", error);
      throw error;
    }
  },

  /**
   * Get encashment history by employee
   * ENDPOINT: GET /leave-encashment/history/{emp_id}
   */
  getHistoryByEmployee: async (empId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-encashment/history/${empId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error fetching encashment history:", error);
      throw error;
    }
  },

  /**
   * Check leave balance after encashment
   * ENDPOINT: GET /leave-balance
   */
  getLeaveBalance: async (empId, ltId, fyId = null) => {
    try {
      const params = {
        emp_id: empId,
        lt_id: ltId,
      };
      
      if (fyId && fyId !=  null && fyId !=  "") {
        params.fy_id = fyId;
      }
      
      const response = await axios.get(`${API_BASE_URL}/leave-balance`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
      return response.data;
    } catch (error) {
      console.error("API Error fetching leave balance:", error);
      throw error;
    }
  },

  /**
   * Get all financial years
   * ENDPOINT: GET /fy-master
   */
  getAllFinancialYears: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fy-master`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading financial years:", error);
      throw error;
    }
  },

  /**
   * Get all employees
   * ENDPOINT: GET /emp-mast/all
   */
  getAllEmployees: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emp-mast/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading employees:", error);
      throw error;
    }
  },

  /**
   * Get all leave types (only those that allow encashment)
   * ENDPOINT: GET /leave-type/all
   */
  getAllLeaveTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-type/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      // Filter only active leave types and those that allow encashment
      if (response.data.success && response.data.data) {
        response.data.data = response.data.data.filter(type => {
          const isActive = type.Is_Active == true || type.Is_Active == 1;
          const encashmentAllowed = type.Is_Encash == true || type.Is_Encash == 1;
          return isActive && encashmentAllowed;
        });
      }
      
      return response.data;
    } catch (error) {
      console.error("API Error loading leave types:", error);
      throw error;
    }
  },

  /**
   * Get eligibility summary for a financial year
   */
  getEligibilitySummary: async (fyId = null, empId = null,headers = null, ltId = null) => {
    try {
      const response = await LeaveEncashmentApi.checkEligibility(fyId, empId, ltId);
      
      if (response.success && response.data) {
        const summary = {
          totalEligible: response.data.total_eligible || 0,
          fyId: response.data.fy_id,
          totalEncashableDays: response.data.total_encashable_days || 0,
          totalEstimatedAmount: response.data.total_estimated_amount || 0,
          eligibilityRecords: response.data.eligibility_list || []
        };
        
        return summary;
      }
      
      return {
        totalEligible: 0,
        fyId: fyId,
        totalEncashableDays: 0,
        totalEstimatedAmount: 0,
        eligibilityRecords: []
      };
    } catch (error) {
      console.error("API Error getting eligibility summary:", error);
      throw error;
    }
  },

  /**
   * Batch process encashment for multiple employees
   */
  batchProcessEncashment: async (fyId, encashments, headers, autoCalculateRate = true) => {
    try {
      const results = [];
      let totalSuccess = 0;
      let totalFailed = 0;
      let totalEncashedDays = 0;
      let totalAmount = 0;
      
      for (const encashment of encashments) {
        try {
          const payload = {
            emp_id: encashment.emp_id,
            lt_id: encashment.lt_id,
            fy_id: fyId,
            encash_days: encashment.encash_days,
          };
          
          if (encashment.daily_rate) {
            payload.daily_rate = encashment.daily_rate;
          }
          
          if (encashment.total_amount) {
            payload.total_amount = encashment.total_amount;
          }
          
          if (encashment.payment_reference) {
            payload.payment_reference = encashment.payment_reference;
          }
          
          if (encashment.payment_date) {
            payload.payment_date = encashment.payment_date;
          }
          
          if (encashment.remarks) {
            payload.remarks = encashment.remarks;
          }
          
          const response = await LeaveEncashmentApi.processEncashment(payload);
          
          if (response.success) {
            totalSuccess++;
            totalEncashedDays += encashment.encash_days;
            if (response.data?.encashment_details?.total_amount) {
              totalAmount += response.data.encashment_details.total_amount;
            }
            results.push(response.data);
          } else {
            totalFailed++;
            results.push({ error: response.message });
          }
        } catch (error) {
          totalFailed++;
          console.error(`Error processing encashment for emp_id: ${encashment.emp_id}:`, error);
          results.push({ error: error.response?.data?.message || error.message });
        }
      }
      
      const combinedResult = {
        success: totalSuccess > 0,
        total_success: totalSuccess,
        total_failed: totalFailed,
        total_encashed_days: totalEncashedDays,
        total_amount: totalAmount,
        results: results
      };
      
      return combinedResult;
    } catch (error) {
      console.error("API Error in batch processing:", error);
      throw error;
    }
  },

  /**
   * Validate if encashment is possible before processing
   */
  validateEncashment: async (fyId, empId, ltId, encashDays , headers) => {
    try {
      // First check eligibility
      const eligibilityResponse = await LeaveEncashmentApi.checkEligibility(fyId, empId, ltId);
      
      if (!eligibilityResponse.success) {
        return {
          valid: false,
          message: eligibilityResponse.message || "Failed to check eligibility",
          eligibleRecord: null
        };
      }
      
      const eligibleRecords = eligibilityResponse.data?.eligibility_list || [];
      
      if (eligibleRecords.length == 0) {
        return {
          valid: false,
          message: "No eligible record found for encashment",
          eligibleRecord: null
        };
      }
      
      const eligibleRecord = eligibleRecords[0];
      
      // Check if encashment is allowed
      if (!eligibleRecord.can_encash) {
        return {
          valid: false,
          message: eligibleRecord.remarks || "Encashment not allowed for this leave type",
          eligibleRecord
        };
      }
      
      // Check if encash days are valid
      if (encashDays <= 0) {
        return {
          valid: false,
          message: "Encashment days must be greater than 0",
          eligibleRecord
        };
      }
      
      // Check if enough balance
      if (encashDays > eligibleRecord.encashable_days) {
        return {
          valid: false,
          message: `Insufficient balance. Available: ${eligibleRecord.encashable_days} days, Requested: ${encashDays} days`,
          eligibleRecord,
          maxEncashable: eligibleRecord.encashable_days
        };
      }
      
      // Check max limit if applicable
      if (eligibleRecord.max_encash_days && encashDays > eligibleRecord.max_encash_days) {
        return {
          valid: false,
          message: `Encashment days exceed maximum limit. Max allowed: ${eligibleRecord.max_encash_days} days`,
          eligibleRecord,
          maxEncashable: eligibleRecord.max_encash_days
        };
      }
      
      return {
        valid: true,
        message: "Encashment is valid",
        eligibleRecord,
        maxEncashable: eligibleRecord.encashable_days,
        dailyRate: eligibleRecord.daily_rate,
        estimatedAmount: (eligibleRecord.daily_rate || 0) * encashDays
      };
    } catch (error) {
      console.error("API Error validating encashment:", error);
      return {
        valid: false,
        message: error.response?.data?.message || "Validation failed",
        eligibleRecord: null
      };
    }
  },

  /**
   * Cancel an encashment transaction
   * ENDPOINT: POST /leave-encashment/cancel/{transaction_id}
   */
  cancelEncashment: async (transactionId, remarks = "") => {
    try {
      const response = await axios.post(`${API_BASE_URL}/leave-encashment/cancel/${transactionId}`, {
        remarks: remarks
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error cancelling encashment:", error);
      throw error;
    }
  }
};

export { LeaveEncashmentApi };