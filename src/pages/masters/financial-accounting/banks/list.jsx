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
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { BanksApi } from "../../../services/banksapi";
import debounce from "lodash/debounce";

const BanksList = ({ user }) => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Bank Master Management");

  // Only one filter for status
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/financial-accounting/banks";

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

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // Load banks when page, search, or status filter changes
  useEffect(() => {
    loadBanks();
  }, [currentPage, searchDebounced, statusFilter]);

  const loadBanks = async () => {
    setLoading(true);
    try {
      const result = await BanksApi.getAllBanks(
        currentPage,
        itemsPerPage,
        searchDebounced,
        statusFilter, // Pass status filter separately
      );

      setBanks(result.banks || []);
      setPagination(
        result.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
        },
      );
    } catch (error) {
      console.error("Error loading banks:", error);
      toast.error(error.response?.data?.message || "Failed to load banks");
      setBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBank = async (bankId, bankName) => {
    const result = await Swal.fire({
      title: "Delete Bank?",
      text: `Are you sure you want to delete "${bankName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await BanksApi.delete(bankId);
      toast.success(`Bank "${bankName}" deleted successfully!`);
      await loadBanks();
      setSelectedBanks(selectedBanks.filter((id) => id != bankId));
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error(error.response?.data?.message || "Failed to delete bank");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBanks.length == 0) {
      toast.error("No banks selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedBanks.length} selected banks?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const deletePromises = selectedBanks.map((id) => BanksApi.delete(id));
        await Promise.all(deletePromises);
        await loadBanks();
        setSelectedBanks([]);
        toast.success(`${selectedBanks.length} bank(s) deleted successfully!`);
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Failed to delete some banks");
        await loadBanks();
      } finally {
        setLoading(false);
      }
    }
  };

  // Stats calculation
  const stats = {
    totalBanks: pagination.total,
    activeBanks: banks.filter((b) => b.is_active == true || b.is_active == 1)
      .length,
    inactiveBanks: banks.filter(
      (b) => !b.is_active || b.is_active == false || b.is_active == 0,
    ).length,
    banksWithAccounts: banks.filter((b) => (b.bank_accounts_count || 0) > 0)
      .length,
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

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
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

  const hasActiveFilters = searchTerm != "" || statusFilter != "";

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBanks(banks.map((b) => b.Bank_Id));
    } else {
      setSelectedBanks([]);
    }
  };

  const handleSelectBank = (bankId, checked) => {
    if (checked) {
      setSelectedBanks([...selectedBanks, bankId]);
    } else {
      setSelectedBanks(selectedBanks.filter((id) => id != bankId));
    }
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
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage bank masters for financial accounting
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/financial-accounting/banks/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Bank
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
              placeholder="Search banks by name, code, short name..."
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
                Clear Filters
              </button>
            )}

            <button
              onClick={loadBanks}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {selectedBanks.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedBanks.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedBanks.length} bank(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected banks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedBanks([])}
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

      {/* Banks Table */}
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
                      banks.length > 0 && selectedBanks.length == banks.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Bank Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  IFSC Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading banks...</p>
                    </div>
                  </td>
                </tr>
              ) : banks.length > 0 ? (
                banks.map((bank) => (
                  <tr
                    key={bank.Bank_Id}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/financial-accounting/banks/view/${bank.Bank_Id}`,
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
                        checked={selectedBanks.includes(bank.Bank_Id)}
                        onChange={(e) =>
                          handleSelectBank(bank.Bank_Id, e.target.checked)
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {bank.bank_name?.charAt(0) || "B"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {bank.bank_name}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs font-medium text-gray-600">
                              {bank.bank_code}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {bank.ifsc_prefix ? (
                        <div className="space-y-1">
                          <span className="font-mono font-medium text-sm">
                            {bank.ifsc_prefix}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not set</span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/financial-accounting/banks/view/${bank.Bank_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/financial-accounting/banks/edit/${bank.Bank_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBank(bank.Bank_Id, bank.bank_name);
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching banks found"
                          : "No banks found"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first bank"}
                      </p>
                      {!hasActiveFilters && (
                        <Link
                          to="/masters/financial-accounting/banks/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Bank
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

export default BanksList;
