import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Hash,
  ChevronLeft,
  ChevronRight,
  XCircle as XCircleIcon,
  CreditCard,
  Banknote,
  MapPin,
  Filter,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BankAccountsApi } from "../../../services/bankaccountsapi";
import debounce from "lodash/debounce";

const BankAccountsList = ({ user }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Bank Account Management");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced filters state
  const [filters, setFilters] = useState({
    account_number: "",
    ifsc: "",
    account_name: "",
    branch_name: "",
    bank_name: "",
    city: "",
    account_type: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({});

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/financial-accounting/bank-accounts";

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

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle advanced filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply advanced filters
  const applyAdvancedFilters = () => {
    const activeFilters = {};

    // Only include non-empty filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].trim() != "") {
        activeFilters[key] = filters[key].trim();
      }
    });

    setAppliedFilters(activeFilters);
    setCurrentPage(1);
    setShowAdvancedFilters(false);
  };

  // Clear advanced filters
  const clearAdvancedFilters = () => {
    setFilters({
      account_number: "",
      ifsc: "",
      account_name: "",
      branch_name: "",
      bank_name: "",
      city: "",
      account_type: "",
    });
    setAppliedFilters({});
    setCurrentPage(1);
  };

  // Clear all filters (search + status + advanced)
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setStatusFilter("");
    clearAdvancedFilters();
    setCurrentPage(1);
  };

  // Load bank accounts when page, search, or filters change
  useEffect(() => {
    loadBankAccounts();
  }, [currentPage, searchDebounced, statusFilter, appliedFilters]);

  const loadBankAccounts = async () => {
    setLoading(true);
    try {
      // Combine all filters
      const allFilters = {
        ...appliedFilters,
        is_active: statusFilter != "" ? statusFilter : undefined,
      };

      const result = await BankAccountsApi.getAll(
        currentPage,
        itemsPerPage,
        searchDebounced,
        allFilters,
      );

      setBankAccounts(result.bankAccounts || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error loading bank accounts:", error);
      toast.error(
        error.response?.data?.message || "Failed to load bank accounts",
      );
      setBankAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId, accountName) => {
    const result = await Swal.fire({
      title: "Delete Bank Account?",
      text: `Are you sure you want to delete "${accountName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      await BankAccountsApi.delete(accountId);
      toast.success(`Bank account "${accountName}" deleted successfully!`);
      await loadBankAccounts();
      setSelectedAccounts((prev) => prev.filter((id) => id != accountId));
    } catch (error) {
      console.error("Error deleting bank account:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete bank account",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAccounts.length == 0) {
      toast.error("No bank accounts selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedAccounts.length} selected bank accounts?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setLoading(true);
      let successCount = 0;
      let failCount = 0;

      try {
        for (const id of selectedAccounts) {
          try {
            await BankAccountsApi.delete(id);
            successCount++;
          } catch (err) {
            console.error(`Failed to delete account ${id}:`, err);
            failCount++;
          }
        }

        await loadBankAccounts();
        setSelectedAccounts([]);

        if (successCount > 0) {
          toast.success(
            `${successCount} bank account(s) deleted successfully!`,
          );
        }
        if (failCount > 0) {
          toast.error(`${failCount} account(s) failed to delete`);
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Failed to delete some bank accounts");
        await loadBankAccounts();
      } finally {
        setLoading(false);
      }
    }
  };

  // Stats calculation
  const stats = {
    totalAccounts: pagination.total,
    activeAccounts: bankAccounts.filter(
      (a) => a.is_active == true || a.is_active == 1,
    ).length,
    inactiveAccounts: bankAccounts.filter(
      (a) => !a.is_active || a.is_active == false || a.is_active == 0,
    ).length,
    totalBalance: bankAccounts.reduce(
      (sum, acc) => sum + (acc.opening_balance || 0),
      0,
    ),
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getAccountTypeBadge = (type) => {
    const types = {
      saving: { color: "bg-green-100 text-green-800", label: "Saving" },
      current: { color: "bg-blue-100 text-blue-800", label: "Current" },
      overdraft: { color: "bg-purple-100 text-purple-800", label: "Overdraft" },
      cash_credit: {
        color: "bg-orange-100 text-orange-800",
        label: "Cash Credit",
      },
    };
    const config = types[type?.toLowerCase()] || {
      color: "bg-gray-100 text-gray-800",
      label: type || "N/A",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
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

  const hasActiveFilters =
    searchTerm != "" ||
    statusFilter != "" ||
    Object.keys(appliedFilters).length > 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAccounts(bankAccounts.map((a) => a.bank_account_id));
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleSelectAccount = (accountId, checked) => {
    if (checked) {
      setSelectedAccounts([...selectedAccounts, accountId]);
    } else {
      setSelectedAccounts(selectedAccounts.filter((id) => id != accountId));
    }
  };

  // Account types for filter dropdown
  const accountTypes = [
    { value: "saving", label: "Saving Account" },
    { value: "current", label: "Current Account" },
    { value: "overdraft", label: "Overdraft Account" },
    { value: "cash_credit", label: "Cash Credit Account" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage bank accounts for financial accounting
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/financial-accounting/bank-accounts/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Account
          </Link>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by account name, number, IFSC, branch..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Clear All
              </button>
            )}

            <button
              onClick={loadBankAccounts}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="account_number"
                  value={filters.account_number}
                  onChange={handleFilterChange}
                  placeholder="Filter by account number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifsc"
                  value={filters.ifsc}
                  onChange={handleFilterChange}
                  placeholder="Filter by IFSC code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  name="account_name"
                  value={filters.account_name}
                  onChange={handleFilterChange}
                  placeholder="Filter by account name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name
                </label>
                <input
                  type="text"
                  name="branch_name"
                  value={filters.branch_name}
                  onChange={handleFilterChange}
                  placeholder="Filter by branch name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={filters.bank_name}
                  onChange={handleFilterChange}
                  placeholder="Filter by bank name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Filter by city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  name="account_type"
                  value={filters.account_type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {accountTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-3 border-t">
              <button
                onClick={clearAdvancedFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Filters
              </button>
              <button
                onClick={applyAdvancedFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {Object.keys(appliedFilters).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(appliedFilters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {key.replace(/_/g, " ")}: {value}
                <button
                  onClick={() => {
                    const newFilters = { ...appliedFilters };
                    delete newFilters[key];
                    setAppliedFilters(newFilters);
                    setFilters((prev) => ({ ...prev, [key]: "" }));
                    setCurrentPage(1);
                  }}
                  className="ml-2 hover:text-blue-600"
                >
                  <XCircleIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {selectedAccounts.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedAccounts.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedAccounts.length} account(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected accounts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedAccounts([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 flex items-center disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Selected"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bank Accounts Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={
                      bankAccounts.length > 0 &&
                      selectedAccounts.length == bankAccounts.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Account Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Bank Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Branch Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading bank accounts...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : bankAccounts.length > 0 ? (
                bankAccounts.map((account) => (
                  <tr
                    key={account.bank_account_id}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/financial-accounting/bank-accounts/view/${account.bank_account_id}`,
                        );
                      }
                    }}
                  >
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={selectedAccounts.includes(
                          account.bank_account_id,
                        )}
                        onChange={(e) =>
                          handleSelectAccount(
                            account.bank_account_id,
                            e.target.checked,
                          )
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {account.account_name?.charAt(0) || "A"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {account.account_name}
                          </div>
                          <div className="flex items-center mt-1 gap-2">
                            <Hash className="h-3 w-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">
                              {account.account_code}
                            </span>
                            <span className="text-xs text-gray-300">|</span>
                            <CreditCard className="h-3 w-3 text-gray-400" />
                            <span className="text-xs font-mono text-gray-600">
                              {account.account_number}
                            </span>
                          </div>
                          {getAccountTypeBadge(account.account_type)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {account.bank_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        IFSC: {account.ifsc || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {account.branch_name || "N/A"}
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {account.city || "N/A"}
                      </div>
                    </td>

                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/financial-accounting/bank-accounts/view/${account.bank_account_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/financial-accounting/bank-accounts/edit/${account.bank_account_id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAccount(
                              account.bank_account_id,
                              account.account_name,
                            );
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Banknote className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching accounts found"
                          : "No bank accounts found"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first bank account"}
                      </p>
                      {!hasActiveFilters && (
                        <Link
                          to="/masters/financial-accounting/bank-accounts/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Bank Account
                        </Link>
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
          <div className="text-sm text-gray-700">
            Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
            entries
            {hasActiveFilters && " (filtered)"}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
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
                  Math.min(pagination.last_page, prev + 1),
                )
              }
              disabled={currentPage == pagination.last_page}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
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

export default BankAccountsList;
