import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  XCircle as XCircleIcon,
  Building2,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChequeFormatsApi } from "../../../services/chequeformatsapi";
import { BanksApi } from "../../../services/banksapi";
import debounce from "lodash/debounce";

const ChequeFormatsList = ({ user }) => {
  const [chequeFormats, setChequeFormats] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Cheque Format Management");

  // Filters
  const [bankFilter, setBankFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/financial-accounting/cheque-formats";

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

  // Load banks for filter dropdown
  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const banksData = await BanksApi.getAll();
      setBanks(banksData);
    } catch (error) {
      console.error("Error loading banks:", error);
    }
  };

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

  // Handle bank filter change
  const handleBankChange = (e) => {
    setBankFilter(e.target.value);
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
    setBankFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // Load cheque formats when page, search, or filters change
  useEffect(() => {
    loadChequeFormats();
  }, [currentPage, searchDebounced, bankFilter, statusFilter]);

  const loadChequeFormats = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (bankFilter) filters.Bank_Id = bankFilter;
      if (statusFilter) filters.status = statusFilter;

      const result = await ChequeFormatsApi.getAllChequeFormats(
        currentPage,
        itemsPerPage,
        searchDebounced,
        filters,
      );

      setChequeFormats(result.chequeFormats || []);
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
      console.error("Error loading cheque formats:", error);
      toast.error(
        error.response?.data?.message || "Failed to load cheque formats",
      );
      setChequeFormats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formatId, formatName) => {
    const result = await Swal.fire({
      title: "Delete Cheque Format?",
      text: `Are you sure you want to delete "${formatName}"? This action cannot be undone.`,
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
      await ChequeFormatsApi.delete(formatId);
      toast.success(`Cheque format "${formatName}" deleted successfully!`);
      await loadChequeFormats();
      setSelectedFormats(selectedFormats.filter((id) => id != formatId));
    } catch (error) {
      console.error("Error deleting cheque format:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete cheque format",
      );
    }
  };

  const handleClone = async (formatId, formatName) => {
    const result = await Swal.fire({
      title: "Clone Cheque Format?",
      text: `Are you sure you want to clone "${formatName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, clone!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await ChequeFormatsApi.clone(formatId);
      toast.success(`Cheque format cloned successfully!`);
      await loadChequeFormats();
    } catch (error) {
      console.error("Error cloning cheque format:", error);
      toast.error(
        error.response?.data?.message || "Failed to clone cheque format",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFormats.length == 0) {
      toast.error("No cheque formats selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedFormats.length} selected cheque formats?`,
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
        const deletePromises = selectedFormats.map((id) =>
          ChequeFormatsApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadChequeFormats();
        setSelectedFormats([]);
        toast.success(
          `${selectedFormats.length} cheque format(s) deleted successfully!`,
        );
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Failed to delete some cheque formats");
        await loadChequeFormats();
      } finally {
        setLoading(false);
      }
    }
  };

  // Stats calculation
  const stats = {
    totalFormats: pagination.total,
    activeFormats: chequeFormats.filter((f) => f.is_active == true).length,
    inactiveFormats: chequeFormats.filter((f) => !f.is_active).length,
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
    searchTerm != "" || bankFilter != "" || statusFilter != "";

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFormats(chequeFormats.map((f) => f.cheque_format_id));
    } else {
      setSelectedFormats([]);
    }
  };

  const handleSelectFormat = (formatId, checked) => {
    if (checked) {
      setSelectedFormats([...selectedFormats, formatId]);
    } else {
      setSelectedFormats(selectedFormats.filter((id) => id != formatId));
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
              Manage cheque format masters for financial accounting
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/financial-accounting/cheque-formats/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Cheque Format
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
              placeholder="Search cheque formats by name, bank..."
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

          <div className="flex flex-wrap items-center gap-3">
            {/* Bank Filter */}
           
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
              onClick={loadChequeFormats}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {selectedFormats.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedFormats.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedFormats.length} cheque format(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected formats
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedFormats([])}
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

      {/* Cheque Formats Table */}
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
                      chequeFormats.length > 0 &&
                      selectedFormats.length == chequeFormats.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Format Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Page Settings
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading cheque formats...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : chequeFormats.length > 0 ? (
                chequeFormats.map((format) => (
                  <tr
                    key={format.cheque_format_id}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/financial-accounting/cheque-formats/view/${format.cheque_format_id}`,
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
                        checked={selectedFormats.includes(
                          format.cheque_format_id,
                        )}
                        onChange={(e) =>
                          handleSelectFormat(
                            format.cheque_format_id,
                            e.target.checked,
                          )
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {format.format_name}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {format.description || "No description"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                      {format.bank && (
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {format.bank.bank_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format.bank.bank_code}
                            </div>
                          </div>
                        </div>
                      )}
                    </td> */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {format.page_width_mm} x {format.page_height_mm} mm
                      </div>
                      <div className="text-xs text-gray-500">
                        Margin: {format.top_margin_mm} / {format.left_margin_mm}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/financial-accounting/cheque-formats/view/${format.cheque_format_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/financial-accounting/cheque-formats/edit/${format.cheque_format_id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleClone(
                              format.cheque_format_id,
                              format.format_name,
                            )
                          }
                          className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="Clone"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              format.cheque_format_id,
                              format.format_name,
                            )
                          }
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <CreditCard className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching cheque formats found"
                          : "No cheque formats found"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first cheque format"}
                      </p>
                      {!hasActiveFilters && (
                        <Link
                          to="/masters/financial-accounting/cheque-formats/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Cheque Format
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

export default ChequeFormatsList;
