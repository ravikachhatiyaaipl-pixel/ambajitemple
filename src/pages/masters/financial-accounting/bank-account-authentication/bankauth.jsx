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

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  RefreshCw,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Landmark,
  ShieldCheck,
  CheckCircle,
  XCircle,
  CheckSquare,
  Square,
  Eye,
  Loader2,
  Building2,
  Banknote,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SubLedgerAccountApi } from "../../../services/subledgeraccountapi";
import debounce from "lodash/debounce";

const BankAuthList = ({ user }) => {
  const [bankRecords, setBankRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingRecords, setVerifyingRecords] = useState(new Set());
  const [bulkVerifying, setBulkVerifying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("N");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [searchDebounced, setSearchDebounced] = useState("");
  const [pageTitle, setPageTitle] = useState("Bank Account Authentication");
  const navigate = useNavigate();

  // Get page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]"
      );

      const currentPath = "/masters/financial-accounting/bank-account-authentication";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchDebounced(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    handleClearSearch();
  };

  // Handle filter change
  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
    setSelectedRecords([]);
  };

  // Load records when dependencies change
  useEffect(() => {
    loadBankRecords();
  }, [currentPage, searchDebounced, filterStatus]);

  // Load bank records based on filter
  const loadBankRecords = async () => {
    setLoading(true);
    try {
      let result;
      
      if (filterStatus == "Y") {
        result = await SubLedgerAccountApi.getAll(
          currentPage,
          itemsPerPage,
          searchDebounced,
          { Is_Bank_Verified: "Y", Is_Bank_Details: "Y" }
        );
      } else if (filterStatus == "N") {
        result = await SubLedgerAccountApi.getAll(
          currentPage,
          itemsPerPage,
          searchDebounced,
          { Is_Bank_Verified: "N", Is_Bank_Details: "Y" }
        );
      } else if (filterStatus == "R") {
        result = await SubLedgerAccountApi.getAll(
          currentPage,
          itemsPerPage,
          searchDebounced,
          { Is_Bank_Verified: "R", Is_Bank_Details: "Y" }
        );
      } else if (filterStatus == "I") {
        result = await SubLedgerAccountApi.getAll(
          currentPage,
          itemsPerPage,
          searchDebounced,
          { Is_Bank_Verified: "I" }
        );
      }

      if (result.success && result.data) {
        const apiData = result.data;
        let filteredData = apiData.data || [];
        
        setBankRecords(filteredData);
        setPagination({
          current_page: apiData.current_page,
          last_page: apiData.last_page,
          per_page: apiData.per_page,
          total: filteredData.length,
          from: apiData.from,
          to: apiData.to,
        });
        setSelectedRecords([]);
      } else {
        toast.error(result.message || "Failed to load bank records");
        setBankRecords([]);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: itemsPerPage,
          total: 0,
          from: 0,
          to: 0,
        });
      }
    } catch (error) {
      console.error("Error loading bank records:", error);
      toast.error("Failed to load bank records");
      setBankRecords([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: itemsPerPage,
        total: 0,
        from: 0,
        to: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== KOTAK BANK API INTEGRATION FUNCTIONS ==========

  /**
   * Generate OAuth Token from Kotak Bank
   */
  const generateToken = async () => {
    try {
      const clientId = import.meta.env.VITE_KOTAK_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_KOTAK_CLIENT_SECRET;
      const grantType = import.meta.env.VITE_KOTAK_GRANT_TYPE;

      const tokenUrl = `${import.meta.env.VITE_KOTAK_API_URL}/auth/oauth/v2/token`;

      if (!clientId || !clientSecret || !tokenUrl) {
        throw new Error('Kotak Bank credentials not configured in .env');
      }

      const formData = new URLSearchParams();
      formData.append('grant_type', grantType);
      formData.append('client_id', clientId);
      formData.append('client_secret', clientSecret);

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.access_token) {
        throw new Error(data.error_description || 'Failed to generate token');
      }

      return {
        success: true,
        access_token: data.access_token,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in || 1800
      };
    } catch (error) {
      console.error('Token generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const formatDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}${month}${year}${hours}${minutes}${seconds}`;
  };

  const mapAccountType = (accountType) => {
    const typeMap = {
      'SAVINGS': 'SAVINGS',
      'SAVING': 'SAVINGS',
      'CURRENT': 'CURRENT',
      'CURRENT_ACCOUNT': 'CURRENT',
      'CC': 'CURRENT',
      'OD': 'OD',
      'OVERDRAFT': 'OD',
      'NRE': 'NRE',
      'NRO': 'NRO'
    };
    return typeMap[accountType?.toUpperCase()] || 'SAVINGS';
  };

  /**
   * Call Kotak Bank API with OAuth token
   */
  const callKotakBankAPI = async (record, accessToken) => {
    const dateTime = formatDateTime();
    
    const requestPayload = {
      messageCode: "6210",
      merchantId: import.meta.env.VITE_KOTAK_MERCHANT_ID,
      dateTime: dateTime,
      requestId: import.meta.env.VITE_KOTAK_REQUEST_ID,
      requestType: import.meta.env.VITE_KOTAK_REQUEST_TYPE,
      beneficiaryfsc: record.IFSC_Code || "",
      beneficiaryAccntNumber: record.Account_Number || "",
      remarks: "BANK ACCOUNT VERIFICATION",
      beneficiaryAccountType: mapAccountType(record.Account_Type),
      remitterName: "Sadhana",
      remitterMobileNumber: "919899178017",
      remitterAccountNumber: "09582650000173",
      remitterMmid: "9485533",
      filler1: "",
      filler2: "",
      filler3: "",
      Checksum: "2147483647"
    };
    
    try {
      console.log(`Calling Kotak Bank API for: ${record.Account_Number}`);
      console.log('Request:', requestPayload);
      
      const response = await fetch(`${import.meta.env.VITE_KOTAK_API_URL}/Name_Enquiry_API?SrcAppCd=UATBCREMIT`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });
      
      const responseData = await response.json();
      
      console.log('Kotak Bank Response:', responseData);
      
      return {
        apiCallSuccess: response.ok,
        record: record,
        requestPayload: requestPayload,
        responseData: responseData,
        httpStatus: response.status,
        httpStatusText: response.statusText
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        apiCallSuccess: false,
        record: record,
        requestPayload: requestPayload,
        responseData: null,
        error: error.message,
        httpStatus: null,
        httpStatusText: null
      };
    }
  };

  /**
   * Update status in I3EMS system
   */
  const updateSystemVerificationStatus = async (slId, status) => {
    try {
      const requestBody = {
        records: [{
          SL_Id: slId,
          Is_Bank_Verified: status
        }]
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sub-ledgers/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update verification status');
      }
      
      return true;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  };

  /**
   * Display API response to user
   */
  const showApiResponseDialog = async (apiResult, isBulk = false) => {
    const { apiCallSuccess, record, requestPayload, responseData, error, httpStatus, httpStatusText } = apiResult;
    
    let responseHtml = `
      <div class="text-left">
        <!-- Status Section -->
        <div class="mb-4 p-3 ${apiCallSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded-lg border">
          <p class="font-semibold ${apiCallSuccess ? 'text-green-700' : 'text-red-700'} mb-2">
            ${apiCallSuccess ? '✓ API Call Successful' : '✗ API Call Failed'}
          </p>
          ${httpStatus ? `<p class="text-sm text-gray-600">HTTP Status: ${httpStatus} - ${httpStatusText}</p>` : ''}
          ${error ? `<p class="text-sm text-red-600 mt-1">Error: ${error}</p>` : ''}
        </div>
        
        <!-- Account Details -->
        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <p class="font-semibold text-gray-700 mb-2">Account Details:</p>
          <p><strong>Account Holder:</strong> ${record.Account_Holder_Name || 'N/A'}</p>
          <p><strong>Account Number:</strong> ${record.Account_Number || 'N/A'}</p>
          <p><strong>IFSC Code:</strong> ${record.IFSC_Code || 'N/A'}</p>
          <p><strong>Bank Name:</strong> ${record.Bank_Name || 'N/A'}</p>
        </div>
    `;
    
    // Show Request Payload
    responseHtml += `
      <details class="mb-3">
        <summary class="cursor-pointer text-blue-600 font-medium">📤 View Request Payload (Sent to Kotak Bank)</summary>
        <pre class="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto max-h-96">${JSON.stringify(requestPayload, null, 2)}</pre>
      </details>
    `;
    
    // Show Response Data
    if (responseData) {
      responseHtml += `
        <details class="mb-3" open>
          <summary class="cursor-pointer text-blue-600 font-medium">📥 View Response Data (Received from Kotak Bank)</summary>
          <div class="mt-2 p-3 bg-blue-50 rounded">
            <p class="text-sm text-gray-600 mb-2">Complete API Response:</p>
            <pre class="p-3 bg-white rounded text-xs overflow-x-auto max-h-96">${JSON.stringify(responseData, null, 2)}</pre>
          </div>
        </details>
      `;
    }
    
    if (!apiCallSuccess && !responseData) {
      responseHtml += `
        <div class="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
          <p class="text-xs text-yellow-700">
            <strong>Note:</strong> The API call failed. Please check:<br/>
            - Network connectivity<br/>
            - API endpoint URL<br/>
            - Authorization token<br/>
            - CORS settings (if calling from browser)
          </p>
        </div>
      `;
    }
    
    responseHtml += `</div>`;
    
    await Swal.fire({
      title: apiCallSuccess ? 'Kotak Bank API Response' : 'API Call Failed',
      html: responseHtml,
      icon: apiCallSuccess ? 'info' : 'error',
      confirmButtonText: 'Close',
      confirmButtonColor: apiCallSuccess ? '#10b981' : '#dc2626',
      width: '900px'
    });
  };

  /**
   * BULK VERIFY - Generate token and call Kotak Bank API for multiple records
   */
  const handleBulkVerify = async () => {
    if (selectedRecords.length == 0) {
      toast.error("Please select at least one record to verify");
      return;
    }

    const recordsToVerify = bankRecords.filter(record => 
      selectedRecords.includes(record.SL_Id)
    );

    // Confirm with user
    const confirmResult = await Swal.fire({
      title: 'Bulk Bank Account Verification',
      html: `
        <div class="text-left">
          <p class="mb-3">You are about to verify <strong>${recordsToVerify.length}</strong> bank account(s) with Kotak Bank API:</p>
          <div class="bg-gray-50 p-3 rounded-lg mb-3 max-h-60 overflow-y-auto">
            ${recordsToVerify.map(record => `
              <div class="mb-3 pb-3 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                <p class="font-semibold text-gray-900">${record.Account_Holder_Name || 'N/A'}</p>
                <p class="text-sm text-gray-600 mt-1">Account: ${record.Account_Number || 'N/A'} | IFSC: ${record.IFSC_Code || 'N/A'}</p>
                <p class="text-xs text-gray-500 mt-1">Account Type: ${record.Account_Type || 'N/A'}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `,     
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Call API',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (!confirmResult.isConfirmed) return;

    setBulkVerifying(true);
    const verifyingSet = new Set();
    recordsToVerify.forEach(record => verifyingSet.add(record.SL_Id));
    setVerifyingRecords(verifyingSet);
    
    toast.loading('Generating OAuth token...', { id: 'bulk-verify' });

    try {
      // First, generate the OAuth token
      const tokenResult = await generateToken();
      
      if (!tokenResult.success) {
        toast.dismiss('bulk-verify');
        toast.error(`Token generation failed: ${tokenResult.error}`);
        setBulkVerifying(false);
        setVerifyingRecords(new Set());
        return;
      }

      toast.loading(`Calling Kotak Bank API for ${recordsToVerify.length} account(s)...`, { id: 'bulk-verify' });

      // Call API for all records with the token
      const apiPromises = recordsToVerify.map(record => 
        callKotakBankAPI(record, tokenResult.access_token)
      );
      const results = await Promise.all(apiPromises);
      
      toast.dismiss('bulk-verify');
      
      // Show results summary
      const successCount = results.filter(r => r.apiCallSuccess == true).length;
      const failCount = results.filter(r => r.apiCallSuccess == false).length;
      
      // Show results dialog
      let resultsHtml = `
        <div class="text-left">
          <div class="sticky top-0 bg-white pb-3 mb-3 border-b">
            <div class="flex gap-3 mb-3">
              <div class="flex-1 p-2 bg-green-50 rounded-lg text-center">
                <p class="text-2xl font-bold text-green-600">${successCount}</p>
                <p class="text-sm text-green-700">Successful</p>
              </div>
              <div class="flex-1 p-2 bg-red-50 rounded-lg text-center">
                <p class="text-2xl font-bold text-red-600">${failCount}</p>
                <p class="text-sm text-red-700">Failed</p>
              </div>
            </div>
            <p class="text-xs text-gray-500">Token generated successfully</p>
          </div>
      `;
      
      results.forEach((result, index) => {
        const { apiCallSuccess, record, responseData, error } = result;
        resultsHtml += `
          <details class="mb-2 border ${apiCallSuccess ? 'border-green-200' : 'border-red-200'} rounded-lg p-2">
            <summary class="cursor-pointer font-medium ${apiCallSuccess ? 'text-green-700' : 'text-red-700'}">
              ${apiCallSuccess ? '✓' : '✗'} ${record.Account_Holder_Name || 'N/A'} - ${record.Account_Number}
            </summary>
            <div class="mt-2 pl-4">
              <p><strong>Account:</strong> ${record.Account_Number}</p>
              <p><strong>IFSC:</strong> ${record.IFSC_Code}</p>
              ${error ? `<p class="text-red-600"><strong>Error:</strong> ${error}</p>` : ''}
              ${responseData ? `
                <details class="mt-2">
                  <summary class="text-xs text-blue-600 cursor-pointer">View API Response</summary>
                  <pre class="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">${JSON.stringify(responseData, null, 2)}</pre>
                </details>
              ` : ''}
            </div>
          </details>
        `;
      });
      
      resultsHtml += `</div>`;
      
      await Swal.fire({
        title: 'Kotak Bank API Results',
        html: resultsHtml,
        icon: successCount > 0 ? 'success' : 'error',
        confirmButtonText: 'Close',
        width: '800px'
      });
      
      // Ask if user wants to update system
      if (successCount > 0) {
        const updateResult = await Swal.fire({
          title: 'Update System Status?',
          text: `${successCount} API call(s) were successful. Do you want to mark these accounts as VERIFIED in the I3EMS system?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Yes, Update System',
          cancelButtonText: 'No'
        });
        
        if (updateResult.isConfirmed) {
          const successfulResults = results.filter(r => r.apiCallSuccess == true);
          let updatedCount = 0;
          
          for (const result of successfulResults) {
            try {
              await updateSystemVerificationStatus(result.record.SL_Id, 'Y');
              updatedCount++;
            } catch (error) {
              console.error('Update failed:', error);
            }
          }
          
          toast.success(`${updatedCount} account(s) marked as verified!`);
          await loadBankRecords();
          setSelectedRecords([]);
        }
      }
      
    } catch (error) {
      console.error('Bulk verification error:', error);
      toast.dismiss('bulk-verify');
      toast.error('Verification failed: ' + error.message);
    } finally {
      setBulkVerifying(false);
      setVerifyingRecords(new Set());
    }
  };

  /**
   * SINGLE VERIFY - Generate token and call Kotak Bank API for single record
   */
  const handleSingleVerify = async (record) => {
    setVerifyingRecords(prev => new Set(prev).add(record.SL_Id));
    
    try {
      // Confirm with user
      const confirmResult = await Swal.fire({
        title: 'Verify Bank Account?',
        html: `
          <div class="text-left">
            <p>Call Kotak Bank API for:</p>
            <div class="bg-gray-50 p-3 rounded-lg mt-2">
              <p><strong>Account Holder:</strong> ${record.Account_Holder_Name || 'N/A'}</p>
              <p><strong>Account Number:</strong> ${record.Account_Number || 'N/A'}</p>
              <p><strong>IFSC Code:</strong> ${record.IFSC_Code || 'N/A'}</p>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Call API',
        cancelButtonText: 'Cancel'
      });
      
      if (!confirmResult.isConfirmed) {
        setVerifyingRecords(prev => {
          const newSet = new Set(prev);
          newSet.delete(record.SL_Id);
          return newSet;
        });
        return;
      }
      
      toast.loading('Generating OAuth token...', { id: 'single-verify' });
      
      // Generate OAuth token
      const tokenResult = await generateToken();
      
      if (!tokenResult.success) {
        toast.dismiss('single-verify');
        toast.error(`Token generation failed: ${tokenResult.error}`);
        setVerifyingRecords(prev => {
          const newSet = new Set(prev);
          newSet.delete(record.SL_Id);
          return newSet;
        });
        return;
      }
      
      toast.loading('Calling Kotak Bank API...', { id: 'single-verify' });
      
      // Call the API with the token
      const apiResult = await callKotakBankAPI(record, tokenResult.access_token);
      
      toast.dismiss('single-verify');
      
      // Show the response dialog
      await showApiResponseDialog(apiResult, false);
      
      // If API call was successful, ask about updating system
      if (apiResult.apiCallSuccess) {
        const updateSystem = await Swal.fire({
          title: 'API Call Successful',
          text: 'The Kotak Bank API call was successful. Do you want to mark this account as VERIFIED in the I3EMS system?',
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Yes, Mark as Verified',
          cancelButtonText: 'No'
        });
        
        if (updateSystem.isConfirmed) {
          await updateSystemVerificationStatus(record.SL_Id, 'Y');
          toast.success('Account marked as verified!');
          await loadBankRecords();
        }
      } else {
        // API failed, ask about marking as rejected
        const markRejected = await Swal.fire({
          title: 'API Call Failed',
          text: `The API call failed. Do you want to mark this account as REJECTED in the I3EMS system?\n\nError: ${apiResult.error || 'Unknown error'}`,
          icon: 'error',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Yes, Mark as Rejected',
          cancelButtonText: 'No'
        });
        
        if (markRejected.isConfirmed) {
          await updateSystemVerificationStatus(record.SL_Id, 'R');
          toast.warning('Account marked as rejected!');
          await loadBankRecords();
        }
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      toast.dismiss('single-verify');
      toast.error('Verification failed: ' + error.message);
    } finally {
      setVerifyingRecords(prev => {
        const newSet = new Set(prev);
        newSet.delete(record.SL_Id);
        return newSet;
      });
    }
  };

  // Select/Deselect all records
  const handleSelectAll = () => {
    if (selectedRecords.length == bankRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(bankRecords.map((record) => record.SL_Id));
    }
  };

  // Select/Deselect single record
  const handleSelectRecord = (slId) => {
    if (selectedRecords.includes(slId)) {
      setSelectedRecords(selectedRecords.filter((id) => id != slId));
    } else {
      setSelectedRecords([...selectedRecords, slId]);
    }
  };

  const hasActiveFilters = searchTerm;

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.last_page,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Verify bank accounts with Kotak Bank API
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-4 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => handleFilterChange("N")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                filterStatus == "N"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                Pending Verification
              </span>
            </button>
            <button
              onClick={() => handleFilterChange("Y")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                filterStatus == "Y"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Verified
              </span>
            </button>
         
            <button
              onClick={() => handleFilterChange("R")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                filterStatus == "R"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Rejected
              </span>
            </button>
            <button
              onClick={() => handleFilterChange("I")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                filterStatus == "I"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Incomplete Information
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by bank name, account holder, account number..."
                className="w-full pl-10 pr-24 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}

            <button
              onClick={loadBankRecords}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Action for Pending Verification */}
        {filterStatus == "N" && selectedRecords.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedRecords.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-amber-800">
                  {selectedRecords.length} record(s) selected
                </span>
                <p className="text-xs text-amber-600">
                  Choose action for selected records
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <button
                onClick={() => setSelectedRecords([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              
              {/* MAIN VERIFY BUTTON - Calls Kotak Bank API with OAuth */}
              <button
                onClick={handleBulkVerify}
                disabled={bulkVerifying}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Verify with Bank ({selectedRecords.length})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bank Records Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {filterStatus == "N" && (
                  <th className="w-12 px-4 py-4">
                    <div className="flex items-center">
                      <button
                        onClick={handleSelectAll}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        disabled={bulkVerifying}
                      >
                        {selectedRecords.length == bankRecords.length &&
                        bankRecords.length > 0 ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sr No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Account Holder Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Landmark className="h-4 w-4 mr-1" />
                    Bank Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Account Number
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  IFSC Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Account Type
                </th>                
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={filterStatus == "N" ? 8 : 7}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading records...</p>
                    </div>
                   </td>
                </tr>
              ) : bankRecords.length > 0 ? (
                bankRecords.map((record, index) => (
                  <tr
                    key={record.SL_Id}
                    className={`hover:bg-gray-50 transition-colors duration-150 group ${
                      selectedRecords.includes(record.SL_Id)
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    {filterStatus == "N" && (
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={selectedRecords.includes(record.SL_Id)}
                            onChange={() => handleSelectRecord(record.SL_Id)}
                            disabled={bulkVerifying || verifyingRecords.has(record.SL_Id)}
                          />
                        </div>
                       </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </div>
                     </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.Account_Holder_Name || "N/A"}
                      </div>
                     </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <Landmark className="h-4 w-4 text-white" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm text-gray-900">
                            {record.Bank_Name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.SL_Name || "Unknown"}
                          </div>
                        </div>
                      </div>
                     </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-900">
                        {record.Account_Number
                          ? `****${record.Account_Number.slice(-4)}`
                          : "N/A"}
                      </div>
                     </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono uppercase text-gray-900">
                        {record.IFSC_Code || "N/A"}
                      </div>
                     </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {record.Account_Type || "N/A"}
                      </span>
                     </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            navigate(
                              `/masters/financial-accounting/bank-account-authentication/view/${record.SL_Id}`
                            );
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        
                        {filterStatus == "N" && (
                          <button
                            onClick={() => handleSingleVerify(record)}
                            disabled={bulkVerifying || verifyingRecords.has(record.SL_Id)}
                            className={`text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1 transition-colors ${
                              (bulkVerifying || verifyingRecords.has(record.SL_Id)) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {verifyingRecords.has(record.SL_Id) ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Verify
                              </>
                            )}
                          </button>
                        )}
                      </div>
                     </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={filterStatus == "N" ? 8 : 7}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Layers className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching records found"
                          : filterStatus == "N"
                          ? "No pending verification records available"
                          : filterStatus == "Y"
                          ? "No verified bank records available"
                          : filterStatus == "R"
                          ? "No rejected records available"
                          : filterStatus == "I"
                          ? "No complete info records available"
                          : "No bank account details have been added yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : filterStatus == "N"
                          ? "All records are either verified or rejected"
                          : filterStatus == "Y"
                          ? "No records have been verified yet"
                          : filterStatus == "R"
                          ? "No records have been rejected yet"
                          : filterStatus == "I"
                          ? "No records with complete information available"
                          : "Add bank details to sub-ledgers to see them here"}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="inline-flex items-center px-5 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-200"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </button>
                      )}
                    </div>
                    </td>
                </tr>
              )}
            </tbody>
           </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {bankRecords.length} of {pagination.total} entries
              {hasActiveFilters && " (filtered)"}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage == page
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(pagination.last_page, prev + 1)
                )
              }
              disabled={currentPage == pagination.last_page}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAuthList;