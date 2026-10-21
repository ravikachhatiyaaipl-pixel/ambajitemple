// list.jsx
/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
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
  Building2,
  Calendar,
  AlertCircle,
  Send,
  Clock,
  Check,
  Ban,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BankTransactionApi } from "../../../services/banktransactionapi";
import debounce from "lodash/debounce";

const BankTransactionList = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("initial"); // initial, pending, success, fail
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
  const [pageTitle, setPageTitle] = useState("Bank Transactions");
  const navigate = useNavigate();

  // Get page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]"
      );

      const currentPath = "/transactions/bookkeeping-vouchers/bank-transactions";

      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links ==  currentPath
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

  // Handle filter change
  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
    setSelectedRecords([]);
  };

  // Load records when dependencies change
  useEffect(() => {
    loadTransactions();
  }, [currentPage, searchDebounced, filterStatus]);

  // Load transactions
  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Using getAllUnpaginated to get all records
      const result = await BankTransactionApi.getAllUnpaginated();

      if (result.success && result.data) {
        let filteredData = result.data;
        
        // Apply status filter
        if (filterStatus) {
          filteredData = filteredData.filter(
            (transaction) => transaction.Status ==  filterStatus
          );
        }
        
        // Apply search filter
        if (searchDebounced) {
          const searchLower = searchDebounced.toLowerCase();
          filteredData = filteredData.filter(
            (transaction) =>
              transaction.From_Bank_Name?.toLowerCase().includes(searchLower) ||
              transaction.To_Bank_Name?.toLowerCase().includes(searchLower) ||
              transaction.From_Bank_Acc?.toLowerCase().includes(searchLower) ||
              transaction.To_Bank_Acc?.toLowerCase().includes(searchLower) ||
              transaction.From_IFSC?.toLowerCase().includes(searchLower) ||
              transaction.To_IFSC?.toLowerCase().includes(searchLower) ||
              transaction.Trans_Id?.toLowerCase().includes(searchLower) ||
              transaction.challan_voucher?.CV_No?.toLowerCase().includes(searchLower)
          );
        }
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setTransactions(paginatedData);
        setPagination({
          current_page: currentPage,
          last_page: Math.ceil(filteredData.length / itemsPerPage),
          per_page: itemsPerPage,
          total: filteredData.length,
          from: startIndex + 1,
          to: Math.min(endIndex, filteredData.length),
        });
        setSelectedRecords([]);
      } else {
        toast.error(result.message || "Failed to load bank transactions");
        setTransactions([]);
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
      console.error("Error loading transactions:", error);
      toast.error("Failed to load bank transactions");
      setTransactions([]);
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

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setFilterStatus("initial");
    setCurrentPage(1);
  };

  // Bulk update payment status to success
  const handleBulkUpdateToSuccess = async () => {
    if (selectedRecords.length ==  0) {
      toast.error("No records selected");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Payment Success?",
      text: `Are you sure you want to mark ${selectedRecords.length} selected transaction(s) as SUCCESS?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, confirm!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        // Update each selected transaction
        const updatePromises = selectedRecords.map(id => 
          BankTransactionApi.update(id, { Status: "success" })
        );
        
        await Promise.all(updatePromises);
        
        await loadTransactions();
        setSelectedRecords([]);
        toast.success(
          `${selectedRecords.length} transaction(s) marked as Success!`
        );
      } catch (error) {
        toast.error(error.message || "Failed to update payment status");
      }
    }
  };

  // Bulk update payment status to failed
  const handleBulkUpdateToFailed = async () => {
    if (selectedRecords.length ==  0) {
      toast.error("No records selected");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Payment Failed?",
      text: `Are you sure you want to mark ${selectedRecords.length} selected transaction(s) as FAILED?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, mark as failed!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        // Update each selected transaction
        const updatePromises = selectedRecords.map(id => 
          BankTransactionApi.update(id, { Status: "fail" })
        );
        
        await Promise.all(updatePromises);
        
        await loadTransactions();
        setSelectedRecords([]);
        toast.success(
          `${selectedRecords.length} transaction(s) marked as Failed!`
        );
      } catch (error) {
        toast.error(error.message || "Failed to update payment status");
      }
    }
  };

  // Select/Deselect all records
  const handleSelectAll = () => {
    if (selectedRecords.length ==  transactions.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(transactions.map((record) => record.BTD_Id));
    }
  };

  // Select/Deselect single record
  const handleSelectRecord = (btdId) => {
    if (selectedRecords.includes(btdId)) {
      setSelectedRecords(selectedRecords.filter((id) => id !=  btdId));
    } else {
      setSelectedRecords([...selectedRecords, btdId]);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || filterStatus !=  "initial";

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: "Success",
          className: "bg-green-100 text-green-800",
        };
      case "pending":
        return {
          icon: <Clock className="h-3 w-3 mr-1" />,
          text: "Pending",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "fail":
        return {
          icon: <XCircle className="h-3 w-3 mr-1" />,
          text: "Failed",
          className: "bg-red-100 text-red-800",
        };
      case "initial":
      default:
        return {
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: "Ready to Payment",
          className: "bg-blue-100 text-blue-800",
        };
    }
  };

  // Render pagination
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
              Manage and track bank transactions
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-4" aria-label="Tabs">
            <button
              onClick={() => handleFilterChange("initial")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                filterStatus ==  "initial"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Ready to Payment
              </span>
            </button>
            <button
              onClick={() => handleFilterChange("pending")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                filterStatus ==  "pending"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </span>
            </button>
            <button
              onClick={() => handleFilterChange("success")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                filterStatus ==  "success"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Success
              </span>
            </button>
            <button
              onClick={() => handleFilterChange("fail")}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                filterStatus ==  "fail"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                Failed
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
                placeholder="Search by bank name, account number, IFSC, transaction ID..."
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
              onClick={loadTransactions}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Action for Ready to Payment Tab */}
        {filterStatus ==  "initial" && selectedRecords.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedRecords.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedRecords.length} transaction(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose action for selected transactions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedRecords([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkUpdateToSuccess}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Payment ({selectedRecords.length})
              </button>
              <button
                onClick={handleBulkUpdateToFailed}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Failed ({selectedRecords.length})
              </button>
            </div>
          </div>
        )}

        {/* Bulk Action for Pending Tab */}
        {filterStatus ==  "pending" && selectedRecords.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedRecords.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-yellow-800">
                  {selectedRecords.length} transaction(s) selected
                </span>
                <p className="text-xs text-yellow-600">
                  Update status for selected transactions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedRecords([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkUpdateToSuccess}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Success ({selectedRecords.length})
              </button>
              <button
                onClick={handleBulkUpdateToFailed}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Failed ({selectedRecords.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {/* Checkbox column - only show for initial and pending tabs */}
                {(filterStatus ==  "initial" || filterStatus ==  "pending") && (
                  <th className="w-12 px-4 py-4">
                    <div className="flex items-center">
                      <button
                        onClick={handleSelectAll}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        {selectedRecords.length ==  transactions.length &&
                        transactions.length > 0 ? (
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
                    <Send className="h-4 w-4 mr-1" />
                    From Bank
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    From Account
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Landmark className="h-4 w-4 mr-1" />
                    To Bank
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    To Account
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Transaction ID
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
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
                    colSpan={(filterStatus ==  "initial" || filterStatus ==  "pending") ? 9 : 8}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((transaction, index) => {
                  const statusBadge = getStatusBadge(transaction.Status);
                  return (
                    <tr
                      key={transaction.BTD_Id}
                      className={`hover:bg-gray-50 transition-colors duration-150 group ${
                        selectedRecords.includes(transaction.BTD_Id)
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      {/* Checkbox - only for initial and pending tabs */}
                      {(filterStatus ==  "initial" || filterStatus ==  "pending") && (
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              checked={selectedRecords.includes(transaction.BTD_Id)}
                              onChange={() => handleSelectRecord(transaction.BTD_Id)}
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
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <Send className="h-4 w-4 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {transaction.From_Bank_Name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              IFSC: {transaction.From_IFSC || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900">
                          {transaction.From_Bank_Acc
                            ? `****${transaction.From_Bank_Acc.slice(-4)}`
                            : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.From_Acc_type || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center shadow-sm">
                            <Landmark className="h-4 w-4 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {transaction.To_Bank_Name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              IFSC: {transaction.To_IFSC || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900">
                          {transaction.To_Bank_Acc
                            ? `****${transaction.To_Bank_Acc.slice(-4)}`
                            : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.To_Acc_type || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900">
                          {transaction.Trans_Id || "N/A"}
                        </div>
                        {transaction.challan_voucher?.CV_No && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            CV: {transaction.challan_voucher.CV_No}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}
                        >
                          {statusBadge.icon}
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            navigate(
                              `/transactions/bookkeeping-vouchers/bank-transactions/view/${transaction.BTD_Id}`
                            );
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={(filterStatus ==  "initial" || filterStatus ==  "pending") ? 9 : 8}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Layers className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching transactions found"
                          : filterStatus ==  "initial"
                          ? "No transactions ready for payment"
                          : filterStatus ==  "pending"
                          ? "No pending transactions"
                          : filterStatus ==  "success"
                          ? "No successful transactions"
                          : filterStatus ==  "fail"
                          ? "No failed transactions"
                          : "No bank transactions available"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : filterStatus ==  "initial"
                          ? "Transactions that are ready for payment will appear here"
                          : filterStatus ==  "pending"
                          ? "Transactions that are processing will appear here"
                          : filterStatus ==  "success"
                          ? "Completed transactions will appear here"
                          : filterStatus ==  "fail"
                          ? "Failed transactions will appear here"
                          : "Create bank transactions to see them here"}
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
              Showing {pagination.from} to {pagination.to} of {pagination.total} entries
              {hasActiveFilters && " (filtered)"}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage ==  1}
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
                  currentPage ==  page
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
              disabled={currentPage ==  pagination.last_page}
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

export default BankTransactionList;