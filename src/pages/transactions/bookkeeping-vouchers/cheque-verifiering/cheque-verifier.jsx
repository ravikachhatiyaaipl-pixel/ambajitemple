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
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  IndianRupee,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import debounce from "lodash/debounce";

const ChequeVerifierList = ({ user }) => {
  const [chequeData, setChequeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pageTitle, setPageTitle] = useState("Cheque Verifier");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [selectedCheque, setSelectedCheque] = useState(null);
  const [queryReason, setQueryReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "bookkeeping-vouchers/cheque-verifiering/cheque-verifier";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchDebounced(value);
      setCurrentPage(1);
    }, 500),
    [],
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setCurrentPage(1);
  };

  // Load cheque data
  const loadChequeData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const response = await axios.get(
        `${API_URL}/new-chl-voucher/payment-mode?Py_Mode=Cheque&Is_Cheque_Verf=N`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data.success && response.data.data) {
        const flattenedData = [];

        response.data.data.forEach((paymentModeObj) => {
          if (
            paymentModeObj.challans &&
            Array.isArray(paymentModeObj.challans)
          ) {
            paymentModeObj.challans.forEach((voucher) => {
              if (
                voucher.details &&
                Array.isArray(voucher.details) &&
                voucher.details.length > 0
              ) {
                voucher.details.forEach((detail) => {
                  flattenedData.push({
                    CV_Id: detail.CV_Id,
                    CV_Sr: detail.CV_Sr,
                    SL_Nm: detail.SL_Nm,
                    Amount: detail.Amount,
                    Payment_Mode: detail.Payment_Mode,
                    Remarks: detail.Remarks,
                    Chq_No: detail.Chq_No,
                    Bank_Name: detail.Bank_Name,
                    Is_Cheque_Verf: detail.Is_Cheque_Verf,
                    Cheque_Cnl_Remark: detail.Cheque_Cnl_Remark,
                    Chq_Status: detail.Chq_Status,
                    voucher_no: voucher.CV_No,
                    voucher_id: voucher.CV_Id,
                    ch_date: voucher.Ch_Date,
                    total_amount: voucher.Total_Amount,
                    net_amount: voucher.Net_Amount,
                    status: voucher.Status,
                    department: voucher.department,
                  });
                });
              }
            });
          }
        });

        setChequeData(flattenedData);

        setPagination({
          current_page: 1,
          last_page: Math.max(
            1,
            Math.ceil(flattenedData.length / itemsPerPage),
          ),
          per_page: itemsPerPage,
          total: flattenedData.length,
          from: flattenedData.length == 0 ? 0 : 1,
          to: Math.min(itemsPerPage, flattenedData.length),
        });
        setSelectedItems([]);

        if (flattenedData.length == 0) {
          toast.info("No pending cheques found for verification");
        }
      } else {
        toast.error(response.data.message || "Failed to load cheque data");
        setChequeData([]);
      }
    } catch (error) {
      console.error("Error loading cheque data:", error);
      toast.error(
        error.response?.data?.message || "Failed to load cheque data",
      );
      setChequeData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChequeData();
  }, []);

  // Filter data based on search
  const getFilteredData = () => {
    if (!searchDebounced) return chequeData;
    return chequeData.filter(
      (item) =>
        (item.voucher_no &&
          item.voucher_no
            .toLowerCase()
            .includes(searchDebounced.toLowerCase())) ||
        (item.SL_Nm &&
          item.SL_Nm.toLowerCase().includes(searchDebounced.toLowerCase())) ||
        (item.Chq_No &&
          item.Chq_No.toLowerCase().includes(searchDebounced.toLowerCase())),
    );
  };

  const filteredData = getFilteredData();
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Update pagination when filtered data changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      last_page: Math.max(1, Math.ceil(filteredData.length / itemsPerPage)),
      total: filteredData.length,
      from: filteredData.length == 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
      to: Math.min(currentPage * itemsPerPage, filteredData.length),
    }));
  }, [filteredData.length, currentPage, itemsPerPage]);

  // Handle Verify action
  const handleVerify = async (chequeItem) => {
    const result = await Swal.fire({
      title: "Verify Cheque?",
      text: `Are you sure you want to verify this cheque? Cheque No: ${chequeItem.Chq_No || "N/A"}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Verify!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setSubmitting(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "";
        const response = await axios.put(
          `${API_URL}/new-chl-voucher/${chequeItem.CV_Id}`,
          {
            Is_Cheque_Verf: "Y",
          },
            {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
        );

        if (response.data.success) {
          toast.success(
            `Cheque ${chequeItem.Chq_No || ""} verified successfully!`,
          );
          await loadChequeData();
        } else {
          toast.error(response.data.message || "Failed to verify cheque");
        }
      } catch (error) {
        console.error("Verify error:", error);
        toast.error(error.response?.data?.message || "Failed to verify cheque");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Handle Query action - Open modal
  const handleOpenQueryModal = (chequeItem) => {
    setSelectedCheque(chequeItem);
    setQueryReason("");
    setIsQueryModalOpen(true);
  };

  // Handle Query submit
  const handleSubmitQuery = async () => {
    if (!queryReason.trim()) {
      toast.error("Please enter a reason for the query");
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const response = await axios.put(
        `${API_URL}/new-chl-voucher/${selectedCheque.CV_Id}`,
        {
          Is_Cheque_Verf: "N",
          Cheque_Cnl_Remark: queryReason,
        },
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data.success) {
        toast.success(`Query raised for cheque ${selectedCheque.Chq_No || ""}`);
        setIsQueryModalOpen(false);
        setSelectedCheque(null);
        setQueryReason("");
        await loadChequeData();
      } else {
        toast.error(response.data.message || "Failed to raise query");
      }
    } catch (error) {
      console.error("Query error:", error);
      toast.error(error.response?.data?.message || "Failed to raise query");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle bulk verify
  const handleBulkVerify = async () => {
    if (selectedItems.length == 0) {
      toast.error("No cheques selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Verify?",
      text: `Are you sure you want to verify ${selectedItems.length} selected cheque(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Verify All!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setSubmitting(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "";
        const verifyPromises = selectedItems.map((item) =>
          axios.put(`${API_URL}/new-chl-voucher/${item.CV_Id}`, {
            Is_Cheque_Verf: "Y",
          },  {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }),
        );
        const results = await Promise.all(verifyPromises);
        const allSuccess = results.every((res) => res.data.success);

        if (allSuccess) {
          toast.success(
            `${selectedItems.length} cheque(s) verified successfully!`,
          );
          await loadChequeData();
          setSelectedItems([]);
        } else {
          toast.error("Some cheques could not be verified");
        }
      } catch (error) {
        console.error("Bulk verify error:", error);
        toast.error("Failed to verify some cheques");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Handle bulk query
  const handleBulkQuery = async () => {
    if (selectedItems.length == 0) {
      toast.error("No cheques selected");
      return;
    }

    const { value: reason } = await Swal.fire({
      title: "Bulk Query",
      text: `Enter reason for querying ${selectedItems.length} selected cheque(s):`,
      input: "textarea",
      inputPlaceholder: "Enter reason here...",
      inputAttributes: {
        "aria-label": "Query reason",
      },
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Submit Query",
      cancelButtonText: "Cancel",
    });

    if (reason && reason.trim()) {
      setSubmitting(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "";
        const queryPromises = selectedItems.map((item) =>
          axios.put(`${API_URL}/new-chl-voucher/${item.CV_Id}`, {
            Is_Cheque_Verf: "N",
            Cheque_Cnl_Remark: reason,
          },
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }),
        );
        const results = await Promise.all(queryPromises);
        const allSuccess = results.every((res) => res.data.success);

        if (allSuccess) {
          toast.success(`Query raised for ${selectedItems.length} cheque(s)!`);
          await loadChequeData();
          setSelectedItems([]);
        } else {
          toast.error("Some queries could not be raised");
        }
      } catch (error) {
        console.error("Bulk query error:", error);
        toast.error("Failed to raise queries for some cheques");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  // Select all on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems([...paginatedData]);
    } else {
      setSelectedItems([]);
    }
  };

  // Check if item is selected
  const isSelected = (item) => {
    return selectedItems.some(
      (selected) =>
        selected.CV_Id == item.CV_Id && selected.CV_Sr == item.CV_Sr,
    );
  };

  // Toggle selection
  const toggleSelection = (item) => {
    if (isSelected(item)) {
      setSelectedItems(
        selectedItems.filter(
          (selected) =>
            !(selected.CV_Id == item.CV_Id && selected.CV_Sr == item.CV_Sr),
        ),
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(parseFloat(amount) || 0);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const lastPage = pagination.last_page;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const hasActiveFilters = searchTerm;

  // Stats
  const stats = {
    totalCheques: filteredData.length,
    pendingVerification: filteredData.filter((c) => c.Is_Cheque_Verf == "N")
      .length,
    totalAmount: filteredData.reduce(
      (sum, c) => sum + (parseFloat(c.Amount) || 0),
      0,
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Verify and manage cheque payments
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cheques</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCheques}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingVerification}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by voucher no., party name, or cheque no..."
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 flex items-center transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={loadChequeData}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {selectedItems.length}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-800">
                    {selectedItems.length} cheque(s) selected
                  </span>
                  <p className="text-xs text-blue-600">
                    Choose an action for selected cheques
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={handleBulkVerify}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Selected ({selectedItems.length})
                </button>
                <button
                  type="button"
                  onClick={handleBulkQuery}
                  disabled={submitting}
                  className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Query Selected ({selectedItems.length})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={
                        paginatedData.length > 0 &&
                        selectedItems.length == paginatedData.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cheque Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading cheques...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((cheque) => (
                    <tr
                      key={`${cheque.CV_Id}-${cheque.CV_Sr}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={isSelected(cheque)}
                          onChange={() => toggleSelection(cheque)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {cheque.voucher_no || "N/A"}
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(cheque.ch_date)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {cheque.SL_Nm || "N/A"}
                        </div>
                        {cheque.department && cheque.department.Dpt_Name && (
                          <div className="flex items-center mt-1">
                            <Building2 className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {cheque.department.Dpt_Name}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {cheque.Chq_No || "No Cheque No"}
                            </span>
                          </div>
                          {cheque.Remarks && (
                            <div className="flex items-start mt-1">
                              <MessageSquare className="h-3 w-3 text-gray-400 mr-1 mt-0.5" />
                              <span className="text-xs text-gray-500">
                                {cheque.Remarks}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(cheque.Amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleVerify(cheque)}
                            disabled={submitting}
                            className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleOpenQueryModal(cheque)}
                            disabled={submitting}
                            className="px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg transition-colors text-sm font-medium"
                          >
                            Query
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {searchTerm
                            ? "No cheques found"
                            : "No pending cheques"}
                        </h3>
                        <p className="text-gray-600 max-w-md">
                          {searchTerm
                            ? "No cheques match your search criteria. Try adjusting your search term."
                            : "All cheques have been verified. No pending cheques for verification."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && paginatedData.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-700">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              entries
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage == 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              {renderPagination().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage == page
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage == pagination.last_page}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Query Modal - Simple and Clean */}
        {isQueryModalOpen && selectedCheque && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setIsQueryModalOpen(false)}
              ></div>

              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Raise Query
                  </h3>
                  <button
                    onClick={() => setIsQueryModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Voucher No:</span>
                      <span className="font-medium text-gray-900">
                        {selectedCheque.voucher_no}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Party Name:</span>
                      <span className="font-medium text-gray-900">
                        {selectedCheque.SL_Nm || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cheque No:</span>
                      <span className="font-medium text-gray-900">
                        {selectedCheque.Chq_No || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(selectedCheque.Amount)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Query <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Please provide reason for raising this query..."
                      value={queryReason}
                      onChange={(e) => setQueryReason(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setIsQueryModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuery}
                    disabled={submitting || !queryReason.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Query"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChequeVerifierList;
