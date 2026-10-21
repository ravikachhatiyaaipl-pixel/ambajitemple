// leavecarryforwardapi.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const LeaveCarryForwardApi = {
  // Get all carry forward records with pagination and filters
  getAll: async (page = 1, perPage = 15, search = "", fromFyId = "", toFyId = "", empId = "", ltId = "") => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...(search && { search }),
        ...(fromFyId && { from_fy_id: fromFyId }),
        ...(toFyId && { to_fy_id: toFyId }),
        ...(empId && { emp_id: empId }),
        ...(ltId && { lt_id: ltId })  
      };

      const response = await axios.get(`${API_BASE_URL}/leave-balance`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });

      return {
        entries: response.data.data?.data || [],
        pagination: response.data.data || {
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: 0,
        },
      };
    } catch (error) {
      console.error("API Error loading Carry Forward records:", error);
      throw error;
    }
  },

  // Get carry forward record by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-carry-forward/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error loading Carry Forward record:", error);
      throw error;
    }
  },

  /**
   * Check eligibility for carry forward
   * ENDPOINT: GET /leave-carry-forward/eligibility
   * 
   * Query Parameters:
   * - from_fy_id (integer, required): Source financial year ID
   * - emp_id (integer, optional): Filter by specific employee
   * - lt_id (integer, optional): Filter by specific leave type
   * 
   * Response Structure:
   * {
   *   "success": true,
   *   "data": {
   *     "from_fy_id": "3",
   *     "total_eligible": 1,
   *     "eligibility_list": [...]
   *   }
   * }
   */
  checkEligibility: async (fromFyId, empId = null, ltId = null) => {
    try {
      const params = {
        from_fy_id: fromFyId,
      };
      
      if (empId && empId !=  null && empId !=  "") {
        params.emp_id = empId;
      }
      
      if (ltId && ltId !=  null && ltId !=  "") {
        params.lt_id = ltId;
      }
      
      const response = await axios.get(`${API_BASE_URL}/leave-carry-forward/eligibility`, { params, headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }  });
      
      return response.data;
    } catch (error) {
      console.error("API Error checking eligibility:", error);
      throw error;
    }
  },

  /**
   * Process carry forward
   * ENDPOINT: POST /leave-carry-forward
   * 
   * Payload Parameters:
   * - from_fy_id (integer, required): Source financial year ID
   * - to_fy_id (integer, required): Target financial year ID
   * - emp_id (integer, optional): Process for specific employee
   * - lt_id (integer, optional): Process for specific leave type
   * - auto_carry (boolean, optional): Auto carry (default: true)
   * 
   * Response Structure:
   * {
   *   "success": true,
   *   "message": "Carry forward completed...",
   *   "data": {
   *     "from_fy": "2026-27",
   *     "from_fy_id": 3,
   *     "to_fy": "2027-28",
   *     "to_fy_id": 4,
   *     "processed_date": "2026-05-22T06:26:35.637213Z",
   *     "total_employees_processed": 2,
   *     "total_carried_forward_days": 12,
   *     "total_lapsed_days": 22,
   *     "carried_forward": [...],
   *     "lapsed": [...],
   *     "errors": []
   *   }
   * }
   */
  processCarryForward: async (data) => {
    try {
      const payload = {
        from_fy_id: parseInt(data.from_fy_id),
        to_fy_id: parseInt(data.to_fy_id),
        auto_carry: data.auto_carry !=  undefined ? data.auto_carry : true,
      };
      
      if (data.emp_id && data.emp_id !=  null && data.emp_id !=  "") {
        payload.emp_id = parseInt(data.emp_id);
      }
      
      if (data.lt_id && data.lt_id !=  null && data.lt_id !=  "") {
        payload.lt_id = parseInt(data.lt_id);
      }
      
      const response = await axios.post(`${API_BASE_URL}/leave-carry-forward`, payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("API Error processing carry forward:", error);
      throw error;
    }
  },

  /**
   * Check leave balance after carry forward
   * ENDPOINT: GET /leave-balance
   * 
   * Query Parameters:
   * - emp_id (integer, required): Employee ID
   * - lt_id (integer, required): Leave type ID
   * - fy_id (integer, required): Financial year ID
   * 
   * Response Structure:
   * {
   *   "success": true,
   *   "data": {
   *     "emp_id": "72",
   *     "lt_id": "1",
   *     "available_balance": 12
   *   }
   * }
   */
  getLeaveBalance: async (empId, ltId, fyId) => {
    try {
      const params = {
        emp_id: empId,
        lt_id: ltId,
        fy_id: fyId
      };
      
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
   * Get all leave types
   * ENDPOINT: GET /leave-type/all
   */
  getAllLeaveTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-type/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.data.success && response.data.data) {
        response.data.data = response.data.data.filter(type => type.Is_Active == true || type.Is_Active == 1);
      }
      
      return response.data;
    } catch (error) {
      console.error("API Error loading leave types:", error);
      throw error;
    }
  },

  /**
   * Get carry forward history by employee
   */
  getHistoryByEmployee: async (empId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave-carry-forward/history/${empId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("API Error fetching carry forward history:", error);
      throw error;
    }
  },

  /**
   * Get eligibility summary for a financial year
   */
  getEligibilitySummary: async (fromFyId, empId = null, ltId = null) => {
    try {
      const response = await LeaveCarryForwardApi.checkEligibility(fromFyId, empId, ltId);
      
      if (response.success && response.data) {
        const summary = {
          totalEligible: response.data.total_eligible || 0,
          fromFyId: response.data.from_fy_id,
          eligibleRecords: response.data.eligibility_list || [],
          totalRemainingDays: 0,
          totalEligibleDays: 0,
          totalWillLapse: 0
        };
        
        summary.eligibleRecords.forEach(record => {
          summary.totalRemainingDays += record.remaining_days || 0;
          summary.totalEligibleDays += record.eligible_days || 0;
          summary.totalWillLapse += record.will_lapse || 0;
        });
        
        return summary;
      }
      
      return {
        totalEligible: 0,
        fromFyId: fromFyId,
        eligibleRecords: [],
        totalRemainingDays: 0,
        totalEligibleDays: 0,
        totalWillLapse: 0
      };
    } catch (error) {
      console.error("API Error getting eligibility summary:", error);
      throw error;
    }
  },

  /**
   * Batch process carry forward for multiple employees
   * IMPROVED: Better error handling and detailed results
   */
  batchProcessCarryForward: async (fromFyId, toFyId, combinations, autoCarry = true, onProgress = null) => {
    try {
      const results = [];
      const successRecords = [];
      const failedRecords = [];
      let totalSuccess = 0;
      let totalFailed = 0;
      
      for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i];
        
        // Report progress if callback provided
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: combinations.length,
            currentCombo: combo
          });
        }
        
        try {
          const payload = {
            from_fy_id: fromFyId,
            to_fy_id: toFyId,
            emp_id: combo.emp_id,
            auto_carry: autoCarry,
          };
          
          if (combo.lt_id) {
            payload.lt_id = combo.lt_id;
          }
          
          const response = await LeaveCarryForwardApi.processCarryForward(payload);
          
          if (response.success && response.data) {
            totalSuccess++;
            successRecords.push({
              emp_id: combo.emp_id,
              lt_id: combo.lt_id,
              employee_name: combo.employee_name,
              leave_type: combo.leave_type,
              carried_days: response.data.total_carried_forward_days || 0,
              lapsed_days: response.data.total_lapsed_days || 0,
              data: response.data
            });
            results.push(response.data);
          } else {
            totalFailed++;
            failedRecords.push({
              emp_id: combo.emp_id,
              lt_id: combo.lt_id,
              employee_name: combo.employee_name,
              leave_type: combo.leave_type,
              reason: response.message || "Unknown error"
            });
          }
        } catch (error) {
          totalFailed++;
          failedRecords.push({
            emp_id: combo.emp_id,
            lt_id: combo.lt_id,
            employee_name: combo.employee_name,
            leave_type: combo.leave_type,
            reason: error.response?.data?.message || error.message || "Network error"
          });
        }
      }
      
      const combinedResult = {
        success: totalSuccess > 0,
        total_success: totalSuccess,
        total_failed: totalFailed,
        total_carried_forward_days: results.reduce((sum, r) => sum + (r.total_carried_forward_days || 0), 0),
        total_lapsed_days: results.reduce((sum, r) => sum + (r.total_lapsed_days || 0), 0),
        carried_forward: results.flatMap(r => r.carried_forward || []),
        lapsed: results.flatMap(r => r.lapsed || []),
        success_records: successRecords,
        failed_records: failedRecords,
        errors: results.flatMap(r => r.errors || [])
      };
      
      return combinedResult;
    } catch (error) {
      console.error("API Error in batch processing:", error);
      throw error;
    }
  },

  /**
   * Validate if carry forward is possible before processing
   */
  validateCarryForward: async (fromFyId, toFyId, empId, ltId = null) => {
    try {
      const eligibilityResponse = await LeaveCarryForwardApi.checkEligibility(fromFyId, empId, ltId);
      
      if (!eligibilityResponse.success) {
        return {
          valid: false,
          message: eligibilityResponse.message || "Failed to check eligibility",
          eligibleRecords: []
        };
      }
      
      const eligibleRecords = eligibilityResponse.data?.eligibility_list || [];
      
      if (eligibleRecords.length == 0) {
        return {
          valid: false,
          message: "No eligible records found for carry forward",
          eligibleRecords: []
        };
      }
      
      if (parseInt(fromFyId) == parseInt(toFyId)) {
        return {
          valid: false,
          message: "From and To financial years must be different",
          eligibleRecords
        };
      }
      
      return {
        valid: true,
        message: `Found ${eligibleRecords.length} eligible record(s)`,
        eligibleRecords,
        totalEligibleDays: eligibleRecords.reduce((sum, r) => sum + (r.eligible_days || 0), 0)
      };
    } catch (error) {
      console.error("API Error validating carry forward:", error);
      return {
        valid: false,
        message: error.response?.data?.message || "Validation failed",
        eligibleRecords: []
      };
    }
  },

  /**
   * NEW: Verify balances for multiple records after processing
   */
  verifyMultipleBalances: async (records, targetFyId) => {
    try {
      const verifications = [];
      
      for (const record of records) {
        try {
          const balanceResponse = await LeaveCarryForwardApi.getLeaveBalance(
            record.emp_id,
            record.lt_id,
            targetFyId
          );
          
          if (balanceResponse.success) {
            verifications.push({
              emp_id: record.emp_id,
              lt_id: record.lt_id,
              employee_name: record.employee_name,
              leave_type: record.leave_type,
              new_balance: balanceResponse.data?.available_balance || 0,
              verified: true,
              fy_id: targetFyId
            });
          } else {
            verifications.push({
              emp_id: record.emp_id,
              lt_id: record.lt_id,
              employee_name: record.employee_name,
              leave_type: record.leave_type,
              new_balance: 0,
              verified: false,
              error: balanceResponse.message || "Verification failed"
            });
          }
        } catch (error) {
          verifications.push({
            emp_id: record.emp_id,
            lt_id: record.lt_id,
            employee_name: record.employee_name,
            leave_type: record.leave_type,
            new_balance: 0,
            verified: false,
            error: error.message || "Network error"
          });
        }
      }
      
      return {
        success: verifications.filter(v => v.verified).length,
        failed: verifications.filter(v => !v.verified).length,
        verifications
      };
    } catch (error) {
      console.error("API Error verifying balances:", error);
      throw error;
    }
  }
};

export { LeaveCarryForwardApi };